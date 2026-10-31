'use strict';
(() => {
  const stage=document.querySelector('.cinema-stage');
  const canvas=document.querySelector('#cinema-canvas');
  if(!stage||!canvas)return;
  const context=canvas.getContext('2d',{alpha:false});
  const shots=[...document.querySelectorAll('[data-shot]')];
  const controls=[...document.querySelectorAll('[data-shot-control]')];
  const play=document.querySelector('#play-sequence');
  const pause=document.querySelector('#pause-motion');
  const compare=document.querySelector('#compare-marks');
  const status=document.querySelector('#cinema-status');
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const letters='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const stars=Array.from({length:130},(_,i)=>({x:((i*73+17)%997)/997,y:((i*137+41)%991)/991,r:.45+(i%4)*.24}));
  let shot=0,previous=0,motion=!media.matches,playing=false,comparison=false;
  let frame=0,timer=0,lastDraw=0,clock=0,transitionStart=-1,width=1,height=1,pixelRatio=1;
  const stroke='#8cad8d',light='#d3ee85';
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  function line(x1,y1,x2,y2,color=stroke,thickness=1){context.strokeStyle=color;context.lineWidth=thickness;context.beginPath();context.moveTo(x1,y1);context.lineTo(x2,y2);context.stroke();}
  function ellipse(x,y,rx,ry,rotation,color=stroke,thickness=1){context.strokeStyle=color;context.lineWidth=thickness;context.beginPath();context.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);context.stroke();}
  function atmosphere(t){
    const g=context.createRadialGradient(1120,350,10,1050,360,780);g.addColorStop(0,'#416950');g.addColorStop(.38,'#153c37');g.addColorStop(1,'#071b20');context.fillStyle=g;context.fillRect(0,0,1600,900);
    for(const s of stars){context.globalAlpha=.25+.35*(.5+.5*Math.sin(t*.16+s.x*10));context.fillStyle='#d9e4d4';context.beginPath();context.arc(s.x*1600,s.y*780,s.r,0,Math.PI*2);context.fill();}context.globalAlpha=1;
    const fog=context.createLinearGradient(0,550,0,900);fog.addColorStop(0,'#071b2000');fog.addColorStop(.7,'#48664e4d');fog.addColorStop(1,'#0a252b');context.fillStyle=fog;context.fillRect(0,550,1600,350);
  }
  function chance(t){
    context.save();const push=1.015+.016*Math.sin(t*.07);context.translate(1000,475);context.scale(push,push);context.translate(-1000,-475);
    ellipse(1090,385,300,300,0,'#8cae8b52',1);ellipse(1090,385,330,57,-.35,'#c2dbad70',1);
    for(let row=10;row>=0;row--){const z=row+1.8,unit=410/z,y=480+620/z,kh=140/z;for(let col=-6;col<=6;col++){const x=1060+col*unit;const glow=row===2&&col===1;context.fillStyle=glow?'#66835d':'#102e32';context.strokeStyle=glow?light:'#547b69';context.lineWidth=glow?1.8:.8;context.beginPath();context.moveTo(x-unit*.4,y);context.lineTo(x+unit*.4,y);context.lineTo(x+unit*.44,y+kh);context.lineTo(x-unit*.44,y+kh);context.closePath();context.fill();context.stroke();if(row<7){context.fillStyle=glow?'#eff8dc':'#9ab79b';context.font=(clamp(67/z,8,29))+'px Georgia';context.textAlign='center';context.fillText(glow?'g':letters[(row*19+col*7+110)%letters.length],x,y+kh*.7);}}}
    context.restore();
  }
  function patience(t){
    context.save();context.translate(24*Math.sin(t*.05),5*Math.cos(t*.07));
    const glow=context.createRadialGradient(1160,320,20,1160,320,260);glow.addColorStop(0,'#bdd28b66');glow.addColorStop(.7,'#537c5d22');glow.addColorStop(1,'#537c5d00');context.fillStyle=glow;context.fillRect(850,50,620,620);
    ellipse(1140,365,250,250,0,'#bfd4a963',1.5);ellipse(1110,428,385,75,-.35,'#a5c08d87',1.2);ellipse(1110,428,385,75,.55,'#658c7352',.8);
    context.fillStyle='#0a20288c';context.strokeStyle='#bad0a7';context.lineWidth=1.8;context.beginPath();context.moveTo(980,145);context.lineTo(1260,145);context.bezierCurveTo(1250,290,1160,345,1120,405);context.bezierCurveTo(1160,465,1250,520,1260,670);context.lineTo(980,670);context.bezierCurveTo(990,520,1080,465,1120,405);context.bezierCurveTo(1080,345,990,290,980,145);context.fill();context.stroke();
    line(960,136,1280,136,light,2);line(960,680,1280,680,light,2);line(972,143,972,672,'#527b69',2);line(1268,143,1268,672,'#527b69',2);
    context.fillStyle='#b4c47a9c';context.beginPath();context.moveTo(1020,222);context.lineTo(1220,222);context.lineTo(1120,395);context.closePath();context.fill();context.beginPath();context.moveTo(1007,648);context.lineTo(1233,648);context.lineTo(1120,525);context.closePath();context.fill();
    for(let i=0;i<45;i++){const y=410+((i*31+t*26)%122);context.fillStyle=i%3===0?'#e4efb2':'#a3bd89';context.fillRect(1118+Math.sin(i*9)*2,y,1.5,2.2);}
    for(let i=0;i<10;i++)line(780+i*70,790,800+i*70,900,'#54725d35',1);context.restore();
  }
  function checking(t){
    context.save();context.translate(18*Math.sin(t*.06),0);ellipse(1130,390,330,330,0,'#a7c09745',1);ellipse(1130,390,266,266,0,'#a7c09765',1);
    const x=916,y=205,size=210;for(let i=0;i<2;i++){const xx=x+i*247;context.fillStyle='#193b3a';context.strokeStyle=comparison&&i===1?light:'#98b592';context.lineWidth=comparison&&i===1?2.5:1.2;context.fillRect(xx,y,size,270);context.strokeRect(xx,y,size,270);context.fillStyle=i===1&&comparison?'#e3f2b7':'#c0d3b1';context.font='170px Georgia';context.textAlign='center';context.fillText(i===0?'g':'G',xx+size/2,y+201);context.font='11px monospace';context.fillStyle='#a4bea4';context.fillText(i===0?'ONE MARK':'ANOTHER MARK',xx+size/2,y+244);}
    const scan=225+((t*17)%245);line(885,scan,1395,scan,comparison?'#d3ee858c':'#9fbd8565',1);line(900,520,1370,520,'#90af8d',1);for(let i=0;i<=20;i++)line(900+i*23.5,514,900+i*23.5,i%5?526:534,'#90af8d',1);
    if(comparison){context.fillStyle='#d3ee85';context.font='13px monospace';context.textAlign='center';context.fillText('SIMILAR IS NOT IDENTICAL',1130,580);}context.restore();
  }
  const drawShots=[chance,patience,checking];
  function render(now){
    if(!context)return;
    context.setTransform(pixelRatio,0,0,pixelRatio,0,0);context.fillStyle='#071b20';context.fillRect(0,0,width,height);
    const scale=Math.max(width/1600,height/900);const x=width<600?width-1600*scale*.72:(width-1600*scale)/2;
    context.translate(x,(height-900*scale)/2);context.scale(scale,scale);atmosphere(clock);
    if(transitionStart>=0){const p=clamp((now-transitionStart)/900,0,1),e=p*p*(3-2*p);context.globalAlpha=1-e;drawShots[previous](clock);context.globalAlpha=e;drawShots[shot](clock);context.globalAlpha=1;if(p===1)transitionStart=-1;}else drawShots[shot](clock);
    stage.classList.add('canvas-ready');
  }
  function tick(now){frame=0;if(document.hidden)return;if(now-lastDraw>=32){if(lastDraw&&motion)clock+=Math.min(now-lastDraw,100)/1000;lastDraw=now;render(now);}if(motion||transitionStart>=0)frame=requestAnimationFrame(tick);}
  function schedule(){if(context&&!frame&&!document.hidden&&(motion||transitionStart>=0))frame=requestAnimationFrame(tick);}
  function sequenceTimer(){clearTimeout(timer);if(playing&&!document.hidden)timer=setTimeout(()=>setShot((shot+1)%3),12000);}
  function setShot(value){previous=shot;shot=clamp(value,0,2);comparison=false;compare.textContent='Compare the marks';transitionStart=motion&&!media.matches&&previous!==shot?performance.now():-1;shots.forEach((el,i)=>el.hidden=i!==shot);controls.forEach((el,i)=>el.setAttribute('aria-pressed',String(i===shot)));status.textContent='Shot '+(shot+1)+' of 3 · '+(playing?'sequence playing; pause whenever you wish.':'choose your own pace.');resize();sequenceTimer();}
  function stopSequence(){playing=false;play.textContent='Play the sequence';clearTimeout(timer);}
  function setMotion(value){motion=value;pause.textContent=motion?'Pause motion':'Enable gentle motion';stage.dataset.motion=motion?'running':'still';if(!motion){stopSequence();transitionStart=-1;cancelAnimationFrame(frame);frame=0;render(performance.now());status.textContent='Shot '+(shot+1)+' of 3 · still frame.';}else{lastDraw=0;schedule();}}
  function resize(){width=stage.clientWidth;height=stage.clientHeight;pixelRatio=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*pixelRatio);canvas.height=Math.round(height*pixelRatio);render(performance.now());schedule();}
  controls.forEach((el,i)=>{el.disabled=false;el.addEventListener('click',()=>{stopSequence();setShot(i);});});
  document.querySelector('.cinema-navigation').addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey)return;const keys={ArrowLeft:Math.max(0,shot-1),ArrowRight:Math.min(2,shot+1),Home:0,End:2};if(Object.prototype.hasOwnProperty.call(keys,event.key)){event.preventDefault();stopSequence();setShot(keys[event.key]);controls[shot].focus();}});
  play.disabled=false;pause.disabled=!context;compare.disabled=false;
  if(!context)motion=false;
  play.addEventListener('click',()=>{playing=!playing;play.textContent=playing?'Pause sequence':'Play the sequence';status.textContent='Shot '+(shot+1)+' of 3 · '+(playing?'sequence playing; pause whenever you wish.':'choose your own pace.');sequenceTimer();});
  pause.addEventListener('click',()=>setMotion(!motion));
  compare.addEventListener('click',()=>{comparison=!comparison;compare.textContent=comparison?'Hide comparison':'Compare the marks';status.textContent=comparison?'Two signs: lowercase g and uppercase G. Similar is not identical.':'Shot 3 of 3 · choose your own pace.';render(performance.now());});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;clearTimeout(timer);}else{lastDraw=0;schedule();sequenceTimer();}});
  media.addEventListener('change',()=>setMotion(!media.matches));
  window.addEventListener('resize',resize);
  stage.classList.add('cinema-ready');setMotion(motion);setShot(0);resize();
})();
