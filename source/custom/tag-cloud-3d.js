/* LazyMondy 3D Tag Cloud v3 */
(function(){
function init(){
var c=document.querySelector('.card-tag-cloud');if(!c)return;
var ls=c.querySelectorAll('a');if(ls.length<1)return;
if(c._tc3d)c._tc3d.destroy();
var tags=[];for(var i=0;i<ls.length;i++)tags.push({text:ls[i].textContent,href:ls[i].getAttribute('href')||'#'});
var R=90,n=tags.length,items=[],C=['#a8744a','#6b8e5a','#6b88a8','#c97b5a','#8a6ba8','#5a9b8a','#b89860','#7a8a9a'];
function hx(h){h=h.replace('#','');return{r:parseInt(h.substring(0,2),16),g:parseInt(h.substring(2,4),16),b:parseInt(h.substring(4,6),16)};}
c.setAttribute('data-tc3d','1');c.innerHTML='';c.style.cssText='position:relative;width:100%;height:'+(R*2+30)+'px;overflow:visible;text-align:center;';
var g=Math.PI*(3-Math.sqrt(5));
for(var i=0;i<n;i++){
var y=n===1?0:1-(i/(n-1))*2;var r=Math.sqrt(Math.max(0,1-y*y));var t=g*i;
var x=Math.cos(t)*r,z=Math.sin(t)*r;
var bc=C[i%C.length],rgb=hx(bc);
var el=document.createElement('a');el.href=tags[i].href;el.textContent=tags[i].text;
el.style.cssText='position:absolute;left:50%;top:50%;margin:0;padding:3px 6px;font-size:0.82rem;color:'+bc+';text-decoration:none;white-space:nowrap;font-weight:600;cursor:pointer;pointer-events:auto;display:inline-block;';
el.addEventListener('mouseenter',function(){isP=true;});el.addEventListener('mouseleave',function(){isP=false;});
c.appendChild(el);items.push({el:el,x:x,y:y,z:z,rgb:rgb});
}
var rX=0,rY=0,sX=0.003,sY=0.005,tX=0.003,tY=0.005,mx=0,my=0,iH=false,isP=false,raf=null;
c.addEventListener('mouseenter',function(){iH=true;});c.addEventListener('mouseleave',function(){iH=false;});
c.addEventListener('mousemove',function(e){var rc=c.getBoundingClientRect();mx=(e.clientX-rc.left-rc.width/2)/(rc.width/2);my=(e.clientY-rc.top-rc.height/2)/(rc.height/2);});
function anim(){
if(!isP){if(iH){tX=my*0.04;tY=mx*0.04;}else{tX=0.003;tY=0.005;}sX+=(tX-sX)*0.1;sY+=(tY-sY)*0.1;rX+=sX;rY+=sY;}
var cX=Math.cos(rX),sX2=Math.sin(rX),cY=Math.cos(rY),sY2=Math.sin(rY);
for(var i=0;i<items.length;i++){var it=items[i];
var x1=it.x*cY+it.z*sY2;var z1=-it.x*sY2+it.z*cY;var y1=it.y*cX-z1*sX2;var z2=it.y*sX2+z1*cX;
var sc=(z2+2)/3;var op=Math.max(0.35,Math.min(1,(z2+1.5)/2.5));var br=0.45+sc*0.55;
it.el.style.transform='translate(-50%,-50%) translate3d('+(x1*R)+'px,'+(y1*R)+'px,0) scale('+sc.toFixed(3)+')';
it.el.style.opacity=op;it.el.style.color='rgb('+Math.round(it.rgb.r*br)+','+Math.round(it.rgb.g*br)+','+Math.round(it.rgb.b*br)+')';
it.el.style.zIndex=Math.round((z2+1)*1000);it.el.style.fontSize=(0.75+sc*0.18).toFixed(2)+'rem';
}raf=requestAnimationFrame(anim);}anim();
c._tc3d={destroy:function(){if(raf)cancelAnimationFrame(raf);c.innerHTML='';c.style.height='';c.style.position='';c.style.overflow='';c._tc3d=null;}};
}
function tryInit(){if(document.querySelector('.card-tag-cloud'))init();else setTimeout(tryInit,500);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tryInit);else tryInit();
document.addEventListener('pjax:success',tryInit);
function setupObs(){var sb=document.querySelector('.card-tags')||document.querySelector('#aside-content')||document.querySelector('#asidebar');if(!sb){setTimeout(setupObs,1000);return;}var o=new MutationObserver(function(){if(window._tc3dBuilding)return;var cl=document.querySelector('.card-tag-cloud');if(!cl)return;var hasOrig=cl.getAttribute('data-tc3d');if(cl.querySelectorAll('a').length>0&&!hasOrig){clearTimeout(window._tc3dR);window._tc3dR=setTimeout(function(){window._tc3dBuilding=true;init();setTimeout(function(){window._tc3dBuilding=false;},500);},300);}});o.observe(sb,{childList:true,subtree:true});}
setupObs();
})();