/* Surfing ESA: small interactions only (no frameworks). */
(function(){
  var doc = document;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lang = (doc.documentElement.lang || 'en').slice(0,2);

  /* Mobile menu */
  var toggle = doc.querySelector('.menu-toggle');
  var menu = doc.getElementById('mobile-menu');
  if (toggle && menu){
    toggle.addEventListener('click', function(){
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.hidden = open;
    });
    menu.addEventListener('click', function(e){
      if (e.target.closest('a')){ toggle.setAttribute('aria-expanded','false'); menu.hidden = true; }
    });
  }

  /* Hero: headline <-> logo cross-fade (mirrors the Figma prototype), plus optional video */
  var hero = doc.querySelector('.hero');
  if (hero){
    if (!reduce){
      setInterval(function(){ hero.classList.toggle('show-logo'); }, 4500);
    }
  }

  /* Background videos (hero + donate). Loaded only when near the screen, small file on phones,
     never on reduced-motion or data-saver. The poster image shows until the video can play. */
  var conn = navigator.connection || {};
  var videos = doc.querySelectorAll('video[data-src-lg]');
  if (videos.length && !reduce && !conn.saveData){
    var pickSrc = function(v){ return (window.innerWidth < 800 && v.dataset.srcSm) ? v.dataset.srcSm : v.dataset.srcLg; };
    var start = function(v){
      if (v.dataset.loaded) { var p0 = v.play(); if (p0 && p0.catch) p0.catch(function(){}); return; }
      v.dataset.loaded = '1';
      v.src = pickSrc(v);
      v.addEventListener('canplay', function once(){
        v.removeEventListener('canplay', once);
        var p = v.play();
        var host = v.closest('.hero, .donate');
        var ok = function(){ if (host) host.classList.add('has-video'); };
        if (p && p.then){ p.then(ok).catch(function(){}); } else { ok(); }
      });
      v.addEventListener('error', function(){ v.removeAttribute('src'); }, { once:true });
      v.load();
    };
    if ('IntersectionObserver' in window){
      var vio = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if (en.isIntersecting){ start(en.target); }
          else if (en.target.dataset.loaded){ en.target.pause(); }
        });
      }, { rootMargin: '200px 0px' });
      videos.forEach(function(v){ vio.observe(v); });
    } else {
      videos.forEach(start);
    }
  }

  /* Reveal on scroll */
  if ('IntersectionObserver' in window && !reduce){
    var targets = doc.querySelectorAll('.section-head, .price-card, .monthly, .waitlist, .stats__row, .founder__grid, .rent-row, .biz-card, .cta-band, .quote, .about__left, .about__card, .donate__inner, .faq__item, .contact__grid');
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function(t){
      var r = t.getBoundingClientRect();
      if (r.top < window.innerHeight){ return; } // already on screen: leave visible
      t.classList.add('reveal'); io.observe(t);
    });
  }

  /* Booking form -> WhatsApp message (no backend needed) */
  var form = doc.querySelector('.book-form');
  if (form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var f = form.elements;
      var lines = [form.dataset.intro || ''];
      var L = lang === 'es'
        ? { n:'Nombre', e:'Correo', p:'Teléfono' }
        : { n:'Name', e:'Email', p:'Phone' };
      if (f.name.value) lines.push(L.n + ': ' + f.name.value);
      if (f.email.value) lines.push(L.e + ': ' + f.email.value);
      if (f.phone.value) lines.push(L.p + ': ' + f.phone.value);
      var url = 'https://wa.me/' + form.dataset.wa + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');
    });
  }

  /* Waitlist form -> pre-filled email (no backend needed) */
  var wl = doc.querySelector('.waitlist__form');
  if (wl){
    wl.addEventListener('submit', function(e){
      e.preventDefault();
      var email = wl.elements.email.value;
      var body = (lang === 'es' ? 'Por favor agréguenme a la lista de espera de Vela y Remo: ' : 'Please add me to the Sailing & Rowing waitlist: ') + email;
      window.location.href = 'mailto:' + wl.dataset.mailto + '?subject=' + encodeURIComponent(wl.dataset.subject) + '&body=' + encodeURIComponent(body);
    });
  }
})();
