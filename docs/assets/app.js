(() => {
  'use strict';
  const input = document.querySelector('#demo-input');
  const buttons = [...document.querySelectorAll('[data-mode]')];
  const countEl = document.querySelector('#word-count');
  const resultNumber = document.querySelector('#result-number');
  const resultSubtitle = document.querySelector('#result-subtitle');
  const issueList = document.querySelector('#issue-list');
  const reset = document.querySelector('#reset-example');
  const example = "Before commencing the inspection of the electrical unit, make sure that the main power supply has been disconnected; don't remove the access panel until this has been completed.";
  const regex = /\b(?:don't|doesn't|can't|won't|isn't|aren't|wasn't|weren't|shouldn't|wouldn't|couldn't|mustn't|didn't|hasn't|haven't|hadn't|it's|that's|there's|we're|you're|they're|I've|we've|we'll|you'll|they'll)\b/gi;
  let mode = 'procedure';
  function words(s) { return s.trim().match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu) || []; }
  function sentences(s) { return (s.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).map(x => x.trim()).filter(Boolean); }
  function escapeHTML(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function audit() {
    const value = input.value;
    const limit = mode === 'procedure' ? 20 : 25;
    const findings = [];
    const over = sentences(value).map(s => words(s).length).filter(n => n > limit);
    if (over.length) findings.push(`${over.length} sentence${over.length > 1 ? 's' : ''} over the ${limit}-word ${mode} guideline (approximate count).`);
    if (value.includes(';')) findings.push(`Semicolon detected — ${mode === 'procedure' ? 'separate instructions into clear sentences' : 'consider a full stop or another construction'}.`);
    if (regex.test(value)) findings.push('Common contraction detected — write the full form.');
    regex.lastIndex = 0;
    countEl.textContent = `${words(value).length} approximate words`;
    resultNumber.textContent = String(findings.length).padStart(2, '0');
    resultSubtitle.textContent = findings.length ? `Potential structural issue${findings.length > 1 ? 's' : ''} detected` : 'No preview issues detected';
    issueList.innerHTML = findings.length ? findings.map(s => `<li>${escapeHTML(s)}</li>`).join('') : '<li class="no-issues">No issues among the three preview checks. This is not a compliance verdict.</li>';
  }
  buttons.forEach(btn => btn.addEventListener('click', () => { mode = btn.dataset.mode; buttons.forEach(x => x.setAttribute('aria-pressed', String(x === btn))); audit(); }));
  input.addEventListener('input', audit);
  reset.addEventListener('click', () => { input.value = example; audit(); input.focus(); });
  audit();

  for (const button of document.querySelectorAll('[data-copy]')) {
    button.addEventListener('click', async () => {
      const label = button.querySelector('.copy-label');
      const original = label.textContent;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
        await navigator.clipboard.writeText(button.dataset.copy);
        label.textContent = 'COPIED';
      } catch (e) {
        // On file:// and some HTTP origins clipboard access is restricted; let users select the command.
        const command = button.parentElement.querySelector('code');
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(command); selection.removeAllRanges(); selection.addRange(range);
        label.textContent = 'SELECTED';
      }
      window.setTimeout(() => { label.textContent = original; }, 2100);
    });
  }
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const targets = [...document.querySelectorAll('.section-head, .intro-content, .stage, .stats-grid, .boundary-row, .faq-layout, .install-main')];
    const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }, {threshold:.09, rootMargin:'0px 0px -25px 0px'});
    targets.forEach(el => { el.classList.add('reveal'); observer.observe(el); });
    document.documentElement.classList.add('js-enhanced');
  }
})();
