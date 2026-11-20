(() => {
  'use strict';

  // This is an illustrative three-check preview. It is NOT the Python checker or an STE verdict.
  const input = document.querySelector('#demo-input');
  if (!input) return;

  const backdrop = document.querySelector('#demo-highlight');
  const editorArea = document.querySelector('#editor-area');
  const tooltip = document.querySelector('#issue-tooltip');
  const tooltipCode = document.querySelector('#tooltip-code');
  const tooltipTitle = document.querySelector('#tooltip-title');
  const tooltipDetail = document.querySelector('#tooltip-detail');
  const tooltipAdvice = document.querySelector('#tooltip-advice');
  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  const exampleButtons = [...document.querySelectorAll('[data-example]')];
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

  function highlight(text, issues) {
    if (!text) {
      backdrop.textContent = '';
      return;
    }
    const boundaries = new Set([0, text.length]);
    for (const item of issues) {
      boundaries.add(item.start);
      boundaries.add(item.end);
    }
    const positions = [...boundaries].sort((a, b) => a - b);
    let result = '';
    for (let j = 0; j < positions.length - 1; j++) {
      const start = positions[j], end = positions[j + 1];
      const active = issues.filter(item => item.start <= start && item.end >= end);
      const classes = [];
      if (active.some(item => item.kind === 'length')) classes.push('mark-length');
      if (active.some(item => item.kind === 'punct')) classes.push('mark-punct');
      if (active.some(item => item.kind === 'contraction')) classes.push('mark-contraction');
      const content = escapeHTML(text.slice(start, end));
      result += classes.length ? `<mark class="${classes.join(' ')}">${content}</mark>` : content;
    }
    backdrop.innerHTML = result;
    syncScroll();
  }

  function syncScroll() {
    const layer = backdrop.parentElement;
    layer.scrollTop = input.scrollTop;
    layer.scrollLeft = input.scrollLeft;
    if (tooltip && tooltip.dataset.visible === 'true') updateTooltip();
  }

  function hideTooltip() {
    tooltip.hidden = true;
    tooltip.dataset.visible = 'false';
  }

  function issueAtSelection() {
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? start;
    const containing = currentFindings.filter(item => item.start <= start && item.end >= Math.max(start + 1, end));
    if (containing.length) return containing.sort((a, b) => (a.end - a.start) - (b.end - b.start))[0];
    return currentFindings.filter(item => item.start < end && item.end > start)
      .sort((a, b) => (a.end - a.start) - (b.end - b.start))[0] || null;
  }

  function createMirror(position) {
    const style = getComputedStyle(input);
    const div = document.createElement('div');
    const props = [
      'boxSizing','width','height','overflowX','overflowY','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth',
      'paddingTop','paddingRight','paddingBottom','paddingLeft','fontStyle','fontVariant','fontWeight','fontStretch','fontSize',
      'fontSizeAdjust','lineHeight','fontFamily','letterSpacing','textTransform','textIndent','textDecoration','textAlign',
      'tabSize','MozTabSize','whiteSpace','wordBreak','overflowWrap'
    ];
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordBreak = 'break-word';
    div.style.overflowWrap = 'break-word';
    props.forEach(name => { div.style[name] = style[name]; });
    div.style.left = '-9999px';
    div.style.top = '0';
    div.textContent = input.value.slice(0, position);
    const marker = document.createElement('span');
    marker.textContent = '\u200b'; // zero-width caret marker, measurable at the requested offset
    div.appendChild(marker);
    document.body.appendChild(div);
    const areaRect = editorArea.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    const divRect = div.getBoundingClientRect();
    const left = markerRect.left - divRect.left - input.scrollLeft + parseFloat(style.borderLeftWidth || 0);
    const top = markerRect.top - divRect.top - input.scrollTop + parseFloat(style.borderTopWidth || 0);
    document.body.removeChild(div);
    return { left, top, lineHeight: parseFloat(style.lineHeight) || 26, width: areaRect.width, height: areaRect.height };
  }

  function showTooltip(issue) {
    const text = input.value.slice(issue.start, issue.end).trim();
    tooltipCode.textContent = `${issue.code} · LN ${String(lineOf(input.value, issue.start)).padStart(2, '0')}`;
    tooltipTitle.textContent = issue.label;
    tooltipDetail.textContent = issue.detail + (text ? ` Selected text: “${text}”.` : '');
    tooltipAdvice.textContent = issue.advice;
    tooltip.hidden = false;
    tooltip.dataset.visible = 'true';
    updateTooltip(issue);
  }

  function updateTooltip(forcedIssue = null) {
    const issue = forcedIssue || issueAtSelection();
    if (!issue) {
      hideTooltip();
      return;
    }
    const caretPos = Math.max(issue.start, Math.min(input.selectionStart ?? issue.start, issue.end));
    const caret = createMirror(caretPos);
    const pad = 12;
    const tipWidth = tooltip.offsetWidth || 280;
    const tipHeight = tooltip.offsetHeight || 112;
    let left = caret.left + 6;
    left = Math.max(pad, Math.min(left, caret.width - tipWidth - pad));
    let top = caret.top - tipHeight - 18;
    let below = false;
    if (top < pad) {
      top = Math.min(caret.top + caret.lineHeight + 16, caret.height - tipHeight - pad);
      below = true;
    }
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${Math.max(pad, top)}px`;
    tooltip.dataset.placement = below ? 'below' : 'above';
  }

  function render() {
    const text = input.value;
    currentFindings = findIssues(text, mode);
    highlight(text, currentFindings);
    const n = currentFindings.length;
    const report = n === 0 ? 'No preview signals' : `${n} inline signal${n === 1 ? '' : 's'}`;
    resultNumber.textContent = String(n).padStart(2, '0');
    count.textContent = `${wordCount(text)} approximate words`;
    editorMode.textContent = `/ ${mode.toUpperCase()}`;
    editorFile.textContent = `${mode}.ste`;
    status.textContent = report;
    subtitle.textContent = n ? 'Place the caret on a marked region to inspect it.' : 'No findings in these three limited checks. This does not establish STE compliance.';
    if (liveFeedback.textContent !== report) liveFeedback.textContent = report;
    if (!n || document.activeElement !== input) hideTooltip();
    else updateTooltip();
  }

  function setMode(next) {
    mode = next;
    modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
  }

  function selectExample(key, { focus = false } = {}) {
    const sample = samples[key];
    setMode(sample.mode);
    input.value = sample.text;
    input.scrollTop = 0;
    input.scrollLeft = 0;
    input.setSelectionRange(0, 0);
    exampleButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.example === key)));
    render();
    if (focus) input.focus();
  }

  function clearExampleSelection() {
    exampleButtons.forEach(button => button.setAttribute('aria-pressed', 'false'));
  }

  modeButtons.forEach(button => button.addEventListener('click', () => {
    setMode(button.dataset.mode);
    clearExampleSelection();
    render();
  }));

  exampleButtons.forEach(button => button.addEventListener('click', () => selectExample(button.dataset.example)));

  input.addEventListener('input', () => {
    clearExampleSelection();
    render();
  });
  input.addEventListener('scroll', syncScroll);
  ['keyup', 'click', 'mouseup', 'touchend', 'select'].forEach(name => input.addEventListener(name, () => updateTooltip()));
  input.addEventListener('blur', () => {
    window.setTimeout(() => {
      if (document.activeElement !== input) hideTooltip();
    }, 80);
  });
  input.addEventListener('focus', () => { if (currentFindings.length) updateTooltip(); });

  reset.addEventListener('click', () => selectExample('mixed', { focus: true }));
  selectExample('mixed');

  for (const button of document.querySelectorAll('[data-copy]')) {
    button.addEventListener('click', async () => {
      const label = button.querySelector('.copy-label');
      const original = label.textContent;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(button.dataset.copy);
        label.textContent = 'COPIED';
      } catch {
        const command = button.parentElement.querySelector('code');
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(command);
        selection.removeAllRanges();
        selection.addRange(range);
        label.textContent = 'SELECTED';
      }
      window.setTimeout(() => { label.textContent = original; }, 2100);
    });
  }

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const targets = [...document.querySelectorAll('.section-head, .orbit-system, .proof-ribbon, .install-main')];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }, { threshold: .08, rootMargin: '0px 0px -25px 0px' });
    targets.forEach(el => { el.classList.add('reveal'); observer.observe(el); });
    document.documentElement.classList.add('js-enhanced');
  }
})();
