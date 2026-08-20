const button=document.querySelector('.menu-button');
const nav=document.querySelector('.main-nav');
if(button&&nav){
  button.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    button.setAttribute('aria-expanded',String(open));
  });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    nav.classList.remove('open');
    button.setAttribute('aria-expanded','false');
  }));
}

const year=document.getElementById('year');
if(year) year.textContent=new Date().getFullYear();

document.querySelectorAll('[data-copy]').forEach(btn=>btn.addEventListener('click',async()=>{
  try{
    await navigator.clipboard.writeText(btn.dataset.copy);
    btn.textContent='הטקסט הועתק';
  }catch(e){
    btn.textContent='לא ניתן להעתיק אוטומטית';
  }
}));

/* V90 — restrained scrollytelling enhancement. Progressive enhancement only:
   without JavaScript, all content remains fully visible and usable. */
(()=>{
  const main=document.querySelector('main');
  if(!main) return;

  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('scrollytelling-enabled');

  const progress=document.createElement('div');
  progress.className='story-progress';
  progress.setAttribute('aria-hidden','true');
  progress.innerHTML='<span class="story-progress-bar"></span>';
  document.body.appendChild(progress);
  const progressBar=progress.firstElementChild;

  const scenes=Array.from(main.children).filter(el=>el.tagName==='SECTION');
  scenes.forEach((scene,index)=>{
    scene.classList.add('story-scene');
    scene.style.setProperty('--story-scene-index',index);

    Array.from(scene.children).forEach(child=>{
      if(child.classList && child.classList.contains('shell')) child.classList.add('story-reveal');
    });
  });

  const itemSelector=[
    '.cards > article',
    '.cards > a',
    '.expertise-grid-elegant > article',
    '.therapy-process-row',
    '.assessment-process-row',
    '.professionals-process-row',
    '.academia-teaching-row',
    '.academia-role-card',
    '.media-research-card',
    '.media-public-card',
    '.media-timeline article',
    '.contact-idea-two-action',
    '.footer-message-box',
    '.teams-support-card'
  ].join(',');

  const storyItems=Array.from(document.querySelectorAll(itemSelector));
  storyItems.forEach((item,index)=>{
    item.classList.add('story-item');
    item.style.setProperty('--story-delay',`${Math.min(index%5,4)*70}ms`);
  });

  let rail=null;
  let dots=[];
  if(scenes.length>=3){
    rail=document.createElement('div');
    rail.className='story-rail';
    rail.setAttribute('aria-hidden','true');
    scenes.forEach(()=>{
      const dot=document.createElement('span');
      dot.className='story-rail-dot';
      rail.appendChild(dot);
      dots.push(dot);
    });
    document.body.appendChild(rail);
  }

  const setActiveScene=index=>{
    scenes.forEach((scene,i)=>scene.classList.toggle('is-story-active',i===index));
    dots.forEach((dot,i)=>dot.classList.toggle('is-active',i===index));
  };

  if(reduceMotion){
    document.documentElement.classList.add('story-reduced-motion');
    document.querySelectorAll('.story-reveal,.story-item').forEach(el=>el.classList.add('is-visible'));
  }else if('IntersectionObserver' in window){
    const revealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },{root:null,rootMargin:'0px 0px -12% 0px',threshold:0.08});

    document.querySelectorAll('.story-reveal,.story-item').forEach(el=>revealObserver.observe(el));

    const ratios=new Map();
    const sceneObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>ratios.set(entry.target,entry.intersectionRatio));
      let activeIndex=0;
      let best=-1;
      scenes.forEach((scene,index)=>{
        const ratio=ratios.get(scene)||0;
        if(ratio>best){best=ratio;activeIndex=index;}
      });
      setActiveScene(activeIndex);
    },{root:null,rootMargin:'-18% 0px -42% 0px',threshold:[0,0.08,0.18,0.32,0.5,0.7]});
    scenes.forEach(scene=>sceneObserver.observe(scene));
  }else{
    document.querySelectorAll('.story-reveal,.story-item').forEach(el=>el.classList.add('is-visible'));
  }

  const updateProgress=()=>{
    const max=document.documentElement.scrollHeight-window.innerHeight;
    const ratio=max>0?Math.min(Math.max(window.scrollY/max,0),1):0;
    progressBar.style.transform=`scaleX(${ratio})`;

    if(!('IntersectionObserver' in window)){
      const marker=window.scrollY+window.innerHeight*0.42;
      let activeIndex=0;
      scenes.forEach((scene,index)=>{ if(scene.offsetTop<=marker) activeIndex=index; });
      setActiveScene(activeIndex);
    }
  };

  let ticking=false;
  const onScroll=()=>{
    if(ticking) return;
    ticking=true;
    requestAnimationFrame(()=>{
      updateProgress();
      ticking=false;
    });
  };

  updateProgress();
  setActiveScene(0);
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
})();
