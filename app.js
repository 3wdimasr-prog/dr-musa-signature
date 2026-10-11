'use strict';

function normalizeSaudiPhone(raw) {
  let value = raw.replace(/[٠-٩]/g, c => '٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[\s()+-]/g, '');
  if (value.startsWith('00966')) value = '0' + value.slice(5);
  else if (value.startsWith('966')) value = '0' + value.slice(3);
  return value;
}
function buildBookingUrl(name, phone, branch, interest) {
  const branchName = branch === 'myclinic' ? 'ماي كلينك — الحمراء' : 'الاختصاصي الطبي الأول';
  const message = `مرحبًا، أرغب في طلب موعد استشارة مع د. موسى المطيري.\nالاسم: ${name}\nالجوال: ${phone}\nالفرع: ${branchName}\nمجال الاستشارة: ${interest || 'أفضّل مناقشته مع الفريق'}\nأرجو إفادتي بالمواعيد المتاحة.\nأعلم أن الموعد يُؤكد بعد التواصل مع فريق الحجز.`;
  return 'https://api.whatsapp.com/send?phone=966501587400&text=' + encodeURIComponent(message);
}

(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const motionMedia = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motionMedia.matches;
  const shortMedia = matchMedia('(max-height: 480px)');
  const chapters = [
    {label:'أولًا / الهدف', title:'ما الذي ترغب في تغييره؟', copy:'نبدأ بما يشغلك، وما تتطلّع إليه. الاستشارة مساحة لطرح أسئلتك وتوضيح توقعاتك.', tags:['احتياجك','توقعاتك','أسئلتك']},
    {label:'ثانيًا / التقييم', title:'نفهم الحالة، قبل الخيارات.', copy:'يستمع الطبيب إلى تاريخك الصحي ويقيّم حالتك، لتحديد الخيارات التي تناسب احتياجك.', tags:['التاريخ الصحي','الفحص الطبي','ملاءمة الإجراء']},
    {label:'ثالثًا / الخيارات', title:'كل خيار له تفاصيله.', copy:'تُناقَش البدائل والمخاطر وفترة التعافي المتوقعة، لتفهم ما يترتب على الإجراء قبل اتخاذ القرار.', tags:['البدائل','المخاطر','التعافي']},
    {label:'أخيرًا / الخطة', title:'تجتمع الصورة. ويتّضح القرار.', copy:'تتّضح الخطوات وفق تقييم الطبيب، وتتخذ قرارك بعد فهم التفاصيل. البداية دائمًا باستشارة مباشرة.', tags:['خطة وفق التقييم','توقعات واقعية','قرار مدروس']}
  ];
  const services = [
    {title:'جراحات الثدي', english:'BREAST SURGERY', copy:'تشمل مجالات الممارسة تكبير وتصغير وشد الثدي، وجراحات ترميم الثدي.', tags:['تكبير الثدي','التصغير والشد','الترميم'], interest:'جراحات الثدي'},
    {title:'نحت القوام', english:'BODY CONTOURING', copy:'تشمل مجالات الممارسة شفط الدهون ونحت القوام ونقل الدهون الذاتية، وفق تقييم الحالة.', tags:['شفط الدهون','نحت القوام','الدهون الذاتية'], interest:'نحت القوام وشفط الدهون'},
    {title:'شد ترهلات الجسم', english:'BODY LIFT', copy:'تشمل مجالات الممارسة شد البطن والجسم والفخذين، مع مناقشة الخيارات المناسبة لكل حالة.', tags:['شد البطن','شد الجسم','شد الفخذين'], interest:'شد ترهلات الجسم'},
    {title:'تجميل الأنف والأذن', english:'FACIAL PLASTIC SURGERY', copy:'تشمل مجالات الممارسة جراحات تجميل الأنف وتصحيح بروز الأذن، بعد التقييم الطبي المباشر.', tags:['جراحات الأنف','تصحيح بروز الأذن','تقييم مباشر'], interest:'تجميل الأنف والأذن'},
    {title:'التثدي لدى الرجال', english:'GYNECOMASTIA', copy:'تقييم التثدي لدى الرجال ومناقشة خيارات العلاج الجراحي المناسبة للحالة.', tags:['تقييم الحالة','مناقشة الخيارات','العلاج الجراحي'], interest:'التثدي لدى الرجال'},
    {title:'التجميل غير الجراحي', english:'NON-SURGICAL AESTHETICS', copy:'تشمل مجالات الممارسة الفيلر والبوتوكس وحقن الدهون الذاتية للوجه، بحسب التقييم والاحتياج.', tags:['الفيلر','البوتوكس','الدهون الذاتية'], interest:'التجميل غير الجراحي'}
  ];
  function renderTags(element, tags) {
    element.replaceChildren(...tags.map(text => {const span=document.createElement('span');span.textContent=text;return span;}));
  }

  // Navigation stays native: no wheel/touch interception or scroll locking.
  const menuButton = $('.menu-button'), menu = $('#mobile-menu');
  function toggleMenu(open, returnFocus = false) {
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    document.body.classList.toggle('menu-open', open);
    if (open) menu.querySelector('a').focus();
    else if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => toggleMenu(menu.hidden));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', e => {
    if (menu.hidden) return;
    if (e.key === 'Escape') {toggleMenu(false, true);return;}
    if (e.key !== 'Tab') return;
    const focusable = [menuButton, ...menu.querySelectorAll('a')];
    const current = focusable.indexOf(document.activeElement);
    if (e.shiftKey && current === 0) {e.preventDefault();focusable.at(-1).focus();}
    else if (!e.shiftKey && current === focusable.length - 1) {e.preventDefault();menuButton.focus();}
  });
  matchMedia('(min-width: 901px)').addEventListener('change', e => {if(e.matches) toggleMenu(false);});

  // Reveals add motion only after content has loaded and can be observed.
  let revealObserver;
  function setupReveals() {
    if (revealObserver) revealObserver.disconnect();
    document.body.classList.remove('motion-ready');
    if (reduced || !('IntersectionObserver' in window)) return;
    revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {entry.target.classList.add('shown');revealObserver.unobserve(entry.target);}
    }), {threshold: .06});
    document.body.classList.add('motion-ready');
    $$('.reveal').forEach(el => revealObserver.observe(el));
  }
  setupReveals();

  let selectedService = 0;
  function drawServiceDiagram(index) {
    const shape = $('#service-shape');
    const paths=[];
    // Contour drawings are artistic, not measurements or outcome simulations.
    for(let i=0;i<10;i++) {
      const offset=i*7;
      if(index===0) paths.push(`M${158-offset*.35} ${79+offset*.15} Q${121-offset*.2} ${140+offset*.25} ${172-offset*.55} ${219+offset*.15} Q240 ${256-offset*.4} ${308+offset*.55} ${219+offset*.15} Q${359+offset*.2} ${140+offset*.25} ${322+offset*.35} ${79+offset*.15}`);
      else if(index===1) paths.push(`M${163-offset*.4} 50 C${174-offset*.3} 105 ${213-offset*.6} 112 ${193-offset*.3} 161 C${171-offset*.3} 215 ${166-offset*.2} 236 ${183-offset*.3} 270 M${317+offset*.4} 50 C${306+offset*.3} 105 ${267+offset*.6} 112 ${287+offset*.3} 161 C${309+offset*.3} 215 ${314+offset*.2} 236 ${297+offset*.3} 270`);
      else if(index===2) paths.push(`M${157-offset*.3} ${65+offset*.15} Q240 ${113+offset*.25} ${323+offset*.3} ${65+offset*.15} M${151-offset*.3} ${128+offset*.3} Q240 ${207+offset*.25} ${329+offset*.3} ${128+offset*.3} M${170-offset*.3} ${211+offset*.2} Q240 ${268+offset*.15} ${310+offset*.3} ${211+offset*.2}`);
      else if(index===3) paths.push(`M${218-offset*.35} ${53+offset*.2} C${255+offset*.3} 65 ${263+offset*.2} 94 ${259+offset*.15} 112 L${282+offset*.3} ${150+offset*.2} Q${287+offset*.1} 164 ${260+offset*.2} 170 L${265+offset*.2} 192 Q${274+offset*.15} 204 ${259+offset*.3} 211 Q${263+offset*.2} 244 ${217-offset*.1} ${257+offset*.15}`);
      else if(index===4) paths.push(`M${138-offset*.15} ${90+offset*.18} Q240 ${139+offset*.15} ${342+offset*.15} ${90+offset*.18} M${151-offset*.1} ${179+offset*.2} Q${192-offset*.15} ${222+offset*.2} 240 ${196+offset*.3} Q${288+offset*.15} ${222+offset*.2} ${329+offset*.1} ${179+offset*.2}`);
      else paths.push(`M${194-offset*.35} ${55+offset*.2} Q${270+offset*.25} ${33+offset*.2} ${287+offset*.25} 130 Q${308+offset*.3} 170 ${283+offset*.25} 221 Q240 ${278-offset*.15} ${197-offset*.25} 221 Q${172-offset*.3} 170 ${194-offset*.35} ${55+offset*.2}`);
    }
    const ns='http://www.w3.org/2000/svg';
    shape.replaceChildren(...paths.map((d,i) => {const path=document.createElementNS(ns,'path');path.setAttribute('d',d);path.setAttribute('opacity',String(.85-i*.065));return path;}));
  }
  function selectService(index, focus=false) {
    selectedService=index;
    const service=services[index];
    $$('[data-service]').forEach((tab,i) => {tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    $('#service-panel').setAttribute('aria-labelledby',`service-tab-${index}`);
    $('#service-title').textContent=service.title;
    $('#service-description').textContent=service.copy;
    $('#service-english').textContent=service.english;
    $('#service-number').textContent=`0${index+1} / مجال الاستشارة`;
    renderTags($('#service-tags'),service.tags);
    drawServiceDiagram(index);
    $('.service-art').classList.add('drawing');
    if(!reduced && typeof $('#service-info')?.animate === 'function') $('#service-info').animate([{opacity:.2,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:400});
    if(focus) $(`#service-tab-${index}`).focus();
  }
  $$('[data-service]').forEach((tab,index) => {
    tab.addEventListener('click',() => selectService(index));
    tab.addEventListener('keydown',e => {
      let next=index;
      if(e.key==='ArrowDown'||e.key==='ArrowRight') next=(index+1)%services.length;
      else if(e.key==='ArrowUp'||e.key==='ArrowLeft') next=(index+services.length-1)%services.length;
      else if(e.key==='Home') next=0;
      else if(e.key==='End') next=services.length-1;
      else return;
      e.preventDefault();selectService(next,true);
    });
  });
  selectService(0);
  $('#service-book').addEventListener('click',() => {$('#interest').value=services[selectedService].interest;});
  $$('[data-branch]').forEach(link => link.addEventListener('click',() => {$(`input[name="branch"][value="${link.dataset.branch}"]`).checked=true;}));

  const story=$('#journey'), scene=$('.scene'), canvas=$('#sculpture');
  let context;
  try {context=canvas.getContext('2d',{alpha:true});} catch {context=null;}
  if(context) scene.classList.add('canvas-ready');
  let width=640,height=480,progress=0,currentChapter=-1,manualChapter=0;
  const chapterButtons=$$('[data-chapter]');
  const shards=$$('[data-shard]');
  const cinemaCards=$$('.cinema-card');
  const playButton=$('#scene-play');
  let playing=false,playFrame=0;
  function easeOut(value) {return 1-Math.pow(1-clamp(value),3);}
  function renderCinema(t) {
    const photo=reduced?1:clamp((t-.09)/.36);
    const assembled=reduced?1:easeOut((t-.14)/.52);
    scene.style.setProperty('--portrait-alpha',String(photo));
    scene.dataset.progress=t.toFixed(3);
    canvas.style.opacity=String(reduced?0:1-clamp((t-.21)/.35)*.93);
    $('.bust-fallback').style.opacity=canvas.style.opacity;
    shards.forEach((shard,index) => {
      const finish=reduced?1:easeOut((t-.09-index*.027)/.52);
      const remaining=1-finish;
      const side=index-3.5;
      const x=side*39*remaining;
      const y=(index%2?1:-1)*(58+index*6)*remaining;
      const z=(80+index*20)*remaining;
      shard.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateX(${(remaining*(index%2?35:-35)).toFixed(2)}deg) rotateY(${(side*12*remaining).toFixed(2)}deg) rotateZ(${(side*3*remaining).toFixed(2)}deg)`;
      shard.style.opacity=String(.2+.8*finish);
    });
    $('.doctor-shards').style.transform=`scale(${(.83+.17*assembled).toFixed(3)}) rotateY(${(-12*(1-assembled)).toFixed(2)}deg)`;
    cinemaCards.forEach((card,index) => {
      const appearance=reduced?1:easeOut((t-[.16,.43,.69][index])/.24);
      const direction=index===1?1:-1;
      card.style.opacity=String(appearance);
      card.style.transform=`translate3d(${(direction*(1-appearance)*90).toFixed(2)}px,${((1-appearance)*45).toFixed(2)}px,0) rotate(${(direction*(1-appearance)*13).toFixed(2)}deg) scale(${(.7+.3*appearance).toFixed(3)})`;
      card.style.setProperty('--meter',String(appearance));
    });
    const rings=$$('.scene-ring');
    rings[0].style.transform=`translate(-50%,-50%) rotate(${(-65+t*140).toFixed(2)}deg) scaleY(${(.4+t*.27).toFixed(2)})`;
    rings[1].style.transform=`translate(-50%,-50%) rotate(${(65-t*125).toFixed(2)}deg) scaleY(.78)`;
    rings[2].style.transform=`translate(-50%,-50%) rotate(${(-90+t*175).toFixed(2)}deg) scaleY(.62)`;
    $('#scene-progress').style.transform=`scaleX(${t.toFixed(4)})`;
    scene.classList.add('is-ready');
  }
  function renderProgress(t) {progress=clamp(t);setChapter(Math.min(3,Math.floor(progress*4)));renderCinema(progress);drawSculpture(progress);}
  function stopPreview() {
    if(!playing) return;
    playing=false;cancelAnimationFrame(playFrame);
    scene.classList.remove('playing');
    playButton.setAttribute('aria-pressed','false');
    playButton.querySelector('i').textContent='▶';
    playButton.querySelector('span').textContent='أعد تشغيل المشهد';
  }
  function playPreview() {
    if(reduced) return;
    if(playing) {stopPreview();return;}
    playing=true;scene.classList.add('playing');
    playButton.setAttribute('aria-pressed','true');
    playButton.querySelector('i').textContent='Ⅱ';
    playButton.querySelector('span').textContent='إيقاف المشهد';
    let started;
    function tick(now) {
      if(!playing) return;
      if(started===undefined)started=now;
      const t=clamp((now-started)/10500);
      renderProgress(t);
      if(t>=1) {manualChapter=3;stopPreview();return;}
      playFrame=requestAnimationFrame(tick);
    }
    playFrame=requestAnimationFrame(tick);
  }
  playButton.addEventListener('click',playPreview);
  document.addEventListener('visibilitychange',() => {if(document.hidden)stopPreview();});
  addEventListener('wheel',stopPreview,{passive:true});
  addEventListener('touchstart',e => {if(!e.target.closest('#scene-play'))stopPreview();},{passive:true});
  function setChapter(index) {
    if(currentChapter===index) return;
    currentChapter=index;
    scene.dataset.phase=String(index);
    const chapter=chapters[index], number=`0${index+1}`;
    $('#chapter-number').textContent=number;
    $('#scene-index').textContent=number;
    $('#chapter-label').textContent=chapter.label;
    $('#chapter-title').textContent=chapter.title;
    $('#chapter-copy').textContent=chapter.copy;
    renderTags($('#chapter-tags'),chapter.tags);
    if(!reduced) {
      $('.journey-caption').classList.add('changing');
      setTimeout(() => $('.journey-caption').classList.remove('changing'),600);
    }
    chapterButtons.forEach((button,i) => {button.classList.toggle('active',i===index);button.setAttribute('aria-pressed',String(i===index));});
  }
  const manualMode=() => reduced||shortMedia.matches;
  chapterButtons.forEach((button,index) => button.addEventListener('click',() => {
    stopPreview();
    manualChapter=index;
    if(manualMode()) {renderProgress(index/3);}
    else {
      const rect=story.getBoundingClientRect();
      const distance=Math.max(1,rect.height-innerHeight);
      // Land within a chapter, never on an ambiguous section boundary.
      const point=index===3?.94:(index+.18)/4;
      window.scrollTo({top:scrollY+rect.top+distance*point,behavior:'smooth'});
    }
  }));

  // A lightweight, projected contour sculpture. It assembles as the visitor scrolls.
  // No WebGL, downloaded animation libraries, video, or perpetual animation loop.
  const mesh=[];
  function facePoint(latitude, longitude) {
    const vertical=Math.cos(latitude), ring=Math.sin(latitude);
    let x=Math.cos(longitude)*ring*90;
    let y=vertical*133-42;
    let z=Math.sin(longitude)*ring*80;
    const front=Math.max(0,Math.sin(longitude));
    const gauss=(v,center,spread)=>Math.exp(-Math.pow((v-center)/spread,2));
    z+=front*(gauss(y,-22,36)*gauss(x,0,22)*33+gauss(y,-84,24)*13-gauss(y,-56,18)*gauss(Math.abs(x),32,22)*11+gauss(y,27,17)*10);
    const taper=1-.14*gauss(y,50,40);
    return {x:x*taper,y,z};
  }
  for(let j=1;j<23;j++) {
    const line=[];for(let i=0;i<=60;i++)line.push(facePoint(Math.PI*j/24,Math.PI*2*i/60));
    mesh.push({points:line,part:0,weight:j/24});
  }
  for(let i=0;i<36;i++) {
    const line=[];for(let j=1;j<24;j++)line.push(facePoint(Math.PI*j/24,Math.PI*2*i/36));
    mesh.push({points:line,part:0,weight:i/36});
  }
  for(let j=0;j<8;j++) {
    const line=[];for(let i=0;i<=60;i++) {
      const a=Math.PI*2*i/60, radius=35+j*2;
      line.push({x:Math.cos(a)*radius,y:75+j*7,z:Math.sin(a)*radius*.82});
    }mesh.push({points:line,part:1,weight:j/8});
  }
  for(let j=0;j<15;j++) {
    const line=[];for(let i=0;i<=70;i++) {
      const a=Math.PI*2*i/70, radius=61+j*6;
      line.push({x:Math.cos(a)*radius,y:130+j*4-Math.sin(a)*13,z:Math.sin(a)*radius*.43});
    }mesh.push({points:line,part:2,weight:j/15});
  }
  function resizeCanvas() {
    const rect=canvas.getBoundingClientRect();
    width=Math.max(1,rect.width||640);height=Math.max(1,rect.height||480);
    const ratio=Math.min(devicePixelRatio||1,1.75);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    if(context) context.setTransform(ratio,0,0,ratio,0,0);
  }
  function drawSculpture(t) {
    if(!context) return;
    context.clearRect(0,0,width,height);
    const angle=-.82+t*1.24;
    const cos=Math.cos(angle),sin=Math.sin(angle);
    const scale=Math.min(width/640,height/480)*1.04;
    const cx=width*.5,cy=height*.46;
    const transform=p => {
      const xr=p.x*cos-p.z*sin, zr=p.x*sin+p.z*cos;
      const perspective=700/(700-zr);
      return {x:cx+xr*scale*perspective,y:cy+p.y*scale*perspective,z:zr};
    };
    // Line groups gradually move into place while maintaining a readable silhouette.
    for(const line of mesh) {
      const assembly=reduced?1:clamp((t-line.part*.19)*1.65+.06);
      const ease=1-Math.pow(1-assembly,3);
      const split=(1-ease)*(line.part===0?65:line.part===1?105:125);
      context.beginPath();
      let zsum=0;
      line.points.forEach((p,i) => {
        const q=transform({...p,y:p.y+(line.part===0?-split:split),x:p.x+(1-ease)*Math.sin(line.weight*20)*82});
        zsum+=q.z;
        if(i===0)context.moveTo(q.x,q.y);else context.lineTo(q.x,q.y);
      });
      const front=zsum/line.points.length;
      const alpha=(front>0?.52:.2)*(.3+.7*ease);
      context.strokeStyle=`rgba(${line.part===0?'213,180,119':'160,160,166'},${alpha})`;
      context.lineWidth=.6+(front>15?.3:0);
      context.stroke();
    }
    // A precision halo closes around the assembled sculpture in the final chapter.
    const halo=clamp((t-.48)*2);
    if(halo>0) {
      context.beginPath();context.ellipse(cx,cy+68*scale,171*scale,201*scale,.22,0,Math.PI*2*halo);
      context.strokeStyle=`rgba(213,180,119,${halo*.27})`;context.lineWidth=1;context.stroke();
    }
    // Fixed reference markers are artwork, never clinical landmark coordinates.
    const points=[{x:-43,y:-54,z:78},{x:28,y:-48,z:83},{x:0,y:30,z:86},{x:0,y:145,z:55}];
    points.slice(0,currentChapter+1).forEach(p => {
      const q=transform(p);context.beginPath();context.arc(q.x,q.y,2.6*scale,0,Math.PI*2);context.fillStyle='#d5b477';context.fill();
      context.beginPath();context.arc(q.x,q.y,9*scale,0,Math.PI*2);context.strokeStyle='#d5b47750';context.stroke();
    });
  }
  let queued=false;
  function update() {
    queued=false;
    const total=document.documentElement.scrollHeight-innerHeight;
    $('.page-progress i').style.transform=`scaleX(${total>0?clamp(scrollY/total):0})`;
    $('#header').classList.toggle('scrolled',scrollY>25);
    const r=story.getBoundingClientRect();
    if(playing)return;
    if(manualMode()) {
      progress=manualChapter/3;setChapter(manualChapter);
      if(r.bottom>0&&r.top<innerHeight){renderCinema(progress);drawSculpture(progress);}
    } else if(r.bottom>0&&r.top<innerHeight) {
      progress=clamp(-r.top/Math.max(1,r.height-innerHeight));
      setChapter(Math.min(3,Math.floor(progress*4)));
      renderCinema(progress);
      drawSculpture(progress);
    }
  }
  function schedule() {if(!queued){queued=true;requestAnimationFrame(update);}}
  addEventListener('scroll',() => {stopPreview();schedule();},{passive:true});
  addEventListener('resize',() => {resizeCanvas();schedule();},{passive:true});
  shortMedia.addEventListener('change',schedule);
  motionMedia.addEventListener('change',e => {stopPreview();reduced=e.matches;manualChapter=0;setupReveals();renderCinema(0);schedule();});
  if('ResizeObserver' in window) new ResizeObserver(() => {resizeCanvas();schedule();}).observe(canvas);
  resizeCanvas();setChapter(0);renderCinema(0);drawSculpture(0);update();
  const heroArt=$('.hero-art');
  if(matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let tiltQueued=false,tiltX=0,tiltY=0;
    heroArt.addEventListener('pointermove',e => {
      if(reduced)return;
      const r=heroArt.getBoundingClientRect();
      tiltX=(e.clientX-r.left)/Math.max(1,r.width)-.5;
      tiltY=(e.clientY-r.top)/Math.max(1,r.height)-.5;
      if(!tiltQueued){tiltQueued=true;requestAnimationFrame(() => {tiltQueued=false;heroArt.style.transform=`perspective(1300px) rotateY(${tiltX*5}deg) rotateX(${-tiltY*4}deg)`;});}
    });
    heroArt.addEventListener('pointerleave',() => {heroArt.style.transform='';});
  }
  if(document.fonts?.ready) document.fonts.ready.then(() => {resizeCanvas();schedule();});
  // Follow the active reading section without announcing every scrolling update.
  if('IntersectionObserver' in window) {
    const navObserver=new IntersectionObserver(entries => {
      entries.forEach(entry => {if(entry.isIntersecting) $$('.desktop-nav a').forEach(a => a.classList.toggle('active',a.getAttribute('href')===`#${entry.target.id}`));});
    },{rootMargin:'-15% 0px -60% 0px',threshold:0});
    ['journey','doctor','expertise','locations'].forEach(id => navObserver.observe($('#'+id)));
  }

  $('#booking-form').addEventListener('submit',e => {
    e.preventDefault();
    const name=$('#fullname').value.trim(), phone=normalizeSaudiPhone($('#mobile').value);
    const error=$('#form-error');
    $('#fullname').removeAttribute('aria-invalid');$('#mobile').removeAttribute('aria-invalid');
    if(name.length<2) {error.textContent='فضلاً اكتب اسمك.';$('#fullname').setAttribute('aria-invalid','true');$('#fullname').focus();return;}
    if(!/^05\d{8}$/.test(phone)) {error.textContent='أدخل رقم جوال سعودي صحيحًا: يبدأ بـ 05 ويتكوّن من 10 أرقام.';$('#mobile').setAttribute('aria-invalid','true');$('#mobile').focus();return;}
    error.textContent='';
    const branch=$('input[name="branch"]:checked').value;
    location.href=buildBookingUrl(name,phone,branch,$('#interest').value);
  });
  $('#year').textContent=new Date().getFullYear();
})();
