/* Pure three-check browser demo engine. Not a full ASD-STE100 validator. */
(() => {
  'use strict';
  const samples = {
    mixed: {mode: 'procedure', text: "Before commencing the inspection of the electrical unit, make sure that the main power supply has been disconnected; don't remove the access panel until this has been completed."},
    length: {mode: 'procedure', text: 'Before you remove the filter, make sure that the electrical power is disconnected and that the inspection area is dry and free from loose objects.'},
    contraction: {mode: 'procedure', text: "Don't open the access panel until the power is off."},
    semicolon: {mode: 'procedure', text: 'Disconnect the power supply; remove the access panel.'},
    description: {mode: 'description', text: 'The hydraulic system supplies pressure to the actuator during normal operation, returns fluid to the reservoir after each cycle, and maintains a stable pressure when the load changes rapidly.'},
    clear: {mode: 'procedure', text: 'Disconnect the power supply. Remove the access panel. Examine the connector.'}
  };
  const contractionRE = /\b(?:don't|doesn't|can't|won't|isn't|aren't|wasn't|weren't|shouldn't|wouldn't|couldn't|mustn't|didn't|hasn't|haven't|hadn't|it's|that's|there's|we're|you're|they're|i've|we've|we'll|you'll|they'll)\b/gi;
  const wordRE = /[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu;
  const wordCount = text => (text.match(wordRE) || []).length;
  function findIssues(text, mode) {
    if(!['procedure','description'].includes(mode)) throw new TypeError('Unknown document type');
    const issues = [];
    const limit = mode === 'procedure' ? 20 : 25;
    for (const match of text.matchAll(/[^.!?]+(?:[.!?]+|$)/g)) {
      const n=wordCount(match[0]);
      if(n>limit) {
        const left=match[0].match(/^\s*/)[0].length;
        const right=match[0].match(/\s*$/)[0].length;
        issues.push({kind:'length',start:match.index+left,end:match.index+match[0].length-right,label:'Sentence length',code:`${n} / ${limit} words`,detail:`This ${mode} sentence has approximately ${n} words. Split it into shorter, meaningful sentences.`,advice:'Approximate count; consult ASD-STE100 for counting exceptions.'});
      }
    }
    for(let i=0;i<text.length;i++) if(text[i]===';') {
      issues.push({kind:'punct',start:i,end:i+1,label:'Semicolon',code:'PUNCTUATION',detail:'A semicolon appears here. Use separate sentences or another suitable construction.',advice:'Check that the revised text preserves the relationship between the actions.'});
    }
    for(const match of text.matchAll(contractionRE)) {
      issues.push({kind:'contraction',start:match.index,end:match.index+match[0].length,label:'Contraction',code:'WORD FORM',detail:`“${match[0]}” is a contraction. Write the full form.`,advice:'Verify the replacement against the official dictionary and the intended meaning.'});
    }
    return issues.sort((a,b)=>a.start-b.start||a.end-b.end);
  }
  const api=Object.freeze({samples,wordCount,findIssues});
  globalThis.STEPreview=api;
  if(typeof module!=='undefined' && module.exports) module.exports=api;
})();
