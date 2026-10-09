const M = require('./engine.js');
const E = require('./expected.json');
let n = 0, fail = 0;
const eq = (a, b, tag) => {
  n++;
  if (JSON.stringify(a) !== JSON.stringify(b)) { fail++; console.error('FAIL', tag, JSON.stringify(a), '!=', JSON.stringify(b)); }
};
for (const c of E.wash) { let r; try { r = M.wash(...c.in); } catch (e) { r = { error: e.message }; } eq(r, c.out, 'wash ' + c.in); }
for (const c of E.dilute) { let r; try { r = M.dilute(...c.in); } catch (e) { r = { error: e.message }; } eq(r, c.out, 'dilute ' + c.in); }
for (const c of E.mix) { let r; try { r = M.mix(...c.in); } catch (e) { r = { error: e.message }; } eq(r, c.out, 'mix ' + c.in); }
// anchors
eq(M.wash(800, 2, 100).waterMl, 16, 'anchor wash');
eq(M.dilute(1, 2, 5).addWaterPerPaintPart, 3, 'anchor dilute');
const mx = M.mix(3, 1, 20);
eq(mx.mlA, 15, 'anchor mixA'); eq(mx.pctB, 25, 'anchor pctB');
// invariants: mix parts sum to total
n++;
{ const q = M.mix(7, 13, 33); if (Math.abs(q.mlA + q.mlB - 33) > 0.01) { fail++; console.error('FAIL mix invariant'); } }
// errors
const errs = [
  () => M.wash(0, 2, 100), () => M.wash(100, 0, 100), () => M.wash(100, 1, 5),
  () => M.dilute(0, 1, 5), () => M.dilute(1, -1, 5), () => M.dilute(1, 5, 3), () => M.dilute(1, 2, 100),
  () => M.mix(0, 1, 10), () => M.mix(1, 0, 10), () => M.mix(1, 1, 0),
];
const msgs = ['area must be positive','at least one layer','coverage outside the labeled 10-500 cm2/mL band',
  'paint parts must be positive','current water parts cannot be negative','target must be weaker than the current wash','past 1:50 there is no color left (labeled)',
  'first color parts must be positive','second color parts must be positive','total must be positive'];
errs.forEach((f, i) => {
  n++;
  try { f(); fail++; console.error('FAIL no-throw', i); }
  catch (e) { if (e.message !== msgs[i]) { fail++; console.error('FAIL msg', i, e.message, 'want', msgs[i]); } }
});
console.log(fail ? fail + ' FAILURES / ' + n : n + '/' + n + ' checks pass');
process.exit(fail ? 1 : 0);
