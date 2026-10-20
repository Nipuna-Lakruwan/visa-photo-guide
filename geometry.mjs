export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function frame(W,H,ratio,zoom=1,angle=0,cx=W/2,cy=H/2){
 const a=angle*Math.PI/180,co=Math.cos(a),si=Math.sin(a),ac=Math.abs(co),as=Math.abs(si);
 const base=Math.min(W/(ac+as/ratio),H/(as+ac/ratio));
 const w=base/Math.max(1,zoom),h=w/ratio,ex=(ac*w+as*h)/2,ey=(as*w+ac*h)/2;
 return {w,h,cx:clamp(cx,ex,W-ex),cy:clamp(cy,ey,H-ey),co,si,angle,base,zoom:Math.max(1,zoom)};
}
export function toFrame(p,f){const x=p.x-f.cx,y=p.y-f.cy;return {x:.5+(f.co*x-f.si*y)/f.w,y:.5+(f.si*x+f.co*y)/f.h};}
export function toSource(p,f){const x=(p.x-.5)*f.w,y=(p.y-.5)*f.h;return {x:f.cx+f.co*x+f.si*y,y:f.cy-f.si*x+f.co*y};}
export function corners(f){return [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}].map(p=>toSource(p,f));}
export function fitFrame(W,H,p,marks,angle=0){
 const f=frame(W,H,p.w/p.h,1,angle),c=marks.crown,ch=marks.chin,eye=marks.center;
 const crownY=f.si*c.x+f.co*c.y,chinY=f.si*ch.x+f.co*ch.y,head=chinY-crownY;
 if(head<=1)throw new Error('Place the chin below the crown, then try again.');
 const target=p.target||.7,h=head/target,w=h*p.w/p.h;
 const top=p.top?(p.top[0]+p.top[1])/2/p.h:Math.max(.06,(1-target)*.35);
 const rx=f.co*eye.x-f.si*eye.y,ry=crownY+h*(.5-top);
 return frame(W,H,p.w/p.h,Math.max(1,f.base/w),angle,f.co*rx+f.si*ry,-f.si*rx+f.co*ry);
}
export function measurements(f,marks,p){
 const c=marks.crown&&toFrame(marks.crown,f),ch=marks.chin&&toFrame(marks.chin,f),centre=marks.center&&toFrame(marks.center,f);
 return {head:c&&ch?(ch.y-c.y)*p.h:null,percent:c&&ch?(ch.y-c.y)*100:null,top:c?c.y*p.h:null,bottom:ch?(1-ch.y)*p.h:null,offset:centre?Math.abs(centre.x-.5)*100:null,eye:centre?(1-centre.y)*p.h:null,inside:Object.values(marks).every(q=>{const t=toFrame(q,f);return t.x>=0&&t.x<=1&&t.y>=0&&t.y<=1;})};
}
