/* ============================================================
   DHANUSH MUNAGALA · PORTFOLIO · script.js
   Core interactivity: gravitational lensing, comet cursor,
   typing animation, scroll reveal, skill bars, 3D tilt
   ============================================================ */

/* ═══════════════════════════════════════
   GRAVITATIONAL LENSING — scrolls with page
   ═══════════════════════════════════════ */
const GRAV=(function(){
  const C=document.getElementById('grav-canvas');
  const X=C.getContext('2d');
  let W,H,t=0,scrollY2=0;

  /* Black hole — drifts + responds to scroll */
  const BH={x:0,y:0,r:0,tx:0,ty:0};

  function resize(){
    W=C.width=innerWidth; H=C.height=innerHeight;
    BH.r=Math.min(W,H)*.085;
    BH.tx=W*.7; BH.ty=H*.42;
    BH.x=BH.tx; BH.y=BH.ty;
  }
  resize(); addEventListener('resize',resize);
  addEventListener('scroll',()=>{scrollY2=window.scrollY});

  const STARS=Array.from({length:360},()=>({
    ox:Math.random()*2560,oy:Math.random()*1440,
    r:Math.random()*1.0+.15,
    ba:Math.random()*.55+.06,
    t:Math.random()*Math.PI*2,
    dt:Math.random()*.0018+.0008
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
    X.clearRect(0,0,W,H);

    /* BH target drifts based on time + scroll */
    const scrollFrac=Math.min(1,scrollY2/(document.documentElement.scrollHeight-H||1));
    /* Drift in a slow orbit and shift left as user scrolls down */
    const driftX=Math.sin(t*.007)*W*.09;
    const driftY=Math.cos(t*.005)*H*.055;
    BH.tx=W*(.68+driftX/W) - scrollFrac*W*.28;
    BH.ty=H*(.41+driftY/H);
    /* Smooth follow */
    BH.x=lerp(BH.x,BH.tx,.018);
    BH.y=lerp(BH.y,BH.ty,.018);

    /* Dark background */
    const bg=X.createRadialGradient(BH.x,BH.y,0,BH.x,BH.y,Math.max(W,H)*.75);
    bg.addColorStop(0,'rgba(2,1,8,1)');
    bg.addColorStop(.3,'rgba(5,4,16,1)');
    bg.addColorStop(.7,'rgba(4,3,12,1)');
    bg.addColorStop(1,'rgba(3,3,10,1)');
    X.fillStyle=bg; X.fillRect(0,0,W,H);

    /* Nebula wisps */
    const nebColors=['rgba(38,18,76,','rgba(10,28,58,','rgba(48,14,68,','rgba(14,38,68,'];
    for(let i=0;i<4;i++){
      const nx=BH.x+Math.cos(t*.036+i*1.57)*W*.28+W*.08*(i%2-.5);
      const ny=BH.y+Math.sin(t*.028+i*1.2)*H*.2;
      const ng=X.createRadialGradient(nx,ny,0,nx,ny,W*.26);
      ng.addColorStop(0,nebColors[i]+'.055)');
      ng.addColorStop(1,nebColors[i]+'0)');
      X.fillStyle=ng; X.fillRect(0,0,W,H);
    }

    /* Lensed stars */
    for(const s of STARS){
      s.t+=s.dt;
      const sx=s.ox%(W||1920), sy=s.oy%(H||1080);
      const dx=sx-BH.x, dy=sy-BH.y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      const minD=BH.r*2.2;
      let lx=sx,ly=sy;
      if(dist>minD){
        const str=BH.r*BH.r*1.4/(dist*dist);
        lx=sx-dx*str; ly=sy-dy*str;
        if(dist<BH.r*5){
          const arc=Math.min(1,(BH.r*5-dist)/(BH.r*3.5));
          const perp=Math.atan2(dy,dx)+Math.PI*.5;
          const stretch=(1+arc*2.8)*Math.max(.4,s.r);
          X.save();
          X.translate(lx,ly); X.rotate(perp); X.scale(stretch,1);
          X.beginPath(); X.arc(0,0,s.r,0,Math.PI*2);
          X.fillStyle=`rgba(210,200,255,${s.ba*(1-arc*.6)*Math.abs(Math.sin(s.t))})`;
          X.fill(); X.restore(); continue;
        }
      }
      const a=s.ba*(.72+.28*Math.abs(Math.sin(s.t)));
      X.beginPath(); X.arc(lx,ly,s.r,0,Math.PI*2);
      X.fillStyle=`rgba(220,215,255,${a})`; X.fill();
    }

    /* Outer accretion glow */
    const og=X.createRadialGradient(BH.x,BH.y,BH.r*1.1,BH.x,BH.y,BH.r*4.5);
    og.addColorStop(0,'rgba(255,140,40,.11)');
    og.addColorStop(.4,'rgba(220,80,20,.055)');
    og.addColorStop(1,'rgba(100,40,10,0)');
    X.fillStyle=og; X.fillRect(0,0,W,H);

    /* Disk particles */
    for(const p of DISK){
      p.ang+=p.sp*(BH.r*1.4/p.rad);
      p.life-=p.dec;
      if(p.life<=0){p.ang=Math.random()*Math.PI*2;p.rad=BH.r*(1.25+Math.random()*2.4);p.life=1;p.dec=.002+Math.random()*.005;}
      const px=BH.x+Math.cos(p.ang)*p.rad;
      const py=BH.y+Math.sin(p.ang)*p.rad*.26;
      const behind=py>BH.y+BH.r*.1;
      const a=p.life*.72*p.dop*(behind?.2:.92);
      const temp=p.rad/BH.r;
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

    /* Photon ring */
    X.save();
    X.beginPath(); X.ellipse(BH.x,BH.y,BH.r*1.44,BH.r*.35,0,0,Math.PI*2);
    X.strokeStyle='rgba(255,215,130,.16)'; X.lineWidth=1.4; X.stroke();
    X.beginPath(); X.ellipse(BH.x,BH.y,BH.r*1.5,BH.r*.37,0,0,Math.PI*2);
    X.strokeStyle='rgba(255,200,90,.08)'; X.lineWidth=2.8; X.stroke();
    X.restore();

    /* Event horizon */
    const bhg=X.createRadialGradient(BH.x,BH.y,0,BH.x,BH.y,BH.r*1.04);
    bhg.addColorStop(0,'rgba(0,0,0,1)');
    bhg.addColorStop(.72,'rgba(0,0,0,1)');
    bhg.addColorStop(.9,'rgba(2,0,5,.98)');
    bhg.addColorStop(1,'rgba(5,2,10,.9)');
    X.beginPath(); X.arc(BH.x,BH.y,BH.r*1.04,0,Math.PI*2); X.fillStyle=bhg; X.fill();

    /* Inner photon glow */
    const ig=X.createRadialGradient(BH.x,BH.y,BH.r*.88,BH.x,BH.y,BH.r*1.22);
    ig.addColorStop(0,'rgba(255,200,100,0)');
    ig.addColorStop(.5,'rgba(255,175,55,.12)');
    ig.addColorStop(1,'rgba(255,135,35,0)');
    X.fillStyle=ig; X.beginPath(); X.arc(BH.x,BH.y,BH.r*1.22,0,Math.PI*2); X.fill();

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ═══════════════════════════
   COMET CURSOR TRAIL
   ═══════════════════════════ */
(function(){
  const C=document.getElementById('comet-canvas');
  const X=C.getContext('2d');
  const DOT=document.getElementById('cdot');
  let W,H,mx=0,my=0,lx=0,ly=0;
  const rsz=()=>{C.width=W=innerWidth; C.height=H=innerHeight};
  rsz(); addEventListener('resize',rsz);
  addEventListener('mousemove',e=>{mx=e.clientX; my=e.clientY; DOT.style.left=mx+'px'; DOT.style.top=my+'px'});
  document.querySelectorAll('a,button,.pcard,.ccard,.jact,.ctlnk,.sk-lead-card,.sk-biz-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>DOT.classList.add('hover'));
    el.addEventListener('mouseleave',()=>DOT.classList.remove('hover'));
  });
  const COLS=['rgba(196,181,253,','rgba(103,232,249,','rgba(249,168,212,','rgba(249,199,79,','rgba(255,255,255,'];
  const TR=[];
  function spawn(x,y){
    const n=Math.random()<.35?3:2;
    for(let i=0;i<n;i++){
      const c=COLS[Math.floor(Math.random()*COLS.length)];
      const a2=Math.random()*Math.PI*2, sp=Math.random()*1.8+.3;
      const big=Math.random()<.07;
      TR.push({x,y,vx:Math.cos(a2)*sp*(Math.random()-.38)*.7,vy:Math.sin(a2)*sp*.45-.75,
        r:big?4+Math.random()*2.5:.5+Math.random()*1.5,
        life:1,decay:big?.014:.028+Math.random()*.022,c,
        glow:big||Math.random()<.18,ring:!big&&Math.random()<.1});
    }
  }
  function frame(){
    X.clearRect(0,0,W,H);
    if((mx-lx)**2+(my-ly)**2>4){spawn(mx,my); lx=mx; ly=my}
    for(let i=TR.length-1;i>=0;i--){
      const p=TR[i];
      p.x+=p.vx; p.y+=p.vy; p.vy+=.026; p.vx*=.978; p.life-=p.decay;
      if(p.life<=0){TR.splice(i,1); continue}
      const a=p.life*.88;
      if(p.ring){
        X.beginPath(); X.arc(p.x,p.y,p.r*(3-p.life*1.8),0,Math.PI*2);
        X.strokeStyle=p.c+a*.38+')'; X.lineWidth=.6; X.stroke();
      } else {
        if(p.glow){
          const g=X.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3.5);
          g.addColorStop(0,p.c+a*.5+')'); g.addColorStop(1,p.c+'0)');
          X.beginPath(); X.arc(p.x,p.y,p.r*3.5,0,Math.PI*2); X.fillStyle=g; X.fill();
        }
        X.beginPath(); X.arc(p.x,p.y,p.r,0,Math.PI*2);
        X.fillStyle=p.c+a+')'; X.fill();
      }
    }
    if(mx>0){
      const g=X.createRadialGradient(mx,my,0,mx,my,65);
      g.addColorStop(0,'rgba(196,181,253,.055)'); g.addColorStop(1,'rgba(196,181,253,0)');
      X.beginPath(); X.arc(mx,my,65,0,Math.PI*2); X.fillStyle=g; X.fill();
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ═══ NAV ═══ */
addEventListener('scroll',()=>document.getElementById('nav').classList.toggle('sc',scrollY>40));

/* ═══ TYPING ═══ */
const PH=['MS MIS · Graduating May 2026 · GPA 4.0','Data Analyst · Business Intelligence Developer','GTM Strategy & Market Analytics Consultant','SQL · Power BI · Python · R Developer','Clinical ML · 85% AUC · Real Patient Data','Club President · Industry Consulting · 460+ Students'];
let pi=0,ci=0,del=false;
function type(){
  const el=document.getElementById('tt'); if(!el)return;
  const w=PH[pi];
  if(!del){el.textContent=w.slice(0,++ci); if(ci===w.length){del=true; setTimeout(type,2200);return;}}
  else{el.textContent=w.slice(0,--ci); if(ci===0){del=false; pi=(pi+1)%PH.length;}}
  setTimeout(type,del?36:76);
}
setTimeout(type,1200);

/* ═══ REVEAL ═══ */
const obs=new IntersectionObserver(en=>{en.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target)}})},{threshold:.05});
document.querySelectorAll('.rev').forEach(el=>obs.observe(el));

/* ═══ SKILL BARS ═══ */
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
