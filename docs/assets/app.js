(() => {
  'use strict';
  // Educational browser preview: three structural patterns, not an ASD-STE100 certification.
  const input = document.querySelector('#demo-input');
  if (!input) return;
  const editorArea = document.querySelector('#editor-area');
  const backdrop = document.querySelector('#demo-highlight');
  const tooltip = document.querySelector('#issue-tooltip');
  const tooltipCode = document.querySelector('#tooltip-code');
  const tooltipTitle = document.querySelector('#tooltip-title');
  const tooltipDetail = document.querySelector('#tooltip-detail');
  const tooltipAdvice = document.querySelector('#tooltip-advice');
  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  const exampleButtons = [...document.querySelectorAll('[data-example]')];
  const count = document.querySelector('#word-count');
  const resultNumber = document.querySelector('#result-number');
  const resultLabel = document.querySelector('#result-label');
  const subtitle = document.querySelector('#result-subtitle');
  const status = document.querySelector('#editor-status');
  const editorMode = document.querySelector('#editor-mode');
  const editorFile = document.querySelector('#editor-file');
  const liveFeedback = document.querySelector('#demo-live-feedback');
  const reset = document.querySelector('#reset-example');
  const {samples,wordCount,findIssues} = globalThis.STEPreview;
  const escapeHTML = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lineOf = (text,start) => text.slice(0,start).split('\n').length;
  let mode = 'procedure';
  let currentFindings = [];
  let hovered = null;

  // Keep a real textarea for editing, keyboard support, selection and IME input.
  // The mirrored text is visual only, except marked fragments that accept pointer hover.
  function highlight(text,issues) {
    if (!text) { backdrop.textContent=''; return; }
    const boundaries = new Set([0,text.length]);
    for (const f of issues) {boundaries.add(f.start); boundaries.add(f.end);}
    const offsets=[...boundaries].sort((a,b)=>a-b);
    let result='';
    for(let i=0;i<offsets.length-1;i++){
      const start=offsets[i], end=offsets[i+1];
      const active=issues.map((issue,index)=>({issue,index})).filter(o=>o.issue.start<=start && o.issue.end>=end);
      const content=escapeHTML(text.slice(start,end));
      if(!active.length) {result+=content;continue;}
      // Specific problems outrank a long-sentence annotation covering the same characters.
      active.sort((a,b)=>(a.issue.end-a.issue.start)-(b.issue.end-b.issue.start));
      const classes=[];
      if(active.some(o=>o.issue.kind==='length'))classes.push('mark-length');
      if(active.some(o=>o.issue.kind==='punct'))classes.push('mark-punct');
      if(active.some(o=>o.issue.kind==='contraction'))classes.push('mark-contraction');
      result+=`<mark class="${classes.join(' ')}" data-diagnostic="${active[0].index}" data-start="${start}" data-end="${end}">${content}</mark>`;
    }
    backdrop.innerHTML=result;
    syncScroll();
  }
  function syncScroll() {
    const layer=backdrop.parentElement;
    layer.scrollTop=input.scrollTop;
    layer.scrollLeft=input.scrollLeft;
  }
  function hideTooltip(){tooltip.hidden=true;hovered=null;input.setAttribute('aria-describedby','demo-help demo-live-feedback');}
  function activeAtCaret(){
    const start=input.selectionStart??0;
    const end=input.selectionEnd??start;
    const candidates=currentFindings.filter(f=>{
      if(end>start)return f.start<end && f.end>start;
      return f.start<=start && f.end>start;
    });
    return candidates.sort((a,b)=>(a.end-a.start)-(b.end-b.start))[0]||null;
  }
  function createMirror(position){
    const style=getComputedStyle(input);
    const mirror=document.createElement('div');
    const keys=['boxSizing','width','height','overflowX','overflowY','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','paddingTop','paddingRight','paddingBottom','paddingLeft','fontStyle','fontVariant','fontWeight','fontStretch','fontSize','lineHeight','fontFamily','letterSpacing','textTransform','textIndent','textDecoration','textAlign','tabSize','whiteSpace','wordBreak','overflowWrap'];
    keys.forEach(key=>{mirror.style[key]=style[key];});
    mirror.style.position='absolute';mirror.style.visibility='hidden';mirror.style.left='-9999px';mirror.style.top='0';
    mirror.textContent=input.value.slice(0,position);
    const marker=document.createElement('span');marker.textContent=input.value.slice(position)||' ';
    mirror.appendChild(marker);document.body.appendChild(mirror);
    const a=marker.getBoundingClientRect(),b=mirror.getBoundingClientRect();
    const result={x:a.left-b.left-input.scrollLeft,y:a.top-b.top-input.scrollTop,down:a.top-b.top-input.scrollTop+(parseFloat(style.lineHeight)||25)};
    mirror.remove();return result;
  }
  function nearPointerRect(mark,x,y){
    const rects=[...mark.getClientRects()];
    return rects.find(r=>x>=r.left && x<=r.right && y>=r.top && y<=r.bottom) || rects[0] || mark.getBoundingClientRect();
  }
  function placeTooltip(anchor){
    const panel=editorArea.getBoundingClientRect();
    const w=tooltip.offsetWidth||280, h=tooltip.offsetHeight||120;
    const x=Math.max(10,Math.min(panel.width-w-10,anchor.x-18));
    let y=anchor.y-h-10;
    if(y<9)y=anchor.down+11;
    if(y+h>panel.height-9)y=Math.max(9,panel.height-h-9);
    tooltip.style.left=`${x}px`;
    tooltip.style.top=`${y}px`;
  }
  function showTooltip(issue,anchor){
    if(!issue){hideTooltip();return;}
    tooltipCode.textContent=`${issue.code} · LINE ${lineOf(input.value,issue.start)}`;
    tooltipTitle.textContent=issue.label;
    tooltipDetail.textContent=issue.detail;
    tooltipAdvice.textContent=issue.advice;
    tooltip.hidden=false;
    input.setAttribute('aria-describedby','demo-help demo-live-feedback issue-tooltip');
    if(anchor)placeTooltip(anchor);
    else placeTooltip(createMirror(Math.min(input.selectionStart??issue.start,issue.end)));
  }
  function showAtCaret(){
    if(hovered!==null)return;
    if(document.activeElement!==input){hideTooltip();return;}
    showTooltip(activeAtCaret());
  }
  function pointerAnchor(mark,event){
    const rect=nearPointerRect(mark,event.clientX,event.clientY);
    const base=editorArea.getBoundingClientRect();
    return {x:Math.min(Math.max(event.clientX,rect.left),rect.right)-base.left,y:rect.top-base.top,down:rect.bottom-base.top};
  }
  function render(){
    const text=input.value;
    currentFindings=findIssues(text,mode);
    highlight(text,currentFindings);
    const n=currentFindings.length;
    const report=n?`${n} ${n===1?'issue':'issues'}`:'No preview flags';
    resultNumber.textContent=String(n).padStart(2,'0');
    if(resultLabel) resultLabel.textContent=n===1?'issue':'issues';
    count.textContent=`${wordCount(text)} approximate words`;
    editorMode.textContent=`/ ${mode.toUpperCase()}`;
    editorFile.textContent=`${mode}.ste`;
    status.textContent=report;
    subtitle.textContent=n?'Hover a marked phrase for the explanation.':'No issues in these three checks. This is not a compliance verdict.';
    if(liveFeedback.textContent!==report)liveFeedback.textContent=report;
    hovered=null;
    showAtCaret();
  }
  function setMode(next){
    mode=next;
    modeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
  }
  function selectExample(key,{focus=false}={}){
    const sample=samples[key];setMode(sample.mode);
    input.value=sample.text;input.scrollTop=0;input.scrollLeft=0;input.setSelectionRange(0,0);
    exampleButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.example===key)));
    hideTooltip();render();if(focus)input.focus();
  }
  function clearExampleSelection(){exampleButtons.forEach(b=>b.setAttribute('aria-pressed','false'));}
  modeButtons.forEach(b=>b.addEventListener('click',()=>{setMode(b.dataset.mode);clearExampleSelection();render();}));
  exampleButtons.forEach(b=>b.addEventListener('click',()=>selectExample(b.dataset.example)));
  input.addEventListener('input',()=>{clearExampleSelection();render();});
  input.addEventListener('scroll',()=>{syncScroll();if(hovered===null)showAtCaret();});
  ['keyup','click','select','touchend'].forEach(type=>input.addEventListener(type,showAtCaret));
  input.addEventListener('blur',()=>{if(hovered===null)hideTooltip();});

  backdrop.addEventListener('pointerover',event=>{
    const mark=event.target.closest?.('mark[data-diagnostic]');
    if(!mark)return;
    const index=Number(mark.dataset.diagnostic);
    const issue=currentFindings[index];
    if(!issue)return;
    hovered=index;
    showTooltip(issue,pointerAnchor(mark,event));
  });
  backdrop.addEventListener('pointermove',event=>{
    const mark=event.target.closest?.('mark[data-diagnostic]');
    if(!mark)return;
    const index=Number(mark.dataset.diagnostic);
    if(hovered!==index){hovered=index;showTooltip(currentFindings[index],pointerAnchor(mark,event));}
  });
  backdrop.addEventListener('pointerout',event=>{
    const next=event.relatedTarget;
    if(next?.closest?.('mark[data-diagnostic]'))return;
    hideTooltip();
    if(document.activeElement===input)showAtCaret();
  });
  backdrop.addEventListener('pointerdown',event=>{
    const mark=event.target.closest?.('mark[data-diagnostic]');
    if(!mark)return;
    event.preventDefault();
    let offset=Number(mark.dataset.start);
    const caret=document.caretPositionFromPoint?.(event.clientX,event.clientY);
    if(caret?.offsetNode?.parentElement===mark)offset+=caret.offset;
    else if(document.caretRangeFromPoint){
      const range=document.caretRangeFromPoint(event.clientX,event.clientY);
      if(range?.startContainer?.parentElement===mark)offset+=range.startOffset;
    }
    offset=Math.max(Number(mark.dataset.start),Math.min(Number(mark.dataset.end),offset));
    input.focus({preventScroll:true});input.setSelectionRange(offset,offset);
    hovered=Number(mark.dataset.diagnostic);
    showTooltip(currentFindings[hovered],pointerAnchor(mark,event));
  });
  reset.addEventListener('click',()=>selectExample('mixed',{focus:true}));
  selectExample('mixed');

  for(const button of document.querySelectorAll('[data-copy]')){
    button.addEventListener('click',async()=>{
      const label=button.querySelector('.copy-label');const original=label.textContent;
      try{
        if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(button.dataset.copy);label.textContent='COPIED';
      }catch{
        const command=button.parentElement.querySelector('code');
        const selection=window.getSelection();const range=document.createRange();
        range.selectNodeContents(command);selection.removeAllRanges();selection.addRange(range);label.textContent='SELECTED';
      }
      window.setTimeout(()=>{label.textContent=original;},2100);
    });
  }
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const targets=[...document.querySelectorAll('.section-head,.review-cycle,.proof-ribbon,.install-main')];
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
    },{threshold:.08,rootMargin:'0px 0px -25px 0px'});
    targets.forEach(el=>{el.classList.add('reveal');observer.observe(el);});
    document.documentElement.classList.add('js-enhanced');
  }

  // Native stacked-page scrolling: pin a chapter until the next chapter
  // covers it. Long chapters use a negative sticky offset so their entire
  // contents scroll past before the next chapter overlays them.
  const chapters=[...document.querySelectorAll('.stack-chapter')];
  if(chapters.length>1){
    const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0;
    function measureChapters(){
      const viewportHeight=window.innerHeight;
      for(const chapter of chapters){
        const excess=Math.max(0,chapter.offsetHeight-viewportHeight);
        chapter.style.setProperty('--stack-top',`${-excess}px`);
      }
      updateStackDepth();
    }
    function updateStackDepth(){
      const viewportHeight=window.innerHeight;
      for(let index=0;index<chapters.length;index++){
        const chapter=chapters[index];
        const top=index<chapters.length-1 ? chapters[index+1].getBoundingClientRect().top : viewportHeight;
        const progress=prefersReducedMotion.matches ? 0 : Math.max(0,Math.min(1,(viewportHeight-top)/viewportHeight));
        chapter.style.setProperty('--stack-scale',(1-progress*0.045).toFixed(4));
        chapter.style.setProperty('--stack-lift',`${Math.round(-progress*28)}px`);
        chapter.style.setProperty('--stack-opacity',(1-progress*0.13).toFixed(3));
      }
    }
    function scheduleDepthUpdate(){
      if(frame)return;
      frame=requestAnimationFrame(()=>{frame=0;updateStackDepth();});
    }
    window.addEventListener('scroll',scheduleDepthUpdate,{passive:true});
    window.addEventListener('resize',measureChapters,{passive:true});
    if('ResizeObserver' in window){
      const observer=new ResizeObserver(measureChapters);
      chapters.forEach(chapter=>observer.observe(chapter));
    }
    if(prefersReducedMotion.addEventListener)prefersReducedMotion.addEventListener('change',measureChapters);
    if(document.fonts?.ready)document.fonts.ready.then(measureChapters);
    measureChapters();
  }

})();
