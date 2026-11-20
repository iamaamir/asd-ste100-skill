'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {samples,wordCount,findIssues} = require('../docs/assets/preview-core.js');

const expected = {
  mixed: ['length','punct','contraction'],
  length: ['length'],
  contraction: ['contraction'],
  semicolon: ['punct'],
  description: ['length'],
  clear: []
};
for (const [key,kinds] of Object.entries(expected)) {
  test(`example ${key} shows expected diagnostics`,() => {
    const sample=samples[key];
    const issues=findIssues(sample.text,sample.mode);
    assert.deepEqual(issues.map(x=>x.kind),kinds);
    for (const issue of issues) {
      assert.ok(issue.start>=0 && issue.end<=sample.text.length && issue.end>issue.start);
      assert.ok(sample.text.slice(issue.start,issue.end).trim());
    }
  });
}
test('20 words accepted in a procedure; 21 flagged',()=>{
  assert.equal(findIssues('word '.repeat(20).trim()+'.','procedure').length,0);
  assert.equal(findIssues('word '.repeat(21).trim()+'.','procedure')[0].kind,'length');
});
test('25 words accepted in a description; 26 flagged',()=>{
  assert.equal(findIssues('word '.repeat(25).trim()+'.','description').length,0);
  assert.equal(findIssues('word '.repeat(26).trim()+'.','description')[0].kind,'length');
});
test('the same text uses different limits in different modes',()=>{
  const value='word '.repeat(23).trim()+'.';
  assert.equal(findIssues(value,'procedure').length,1);
  assert.equal(findIssues(value,'description').length,0);
});
test('multiple sentences are checked separately',()=>{
  const value='Do not open the panel. '+'word '.repeat(21).trim()+'.';
  const issues=findIssues(value,'procedure');
  assert.equal(issues.length,1);
  assert.ok(issues[0].start>=value.indexOf('word'));
});
test('multiple instances and offsets are reported',()=>{
  const value="Don't open; can't close.";
  const issues=findIssues(value,'procedure');
  assert.deepEqual(issues.map(x=>x.kind),['contraction','punct','contraction']);
  assert.deepEqual(issues.map(x=>value.slice(x.start,x.end)),["Don't",';',"can't"]);
});
test('empty input is valid preview input',()=>{
  assert.deepEqual(findIssues('','procedure'),[]);
  assert.equal(wordCount(''),0);
});
test('hyphenated words are approximately counted as one',()=>{
  assert.equal(wordCount('Inspect the high-pressure line.'),4);
});
test('unknown mode is rejected',()=>{
  assert.throws(()=>findIssues('x','foobar'),TypeError);
});

test('contraction hover guidance offers a full form without claiming compliance',()=>{
  const issue=findIssues("Don't open the panel.",'procedure')[0];
  assert.equal(issue.kind,'contraction');
  assert.match(issue.advice,/do not/);
  assert.match(issue.advice,/Check the full sentence/);
});
