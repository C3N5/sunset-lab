/** Sunset Lab physics engine. All lengths in meters, angles in radians. */
export const SECONDS_PER_DAY=86400;
export const BASE_RATE=2*Math.PI/SECONDS_PER_DAY;
export function horizonDip(radius,height){
 if(!(radius>0)||!(height>=0)) throw new RangeError("Invalid radius or height");
 return Math.atan(Math.sqrt(height*(2*radius+height))/radius);
}
export function radiusSmallAngle(lower,higher,angle){
 if(!(higher>lower) || !(lower>=0) || !(angle>0)) return NaN;
 return 2*(Math.sqrt(higher)-Math.sqrt(lower))**2/angle**2;
}
export function radiusExact(lower,higher,angle){
 if(!(higher>lower) || !(lower>=0) || !(angle>0)) return NaN;
 if(lower===0){
  if(angle>=Math.PI/2)return NaN;
  return higher*Math.cos(angle)/(2*Math.sin(angle/2)**2);
 }
 // For both heights nonzero, use the large-radius physical branch only.
 let lo=Math.max(1000,1000*higher),hi=1e12;
 const f=r=>horizonDip(r,higher)-horizonDip(r,lower);
 if(f(lo)<angle || f(hi)>angle)return NaN;
 for(let i=0;i<100;i++){
  const mid=(lo+hi)/2;
  if(f(mid)>angle)lo=mid;else hi=mid;
 }
 return (lo+hi)/2;
}
export function estimate({lower,higher,delay,rate=100}){
 const angle=BASE_RATE*rate/100*delay;
 const exact=radiusExact(lower,higher,angle);
 const approx=radiusSmallAngle(lower,higher,angle);
 return {angle,exact,approx,valid:Number.isFinite(exact)};
}
