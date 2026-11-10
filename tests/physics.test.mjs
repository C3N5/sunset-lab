import test from 'node:test';
import assert from 'node:assert/strict';

// These verify the same core equations used by index.html.
const omega = 2 * Math.PI / 86400;
const dip = (r,h) => Math.acos(r/(r+h));
const radiusFromDelay = (h1,h2,time,relativeRate=1) => {
  const target = omega * relativeRate * time;
  let low=1000, high=1e12;
  if (!(h2>h1) || target<=0) return NaN;
  const f=r=>dip(r,h2)-dip(r,h1);
  if(f(low)<target || f(high)>target) return NaN;
  for(let i=0;i<100;i++) {
    const mid=(low+high)/2;
    if(f(mid)>target)low=mid;else high=mid;
  }
  return (low+high)/2;
};
const approximate = (h1,h2,time) =>
  2*(Math.sqrt(h2)-Math.sqrt(h1))**2/(omega*time)**2;

test('horizon dip is zero at surface',()=>assert.equal(dip(6371000,0),0));
test('horizon dip increases with observer eye height',()=>assert.ok(dip(6371000,2)>dip(6371000,1)));
test('baseline example is on the order of Earth radius',()=>{
  const r=radiusFromDelay(0,1.83,11);
  assert.ok(r>5e6 && r<7e6, 'radius should be ~5.7 million meters');
});
test('exact radius reproduces measured angular difference',()=>{
  const r=radiusFromDelay(0.4,5.4,12);
  assert.ok(Number.isFinite(r));
  assert.ok(Math.abs((dip(r,5.4)-dip(r,.4))-omega*12)<1e-9);
});
test('small angle is close for ordinary eye heights',()=>{
  const exact=radiusFromDelay(0,1.83,11);
  assert.ok(Math.abs(approximate(0,1.83,11)-exact)/exact<.001);
});
test('longer delay means smaller inferred radius, keeping heights fixed',()=>{
  assert.ok(radiusFromDelay(0,1.83,15)<radiusFromDelay(0,1.83,10));
});
test('reject inverted heights',()=>assert.ok(Number.isNaN(radiusFromDelay(2,1,11))));
