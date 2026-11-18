(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Data ---------- */
  const FLAVORS = {
    orange: { name: 'Orange Sunrise', c1: '#ff9a1f', c2: '#ff4d0d', fruit: ['🍊', '🍋', '🍊', '🌿'], blurb: 'Orange, lemon, ginger and a hit of vitamin C.', price: 7, tag: 'Best Seller' },
    green:  { name: 'Green Machine',  c1: '#58c46a', c2: '#1b7a3a', fruit: ['🥬', '🍏', '🥒', '🍋'], blurb: 'Kale, apple, cucumber and lemon for clean focus.', price: 8 },
    berry:  { name: 'Beet Berry',     c1: '#ee3d8b', c2: '#8e1247', fruit: ['🍓', '🫐', '🍒', '🍓'], blurb: 'Beetroot, strawberry and blueberry for recovery.', price: 8 },
    variety:{ name: 'Variety 12-Pack', c1: '#ffcf33', c2: '#ff7a1a', fruit: ['🍊', '🥬', '🍓', '🍋'], blurb: 'Four of each flavor. Free shipping included.', price: 84, tag: 'Save 15%' }
  };
  const ORDER = ['orange', 'green', 'berry', 'variety'];
  const FREE_SHIP = 50;
  const money = n => '$' + n.toFixed(2);

  /* ---------- Can SVG ---------- */
  let uid = 0;
  const canSVG = key => {
    const f = FLAVORS[key], id = 'g' + (uid++);
    const label = key === 'variety' ? 'MIX' : f.name.split(' ')[0].toUpperCase();
    return `<svg class="can" viewBox="0 0 200 400" role="img" aria-label="${f.name} bottle">
      <defs>
        <linearGradient id="${id}b" x1="0" x2="1"><stop offset="0" stop-color="${f.c2}"/><stop offset=".35" stop-color="${f.c1}"/><stop offset=".7" stop-color="${f.c1}"/><stop offset="1" stop-color="${f.c2}"/></linearGradient>
        <linearGradient id="${id}m" x1="0" x2="1"><stop offset="0" stop-color="#8d8d8d"/><stop offset=".4" stop-color="#f2f2f2"/><stop offset="1" stop-color="#7d7d7d"/></linearGradient>
      </defs>
      <rect x="62" y="6" width="76" height="34" rx="8" fill="url(#${id}m)"/>
      <rect x="70" y="36" width="60" height="26" fill="url(#${id}m)"/>
      <path d="M40 80 Q40 58 70 58 H130 Q160 58 160 80 V360 Q160 392 128 392 H72 Q40 392 40 360 Z" fill="url(#${id}b)"/>
      <rect x="40" y="150" width="120" height="170" fill="rgba(255,250,240,.94)"/>
      <text x="100" y="205" text-anchor="middle" font-family="'Bricolage Grotesque',Arial,sans-serif" font-weight="800" style="font-stretch:80%" font-size="30" fill="#12100e">ZESTED.</text>
      <text x="100" y="250" text-anchor="middle" font-family="'Bricolage Grotesque',Arial,sans-serif" font-weight="800" style="font-stretch:80%" font-size="${label.length > 6 ? 22 : 30}" fill="${f.c2}">${label}</text>
      <text x="100" y="290" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" letter-spacing="2" fill="#12100e">COLD-PRESSED</text>
      <path d="M52 90 Q52 76 66 76 H72 V350 H66 Q52 350 52 336 Z" fill="rgba(255,255,255,.28)"/>
    </svg>`;
  };

  /* ---------- Render products ---------- */
  const track = $('#sliderTrack');
  track.innerHTML = [...ORDER.slice(0, 3), ...ORDER.slice(0, 3)].map(k =>
    `<article class="slide">${canSVG(k)}<h3>${FLAVORS[k].name}</h3><p>${FLAVORS[k].blurb}</p></article>`).join('');

  const burstPos = [[-95, -80, -20], [100, -60, 25], [-85, 70, 15], [95, 85, -30]];
  $('#grid').innerHTML = ORDER.map(k => {
    const f = FLAVORS[k];
    return `<article class="pcard" style="--c:${f.c1}">
      <div class="pcard__bg"></div>
      ${f.tag ? `<span class="pcard__tag">${f.tag}</span>` : ''}
      <div class="pcard__stage">
        ${canSVG(k)}
        <div class="burst" aria-hidden="true">${f.fruit.map((e, i) =>
          `<i style="--dx:${burstPos[i][0]}px;--dy:${burstPos[i][1]}px;--r:${burstPos[i][2]}deg;transition-delay:${i * 40}ms">${e}</i>`).join('')}</div>
      </div>
      <div class="pcard__body">
        <h3>${f.name}</h3>
        <p>${f.blurb}</p>
        <div class="pcard__foot"><span class="price">${money(f.price)}</span><button class="add" data-add="${k}">Add to cart</button></div>
      </div>
    </article>`;
  }).join('');

  $$('.can-hero, .hc, .tb').forEach(el => { el.innerHTML = canSVG(el.dataset.flavor); });

  /* ---------- Slider controls ---------- */
  const slider = $('#slider');
  const step = () => ($('.slide', slider)?.offsetWidth || 260) + 40;
  // Start on the 3rd slide so bottles fill both sides instead of leaving the left empty
  const centerSlider = () => {
    const s = $$('.slide', slider)[2];
    if (!s) return;
    slider.style.scrollSnapType = 'none';
    slider.scrollLeft = s.offsetLeft - (slider.clientWidth - s.offsetWidth) / 2;
    slider.style.scrollSnapType = '';
  };
  centerSlider();
  addEventListener('load', centerSlider);
  $('#next').addEventListener('click', () => slider.scrollBy({ left: step(), behavior: 'smooth' }));
  $('#prev').addEventListener('click', () => slider.scrollBy({ left: -step(), behavior: 'smooth' }));

  /* ---------- Cart ---------- */
  const cart = {};
  const drawer = $('#drawer'), scrim = $('#scrim'), linesEl = $('#lines');
  const openCart = () => { drawer.classList.add('on'); scrim.classList.add('on'); drawer.setAttribute('aria-hidden', 'false'); };
  const closeCart = () => { drawer.classList.remove('on'); scrim.classList.remove('on'); drawer.setAttribute('aria-hidden', 'true'); };

  const renderCart = () => {
    const keys = Object.keys(cart).filter(k => cart[k] > 0);
    const count = keys.reduce((a, k) => a + cart[k], 0);
    const sub = keys.reduce((a, k) => a + cart[k] * FLAVORS[k].price, 0);
    $$('[data-cart-count]').forEach(e => (e.textContent = count));
    $('#subtotal').textContent = money(sub);
    const left = Math.max(0, FREE_SHIP - sub);
    $('#shipMsg').textContent = left > 0 ? `You're ${money(left)} away from free shipping` : "You've unlocked free shipping 🎉";
    $('#shipBar').style.width = Math.min(100, (sub / FREE_SHIP) * 100) + '%';
    linesEl.innerHTML = keys.length ? keys.map(k => {
      const f = FLAVORS[k];
      return `<li class="line-item" style="--c:${f.c1}">
        <div class="thumb">${f.fruit[0]}</div>
        <div><b>${f.name}</b><small>${money(f.price)}</small>
          <div class="qty"><button data-dec="${k}" aria-label="Decrease">−</button><span>${cart[k]}</span><button data-inc="${k}" aria-label="Increase">+</button></div></div>
        <b>${money(f.price * cart[k])}</b></li>`;
    }).join('') : '<li class="empty">Your cart is empty. Go grab something fresh.</li>';
  };

  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) {
      const k = add.dataset.add;
      cart[k] = (cart[k] || 0) + 1;
      renderCart();
      const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
      add.textContent = 'Added ✓';
      setTimeout(() => (add.textContent = 'Add to cart'), 1200);
      return;
    }
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    if (inc) { cart[inc.dataset.inc]++; renderCart(); }
    if (dec) { cart[dec.dataset.dec]--; renderCart(); }
  });
  $('#cartBtn').addEventListener('click', openCart);
  $('[data-close-cart]').addEventListener('click', closeCart);
  scrim.addEventListener('click', closeCart);
  $('#checkout').addEventListener('click', () => {
    const n = Object.values(cart).reduce((a, b) => a + b, 0);
    alert(n ? 'This is a demo store, checkout is not connected.' : 'Add something to your cart first.');
  });
  renderCart();

  /* ---------- Promo modal + newsletter ---------- */
  const promo = $('#promo');
  const closePromo = () => { promo.hidden = true; try { sessionStorage.setItem('promoSeen', '1'); } catch (_) {} };
  promo.addEventListener('click', e => { if (e.target === promo || e.target.closest('[data-close]')) closePromo(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closePromo(); closeCart(); } });
  $$('[data-newsletter]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const msg = form.parentElement.querySelector('.form-msg');
      msg.textContent = 'Submission received! Check your inbox for your code.';
      form.reset();
    });
  });

  /* ---------- Animation ---------- */
  const gsapOK = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const loader = $('#loader');

  const finishLoader = () => { loader.remove(); document.body.classList.remove('locked'); };

  if (!gsapOK || reduce) {
    finishLoader();
    try { if (!sessionStorage.getItem('promoSeen')) setTimeout(() => (promo.hidden = false), 6000); } catch (_) {}
    return;
  }

  gsap.registerPlugin(ScrollTrigger, ...(typeof SplitText !== 'undefined' ? [SplitText] : []));
  const canSplit = typeof SplitText !== 'undefined';
  const splitChars = span => (canSplit ? SplitText.create(span, { type: 'chars', charsClass: 'char' }).chars : [span]);
  document.body.classList.add('locked');
  promo.hidden = true;

  // Smooth scroll
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = $(a.getAttribute('href'));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -60 }); }
    }));
  }

  // Hidden initial states
  const heroChars = $$('.hero__title .line > span').flatMap(splitChars);
  gsap.set(heroChars, { yPercent: 125, rotate: 10, transformOrigin: '0% 100%' });
  gsap.set('.hc', { scale: 0, opacity: 0 });
  gsap.set('.hero [data-fade], .hero .slider, .hero .slider__ctrl', { opacity: 0, y: 30 });
  gsap.set('.nav', { opacity: 0 });

  // Loader counter
  const counter = { v: 0 };
  const cEl = $('#loaderCount'), bEl = $('#loaderBar');
  gsap.to(counter, {
    v: 100, duration: 2.2, ease: 'power2.inOut',
    onUpdate() { const n = Math.round(counter.v); cEl.textContent = n; bEl.style.width = n + '%'; },
    onComplete() {
      gsap.timeline({ onComplete: finishLoader })
        .to(loader, { yPercent: -100, duration: 1, ease: 'power4.inOut' })
        .add(intro, '-=.5');
    }
  });

  function intro() {
    gsap.to('.nav', { opacity: 1, duration: .8, ease: 'power3.out' });
    gsap.to(heroChars, { yPercent: 0, rotate: 0, duration: 1.2, stagger: { each: .035, from: 'start' }, ease: 'power4.out' });
    gsap.to('.hc', { scale: 1, opacity: 1, duration: 1.4, stagger: .15, delay: .5, ease: 'elastic.out(1,.55)' });
    gsap.to('.hero [data-fade]', { opacity: 1, y: 0, duration: .9, stagger: .1, delay: .5, ease: 'power3.out' });
    gsap.to('.hero .slider', { opacity: 1, y: 0, duration: 1.1, delay: .7, ease: 'power3.out' });
    gsap.to('.hero .slider__ctrl', { opacity: 1, y: 0, duration: .8, delay: 1, ease: 'power3.out' });
    try { if (!sessionStorage.getItem('promoSeen')) setTimeout(() => (promo.hidden = false), 5000); } catch (_) {}
  }

  // Headline line reveals (everything outside hero)
  $$('[data-split]').forEach(h => {
    if (h.closest('.hero')) return;
    const chars = $$('.line > span', h).flatMap(splitChars);
    gsap.from(chars, {
      yPercent: 125, rotate: 10, transformOrigin: '0% 100%', duration: 1, stagger: .025, ease: 'power4.out',
      scrollTrigger: { trigger: h, start: 'top 88%', once: true }
    });
  });

  // Fade-ups
  $$('[data-fade]').forEach(el => {
    if (el.closest('.hero')) return;
    gsap.from(el, { opacity: 0, y: 40, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  // Staggered product cards & quotes
  const batchIn = (sel) => ScrollTrigger.batch(sel, {
    start: 'top 90%', once: true,
    onEnter: els => gsap.from(els, { opacity: 0, y: 40, duration: .9, stagger: .1, ease: 'power3.out', clearProps: 'transform,opacity' })
  });
  batchIn('.pcard');
  gsap.matchMedia().add('(max-width: 1000px)', () => { batchIn('.card-i'); });

  // Parallax
  $$('[data-parallax]').forEach(el => {
    gsap.to(el, {
      y: parseFloat(el.dataset.parallax) * 3, ease: 'none',
      scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  // Hero blob and slider drift
  gsap.to('.hero__blob', { yPercent: 25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__title', { yPercent: -15, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Counters
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString()) })
    });
  });

  // Marquee speeds up with scroll velocity
  const row = $('.marquee__row');
  if (row) {
    const tw = gsap.to(row, { xPercent: -50, repeat: -1, duration: 28, ease: 'none' });
    row.style.animation = 'none';
    // Pause while the cursor is over the strip, ease back to speed when it leaves
    let hover = false;
    const strip = row.closest('.marquee');
    strip.addEventListener('mouseenter', () => { hover = true; gsap.to(tw, { timeScale: 0, duration: .4, overwrite: true }); });
    strip.addEventListener('mouseleave', () => { hover = false; gsap.to(tw, { timeScale: 1, duration: .6, overwrite: true }); });
    ScrollTrigger.create({
      onUpdate: self => {
        if (hover) return;
        gsap.to(tw, { timeScale: 1 + Math.abs(self.getVelocity()) / 400, duration: .2, overwrite: true, onComplete: () => { if (!hover) gsap.to(tw, { timeScale: 1, duration: 1 }); } });
      }
    });
  }

  // Cursor-tilt on product cards
  $$('.pcard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      gsap.to($('.pcard__stage', card), { x: x * 14, y: y * 10, duration: .6, ease: 'power3.out' });
    });
    card.addEventListener('mouseleave', () => gsap.to($('.pcard__stage', card), { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.5)' }));
  });

  /* ===== Advanced layer ===== */

  // Scroll progress bar
  gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });

  // Word-by-word text fill scrubbed by scroll
  $$('[data-scrub]').forEach(p => {
    p.innerHTML = p.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
    gsap.to($$('.w', p), {
      opacity: 1, stagger: .1, ease: 'none',
      scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 40%', scrub: true }
    });
  });

  // Hero cans: scrolling fans them out and spins them, mouse adds depth parallax
  const heroCans = $$('.hc');
  const rotStart = { l: -16, r: 14, c: 8 };
  heroCans.forEach(el => {
    const k = el.classList.contains('hc--l') ? 'l' : el.classList.contains('hc--r') ? 'r' : 'c';
    gsap.set(el, { rotation: rotStart[k] });
    gsap.to(el, {
      yPercent: k === 'c' ? 160 : 90, rotation: rotStart[k] + (k === 'r' ? 70 : -70), ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  });
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const movers = heroCans.map(el => ({
      x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3.out' }),
      d: parseFloat(el.dataset.depth)
    }));
    $('.hero').addEventListener('mousemove', e => {
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      movers.forEach(m => { m.x(nx * m.d * 2); m.y(ny * m.d * 2); });
    });
  }

  // FAQ: smooth accordion
  $$('.faq details').forEach(d => {
    const s = d.querySelector('summary'), p = d.querySelector('p');
    const border = () => d.offsetHeight - d.clientHeight;
    const done = () => { gsap.set(d, { clearProps: 'height' }); ScrollTrigger.refresh(); };
    s.addEventListener('click', e => {
      e.preventDefault();
      gsap.killTweensOf([d, p]);
      if (!d.open || d.classList.contains('closing')) {
        d.classList.remove('closing');
        const from = d.open ? d.offsetHeight : s.offsetHeight + border();
        d.open = true;
        gsap.set(d, { clearProps: 'height' });
        const to = d.offsetHeight;
        gsap.fromTo(d, { height: from }, { height: to, duration: .6, ease: 'power3.out', onComplete: done });
        gsap.fromTo(p, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: .5, delay: .08, ease: 'power3.out' });
      } else {
        d.classList.add('closing');
        gsap.fromTo(d, { height: d.offsetHeight }, { height: s.offsetHeight + border(), duration: .45, ease: 'power3.inOut',
          onComplete: () => { d.open = false; d.classList.remove('closing'); done(); } });
        gsap.to(p, { opacity: 0, duration: .25 });
      }
    });
  });

  // Footer: wordmark letters rise in, back-to-top
  gsap.from(".footer__word span",{opacity:0,stagger:.08,duration:.8,ease:"power2.out",clearProps:"opacity",scrollTrigger:{trigger:".footer__word",start:"top 92%"}});
  $(".footer__up")?.addEventListener("click",e=>{e.preventDefault();lenis?lenis.scrollTo(0):scrollTo({top:0,behavior:"smooth"});});

  // Custom cursor + magnetic buttons
  const cur = $('#cursor');
  if (cur && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const cx = gsap.quickTo(cur, 'x', { duration: .25, ease: 'power3' });
    const cy = gsap.quickTo(cur, 'y', { duration: .25, ease: 'power3' });
    addEventListener('mousemove', e => { cx(e.clientX); cy(e.clientY); });
    document.addEventListener('mouseover', e => cur.classList.toggle('big', !!e.target.closest('a,button,summary,.pcard,.card-i,.slide')));
  }
  $$('[data-magnetic]').forEach(btn => {
    const mx = gsap.quickTo(btn, 'x', { duration: .6, ease: 'elastic.out(1,.4)' });
    const my = gsap.quickTo(btn, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      mx((e.clientX - r.left - r.width / 2) * .35); my((e.clientY - r.top - r.height / 2) * .5);
    });
    btn.addEventListener('mouseleave', () => { mx(0); my(0); });
  });

  // Ingredients: expand from rounded card to full-bleed, then pin and scroll cards horizontally (desktop)
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1001px)', () => {
    const sec = $('.ingredients'), cards = $('.cards', sec);
    sec.classList.add('hscroll');
    const bar = document.createElement('div');
    bar.className = 'hbar'; bar.innerHTML = '<i></i>'; sec.appendChild(bar);
    // Natural width of the card row (not the stretched/centered box), so centered cards never get nudged
    const natural = () => { const l = cards.lastElementChild; return l.offsetLeft + l.offsetWidth + parseFloat(getComputedStyle(cards).paddingRight); };
    const dist = () => Math.max(0, natural() - innerWidth + 80);
    gsap.fromTo(sec, { clipPath: 'inset(6% 4% round 60px)' }, {
      clipPath: 'inset(0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top top', scrub: true }
    });
    const tween = gsap.to(cards, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: sec, pin: true, start: 'top top', end: () => '+=' + dist(), scrub: .6, invalidateOnRefresh: true,
        onUpdate: s => gsap.set($('i', bar), { scaleX: s.progress })
      }
    });
    gsap.utils.toArray('.card-i', sec).forEach((c, i) => {
      gsap.fromTo(c, { rotate: i % 2 ? 4 : -4, y: i % 2 ? 30 : -10 }, {
        rotate: 0, y: 0, ease: 'none',
        scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 95%', end: 'left 45%', scrub: true }
      });
    });
    return () => { sec.classList.remove('hscroll'); bar.remove(); gsap.set(cards, { clearProps: 'all' }); gsap.set(sec, { clearProps: 'clipPath' }); };
  });

  // Pour: bottle tips over, juice streams into the glass and fills it as you scroll
  (() => {
    const sec = $('#pour');
    if (!sec) return;
    const move = $('#pourBottleMove'), bottle = $('#pourBottle'), bLiq = $('#pourBottleLiquid'), liquid = $('#pourLiquid'), ice = $('#pourIce');
    const s1 = $('#pourStream'), s2 = $('#pourStream2'), ripple = $('#pourRipple');
    const items = $$('.pour__list li', sec);
    const lerp = (a, b, t) => a + (b - a) * t;
    const cl = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)));
    const ease = gsap.parseEase('power2.inOut');
    const render = p => {
      const t = ease(cl(p, 0, .22)), back = ease(cl(p, .9, 1));
      const mx = lerp(412, 222, t), my = lerp(240, 152, t);
      const rot = lerp(-6, -128, t) + lerp(0, 40, back);
      move.setAttribute('transform', `translate(${mx} ${my})`);
      bottle.setAttribute('transform', `rotate(${rot}) scale(1.08)`);
      // juice inside the bottle stays level with the world: counter-rotate and drain it while pouring
      const off = lerp(-150, -30, t) + 138 * cl(p, .22, .9);
      bLiq.setAttribute('transform', `rotate(${-rot} 0 180) translate(0 ${off})`);
      const level = lerp(560, 334, cl(p, .22, .9));
      liquid.setAttribute('y', level);
      ice.setAttribute('transform', `translate(0 ${level - 330})`);
      ice.setAttribute('opacity', cl(p, .55, .75));
      const x1 = mx - 20;
      const d = `M${mx} ${my} C${mx - 10} ${my + 16} ${x1} ${my + 70} ${x1} ${level}`;
      const a = cl(p, .9, .97), seg = Math.max(0, cl(p, .2, .27) - a);
      [s1, s2].forEach((s, i) => {
        s.setAttribute('d', i ? d : d);
        s.setAttribute('stroke-dasharray', `${seg} 2`);
        s.setAttribute('stroke-dashoffset', -a);
        s.setAttribute('transform', i ? 'translate(-2 0)' : '');
        s.style.opacity = seg > .001 ? (i ? .7 : 1) : 0;
      });
      const flow = seg > .001;
      ripple.setAttribute('cx', x1);
      ripple.setAttribute('cy', level);
      ripple.setAttribute('rx', 9 + 7 * Math.abs(Math.sin(p * 90)));
      ripple.setAttribute('opacity', flow ? .8 : 0);
      items.forEach((li, i) => {
        const o = cl(p, .3 + i * .14, .42 + i * .14);
        li.style.opacity = o;
        li.style.transform = `translateY(${(1 - o) * 22}px)`;
      });
    };
    render(0);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { render(1); return; }
    const state = { p: 0 };
    const pm = gsap.matchMedia();
    pm.add('(min-width: 1001px)', () => {
      gsap.to(state, { p: 1, ease: 'none', onUpdate: () => render(state.p),
        scrollTrigger: { trigger: sec, start: 'top top', end: '+=170%', pin: true, scrub: .6 } });
    });
    pm.add('(max-width: 1000px)', () => {
      gsap.to(state, { p: 1, ease: 'none', onUpdate: () => render(state.p),
        scrollTrigger: { trigger: sec, start: 'top 65%', end: 'bottom 70%', scrub: .6 } });
    });
  })();

  // Liquid wave rising inside the subscribe block
  const subSec = $('.subscribe');
  if (subSec) {
    const wavePath = 'M0 40 Q 150 0 300 40 T 600 40 T 900 40 T 1200 40 V 200 H 0 Z';
    const w = document.createElement('div');
    w.className = 'wave'; w.setAttribute('aria-hidden', 'true');
    w.innerHTML = `<svg viewBox="0 0 1200 200" preserveAspectRatio="none"><path d="${wavePath}" fill="#ff8a3d"/></svg><svg viewBox="0 0 1200 200" preserveAspectRatio="none"><path d="${wavePath}" fill="#ffb57a"/></svg>`;
    subSec.prepend(w);
    gsap.fromTo(w, { yPercent: 100 }, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: subSec, start: 'top 90%', end: 'center center', scrub: true } });
  }

  // Recalculate positions once fonts/SplitText settle
  (document.fonts?.ready || Promise.resolve()).then(() => ScrollTrigger.refresh());

  // Nav hide on scroll down
  const nav = $('#nav'); let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: self => {
      const y = self.scroll();
      nav.classList.toggle('scrolled', y > 40);
      lastY = y;
    }
  });
})();
