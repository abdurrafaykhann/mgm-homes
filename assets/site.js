(function(){
'use strict';
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE=innerWidth<900;
document.documentElement.classList.add('js');
gsap.registerPlugin(ScrollTrigger);

/* ---------- logo mask ---------- */
const LOGO='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 830 280"><path d="M0 280V0h74l56 142L186 0h74v280h-70V128l-38 96h-44l-38-96v152z"/><path d="M290 0h250v80H370v120h90v-34h-50v-58h130v172H290z"/><path d="M570 280V0h74l56 142L756 0h74v280h-70V128l-38 96h-44l-38-96v152z"/></svg>';
const maskUrl='url("data:image/svg+xml,'+encodeURIComponent(LOGO)+'")';
const comp=document.getElementById('composite');
if(comp){comp.style.webkitMaskImage=maskUrl;comp.style.maskImage=maskUrl}

/* ---------- procedural clouds ---------- */
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function cloud(w,h,seed,band){
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),R=rng(seed);
  const n=band?150:70;
  for(let i=0;i<n;i++){
    let x,y,r;
    if(band){x=R()*w;const t=R();y=h*(.3+.7*t);r=(.1+.2*R())*h*(.6+t*.8)}
    else{const a=R()*6.28,d=Math.pow(R(),.7);x=w/2+Math.cos(a)*d*w*.34;y=h*.58+Math.sin(a)*d*h*.2-(1-d)*h*.12;r=(.1+.16*R())*h*(1.25-d*.6)}
    const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,'+(band?.5:.42)+')');gr.addColorStop(.55,'rgba(255,255,255,'+(band?.22:.16)+')');gr.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();
  }
  if(band){const gr=g.createLinearGradient(0,h*.55,0,h);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(255,255,255,1)');g.fillStyle=gr;g.fillRect(0,h*.55,w,h*.45)}
  return 'url('+c.toDataURL('image/png')+')';
}
[['.c1',900,380,11],['.c2',900,380,29],['.c3',700,300,53],['.s1',1400,420,71,true],['.s2',1400,520,97,true],['.pband',1400,420,83,true]].forEach(([s,w,h,seed,band])=>{const e=document.querySelector(s);if(e)e.style.backgroundImage=cloud(w,h,seed,band)});

/* ---------- text splitting ---------- */
function split(el,cls){
  const out=[];
  (function walk(n){[...n.childNodes].forEach(c=>{
    if(c.nodeType===3){const f=document.createDocumentFragment();
      c.textContent.split(/(\s+)/).forEach(p=>{if(!p)return;if(/^\s+$/.test(p)){f.appendChild(document.createTextNode(' '));return}
        if(cls==='mask'){const w=document.createElement('span');w.className='w';const i=document.createElement('span');i.className='wi';i.textContent=p;w.appendChild(i);f.appendChild(w);out.push(i)}
        else{const s=document.createElement('span');s.className='wd';s.textContent=p;f.appendChild(s);out.push(s)}});
      n.replaceChild(f,c)}
    else if(c.nodeType===1&&c.tagName!=='BR')walk(c)})})(el);
  return out;
}

/* ---------- smooth scroll ---------- */
let lenis=null;
if(!RM&&window.Lenis){lenis=new Lenis({lerp:.09,smoothWheel:true});lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0)}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const id=a.getAttribute('href');if(id.length<2){e.preventDefault();return}
  let el=null;try{el=document.querySelector(id)}catch(_){}
  if(!el)return;e.preventDefault();
  const y=id==='#top'?0:el;
  lenis?lenis.scrollTo(y,{duration:1.6,easing:t=>1-Math.pow(1-t,4)}):(id==='#top'?scrollTo({top:0,behavior:'smooth'}):el.scrollIntoView({behavior:'smooth'}));
}));

/* ---------- nav ---------- */
const nav=document.getElementById('nav'),hero=document.querySelector('.hero');let lastY=0;
ScrollTrigger.create({start:0,end:'max',onUpdate:s=>{
  const y=s.scroll(),past=hero?y>hero.offsetHeight-innerHeight*.9:y>30;
  nav.classList.toggle('solid',past);
  nav.classList.toggle('hide',past&&y>lastY+2);
  if(y<lastY-2)nav.classList.remove('hide');
  lastY=y;
}});

/* ---------- hero ---------- */
if(hero){
const h1w=split(document.getElementById('h1'),'mask');
if(!RM){
  const houses=gsap.utils.toArray('.house');
  gsap.set(houses,{yPercent:56});
  gsap.set('.s1',{yPercent:55});
  // intro
  gsap.set(h1w,{yPercent:115});gsap.set(['#heroSub','#heroCta','.scrollcue'],{opacity:0,y:20});gsap.set(nav,{yPercent:-100});
  const intro=gsap.timeline({defaults:{ease:'expo.out'},delay:.15});
  intro.from(houses,{yPercent:86,duration:2.2},0)
       .from(['.c1','.c2','.c3'],{opacity:0,scale:1.15,duration:2.4,stagger:.12},0)
       .to(h1w,{yPercent:0,duration:1.5,stagger:.07},.35)
       .to(['#heroSub','#heroCta','.scrollcue'],{opacity:1,y:0,duration:1.2,stagger:.1},.9)
       .to(nav,{yPercent:0,duration:1.2,clearProps:'transform'},.7);
  // idle cloud drift
  gsap.to('.c1',{x:'6vw',duration:26,ease:'sine.inOut',yoyo:true,repeat:-1});
  gsap.to('.c2',{x:'-7vw',duration:32,ease:'sine.inOut',yoyo:true,repeat:-1});
  gsap.to('.c3',{x:'5vw',duration:22,ease:'sine.inOut',yoyo:true,repeat:-1});
  // scroll story
  const tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:hero,start:'top top',end:'bottom bottom',scrub:.6}});
  tl.to(houses,{yPercent:0,duration:.3,ease:'power1.out'},0)
    .to('#heroContent',{opacity:0,y:-60,duration:.14},.05)
    .to('.scrollcue',{opacity:0,duration:.06},.02)
    .to('.s1',{yPercent:0,duration:.3},0)
    .to('.c1',{yPercent:-40,duration:1},0).to('.c2',{yPercent:-28,duration:1},0).to('.c3',{yPercent:-60,duration:1},0)
    .to('.outline',{opacity:1,duration:.02},.23)
    .to('.outline path',{strokeDashoffset:0,duration:.2,stagger:.03,ease:'power1.inOut'},.24)
    .set('.composite',{opacity:1},.44)
    .to('.houseA',{opacity:0,duration:.1},.44)
    .to('.s1',{opacity:.55,duration:.1},.44)
    .to('.outline',{opacity:0,duration:.06},.5)
    .to('.wordmark',{opacity:1,duration:.1},.47)
    .fromTo('.wordmark',{y:24},{y:0,duration:.1},.47)
    .to('.houseB img',{yPercent:-7,scale:1.08,duration:.4},.46)
    .to('.s2',{y:()=>-innerHeight*1.35,duration:.26,ease:'power1.in'},.7)
    .to('.white',{opacity:1,duration:.1},.9)
    .to({}, {duration:.02},.98);
}

}

/* ---------- sub-page header ---------- */
const ph=document.querySelector('.phero');
if(ph&&!RM){
  const ws=split(ph.querySelector('h1'),'mask');
  gsap.set(nav,{yPercent:-100});
  gsap.timeline({defaults:{ease:'expo.out'},delay:.1})
    .from(['.c1','.c2'],{opacity:0,scale:1.15,duration:2.2,stagger:.12},0)
    .from('.pband',{yPercent:40,duration:2},0)
    .from(ws,{yPercent:115,duration:1.4,stagger:.07},.2)
    .from('.phero p, .phero .crumb',{opacity:0,y:20,duration:1.1,stagger:.1},.7)
    .to(nav,{yPercent:0,duration:1.1,clearProps:'transform'},.5);
  gsap.to('.c1',{x:'6vw',duration:26,ease:'sine.inOut',yoyo:true,repeat:-1});
  gsap.to('.c2',{x:'-7vw',duration:32,ease:'sine.inOut',yoyo:true,repeat:-1});
  gsap.to('.phero .inner',{yPercent:-18,opacity:.2,ease:'none',scrollTrigger:{trigger:ph,start:'top top',end:'bottom top',scrub:true}});
}

/* ---------- phone menu ---------- */
(function(){
  const btn=document.getElementById('menuBtn'),menu=document.getElementById('mmenu');if(!btn||!menu)return;
  const set=o=>{document.documentElement.classList.toggle('menu-open',o);btn.setAttribute('aria-expanded',o);menu.setAttribute('aria-hidden',!o);if(lenis)o?lenis.stop():lenis.start();
    if(o&&!RM)gsap.fromTo(menu.querySelectorAll('a'),{yPercent:60,opacity:0},{yPercent:0,opacity:1,duration:.9,ease:'expo.out',stagger:.05,delay:.15})};
  btn.addEventListener('click',()=>set(!document.documentElement.classList.contains('menu-open')));
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>set(false)));
  addEventListener('keydown',e=>{if(e.key==='Escape')set(false)});
})();

/* ---------- contact form (opens the visitor's email app) ---------- */
(function(){
  const f=document.getElementById('cform');if(!f)return;
  const pk=new URLSearchParams(location.search).get('package');
  if(pk){const o=[...f.package.options].find(o=>o.value.toLowerCase()===pk.toLowerCase());if(o)f.package.value=o.value}
  f.addEventListener('submit',e=>{
    e.preventDefault();
    const d=new FormData(f),L=[];
    L.push('Name: '+d.get('name'));L.push('Property location: '+d.get('location'));L.push('Currently listed on: '+(d.get('platforms')||'-'));L.push('Package of interest: '+d.get('package'));L.push('');L.push(d.get('message')||'');
    location.href='mailto:hello@mgmhomes.com?subject='+encodeURIComponent('Book a call - '+d.get('name'))+'&body='+encodeURIComponent(L.join('\n'));
    document.getElementById('cnote').textContent='Your email app should now be open with the message ready to send.';
  });
})();

/* ---------- word fill ---------- */
document.querySelectorAll('[data-fill]').forEach(el=>{
  const ws=split(el,'wd');
  if(RM)return;
  gsap.to(ws,{opacity:1,stagger:.1,ease:'none',scrollTrigger:{trigger:el,start:'top 82%',end:'bottom 52%',scrub:true}});
});

if(!RM){
  /* headings: masked word reveal */
  document.querySelectorAll('.h2:not([data-fill]), .outro h2').forEach(h=>{
    const ws=split(h,'mask');
    gsap.from(ws,{yPercent:115,duration:1.3,ease:'expo.out',stagger:.06,scrollTrigger:{trigger:h,start:'top 88%'}});
  });
  /* generic reveals */
  gsap.utils.toArray('[data-reveal]').forEach(el=>{
    gsap.to(el,{opacity:1,y:0,duration:1.2,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 92%'}});
  });
  /* image clip reveal + parallax */
  gsap.utils.toArray('[data-img]').forEach(el=>{
    const img=el.querySelector('img');
    gsap.to(el,{clipPath:'inset(0% 0 0 0)',duration:1.6,ease:'power4.inOut',scrollTrigger:{trigger:el,start:'top 88%'}});
    gsap.fromTo(img,{scale:1.25},{scale:1,duration:2,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 88%'}});
  });
  gsap.utils.toArray('[data-par] img').forEach(img=>{
    gsap.fromTo(img,{yPercent:-13},{yPercent:0,ease:'none',scrollTrigger:{trigger:img.parentElement,start:'top bottom',end:'bottom top',scrub:true}});
  });
  /* chevrons */
  if(document.querySelector('.chev'))gsap.from('.chev',{xPercent:-60,opacity:0,duration:1.4,ease:'expo.out',stagger:.12,scrollTrigger:{trigger:'#chevs',start:'top 82%'}});
  /* service rows */
  gsap.utils.toArray('.srow').forEach(r=>{
    gsap.from(r.querySelector('.big'),{yPercent:60,opacity:0,duration:1.3,ease:'expo.out',scrollTrigger:{trigger:r,start:'top 90%'}});
    gsap.from([r.querySelector('.num'),r.querySelector('.d')],{opacity:0,y:20,duration:1.1,ease:'expo.out',stagger:.08,scrollTrigger:{trigger:r,start:'top 90%'}});
  });
  /* outro parallax + footer logo */
  gsap.fromTo('#outroBg',{yPercent:-7},{yPercent:7,ease:'none',scrollTrigger:{trigger:'.outro',start:'top bottom',end:'bottom top',scrub:true}});
  gsap.from('#fLogo svg',{yPercent:100,duration:1.6,ease:'expo.out',scrollTrigger:{trigger:'#fLogo',start:'top 96%'}});
}

/* ---------- packages slider ---------- */
(function(){
  const tabs=[...document.querySelectorAll('.tab')],panels=[...document.querySelectorAll('.pk')],bar=document.getElementById('pkBar');
  if(!tabs.length)return;
  let cur=0,timer=null,seen=false;const DUR=8;
  function show(i,user){
    if(i===cur&&user!==undefined&&!user)return;
    cur=i;
    tabs.forEach((t,k)=>t.setAttribute('aria-selected',k===i));
    panels.forEach((p,k)=>p.classList.toggle('on',k===i));
    if(!RM)gsap.fromTo(panels[i].children,{opacity:0,y:18},{opacity:1,y:0,duration:.9,ease:'expo.out',stagger:.06});
    run();
  }
  function run(){
    if(RM||!seen)return;
    gsap.killTweensOf(bar);
    gsap.fromTo(bar,{scaleX:0},{scaleX:1,duration:DUR,ease:'none',onComplete:()=>show((cur+1)%panels.length)});
  }
  tabs.forEach((t,i)=>t.addEventListener('click',()=>show(i,true)));
  const panel=document.querySelector('.packs .panel');
  panel.addEventListener('pointerenter',()=>gsap.getTweensOf(bar).forEach(t=>t.pause()));
  panel.addEventListener('pointerleave',()=>gsap.getTweensOf(bar).forEach(t=>t.resume()));
  ScrollTrigger.create({trigger:panel,start:'top 80%',once:true,onEnter:()=>{seen=true;run()}});
})();

/* ---------- FAQ: one open at a time, animated ---------- */
document.querySelectorAll('details').forEach(d=>{
  const a=d.querySelector('.a');
  d.querySelector('summary').addEventListener('click',e=>{
    if(RM)return;
    e.preventDefault();
    if(d.open){gsap.to(a,{height:0,opacity:0,duration:.5,ease:'power3.inOut',onComplete:()=>{d.open=false;gsap.set(a,{clearProps:'all'})}})}
    else{
      document.querySelectorAll('details[open]').forEach(o=>{if(o!==d){const oa=o.querySelector('.a');gsap.to(oa,{height:0,opacity:0,duration:.4,ease:'power3.inOut',onComplete:()=>{o.open=false;gsap.set(oa,{clearProps:'all'})}})}});
      d.open=true;gsap.fromTo(a,{height:0,opacity:0},{height:'auto',opacity:1,duration:.7,ease:'expo.out',onComplete:()=>ScrollTrigger.refresh()});
    }
  });
  a.style.overflow='hidden';
});

addEventListener('load',()=>ScrollTrigger.refresh());
})();
