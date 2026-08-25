

document.documentElement.classList.remove('no-js');

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;


(() => {


  const items = document.querySelectorAll('.rise, [data-reveal]');
  if (!items.length) return;
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      io.unobserve(e.target);


      e.target.addEventListener('transitionend', () => e.target.classList.add('done'), { once: true });
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  items.forEach(el => io.observe(el));
})();


(() => {
  const bar = document.querySelector('.topbar');
  const sentinel = document.querySelector('#top-sentinel');
  if (!bar || !sentinel || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(
    ([e]) => bar.classList.toggle('stuck', !e.isIntersecting),
    { threshold: 0 }
  ).observe(sentinel);
})();


(() => {
  for (const host of document.querySelectorAll('.has-menu')) {
    const btn = host.querySelector('[aria-expanded]');
    const menu = host.querySelector('.menu');
    if (!btn || !menu) continue;
    let t;

    const open = (v) => {
      clearTimeout(t);
      host.dataset.open = String(v);
      btn.setAttribute('aria-expanded', String(v));
    };

    host.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') open(true); });
    host.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(t);
      t = setTimeout(() => open(false), 180);
    });
    btn.addEventListener('click', () => open(host.dataset.open !== 'true'));
    host.addEventListener('focusout', () => {
      if (!host.contains(document.activeElement)) open(false);
    });
    host.addEventListener('keydown', (e) => { if (e.key === 'Escape') { open(false); btn.focus(); } });
  }
})();


(() => {
  const drawer = document.querySelector('#drawer');
  const openBtn = document.querySelector('#burger');
  const closeBtn = document.querySelector('#drawer-close');
  if (!drawer || !openBtn) return;

  const set = (v) => {
    drawer.dataset.open = String(v);
    openBtn.setAttribute('aria-expanded', String(v));

    document.body.style.overflow = v ? 'hidden' : '';
    if (v) drawer.querySelector('a, button')?.focus();
    else openBtn.focus();
  };

  openBtn.addEventListener('click', () => set(true));
  closeBtn?.addEventListener('click', () => set(false));
  drawer.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.dataset.open === 'true') set(false); });
})();


(() => {
  const root = document.querySelector('[data-zones]');
  if (!root) return;
  const tabs = [...root.querySelectorAll('.rail button')];
  const panels = [...root.querySelectorAll('.panel')];
  if (!tabs.length || !panels.length) return;

  const list = root.querySelector('.rail ul');
  const wide = matchMedia('(min-width: 62rem)');
  let current = 0;

  list?.style.setProperty('--n', String(tabs.length));

  const paint = () => {
    if (!wide.matches) {


      panels.forEach(p => { p.hidden = false; p.removeAttribute('data-active'); });
      tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
      return;
    }


    panels.forEach((p, i) => { p.hidden = false; p.dataset.active = String(i === current); });
    tabs.forEach((t, i) => t.setAttribute('aria-selected', String(i === current)));
    list?.style.setProperty('--i', String(current));
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => { current = i; paint(); });
    tab.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      current = (i + d + tabs.length) % tabs.length;
      paint();
      tabs[current].focus();
    });
  });

  wide.addEventListener('change', paint);
  paint();
})();


(() => {
  const list = document.querySelector('[data-serve]');
  if (!list) return;
  const items = [...list.querySelectorAll('.serve-item')];
  if (!items.length) return;

  const open = (idx) => items.forEach((it, i) => {
    const on = i === idx;
    it.dataset.open = String(on);
    it.querySelector('button')?.setAttribute('aria-expanded', String(on));
  });

  items.forEach((it, i) => it.querySelector('button')?.addEventListener('click', () => {
    open(it.dataset.open === 'true' ? -1 : i);
  }));
  open(0);
})();



(() => {
  const list = document.querySelector('[data-faq]');
  if (!list) return;
  const items = [...list.querySelectorAll('.faq-item')];
  if (!items.length) return;

  const set = (idx) => items.forEach((it, i) => {
    const on = i === idx;
    it.dataset.open = String(on);
    it.querySelector('button')?.setAttribute('aria-expanded', String(on));
  });

  items.forEach((it, i) => it.querySelector('button')?.addEventListener('click', () => {
    set(it.dataset.open === 'true' ? -1 : i);
  }));
  set(0);
})();


(() => {
  const els = [...document.querySelectorAll('[data-count]')];
  if (!els.length || reduced || !('IntersectionObserver' in window)) return;

  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    if (!Number.isFinite(target)) return;
    const final = el.textContent;

    el.style.minWidth = el.getBoundingClientRect().width + 'px';
    const dur = 1100, t0 = performance.now();
    const fmt = new Intl.NumberFormat('fr-FR');
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);

      const e = 1 - Math.pow(1 - p, 3);
      if (p < 1) {
        el.textContent = fmt.format(Math.round(target * e)).replace(/ | /g, ' ');
        requestAnimationFrame(tick);
      } else {
        el.textContent = final;   // restore the exact authored string
        el.style.minWidth = '';
      }
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      setTimeout(() => run(e.target), 260);
    }
  }, { threshold: 0.6 });
  els.forEach(el => io.observe(el));
})();




(() => {
  const list = document.querySelector('[data-serve]');
  const stage = document.querySelector('[data-serve-stage]');
  if (!list || !stage) return;

  const items = [...list.querySelectorAll('.serve-item')];
  const faces = [...stage.querySelectorAll('.sv-face')];


  if (!faces.length || faces.length !== items.length) return;

  stage.dataset.stack = 'true';

  let current = -1;
  const show = (i) => {
    if (i === current) return;
    current = i;
    faces.forEach((face, n) => {
      const on = n === i;
      face.dataset.active = String(on);


      face.setAttribute('aria-hidden', String(!on));
    });
  };





  items.forEach((item, i) => item.querySelector('button')?.addEventListener('click', () => show(i)));

  const open = items.findIndex(it => it.dataset.open === 'true');
  show(open < 0 ? 0 : open);
})();


(() => {
  const root = document.querySelector('[data-jour]');
  if (!root) return;
  const track = root.querySelector('.jour-track');
  const items = [...root.querySelectorAll('.jour-item')];
  const dots = [...root.querySelectorAll('.jour-dots button')];
  const arrows = [...root.querySelectorAll('.jour-arrow')];
  if (!track || !items.length) return;

  root.dataset.slider = 'on';
  let current = 0;

  const mark = (i) => {
    if (i < 0 || i === current) return;
    current = i;
    dots.forEach((d, n) => d.setAttribute('aria-current', n === i ? 'true' : 'false'));


    panels.forEach((p, n) => { if (!p) return; if (n === i) { if (seen) p.play(); } else p.stop(); });


    if (timer) { clearInterval(timer); timer = setInterval(tick, DWELL); }
  };




  const wrap = (i) => (i + items.length) % items.length;

  const go = (i) => {
    const from = current;
    i = wrap(i);


    const left = track.scrollLeft
      + items[i].getBoundingClientRect().left - track.getBoundingClientRect().left;





    const near = Math.abs(i - from) === 1;
    track.scrollTo({ left, behavior: (reduced || !near) ? 'auto' : 'smooth' });
  };

  
  let timer = null, seen = false, taken = reduced, held = false;

  const stop = () => { clearInterval(timer); timer = null; root.dataset.auto = 'off'; };
  const tick = () => { if (!taken) go(current + 1); };
  const sync = () => {
    if (taken || !seen) { clearInterval(timer); timer = null; return; }
    if (held) { root.dataset.auto = 'paused'; clearInterval(timer); timer = null; return; }
    root.dataset.auto = 'on';



    if (panels[current]) panels[current].play();
    clearInterval(timer);
    timer = setInterval(tick, DWELL);
  };



  const take = () => { taken = true; stop(); };

  
  root.addEventListener('focusin', () => { held = true; sync(); });
  root.addEventListener('focusout', () => { held = false; sync(); });
  document.addEventListener('visibilitychange', () => { held = document.hidden; sync(); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => {
      seen = es[0].isIntersecting;
      sync();
    }, { threshold: 0.35 }).observe(root);
  }

  dots.forEach((d) => d.addEventListener('click', () => { take(); go(Number(d.dataset.go)); }));
  arrows.forEach((btn) => btn.addEventListener('click', () => { take(); go(current + Number(btn.dataset.dir)); }));
  
  
  let tx = 0, ty = 0, swiped = false;
  track.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    tx = t.clientX; ty = t.clientY; swiped = false;
  }, { passive: true });
  track.addEventListener('touchmove', (e) => {
    if (swiped) return;
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - tx);
    const dy = Math.abs(t.clientY - ty);
    if (dx > 12 && dx > dy) { swiped = true; take(); }
  }, { passive: true });
  track.addEventListener('keydown', take);
  root.querySelectorAll('.jd-switch button').forEach((b) => b.addEventListener('click', () => {
    take();
    panels.forEach((p) => p && p.stop());   // and nothing turns over on its own again
  }));

  
  const FLIP_AT = 2500;   
  const DWELL   = 8000;   

  const panels = items.map((it) => {
    const fig = it.querySelector('.jour-shot--jd');
    const btns = [...it.querySelectorAll('.jd-switch button')];
    if (!fig || !btns.length) return null;
    let timer = null;
    const set = (n) => {
      fig.dataset.flip = String(n);
      
      it.dataset.flip = String(n);
      btns.forEach((b, k) => b.setAttribute('aria-pressed', k === n ? 'true' : 'false'));
    };
    btns.forEach((b, k) => b.addEventListener('click', () => { clearTimeout(timer); set(k); }));
    return {
      play () {
        clearTimeout(timer);
        if (reduced) { set(1); return; }   // the answer, with no turn
        set(0);                            // paper first, always
        timer = setTimeout(() => set(1), FLIP_AT);
      },
      stop () { clearTimeout(timer); },
    };
  });

  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((it, n) => { it.dataset.active = 'true'; if (panels[n]) panels[n].play(); });
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) {
        const n = items.indexOf(e.target);
        e.target.dataset.active = 'true';   // stays lit: a moment already read
        mark(n);                            // does not replay its entrance
      }
    }, { root: track, threshold: 0.6 });
    items.forEach((it) => { it.dataset.active = 'false'; io.observe(it); });
  }

  current = -1;
  mark(0);
})();


(() => {
  const list = document.querySelector('[data-serve]');
  if (!list) return;
  const items = [...list.querySelectorAll('.serve-item')];
  if (!items.length) return;

  const open = (idx) => items.forEach((it, i) => {
    const on = i === idx;
    it.dataset.open = String(on);
    it.querySelector('button')?.setAttribute('aria-expanded', String(on));
  });

  items.forEach((it, i) => it.querySelector('button')?.addEventListener('click', () => {
    open(it.dataset.open === 'true' ? -1 : i);
  }));
  open(0);
})();



(() => {
  const list = document.querySelector('[data-faq]');
  if (!list) return;
  const items = [...list.querySelectorAll('.faq-item')];
  if (!items.length) return;

  const set = (idx) => items.forEach((it, i) => {
    const on = i === idx;
    it.dataset.open = String(on);
    it.querySelector('button')?.setAttribute('aria-expanded', String(on));
  });

  items.forEach((it, i) => it.querySelector('button')?.addEventListener('click', () => {
    set(it.dataset.open === 'true' ? -1 : i);
  }));
  set(0);
})();


(() => {
  const els = [...document.querySelectorAll('[data-count]')];
  if (!els.length || reduced || !('IntersectionObserver' in window)) return;

  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    if (!Number.isFinite(target)) return;
    const final = el.textContent;

    el.style.minWidth = el.getBoundingClientRect().width + 'px';
    const dur = 1100, t0 = performance.now();
    const fmt = new Intl.NumberFormat('fr-FR');
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);

      const e = 1 - Math.pow(1 - p, 3);
      if (p < 1) {
        el.textContent = fmt.format(Math.round(target * e)).replace(/ | /g, ' ');
        requestAnimationFrame(tick);
      } else {
        el.textContent = final;   // restore the exact authored string
        el.style.minWidth = '';
      }
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      setTimeout(() => run(e.target), 260);
    }
  }, { threshold: 0.6 });
  els.forEach(el => io.observe(el));
})();




(() => {
  const list = document.querySelector('[data-serve]');
  const stage = document.querySelector('[data-serve-stage]');
  if (!list || !stage) return;

  const items = [...list.querySelectorAll('.serve-item')];
  const faces = [...stage.querySelectorAll('.sv-face')];


  if (!faces.length || faces.length !== items.length) return;

  stage.dataset.stack = 'true';

  let current = -1;
  const show = (i) => {
    if (i === current) return;
    current = i;
    faces.forEach((face, n) => {
      const on = n === i;
      face.dataset.active = String(on);


      face.setAttribute('aria-hidden', String(!on));
    });
  };





  items.forEach((item, i) => item.querySelector('button')?.addEventListener('click', () => show(i)));

  const open = items.findIndex(it => it.dataset.open === 'true');
  show(open < 0 ? 0 : open);
})();


(() => {
  const items = [...document.querySelectorAll('[data-jour] .jour-item')];
  if (!items.length) return;

  const light = (it) => { it.dataset.active = 'true'; };

  if (reduced || !('IntersectionObserver' in window)) { items.forEach(light); return; }



  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { light(e.target); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -33% 0px', threshold: 0 });
  items.forEach((it) => { it.dataset.active = 'false'; io.observe(it); });
})();


(() => {
  const list = document.querySelector('[data-serve]');
  if (!list) return;
  const items = [...list.querySelectorAll('.serve-item')];
  if (!items.length) return;

  const open = (idx) => items.forEach((it, i) => {
    const on = i === idx;
    it.dataset.open = String(on);
    it.querySelector('button')?.setAttribute('aria-expanded', String(on));
  });

  items.forEach((it, i) => it.querySelector('button')?.addEventListener('click', () => {
    open(it.dataset.open === 'true' ? -1 : i);
  }));
  open(0);
})();



(() => {
  const list = document.querySelector('[data-faq]');
  if (!list) return;
  const items = [...list.querySelectorAll('.faq-item')];
  if (!items.length) return;

  const set = (idx) => items.forEach((it, i) => {
    const on = i === idx;
    it.dataset.open = String(on);
    it.querySelector('button')?.setAttribute('aria-expanded', String(on));
  });

  items.forEach((it, i) => it.querySelector('button')?.addEventListener('click', () => {
    set(it.dataset.open === 'true' ? -1 : i);
  }));
  set(0);
})();


(() => {
  const els = [...document.querySelectorAll('[data-count]')];
  if (!els.length || reduced || !('IntersectionObserver' in window)) return;

  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    if (!Number.isFinite(target)) return;
    const final = el.textContent;

    el.style.minWidth = el.getBoundingClientRect().width + 'px';
    const dur = 1100, t0 = performance.now();
    const fmt = new Intl.NumberFormat('fr-FR');
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);

      const e = 1 - Math.pow(1 - p, 3);
      if (p < 1) {
        el.textContent = fmt.format(Math.round(target * e)).replace(/ | /g, ' ');
        requestAnimationFrame(tick);
      } else {
        el.textContent = final;   // restore the exact authored string
        el.style.minWidth = '';
      }
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      setTimeout(() => run(e.target), 260);
    }
  }, { threshold: 0.6 });
  els.forEach(el => io.observe(el));
})();




(() => {
  const list = document.querySelector('[data-serve]');
  const stage = document.querySelector('[data-serve-stage]');
  if (!list || !stage) return;

  const items = [...list.querySelectorAll('.serve-item')];
  const faces = [...stage.querySelectorAll('.sv-face')];


  if (!faces.length || faces.length !== items.length) return;

  stage.dataset.stack = 'true';

  let current = -1;
  const show = (i) => {
    if (i === current) return;
    current = i;
    faces.forEach((face, n) => {
      const on = n === i;
      face.dataset.active = String(on);


      face.setAttribute('aria-hidden', String(!on));
    });
  };





  items.forEach((item, i) => item.querySelector('button')?.addEventListener('click', () => show(i)));

  const open = items.findIndex(it => it.dataset.open === 'true');
  show(open < 0 ? 0 : open);
})();


(function () {
  const chart = document.querySelector('.s5-chart');
  if (!chart) return;

  const fly = chart.querySelector('.s5-fly');
  const views = [...chart.querySelectorAll('.s5-view')];
  const t16 = chart.querySelector('.s5-t[data-t="16"]');
  const t26 = chart.querySelector('.s5-t[data-t="26"]');
  if (!fly || views.length !== 2 || !t16 || !t26) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let timer = null, alive = false, taken = false, seen = false;

  const head = chart.querySelector('.s5-chead');

  
  const park = () => {
    const c = chart.getBoundingClientRect();
    const f = fly.getBoundingClientRect();
    const floor = head ? head.getBoundingClientRect().bottom - c.top + 10 : 10;
    return { x: Math.round(c.width / 2 - f.width / 2), y: Math.round(floor) };
  };

  
  const dive = () => {
    const c = chart.getBoundingClientRect();
    const f = fly.getBoundingClientRect();
    const a = t16.getBoundingClientRect();
    const b = t26.getBoundingClientRect();
    return {
      x: Math.round((a.left + a.width / 2 + b.left + b.width / 2) / 2 - c.left - f.width / 2),
      y: Math.round(a.top + a.height / 2 - c.top - f.height / 2),
    };
  };

  const place = (p) => {
    fly.style.setProperty('--fx', p.x + 'px');
    fly.style.setProperty('--fy', p.y + 'px');
  };

  
  const body = chart.closest('.s5-body');
  const phase = (name) => {
    chart.dataset.phase = name;
    if (body) body.dataset.phase = name;
  };

  
  const wrap = body && body.querySelector('.s5-fwrap');
  const view = wrap && wrap.querySelector('.s5-open');
  const box = wrap && wrap.querySelector('.s5-lightbox');
  const prow = wrap && wrap.querySelector('.s5-f--p');

  
  const origin = () => {
    if (!view || !box || !prow) return;
    const o = view.getBoundingClientRect();
    const r = prow.getBoundingClientRect();
    if (!o.width || !r.width) return;
    
    box.style.setProperty('--ox', Math.round(r.left + r.width / 2 - o.left - box.offsetLeft) + 'px');
    box.style.setProperty('--oy', Math.round(r.top + r.height / 2 - o.top - box.offsetTop) + 'px');
  };

  const file = (state) => {
    if (!body) return;
    if (state) { origin(); body.dataset.file = state; }
    else delete body.dataset.file;
  };
  const press = (i) => views.forEach((v, k) =>
    v.setAttribute('aria-pressed', k === i ? 'true' : 'false'));

  const strike = (tooth) => {
    
    tooth.classList.remove('is-hit');
    void tooth.offsetWidth;
    tooth.classList.add('is-hit');
  };
  const settle = (tooth) => { tooth.classList.remove('is-hit'); };

  
  const SCORE = [
    [0,    () => { phase('diag'); file(''); press(0); settle(t16); settle(t26); place(park()); }],
    [1300, () => { phase('lift'); place(park()); }],        
    [1000, () => { phase('pose16'); place(dive()); strike(t16); }],  
    [340,  () => { phase('pose26'); strike(t26); }],        
    [820,  () => { settle(t16); settle(t26); phase('actes'); press(1); }],
    [1200, () => { file('pick'); }],                        
    [380,  () => { file('open'); }],                        
    [3000, () => { file(''); }],
    [760,  () => { phase('diag'); press(0); place(park()); }],
  ];

  let step = 0;
  const tick = () => {
    if (!alive || taken) return;
    const [wait, run] = SCORE[step];
    timer = setTimeout(() => {
      if (!alive || taken) return;
      run();
      step = (step + 1) % SCORE.length;
      tick();
    }, wait);
  };

  const start = () => {
    if (alive || taken || reduced.matches) return;
    alive = true; step = 0; tick();
  };
  const stop = () => { alive = false; clearTimeout(timer); };

  
  views.forEach((v, i) => v.addEventListener('click', () => {
    taken = true; stop();
    settle(t16); settle(t26); file('');
    phase(i === 1 ? 'actes' : 'diag');
    press(i);
  }));

  if (reduced.matches) { phase('actes'); press(1); return; }

  
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => {
      for (const e of es) {
        seen = e.isIntersecting;
        if (seen && !document.hidden) start(); else stop();
      }
    }, { threshold: 0.15 }).observe(chart);
  } else { seen = true; start(); }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (seen) start();
  });
  addEventListener('resize', () => { if (alive) { place(park()); origin(); } });
})();


(function () {
  const sheet = document.querySelector('.s3-sheet');
  if (!sheet) return;
  const body = sheet.querySelector('.s3-body');
  const card = sheet.querySelector('.s3-rdv');
  const field = sheet.querySelector('.s3-field');
  const list = sheet.querySelector('.s3-recs');
  if (!body || !card || !field || !list) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let timer = null, alive = false, seen = false, step = 0;

  const place = (target, dy) => {
    const b = body.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    const x = Math.round(t.left - b.left + (t.width - c.width) / 2);
    const y = Math.round(t.top - b.top + (dy === undefined ? (t.height - c.height) / 2 : dy));
    card.style.setProperty('--fx', Math.max(0, Math.min(x, b.width - c.width)) + 'px');
    card.style.setProperty('--fy', Math.max(0, y) + 'px');
  };

  const phase = (n) => { sheet.dataset.phase = n; };

  const SCORE = [
    [0,    () => { phase('rest'); place(field, 40); }],
    [1200, () => { phase('rdv'); place(field, 40); }],
    [900,  () => { phase('paid'); }],
    [1100, () => { phase('filed'); place(list, 0); }],
    [700,  () => { phase('held'); }],
    [2800, () => { phase('rest'); place(field, 40); }],
  ];

  const tick = () => {
    if (!alive) return;
    const [wait, run] = SCORE[step];
    timer = setTimeout(() => {
      if (!alive) return;
      run();
      step = (step + 1) % SCORE.length;
      tick();
    }, wait);
  };
  const start = () => { if (alive || reduced.matches) return; alive = true; step = 0; tick(); };
  const stop = () => { alive = false; clearTimeout(timer); };

  if (reduced.matches) { phase('held'); return; }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => {
      for (const e of es) {
        seen = e.isIntersecting;
        if (seen && !document.hidden) start(); else stop();
      }
    }, { threshold: 0.2 }).observe(sheet);
  } else { seen = true; start(); }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (seen) start();
  });
  addEventListener('resize', () => {
    
    const at = sheet.dataset.phase;
    if (at === 'filed' || at === 'held') place(list, 0); else place(field, 40);
  });
})();
