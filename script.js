/* ============================================================
   DHANUSH MUNAGALA · PORTFOLIO · script.js
   ============================================================ */

/* ═══════════════════════════════════════════════════════════
   GRAVITATIONAL LENSING — mouse parallax + scroll depth
   ═══════════════════════════════════════════════════════════ */
const GRAV=(function(){
  const C=document.getElementById('grav-canvas');
  const X=C.getContext('2d');
  let W,H,t=0,scrollY2=0;
  let mouseNX=0,mouseNY=0,smNX=0,smNY=0;
  const BH={x:0,y:0,r:0,tx:0,ty:0};

  function resize(){
    W=C.width=innerWidth; H=C.height=innerHeight;
    BH.r=Math.min(W,H)*.085;
    BH.tx=W*.7; BH.ty=H*.42;
    BH.x=BH.tx; BH.y=BH.ty;
  }
  resize(); addEventListener('resize',resize);
  addEventListener('scroll',()=>{scrollY2=window.scrollY},{passive:true});
  addEventListener('mousemove',e=>{
    mouseNX=(e.clientX/innerWidth)-.5;
    mouseNY=(e.clientY/innerHeight)-.5;
  });

  /* Stars with per-star depth layer for parallax */
  const STARS=Array.from({length:400},()=>({
    ox:Math.random()*2560, oy:Math.random()*1440,
    r:Math.random()*1.1+.12,
    ba:Math.random()*.55+.05,
    t:Math.random()*Math.PI*2,
    dt:Math.random()*.0018+.0008,
    pl:Math.random()*.022+.003
  }));

  const DISK=Array.from({length:1100},()=>{
    const ang=Math.random()*Math.PI*2;
    const rad=BH.r*(1.25+Math.random()*2.4);
    const sp=.0014+Math.random()*.0008;
    const dop=Math.cos(ang)>.15?.92:.38+Math.random()*.32;
    return{ang,rad,sp,dop,r:Math.random()*1.8+.28,life:Math.random(),dec:.002+Math.random()*.005};
  });

  function lerp(a,b,f){return a+(b-a)*f}

  function draw(){
    t+=.01;
    smNX=lerp(smNX,mouseNX,.055);
    smNY=lerp(smNY,mouseNY,.055);
    X.clearRect(0,0,W,H);

    const totalH=document.documentElement.scrollHeight-H||1;
    const depth=Math.min(1,scrollY2/totalH);

    BH.tx=W*(.68+Math.sin(t*.007)*W*.09/W) - (scrollY2/(totalH))*W*.32 + smNX*W*.07;
    BH.ty=H*(.41+Math.cos(t*.005)*H*.055/H) + smNY*H*.045 + depth*H*.08;
    BH.x=lerp(BH.x,BH.tx,.018);
    BH.y=lerp(BH.y,BH.ty,.018);
    const bhR=BH.r*(1+depth*.18);

    const bg=X.createRadialGradient(BH.x,BH.y,0,BH.x,BH.y,Math.max(W,H)*.75);
    bg.addColorStop(0,'rgba(2,1,8,1)');
    bg.addColorStop(.3,'rgba(5,4,16,1)');
    bg.addColorStop(.7,'rgba(4,3,12,1)');
    bg.addColorStop(1,'rgba(3,3,10,1)');
    X.fillStyle=bg; X.fillRect(0,0,W,H);

    const nebColors=['rgba(38,18,76,','rgba(10,28,58,','rgba(48,14,68,','rgba(14,38,68,'];
    for(let i=0;i<4;i++){
      const nx=BH.x+Math.cos(t*.036+i*1.57)*W*.28+W*.08*(i%2-.5)+smNX*W*.06*(i*.4+.8);
      const ny=BH.y+Math.sin(t*.028+i*1.2)*H*.2+smNY*H*.045*(i*.4+.8);
      const intensity=.055+depth*.035;
      const ng=X.createRadialGradient(nx,ny,0,nx,ny,W*(.26+depth*.04));
      ng.addColorStop(0,nebColors[i]+intensity+')');
      ng.addColorStop(1,nebColors[i]+'0)');
      X.fillStyle=ng; X.fillRect(0,0,W,H);
    }

    const scrollOffY=-scrollY2*.038;
    for(const s of STARS){
      s.t+=s.dt;
      const pxOff=smNX*W*s.pl;
      const pyOff=smNY*H*s.pl*.7+scrollOffY*s.pl*3.5;
      const sx=((s.ox+pxOff)%W+W)%W;
      const sy=((s.oy+pyOff)%H+H)%H;
      const dx=sx-BH.x, dy=sy-BH.y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      const minD=bhR*2.2;
      let lx=sx,ly=sy;
      if(dist>minD){
        const str=bhR*bhR*1.4/(dist*dist);
        lx=sx-dx*str; ly=sy-dy*str;
        if(dist<bhR*5){
          const arc=Math.min(1,(bhR*5-dist)/(bhR*3.5));
          const perp=Math.atan2(dy,dx)+Math.PI*.5;
          const stretch=(1+arc*2.8)*Math.max(.4,s.r);
          X.save(); X.translate(lx,ly); X.rotate(perp); X.scale(stretch,1);
          X.beginPath(); X.arc(0,0,s.r,0,Math.PI*2);
          X.fillStyle=`rgba(210,200,255,${s.ba*(1-arc*.6)*Math.abs(Math.sin(s.t))})`;
          X.fill(); X.restore(); continue;
        }
      }
      const a=s.ba*(.72+.28*Math.abs(Math.sin(s.t)))*(1+depth*.12);
      X.beginPath(); X.arc(lx,ly,s.r,0,Math.PI*2);
      X.fillStyle=`rgba(220,215,255,${Math.min(.95,a)})`; X.fill();
    }

    const og=X.createRadialGradient(BH.x,BH.y,bhR*1.1,BH.x,BH.y,bhR*4.5);
    og.addColorStop(0,`rgba(255,140,40,${.11+depth*.06})`);
    og.addColorStop(.4,`rgba(220,80,20,${.055+depth*.03})`);
    og.addColorStop(1,'rgba(100,40,10,0)');
    X.fillStyle=og; X.fillRect(0,0,W,H);

    for(const p of DISK){
      p.ang+=p.sp*(bhR*1.4/p.rad);
      p.life-=p.dec;
      if(p.life<=0){p.ang=Math.random()*Math.PI*2;p.rad=bhR*(1.25+Math.random()*2.4);p.life=1;p.dec=.002+Math.random()*.005;}
      const px=BH.x+Math.cos(p.ang)*p.rad;
      const py=BH.y+Math.sin(p.ang)*p.rad*.26;
      const behind=py>BH.y+bhR*.1;
      const a=p.life*.72*p.dop*(behind?.2:.92);
      const temp=p.rad/bhR;
      const cr=Math.min(255,Math.round(lerp(255,215,Math.min(1,(temp-1.25)/1.6))));
      const cg=Math.round(lerp(235,75,Math.min(1,(temp-1.25)/2.1)));
      const cb=Math.round(lerp(170,18,Math.min(1,(temp-1.25)/2.1)));
      if(p.r>1.1){
        const g2=X.createRadialGradient(px,py,0,px,py,p.r*2.4);
        g2.addColorStop(0,`rgba(${cr},${cg},${cb},${a})`);
        g2.addColorStop(1,`rgba(${cr},${cg},${cb},0)`);
        X.fillStyle=g2; X.beginPath(); X.arc(px,py,p.r*2.4,0,Math.PI*2); X.fill();
      }
      X.beginPath(); X.arc(px,py,p.r,0,Math.PI*2);
      X.fillStyle=`rgba(${cr},${cg},${cb},${Math.min(1,a*1.3)})`; X.fill();
    }

    X.save();
    X.beginPath(); X.ellipse(BH.x,BH.y,bhR*1.44,bhR*.35,0,0,Math.PI*2);
    X.strokeStyle='rgba(255,215,130,.16)'; X.lineWidth=1.4; X.stroke();
    X.beginPath(); X.ellipse(BH.x,BH.y,bhR*1.5,bhR*.37,0,0,Math.PI*2);
    X.strokeStyle='rgba(255,200,90,.08)'; X.lineWidth=2.8; X.stroke();
    X.restore();

    const bhg=X.createRadialGradient(BH.x,BH.y,0,BH.x,BH.y,bhR*1.04);
    bhg.addColorStop(0,'rgba(0,0,0,1)'); bhg.addColorStop(.72,'rgba(0,0,0,1)');
    bhg.addColorStop(.9,'rgba(2,0,5,.98)'); bhg.addColorStop(1,'rgba(5,2,10,.9)');
    X.beginPath(); X.arc(BH.x,BH.y,bhR*1.04,0,Math.PI*2); X.fillStyle=bhg; X.fill();

    const ig=X.createRadialGradient(BH.x,BH.y,bhR*.88,BH.x,BH.y,bhR*1.22);
    ig.addColorStop(0,'rgba(255,200,100,0)');
    ig.addColorStop(.5,`rgba(255,175,55,${.12+depth*.05})`);
    ig.addColorStop(1,'rgba(255,135,35,0)');
    X.fillStyle=ig; X.beginPath(); X.arc(BH.x,BH.y,bhR*1.22,0,Math.PI*2); X.fill();

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ═══ CURSOR ═══ */
(function(){
  const DOT=document.getElementById('cdot');
  if(!DOT)return;
  addEventListener('mousemove',e=>{DOT.style.left=e.clientX+'px';DOT.style.top=e.clientY+'px'});
  document.querySelectorAll('a,button,.pcard,.ccard,.ctlnk,.sk-lead-card,.bpri,.bsec,.bdl').forEach(el=>{
    el.addEventListener('mouseenter',()=>DOT.classList.add('hover'));
    el.addEventListener('mouseleave',()=>DOT.classList.remove('hover'));
  });
})();

/* ═══ NAV ═══ */
addEventListener('scroll',()=>document.getElementById('nav').classList.toggle('sc',scrollY>40));

/* ═══ TYPING ═══ */
const PH=[
  'Data Analyst \u00b7 Business Analyst \u00b7 SQL \u00b7 Power BI',
  'ETL/ELT Pipeline Design \u00b7 Snowflake \u00b7 Airflow',
  'Market Intelligence \u00b7 $760B Industry Analyzed',
  'Power BI \u00b7 DAX \u00b7 Star Schema \u00b7 Custom KPIs',
  'University of Houston \u00b7 MS MIS \u00b7 4.0 GPA \u00b7 Dean\'s Award',
  'Available Full-Time \u00b7 June 2026 \u00b7 OPT'
];
let pi=0,ci=0,del=false;
function type(){
  const el=document.getElementById('tt'); if(!el)return;
  const w=PH[pi];
  if(!del){el.textContent=w.slice(0,++ci); if(ci===w.length){del=true;setTimeout(type,2200);return;}}
  else{el.textContent=w.slice(0,--ci); if(ci===0){del=false;pi=(pi+1)%PH.length;}}
  setTimeout(type,del?34:72);
}
setTimeout(type,1200);

/* ═══ SCROLL REVEAL ═══ */
const obs=new IntersectionObserver(en=>{en.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target)}})},{threshold:.05});
document.querySelectorAll('.rev').forEach(el=>obs.observe(el));

/* ═══ 3D SECTION ENTRANCE ═══ */
(function(){
  const secs=document.querySelectorAll('section:not(#hero)');
  secs.forEach(s=>s.classList.add('s3d'));
  const so=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('s3d-in');so.unobserve(e.target)}});
  },{threshold:.04,rootMargin:'0px 0px -2% 0px'});
  secs.forEach(s=>so.observe(s));
})();

/* ═══════════════════════════════════════════════════════════
   JOURNEY — HORIZONTAL SCROLL (sticky + scroll-progress)
   ═══════════════════════════════════════════════════════════ */
(function(){
  const outer=document.getElementById('journey-outer');
  const track=document.getElementById('journey-track');
  const fill=document.getElementById('jnav-fill');
  const curEl=document.getElementById('jh-cur');
  if(!outer||!track)return;
  const panels=track.querySelectorAll('.jp');
  const numP=panels.length;
  const dots=document.querySelectorAll('.jndot');

  /* Set height so sticky has enough scroll room */
  outer.style.height=(numP*100)+'vh';

  function onScroll(){
    const rect=outer.getBoundingClientRect();
    const total=outer.offsetHeight-window.innerHeight;
    const scrolled=-rect.top;
    if(scrolled<0||scrolled>total)return;
    const prog=Math.max(0,Math.min(1,scrolled/total));
    track.style.transform=`translateX(${-(prog*(numP-1)*window.innerWidth)}px)`;
    if(fill)fill.style.width=(prog*100)+'%';
    const ai=Math.round(prog*(numP-1));
    if(curEl)curEl.textContent=ai+1;
    dots.forEach((d,i)=>d.classList.toggle('active',i===ai));
  }

  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();
})();

/* ═══════════════════════════════════════════════════════════
   METRICS COUNTERS
   ═══════════════════════════════════════════════════════════ */
(function(){
  const cards=document.querySelectorAll('.mc[data-target]');
  const mo=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting)return;
      mo.unobserve(e.target);
      const el=e.target;
      const target=parseFloat(el.dataset.target);
      const suffix=el.dataset.suffix||'';
      const prefix=el.dataset.prefix||'';
      const numEl=el.querySelector('.mc-n');
      if(!numEl)return;
      const isDecimal=target!==Math.floor(target);
      let current=0;
      const inc=target/55;
      const timer=setInterval(()=>{
        current=Math.min(current+inc,target);
        numEl.textContent=prefix+(isDecimal?current.toFixed(1):Math.floor(current))+suffix;
        if(current>=target){numEl.textContent=prefix+target+suffix;clearInterval(timer);}
      },16);
    });
  },{threshold:.3});
  cards.forEach(c=>mo.observe(c));
})();

/* ═══ SKILL BARS (if any remain) ═══ */
const sobs=new IntersectionObserver(en=>{en.forEach(e=>{if(e.isIntersecting)e.target.querySelectorAll('.skbf').forEach(f=>f.style.transform=`scaleX(${f.dataset.w})`)})},{threshold:.15});
document.querySelectorAll('#skills').forEach(el=>sobs.observe(el));

/* ═══ 3D CARD TILT ═══ */
document.querySelectorAll('.pcard').forEach(c=>{
  c.addEventListener('mousemove',e=>{
    const r=c.getBoundingClientRect();
    c.style.transform=`perspective(900px) rotateX(${-(e.clientY-r.top-r.height/2)/r.height*7}deg) rotateY(${(e.clientX-r.left-r.width/2)/r.width*7}deg) translateY(-5px)`;
    c.style.setProperty('--px',(e.clientX-r.left)/r.width*100+'%');
    c.style.setProperty('--py',(e.clientY-r.top)/r.height*100+'%');
  });
  c.addEventListener('mouseleave',()=>c.style.transform='');
});
