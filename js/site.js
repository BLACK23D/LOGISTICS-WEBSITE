// Shared site JS: counters, fade-ins, particles, leaflet map init, forms, cookie, chat
document.addEventListener('DOMContentLoaded',()=>{
  // counters with animation
  document.querySelectorAll('.counter').forEach(el=>{
    const target = parseInt(el.getAttribute('data-target'))||0; 
    let cur=0; 
    const step=Math.max(1,Math.floor(target/100));
    const id=setInterval(()=>{ 
      if(cur>=target){ 
        clearInterval(id); 
        el.textContent = target + (el.textContent.includes('+')?'+':''); 
        el.style.animation = 'pulse 0.5s ease-out';
      } else { 
        cur+=step; 
        el.textContent = cur + (el===el?'+':''); 
      } 
    },18);
  });
  
  // fade-in with intersection observer
  const io = new IntersectionObserver((entries)=>{ 
    entries.forEach(e=>{ 
      if(e.isIntersecting){ 
        e.target.classList.add('visible'); 
        io.unobserve(e.target); 
      } 
    }); 
  }, {threshold:.15});
  document.querySelectorAll('.fade-in').forEach(el=>io.observe(el));
  
  // smooth anchors with smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a=>{ 
    a.addEventListener('click', (ev)=>{ 
      const href=a.getAttribute('href'); 
      if(href.length>1){ 
        ev.preventDefault(); 
        const id=href.slice(1); 
        const el=document.getElementById(id); 
        if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); 
      } 
    }); 
  });
  
  // cookie banner
  const cb = localStorage.getItem('qaher_cookie_consent'); 
  const banner=document.getElementById('cookieBanner'); 
  if(!cb && banner) banner.style.display='flex';
  
  // live chat modal initialization
  const chatModalEl=document.getElementById('chatModal'); 
  if(chatModalEl) window._chatModal = new bootstrap.Modal(chatModalEl);
  
  // top button with scroll
  const topBtn = document.getElementById('topBtn'); 
  window.addEventListener('scroll',()=>{ 
    if(window.scrollY>300) {
      if(topBtn.style.display==='none') topBtn.style.display='flex';
    } else {
      topBtn.style.display='none'; 
    }
  });
  
  // navbar scrolled effect with smooth transition
  const navbar = document.querySelector('.navbar'); 
  let lastScrollY = 0;
  window.addEventListener('scroll',()=>{ 
    if(window.scrollY>50) {
      navbar.classList.add('scrolled'); 
    } else {
      navbar.classList.remove('scrolled'); 
    }
    lastScrollY = window.scrollY;
  });
  
  // init leaflet if map exists
  if(document.getElementById('officeMap') && window.L){ 
    try{ 
      const map = L.map('officeMap',{scrollWheelZoom:false}).setView([6.5244,3.3792],2); 
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap contributors'}).addTo(map); 
      const offices=[
        {name:'Lagos (HQ)',coords:[6.5244,3.3792],info:'HQ: Lagos, Nigeria'},
        {name:'Shanghai',coords:[31.2304,121.4737],info:'Shanghai Hub'},
        {name:'Dubai',coords:[25.2048,55.2708],info:'Dubai Office'},
        {name:'Nairobi',coords:[-1.286389,36.817223],info:'Nairobi Office'},
        {name:'São Paulo',coords:[-23.55052,-46.633308],info:'São Paulo Office'}
      ]; 
      offices.forEach((o,idx)=>{ 
        const m=L.circleMarker(o.coords,{radius:7,color:'#00D9FF',fillColor:'#00D9FF',fillOpacity:0.9}).addTo(map); 
        m.bindPopup(`<strong>${o.name}</strong><br>${o.info}`); 
        setTimeout(()=>m.setStyle({color:'#3B82F6',fillColor:'#3B82F6'}),idx*200);
      }); 
    }catch(e){console.warn('map init failed',e);} 
  }
  
  // tsParticles init
  if(window.tsParticles && document.getElementById('tsparticles')){
    tsParticles.load('tsparticles',{
      fpsLimit:60,
      particles:{
        number:{value:40,density:{enable:true,area:800}},
        color:{value:'#00D9FF'},
        shape:{type:'circle'},
        opacity:{value:0.06},
        size:{value:{min:1,max:3}},
        move:{enable:true,speed:0.6,outModes:{default:'out'}},
        links:{enable:true,distance:140,color:'#00D9FF',opacity:0.03,width:1}
      },
      interactivity:{detectsOn:'canvas',events:{onHover:{enable:false},onClick:{enable:false}}},
      detectRetina:true
    }).catch(()=>{});
  }
  
  // parallax effect on scroll
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if(parallaxElements.length > 0) {
    window.addEventListener('scroll', () => {
      parallaxElements.forEach(el => {
        const scrollPos = window.scrollY;
        const offset = el.getAttribute('data-parallax') || 0.5;
        el.style.transform = `translateY(${scrollPos * offset}px)`;
      });
    });
  }
});

// Form handlers
function submitContact(e){ 
  if(e) e.preventDefault(); 
  const form=document.getElementById('contactForm'); 
  if(form){ 
    form.reset(); 
    const s=document.getElementById('contactSuccess'); 
    if(s){ 
      s.style.display='block'; 
      s.style.animation = 'slideUp 0.4s ease-out';
      setTimeout(()=>s.style.display='none',4000); 
    } 
  } 
}

function calculateQuote(e){ 
  if(e) e.preventDefault(); 
  const weight=Number(document.getElementById('weight').value)||0;
  const qty=Number(document.getElementById('quantity').value)||1;
  const service=document.getElementById('serviceSel').value;
  const handling=document.getElementById('handling').value;
  const speed=document.getElementById('speedPref').value;
  
  const base={'Air Freight':12,'Sea Freight':3,'Land Freight':5}; 
  const baseRate = (base[service]||5) * weight;
  let handlingFee = 50;
  if(handling==='Hazmat') handlingFee = 150;
  if(handling==='Temperature Controlled') handlingFee = 100;
  
  let speedMult = 1;
  if(speed==='Express') speedMult = 1.3;
  if(speed==='Economy') speedMult = 0.8;
  
  const subtotal = (baseRate + handlingFee) * speedMult * qty;
  const taxes = Math.round(subtotal * 0.1);
  const total = subtotal + taxes;
  
  document.getElementById('qService').textContent=service; 
  document.getElementById('qWeight').textContent=weight+' kg'; 
  document.getElementById('qBase').textContent='$'+Math.round(baseRate).toLocaleString();
  document.getElementById('qHandling').textContent='$'+Math.round(handlingFee).toLocaleString();
  document.getElementById('qTaxes').textContent='$'+taxes.toLocaleString();
  document.getElementById('qCost').textContent = '$'+total.toLocaleString();
  
  // add animation to results
  const results = ['qBase', 'qHandling', 'qTaxes', 'qCost'];
  results.forEach((id,i) => {
    const el = document.getElementById(id);
    if(el) {
      el.style.animation = 'none';
      setTimeout(() => {
        el.style.animation = 'slideUp 0.3s ease-out';
      }, i * 50);
    }
  });
  
  let eta=''; 
  if(service==='Air Freight') eta='2-4 days'; 
  if(service==='Sea Freight') eta='14-30 days'; 
  if(service==='Land Freight') eta='3-10 days'; 
  document.getElementById('qETA').textContent=eta; 
}

function resetQuote(){ 
  const form=document.getElementById('quoteForm'); 
  if(form) form.reset(); 
  document.getElementById('qCost').textContent='$0.00'; 
  document.getElementById('qBase').textContent='$0'; 
  document.getElementById('qHandling').textContent='$0'; 
  document.getElementById('qTaxes').textContent='$0'; 
}

function requestFullQuote(){ 
  alert('Quote request sent! Our sales team will contact you within 24 hours.'); 
}

function downloadEstimate(){ 
  alert('Estimate downloaded as PDF.'); 
}

function doTrack(){ 
  const v=document.getElementById('trackInput').value.trim(); 
  if(!v){ 
    alert('Enter tracking number or use demo'); 
    return;
  } 
  showTracking(v); 
}

function useDemo(){ 
  document.getElementById('trackInput').value='QHL-2024-12345'; 
  showTracking('QHL-2024-12345'); 
}

function showTracking(tn){ 
  const result=document.getElementById('trackResult'); 
  if(result) {
    result.style.display='block'; 
    result.style.animation = 'slideUp 0.4s ease-out';
  }
  const tnEl=document.getElementById('tn'); 
  if(tnEl) tnEl.textContent=tn; 
  ['s1','s2','s3','s4'].forEach((id,i)=>{ 
    const el=document.getElementById(id); 
    if(!el) return; 
    el.classList.remove('active'); 
    setTimeout(()=>{ 
      el.classList.add('active'); 
      el.style.animation = 'popIn 0.5s ease-out';
    }, i*500); 
  }); 
}

function downloadDocs(){ 
  alert('Documents prepared for download.'); 
}

function acceptCookies(){ 
  localStorage.setItem('qaher_cookie_consent','accepted'); 
  const b=document.getElementById('cookieBanner'); 
  if(b) {
    b.style.animation = 'slideInLeft 0.3s ease-out reverse';
    setTimeout(() => b.style.display='none', 300);
  }
}

function rejectCookies(){ 
  localStorage.setItem('qaher_cookie_consent','rejected'); 
  const b=document.getElementById('cookieBanner'); 
  if(b) {
    b.style.animation = 'slideInLeft 0.3s ease-out reverse';
    setTimeout(() => b.style.display='none', 300);
  }
}

function openChat(){ 
  if(window._chatModal) {
    window._chatModal.show();
    // add animation class to modal
    const modal = document.getElementById('chatModal');
    if(modal) {
      modal.style.animation = 'popIn 0.3s ease-out';
    }
  } else {
    alert('Chat offline. Use the contact form.'); 
  }
}

function scrollToTop(){ 
  window.scrollTo({top:0,behavior:'smooth'}); 
}