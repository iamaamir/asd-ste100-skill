(() => {
  'use strict';

  // This is an illustrative three-check preview. It is NOT the Python checker or an STE verdict.
  const input = document.querySelector('#demo-input');
  if (!input) return;
  const backdrop = document.querySelector('#demo-highlight');
  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  const exampleButtons = [...document.querySelectorAll('[data-example]')];
  const list = document.querySelector('#issue-list');
  const count = document.querySelector('#word-count');
  const resultNumber = document.querySelector('#result-number');
  const subtitle = document.querySelector('#result-subtitle');
  const status = document.querySelector('#editor-status');
  const editorMode = document.querySelector('#editor-mode');
  const editorFile = document.querySelector('#editor-file');
  const liveFeedback = document.querySelector('#demo-live-feedback');
  const reset = document.querySelector('#reset-example');

  const { samples, wordCount, findIssues } = globalThis.STEPreview;
  let mode = 'procedure';
  let currentFindings = [];

  const escapeHTML = str => str.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const lineOf = (text, start) => text.slice(0, start).split('\n').length;

  function highlight(text,issues) {
    if (!text) {backdrop.textContent = '';return;}
    const boundaries = new Set([0, text.length]);
    for (const item of issues) {boundaries.add(item.start);boundaries.add(item.end);}
    const positions = [...boundaries].sort((a,b)=>a-b);
    let result = '';
    for (let j=0;j<positions.length-1;j++) {
      const start=positions[j], end=positions[j+1];
      const active=issues.filter(item=>item.start<=start && item.end>=end);
      const classes = [];
      if (active.some(item=>item.kind==='length')) classes.push('mark-length');
      if (active.some(item=>item.kind==='punct')) classes.push('mark-punct');
      if (active.some(item=>item.kind==='contraction')) classes.push('mark-contraction');
      const content = escapeHTML(text.slice(start,end));
      result += classes.length ? `<mark class="${classes.join(' ')}">${content}</mark>` : content;
    }
    backdrop.innerHTML = result;
    syncScroll();
  }
  function syncScroll() {
    const layer = backdrop.parentElement;
    layer.scrollTop = input.scrollTop;
    layer.scrollLeft = input.scrollLeft;
  }
  function render() {
    const text = input.value;
    currentFindings = findIssues(text,mode);
    highlight(text,currentFindings);
    const n=currentFindings.length;
    const report=n===0 ? 'No preview signals' : `${n} structural signal${n===1?'':'s'}`;
    resultNumber.textContent=String(n).padStart(2,'0');
    count.textContent=`${wordCount(text)} approximate words`;
    editorMode.textContent=`/ ${mode.toUpperCase()}`;
    editorFile.textContent=`${mode}.ste`;
    status.textContent=report;
    subtitle.textContent=n ? 'Select a finding to jump to the highlighted text.' : 'No findings in these three limited checks. This does not establish STE compliance.';
    if(liveFeedback.textContent !== report) liveFeedback.textContent=report;
    list.innerHTML=n ? currentFindings.map((f,i)=>`<li><button type="button" class="issue-jump" data-finding="${i}" aria-label="Locate ${escapeHTML(f.label.toLowerCase())} on line ${lineOf(text,f.start)}"><span class="issue-line">LN ${String(lineOf(text,f.start)).padStart(2,'0')}</span><span class="issue-main"><strong>${escapeHTML(f.label)}</strong><small>${escapeHTML(f.detail)}</small><span class="issue-advice">${escapeHTML(f.advice)}</span></span><span class="issue-go" aria-hidden="true">↗</span></button></li>`).join('') : '<li class="no-issues"><span aria-hidden="true">✓</span><div><strong>No structural preview findings</strong><p>Try another example, or edit this text. Dictionary and technical checks remain outside this preview.</p></div></li>';
  }
  function setMode(next) {
    mode=next;
    modeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
  }
  function selectExample(key,{focus=false}={}) {
    const sample=samples[key];
    setMode(sample.mode);
    input.value=sample.text;
    input.scrollTop=0;
    exampleButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.example===key)));
    render();
    if(focus) input.focus();
  }
  modeButtons.forEach(button=>button.addEventListener('click',()=>{
    setMode(button.dataset.mode);
    exampleButtons.forEach(b=>b.setAttribute('aria-pressed','false'));
    render();
  }));
  exampleButtons.forEach(button=>button.addEventListener('click',()=>selectExample(button.dataset.example)));
  input.addEventListener('input',()=>{
    exampleButtons.forEach(b=>b.setAttribute('aria-pressed','false'));
    render();
  });
  input.addEventListener('scroll',syncScroll);
  list.addEventListener('click',e=>{
    const button=e.target.closest('[data-finding]');
    if(!button)return;
    const item=currentFindings[Number(button.dataset.finding)];
    if(!item)return;
    input.focus();
    input.setSelectionRange(item.start,item.end);
    requestAnimationFrame(syncScroll);
  });
  reset.addEventListener('click',()=>selectExample('mixed',{focus:true}));
  selectExample('mixed');

  for (const button of document.querySelectorAll('[data-copy]')) {
    button.addEventListener('click',async()=>{
      const label=button.querySelector('.copy-label');
      const original=label.textContent;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(button.dataset.copy);
        label.textContent='COPIED';
      } catch {
        const command=button.parentElement.querySelector('code');
        const selection=window.getSelection();
        const range=document.createRange();
        range.selectNodeContents(command);selection.removeAllRanges();selection.addRange(range);
        label.textContent='SELECTED';
      }
      window.setTimeout(()=>{label.textContent=original;},2100);
    });
  }
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const targets=[...document.querySelectorAll('.section-head, .stage, .proof-ribbon, .install-main')];
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
    },{threshold:.08,rootMargin:'0px 0px -25px 0px'});
    targets.forEach(el=>{el.classList.add('reveal');observer.observe(el);});
    document.documentElement.classList.add('js-enhanced');
  }
})();
