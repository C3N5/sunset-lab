import test from 'node:test';
import assert from 'node:assert/strict';
import {BASE_RATE,horizonDip,radiusExact,radiusSmallAngle,estimate} from '../physics.mjs';

test('horizon dip at the surface is zero',()=>assert.equal(horizonDip(6371000,0),0));
test('raising the observer increases horizon dip',()=>assert.ok(horizonDip(6371000,2)>horizonDip(6371000,1)));
test('submitted scenario produces an illustrative estimate around 5720 km',()=>{
 const result=estimate({lower:0,higher:1.83,delay:11,rate:100});
 assert.ok(result.valid);
 assert.ok(result.exact/1000>5700&&result.exact/1000<5750);
});
test('exact solution reproduces the observed dip difference for both heights nonzero',()=>{
 const radius=radiusExact(.4,5.4,BASE_RATE*12);
 assert.ok(Number.isFinite(radius));
 assert.ok(Math.abs(horizonDip(radius,5.4)-horizonDip(radius,.4)-BASE_RATE*12)<1e-9);
});
test('small angle agrees closely for baseline',()=>{
 const a=BASE_RATE*11,exact=radiusExact(0,1.83,a),approx=radiusSmallAngle(0,1.83,a);
 assert.ok(Math.abs(exact-approx)/exact<0.001);
});
test('longer delay means smaller inferred radius for same heights',()=>{
 assert.ok(radiusExact(0,1.83,BASE_RATE*15)<radiusExact(0,1.83,BASE_RATE*10));
});
test('invalid heights rejected',()=>assert.ok(Number.isNaN(radiusExact(2,1,BASE_RATE*11))));
test('increasing assumed angular rate decreases the inferred radius',()=>{
 assert.ok(estimate({lower:0,higher:1.83,delay:11,rate:120}).exact<
 estimate({lower:0,higher:1.83,delay:11,rate:100}).exact);
});
