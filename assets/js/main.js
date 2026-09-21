/* =====================================================================
   ECOPRINT — main.js
   Vanilla, zero dependências. Tudo degrada com graça.
   ===================================================================== */
(() => {
  'use strict';

  /* ---------------------------------------------------------------
     CONFIG — ajuste rápido
     --------------------------------------------------------------- */
  const CONFIG = {
    // Número usado no botão flutuante e no envio do formulário.
    // TODO: trocar pelo WhatsApp comercial (formato 55 + DDD + número).
    whatsapp: '558835715027',
    email: 'atendimento@ecoprint.com.br'
  };

  /* ---------------------------------------------------------------
     GALERIAS DOS SERVIÇOS
     ---------------------------------------------------------------
     É AQUI que você troca as fotos. Cada serviço tem uma lista.

     - A PRIMEIRA foto da lista é a que flutua junto do cursor.
     - Todas elas aparecem no visualizador quando o item é clicado.
     - Pode ter quantas quiser por serviço (1, 5, 20...).
     - `alt` descreve a foto para leitores de tela e para o Google.

     Caminho é relativo ao index.html. Sugestão: jogue os arquivos em
     assets/img/servicos/ e referencie como 'assets/img/servicos/nome.jpg'.

     --------------------------------------------------------------- */
  const GALERIAS = {
    'embalagens': [
      { src: 'assets/img/servicos/embalagens-01.jpg', alt: 'Caixa personalizada para lanche, impressa e vincada sob medida' },
      { src: 'assets/img/servicos/embalagens-02.jpg', alt: 'Sacolas personalizadas com alça de fita para varejo' },
      { src: 'assets/img/servicos/embalagens-03.jpg', alt: 'Embalagem de batata frita personalizada para food service' },
      { src: 'assets/img/servicos/embalagens-04.jpg', alt: 'Cartucho farmacêutico personalizado para medicamento genérico' }
    ],
    'flexografia': [
      { src: 'assets/img/servicos/flexografia-01.jpg', alt: 'Rótulo impresso em flexografia, em bobina, para linha de envase' },
      { src: 'assets/img/servicos/flexografia-02.jpg', alt: 'Rolos de etiquetas autoadesivas impressas em flexografia' },
      { src: 'assets/img/servicos/flexografia-03.jpg', alt: 'Rótulo de solução hospitalar aplicado em frasco' }
    ],
    'promocional': [
      { src: 'assets/img/servicos/promocional-01.jpg', alt: 'Encartes e tabloides promocionais impressos em offset' },
      { src: 'assets/img/servicos/promocional-02.jpg', alt: 'Folders e cardápios impressos em alta tiragem' },
      { src: 'assets/img/servicos/promocional-03.jpg', alt: 'Caderno personalizado com espiral e acabamento especial' },
      { src: 'assets/img/servicos/promocional-04.jpg', alt: 'Calendário de mesa personalizado' }
    ],
    'comunicacao-visual': [
      { src: 'assets/img/servicos/comunicacao-visual-01.jpg', alt: 'Outdoor de lançamento imobiliário instalado' },
      { src: 'assets/img/servicos/comunicacao-visual-02.jpg', alt: 'Veículo utilitário com envelopamento personalizado' },
      { src: 'assets/img/servicos/comunicacao-visual-03.jpg', alt: 'Carreta com adesivagem completa do baú' },
      { src: 'assets/img/servicos/comunicacao-visual-04.jpg', alt: 'Fachada e frota de veículos adesivadas para o cliente' },
      { src: 'assets/img/servicos/comunicacao-visual-05.jpg', alt: 'Ambientação de parede com adesivo decorativo temático' },
      { src: 'assets/img/servicos/comunicacao-visual-06.jpg', alt: 'Frota personalizada pronta para entrega na sede da Ecoprint' }
    ],
    'pequenas-tiragens': [
      { src: 'assets/img/servicos/pequenas-tiragens-01.jpg', alt: 'Caixas personalizadas para padaria artesanal' },
      { src: 'assets/img/servicos/pequenas-tiragens-02.jpg', alt: 'Folder institucional de empreendimento imobiliário' },
      { src: 'assets/img/servicos/pequenas-tiragens-03.jpg', alt: 'Caixas rígidas personalizadas com estampa floral' },
      { src: 'assets/img/servicos/pequenas-tiragens-04.jpg', alt: 'Display de balcão personalizado para clínica' }
    ]
  };

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------------------------------------------------------
     1. PRELOADER
     --------------------------------------------------------------- */
  function preloader() {
    const el = $('#loader');
    const bar = $('#loaderBar');
    const num = $('#loaderNum');
    if (!el) return Promise.resolve();

    if (reduced) {
      el.classList.add('is-done');
      return Promise.resolve();
    }

    return new Promise(resolve => {
      let v = 0;
      const tick = () => {
        v = Math.min(100, v + Math.random() * 16 + 7);
        bar.style.width = v + '%';
        num.textContent = String(Math.round(v)).padStart(2, '0');
        if (v < 100) {
          setTimeout(tick, 38 + Math.random() * 60);
        } else {
          setTimeout(() => {
            el.classList.add('is-done');
            resolve();
          }, 300);
        }
      };
      setTimeout(tick, 260);
    });
  }

  /* ---------------------------------------------------------------
     2. SPLIT TEXT + REVEAL
     --------------------------------------------------------------- */
  function splitText() {
    $$('[data-split]').forEach(el => {
      const texto = el.textContent.trim().replace(/\s+/g, ' ');
      el.textContent = '';
      const frag = document.createDocumentFragment();
      let i = 0;

      // Cada PALAVRA vira um bloco próprio; só o espaço entre elas pode quebrar.
      // Sem isso o navegador quebra entre as letras (ex.: "frequente / s").
      texto.split(' ').forEach((palavra, p) => {
        if (p > 0) frag.appendChild(document.createTextNode(' '));
        const w = document.createElement('span');
        w.className = 'word';
        [...palavra].forEach(ch => {
          const c = document.createElement('span');
          c.className = 'char';
          c.textContent = ch;
          c.style.animationDelay = (i++ * 22) + 'ms';
          w.appendChild(c);
        });
        frag.appendChild(w);
      });

      el.appendChild(frag);
    });
  }

  function observeReveals() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const d = el.dataset.delay;
        if (d) el.style.setProperty('--d', d + 'ms');
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0, rootMargin: '0px 0px -48px 0px' });

    $$('[data-reveal], [data-split]').forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------------
     3. HEADER — sticky state, hide on scroll down, progress, spy
     --------------------------------------------------------------- */
  function header() {
    const head = $('#header');
    const prog = $('#progress');
    const links = $$('[data-nav]');
    let last = 0;

    const onScroll = () => {
      const y = window.scrollY;
      head.classList.toggle('is-stuck', y > 40);
      head.classList.toggle('is-hidden', y > 420 && y > last && !document.body.classList.contains('is-menu'));
      last = y;

      const max = document.documentElement.scrollHeight - innerHeight;
      prog.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });

    // Scroll spy
    const sections = links
      .map(a => $(a.getAttribute('href')))
      .filter(Boolean);

    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------------------------------------------------------------
     4. DRAWER MOBILE
     --------------------------------------------------------------- */
  function drawer() {
    const burger = $('#burger');
    const dr = $('#drawer');
    if (!burger) return;

    const toggle = (force) => {
      const open = force ?? !document.body.classList.contains('is-menu');
      document.body.classList.toggle('is-menu', open);
      document.body.classList.toggle('is-locked', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      dr.setAttribute('aria-hidden', String(!open));
    };

    burger.addEventListener('click', () => toggle());
    $$('a', dr).forEach(a => a.addEventListener('click', () => toggle(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
  }

  /* ---------------------------------------------------------------
     5. CURSOR
     --------------------------------------------------------------- */
  function cursor() {
    if (!fine || reduced) return;
    const el = $('#cursor');
    const label = $('.cursor__label', el);
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;

    addEventListener('mousemove', e => {
      x = e.clientX; y = e.clientY;
      el.classList.add('is-on');
    }, { passive: true });

    addEventListener('mouseleave', () => el.classList.remove('is-on'));

    const raf = () => {
      cx = lerp(cx, x, 0.18);
      cy = lerp(cy, y, 0.18);
      el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(raf);
    };
    raf();

    const targets = 'a, button, [data-cursor], .svc__item, summary, .gallery figure';
    document.addEventListener('mouseover', e => {
      const t = e.target.closest(targets);
      if (!t) return;
      el.classList.add('is-hover');
      label.textContent = t.dataset.cursor || '';
      el.classList.toggle('has-label', !!t.dataset.cursor);
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(targets)) {
        el.classList.remove('is-hover');
        label.textContent = '';
      }
    });
  }

  /* ---------------------------------------------------------------
     6. MAGNETIC BUTTONS
     --------------------------------------------------------------- */
  function magnetic() {
    if (!fine || reduced) return;
    $$('[data-magnetic]').forEach(el => {
      const strength = 0.32;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------------
     7. TILT 3D
     --------------------------------------------------------------- */
  function tilt() {
    if (!fine || reduced) return;
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-py * 5}deg) rotateY(${px * 6}deg)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------------
     8. COUNTERS
     --------------------------------------------------------------- */
  function counters() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        io.unobserve(el);
        if (el.hasAttribute('data-plain') || reduced) { el.textContent = el.dataset.count; return; }

        const end = parseInt(el.dataset.count, 10);
        const dur = 1400;
        const t0 = performance.now();
        const step = (t) => {
          const p = clamp((t - t0) / dur, 0, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * eased);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------------
     9. PARALLAX
     --------------------------------------------------------------- */
  function parallax() {
    if (reduced) return;
    const items = $$('[data-parallax]').map(el => ({ el, speed: parseFloat(el.dataset.speed) || 0.08, cur: 0 }));
    if (!items.length) return;

    const raf = () => {
      const vh = innerHeight;
      items.forEach(it => {
        const r = it.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return; // fora da tela: pula
        const center = r.top + r.height / 2 - vh / 2;
        const target = -center * it.speed;
        it.cur = lerp(it.cur, target, 0.08);
        it.el.style.transform = `translate3d(0, ${it.cur.toFixed(2)}px, 0)`;
      });
      requestAnimationFrame(raf);
    };
    raf();
  }

  /* ---------------------------------------------------------------
     10. MARQUEES (velocidade modulada pelo scroll)
     --------------------------------------------------------------- */
  function marquees() {
    const tracks = $$('[data-marquee]').map(el => ({
      el,
      dir: parseFloat(el.dataset.dir) || 1,
      x: 0,
      w: 0
    }));
    if (!tracks.length) return;

    // Largura exata de UMA cópia (o HTML repete o conteúdo duas vezes)
    const measure = () => tracks.forEach(t => {
      const cs = getComputedStyle(t.el);
      const gap = parseFloat(cs.columnGap || cs.gap) || 0;
      const kids = [...t.el.children];
      const half = Math.floor(kids.length / 2);
      let w = 0;
      for (let i = 0; i < half; i++) w += kids[i].getBoundingClientRect().width + gap;
      t.w = w || t.el.scrollWidth / 2;
    });
    measure();
    addEventListener('resize', measure);
    addEventListener('load', measure);
    if (document.fonts) document.fonts.ready.then(measure);

    let lastY = scrollY, vel = 0;
    addEventListener('scroll', () => {
      vel = (scrollY - lastY);
      lastY = scrollY;
    }, { passive: true });

    if (reduced) return;

    const raf = () => {
      vel = lerp(vel, 0, 0.06);
      tracks.forEach(t => {
        const speed = (0.55 + Math.abs(vel) * 0.06) * t.dir;
        t.x -= speed;
        // mantém x sempre dentro de [-w, 0) — funciona nos dois sentidos
        if (t.w) t.x = ((t.x % t.w) + t.w) % t.w - t.w;
        t.el.style.transform = `translate3d(${t.x.toFixed(2)}px,0,0)`;
      });
      requestAnimationFrame(raf);
    };
    raf();
  }

  /* ---------------------------------------------------------------
     11b. VISUALIZADOR DE FOTOS
     --------------------------------------------------------------- */
  const lightbox = (() => {
    const el = $('#lightbox');
    if (!el) return { open(){}, init(){} };

    const img     = $('#lbImg');
    const titulo  = $('#lbTitle');
    const agora   = $('#lbNow');
    const total   = $('#lbTotal');
    const thumbs  = $('#lbThumbs');
    const stage   = $('#lbStage');
    const btnPrev = $('[data-lb-prev]', el);
    const btnNext = $('[data-lb-next]', el);

    let fotos = [], i = 0, aberto = false, origem = null;

    const preload = (n) => {
      [n - 1, n + 1].forEach(k => {
        const f = fotos[(k + fotos.length) % fotos.length];
        if (f) new Image().src = f.src;
      });
    };

    const mostrar = (n, foco = false) => {
      if (!fotos.length) return;
      i = (n + fotos.length) % fotos.length;
      const foto = fotos[i];

      img.classList.remove('is-ready');
      el.classList.add('is-loading');

      const tmp = new Image();
      tmp.onload = tmp.onerror = () => {
        img.src = foto.src;
        img.alt = foto.alt || '';
        img.classList.add('is-ready');
        el.classList.remove('is-loading');
      };
      tmp.src = foto.src;

      agora.textContent = i + 1;
      $$('.lb__thumb', thumbs).forEach((t, k) => {
        const atual = k === i;
        t.classList.toggle('is-current', atual);
        t.setAttribute('aria-selected', String(atual));
        if (atual && foco) t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      });
      preload(i);
    };

    const montarThumbs = () => {
      thumbs.innerHTML = '';
      thumbs.hidden = fotos.length < 2;
      if (fotos.length < 2) return;
      fotos.forEach((f, k) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'lb__thumb';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', `Foto ${k + 1} de ${fotos.length}`);
        const im = document.createElement('img');
        im.src = f.src; im.alt = ''; im.loading = 'lazy';
        b.appendChild(im);
        b.addEventListener('click', () => mostrar(k, true));
        thumbs.appendChild(b);
      });
    };

    const abrir = (chave, nome, gatilho) => {
      fotos = (GALERIAS[chave] || []).filter(f => f && f.src);
      if (!fotos.length) return;

      origem = gatilho || null;
      titulo.textContent = nome || '';
      total.textContent = fotos.length;
      const solo = fotos.length < 2;
      btnPrev.hidden = solo;
      btnNext.hidden = solo;

      montarThumbs();
      mostrar(0, true);

      el.classList.add('is-open');
      el.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      aberto = true;
      $('.lb__close', el).focus({ preventScroll: true });
    };

    const fechar = () => {
      if (!aberto) return;
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-locked');
      aberto = false;
      if (origem) origem.focus({ preventScroll: true });
    };

    // --- controles
    $$('[data-lb-close]', el).forEach(b => b.addEventListener('click', fechar));
    btnPrev.addEventListener('click', () => mostrar(i - 1, true));
    btnNext.addEventListener('click', () => mostrar(i + 1, true));
    $('[data-lb-quote]', el).addEventListener('click', fechar);

    addEventListener('keydown', e => {
      if (!aberto) return;
      if (e.key === 'Escape')     { e.preventDefault(); fechar(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); mostrar(i - 1, true); }
      if (e.key === 'ArrowRight') { e.preventDefault(); mostrar(i + 1, true); }
      if (e.key === 'Tab') {
        // prende o foco dentro do diálogo
        const foco = $$('button, [href]', el).filter(n => !n.hidden && n.offsetParent !== null);
        if (!foco.length) return;
        const primeiro = foco[0], ultimo = foco[foco.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
      }
    });

    // --- arrastar / deslizar no touch
    let x0 = null;
    stage.addEventListener('pointerdown', e => { x0 = e.clientX; });
    stage.addEventListener('pointerup', e => {
      if (x0 === null) return;
      const d = e.clientX - x0;
      x0 = null;
      if (Math.abs(d) > 45) mostrar(i + (d < 0 ? 1 : -1), true);
    });
    stage.addEventListener('pointercancel', () => { x0 = null; });

    return { open: abrir, close: fechar };
  })();

  /* ---------------------------------------------------------------
     11. SERVIÇOS — preview que segue o cursor
     --------------------------------------------------------------- */
  function services() {
    const items = $$('[data-svc]');
    if (!items.length) return;

    // Clique (ou Enter/Espaço no botão) abre o visualizador
    items.forEach(item => {
      const btn = $('.svc__link', item);
      if (!btn) return;
      btn.addEventListener('click', () => {
        lightbox.open(item.dataset.svc, $('[data-svc-nome]', item).textContent.trim(), btn);
      });
    });

    const prev = $('#svcPreview');
    const img = $('[data-svc-img]', prev || document);
    if (!prev || !fine) return;

    let x = 0, y = 0, cx = 0, cy = 0, on = false;

    items.forEach(item => {
      const fotos = GALERIAS[item.dataset.svc] || [];
      if (!fotos.length) return;
      new Image().src = fotos[0].src; // pré-carrega a capa

      item.addEventListener('mouseenter', () => {
        on = true;
        img.src = fotos[0].src;
        prev.classList.add('is-on');
      });
      item.addEventListener('mouseleave', () => {
        on = false;
        prev.classList.remove('is-on');
      });
    });

    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; }, { passive: true });

    const raf = () => {
      cx = lerp(cx, x, 0.12);
      cy = lerp(cy, y, 0.12);
      if (on) {
        const skew = clamp((x - cx) * 0.25, -12, 12);
        prev.style.left = cx + 'px';
        prev.style.top = cy + 'px';
        prev.style.rotate = skew * 0.3 + 'deg';
      }
      requestAnimationFrame(raf);
    };
    raf();
  }

  /* ---------------------------------------------------------------
     12. PROCESSO — sticky horizontal
     --------------------------------------------------------------- */
  function process() {
    const section = $('#processo');
    const pin = $('[data-process]');
    const track = $('[data-process-track]');
    const bar = $('[data-process-bar]');
    if (!section || !track || reduced) return;

    let distance = 0;

    const measure = () => {
      distance = Math.max(0, track.scrollWidth - innerWidth);
      section.style.height = (innerHeight + distance) + 'px';
    };

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - innerHeight;
      if (total <= 0) return;
      const p = clamp(-rect.top / total, 0, 1);
      track.style.transform = `translate3d(${(-p * distance).toFixed(2)}px,0,0)`;
      if (bar) bar.style.width = (p * 100) + '%';
    };

    measure();
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', () => { measure(); onScroll(); });
    // Reavalia depois que as fontes carregam (muda a largura dos cards)
    if (document.fonts) document.fonts.ready.then(() => { measure(); onScroll(); });
  }

  /* ---------------------------------------------------------------
     13. HALFTONE CANVAS (hero)
     --------------------------------------------------------------- */
  function halftone() {
    const cv = $('#halftone');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let w, h, dpr, cols, rows, gap, t = 0;
    let mx = -9999, my = -9999;
    let running = true;

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = w < 640 ? 26 : 32;
      cols = Math.ceil(w / gap) + 1;
      rows = Math.ceil(h / gap) + 1;
    };

    const draw = () => {
      if (!running) return requestAnimationFrame(draw);
      ctx.clearRect(0, 0, w, h);
      t += 0.006;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gap + gap / 2;
          const y = j * gap + gap / 2;

          // onda base
          const wave = Math.sin(x * 0.006 + t * 1.6) * Math.cos(y * 0.008 - t * 1.1);
          let r = (wave * 0.5 + 0.5) * 2.4 + 0.5;

          // reação ao mouse
          const dx = x - mx, dy = y - my;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 190) {
            const f = 1 - d / 190;
            r += f * f * 5.2;
          }

          const alpha = 0.10 + (r / 8) * 0.55;
          ctx.fillStyle = `rgba(53,224,140,${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.3, r), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    };

    resize();
    addEventListener('resize', resize);

    if (fine && !reduced) {
      addEventListener('mousemove', e => {
        const r = cv.getBoundingClientRect();
        mx = e.clientX - r.left;
        my = e.clientY - r.top;
      }, { passive: true });
    }

    // pausa quando o hero sai da tela
    new IntersectionObserver(([e]) => { running = e.isIntersecting; }, { threshold: 0 })
      .observe(cv);

    if (reduced) {
      // desenha um frame estático
      running = true;
      ctx.clearRect(0, 0, w, h);
      draw();
      running = false;
    } else {
      draw();
    }
  }

  /* ---------------------------------------------------------------
     14. ACCORDION — abre um por vez, com altura animada
     --------------------------------------------------------------- */
  function accordion() {
    const root = $('[data-acc]');
    if (!root) return;
    const items = $$('details', root);

    items.forEach(d => {
      const body = $('.acc__body', d);
      body.style.height = d.open ? 'auto' : '0px';
      body.style.transition = 'height .5s cubic-bezier(.16,1,.3,1)';

      $('summary', d).addEventListener('click', e => {
        e.preventDefault();
        const isOpen = d.open;

        items.forEach(o => {
          if (o !== d && o.open) {
            const ob = $('.acc__body', o);
            ob.style.height = ob.scrollHeight + 'px';
            requestAnimationFrame(() => { ob.style.height = '0px'; });
            ob.addEventListener('transitionend', () => { o.open = false; }, { once: true });
          }
        });

        if (isOpen) {
          body.style.height = body.scrollHeight + 'px';
          requestAnimationFrame(() => { body.style.height = '0px'; });
          body.addEventListener('transitionend', () => { d.open = false; }, { once: true });
        } else {
          d.open = true;
          body.style.height = '0px';
          requestAnimationFrame(() => { body.style.height = body.scrollHeight + 'px'; });
          body.addEventListener('transitionend', () => { if (d.open) body.style.height = 'auto'; }, { once: true });
        }
      });
    });
  }

  /* ---------------------------------------------------------------
     15. FORMULÁRIO → e-mail pronto
     --------------------------------------------------------------- */
  function form() {
    const f = $('#quoteForm');
    const note = $('#formNote');
    if (!f) return;

    f.addEventListener('submit', e => {
      e.preventDefault();
      note.classList.remove('is-error', 'is-ok');

      const required = ['nome', 'email', 'telefone', 'mensagem'];
      let ok = true;
      required.forEach(name => {
        const input = f.elements[name];
        const field = input.closest('.field');
        const valid = input.value.trim() !== '' && (name !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value));
        field.classList.toggle('is-error', !valid);
        if (!valid) ok = false;
      });

      if (!ok) {
        note.textContent = 'Falta preencher nome, e-mail válido, telefone ou a descrição do material.';
        note.classList.add('is-error');
        return;
      }

      const data = new FormData(f);
      const servicos = data.getAll('servico');

      const body = [
        `Nome: ${data.get('nome')}`,
        `Empresa: ${data.get('empresa') || 'não informada'}`,
        `E-mail: ${data.get('email')}`,
        `Telefone: ${data.get('telefone')}`,
        `Serviços: ${servicos.length ? servicos.join(', ') : 'a definir'}`,
        '',
        'Descrição:',
        data.get('mensagem')
      ].join('\n');

      const href = `mailto:${CONFIG.email}`
        + `?subject=${encodeURIComponent('Pedido de orçamento: ' + data.get('nome'))}`
        + `&body=${encodeURIComponent(body)}`;

      window.location.href = href;

      note.innerHTML = 'Abrimos o seu app de e-mail com a mensagem escrita. '
        + `Prefere WhatsApp? <a href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(body)}" target="_blank" rel="noopener"><b>Enviar por lá ↗</b></a>`;
      note.classList.add('is-ok');
    });
  }

  /* ---------------------------------------------------------------
     16. MISC
     --------------------------------------------------------------- */
  function misc() {
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();

    const wa = $('.float-wa');
    if (wa) {
      wa.href = `https://wa.me/${CONFIG.whatsapp}`;
      addEventListener('scroll', () => {
        wa.classList.toggle('is-in', scrollY > innerHeight * 0.6);
      }, { passive: true });
    }
  }

  /* ---------------------------------------------------------------
     BOOT
     --------------------------------------------------------------- */
  splitText();

  preloader().then(() => {
    document.documentElement.classList.add('is-ready');
    observeReveals();
  });

  header();
  drawer();
  cursor();
  magnetic();
  tilt();
  counters();
  parallax();
  marquees();
  services();
  process();
  halftone();
  accordion();
  form();
  misc();
})();
