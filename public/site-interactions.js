var siteBasePath = document.body ? document.body.dataset.basePath || '' : '';
function sitePath(path) { return siteBasePath + path; }

function runWhenReady(callback) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', callback);
  else setTimeout(callback, 0);
}

    const S = { photos: [], cur: 0, paper: 'c', stamp: 'heart', wax: '#E8445A' };

    runWhenReady(() => {
      setDate(); buildStars('sf', 22); buildStars('csf', 14); hydrateSprites(); setupTools(); setupStationery();
      loadDraft();
      setupPaste(); setupDrop(); setupFI(); setupSwatches(); setupAutoSave(); setupObs(); setupScroll(); setupDesk();
    });

    function setDate() { document.getElementById('lt-date').textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }

    function buildStars(id, n) {
      const c = document.getElementById(id); if (!c) return;
      for (let i = 0; i < n; i++) {
        const s = document.createElement('div');
        const sz = Math.random() > .6 ? 'lg' : Math.random() > .5 ? 'sm' : '';
        s.className = 'pxstar ' + sz;
        s.style.cssText = 'left:' + (Math.random() * 96).toFixed(1) + '%;top:' + (Math.random() * 94).toFixed(1) + '%;--d:' + (1.2 + Math.random() * 2).toFixed(1) + 's;--o:' + (Math.random() * 2).toFixed(1) + 's;';
        c.appendChild(s);
      }
    }

    const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── SOUND (off by default) ─────────────────────────────────
    let audioCtx = null;
    function sfx(kind) {
      if (localStorage.getItem('ppx-sound') !== '1') return;
      try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        const notes = { pop: [[660, 0, .07]], chime: [[784, 0, .18], [988, .12, .18], [1318, .26, .3]], stamp: [[110, 0, .12], [70, .05, .16]] }[kind] || [];
        notes.forEach(n => {
          const o = audioCtx.createOscillator(), g = audioCtx.createGain();
          o.type = kind === 'stamp' ? 'square' : 'triangle'; o.frequency.value = n[0];
          const t = audioCtx.currentTime + n[1];
          g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + n[2]);
          o.connect(g); g.connect(audioCtx.destination); o.start(t); o.stop(t + n[2] + .05);
        });
      } catch (e) { }
    }
    function setupTools() {
      const sb = document.getElementById('soundBtn'), tb = document.getElementById('themeBtn');
      const paintSound = () => {
        const on = localStorage.getItem('ppx-sound') === '1';
        sb.textContent = on ? '\u{1F50A}' : '\u{1F507}'; sb.setAttribute('aria-pressed', on);
        sb.setAttribute('aria-label', 'Sound effects: ' + (on ? 'on' : 'off')); sb.title = 'Sound effects (' + (on ? 'on' : 'off') + ')';
      };
      const paintTheme = () => {
        const dark = document.documentElement.dataset.theme === 'night';
        tb.textContent = dark ? '\u2600\uFE0F' : '\u{1F319}'; tb.setAttribute('aria-pressed', dark);
        tb.setAttribute('aria-label', dark ? 'Switch to daytime theme' : 'Switch to starry night theme'); tb.title = dark ? 'Daytime' : 'Starry night';
      };
      if (localStorage.getItem('ppx-theme') === 'night') document.documentElement.dataset.theme = 'night';
      paintSound(); paintTheme();
      sb.addEventListener('click', () => { localStorage.setItem('ppx-sound', localStorage.getItem('ppx-sound') === '1' ? '0' : '1'); paintSound(); sfx('pop'); });
      tb.addEventListener('click', () => {
        const dark = document.documentElement.dataset.theme === 'night';
        if (dark) delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = 'night';
        localStorage.setItem('ppx-theme', dark ? 'day' : 'night'); paintTheme();
      });
    }

    // ─── MASCOT (Penny the envelope) ────────────────────────────
    let pipIdle;
    function pipSay(msg) {
      const b = document.getElementById('pipBub'), p = document.getElementById('pip'); if (!b) return;
      if (b.textContent !== msg) b.textContent = msg;
      p.classList.remove('wiggle'); void p.offsetWidth; if (!REDUCED) p.classList.add('wiggle');
      clearTimeout(pipIdle);
      pipIdle = setTimeout(() => { b.textContent = "Take your time. There's no rush at all."; }, 25000);
    }
    function pipForWords(n) {
      if (n === 0) return "A blank page is just a hello waiting to happen.";
      if (n < 15) return "Lovely start! Keep going ✨";
      if (n < 60) return "Beautiful, keep going! ✨";
      if (n < 150) return "They're going to treasure this 💛";
      return "What a heartfelt letter. I'm a little teary!";
    }

    // ─── SOFT SURPRISES ─────────────────────────────────────────
    function burstAt(x, y, n) {
      if (REDUCED) return;
      const cols = ['#FFB8D0', '#FF8FB5', '#C8A8FF', '#8FDDC8', '#FFE066', '#A8D4FF'];
      const glyphs = ['sq'];
      for (let i = 0; i < (n || 14); i++) {
        const el = document.createElement('span'), g = glyphs[i % glyphs.length], a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 110;
        el.className = 'bit' + (g === 'sq' ? ' sq' : ''); if (g !== 'sq') el.textContent = g;
        el.style.cssText = 'left:' + x + 'px;top:' + y + 'px;--dx:' + (Math.cos(a) * d).toFixed(0) + 'px;--dy:' + (Math.sin(a) * d - 30).toFixed(0) + 'px;--r:' + ((Math.random() * 360) | 0) + 'deg;--c:' + cols[i % cols.length] + ';--s:' + (12 + Math.random() * 12 | 0) + 'px;--t:' + (0.8 + Math.random() * .6).toFixed(2) + 's;';
        document.body.appendChild(el); el.addEventListener('animationend', () => el.remove());
      }
    }
    document.addEventListener('pointerdown', e => {
      const b = e.target.closest('.btn-px, .nav-btn, .send-btn-main, .occ, .btn-soft');
      if (b) sfx('pop');
    });

    // ─── PIXEL SPRITES (one 8px-per-cell grid, one brown outline, top-left light) ───
    const PX_PAL = { k: '#5C3D2E', w: '#FFFFFF', c: '#FFFDF5', p: '#FFB8D0', P: '#FF8FB5', r: '#E8445A', R: '#B82E45', y: '#FFE066', Y: '#FFC020', l: '#C8A8FF', L: '#9050E0', m: '#8FDDC8', M: '#50B898', o: '#FFD4A8', O: '#F0A878', s: '#A8D4FF', S: '#5090E0', b: '#8A6048' };
    const PX = {
      heart: ['.kkk....kkk.', 'kwppk..kppPk', 'kwpppkkpppPk', 'kppppppppPPk', 'kppppppppPPk', '.kppppppPPk.', '..kppppPPk..', '...kppPPk...', '....kPPk....', '.....kk.....'],
      star: ['.....kk.....', '....kyyk....', '....kywk....', 'kkkkkywykkkk', 'kyyyyyyyyyyk', '.kyyyyyyyYk.', '..kyyyyyYk..', '..kyyYkyYk..', '.kyYk..kYYk.', '.kkk....kkk.'],
      cake: ['...y....y...', '...k....k...', '.kkkkkkkkkk.', 'kwwwwwwwwwwk', 'kpppppppppPk', 'kppPppPppPpk', 'kkkkkkkkkkkk', 'koooooooooOk', 'koooooooooOk', 'kkkkkkkkkkkk'],
      flower: ['...kkkkkk...', '..kppppppk..', '.kkppyyppkk.', 'kppppyYppppk', 'kppppyyppppk', '.kkppppppkk.', '..kppppppk..', '...kkmmkk...', '....kmMk....', '....kmMk....'],
      moon: ['....kkkk....', '..kkyyyyk...', '.kyywyyyk...', '.kyyyykk....', 'kyyyyyk.....', 'kyyyyyk.....', 'kyyyyyyk....', '.kyyyyyykk..', '.kkyyYYYyyk.', '..kkkkkkkk..'],
      tea: ['..k..k......', '...k..k.....', '............', '.kkkkkkkkk..', 'kwwwwwwwwkkk', 'kwoooooowkwk', 'kwoooooowkwk', 'kwwooooowkk.', '.kwwwwwwwk..', '..kkkkkkk...'],
      cap: ['....kkkk....', '..kkLLLLkk..', 'kkLLLLLLLLkk', 'kLLLLLwLLLLk', '.kkLLLLLLkk.', '...kLLLLk...', '...kLLLLk.y.', '....kkkk..yY', '..........yY', '..........Y.'],
      gift: ['..kkk..kkk..', '.kppk..kppk.', '..kkkkkkkk..', 'kkkkkkkkkkkk', 'kllllrrlllLk', 'kkkkkkkkkkkk', 'kllllrrlllLk', 'kllllrrlllLk', 'kllllrrlllLk', 'kkkkkkkkkkkk'],
      camera: ['...kkkk.....', 'kkkkkkkkkkkk', 'kssssssssssk', 'ksskkkkksssk', 'kskwwwwwkssk', 'kskwSSSwkssk', 'kskwwwwwkssk', 'ksskkkkksssk', 'kssssssssssk', 'kkkkkkkkkkkk'],
      cloud: ['....kkkk....', '..kkwwwwkk..', '.kwwwwwwwwkk', 'kwwwwwwwwwwk', 'kssssssssssk', '.kkkkkkkkkk.'],
      sparkle: ['.....kk.....', '.....kyk....', '....kywyk...', '.kkkywwwykk.', 'kyyywwwwyyyk', '.kkkywwwykk.', '....kyyyk...', '.....kYk....', '.....kk.....'],
      mascot: [
        'kkkkkkkkkkkkkkkk',
        'kcpPccccccccPpck',
        'kccpPccccccPpcck',
        'kcccpPccccPpccck',
        'kccccpPPPPpcccck',
        'kccckkcccckkccck',
        'kccckkcccckkccck',
        'kcPPccckkcccPPck',
        'kccccccccccccccc',
        'kcccccccccccccck',
        'kkkkkkkkkkkkkkkk'
      ]
    };

    function pxSprite(name, px, cls) {
      const rows = PX[name]; if (!rows) return '';
      const w = Math.max.apply(null, rows.map(r => r.length)), h = rows.length;
      let rects = '';
      rows.forEach((row, y) => {
        let x = 0;
        while (x < row.length) {
          const ch = row[x];
          if (ch === '.') { x++; continue; }
          let e = x; while (e < row.length && row[e] === ch) e++;
          rects += '<rect x="' + x + '" y="' + y + '" width="' + (e - x) + '" height="1" fill="' + (PX_PAL[ch] || '#000') + '"/>';
          x = e;
        }
      });
      return '<svg class="px-sprite ' + (cls || '') + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + (w * (px || 3)) + '" height="' + (h * (px || 3)) + '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + rects + '</svg>';
    }
    function hydrateSprites() {
      document.querySelectorAll('[data-sprite]').forEach(el => {
        el.innerHTML = pxSprite(el.dataset.sprite, parseInt(el.dataset.px, 10) || 3, el.dataset.cls || '');
      });
    }

    function setupStationery() {
      document.querySelectorAll('.stp').forEach(b => b.addEventListener('click', () => {
        document.querySelectorAll('.stp').forEach(x => { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('sel'); b.setAttribute('aria-pressed', 'true'); S.stamp = b.dataset.st; pipSay('A lovely stamp choice!'); sfx('pop');
      }));
      document.querySelectorAll('.wxp').forEach(b => b.addEventListener('click', () => {
        document.querySelectorAll('.wxp').forEach(x => { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('sel'); b.setAttribute('aria-pressed', 'true'); S.wax = b.dataset.wx; pipSay('That wax color will look so pretty.'); sfx('pop');
      }));
      document.querySelectorAll('.prompts .note').forEach(n => n.addEventListener('click', () => {
        const t = document.getElementById('lt-body'); t.placeholder = n.dataset.q; t.focus(); pipSay('Try finishing that sentence: "' + n.dataset.q + '"');
      }));
      document.querySelectorAll('.pswatch').forEach(s => s.addEventListener('click', () => pipSay('Ooh, pretty paper!')));
      document.getElementById('pzone').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('fi').click(); } });
    }

    function setupSwatches() {
      document.querySelectorAll('.pswatch').forEach(sw => {
        sw.addEventListener('click', () => {
          document.querySelectorAll('.pswatch').forEach(s => { const selected = s === sw; s.classList.toggle('sel', selected); s.setAttribute('aria-pressed', selected); });
          const p = sw.dataset.p; S.paper = p;
          const lp = document.getElementById('lp');
          lp.className = 'letter-paper ' + ({ c: 'pc', l: 'pl', b: 'pb', m: 'pm', s: 'ps2', p: 'pp' }[p] || 'pc');
          saveLetterLocally();
        });
      });
    }

    function sk(e) {
      const ta = document.getElementById('lt-body');
      const st = ta.selectionStart, en = ta.selectionEnd;
      ta.value = ta.value.slice(0, st) + e + ta.value.slice(en);
      ta.selectionStart = ta.selectionEnd = st + e.length; ta.focus();
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      popConf([e]);
    }

    function setupPaste() {
      document.addEventListener('paste', ev => {
        const items = ev.clipboardData?.items; if (!items) return;
        for (const it of items) { if (it.type.startsWith('image/')) { addPF(it.getAsFile()); ev.preventDefault(); break; } }
      });
    }

    function setupDrop() {
      const z = document.getElementById('pzone');
      z.addEventListener('dragover', e => { e.preventDefault(); z.classList.add('dov'); });
      z.addEventListener('dragleave', () => z.classList.remove('dov'));
      z.addEventListener('drop', e => {
        e.preventDefault(); z.classList.remove('dov');
        const f = e.dataTransfer?.files; if (f) [...f].forEach(f => { if (f.type.startsWith('image/')) addPF(f); });
      });
    }

    function setupFI() {
      const inp = document.getElementById('fi');
      inp.addEventListener('change', e => { [...e.target.files].forEach(addPF); inp.value = ''; });
    }

    function addPF(file) {
      if (!file.type.match('image.*')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width; let h = img.height;
          const MAX = 800;
          if (w > MAX || h > MAX) {
            if (w > h) { h *= MAX / w; w = MAX; }
            else { w *= MAX / h; h = MAX; }
          }
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          addPhoto(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function addPhoto(url) {
      S.photos.push(url); S.cur = S.photos.length - 1; renderAlbum(); updateBadge(); S.pop = true;
      toast('Added to your scrapbook 📸', 'ok'); pipSay('What a sweet photo!'); sfx('pop');
      const act = document.querySelector('.photo-card.active'); if (act) { const r = act.getBoundingClientRect(); burstAt(r.left + r.width / 2, r.top + r.height / 3, 8); act.classList.add('pop'); }
    }

    function renderAlbum() {
      const stage = document.getElementById('alstage');
      const empty = document.getElementById('alempty');
      stage.querySelectorAll('.photo-card').forEach(c => c.remove());
      if (!S.photos.length) { empty.style.display = 'flex'; return; }
      empty.style.display = 'none';
      const tot = S.photos.length;
      const vis = Math.min(tot, 6);
      const start = Math.max(0, Math.min(S.cur - vis + 1, tot - vis));
      for (let i = start; i < start + vis; i++) {
        const rel = i - start; const mid = (vis - 1) / 2;
        const ang = (rel - mid) * 7; const tx = (rel - mid) * 26;
        const isAct = i === S.cur;
        const card = document.createElement('div');
        card.className = 'photo-card' + (isAct ? ' active' : '');
        card.style.zIndex = rel + 1;
        if (!isAct) card.style.transform = 'rotate(' + ang + 'deg) translateX(' + tx + 'px)';
        const img = document.createElement('img'); img.src = S.photos[i]; img.alt = 'Photo ' + (i + 1);
        const cap = document.createElement('div'); cap.className = 'photo-card-cap'; cap.textContent = (i + 1) + ' / ' + tot;
        card.appendChild(img); card.appendChild(cap);
        if (isAct) {
          const delBtn = document.createElement('button');
          delBtn.className = 'photo-del'; delBtn.type = 'button'; delBtn.setAttribute('aria-label', 'Remove this photo');
          delBtn.innerHTML = '&times;';
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            S.photos.splice(i, 1);
            S.cur = Math.max(0, S.cur - 1);
            renderAlbum(); updateBadge(); saveLetterLocally();
          });
          card.appendChild(delBtn);
        }
        card.tabIndex = 0; card.setAttribute('role', 'button'); card.setAttribute('aria-label', 'Photo ' + (i + 1) + ' of ' + tot + (isAct ? ', selected' : ''));
        const ci = i; card.addEventListener('click', () => { S.cur = ci; renderAlbum(); });
        card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); S.cur = ci; renderAlbum(); const c = document.querySelector('.photo-card.active'); if (c) c.focus(); } });
        stage.appendChild(card);
      }
    }

    function updateBadge() { const n = S.photos.length; document.getElementById('phcount').textContent = n + (n === 1 ? ' photo' : ' photos'); updateDesk(); }
    function prevPh() { if (!S.photos.length) return; S.cur = (S.cur - 1 + S.photos.length) % S.photos.length; renderAlbum(); }
    function nextPh() { if (!S.photos.length) return; S.cur = (S.cur + 1) % S.photos.length; renderAlbum(); }
    function removePh() { if (!S.photos.length) return; S.photos.splice(S.cur, 1); S.cur = Math.min(S.cur, Math.max(0, S.photos.length - 1)); renderAlbum(); updateBadge(); saveLetterLocally(); toast('Photo removed', ''); }

    function setupAutoSave() {
      ['lt-to', 'lt-body', 'lt-sign', 'remail', 'sname', 'subj'].forEach(id => {
        const el = document.getElementById(id); if (el) el.addEventListener('input', saveDraft);
      });
    }
    function saveDraft() {
      localStorage.setItem('ppx-draft', JSON.stringify({
        to: document.getElementById('lt-to').value, body: document.getElementById('lt-body').value,
        sign: document.getElementById('lt-sign').value, re: document.getElementById('remail')?.value || '',
        sn: document.getElementById('sname')?.value || '', sb: document.getElementById('subj')?.value || ''
      }));
    }
    function loadDraft() {
      try {
        const raw = localStorage.getItem('ppx-draft'); if (!raw) return; const d = JSON.parse(raw);
        if (d.to) document.getElementById('lt-to').value = d.to;
        if (d.body) document.getElementById('lt-body').value = d.body;
        if (d.sign) document.getElementById('lt-sign').value = d.sign;
        if (d.re) { const el = document.getElementById('remail'); if (el) el.value = d.re; }
        if (d.sn) { const el = document.getElementById('sname'); if (el) el.value = d.sn; }
        if (d.sb) { const el = document.getElementById('subj'); if (el) el.value = d.sb; }
        updateWordCount();
      } catch (e) { }
    }

    
    
    function popConf(emojis) {
      burstAt(innerWidth / 2, innerHeight * 0.45, 22);
    }

    function toast(msg, type) {
      const t = document.getElementById('toast'); t.textContent = msg; t.className = 'toast ' + type; t.classList.add('show');
      clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3500);
    }

    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (!document.getElementById('sealOv').hidden) closeSeal();
    });

    function setupObs() {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(en => en.target.classList.toggle('vis', en.isIntersecting));
      }, { rootMargin: '0px 0px -32px 0px', threshold: .12 });
      document.querySelectorAll('.fi').forEach(el => obs.observe(el));
    }

    function setupScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
          const href = a.getAttribute('href');
          const t = href === '#' ? document.getElementById('home') : document.querySelector(href);
          if (t) { e.preventDefault(); t.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' }); }
        });
      });
    }

    // ─── QUICK DEMO TEMPLATES ─────────────────────────────────
    const DEMOS = {
      anniversary: {
        paper: 'b',
        to: 'Dear love,',
        body: 'Another year, and I still get a little flutter when you walk into the room.\n\nThank you for the quiet mornings, the terrible puns, the way you always save me the last bite. Every ordinary day with you feels like a small celebration.\n\nI don\'t say it enough, so here it is on paper where it can stay: I love you, and I\'d choose you again in every version of every year.\n\nHere\'s to the next one. 💕',
        sign: 'Yours, always 💕',
        from: 'Madhu',
        subj: 'Happy anniversary 💕',
        photos: [{ bg: '#FFB8D0', em: '💕', lab: 'Our favorite day' }, { bg: '#FFE066', em: '🌻', lab: 'Sunny with you' }, { bg: '#C8A8FF', em: '✨', lab: 'Here\'s to us' }]
      },
      congrats: {
        paper: 'm',
        to: 'Dear graduate,',
        body: 'I just heard the news and I haven\'t stopped smiling since!\n\nAll those late nights, all that doubt you pushed through, and look at you now. I always knew you could do it, and I\'m so proud I could burst.\n\nWhatever comes next, remember how far you\'ve already come. The world is lucky to have you in it. 🎓',
        sign: 'Cheering the loudest, Madhu 🎓',
        from: 'Madhu',
        subj: 'Congratulations! 🎓',
        photos: [{ bg: '#C8A8FF', em: '🎓', lab: 'You did it!' }, { bg: '#FFE066', em: '🌟', lab: 'So proud of you' }]
      },
      justbecause: {
        paper: 's',
        to: 'Hi you,',
        body: 'No special occasion. I just wanted you to open this and know somebody is thinking of you.\n\nI hope your day is gentle, your tea is warm, and something small and lovely happens before bedtime.\n\nThat\'s all. That\'s the whole letter. ☁️',
        sign: 'Thinking of you, Madhu ☁️',
        from: 'Madhu',
        subj: 'Just because ☁️',
        photos: [{ bg: '#A8D4FF', em: '☁️', lab: 'Just thinking of you' }]
      },
      getwell: {
        paper: 'p',
        to: 'Dear friend,',
        body: 'I heard you\'re under the weather, so I\'m sending a big, warm hug by post.\n\nPlease rest, drink something cozy, and let everyone else worry about everything else for a while. Nothing is more important than you feeling better.\n\nI\'m only a message away if you need soup, silly videos, or company. Get well soon. 🍵',
        sign: 'Sending soft thoughts, Madhu 🍵',
        from: 'Madhu',
        subj: 'Get well soon 🍵',
        photos: [{ bg: '#FFD4A8', em: '🍵', lab: 'Rest up' }, { bg: '#8FDDC8', em: '🌿', lab: 'Feel better soon' }]
      },
      bestfriend: {
        paper: 'l',
        to: 'Dear Priya,',
        body: 'I was sitting by the window this evening, watching the sky turn that particular shade of orange you always said looked like the inside of a mango, and I thought of you.\n\nI don\'t know why we stop calling the people we love most. Maybe it\'s because we think they already know. But I wanted to write it down anyway — you are one of the best parts of my life.\n\nRemember that time we got completely lost on the way to the concert and ended up eating street food and laughing until our stomachs hurt? That\'s still one of my favourite nights.\n\nI hope wherever you are, there\'s good tea, warm light, and absolutely no Monday mornings. \u2728',
        sign: 'Forever your chaotic co-pilot, Madhu 💜',
        from: 'Madhu',
        subj: 'Just thinking of you 💜',
        photos: [{ bg: '#C8A8FF', em: '💜', lab: 'Our silly adventures' }, { bg: '#FFB8D0', em: '🌺', lab: 'Forever friends' }, { bg: '#8FDDC8', em: '\u2728', lab: 'All the good memories' }]
      },
      birthday: {
        paper: 'b',
        to: 'Dear Arjun,',
        body: 'Happy birthday to the person who somehow gets more wonderful every single year. 🎂\n\nI\'ve been thinking about all the versions of you I\'ve known — the nervous one before presentations, the ridiculous one at 2 AM, the quietly kind one who always notices when someone needs help. Every version is my favourite.\n\nOn your birthday I just want you to know: the world is genuinely better because you\'re in it. That\'s not a card-shop thing to say. I mean it completely.\n\nMay this year bring you everything your heart has been quietly hoping for. 🌟',
        sign: 'With so much love and a tiny bit of cake envy, Madhu 🎂',
        from: 'Madhu',
        subj: 'Happy birthday, you wonderful human 🎂',
        photos: [{ bg: '#FFB8D0', em: '🎂', lab: 'Celebrating you!' }, { bg: '#FFE066', em: '🌟', lab: 'Shine bright' }, { bg: '#C8A8FF', em: '🪅', lab: 'Make a wish' }]
      },
      missyou: {
        paper: 's',
        to: 'Dear Riya,',
        body: 'I miss you in the small, quiet ways that sneak up on you.\n\nLike when I hear a song we used to listen to on repeat. Or when something funny happens and you\'re the first person I want to tell. Or on slow Sunday mornings when everything feels too still.\n\nThe distance is just geography, I know. But some days geography feels heavier than it should.\n\nI\'m writing this because I didn\'t want to just send a voice note or a meme. You deserve actual words. So here they are: I miss you, I think about you more than I probably say, and I\'m so glad you exist. 🌙',
        sign: 'Missing you across all the miles, Madhu 🌙',
        from: 'Madhu',
        subj: 'Missing you today 🌙',
        photos: [{ bg: '#A8D4FF', em: '🌙', lab: 'Quiet evenings' }, { bg: '#1A1042', em: '\u2728', lab: 'Thinking of you' }, { bg: '#8FDDC8', em: '💫', lab: 'Somewhere out there' }]
      },
      parent: {
        paper: 'p',
        to: 'Dear Amma,',
        body: 'I\'ve been meaning to write this for a long time.\n\nThank you. Not for any one thing — for all of it. For the meals made when I didn\'t ask. For the quiet worry you carried so I wouldn\'t have to. For the way you always seemed to know when I needed someone in my corner.\n\nI know I don\'t say it enough. I know I get caught up in days and weeks and forget to say the things that matter. So I\'m saying it now, written down, so it\'s real:\n\nYou are one of the most important people in my life. I love you more than I know how to put into words — but I\'m trying anyway. 🌻',
        sign: 'Your grateful, lucky child, Madhu 🌻',
        from: 'Madhu',
        subj: 'A letter I should have written sooner 🌻',
        photos: [{ bg: '#FFF5EA', em: '🌻', lab: 'Always home' }, { bg: '#FFD4A8', em: '\u2600\uFE0F', lab: 'Warm memories' }, { bg: '#C8F0D8', em: '💐', lab: 'With so much love' }]
      },
      lovenote: {
        paper: 'b',
        to: 'Dear you,',
        body: 'I wasn\'t going to write this. I talked myself out of it three times.\n\nBut here I am, because some things are just too big to leave unsaid.\n\nYou make ordinary things feel extraordinary. The way a regular Tuesday can feel like something worth remembering, just because you were in it. I didn\'t know that was possible before you.\n\nI\'m not sure what this is yet, or where it\'s going. But I know that when I\'m with you, the world feels quieter and also somehow more alive. And I wanted you to know that. 💕',
        sign: 'Yours (and a little bit terrified), Madhu 💕',
        from: 'Madhu',
        subj: 'Something I\'ve been wanting to say 💕',
        photos: [{ bg: '#FFB8D0', em: '💕', lab: 'The little moments' }, { bg: '#C8A8FF', em: '🌸', lab: 'Thinking of you' }, { bg: '#FFE8D4', em: '🩷', lab: 'Just us' }]
      },
      thankyou: {
        paper: 'm',
        to: 'Dear Sneha,',
        body: 'I\'ve been carrying this thank-you in my pocket for a while, meaning to say it properly. So here it finally is.\n\nWhat you did — the time you gave, the way you showed up without being asked — it meant more than I think I was able to show in the moment.\n\nI want you to know that kindness like yours doesn\'t go unnoticed. It stays. It changes things. It makes people braver and more hopeful.\n\nYou made a difference. A real, actual difference. \u2728 Thank you, from somewhere very genuine.',
        sign: 'With the fullest gratitude, Madhu \u2728',
        from: 'Madhu',
        subj: 'A proper thank you, finally \u2728',
        photos: [{ bg: '#8FDDC8', em: '\u2728', lab: 'Grateful for you' }, { bg: '#FFE066', em: '🌟', lab: 'You made this better' }, { bg: '#A8D4FF', em: '💫', lab: 'Kindness matters' }]
      }
    };

    function demoPhotoSource(photo) {
      const escapeXml = value => String(value).replace(/[<>&'"]/g, char => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
      })[char]);
      const bg = /^#[\da-f]{6}$/i.test(photo.bg) ? photo.bg : '#FFFDF5';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="${bg}"/><circle cx="200" cy="210" r="118" fill="#ffffff" fill-opacity=".42"/><text x="200" y="255" text-anchor="middle" font-size="118">${escapeXml(photo.em)}</text><text x="200" y="430" text-anchor="middle" font-family="Pixelify Sans, sans-serif" font-size="24" fill="#4A3728" textLength="340" lengthAdjust="spacingAndGlyphs">${escapeXml(photo.lab)}</text></svg>`;
      return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }

    function loadDemoTemplate(key) {
      const d = DEMOS[key] || DEMOS['bestfriend'];
      document.getElementById('lt-to').value = d.to;
      document.getElementById('lt-body').value = d.body;
      document.getElementById('lt-body').dispatchEvent(new Event('input', { bubbles: true }));
      document.getElementById('lt-sign').value = d.sign;
      const snameEl = document.getElementById('sname'); if (snameEl) snameEl.value = d.from || 'Madhu';
      const subjEl = document.getElementById('subj'); if (subjEl) subjEl.value = d.subj || 'A letter just for you';
      // Set paper
      document.querySelectorAll('.pswatch').forEach(sw => {

        const selected = sw.dataset.p === d.paper;
        sw.classList.toggle('sel', selected); sw.setAttribute('aria-pressed', selected);
      });
      const lp = document.getElementById('lp');
      const cls = { c: 'pc', l: 'pl', b: 'pb', m: 'pm', s: 'ps2', p: 'pp' };
      lp.className = 'letter-paper ' + (cls[d.paper] || 'pc');
      S.paper = d.paper;
      // Load saved photos
      S.photos = (d.photos || []).map(photo =>
        typeof photo === 'string' ? photo : demoPhotoSource(photo)
      );
      S.cur = Math.max(0, S.photos.length - 1);
      renderAlbum(); updateBadge();
      saveDraft();
    }

    function loadDemo(key) {
      const body = document.getElementById('lt-body').value.trim();
      const hasOtherContent = S.photos.length || document.getElementById('lt-to').value.trim() || document.getElementById('lt-sign').value.trim();
      if ((body || hasOtherContent) && !confirm("This will replace your current letter and photos. Switch cards anyway?")) return;
      loadDemoTemplate(key);
      setOcc(key);
      document.getElementById('demo-panel').open = false;
      toast('A starter letter is on your page. Make it yours 💛', 'ok');
      pipSay('Nice pick! Change any words you like.');
      const occBtn = document.querySelector('.occ[data-k="' + key + '"]');
      if (occBtn) { const r = occBtn.getBoundingClientRect(); burstAt(r.left + r.width / 2, r.top + r.height / 2, 10); }
      document.getElementById('lt-to').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
    }

    function setOcc(key) {
      document.querySelectorAll('.occ').forEach(o => { const on = o.dataset.k === key; o.classList.toggle('sel', on); o.setAttribute('aria-pressed', on); });
      document.getElementById('composer').dataset.mood = key || '';
    }

    function clearLetter(skipConfirm) {
      const body = document.getElementById('lt-body').value.trim();
      const hasContent = body || S.photos.length || document.getElementById('lt-to').value.trim() || document.getElementById('lt-sign').value.trim();
      if (!skipConfirm && hasContent && !confirm('Start a fresh page? Your current words and photos will be cleared.')) return;
      ['lt-to', 'lt-body', 'lt-sign', 'sname', 'subj'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
      });
      S.photos = []; S.cur = 0; renderAlbum(); updateBadge();
      updateWordCount();
      localStorage.removeItem('ppx-draft');
      setOcc('blank');
      document.getElementById('demo-panel').open = false;
      toast('A fresh, blank page. Take your time 🌸', '');
      pipSay('A clean page! Start with "Dear…" and see where it goes.');
      document.getElementById('lt-body').focus();
    }

    // ─── LETTER EXPERIENCE SYSTEM ────────────────────────────────

    function gatherLetterData() {
      return {
        to: document.getElementById('lt-to').value || 'Dear friend,',
        body: document.getElementById('lt-body').value || '',
        sign: document.getElementById('lt-sign').value || 'With love',
        date: document.getElementById('lt-date').textContent,
        from: document.getElementById('sname')?.value || '',
        paper: S.paper || 'c',
        stamp: S.stamp, wax: S.wax,
        photos: S.photos || []
      };
    }

    let saveTimer;
    function updateWordCount() {
      const text = document.getElementById('lt-body').value.trim();
      const words = text === '' ? 0 : text.split(/\s+/).length;
      document.getElementById('wordCount').textContent = words + (words === 1 ? ' word' : ' words');
      updateDesk();
      return words;
    }

    function updateDesk() {
      const body = document.getElementById('lt-body').value.trim();
      const title = document.getElementById('deskTitle');
      const detail = document.getElementById('deskDetail');
      if (!title || !detail) return;
      const count = body ? body.split(/\s+/).length : 0;
      title.textContent = count ? 'Your letter is taking shape' : 'A little space for your words';
      detail.textContent = count
        ? count + (count === 1 ? ' word' : ' words') + ' written' + (S.photos.length ? ' \u00b7 ' + S.photos.length + (S.photos.length === 1 ? ' photo' : ' photos') + ' tucked in' : ' \u00b7 photos are optional')
        : (S.photos.length ? S.photos.length + (S.photos.length === 1 ? ' photo' : ' photos') + ' tucked in \u00b7 add a few words when you are ready.' : 'Start with a blank page or choose a starter below.');
    }

    function setupDesk() {
      const composer = document.getElementById('composer');
      const toggle = document.getElementById('quietToggle');
      toggle.addEventListener('click', () => {
        const active = toggle.getAttribute('aria-pressed') !== 'true';
        toggle.setAttribute('aria-pressed', active);
        toggle.textContent = 'Quiet writing: ' + (active ? 'on' : 'off');
        composer.classList.toggle('quiet-writing', active);
      });
      updateDesk();

      const links = [...document.querySelectorAll('.nav-links a, .mnav a')].filter(a => a.hash && document.querySelector(a.hash));
      const sections = [...new Set(links.map(a => document.querySelector(a.hash)))];
      let ticking = false;
      function updateNavigation() {
        ticking = false;
        const line = document.querySelector('.nav').offsetHeight + 40;
        let current = null;
        sections.forEach(section => { if (section.getBoundingClientRect().top <= line) current = section.id; });
        links.forEach(link => {
          if (current && link.hash === '#' + current) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
      addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(updateNavigation); }
      }, { passive: true });
      addEventListener('resize', updateNavigation);
      updateNavigation();
    }

    let pipLast = -1;
    document.getElementById('lt-body').addEventListener('input', function () {
      const w = updateWordCount();
      const bucket = w === 0 ? 0 : w < 15 ? 1 : w < 60 ? 2 : w < 150 ? 3 : 4;
      if (bucket !== pipLast) { pipLast = bucket; pipSay(pipForWords(w)); }
    });

    document.getElementById('lt-body').addEventListener('input', function(e) {
      updateWordCount();
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        saveLetterLocally();
        const ind = document.getElementById('autoSaveInd');
        ind.style.opacity = '1';
        setTimeout(() => ind.style.opacity = '0', 2000);
      }, 1000);
    });

    // Save letter locally with quota protection
    function saveLetterLocally() {
      var data = gatherLetterData();
      var uuid = 'ppx-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      var json = JSON.stringify(data);
      var success = true;
      try {
        localStorage.setItem('ppx-letter-' + uuid, json);
        localStorage.setItem('ppx-latest-preview', json);
      } catch (e) {
        try {
          sessionStorage.setItem('ppx-letter-' + uuid, json);
          sessionStorage.setItem('ppx-latest-preview', json);
        } catch (e2) {
          success = false;
        }
      }
      return { uuid: uuid, data: data, success: success };
    }

    // Open the Next.js letter preview with the saved letter id.
    function previewLetter() {
      var res = saveLetterLocally();
      if (!res.success) {
        toast("Couldn't save just yet. Try fewer or smaller photos 🌸", 'err');
        return;
      }
      
      var targetUrl = sitePath('/view/?id=' + encodeURIComponent(res.uuid));
      var win = window.open(targetUrl, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = targetUrl;
      } else {
        toast('Opening your letter preview! ✨', 'ok');
      }
    }

    // Generate standalone self-contained HTML
    function generateStandaloneHTML(letterData) {
      return fetch(sitePath('/letter-viewer-effects.js'))
        .then(function(response) {
          if (!response.ok) throw new Error('Unable to prepare the letter preview.');
          return response.text();
        })
        .then(function(effectsScript) {
        var template = decodeURIComponent(escape(atob('PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KPGhlYWQ+CjxtZXRhIGNoYXJzZXQ9IlVURi04Ij4KPG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLjAsIG1heGltdW0tc2NhbGU9MS4wLCB1c2VyLXNjYWxhYmxlPW5vIj4KPHRpdGxlPkEgTGV0dGVyICYgUGhvdG8gQWxidW0g4pyJ77iP8J+TljwvdGl0bGU+CjxsaW5rIHJlbD0icHJlY29ubmVjdCIgaHJlZj0iaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbSI+CjxsaW5rIHJlbD0icHJlY29ubmVjdCIgaHJlZj0iaHR0cHM6Ly9mb250cy5nc3RhdGljLmNvbSIgY3Jvc3NvcmlnaW4+CjxsaW5rIGhyZWY9Imh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9UHJlc3MrU3RhcnQrMlAmZmFtaWx5PUNhdmVhdDp3Z2h0QDQwMDs2MDA7NzAwJmZhbWlseT1OdW5pdG86d2dodEA0MDA7NjAwOzcwMDs4MDAmZmFtaWx5PVBhY2lmaWNvJmZhbWlseT1JbmRpZStGbG93ZXImZGlzcGxheT1zd2FwIiByZWw9InN0eWxlc2hlZXQiPgoKPHN0eWxlPgovKiAtLS0gVFJVRSBBTklNRSBQSVhFTCBBUlQgQUVTVEhFVElDIC0tLSAqLwo6cm9vdCB7CiAgLS1jcmVhbTogI0ZGRkRGNTsgCiAgLS1ibHVzaDogI0ZGQjhEMDsgCiAgLS1sYXY6ICNDOEE4RkY7IAogIC0tbWludDogIzhGRERDODsgCiAgLS1wZWFjaDogI0ZGRDRBODsKICAtLXNreTogI0E4RDRGRjsgCiAgLS15ZWw6ICNGRkUwNjY7IAogIC0tYnI6ICM0QTM3Mjg7IAogIC0tYmRyOiAjNUMzRDJFOwogIC0tYmctdG9wOiAjRkY5QjcxOwogIC0tYmctYm90OiAjRkZENEE4OwogIC0tcGl4ZWwtc2hhZG93OiA0cHggNHB4IDAgdmFyKC0tYmRyKTsKfQoKKiwgKjo6YmVmb3JlLCAqOjphZnRlciB7IGJveC1zaXppbmc6IGJvcmRlci1ib3g7IG1hcmdpbjogMDsgcGFkZGluZzogMDsgfQoKLyogLS0tIENVU1RPTSBQSVhFTCBTQ1JPTExCQVJTIC0tLSAqLwoqIHsgc2Nyb2xsYmFyLWNvbG9yOiB2YXIoLS1ibHVzaCkgcmdiYSgwLDAsMCwwLjEpOyBzY3JvbGxiYXItd2lkdGg6IHRoaW47IH0KOjotd2Via2l0LXNjcm9sbGJhciB7IHdpZHRoOiAxMHB4OyB9Cjo6LXdlYmtpdC1zY3JvbGxiYXItdHJhY2sgeyBiYWNrZ3JvdW5kOiByZ2JhKDAsMCwwLDAuMDUpOyBib3JkZXItbGVmdDogM3B4IHNvbGlkIHZhcigtLWJkcik7IH0KOjotd2Via2l0LXNjcm9sbGJhci10aHVtYiB7IGJhY2tncm91bmQ6IHZhcigtLWJsdXNoKTsgYm9yZGVyOiAycHggc29saWQgdmFyKC0tYmRyKTsgfQoKaHRtbCwgYm9keSB7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7IG92ZXJmbG93OiBoaWRkZW47IGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgtNDVkZWcsICMwRDBCMkIsICMxQTEwNDIsICMyODE2NEUsICMzQTIzNUQpOyBiYWNrZ3JvdW5kLXNpemU6IDQwMCUgNDAwJTsgY29sb3I6IHZhcigtLWJyKTsgZm9udC1mYW1pbHk6ICdPdXRmaXQnLCBzYW5zLXNlcmlmOyB0b3VjaC1hY3Rpb246IG1hbmlwdWxhdGlvbjsgLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOiB0cmFuc3BhcmVudDsgYW5pbWF0aW9uOiBzY2VuZS1mYWRlLWluIDJzIGN1YmljLWJlemllcigwLjIsIDAuOCwgMC4yLCAxKSBmb3J3YXJkcywgbWVzaC1ncmFkaWVudCAxNXMgZWFzZSBpbmZpbml0ZTsgfQpAa2V5ZnJhbWVzIG1lc2gtZ3JhZGllbnQgeyAwJSB7IGJhY2tncm91bmQtcG9zaXRpb246IDAlIDUwJTsgfSA1MCUgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMDAlIDUwJTsgfSAxMDAlIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCUgNTAlOyB9IH0KQGtleWZyYW1lcyBzY2VuZS1mYWRlLWluIHsgMCUgeyBvcGFjaXR5OiAwOyBmaWx0ZXI6IGJyaWdodG5lc3MoMC41KTsgfSAxMDAlIHsgb3BhY2l0eTogMTsgZmlsdGVyOiBicmlnaHRuZXNzKDEpOyB9IH0KCgovKiBHb2xkZW4gSG91ciBBZGRpdGlvbnMgKi8KCi5oYW5naW5nLWxhbnRlcm4gewogIHBvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAtMTBweDsgcmlnaHQ6IDEydnc7IGZvbnQtc2l6ZTogNzBweDsKICB0cmFuc2Zvcm0tb3JpZ2luOiB0b3AgY2VudGVyOyBhbmltYXRpb246IHN3YXkgNnMgZWFzZS1pbi1vdXQgaW5maW5pdGU7CiAgZmlsdGVyOiBkcm9wLXNoYWRvdygwIDAgNDBweCByZ2JhKDI1NSwgMTYwLCAxMjAsIDAuOCkpOyB6LWluZGV4OiA1Owp9CkBrZXlmcmFtZXMgc3dheSB7IDAlLCAxMDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoLTVkZWcpOyB9IDUwJSB7IHRyYW5zZm9ybTogcm90YXRlKDVkZWcpOyB9IH0KCi5zZXR0aW5nLXN1biB7CiAgcG9zaXRpb246IGFic29sdXRlOyBib3R0b206IDI1dmg7IGxlZnQ6IDUwJTsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpOwogIHdpZHRoOiAyNTBweDsgaGVpZ2h0OiAyNTBweDsgYmFja2dyb3VuZDogI0ZGQUU3MzsgYm9yZGVyLXJhZGl1czogNTAlOwogIGJveC1zaGFkb3c6IDAgMCA4MHB4ICNGRjlCNzEsIDAgMCAxNTBweCByZ2JhKDI1NSwgMTU1LCAxMTMsIDAuNik7IHotaW5kZXg6IDI7IG9wYWNpdHk6IDAuOTsKfQouc3VuYmVhbSB7CiAgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IC0yMHZoOyBib3R0b206IDI1dmg7CiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEwNWRlZywgdHJhbnNwYXJlbnQsIHJnYmEoMjU1LCAyNDAsIDIwMCwgMC4yNSkgNDAlLCByZ2JhKDI1NSwgMjMwLCAxNTAsIDAuMTUpIDYwJSwgdHJhbnNwYXJlbnQpOwogIHRyYW5zZm9ybTogcm90YXRlKDI1ZGVnKTsgcG9pbnRlci1ldmVudHM6IG5vbmU7IHotaW5kZXg6IDQ7CiAgYW5pbWF0aW9uOiBwdWxzZS1saWdodCA2cyBpbmZpbml0ZSBhbHRlcm5hdGU7IG1peC1ibGVuZC1tb2RlOiBvdmVybGF5Owp9CkBrZXlmcmFtZXMgcHVsc2UtbGlnaHQgeyAwJSB7IG9wYWNpdHk6IDAuNTsgfSAxMDAlIHsgb3BhY2l0eTogMTsgfSB9CgouZHVzdC1tb3RlIHsKICBwb3NpdGlvbjogYWJzb2x1dGU7IHdpZHRoOiA0cHg7IGhlaWdodDogNHB4OyBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjQwLCAxODAsIDAuOCk7CiAgYm94LXNoYWRvdzogMCAwIDZweCByZ2JhKDI1NSwyNTUsMjU1LDAuOSk7IHBvaW50ZXItZXZlbnRzOiBub25lOyB6LWluZGV4OiA1OwogIGFuaW1hdGlvbjogZHJpZnQtbW90ZSBsaW5lYXIgaW5maW5pdGU7IG9wYWNpdHk6IDA7Cn0KQGtleWZyYW1lcyBkcmlmdC1tb3RlIHsKICAwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDApOyBvcGFjaXR5OiAwOyB9CiAgMTAlIHsgb3BhY2l0eTogMTsgfSA5MCUgeyBvcGFjaXR5OiAxOyB9CiAgMTAwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlKDYwcHgsIC04MHB4KTsgb3BhY2l0eTogMDsgfQp9CgovKiBCYWNrZ3JvdW5kICYgRGVzayAqLwoKLmRlc2staXRlbS10ZWFjdXAgewogIHBvc2l0aW9uOiBhYnNvbHV0ZTsgYm90dG9tOiA4dmg7IGxlZnQ6IDE1dnc7IGZvbnQtc2l6ZTogNTBweDsgei1pbmRleDogMTU7CiAgZmlsdGVyOiBkcm9wLXNoYWRvdyg4cHggOHB4IDAgcmdiYSgwLDAsMCwwLjMpKTsKfQouc3RlYW0gewogIHBvc2l0aW9uOiBhYnNvbHV0ZTsgYm90dG9tOiA0MHB4OyB3aWR0aDogNnB4OyBoZWlnaHQ6IDIwcHg7CiAgYmFja2dyb3VuZDogcmdiYSgyNTUsMjU1LDI1NSwwLjQpOyBib3JkZXItcmFkaXVzOiAxMHB4OyBmaWx0ZXI6IGJsdXIoMnB4KTsKICBhbmltYXRpb246IHJpc2Utc3RlYW0gM3MgaW5maW5pdGUgZWFzZS1vdXQ7IG9wYWNpdHk6IDA7IHBvaW50ZXItZXZlbnRzOiBub25lOwp9CkBrZXlmcmFtZXMgcmlzZS1zdGVhbSB7CiAgMCUgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCkgc2NhbGUoMSk7IG9wYWNpdHk6IDA7IH0KICAyMCUgeyBvcGFjaXR5OiAxOyB9CiAgMTAwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNTBweCkgc2NhbGUoMik7IG9wYWNpdHk6IDA7IH0KfQoKI2Vudmlyb25tZW50IHsgcG9zaXRpb246IGZpeGVkOyBpbnNldDogMDsgei1pbmRleDogMTsgZGlzcGxheTogZmxleDsgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHRvIGJvdHRvbSwgI0ZGOUI3MSAwJSwgI0ZGRDRBOCA2MCUsICNGRkU5RDYgMTAwJSk7IGltYWdlLXJlbmRlcmluZzogcGl4ZWxhdGVkOyB9CiNlbnZpcm9ubWVudDo6YWZ0ZXIgeyBkaXNwbGF5OiBub25lOyB9CiNzdGFycyB7IAogIHBvc2l0aW9uOiBhYnNvbHV0ZTsgaW5zZXQ6IDA7IHBvaW50ZXItZXZlbnRzOiBub25lOyBvcGFjaXR5OiAwLjU7CiAgYmFja2dyb3VuZC1pbWFnZTogcmFkaWFsLWdyYWRpZW50KDJweCAycHggYXQgMjBweCAzMHB4LCAjZmZmLCB0cmFuc3BhcmVudCksIHJhZGlhbC1ncmFkaWVudCgycHggMnB4IGF0IDQwcHggNzBweCwgI2ZmZiwgdHJhbnNwYXJlbnQpLCByYWRpYWwtZ3JhZGllbnQoMnB4IDJweCBhdCA1MHB4IDE2MHB4LCAjZmZmLCB0cmFuc3BhcmVudCksIHJhZGlhbC1ncmFkaWVudCgycHggMnB4IGF0IDkwcHggNDBweCwgI2ZmZiwgdHJhbnNwYXJlbnQpOwogIGJhY2tncm91bmQtcmVwZWF0OiByZXBlYXQ7IGJhY2tncm91bmQtc2l6ZTogMTUwcHggMTUwcHg7IAogIGFuaW1hdGlvbjogdHdpbmtsZSA0cyBpbmZpbml0ZSBhbHRlcm5hdGU7IGZpbHRlcjogbm9uZTsgCn0KQGtleWZyYW1lcyB0d2lua2xlIHsgMCUgeyBvcGFjaXR5OiAwLjI7IH0gMTAwJSB7IG9wYWNpdHk6IDAuODsgfSB9CgovKiBQaXhlbCBDbG91ZHMgKi8KLnBpeGVsLWNsb3VkIHsgcG9zaXRpb246IGFic29sdXRlOyB3aWR0aDogMTZweDsgaGVpZ2h0OiAxNnB4OyBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwyNTUsMjU1LDAuMSk7IGJveC1zaGFkb3c6IDE2cHggMCAwIHJnYmEoMjU1LDI1NSwyNTUsMC4xKSwgMzJweCAwIDAgcmdiYSgyNTUsMjU1LDI1NSwwLjEpLCA0OHB4IDAgMCByZ2JhKDI1NSwyNTUsMjU1LDAuMSksIDY0cHggMCAwIHJnYmEoMjU1LDI1NSwyNTUsMC4xKSwgMTZweCAtMTZweCAwIHJnYmEoMjU1LDI1NSwyNTUsMC4xKSwgMzJweCAtMTZweCAwIHJnYmEoMjU1LDI1NSwyNTUsMC4xKSwgNDhweCAtMTZweCAwIHJnYmEoMjU1LDI1NSwyNTUsMC4xKSwgMzJweCAtMzJweCAwIHJnYmEoMjU1LDI1NSwyNTUsMC4xKTsgYW5pbWF0aW9uOiBkcmlmdCBsaW5lYXIgaW5maW5pdGU7IG9wYWNpdHk6IDA7IH0KQGtleWZyYW1lcyBkcmlmdCB7IDAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yMHZ3KTsgb3BhY2l0eTogMDsgfSAxMCUgeyBvcGFjaXR5OiAxOyB9IDkwJSB7IG9wYWNpdHk6IDE7IH0gMTAwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMjB2dyk7IG9wYWNpdHk6IDA7IH0gfQoKI2Rlc2sgeyBwb3NpdGlvbjogYWJzb2x1dGU7IGJvdHRvbTogMDsgd2lkdGg6IDEwMCU7IGhlaWdodDogMjV2aDsgYmFja2dyb3VuZDogIzg1NUU0MjsgYm9yZGVyLXRvcDogOHB4IHNvbGlkICM1QzNEMkU7IGJveC1zaGFkb3c6IGluc2V0IDAgOHB4IDAgcmdiYSgwLDAsMCwwLjIpOyBpbWFnZS1yZW5kZXJpbmc6IHBpeGVsYXRlZDsgfQojZGVzazo6YmVmb3JlIHsKICBjb250ZW50OiAnJzsgcG9zaXRpb246IGFic29sdXRlOyBpbnNldDogMDsKICBiYWNrZ3JvdW5kLWltYWdlOiByZXBlYXRpbmctbGluZWFyLWdyYWRpZW50KDkwZGVnLCB0cmFuc3BhcmVudCwgdHJhbnNwYXJlbnQgNjRweCwgcmdiYSgwLDAsMCwwLjIpIDY0cHgsIHJnYmEoMCwwLDAsMC4yKSA2OHB4KSwKICAgICAgICAgICAgICAgICAgICByZXBlYXRpbmctbGluZWFyLWdyYWRpZW50KDBkZWcsIHJnYmEoMCwwLDAsMC4wNSkgMCwgcmdiYSgwLDAsMCwwLjA1KSA0cHgsIHRyYW5zcGFyZW50IDRweCwgdHJhbnNwYXJlbnQgMTZweCk7CiAgcG9pbnRlci1ldmVudHM6IG5vbmU7IG1peC1ibGVuZC1tb2RlOiBub3JtYWw7IG9wYWNpdHk6IDE7Cn0KI2Rlc2s6OmFmdGVyIHsgZGlzcGxheTogbm9uZTsgfQoKLyogQ1JUIFNjYW5saW5lcyAqLwojc2NhbmxpbmVzIHsgcG9zaXRpb246IGZpeGVkOyBpbnNldDogMDsgcG9pbnRlci1ldmVudHM6IG5vbmU7IHotaW5kZXg6IDk5OTsgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHJnYmEoMTgsIDE2LCAxNiwgMCkgNTAlLCByZ2JhKDAsIDAsIDAsIDAuMSkgNTAlKSwgbGluZWFyLWdyYWRpZW50KDkwZGVnLCByZ2JhKDI1NSwgMCwgMCwgMC4wMyksIHJnYmEoMCwgMjU1LCAwLCAwLjAxKSwgcmdiYSgwLCAwLCAyNTUsIDAuMDMpKTsgYmFja2dyb3VuZC1zaXplOiAxMDAlIDRweCwgNnB4IDEwMCU7IGJveC1zaGFkb3c6IGluc2V0IDAgMCAxMDBweCByZ2JhKDAsMCwwLDAuNSk7IG9wYWNpdHk6IDAuODsgfQoKLyogVUkgTGF5ZXIgKi8KLnVpLWxheWVyIHsgcG9zaXRpb246IGZpeGVkOyBpbnNldDogMDsgei1pbmRleDogMTAwOyBwb2ludGVyLWV2ZW50czogbm9uZTsgZGlzcGxheTogZmxleDsgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBwYWRkaW5nOiAyMHB4OyB9Ci50b3AtYmFyIHsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgZ2FwOiAxMHB4OyB9CgovKiBSUEcgRGlhbG9nIFN0eWxlIEJ1dHRvbnMgKi8KLmJ0biwgLnN0YXR1cy1jaGlwIHsgCiAgcG9pbnRlci1ldmVudHM6IGF1dG87IGZvbnQtZmFtaWx5OiAnTnVuaXRvJywgc2Fucy1zZXJpZjsgZm9udC1zaXplOiAxNHB4OyBmb250LXdlaWdodDogODAwOyBib3JkZXItcmFkaXVzOiAwcHg7IAogIGNvbG9yOiB2YXIoLS1icik7IGJvcmRlcjogNHB4IHNvbGlkIHZhcigtLWJkcik7IAogIGJveC1zaGFkb3c6IDRweCA0cHggMCByZ2JhKDAsMCwwLDAuMik7IGJhY2tncm91bmQ6IHZhcigtLWNyZWFtKTsgCiAgcGFkZGluZzogMTBweCAyMHB4OyBjdXJzb3I6IHBvaW50ZXI7IHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjFzLCBib3gtc2hhZG93IDAuMXMsIGJhY2tncm91bmQgMC4xczsgCiAgdGV4dC1kZWNvcmF0aW9uOiBub25lOyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IHBvc2l0aW9uOiByZWxhdGl2ZTsgCiAgdGV4dC1zaGFkb3c6IG5vbmU7IGJhY2tkcm9wLWZpbHRlcjogbm9uZTsgLXdlYmtpdC1iYWNrZHJvcC1maWx0ZXI6IG5vbmU7IGltYWdlLXJlbmRlcmluZzogcGl4ZWxhdGVkOwp9Ci5idG46OmJlZm9yZSB7IGNvbnRlbnQ6ICcnOyBwb3NpdGlvbjogYWJzb2x1dGU7IGluc2V0OiAtOHB4OyBib3JkZXI6IDRweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuNSk7IHBvaW50ZXItZXZlbnRzOiBub25lOyBvcGFjaXR5OiAwOyB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMnM7IH0KLmJ0bjpob3ZlciB7IGJhY2tncm91bmQ6IHZhcigtLXBlYWNoKTsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTJweCwgLTJweCk7IGJveC1zaGFkb3c6IDZweCA2cHggMCByZ2JhKDAsMCwwLDAuMik7IGJvcmRlci1jb2xvcjogdmFyKC0tYmRyKTsgfQouYnRuOmFjdGl2ZSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlKDRweCwgNHB4KTsgYm94LXNoYWRvdzogMHB4IDBweCAwIHJnYmEoMCwwLDAsMCk7IH0KCi5zdGF0dXMtY2hpcCB7IGJhY2tncm91bmQ6IHZhcigtLWNyZWFtKTsgY29sb3I6IHZhcigtLWJyKTsgY3Vyc29yOiBkZWZhdWx0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDhweDsgYm9yZGVyOiA0cHggc29saWQgdmFyKC0tYmRyKTsgfQouc3RhdHVzLWNoaXA6OmJlZm9yZSB7IGNvbnRlbnQ6ICfinKgnOyBhbmltYXRpb246IHB1bHNlIDFzIGluZmluaXRlIGFsdGVybmF0ZTsgZmlsdGVyOiBub25lOyB9CkBrZXlmcmFtZXMgcHVsc2UgeyAwJSB7IG9wYWNpdHk6IDAuNTsgdHJhbnNmb3JtOiBzY2FsZSgwLjkpOyB9IDEwMCUgeyBvcGFjaXR5OiAxOyB0cmFuc2Zvcm06IHNjYWxlKDEuMSk7IH0gfQoKLmJvdHRvbS1iYXIgeyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogZmxleC1lbmQ7IGp1c3RpZnktY29udGVudDogY2VudGVyOyBwYWRkaW5nLWJvdHRvbTogMjRweDsgZ2FwOiAxNnB4OyBwb2ludGVyLWV2ZW50czogbm9uZTsgfQouYWN0aW9uLWJ0biB7IGJhY2tncm91bmQ6ICM1QzYyQzUgIWltcG9ydGFudDsgYm9yZGVyOiA0cHggc29saWQgdmFyKC0tYmRyKTsgY29sb3I6IHZhcigtLWNyZWFtKSAhaW1wb3J0YW50OyBvcGFjaXR5OiAwOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMjBweCk7IHBvaW50ZXItZXZlbnRzOiBub25lOyB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4ycywgb3BhY2l0eSAwLjJzOyB0ZXh0LXNoYWRvdzogMnB4IDJweCAwIHJnYmEoMCwwLDAsMC4zKTsgYm94LXNoYWRvdzogNHB4IDRweCAwIHJnYmEoMCwwLDAsMC4zKTsgYm9yZGVyLXJhZGl1czogMHB4OyBwYWRkaW5nOiAxMnB4IDI0cHg7IGZvbnQtZmFtaWx5OiAnTnVuaXRvJywgc2Fucy1zZXJpZjsgZm9udC13ZWlnaHQ6IDgwMDsgZm9udC1zaXplOiAxNnB4OyBsZXR0ZXItc3BhY2luZzogMnB4OyBjdXJzb3I6IHBvaW50ZXI7IHRleHQtZGVjb3JhdGlvbjogbm9uZTsgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgaW1hZ2UtcmVuZGVyaW5nOiBwaXhlbGF0ZWQ7IH0KLmFjdGlvbi1idG46aG92ZXIgeyBiYWNrZ3JvdW5kOiAjN0E4MUU4ICFpbXBvcnRhbnQ7IHRyYW5zZm9ybTogdHJhbnNsYXRlKC0ycHgsIC0ycHgpOyBib3gtc2hhZG93OiA2cHggNnB4IDAgcmdiYSgwLDAsMCwwLjMpOyB9Ci5hY3Rpb24tYnRuLmFjdGl2ZSB7IG9wYWNpdHk6IDE7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTsgcG9pbnRlci1ldmVudHM6IGF1dG87IH0KLmFjdGlvbi1idG4uc2Vjb25kYXJ5IHsgYmFja2dyb3VuZDogIzQzNDc5MSAhaW1wb3J0YW50OyB9Ci5hY3Rpb24tYnRuLnNlY29uZGFyeTpob3ZlciB7IGJhY2tncm91bmQ6ICM1OTVFQjUgIWltcG9ydGFudDsgfQoKCi8qIFNob290aW5nIFN0YXIgKi8KLnNob290aW5nLXN0YXIgeyBwb3NpdGlvbjogYWJzb2x1dGU7IHdpZHRoOiA2MHB4OyBoZWlnaHQ6IDRweDsgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDkwZGVnLCByZ2JhKDI1NSwyNTUsMjU1LDApLCByZ2JhKDI1NSwyNTUsMjU1LDAuOCksICNmZmYpOyB0cmFuc2Zvcm06IHJvdGF0ZSgtMzVkZWcpOyBvcGFjaXR5OiAwOyBhbmltYXRpb246IHNob290aW5nIDEycyBsaW5lYXIgaW5maW5pdGU7IHBvaW50ZXItZXZlbnRzOiBub25lOyB9CkBrZXlmcmFtZXMgc2hvb3RpbmcgeyAwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlKDEyMHZ3LCAtMjB2aCkgcm90YXRlKC0zNWRlZykgc2NhbGUoMSk7IG9wYWNpdHk6IDA7IH0gMiUgeyBvcGFjaXR5OiAxOyB9IDglIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTIwdncsIDgwdmgpIHJvdGF0ZSgtMzVkZWcpIHNjYWxlKDEpOyBvcGFjaXR5OiAwOyB9IDEwMCUgeyBvcGFjaXR5OiAwOyB9IH0KCi8qIFNwYXJrbGVzICovCi5tYWdpY2FsLXNwYXJrbGUgeyBwb3NpdGlvbjogYWJzb2x1dGU7IGZvbnQtc2l6ZTogMjRweDsgY29sb3I6IHZhcigtLXllbCk7IG9wYWNpdHk6IDA7IHBvaW50ZXItZXZlbnRzOiBub25lOyB0cmFuc2l0aW9uOiBhbGwgMXM7IGZpbHRlcjogZHJvcC1zaGFkb3coMnB4IDJweCAwIHZhcigtLWJkcikpOyB6LWluZGV4OiA2MDsgfQouY2FyZC1mdWxsc2NyZWVuLm9wZW4gfiAubWFnaWNhbC1zcGFya2xlLCAuaXRlbS1wb3NpdGlvbmVyLm9wZW5lZCB+IC5tYWdpY2FsLXNwYXJrbGUgeyBhbmltYXRpb246IHNwYXJrbGUtcG9wIDJzIGVhc2UtaW4tb3V0IGluZmluaXRlIGFsdGVybmF0ZTsgfQpAa2V5ZnJhbWVzIHNwYXJrbGUtcG9wIHsgMCUgeyB0cmFuc2Zvcm06IHNjYWxlKDApIHJvdGF0ZSgwZGVnKTsgb3BhY2l0eTogMDsgfSA1MCUgeyB0cmFuc2Zvcm06IHNjYWxlKDEuNSkgcm90YXRlKDE4MGRlZyk7IG9wYWNpdHk6IDE7IH0gMTAwJSB7IHRyYW5zZm9ybTogc2NhbGUoMC44KSByb3RhdGUoMzYwZGVnKTsgb3BhY2l0eTogMDsgfSB9CgovKiAtLS0gMkQgU0NFTkUgQ09OVEFJTkVSIC0tLSAqLwojc2NlbmUgeyBwb3NpdGlvbjogZml4ZWQ7IGluc2V0OiAwOyB6LWluZGV4OiAxMDsgZGlzcGxheTogYmxvY2s7IHBlcnNwZWN0aXZlOiAyMDAwcHg7IH0KCi8qIC0tLSBJRExFIEFOSU1BVElPTlMgLS0tICovCkBrZXlmcmFtZXMgZmxvYXQtbGVmdCB7IDAlLCAxMDAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApIHJvdGF0ZSgtMmRlZyk7IH0gNTAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xMnB4KSByb3RhdGUoMGRlZyk7IH0gfQpAa2V5ZnJhbWVzIGZsb2F0LXJpZ2h0IHsgMCUsIDEwMCUgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCkgcm90YXRlKDJkZWcpOyB9IDUwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMTBweCkgcm90YXRlKDBkZWcpOyB9IH0KQGtleWZyYW1lcyBkcm9wLXNoYWRvdy1wdWxzZSB7IAogIDAlLCAxMDAlIHsgZmlsdGVyOiBkcm9wLXNoYWRvdyg4cHggOHB4IDAgcmdiYSgwLDAsMCwwLjIpKSBkcm9wLXNoYWRvdygwIDAgMTBweCByZ2JhKDI1NSwxODQsMjA4LDAuMikpOyB9IAogIDUwJSB7IGZpbHRlcjogZHJvcC1zaGFkb3coMTJweCAxNnB4IDAgcmdiYSgwLDAsMCwwLjE1KSkgZHJvcC1zaGFkb3coMCAwIDMwcHggcmdiYSgyNTUsMTg0LDIwOCwwLjcpKTsgfSAKfQoKLmlkbGUtZmxvYXQgeyBhbmltYXRpb246IGZsb2F0LWxlZnQgNHMgZWFzZS1pbi1vdXQgaW5maW5pdGUsIGRyb3Atc2hhZG93LXB1bHNlIDRzIGVhc2UtaW4tb3V0IGluZmluaXRlOyB9Ci5pZGxlLWZsb2F0LWFsdCB7IGFuaW1hdGlvbjogZmxvYXQtcmlnaHQgMy41cyBlYXNlLWluLW91dCBpbmZpbml0ZSwgZHJvcC1zaGFkb3ctcHVsc2UgMy41cyBlYXNlLWluLW91dCBpbmZpbml0ZTsgfQouaWRsZS1mbG9hdCAuZW52ZWxvcGUtc2VhbCB7IGFuaW1hdGlvbjogaGVhcnRiZWF0IDEuMnMgaW5maW5pdGU7IH0KCi5jYXJkLWZ1bGxzY3JlZW4gewogIHBvc2l0aW9uOiBmaXhlZDsgbGVmdDogNTAlOyB0b3A6IDUwJTsgd2lkdGg6IDQyMHB4OyBoZWlnaHQ6IDYwMHB4OwogIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpIHNjYWxlKDAuOCk7IHotaW5kZXg6IDUwOyBkaXNwbGF5OiBmbGV4OwogIHBvaW50ZXItZXZlbnRzOiBub25lOyBvcGFjaXR5OiAwOyB0cmFuc2l0aW9uOiBhbGwgMS4ycyBjdWJpYy1iZXppZXIoMC4zNCwgMS44LCAwLjY0LCAxKTsKICBiYWNrZ3JvdW5kOiB2YXIoLS1jcmVhbSk7IGJvcmRlci1yYWRpdXM6IDBweDsgYm9yZGVyOiA0cHggc29saWQgdmFyKC0tYmRyKTsKICBib3gtc2hhZG93OiAxMnB4IDEycHggMCByZ2JhKDAsMCwwLDAuMTUpOwogIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IG92ZXJmbG93LXk6IGF1dG87IG92ZXJmbG93LXg6IGhpZGRlbjsKICBzY3JvbGxiYXItd2lkdGg6IG5vbmU7IC1tcy1vdmVyZmxvdy1zdHlsZTogbm9uZTsKfQouY2FyZC1mdWxsc2NyZWVuOjotd2Via2l0LXNjcm9sbGJhciB7IGRpc3BsYXk6IG5vbmU7IH0KLmNhcmQtZnVsbHNjcmVlbi5vcGVuIHsKICBvcGFjaXR5OiAxOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKSBzY2FsZSgxKTsgcG9pbnRlci1ldmVudHM6IGF1dG87Cn0KLmxldHRlci1jb250ZW50LXNjcm9sbCB7CiAgcGFkZGluZzogNTBweCA0MHB4IDQwcHggNDBweDsgZm9udC1mYW1pbHk6IHZhcigtLWxldHRlci1mb250LCAnQ2F2ZWF0JyksIGN1cnNpdmU7IGZvbnQtc2l6ZTogMjRweDsgbGluZS1oZWlnaHQ6IDQwcHg7CiAgY29sb3I6IHZhcigtLWJyKTsgd2lkdGg6IDEwMCU7IGJveC1zaXppbmc6IGJvcmRlci1ib3g7IHBvc2l0aW9uOiByZWxhdGl2ZTsKICBiYWNrZ3JvdW5kLWltYWdlOiByZXBlYXRpbmctbGluZWFyLWdyYWRpZW50KHRyYW5zcGFyZW50LCB0cmFuc3BhcmVudCAzOXB4LCByZ2JhKDAsMCwwLDAuMDYpIDM5cHgsIHJnYmEoMCwwLDAsMC4wNikgNDBweCk7CiAgYmFja2dyb3VuZC1wb3NpdGlvbjogMCA0NXB4OwogIGJhY2tncm91bmQtYXR0YWNobWVudDogbG9jYWw7Cn0KLmxldHRlci1jb250ZW50LXNjcm9sbCAucG9sYXJvaWQgeyBtYXJnaW46IDQwcHggYXV0bzsgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuNHMgY3ViaWMtYmV6aWVyKDAuMzQsIDEuNTYsIDAuNjQsIDEpLCBib3gtc2hhZG93IDAuNHMgZWFzZTsgfQoubGV0dGVyLWNvbnRlbnQtc2Nyb2xsIC5wb2xhcm9pZDpob3ZlciB7IHRyYW5zZm9ybTogc2NhbGUoMS4wNSkgcm90YXRlKDBkZWcpIHRyYW5zbGF0ZVkoLTVweCkgIWltcG9ydGFudDsgYm94LXNoYWRvdzogMCAxNXB4IDMwcHggcmdiYSgwLDAsMCwwLjMpOyB6LWluZGV4OiAxMDsgfQoubGV0dGVyLWNvbnRlbnQtc2Nyb2xsOjpiZWZvcmUgewogIGNvbnRlbnQ6ICcnOyBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogLTEwcHg7IGxlZnQ6IDUwJTsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpIHJvdGF0ZSgtMmRlZyk7CiAgd2lkdGg6IDEyMHB4OyBoZWlnaHQ6IDMwcHg7IGJhY2tncm91bmQ6IHJnYmEoMjU1LDI1NSwyNTUsMC41KTsgYm9yZGVyOiAxcHggc29saWQgcmdiYSgwLDAsMCwwLjA1KTsKICBib3gtc2hhZG93OiAwIDJweCA1cHggcmdiYSgwLDAsMCwwLjA1KTsKfQoKLmNhcmQtZnVsbHNjcmVlbi5vcGVuIC5sZXR0ZXItcmV2ZWFsIHsKICBvcGFjaXR5OiAwOwogIGFuaW1hdGlvbjogbGV0dGVyLXJldmVhbC1hbmltIDAuOHMgY3ViaWMtYmV6aWVyKDAuMiwgMC44LCAwLjIsIDEpIGZvcndhcmRzOwogIGFuaW1hdGlvbi1kZWxheTogdmFyKC0tZGVsYXksIDEuMHMpOwp9CkBrZXlmcmFtZXMgbGV0dGVyLXJldmVhbC1hbmltIHsKICAwJSB7IG9wYWNpdHk6IDA7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxNXB4KTsgZmlsdGVyOiBibHVyKDRweCk7IH0KICAxMDAlIHsgb3BhY2l0eTogMTsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApOyBmaWx0ZXI6IGJsdXIoMHB4KTsgfQp9Ci5sZXR0ZXItcGFyYSB7IG1hcmdpbi1ib3R0b206IDIwcHg7IHRleHQtYWxpZ246IGp1c3RpZnk7IHBhZGRpbmctcmlnaHQ6IDVweDsgfQoucGFnZS1mcm9udCwgLnBhZ2UtYmFjayB7CiAgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IDA7IGxlZnQ6IDA7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7CiAgLXdlYmtpdC1iYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47IGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjsgYmFja2dyb3VuZDogdmFyKC0tY3JlYW0pOwogIGJvcmRlci1sZWZ0OiA0cHggc29saWQgdmFyKC0tYmRyKTsgYm9yZGVyLXJpZ2h0OiA0cHggc29saWQgdmFyKC0tYmRyKTsKfQoucGFnZS1iYWNrIHsgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7IH0KLnBhZ2UtY29udGVudCB7CiAgcGFkZGluZzogNDBweDsgZm9udC1mYW1pbHk6IHZhcigtLWxldHRlci1mb250LCAnQ2F2ZWF0JyksIGN1cnNpdmU7IGZvbnQtc2l6ZTogMjZweDsgbGluZS1oZWlnaHQ6IDQwcHg7CiAgY29sb3I6IHZhcigtLWJyKTsgd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTsgYm94LXNpemluZzogYm9yZGVyLWJveDsgb3ZlcmZsb3c6IGhpZGRlbjsKfQoucGFnZS1udW1iZXIgewogIHBvc2l0aW9uOiBhYnNvbHV0ZTsgYm90dG9tOiAxNXB4OyB3aWR0aDogMTAwJTsgdGV4dC1hbGlnbjogY2VudGVyOwogIGZvbnQtZmFtaWx5OiAnTnVuaXRvJywgc2Fucy1zZXJpZjsgZm9udC13ZWlnaHQ6IDgwMDsgbGV0dGVyLXNwYWNpbmc6IDAuMDJlbTsgZm9udC1zaXplOiA4cHg7IGNvbG9yOiByZ2JhKDAsMCwwLDAuMik7IHBvaW50ZXItZXZlbnRzOiBub25lOwp9Ci5waG90by1jb250ZW50IHsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7IGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IGJhY2tncm91bmQ6ICNmZmY7IGJvcmRlcjogNHB4IHNvbGlkIHZhcigtLWJkcik7IGJveC1zaXppbmc6IGJvcmRlci1ib3g7IHBhZGRpbmc6IDEycHggMTJweCA0MHB4IDEycHg7IH0KCgovKiAtLS0gU0VBTUxFU1MgUE9TSVRJT05FUlMgLS0tICovCi5pdGVtLXBvc2l0aW9uZXIgeyBwb3NpdGlvbjogYWJzb2x1dGU7IGJvdHRvbTogMTh2aDsgdHJhbnNpdGlvbjogYWxsIDAuOHMgY3ViaWMtYmV6aWVyKDAuMzQsIDEuNTYsIDAuNjQsIDEpOyBjdXJzb3I6IHBvaW50ZXI7IHotaW5kZXg6IDIwOyBhbmltYXRpb246IGlkbGUtZmxvYXQgM3MgZWFzZS1pbi1vdXQgaW5maW5pdGU7IH0KQGtleWZyYW1lcyBpZGxlLWZsb2F0IHsgMCUsIDEwMCUgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7IH0gNTAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xMHB4KTsgfSB9Ci5pdGVtLXBvc2l0aW9uZXIucGlja2VkLXVwLCAuaXRlbS1wb3NpdGlvbmVyLm9wZW5lZCwgLml0ZW0tcG9zaXRpb25lci5oaWRkZW4geyBhbmltYXRpb246IG5vbmUgIWltcG9ydGFudDsgfQouaXRlbS1pbm5lciB7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgaW5zZXQ6IDA7IHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjRzIGN1YmljLWJlemllcigwLjM0LCAxLjU2LCAwLjY0LCAxKSwgZmlsdGVyIDAuNHM7IC13ZWJraXQtdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDsgdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDsgfQoKI2VudlBvcyB7IGxlZnQ6IDM1JTsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpOyB3aWR0aDogMjgwcHg7IGhlaWdodDogMTgwcHg7IH0KI2FsYlBvcyB7IGxlZnQ6IDY1JTsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpOyB3aWR0aDogMjYwcHg7IGhlaWdodDogMzYwcHg7IH0KCi5pdGVtLXBvc2l0aW9uZXI6aG92ZXIgLml0ZW0taW5uZXIgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLThweCk7IGZpbHRlcjogZHJvcC1zaGFkb3coOHB4IDEycHggMCByZ2JhKDAsMCwwLDAuMikpOyBhbmltYXRpb246IG5vbmU7IH0KCgojYWxiUG9zLnBpY2tlZC11cCB7IHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIDUwJSkgc2NhbGUoMS44KSAhaW1wb3J0YW50OyB9Ci5pdGVtLXBvc2l0aW9uZXIucGlja2VkLXVwIHsgbGVmdDogNTAlOyBib3R0b206IDUwJTsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgNTAlKSBzY2FsZSgxLjYpOyBjdXJzb3I6IGRlZmF1bHQ7IHotaW5kZXg6IDMwOyB9Ci5pdGVtLXBvc2l0aW9uZXIucGlja2VkLXVwIC5pdGVtLWlubmVyIHsgdHJhbnNmb3JtOiBub25lICFpbXBvcnRhbnQ7IGZpbHRlcjogZHJvcC1zaGFkb3coMjRweCAyNHB4IDAgcmdiYSgwLDAsMCwwLjQpKTsgYW5pbWF0aW9uOiBub25lOyB9CgouaXRlbS1wb3NpdGlvbmVyLmhpZGRlbiB7IG9wYWNpdHk6IDAgIWltcG9ydGFudDsgcG9pbnRlci1ldmVudHM6IG5vbmUgIWltcG9ydGFudDsgYm90dG9tOiAtMjB2aCAhaW1wb3J0YW50OyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCA1MCUpIHNjYWxlKDAuNSkgIWltcG9ydGFudDsgei1pbmRleDogMTA7IH0KCi8qIC0tLSBFTlZFTE9QRSBQQVJUUyAtLS0gKi8KLmVudmVsb3BlLWJhY2sgeyBwb3NpdGlvbjogYWJzb2x1dGU7IGluc2V0OiAwOyBiYWNrZ3JvdW5kOiB2YXIoLS1wZWFjaCk7IGJvcmRlcjogNHB4IHNvbGlkIHZhcigtLWJkcik7IHRyYW5zZm9ybTogdHJhbnNsYXRlWigtMnB4KTsgYm94LXNoYWRvdzogNHB4IDRweCAwIHJnYmEoMCwwLDAsMC4yKTsgfQouZW52ZWxvcGUtZnJvbnQgeyBwb3NpdGlvbjogYWJzb2x1dGU7IGluc2V0OiAwOyBiYWNrZ3JvdW5kOiB2YXIoLS1jcmVhbSk7IGJvcmRlcjogNHB4IHNvbGlkIHZhcigtLWJkcik7IGJvcmRlci10b3A6IG5vbmU7IHotaW5kZXg6IDM7IGRpc3BsYXk6IGZsZXg7IGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7IHBhZGRpbmctYm90dG9tOiAyNXB4OyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVooMnB4KTsgYm94LXNoYWRvdzogbm9uZTsgfQouZW52ZWxvcGUtZnJvbnQ6OmJlZm9yZSB7IGRpc3BsYXk6IG5vbmU7IH0KCi5lbnZlbG9wZS1zdGFtcCB7CiAgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IDEycHg7IHJpZ2h0OiAxNnB4OyB3aWR0aDogNDRweDsgaGVpZ2h0OiA1MHB4OwogIGJhY2tncm91bmQ6IHZhcigtLWJsdXNoKTsgYm9yZGVyOiA0cHggc29saWQgdmFyKC0tYmRyKTsKICBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgZm9udC1zaXplOiAyNHB4OwogIHRyYW5zZm9ybTogcm90YXRlKDRkZWcpOyBib3gtc2hhZG93OiBub25lOyBwYWRkaW5nOiA0cHg7Cn0KLmVudmVsb3BlLXN0YW1wOjphZnRlciB7IGNvbnRlbnQ6ICfwn4y4JzsgZmlsdGVyOiBub25lOyB9CgouZW52ZWxvcGUtZnJvbnQtc3RyaXAgeyBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogMDsgbGVmdDogMDsgd2lkdGg6IDEwMCU7IGhlaWdodDogMzBweDsgYmFja2dyb3VuZDogcmVwZWF0aW5nLWxpbmVhci1ncmFkaWVudCg0NWRlZywgdmFyKC0tYmx1c2gpLCB2YXIoLS1ibHVzaCkgMjBweCwgdmFyKC0tcGVhY2gpIDIwcHgsIHZhcigtLXBlYWNoKSA0MHB4KTsgYm9yZGVyLWJvdHRvbTogNHB4IHNvbGlkIHZhcigtLWJkcik7IGJveC1zaGFkb3c6IDAgNHB4IDAgcmdiYSgwLDAsMCwwLjEpOyB9Ci5lbnZlbG9wZS10ZXh0IHsgZm9udC1mYW1pbHk6ICdDYXZlYXQnLCBjdXJzaXZlOyBmb250LXNpemU6IDM2cHg7IGZvbnQtd2VpZ2h0OiBib2xkOyBjb2xvcjogdmFyKC0tYnIpOyBtYXJnaW4tdG9wOiAyMHB4OyB6LWluZGV4OiA0OyB0ZXh0LXNoYWRvdzogMnB4IDJweCAwIHJnYmEoMCwwLDAsMC4xKTsgfQoKLmVudmVsb3BlLWZsYXAgeyBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogMDsgbGVmdDogMDsgcmlnaHQ6IDA7IGhlaWdodDogMTAwcHg7IGJhY2tncm91bmQ6IHZhcigtLXBlYWNoKTsgYm9yZGVyOiA0cHggc29saWQgdmFyKC0tYmRyKTsgdHJhbnNmb3JtLW9yaWdpbjogdG9wOyB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMS4ycyBjdWJpYy1iZXppZXIoMC4zNCwgMS44LCAwLjY0LCAxKTsgei1pbmRleDogNDsgYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czogNDBweDsgYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6IDQwcHg7IC13ZWJraXQtdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDsgdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDsgdHJhbnNmb3JtOiB0cmFuc2xhdGVaKDRweCk7IGJveC1zaGFkb3c6IDAgNHB4IDAgcmdiYSgwLDAsMCwwLjE1KTsgfQouaXRlbS1wb3NpdGlvbmVyLm9wZW5lZCAuZW52ZWxvcGUtZmxhcCB7IHRyYW5zZm9ybTogcm90YXRlWCgxODBkZWcpIHRyYW5zbGF0ZVooNHB4KTsgei1pbmRleDogMTsgfQoKCgovKiBUaGUgQ2FyZCAoTmVzdGVkIGluc2lkZSBlbnZlbG9wZSBpbml0aWFsbHkpICovCi5jYXJkLW1pbmkgeyBwb3NpdGlvbjogYWJzb2x1dGU7IGluc2V0OiAxMHB4OyB6LWluZGV4OiAyOyB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMXMgY3ViaWMtYmV6aWVyKDAuMzQsIDEuNTYsIDAuNjQsIDEpLCBvcGFjaXR5IDAuMnM7IGJhY2tncm91bmQ6IHZhcigtLWNyZWFtKTsgYm9yZGVyOiA0cHggc29saWQgdmFyKC0tYmRyKTsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGJveC1zaGFkb3c6IDRweCA0cHggMCByZ2JhKDAsMCwwLDAuMSk7IG9wYWNpdHk6IDE7IH0KLmNhcmQtbWluaTo6YmVmb3JlIHsgY29udGVudDogJyc7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgaW5zZXQ6IDA7IGJhY2tncm91bmQtaW1hZ2U6IHJlcGVhdGluZy1saW5lYXItZ3JhZGllbnQodHJhbnNwYXJlbnQsIHRyYW5zcGFyZW50IDE5cHgsIHJnYmEoMCwwLDAsMC4xKSAxOXB4LCByZ2JhKDAsMCwwLDAuMSkgMjBweCk7IHBvaW50ZXItZXZlbnRzOiBub25lOyBvcGFjaXR5OiAwLjU7IH0KLml0ZW0tcG9zaXRpb25lci5kcmF3bi1vdXQgLmNhcmQtbWluaSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMTYwcHgpIHJvdGF0ZSgtM2RlZyk7IHotaW5kZXg6IDU7IGZpbHRlcjogZHJvcC1zaGFkb3coNHB4IDRweCAwIHJnYmEoMCwwLDAsMC4zKSk7IH0KCi8qIC0tLSBGVUxMU0NSRUVOIENBUkQgKFRoZSBhY3R1YWwgcmVhZGFibGUgbGV0dGVyKSAtLS0gKi8KLmNhcmQtZnVsbHNjcmVlbiB7IHBvc2l0aW9uOiBmaXhlZDsgbGVmdDogNTAlOyB0b3A6IDUwJTsgd2lkdGg6IDcyMHB4OyBoZWlnaHQ6IDQ4MHB4OyB6LWluZGV4OiA1MDsgZGlzcGxheTogZmxleDsgcG9pbnRlci1ldmVudHM6IG5vbmU7CiAgb3BhY2l0eTogMDsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgMjAlKSBzY2FsZSgwLjQpIHJvdGF0ZSgtM2RlZyk7CiAgdHJhbnNpdGlvbjogYWxsIDFzIGN1YmljLWJlemllcigwLjM0LCAxLjU2LCAwLjY0LCAxKTsKICBwZXJzcGVjdGl2ZTogMjAwMHB4OyAvKiBDUklUSUNBTCBGT1IgM0QgQklGT0xEIEVGRkVDVCAqLwp9Ci5jYXJkLWZ1bGxzY3JlZW4uYWN0aXZlIHsKICBvcGFjaXR5OiAxOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKSBzY2FsZSgxKSByb3RhdGUoMGRlZyk7IHBvaW50ZXItZXZlbnRzOiBhdXRvOwogIGZpbHRlcjogZHJvcC1zaGFkb3coMTBweCAxMHB4IDAgcmdiYSgwLDAsMCwwLjMpKTsKfQoKLml0ZW0tcG9zaXRpb25lci5vcGVuZWQgLmJvb2stY292ZXItdGV4dCB7IG9wYWNpdHk6IDA7IH0KLmNhcmQtZmFjZS5mcm9udCB7IHRyYW5zZm9ybTogcm90YXRlWSgwZGVnKTsgcGFkZGluZzogMjRweDsgYmFja2dyb3VuZDogdmFyKC0tcGVhY2gpOyBib3JkZXI6IDRweCBzb2xpZCB2YXIoLS1iZHIpOyB9Ci5jYXJkLWZhY2UuYmFjayB7IHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpOyBwYWRkaW5nOiAyMHB4OyBkaXNwbGF5OiBmbGV4OyBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgYmFja2dyb3VuZDogdmFyKC0tY3JlYW0pOyBib3JkZXI6IDRweCBzb2xpZCB2YXIoLS1iZHIpOyB9CgoubGV0dGVyLWxpbmVzIHsgcG9zaXRpb246IGFic29sdXRlOyBpbnNldDogMDsgYmFja2dyb3VuZC1pbWFnZTogcmVwZWF0aW5nLWxpbmVhci1ncmFkaWVudCh0cmFuc3BhcmVudCwgdHJhbnNwYXJlbnQgMzhweCwgcmdiYSgyMDAsMTY4LDI1NSwwLjMpIDM4cHgsIHJnYmEoMjAwLDE2OCwyNTUsMC4zKSA0MHB4KTsgcG9pbnRlci1ldmVudHM6IG5vbmU7IH0KLmxldHRlci1jb250ZW50IHsgcG9zaXRpb246IHJlbGF0aXZlOyB6LWluZGV4OiAyOyBmb250LWZhbWlseTogdmFyKC0tbGV0dGVyLWZvbnQsICdDYXZlYXQnKSwgY3Vyc2l2ZTsgZm9udC1zaXplOiAyNnB4OyBmb250LXdlaWdodDogYm9sZDsgbGluZS1oZWlnaHQ6IDQwcHg7IGNvbG9yOiB2YXIoLS1icik7IHBhZGRpbmctdG9wOiA0MHB4OyBvcGFjaXR5OiAwOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTBweCk7IHRyYW5zaXRpb246IGFsbCAxcyBjdWJpYy1iZXppZXIoMC4zNCwgMS41NiwgMC42NCwgMSkgMC42czsgfQouY2FyZC1mdWxsc2NyZWVuLm9wZW4gLmxldHRlci1jb250ZW50IHsgb3BhY2l0eTogMTsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApOyB9Ci5sZXR0ZXItdGl0bGUgeyBmb250LXNpemU6IDM0cHg7IG1hcmdpbi1ib3R0b206IDEwcHg7IH0KCi5wb2xhcm9pZCB7IHBvc2l0aW9uOiByZWxhdGl2ZTsgYmFja2dyb3VuZDogdmFyKC0tY3JlYW0pOyBwYWRkaW5nOiAxMnB4IDEycHggNDBweCAxMnB4OyBib3JkZXI6IDRweCBzb2xpZCB2YXIoLS1iZHIpOyBib3gtc2hhZG93OiA2cHggNnB4IDAgcmdiYSgwLDAsMCwwLjE1KTsgd2lkdGg6IDg1JTsgbWFyZ2luOiAyMHB4IGF1dG87IHRyYW5zZm9ybTogcm90YXRlKC0yZGVnKTsgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMXMsIGJveC1zaGFkb3cgMC4xczsgY3Vyc29yOiBwb2ludGVyOyB9Ci5wb2xhcm9pZDo6YWZ0ZXIgeyBkaXNwbGF5OiBub25lOyB9Ci5wb2xhcm9pZDpob3ZlciB7IHRyYW5zZm9ybTogc2NhbGUoMS4wMikgcm90YXRlKDFkZWcpIHRyYW5zbGF0ZVkoLTRweCk7IGJveC1zaGFkb3c6IDEwcHggMTBweCAwIHJnYmEoMCwwLDAsMC4yKTsgei1pbmRleDogMTA7IH0KLnBvbGFyb2lkIGltZyB7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDI0MHB4OyBvYmplY3QtZml0OiBjb250YWluOyBiYWNrZ3JvdW5kOiAjZmZmOyBib3JkZXI6IDRweCBzb2xpZCB2YXIoLS1iZHIpOyBpbWFnZS1yZW5kZXJpbmc6IHBpeGVsYXRlZDsgfQoKLnRhcGUgeyBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogLTEycHg7IGxlZnQ6IDUwJTsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpIHJvdGF0ZSgtNWRlZyk7IHdpZHRoOiA5MHB4OyBoZWlnaHQ6IDI4cHg7IGJhY2tncm91bmQ6ICNGRkUwNjY7IGJvcmRlcjogNHB4IHNvbGlkIHZhcigtLWJkcik7IGJveC1zaGFkb3c6IDRweCA0cHggMCByZ2JhKDAsMCwwLDAuMTUpOyB6LWluZGV4OiA1OyBpbWFnZS1yZW5kZXJpbmc6IHBpeGVsYXRlZDsgfQoKCi8qIC0tLSBBTEJVTSBTWVNURU0gLS0tICovCi5hbGJ1bS13cmFwcGVyIHsgcG9zaXRpb246IGFic29sdXRlOyBpbnNldDogMDsgLXdlYmtpdC10cmFuc2Zvcm0tc3R5bGU6IHByZXNlcnZlLTNkOyB0cmFuc2Zvcm0tc3R5bGU6IHByZXNlcnZlLTNkOyB9Ci5ib29rLWNvdmVyLCAuYm9vay1iYWNrIHsgCiAgcG9zaXRpb246IGFic29sdXRlOyBpbnNldDogMDsgYmFja2dyb3VuZC1jb2xvcjogI0EwM0IzQjsgCiAgYmFja2dyb3VuZC1pbWFnZTogcmVwZWF0aW5nLWxpbmVhci1ncmFkaWVudCg0NWRlZywgcmdiYSgwLDAsMCwwLjA1KSAyNSUsIHRyYW5zcGFyZW50IDI1JSwgdHJhbnNwYXJlbnQgNzUlLCByZ2JhKDAsMCwwLDAuMDUpIDc1JSwgcmdiYSgwLDAsMCwwLjA1KSk7CiAgYmFja2dyb3VuZC1zaXplOiA4cHggOHB4OyBib3JkZXI6IDRweCBzb2xpZCB2YXIoLS1iZHIpOyBib3JkZXItcmFkaXVzOiA0cHggMTZweCAxNnB4IDRweDsgCiAgYm94LXNoYWRvdzogNHB4IDRweCAwIHJnYmEoMCwwLDAsMC4yKTsgCn0KLmJvb2stY292ZXIgeyB0cmFuc2Zvcm0tb3JpZ2luOiBsZWZ0OyB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMS4ycyBjdWJpYy1iZXppZXIoMC4zNCwgMS44LCAwLjY0LCAxKTsgLXdlYmtpdC10cmFuc2Zvcm0tc3R5bGU6IHByZXNlcnZlLTNkOyB0cmFuc2Zvcm0tc3R5bGU6IHByZXNlcnZlLTNkOyB6LWluZGV4OiAzMDsgdHJhbnNmb3JtOiB0cmFuc2xhdGVaKDJweCk7IH0KLmJvb2stYmFjayB7IHotaW5kZXg6IDE7IHRyYW5zZm9ybTogdHJhbnNsYXRlWigtMnB4KTsgYm94LXNoYWRvdzogNHB4IDRweCAwIHJnYmEoMCwwLDAsMC4yKTsgfQouYm9vay1jb3Zlcjo6YWZ0ZXIgeyAKICBjb250ZW50OiAnJzsgcG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiAwOyB0b3A6IDA7IGJvdHRvbTogMDsgd2lkdGg6IDQwcHg7IAogIGJhY2tncm91bmQ6IHJnYmEoMCwwLDAsMC4xNSk7IGJvcmRlci1yaWdodDogNHB4IHNvbGlkIHZhcigtLWJkcik7Cn0KLmJvb2stY292ZXItdGV4dCB7IAogIHBvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogNTUlOyB0b3A6IDUwJTsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7IAogIGJhY2tncm91bmQ6ICNGRkY4RTc7IGJvcmRlcjogNHB4IHNvbGlkIHZhcigtLWJkcik7IGJvcmRlci1yYWRpdXM6IDBweDsKICBwYWRkaW5nOiAxNHB4IDIwcHg7IGZvbnQtZmFtaWx5OiAnTnVuaXRvJywgc2Fucy1zZXJpZjsgZm9udC13ZWlnaHQ6IDgwMDsgbGV0dGVyLXNwYWNpbmc6IDJweDsgZm9udC1zaXplOiAxOHB4OyAKICB0ZXh0LWFsaWduOiBjZW50ZXI7IGxpbmUtaGVpZ2h0OiAxLjQ7IGNvbG9yOiB2YXIoLS1icik7IAogIGJveC1zaGFkb3c6IDRweCA0cHggMCByZ2JhKDAsMCwwLDAuMTUpOyAKICB0ZXh0LXNoYWRvdzogbm9uZTsgaW1hZ2UtcmVuZGVyaW5nOiBwaXhlbGF0ZWQ7Cn0KLml0ZW0tcG9zaXRpb25lci5vcGVuZWQgLmJvb2stY292ZXIgeyB0cmFuc2Zvcm06IHJvdGF0ZVkoLTE4MGRlZykgdHJhbnNsYXRlWigycHgpOyB9CgouYm9vay1wYWdlIHsgcG9zaXRpb246IGFic29sdXRlOyBpbnNldDogNHB4OyBsZWZ0OiAxNnB4OyBiYWNrZ3JvdW5kOiB2YXIoLS1jcmVhbSk7IGJvcmRlcjogNHB4IHNvbGlkIHZhcigtLWJkcik7IGJvcmRlci1yYWRpdXM6IDJweCAxMnB4IDEycHggMnB4OyB0cmFuc2Zvcm0tb3JpZ2luOiBsZWZ0OyB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMS4ycyBjdWJpYy1iZXppZXIoMC4zNCwgMS44LCAwLjY0LCAxKTsgLXdlYmtpdC10cmFuc2Zvcm0tc3R5bGU6IHByZXNlcnZlLTNkOyB0cmFuc2Zvcm0tc3R5bGU6IHByZXNlcnZlLTNkOyB6LWluZGV4OiAxMDsgZGlzcGxheTogZmxleDsgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGJveC1zaGFkb3c6IC00cHggMCAwIHJnYmEoMCwwLDAsMC4wNSk7IHRyYW5zZm9ybTogdHJhbnNsYXRlWih2YXIoLS16LCAwcHgpKTsgfQouYm9vay1wYWdlLmZsaXBwZWQgeyB0cmFuc2Zvcm06IHJvdGF0ZVkoLTE4MGRlZykgdHJhbnNsYXRlWih2YXIoLS16LCAwcHgpKTsgfQoKLnBhZ2UtZmFjZSB7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgaW5zZXQ6IDA7IC13ZWJraXQtYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuOyBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47IHBhZGRpbmc6IDE2cHg7IGRpc3BsYXk6IGZsZXg7IGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOyBiYWNrZ3JvdW5kLWltYWdlOiBub25lOyBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jcmVhbSk7IH0KLnBhZ2UtZmFjZS5mcm9udCB7IHRyYW5zZm9ybTogcm90YXRlWSgwZGVnKSB0cmFuc2xhdGVaKDFweCk7IC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGVZKDBkZWcpIHRyYW5zbGF0ZVooMXB4KTsgfQoucGFnZS1mYWNlLmJhY2sgeyB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKSB0cmFuc2xhdGVaKDFweCk7IC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZykgdHJhbnNsYXRlWigxcHgpOyBiYWNrZ3JvdW5kLWNvbG9yOiAjRThERkQ1OyB9Ci5wYWdlLWZhY2UuZnJvbnQ6OmFmdGVyIHsgY29udGVudDogJyc7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgaW5zZXQ6IDA7IGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCh0byByaWdodCwgcmdiYSgwLDAsMCwwLjEpLCB0cmFuc3BhcmVudCAzMCUpOyBvcGFjaXR5OiAwOyB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuOHM7IHBvaW50ZXItZXZlbnRzOiBub25lOyB9Ci5ib29rLXBhZ2UuZmxpcHBlZCAucGFnZS1mYWNlLmZyb250OjphZnRlciB7IG9wYWNpdHk6IDE7IH0KLnBhZ2UtZmFjZS5iYWNrOjpiZWZvcmUgeyBjb250ZW50OiAnJzsgcG9zaXRpb246IGFic29sdXRlOyBpbnNldDogMDsgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHRvIGxlZnQsIHJnYmEoMCwwLDAsMC4xNSksIHRyYW5zcGFyZW50IDQwJSk7IG9wYWNpdHk6IDE7IHRyYW5zaXRpb246IG9wYWNpdHkgMC44czsgcG9pbnRlci1ldmVudHM6IG5vbmU7IH0KLmJvb2stcGFnZS5mbGlwcGVkIC5wYWdlLWZhY2UuYmFjazo6YmVmb3JlIHsgb3BhY2l0eTogMDsgfQoKCi5wYWdlLXRpdGxlIHsgZm9udC1mYW1pbHk6ICdDYXZlYXQnLCBjdXJzaXZlOyBmb250LXNpemU6IDQwcHg7IGZvbnQtd2VpZ2h0OiBib2xkOyBtYXJnaW4tYm90dG9tOiAyMHB4OyB0ZXh0LXNoYWRvdzogMnB4IDJweCAwIHJnYmEoMCwwLDAsMC4xKTsgfQoucGhvdG8tY2FwdGlvbiB7IGZvbnQtZmFtaWx5OiAnTnVuaXRvJywgc2Fucy1zZXJpZjsgZm9udC1zaXplOiAxNnB4OyBmb250LXdlaWdodDogODAwOyBjb2xvcjogdmFyKC0tYnIpOyBiYWNrZ3JvdW5kOiB2YXIoLS1jcmVhbSk7IHBhZGRpbmc6IDhweCAxNnB4OyBib3gtc2hhZG93OiAycHggMnB4IDAgdmFyKC0tYmRyKTsgYm9yZGVyOiA0cHggc29saWQgdmFyKC0tYmRyKTsgYm9yZGVyLXJhZGl1czogMDsgdHJhbnNmb3JtOiByb3RhdGUoLTJkZWcpOyBtYXJnaW4tdG9wOiAxNXB4OyBpbWFnZS1yZW5kZXJpbmc6IHBpeGVsYXRlZDsgfQoKCi8qIC0tLSBNT0JJTEUgUkVTUE9OU0lWRU5FU1MgLS0tICovCkBtZWRpYSAobWF4LWFzcGVjdC1yYXRpbzogNC81KSB7CiAgLyogT24gcG9ydHJhaXQgc2NyZWVucywgZWxlZ2FudGx5IHJvdGF0ZSB0aGUgbGV0dGVyIHNvIHRoZSB1c2VyIHJlYWRzIGl0IG5hdHVyYWxseSBzaWRld2F5cyAqLwogIC5jYXJkLWZ1bGxzY3JlZW4uYWN0aXZlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSkgc2NhbGUoMC42NSkgcm90YXRlKDkwZGVnKSAhaW1wb3J0YW50OyB9CiAgLyogU2NhbGUgZG93biB0aGUgYWxidW0gYW5kIGVudmVsb3BlIHNvIHRoZXkgZG9uJ3Qgb3ZlcmZsb3cgKi8KICAKI2FsYlBvcy5waWNrZWQtdXAgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCA1MCUpIHNjYWxlKDEuOCkgIWltcG9ydGFudDsgfQouaXRlbS1wb3NpdGlvbmVyLnBpY2tlZC11cCB7IHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIDUwJSkgc2NhbGUoMC44NSkgIWltcG9ydGFudDsgfQp9CkBtZWRpYSAobWF4LXdpZHRoOiA0MDBweCkgewogIC5jYXJkLWZ1bGxzY3JlZW4uYWN0aXZlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSkgc2NhbGUoMC41NSkgcm90YXRlKDkwZGVnKSAhaW1wb3J0YW50OyB9CiAgCiNhbGJQb3MucGlja2VkLXVwIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgNTAlKSBzY2FsZSgxLjgpICFpbXBvcnRhbnQ7IH0KLml0ZW0tcG9zaXRpb25lci5waWNrZWQtdXAgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCA1MCUpIHNjYWxlKDAuNykgIWltcG9ydGFudDsgfQp9CkBtZWRpYSAobWF4LXdpZHRoOiA0ODBweCkgewogIC5idG4sIC5zdGF0dXMtY2hpcCB7IGZvbnQtc2l6ZTogOHB4OyBwYWRkaW5nOiAxMHB4IDEycHg7IH0KICAuYm90dG9tLWJhciB7IGdhcDogOHB4OyB9Cn0KCi5zcHJpdGUtbWFpbGJveCB7CiAgd2lkdGg6IDVweDsgaGVpZ2h0OiA1cHg7CiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7CiAgYm94LXNoYWRvdzogMzBweCAwcHggIzMzMjIyMiwKICAzNXB4IDBweCAjMzMyMjIyLAogIDQwcHggMHB4ICMzMzIyMjIsCiAgNDVweCAwcHggIzMzMjIyMiwKICAyMHB4IDVweCAjMzMyMjIyLAogIDI1cHggNXB4ICMzMzIyMjIsCiAgMzBweCA1cHggI0Q5NDUzQiwKICAzNXB4IDVweCAjRDk0NTNCLAogIDQwcHggNXB4ICNEOTQ1M0IsCiAgNDVweCA1cHggI0Q5NDUzQiwKICA1MHB4IDVweCAjMzMyMjIyLAogIDU1cHggNXB4ICMzMzIyMjIsCiAgMTVweCAxMHB4ICMzMzIyMjIsCiAgMjBweCAxMHB4ICNEOTQ1M0IsCiAgMjVweCAxMHB4ICNEOTQ1M0IsCiAgMzBweCAxMHB4ICNEOTQ1M0IsCiAgMzVweCAxMHB4ICNEOTQ1M0IsCiAgNDBweCAxMHB4ICNEOTQ1M0IsCiAgNDVweCAxMHB4ICNEOTQ1M0IsCiAgNTBweCAxMHB4ICNEOTQ1M0IsCiAgNTVweCAxMHB4ICNEOTQ1M0IsCiAgNjBweCAxMHB4ICMzMzIyMjIsCiAgMTBweCAxNXB4ICMzMzIyMjIsCiAgMTVweCAxNXB4ICNEOTQ1M0IsCiAgMjBweCAxNXB4ICNEOTQ1M0IsCiAgMjVweCAxNXB4ICNEOTQ1M0IsCiAgMzBweCAxNXB4ICNGNEI0MUEsCiAgMzVweCAxNXB4ICNGNEI0MUEsCiAgNDBweCAxNXB4ICNGNEI0MUEsCiAgNDVweCAxNXB4ICNGNEI0MUEsCiAgNTBweCAxNXB4ICNGNEI0MUEsCiAgNTVweCAxNXB4ICNEOTQ1M0IsCiAgNjBweCAxNXB4ICNEOTQ1M0IsCiAgNjVweCAxNXB4ICMzMzIyMjIsCiAgNXB4IDIwcHggIzMzMjIyMiwKICAxMHB4IDIwcHggI0Q5NDUzQiwKICAxNXB4IDIwcHggI0Q5NDUzQiwKICAyMHB4IDIwcHggI0Q5NDUzQiwKICAyNXB4IDIwcHggI0Q5NDUzQiwKICAzMHB4IDIwcHggI0Y0QjQxQSwKICAzNXB4IDIwcHggIzMzMjIyMiwKICA0MHB4IDIwcHggIzMzMjIyMiwKICA0NXB4IDIwcHggI0Y0QjQxQSwKICA1MHB4IDIwcHggI0Y0QjQxQSwKICA1NXB4IDIwcHggI0Q5NDUzQiwKICA2MHB4IDIwcHggI0Q5NDUzQiwKICA2NXB4IDIwcHggI0Q5NDUzQiwKICA3MHB4IDIwcHggIzMzMjIyMiwKICA1cHggMjVweCAjMzMyMjIyLAogIDEwcHggMjVweCAjRDk0NTNCLAogIDE1cHggMjVweCAjRDk0NTNCLAogIDIwcHggMjVweCAjRDk0NTNCLAogIDI1cHggMjVweCAjRDk0NTNCLAogIDMwcHggMjVweCAjRjRCNDFBLAogIDM1cHggMjVweCAjRjRCNDFBLAogIDQwcHggMjVweCAjRjRCNDFBLAogIDQ1cHggMjVweCAjRjRCNDFBLAogIDUwcHggMjVweCAjRjRCNDFBLAogIDU1cHggMjVweCAjRDk0NTNCLAogIDYwcHggMjVweCAjRDk0NTNCLAogIDY1cHggMjVweCAjRDk0NTNCLAogIDcwcHggMjVweCAjMzMyMjIyLAogIDVweCAzMHB4ICMzMzIyMjIsCiAgMTBweCAzMHB4ICNEOTQ1M0IsCiAgMTVweCAzMHB4ICNEOTQ1M0IsCiAgMjBweCAzMHB4ICNEOTQ1M0IsCiAgMjVweCAzMHB4ICNEOTQ1M0IsCiAgMzBweCAzMHB4ICNEOTQ1M0IsCiAgMzVweCAzMHB4ICNEOTQ1M0IsCiAgNDBweCAzMHB4ICNEOTQ1M0IsCiAgNDVweCAzMHB4ICNEOTQ1M0IsCiAgNTBweCAzMHB4ICNEOTQ1M0IsCiAgNTVweCAzMHB4ICNEOTQ1M0IsCiAgNjBweCAzMHB4ICNEOTQ1M0IsCiAgNjVweCAzMHB4ICNEOTQ1M0IsCiAgNzBweCAzMHB4ICMzMzIyMjIsCiAgNXB4IDM1cHggIzMzMjIyMiwKICAxMHB4IDM1cHggIzMzMjIyMiwKICAxNXB4IDM1cHggI0Q5NDUzQiwKICAyMHB4IDM1cHggI0Q5NDUzQiwKICAyNXB4IDM1cHggI0Q5NDUzQiwKICAzMHB4IDM1cHggI0Q5NDUzQiwKICAzNXB4IDM1cHggI0Q5NDUzQiwKICA0MHB4IDM1cHggI0Q5NDUzQiwKICA0NXB4IDM1cHggI0Q5NDUzQiwKICA1MHB4IDM1cHggI0Q5NDUzQiwKICA1NXB4IDM1cHggI0Q5NDUzQiwKICA2MHB4IDM1cHggI0Q5NDUzQiwKICA2NXB4IDM1cHggIzMzMjIyMiwKICA3MHB4IDM1cHggIzMzMjIyMiwKICAxMHB4IDQwcHggIzMzMjIyMiwKICAxNXB4IDQwcHggIzMzMjIyMiwKICAyMHB4IDQwcHggI0Q5NDUzQiwKICAyNXB4IDQwcHggI0Q5NDUzQiwKICAzMHB4IDQwcHggI0Q5NDUzQiwKICAzNXB4IDQwcHggI0Q5NDUzQiwKICA0MHB4IDQwcHggI0Q5NDUzQiwKICA0NXB4IDQwcHggI0Q5NDUzQiwKICA1MHB4IDQwcHggI0Q5NDUzQiwKICA1NXB4IDQwcHggI0Q5NDUzQiwKICA2MHB4IDQwcHggIzMzMjIyMiwKICA2NXB4IDQwcHggIzMzMjIyMiwKICAxNXB4IDQ1cHggIzMzMjIyMiwKICAyMHB4IDQ1cHggIzMzMjIyMiwKICAyNXB4IDQ1cHggIzMzMjIyMiwKICAzMHB4IDQ1cHggIzMzMjIyMiwKICAzNXB4IDQ1cHggIzMzMjIyMiwKICA0MHB4IDQ1cHggIzMzMjIyMiwKICA0NXB4IDQ1cHggIzMzMjIyMiwKICA1MHB4IDQ1cHggIzMzMjIyMiwKICA1NXB4IDQ1cHggIzMzMjIyMiwKICA2MHB4IDQ1cHggIzMzMjIyMiwKICAzMHB4IDUwcHggIzMzMjIyMiwKICAzNXB4IDUwcHggIzMzMjIyMiwKICAzMHB4IDU1cHggIzMzMjIyMiwKICAzNXB4IDU1cHggIzMzMjIyMiwKICAzMHB4IDYwcHggIzMzMjIyMiwKICAzNXB4IDYwcHggIzMzMjIyMiwKICAzMHB4IDY1cHggIzMzMjIyMiwKICAzNXB4IDY1cHggIzMzMjIyMiwKICAyNXB4IDcwcHggIzMzMjIyMiwKICAzMHB4IDcwcHggIzMzMjIyMiwKICAzNXB4IDcwcHggIzMzMjIyMiwKICA0MHB4IDcwcHggIzMzMjIyMiwKICAyMHB4IDc1cHggIzMzMjIyMiwKICAyNXB4IDc1cHggIzMzMjIyMiwKICAzMHB4IDc1cHggIzMzMjIyMiwKICAzNXB4IDc1cHggIzMzMjIyMiwKICA0MHB4IDc1cHggIzMzMjIyMiwKICA0NXB4IDc1cHggIzMzMjIyMjsKfQoKLnNwcml0ZS1sYW50ZXJuIHsKICB3aWR0aDogNnB4OyBoZWlnaHQ6IDZweDsKICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDsKICBib3gtc2hhZG93OiAyNHB4IDBweCAjMzMyMjIyLAogIDMwcHggMHB4ICMzMzIyMjIsCiAgMzZweCAwcHggIzMzMjIyMiwKICA0MnB4IDBweCAjMzMyMjIyLAogIDE4cHggNnB4ICMzMzIyMjIsCiAgMjRweCA2cHggIzMzMjIyMiwKICAzMHB4IDZweCAjRDk0NTNCLAogIDM2cHggNnB4ICNEOTQ1M0IsCiAgNDJweCA2cHggIzMzMjIyMiwKICA0OHB4IDZweCAjMzMyMjIyLAogIDEycHggMTJweCAjMzMyMjIyLAogIDE4cHggMTJweCAjMzMyMjIyLAogIDI0cHggMTJweCAjRjA3QTM4LAogIDMwcHggMTJweCAjRjRDODQyLAogIDM2cHggMTJweCAjRjRDODQyLAogIDQycHggMTJweCAjRjA3QTM4LAogIDQ4cHggMTJweCAjMzMyMjIyLAogIDU0cHggMTJweCAjMzMyMjIyLAogIDZweCAxOHB4ICMzMzIyMjIsCiAgMTJweCAxOHB4ICNGMDdBMzgsCiAgMThweCAxOHB4ICNGMDdBMzgsCiAgMjRweCAxOHB4ICNGNEM4NDIsCiAgMzBweCAxOHB4ICNGNEM4NDIsCiAgMzZweCAxOHB4ICNGNEM4NDIsCiAgNDJweCAxOHB4ICNGNEM4NDIsCiAgNDhweCAxOHB4ICNGMDdBMzgsCiAgNTRweCAxOHB4ICNGMDdBMzgsCiAgNjBweCAxOHB4ICMzMzIyMjIsCiAgNnB4IDI0cHggIzMzMjIyMiwKICAxMnB4IDI0cHggI0YwN0EzOCwKICAxOHB4IDI0cHggI0Y0Qzg0MiwKICAyNHB4IDI0cHggI0Y0Qzg0MiwKICAzMHB4IDI0cHggI0Y0Qzg0MiwKICAzNnB4IDI0cHggI0Y0Qzg0MiwKICA0MnB4IDI0cHggI0Y0Qzg0MiwKICA0OHB4IDI0cHggI0Y0Qzg0MiwKICA1NHB4IDI0cHggI0YwN0EzOCwKICA2MHB4IDI0cHggIzMzMjIyMiwKICA2cHggMzBweCAjMzMyMjIyLAogIDEycHggMzBweCAjRjA3QTM4LAogIDE4cHggMzBweCAjRjRDODQyLAogIDI0cHggMzBweCAjRjRDODQyLAogIDMwcHggMzBweCAjRjRDODQyLAogIDM2cHggMzBweCAjRjRDODQyLAogIDQycHggMzBweCAjRjRDODQyLAogIDQ4cHggMzBweCAjRjRDODQyLAogIDU0cHggMzBweCAjRjA3QTM4LAogIDYwcHggMzBweCAjMzMyMjIyLAogIDZweCAzNnB4ICMzMzIyMjIsCiAgMTJweCAzNnB4ICNGMDdBMzgsCiAgMThweCAzNnB4ICNGMDdBMzgsCiAgMjRweCAzNnB4ICNGNEM4NDIsCiAgMzBweCAzNnB4ICNGNEM4NDIsCiAgMzZweCAzNnB4ICNGNEM4NDIsCiAgNDJweCAzNnB4ICNGNEM4NDIsCiAgNDhweCAzNnB4ICNGMDdBMzgsCiAgNTRweCAzNnB4ICNGMDdBMzgsCiAgNjBweCAzNnB4ICMzMzIyMjIsCiAgMTJweCA0MnB4ICMzMzIyMjIsCiAgMThweCA0MnB4ICMzMzIyMjIsCiAgMjRweCA0MnB4ICNGMDdBMzgsCiAgMzBweCA0MnB4ICNGNEM4NDIsCiAgMzZweCA0MnB4ICNGNEM4NDIsCiAgNDJweCA0MnB4ICNGMDdBMzgsCiAgNDhweCA0MnB4ICMzMzIyMjIsCiAgNTRweCA0MnB4ICMzMzIyMjIsCiAgMThweCA0OHB4ICMzMzIyMjIsCiAgMjRweCA0OHB4ICMzMzIyMjIsCiAgMzBweCA0OHB4ICNEOTQ1M0IsCiAgMzZweCA0OHB4ICNEOTQ1M0IsCiAgNDJweCA0OHB4ICMzMzIyMjIsCiAgNDhweCA0OHB4ICMzMzIyMjIsCiAgMjRweCA1NHB4ICMzMzIyMjIsCiAgMzBweCA1NHB4ICMzMzIyMjIsCiAgMzZweCA1NHB4ICMzMzIyMjIsCiAgNDJweCA1NHB4ICMzMzIyMjI7Cn0KCi5zcHJpdGUtZW52ZWxvcGUgewogIHdpZHRoOiA2cHg7IGhlaWdodDogNnB4OwogIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OwogIGJveC1zaGFkb3c6IDZweCAwcHggIzkzN0I2NiwKICAxMnB4IDBweCAjOTM3QjY2LAogIDE4cHggMHB4ICM5MzdCNjYsCiAgMjRweCAwcHggIzkzN0I2NiwKICAzMHB4IDBweCAjOTM3QjY2LAogIDM2cHggMHB4ICM5MzdCNjYsCiAgNDJweCAwcHggIzkzN0I2NiwKICA0OHB4IDBweCAjOTM3QjY2LAogIDU0cHggMHB4ICM5MzdCNjYsCiAgNjBweCAwcHggIzkzN0I2NiwKICA2NnB4IDBweCAjOTM3QjY2LAogIDcycHggMHB4ICM5MzdCNjYsCiAgNzhweCAwcHggIzkzN0I2NiwKICA4NHB4IDBweCAjOTM3QjY2LAogIDZweCA2cHggIzkzN0I2NiwKICAxMnB4IDZweCAjRkZGREY1LAogIDE4cHggNnB4ICNGRkZERjUsCiAgMjRweCA2cHggI0ZGRkRGNSwKICAzMHB4IDZweCAjRkZGREY1LAogIDM2cHggNnB4ICNGRkZERjUsCiAgNDJweCA2cHggI0ZGRkRGNSwKICA0OHB4IDZweCAjRkZGREY1LAogIDU0cHggNnB4ICNGRkZERjUsCiAgNjBweCA2cHggI0ZGRkRGNSwKICA2NnB4IDZweCAjRkZGREY1LAogIDcycHggNnB4ICNGRkZERjUsCiAgNzhweCA2cHggI0ZGRkRGNSwKICA4NHB4IDZweCAjOTM3QjY2LAogIDZweCAxMnB4ICM5MzdCNjYsCiAgMTJweCAxMnB4ICNGRkZERjUsCiAgMThweCAxMnB4ICM5MzdCNjYsCiAgMjRweCAxMnB4ICNGRkZERjUsCiAgMzBweCAxMnB4ICNGRkZERjUsCiAgMzZweCAxMnB4ICNGRkZERjUsCiAgNDJweCAxMnB4ICNGRkZERjUsCiAgNDhweCAxMnB4ICNGRkZERjUsCiAgNTRweCAxMnB4ICNGRkZERjUsCiAgNjBweCAxMnB4ICNGRkZERjUsCiAgNjZweCAxMnB4ICNGRkZERjUsCiAgNzJweCAxMnB4ICM5MzdCNjYsCiAgNzhweCAxMnB4ICNGRkZERjUsCiAgODRweCAxMnB4ICM5MzdCNjYsCiAgNnB4IDE4cHggIzkzN0I2NiwKICAxMnB4IDE4cHggI0ZGRkRGNSwKICAxOHB4IDE4cHggI0ZGRkRGNSwKICAyNHB4IDE4cHggIzkzN0I2NiwKICAzMHB4IDE4cHggI0ZGRkRGNSwKICAzNnB4IDE4cHggI0ZGRkRGNSwKICA0MnB4IDE4cHggI0ZGRkRGNSwKICA0OHB4IDE4cHggI0ZGRkRGNSwKICA1NHB4IDE4cHggI0ZGRkRGNSwKICA2MHB4IDE4cHggI0ZGRkRGNSwKICA2NnB4IDE4cHggIzkzN0I2NiwKICA3MnB4IDE4cHggI0ZGRkRGNSwKICA3OHB4IDE4cHggI0ZGRkRGNSwKICA4NHB4IDE4cHggIzkzN0I2NiwKICA2cHggMjRweCAjOTM3QjY2LAogIDEycHggMjRweCAjRkZGREY1LAogIDE4cHggMjRweCAjRkZGREY1LAogIDI0cHggMjRweCAjRkZGREY1LAogIDMwcHggMjRweCAjOTM3QjY2LAogIDM2cHggMjRweCAjRkZGREY1LAogIDQycHggMjRweCAjRkZGREY1LAogIDQ4cHggMjRweCAjRkZGREY1LAogIDU0cHggMjRweCAjRkZGREY1LAogIDYwcHggMjRweCAjOTM3QjY2LAogIDY2cHggMjRweCAjRkZGREY1LAogIDcycHggMjRweCAjRkZGREY1LAogIDc4cHggMjRweCAjRkZGREY1LAogIDg0cHggMjRweCAjOTM3QjY2LAogIDZweCAzMHB4ICM5MzdCNjYsCiAgMTJweCAzMHB4ICNGRkZERjUsCiAgMThweCAzMHB4ICNGRkZERjUsCiAgMjRweCAzMHB4ICNGRkZERjUsCiAgMzBweCAzMHB4ICNGRkZERjUsCiAgMzZweCAzMHB4ICM5MzdCNjYsCiAgNDJweCAzMHB4ICNGRjk0QTUsCiAgNDhweCAzMHB4ICNGRjk0QTUsCiAgNTRweCAzMHB4ICM5MzdCNjYsCiAgNjBweCAzMHB4ICNGRkZERjUsCiAgNjZweCAzMHB4ICNGRkZERjUsCiAgNzJweCAzMHB4ICNGRkZERjUsCiAgNzhweCAzMHB4ICNGRkZERjUsCiAgODRweCAzMHB4ICM5MzdCNjYsCiAgNnB4IDM2cHggIzkzN0I2NiwKICAxMnB4IDM2cHggI0ZGRkRGNSwKICAxOHB4IDM2cHggI0ZGRkRGNSwKICAyNHB4IDM2cHggI0ZGRkRGNSwKICAzMHB4IDM2cHggI0ZGRkRGNSwKICAzNnB4IDM2cHggI0ZGRkRGNSwKICA0MnB4IDM2cHggI0ZGOTRBNSwKICA0OHB4IDM2cHggI0ZGOTRBNSwKICA1NHB4IDM2cHggI0ZGRkRGNSwKICA2MHB4IDM2cHggI0ZGRkRGNSwKICA2NnB4IDM2cHggI0ZGRkRGNSwKICA3MnB4IDM2cHggI0ZGRkRGNSwKICA3OHB4IDM2cHggI0ZGRkRGNSwKICA4NHB4IDM2cHggIzkzN0I2NiwKICA2cHggNDJweCAjOTM3QjY2LAogIDEycHggNDJweCAjRkZGREY1LAogIDE4cHggNDJweCAjRkZGREY1LAogIDI0cHggNDJweCAjRkZGREY1LAogIDMwcHggNDJweCAjRkZGREY1LAogIDM2cHggNDJweCAjRkZGREY1LAogIDQycHggNDJweCAjRkZGREY1LAogIDQ4cHggNDJweCAjRkZGREY1LAogIDU0cHggNDJweCAjRkZGREY1LAogIDYwcHggNDJweCAjRkZGREY1LAogIDY2cHggNDJweCAjRkZGREY1LAogIDcycHggNDJweCAjRkZGREY1LAogIDc4cHggNDJweCAjRkZGREY1LAogIDg0cHggNDJweCAjOTM3QjY2LAogIDZweCA0OHB4ICM5MzdCNjYsCiAgMTJweCA0OHB4ICNGRkZERjUsCiAgMThweCA0OHB4ICNGRkZERjUsCiAgMjRweCA0OHB4ICNGRkZERjUsCiAgMzBweCA0OHB4ICNGRkZERjUsCiAgMzZweCA0OHB4ICNGRkZERjUsCiAgNDJweCA0OHB4ICNGRkZERjUsCiAgNDhweCA0OHB4ICNGRkZERjUsCiAgNTRweCA0OHB4ICNGRkZERjUsCiAgNjBweCA0OHB4ICNGRkZERjUsCiAgNjZweCA0OHB4ICNGRkZERjUsCiAgNzJweCA0OHB4ICNGRkZERjUsCiAgNzhweCA0OHB4ICNGRkZERjUsCiAgODRweCA0OHB4ICM5MzdCNjYsCiAgNnB4IDU0cHggIzkzN0I2NiwKICAxMnB4IDU0cHggIzkzN0I2NiwKICAxOHB4IDU0cHggIzkzN0I2NiwKICAyNHB4IDU0cHggIzkzN0I2NiwKICAzMHB4IDU0cHggIzkzN0I2NiwKICAzNnB4IDU0cHggIzkzN0I2NiwKICA0MnB4IDU0cHggIzkzN0I2NiwKICA0OHB4IDU0cHggIzkzN0I2NiwKICA1NHB4IDU0cHggIzkzN0I2NiwKICA2MHB4IDU0cHggIzkzN0I2NiwKICA2NnB4IDU0cHggIzkzN0I2NiwKICA3MnB4IDU0cHggIzkzN0I2NiwKICA3OHB4IDU0cHggIzkzN0I2NiwKICA4NHB4IDU0cHggIzkzN0I2NjsKfQoKLnNwcml0ZS10ZWFjdXAgewogIHdpZHRoOiA1cHg7IGhlaWdodDogNXB4OwogIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OwogIGJveC1zaGFkb3c6IDEwcHggMHB4ICM1QzNEMkUsCiAgMTVweCAwcHggIzVDM0QyRSwKICAyMHB4IDBweCAjNUMzRDJFLAogIDI1cHggMHB4ICM1QzNEMkUsCiAgMzBweCAwcHggIzVDM0QyRSwKICAzNXB4IDBweCAjNUMzRDJFLAogIDQwcHggMHB4ICM1QzNEMkUsCiAgNDVweCAwcHggIzVDM0QyRSwKICA1cHggNXB4ICM1QzNEMkUsCiAgMTBweCA1cHggI0ZGRkRGNSwKICAxNXB4IDVweCAjRkZGREY1LAogIDIwcHggNXB4ICNGRkZERjUsCiAgMjVweCA1cHggI0ZGRkRGNSwKICAzMHB4IDVweCAjRkZGREY1LAogIDM1cHggNXB4ICNGRkZERjUsCiAgNDBweCA1cHggI0ZGRkRGNSwKICA0NXB4IDVweCAjRkZGREY1LAogIDUwcHggNXB4ICM1QzNEMkUsCiAgNXB4IDEwcHggIzVDM0QyRSwKICAxMHB4IDEwcHggI0ZGRkRGNSwKICAxNXB4IDEwcHggIzRBMzcyOCwKICAyMHB4IDEwcHggIzRBMzcyOCwKICAyNXB4IDEwcHggIzRBMzcyOCwKICAzMHB4IDEwcHggIzRBMzcyOCwKICAzNXB4IDEwcHggIzRBMzcyOCwKICA0MHB4IDEwcHggIzRBMzcyOCwKICA0NXB4IDEwcHggI0ZGRkRGNSwKICA1MHB4IDEwcHggIzVDM0QyRSwKICA1cHggMTVweCAjNUMzRDJFLAogIDEwcHggMTVweCAjRkZGREY1LAogIDE1cHggMTVweCAjRkZGREY1LAogIDIwcHggMTVweCAjRkZGREY1LAogIDI1cHggMTVweCAjRkZGREY1LAogIDMwcHggMTVweCAjRkZGREY1LAogIDM1cHggMTVweCAjRkZGREY1LAogIDQwcHggMTVweCAjRkZGREY1LAogIDQ1cHggMTVweCAjRkZGREY1LAogIDUwcHggMTVweCAjNUMzRDJFLAogIDU1cHggMTVweCAjNUMzRDJFLAogIDVweCAyMHB4ICM1QzNEMkUsCiAgMTBweCAyMHB4ICNGRkZERjUsCiAgMTVweCAyMHB4ICNGRkZERjUsCiAgMjBweCAyMHB4ICNGRkZERjUsCiAgMjVweCAyMHB4ICNGRkZERjUsCiAgMzBweCAyMHB4ICNGRkZERjU7Cn0KCgogICAgLyogRW5kIG9mIENTUyAqLwogIAovKiAtLS0gTm9zdGFsZ2lhIEVuaGFuY2VtZW50cyAtLS0gKi8KLnN1bmJlYW1zIHsKICBwb3NpdGlvbjogZml4ZWQ7CiAgdG9wOiAtNTAlOyBsZWZ0OiAtNTAlOwogIHdpZHRoOiAyMDAlOyBoZWlnaHQ6IDIwMCU7CiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgcmdiYSgyNTUsIDIzMCwgMTgwLCAwKSAwJSwgcmdiYSgyNTUsIDIxMCwgMTUwLCAwLjA4KSAzMCUsIHJnYmEoMjU1LCAyMzAsIDE4MCwgMCkgNjAlKTsKICB0cmFuc2Zvcm0tb3JpZ2luOiBjZW50ZXI7CiAgYW5pbWF0aW9uOiBkcmlmdExpZ2h0IDYwcyBpbmZpbml0ZSBsaW5lYXI7CiAgcG9pbnRlci1ldmVudHM6IG5vbmU7CiAgei1pbmRleDogNTsKICBtaXgtYmxlbmQtbW9kZTogc29mdC1saWdodDsKfQpAa2V5ZnJhbWVzIGRyaWZ0TGlnaHQgewogIDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMGRlZykgdHJhbnNsYXRlKDAsIDApOyB9CiAgNTAlIHsgdHJhbnNmb3JtOiByb3RhdGUoNWRlZykgdHJhbnNsYXRlKC0yMHB4LCAxMHB4KTsgfQogIDEwMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKSB0cmFuc2xhdGUoMCwgMCk7IH0KfQoKLmR1c3QtbW90ZSB7CiAgcG9zaXRpb246IGFic29sdXRlOwogIHdpZHRoOiAzcHg7IGhlaWdodDogM3B4OwogIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNDAsIDIwMCwgMC40KTsKICBib3JkZXItcmFkaXVzOiA1MCU7CiAgcG9pbnRlci1ldmVudHM6IG5vbmU7CiAgZmlsdGVyOiBibHVyKDFweCk7CiAgYW5pbWF0aW9uOiBmbG9hdE1vdGUgMTVzIGluZmluaXRlIGVhc2UtaW4tb3V0OwogIHotaW5kZXg6IDY7Cn0KQGtleWZyYW1lcyBmbG9hdE1vdGUgewogIDAlLCAxMDAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgMCkgc2NhbGUoMSk7IG9wYWNpdHk6IDA7IH0KICAyNSUgeyBvcGFjaXR5OiAwLjg7IGZpbHRlcjogYmx1cigxcHgpIGRyb3Atc2hhZG93KDAgMCA0cHggcmdiYSgyNTUsMjIwLDE1MCwwLjgpKTsgfQogIDUwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlKDIwcHgsIC0zMHB4KSBzY2FsZSgxLjUpOyBvcGFjaXR5OiAwOyB9CiAgNzUlIHsgb3BhY2l0eTogMC42OyBmaWx0ZXI6IGJsdXIoMXB4KSBkcm9wLXNoYWRvdygwIDAgNHB4IHJnYmEoMjU1LDIyMCwxNTAsMC44KSk7IH0KfQoKLmx0LWJvZHksIC5wYWdlLWNvbnRlbnQgewogIHRleHQtc2hhZG93OiAwcHggMHB4IDFweCByZ2JhKDEwLCAxMCwgMzAsIDAuNCksIDBweCAxcHggMnB4IHJnYmEoMTAsIDEwLCAzMCwgMC4yKSwgMHB4IDBweCAzcHggcmdiYSgxMCwgMTAsIDMwLCAwLjEpOwogIGxldHRlci1zcGFjaW5nOiAwLjVweDsKfQoKLnNwcml0ZS10ZWFjdXAsIC5zcHJpdGUtZW52LCAuYm9vay1wYWdlLCAubGV0dGVyLWJvb2stcGFnZSwgLmVudmVsb3BlLXdyYXBwZXIsIC5sZXR0ZXItcGFwZXIgewogIGJveC1zaGFkb3c6IDAgNXB4IDE1cHggcmdiYSgwLDAsMCwwLjIpLCAwIDE1cHggMzVweCByZ2JhKDAsMCwwLDAuMSksIDAgMzBweCA2MHB4IHJnYmEoMCwwLDAsMC4xKSAhaW1wb3J0YW50Owp9CgouZmx5LWF3YXkgewogIGFuaW1hdGlvbjogZmx5QXdheSAzcyBjdWJpYy1iZXppZXIoMC4yNSwgMSwgMC41LCAxKSBmb3J3YXJkcyAhaW1wb3J0YW50Owp9CkBrZXlmcmFtZXMgZmx5QXdheSB7CiAgMCUgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAwKSBzY2FsZSgxKSByb3RhdGUoMGRlZyk7IG9wYWNpdHk6IDE7IH0KICAyMCUgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAtMjBweCkgc2NhbGUoMS4wNSkgcm90YXRlKDJkZWcpOyBvcGFjaXR5OiAxOyB9CiAgMTAwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlKDIwMHB4LCAtNTAwcHgpIHNjYWxlKDAuNSkgcm90YXRlKDE1ZGVnKTsgb3BhY2l0eTogMDsgfQp9CgoucGFydGljbGUgewogIHBvc2l0aW9uOiBhYnNvbHV0ZTsKICB3aWR0aDogNnB4OyBoZWlnaHQ6IDZweDsKICBiYWNrZ3JvdW5kOiB2YXIoLS13YXgtcmVkKTsKICBib3JkZXItcmFkaXVzOiA1MCU7CiAgcG9pbnRlci1ldmVudHM6IG5vbmU7CiAgei1pbmRleDogMTAwOwogIHRyYW5zaXRpb246IGFsbCAxcyBjdWJpYy1iZXppZXIoMC4xLCAwLjgsIDAuMiwgMSk7Cn0KCiAgCi5waG90by1saWdodGJveCB7IHBvc2l0aW9uOiBmaXhlZDsgaW5zZXQ6IDA7IGJhY2tncm91bmQ6IHJnYmEoMCwwLDAsMC44NSk7IHotaW5kZXg6IDk5OTk7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOyBvcGFjaXR5OiAwOyBwb2ludGVyLWV2ZW50czogbm9uZTsgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjNzOyBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoNXB4KTsgLXdlYmtpdC1iYWNrZHJvcC1maWx0ZXI6IGJsdXIoNXB4KTsgfQoucGhvdG8tbGlnaHRib3guYWN0aXZlIHsgb3BhY2l0eTogMTsgcG9pbnRlci1ldmVudHM6IGF1dG87IGN1cnNvcjogcG9pbnRlcjsgfQoucGhvdG8tbGlnaHRib3ggaW1nIHsgbWF4LXdpZHRoOiA5MHZ3OyBtYXgtaGVpZ2h0OiA5MHZoOyBib3JkZXItcmFkaXVzOiA4cHg7IGJveC1zaGFkb3c6IDAgMTBweCA0MHB4IHJnYmEoMCwwLDAsMC41KTsgYm9yZGVyOiA0cHggc29saWQgI2ZmZjsgdHJhbnNmb3JtOiBzY2FsZSgwLjk1KTsgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuM3M7IH0KLnBob3RvLWxpZ2h0Ym94LmFjdGl2ZSBpbWcgeyB0cmFuc2Zvcm06IHNjYWxlKDEpOyB9CgoucGFnZS1mcm9udCB7IHRyYW5zZm9ybTogcm90YXRlWSgwZGVnKSB0cmFuc2xhdGVaKDFweCk7IC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGVZKDBkZWcpIHRyYW5zbGF0ZVooMXB4KTsgfQoucGFnZS1iYWNrIHsgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZykgdHJhbnNsYXRlWigxcHgpOyAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpIHRyYW5zbGF0ZVooMXB4KTsgYm94LXNoYWRvdzogaW5zZXQgLTE4cHggMCAzNXB4IHJnYmEoMCwwLDAsMC4wNiksIC00cHggNHB4IDE1cHggcmdiYSgwLDAsMCwwLjEpOyB9CgoucGFnZS1iYWNrICosIC5wYWdlLWZyb250ICosIC5wYWdlLWZhY2UuYmFjayAqLCAucGFnZS1mYWNlLmZyb250ICogewogIC13ZWJraXQtYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuOwogIGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjsKfQoKLnBhZ2UtY29udGVudCB7CiAgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZVooMCk7CiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVaKDApOwp9Cjwvc3R5bGU+CjwvaGVhZD4KPGJvZHk+Cgo8ZGl2IGlkPSJwaG90b0xpZ2h0Ym94IiBjbGFzcz0icGhvdG8tbGlnaHRib3giIG9uY2xpY2s9InRoaXMuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJykiPgogIDxpbWcgaWQ9ImxpZ2h0Ym94SW1nIiBzcmM9IiIgYWx0PSJFbmxhcmdlZCBQaG90byI+CjwvZGl2PgoKICA8ZGl2IGNsYXNzPSJzdW5iZWFtcyI+PC9kaXY+CiAgPGRpdiBpZD0ibG9hZGluZ1NjcmVlbiI+VW5mb2xkaW5nIHlvdXIgbGV0dGVy4oCmIPCfkow8L2Rpdj4KICA8ZGl2IGNsYXNzPSJzdGF0dXMtY2hpcCIgaWQ9InN0YXR1c0NoaXAiPjwvZGl2PgogIDxkaXYgaWQ9ImVudmlyb25tZW50Ij4KICAgIDxkaXYgaWQ9InN0YXJzIj48L2Rpdj4KICAgIDxkaXYgaWQ9ImRlc2siPjwvZGl2PgogIDwvZGl2PgogIDxkaXYgaWQ9InNjYW5saW5lcyI+PC9kaXY+CgogIDxkaXYgaWQ9ImVudlBvcyIgY2xhc3M9Iml0ZW0tcG9zaXRpb25lciBpZGxlLWZsb2F0IiBvbmNsaWNrPSJoYW5kbGVFbnZlbG9wZSgpIj4KICAgIDxkaXYgaWQ9ImVudklubmVyIiBjbGFzcz0iaXRlbS1pbm5lciBlbnZlbG9wZS13cmFwcGVyIj4KICAgICAgPGRpdiBjbGFzcz0iZW52ZWxvcGUtYmFjayI+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImxldHRlci1wYXBlciIgaWQ9ImVudlBhcGVyIj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZW52ZWxvcGUtZnJvbnQiPgogICAgICAgIDxkaXYgY2xhc3M9ImVudmVsb3BlLXN0YW1wIj48L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJlbnZlbG9wZS1mcm9udC1zdHJpcCI+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iZW52ZWxvcGUtdGV4dCIgaWQ9ImVudlRvVGV4dCI+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJlbnZlbG9wZS1mbGFwIiBpZD0iZW52RmxhcCI+CiAgICAgICAgCiAgICAgIDwvZGl2PgogICAgPC9kaXY+CiAgPC9kaXY+CgogIDxkaXYgaWQ9ImFsYlBvcyIgY2xhc3M9Iml0ZW0tcG9zaXRpb25lciBpZGxlLWZsb2F0LWFsdCIgb25jbGljaz0iaGFuZGxlQWxidW0oKSI+CiAgICA8ZGl2IGlkPSJhbGJJbm5lciIgY2xhc3M9Iml0ZW0taW5uZXIgYm9vay13cmFwcGVyIj4KICAgICAgPGRpdiBjbGFzcz0iYm9vay1iYWNrIj48L2Rpdj4KICAgICAgPGRpdiBpZD0iYWxidW1QYWdlc0NvbnRhaW5lciI+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImJvb2stY292ZXIiPgogICAgICAgIDxkaXYgY2xhc3M9ImJvb2stY292ZXItdGV4dCI+T1VSPGJyPk1FTU9SSUVTPC9kaXY+CiAgICAgIDwvZGl2PgogICAgPC9kaXY+CiAgPC9kaXY+CgogIDxkaXYgaWQ9ImxldHRlckJvb2tWaWV3IiBjbGFzcz0iY2FyZC1mdWxsc2NyZWVuIj4KICAgIDxkaXYgaWQ9ImxldHRlclBhZ2VzQ29udGFpbmVyIiBjbGFzcz0ibGV0dGVyLWNvbnRlbnQtc2Nyb2xsIj48L2Rpdj4KICA8L2Rpdj4KICA8ZGl2IGlkPSJjYXJkTWluaSI+PC9kaXY+CiAgPGRpdiBjbGFzcz0iYm90dG9tLWJhciIgc3R5bGU9InBvc2l0aW9uOmZpeGVkOyBib3R0b206MjBweDsgbGVmdDowOyB3aWR0aDoxMDAlOyB6LWluZGV4OjEwMDsiPgogICAgPGJ1dHRvbiBpZD0icHJldkJ0biIgY2xhc3M9ImFjdGlvbi1idG4iIG9uY2xpY2s9InR1cm5QYWdlKC0xKSI+Jmx0OyBQUkVWPC9idXR0b24+CiAgICA8YnV0dG9uIGlkPSJuZXh0QnRuIiBjbGFzcz0iYWN0aW9uLWJ0biIgb25jbGljaz0idHVyblBhZ2UoMSkiPk5FWFQgJmd0OzwvYnV0dG9uPgogICAgPGJ1dHRvbiBpZD0iY2xvc2VCdG4iIGNsYXNzPSJhY3Rpb24tYnRuIHNlY29uZGFyeSIgb25jbGljaz0iY2xvc2VBY3RpdmUoKSI+Q0xPU0U8L2J1dHRvbj4KICA8L2Rpdj4KPHN0eWxlPgouZW5kLW1vbWVudHtwb3NpdGlvbjpmaXhlZDtsZWZ0OjUwJTtib3R0b206OTZweDt0cmFuc2Zvcm06dHJhbnNsYXRlKC01MCUsMjRweCk7ei1pbmRleDoxMjA7d2lkdGg6bWluKDQyMHB4LDkydncpO2JhY2tncm91bmQ6I0ZGRkRGNTtib3JkZXI6NHB4IHNvbGlkICM1QzNEMkU7Ym9yZGVyLXJhZGl1czoxOHB4O2JveC1zaGFkb3c6NnB4IDZweCAwICM1QzNEMkU7cGFkZGluZzoxOHB4IDE4cHggMTZweDt0ZXh0LWFsaWduOmNlbnRlcjtvcGFjaXR5OjA7cG9pbnRlci1ldmVudHM6bm9uZTt0cmFuc2l0aW9uOm9wYWNpdHkgLjVzIGVhc2UsdHJhbnNmb3JtIC41cyBjdWJpYy1iZXppZXIoLjMsMS41LC41LDEpO2ZvbnQtZmFtaWx5OidOdW5pdG8nLHNhbnMtc2VyaWY7Y29sb3I6IzRBMzcyOH0KLmVuZC1tb21lbnQuc2hvd3tvcGFjaXR5OjE7cG9pbnRlci1ldmVudHM6YXV0bzt0cmFuc2Zvcm06dHJhbnNsYXRlKC01MCUsMCl9Ci5lbmQtbW9tZW50IGgze2ZvbnQtZmFtaWx5OidDYXZlYXQnLGN1cnNpdmU7Zm9udC1zaXplOjMycHg7bGluZS1oZWlnaHQ6MS4xO21hcmdpbjo2cHggMCA0cHg7Y29sb3I6I0I4M0E2OH0KLmVuZC1tb21lbnQgcHtmb250LXNpemU6MTVweDtmb250LXdlaWdodDo3MDA7bGluZS1oZWlnaHQ6MS41O21hcmdpbjowIDAgMTJweH0KLmVuZC1tb21lbnQgLmVtLXJvd3tkaXNwbGF5OmZsZXg7Z2FwOjEwcHg7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmbGV4LXdyYXA6d3JhcH0KLmVuZC1tb21lbnQgYSwuZW5kLW1vbWVudCBidXR0b257bWluLWhlaWdodDo0NHB4O3BhZGRpbmc6MTBweCAxNnB4O2ZvbnQ6ODAwIDE1cHggJ051bml0bycsc2Fucy1zZXJpZjtjb2xvcjojNEEzNzI4O2JhY2tncm91bmQ6I0ZGQjhEMDtib3JkZXI6M3B4IHNvbGlkICM1QzNEMkU7Ym9yZGVyLXJhZGl1czo5OTlweDtib3gtc2hhZG93OjAgNHB4IDAgIzVDM0QyRTtjdXJzb3I6cG9pbnRlcjt0ZXh0LWRlY29yYXRpb246bm9uZTtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcn0KLmVuZC1tb21lbnQgYnV0dG9ue2JhY2tncm91bmQ6I0U5RERGRn0KLmVuZC1tb21lbnQgYTphY3RpdmUsLmVuZC1tb21lbnQgYnV0dG9uOmFjdGl2ZXt0cmFuc2Zvcm06dHJhbnNsYXRlWSg0cHgpO2JveC1zaGFkb3c6MCAwIDAgIzVDM0QyRX0KLmVuZC1tb21lbnQgYTpmb2N1cy12aXNpYmxlLC5lbmQtbW9tZW50IGJ1dHRvbjpmb2N1cy12aXNpYmxle291dGxpbmU6M3B4IHNvbGlkICM2RTNGRDA7b3V0bGluZS1vZmZzZXQ6M3B4fQouZW5kLWhlYXJ0e3Bvc2l0aW9uOmZpeGVkO3otaW5kZXg6MTMwO3BvaW50ZXItZXZlbnRzOm5vbmU7Zm9udC1zaXplOjI0cHg7YW5pbWF0aW9uOmVuZHJpc2UgMi40cyBlYXNlLW91dCBmb3J3YXJkc30KQGtleWZyYW1lcyBlbmRyaXNlezAle3RyYW5zZm9ybTp0cmFuc2xhdGVZKDApIHNjYWxlKC42KTtvcGFjaXR5OjB9MTUle29wYWNpdHk6MX0xMDAle3RyYW5zZm9ybTp0cmFuc2xhdGVZKC03MHZoKSBzY2FsZSgxLjMpIHJvdGF0ZSgxOGRlZyk7b3BhY2l0eTowfX0KQG1lZGlhIChwcmVmZXJzLXJlZHVjZWQtbW90aW9uOnJlZHVjZSl7LmVuZC1tb21lbnR7dHJhbnNpdGlvbjpub25lfS5lbmQtaGVhcnR7ZGlzcGxheTpub25lfX0KPC9zdHlsZT4KPGRpdiBjbGFzcz0iZW5kLW1vbWVudCIgaWQ9ImVuZE1vbWVudCIgcm9sZT0ic3RhdHVzIiBhcmlhLWxpdmU9InBvbGl0ZSI+CiAgPGRpdiBzdHlsZT0iZm9udC1zaXplOjI4cHgiIGFyaWEtaGlkZGVuPSJ0cnVlIj7wn5KMPC9kaXY+CiAgPGgzIGlkPSJlbmRTaWduIj48L2gzPgogIDxwPllvdSB3ZXJlIHRob3VnaHQgb2YgdG9kYXkuIFRoYXQncyB0aGUgd2hvbGUgcG9pbnQg8J+SlTwvcD4KICA8ZGl2IGNsYXNzPSJlbS1yb3ciPgogICAgPGEgaWQ9IndyaXRlQmFjayIgaHJlZj0iIyI+V3JpdGUgYmFjayDwn5KMPC9hPgogICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGlkPSJrZWVwQnRuIj5LZWVwIHRoaXMgbGV0dGVyPC9idXR0b24+CiAgPC9kaXY+CjwvZGl2Pgo8c2NyaXB0PgpmdW5jdGlvbiBzaG93RW5kTW9tZW50KCl7CiAgdmFyIGVtPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlbmRNb21lbnQnKTsKICB2YXIgc2c9KExFVFRFUi5zaWdufHxMRVRURVIuZnJvbXx8J1dpdGggbG92ZScpLnRyaW0oKTsKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZW5kU2lnbicpLnRleHRDb250ZW50PXNnOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3cml0ZUJhY2snKS5ocmVmPSdtYWlsdG86P3N1YmplY3Q9JytlbmNvZGVVUklDb21wb25lbnQoJ1RoYW5rIHlvdSBmb3IgeW91ciBsZXR0ZXIgXHVEODNEXHVEQzhDJyk7CiAgZW0uY2xhc3NMaXN0LmFkZCgnc2hvdycpOwogIGlmKHdpbmRvdy5tYXRjaE1lZGlhKCcocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKScpLm1hdGNoZXMpIHJldHVybjsKICAoZnVuY3Rpb24oKXt2YXIgc3Q9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtzdC50ZXh0Q29udGVudD0nLnB4Y3twb3NpdGlvbjpmaXhlZDt0b3A6LTEycHg7d2lkdGg6OHB4O2hlaWdodDo4cHg7Ym9yZGVyOjJweCBzb2xpZCAjNUMzRDJFO3otaW5kZXg6OTk5OTtwb2ludGVyLWV2ZW50czpub25lO2FuaW1hdGlvbjpweGNmYWxsIHZhcigtLXQsMy42cykgc3RlcHMoMjQpIGZvcndhcmRzfUBrZXlmcmFtZXMgcHhjZmFsbHt0b3t0cmFuc2Zvcm06dHJhbnNsYXRlKHZhcigtLWR4LDApLDEwNXZoKSByb3RhdGUoMTgwZGVnKTtvcGFjaXR5Oi45fX0nO2RvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3QpOwogIHZhciBjPVsnI0ZGQjhEMCcsJyNGRkUwNjYnLCcjQThENEZGJywnIzhGRERDOCcsJyNDOEE4RkYnLCcjRkZENEE4J107CiAgZm9yKHZhciBrPTA7azwzNjtrKyspeyhmdW5jdGlvbihrKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dmFyIHA9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7cC5jbGFzc05hbWU9J3B4Yyc7cC5zdHlsZS5sZWZ0PU1hdGgucmFuZG9tKCkqMTAwKyd2dyc7cC5zdHlsZS5iYWNrZ3JvdW5kPWNbayVjLmxlbmd0aF07cC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1keCcsKE1hdGgucmFuZG9tKCkqODAtNDApKydweCcpO3Auc3R5bGUuc2V0UHJvcGVydHkoJy0tdCcsKDMrTWF0aC5yYW5kb20oKSoyKSsncycpO2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocCk7c2V0VGltZW91dChmdW5jdGlvbigpe3AucmVtb3ZlKCk7fSw1MjAwKTt9LGsqOTApO30pKGspO319KSgpOwogIHZhciBnPVsnXHVEODNEXHVEQzk2JywnXHVEODNEXHVEQzk3JywnXHUyNzI4JywnXHVEODNDXHVERjM4JywnXHVEODNEXHVEQzk1J107CiAgZm9yKHZhciBpPTA7aTwxNDtpKyspeyhmdW5jdGlvbihpKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7CiAgICB2YXIgaD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtoLmNsYXNzTmFtZT0nZW5kLWhlYXJ0JztoLnRleHRDb250ZW50PWdbaSVnLmxlbmd0aF07CiAgICBoLnN0eWxlLmxlZnQ9KDgrTWF0aC5yYW5kb20oKSo4NCkrJ3Z3JztoLnN0eWxlLmJvdHRvbT0nMTB2aCc7aC5zdHlsZS5mb250U2l6ZT0oMTgrTWF0aC5yYW5kb20oKSoxNikrJ3B4JzsKICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaCk7c2V0VGltZW91dChmdW5jdGlvbigpe2gucmVtb3ZlKCk7fSwyNTAwKTt9LGkqMTIwKTt9KShpKTt9Cn0KZnVuY3Rpb24gaGlkZUVuZE1vbWVudCgpe3ZhciBlbT1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZW5kTW9tZW50Jyk7aWYoZW0pe2VtLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtlbS5kYXRhc2V0LmRvbmU9Jyc7fX0KdmFyIGVuZFRpbWVyPXNldEludGVydmFsKGZ1bmN0aW9uKCl7CiAgaWYodHlwZW9mIHN0YXRlPT09J3VuZGVmaW5lZCd8fHN0YXRlIT09J2NhcmRfb3Blbicpe3JldHVybjt9CiAgdmFyIGVtPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlbmRNb21lbnQnKTtpZihlbS5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKXx8ZW0uZGF0YXNldC5kb25lPT09JzEnKXJldHVybjsKICB2YXIgZWxzPVtkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGV0dGVyUGFnZXNDb250YWluZXInKSxkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGV0dGVyQm9va1ZpZXcnKV07CiAgZm9yKHZhciBpPTA7aTxlbHMubGVuZ3RoO2krKyl7dmFyIGU9ZWxzW2ldO2lmKGUmJmUuc2Nyb2xsSGVpZ2h0PmUuY2xpZW50SGVpZ2h0KzIwJiZlLnNjcm9sbFRvcCtlLmNsaWVudEhlaWdodD49ZS5zY3JvbGxIZWlnaHQtNjApe2VtLmRhdGFzZXQuZG9uZT0nMSc7c2hvd0VuZE1vbWVudCgpO3JldHVybjt9fQogIHZhciBzaWduPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsZXR0ZXJCb29rVmlldyAubGV0dGVyLXNpZ24sICNsZXR0ZXJCb29rVmlldyBbY2xhc3MqPSJzaWduIl0nKTsKICBpZihzaWduKXt2YXIgcj1zaWduLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO2lmKHIudG9wPjAmJnIuYm90dG9tPGlubmVySGVpZ2h0LTEyMCl7ZW0uZGF0YXNldC5kb25lPScxJztzaG93RW5kTW9tZW50KCk7fX0KfSw4MDApOwpkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJyxmdW5jdGlvbigpewogIHZhciBrPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdrZWVwQnRuJyk7CiAgaWYoaylrLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxmdW5jdGlvbigpewogICAgdmFyIGhpbnQ9ZnVuY3Rpb24oKXtrLnRleHRDb250ZW50PSdQcmVzcyBDdHJsL0NtZCArIFMgdG8ga2VlcCBpdCBcdUQ4M0RcdURDOUInO307CiAgICBmZXRjaChsb2NhdGlvbi5ocmVmKS50aGVuKGZ1bmN0aW9uKHIpe3JldHVybiByLnRleHQoKTt9KS50aGVuKGZ1bmN0aW9uKHQpewogICAgICB2YXIgYT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7YS5ocmVmPVVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW3RdLHt0eXBlOid0ZXh0L2h0bWwnfSkpO2EuZG93bmxvYWQ9J215LWxldHRlci5odG1sJztkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGEpO2EuY2xpY2soKTthLnJlbW92ZSgpOwogICAgICBrLnRleHRDb250ZW50PSdTYXZlZCBcdUQ4M0RcdURDOUInOwogICAgfSkuY2F0Y2goaGludCk7CiAgfSk7Cn0pOwo8L3NjcmlwdD4KICA8c2NyaXB0PgoKZnVuY3Rpb24gZW5sYXJnZVBob3RvKHNyYykgewogIGxldCBsaWdodGJveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwaG90b0xpZ2h0Ym94Jyk7CiAgbGV0IGltZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaWdodGJveEltZycpOwogIGltZy5zcmMgPSBzcmM7CiAgbGlnaHRib3guY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7Cn0KCnZhciBfX0VNQkVEREVEX18gPSBudWxsOwp2YXIgTEVUVEVSID0gKGZ1bmN0aW9uKCl7CiAgaWYoX19FTUJFRERFRF9fICYmIHR5cGVvZiBfX0VNQkVEREVEX18gPT09ICdvYmplY3QnKSByZXR1cm4gX19FTUJFRERFRF9fOwogIHRyeXsKICAgIHZhciBpZCA9IG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKS5nZXQoJ2lkJyk7CiAgICBpZihpZCl7CiAgICAgIHZhciByID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3BweC1sZXR0ZXItJyArIGlkKSB8fCBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdwcHgtbGV0dGVyLScgKyBpZCk7CiAgICAgIGlmKHIpIHJldHVybiBKU09OLnBhcnNlKHIpOwogICAgfQogICAgdmFyIGxhdGVzdCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdwcHgtbGF0ZXN0LXByZXZpZXcnKSB8fCBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdwcHgtbGF0ZXN0LXByZXZpZXcnKTsKICAgIGlmKGxhdGVzdCkgcmV0dXJuIEpTT04ucGFyc2UobGF0ZXN0KTsKICB9IGNhdGNoKGUpe30KICByZXR1cm4gewogICAgdG86ICdEZWFyIGZyaWVuZCwnLAogICAgYm9keTogJ0kgd2FzIHNpdHRpbmcgYnkgdGhlIHdpbmRvdyB0aGlzIGV2ZW5pbmcsIHdhdGNoaW5nIHRoZSBza3kgdHVybiB0aGF0IHBhcnRpY3VsYXIgc2hhZGUgb2Ygb3JhbmdlIHlvdSBhbHdheXMgc2FpZCBsb29rZWQgbGlrZSB0aGUgaW5zaWRlIG9mIGEgbWFuZ28sIGFuZCBJIHRob3VnaHQgb2YgeW91LlxuXG5JIGRvblwndCBrbm93IHdoeSB3ZSBzdG9wIGNhbGxpbmcgdGhlIHBlb3BsZSB3ZSBsb3ZlIG1vc3QuIE1heWJlIGl0XCdzIGJlY2F1c2Ugd2UgdGhpbmsgdGhleSBhbHJlYWR5IGtub3cuIEJ1dCBJIHdhbnRlZCB0byB3cml0ZSBpdCBkb3duIGFueXdheSDigJQgeW91IGFyZSBvbmUgb2YgdGhlIGJlc3QgcGFydHMgb2YgbXkgbGlmZS4g4pyoJywKICAgIHNpZ246ICdXaXRoIHNvIG11Y2ggbG92ZSxcblBlblBhbCBQaXhlbCDwn4y4JywKICAgIGRhdGU6IG5ldyBEYXRlKCkudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1VUycse3llYXI6J251bWVyaWMnLG1vbnRoOidsb25nJyxkYXk6J251bWVyaWMnfSksCiAgICBmcm9tOiAnUGVuUGFsIFBpeGVsJywgcGhvdG9zOiBbXSAKICB9Owp9KSgpOwoKdmFyIHN0YXRlID0gJ2Rlc2snOyAvLyBkZXNrLCBlbnZfcGlja2VkLCBjYXJkX29wZW4sIGFsYnVtX3BpY2tlZAp2YXIgaXNBbmltYXRpbmcgPSBmYWxzZTsKdmFyIGN1cnJlbnRBbGJ1bVBhZ2UgPSAwOwp2YXIgdG90YWxBbGJ1bVBhZ2VzID0gMDsKdmFyIGN1cnJlbnRMZXR0ZXJQYWdlID0gMDsKdmFyIHRvdGFsTGV0dGVyUGFnZXMgPSAwOwoKZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7CgogIC8vIEZpeCBMb2dpY2FsIEJ1ZzogQXBwbHkgdXNlcidzIHNlbGVjdGVkIHBhcGVyIHRoZW1lIHRvIHRoZSB2aWV3ZXIKICB2YXIgdGhlbWVzID0geyBjOiAnI0ZGRkRGNScsIGw6ICcjRjhGMkZGJywgYjogJyNGRkYwRjYnLCBtOiAnI0VGRkZGQScsIHM6ICcjRUZGN0ZGJywgcDogJyNGRkY1RUEnIH07CiAgaWYoTEVUVEVSLnBhcGVyICYmIHRoZW1lc1tMRVRURVIucGFwZXJdKXsKICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1jcmVhbScsIHRoZW1lc1tMRVRURVIucGFwZXJdKTsKICB9CgogIC8vIEFwcGx5IHRoZSBzZW5kZXIncyBjaG9zZW4gaGFuZHdyaXRpbmcgZm9udCAod2FzIHByZXZpb3VzbHkgaWdub3JlZCBvbiBleHBvcnQpCiAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCctLWxldHRlci1mb250JywgTEVUVEVSLmZvbnQgfHwgIidDYXZlYXQnIik7CgogIAogIC8vIFNwYXduIEdvbGRlbiBIb3VyIER1c3QgTW90ZXMKICB2YXIgZW52ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Vudmlyb25tZW50Jyk7CiAgZm9yKGxldCBpPTA7IGk8MzU7IGkrKyl7CiAgICB2YXIgbW90ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOwogICAgbW90ZS5jbGFzc05hbWUgPSAnZHVzdC1tb3RlJzsKICAgIG1vdGUuc3R5bGUubGVmdCA9IChNYXRoLnJhbmRvbSgpICogMTAwKSArICd2dyc7CiAgICBtb3RlLnN0eWxlLnRvcCA9IChNYXRoLnJhbmRvbSgpICogMTAwKSArICd2aCc7CiAgICBtb3RlLnN0eWxlLmFuaW1hdGlvbkR1cmF0aW9uID0gKDEyICsgTWF0aC5yYW5kb20oKSAqIDIwKSArICdzJzsKICAgIG1vdGUuc3R5bGUuYW5pbWF0aW9uRGVsYXkgPSAnLScgKyAoTWF0aC5yYW5kb20oKSAqIDIwKSArICdzJzsKICAgIGVudi5hcHBlbmRDaGlsZChtb3RlKTsKICB9CgogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlbnZUb1RleHQnKS50ZXh0Q29udGVudCA9ICdUbzogJyArIChMRVRURVIudG8gfHwgJ0RlYXIgZnJpZW5kJyk7CgogIGZ1bmN0aW9uIGVzY2FwZUhUTUwoc3RyKSB7CiAgcmV0dXJuIChzdHIgfHwgJycpLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKS5yZXBsYWNlKC8iL2csICcmcXVvdDsnKTsKfQogIHZhciBwaG90b3MgPSBMRVRURVIucGhvdG9zIHx8IFtdOwogIAogIAogIAogIC8vIExFVFRFUiBSRU5ERVJJTkcgRU5HSU5FIChTY3JvbGxhYmxlKQogIHZhciBsZXR0ZXJDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGV0dGVyUGFnZXNDb250YWluZXInKTsKICBsZXR0ZXJDb250YWluZXIuaW5uZXJIVE1MID0gJyc7IC8vIENsZWFyCiAgCiAgdmFyIGRlbGF5VGltZSA9IDEuMDsKICB2YXIgZGF0ZUhUTUwgPSBMRVRURVIuZGF0ZSA/IGA8ZGl2IGNsYXNzPSJsZXR0ZXItcmV2ZWFsIiBzdHlsZT0iLS1kZWxheTogJHtkZWxheVRpbWV9czsgdGV4dC1hbGlnbjpyaWdodDsgZm9udC1zaXplOiAxOHB4OyBvcGFjaXR5OjAuNzsgbWFyZ2luLWJvdHRvbTogMjBweDsiPiR7ZXNjYXBlSFRNTChMRVRURVIuZGF0ZSl9PC9kaXY+YCA6ICcnOwogIGRlbGF5VGltZSArPSAwLjI7CiAgCiAgdmFyIHRpdGxlSFRNTCA9IExFVFRFUi50byA/IGA8ZGl2IGNsYXNzPSJsZXR0ZXItcmV2ZWFsIGxldHRlci10aXRsZSIgc3R5bGU9Ii0tZGVsYXk6ICR7ZGVsYXlUaW1lfXM7IG1hcmdpbi1ib3R0b206MTVweDsgZm9udC1zaXplOiAzMnB4OyI+JHtlc2NhcGVIVE1MKExFVFRFUi50byl9PC9kaXY+YCA6ICcnOwogIGlmKExFVFRFUi50bykgZGVsYXlUaW1lICs9IDAuMjsKICAKICB2YXIgcGFyYWdyYXBocyA9IChMRVRURVIuYm9keSB8fCAnJykuc3BsaXQoLyg/OlxyXG58XHJ8XG4pezIsfS8pOwogIHZhciBib2R5SFRNTCA9ICcnOwogIGZvcihsZXQgaT0wOyBpPHBhcmFncmFwaHMubGVuZ3RoOyBpKyspewogICAgaWYocGFyYWdyYXBoc1tpXS50cmltKCkgPT09ICcnKSBjb250aW51ZTsKICAgIGxldCBwYXJhQ29udGVudCA9IGVzY2FwZUhUTUwocGFyYWdyYXBoc1tpXSkucmVwbGFjZSgvXG4vZywgJzxicj4nKTsKICAgIGJvZHlIVE1MICs9IGA8cCBjbGFzcz0ibGV0dGVyLXJldmVhbCBsZXR0ZXItcGFyYSIgc3R5bGU9Ii0tZGVsYXk6ICR7ZGVsYXlUaW1lfXM7Ij4ke3BhcmFDb250ZW50fTwvcD5gOwogICAgZGVsYXlUaW1lICs9IDAuMjsKICB9CiAgCiAgdmFyIHNpZ25IVE1MID0gYDxkaXYgY2xhc3M9ImxldHRlci1yZXZlYWwiIHN0eWxlPSItLWRlbGF5OiAke2RlbGF5VGltZX1zOyBtYXJnaW4tdG9wOjQwcHg7IGRpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmQ7IGdhcDoxMHB4OyI+CiAgICAgICAgICAgICAgICAgICAgPGRpdj4ke2VzY2FwZUhUTUwoTEVUVEVSLnNpZ24gfHwgJ1dpdGggbG92ZScpLnJlcGxhY2UoL1xuL2csICc8YnI+Jyl9PC9kaXY+CiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0iZm9udC1zaXplOjMycHg7IGZpbHRlcjpodWUtcm90YXRlKC0yMGRlZykgb3BhY2l0eSgwLjgpOyI+8J+SjDwvZGl2PgogICAgICAgICAgICAgICAgICA8L2Rpdj5gOwogIAogIHZhciBwb3N0bWFya1NWRyA9IGAKICAgIDxzdmcgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgc3R5bGU9InBvc2l0aW9uOmFic29sdXRlOyB0b3A6IDE1cHg7IHJpZ2h0OiAyNXB4OyBvcGFjaXR5OiAwLjI7IHRyYW5zZm9ybTogcm90YXRlKDE1ZGVnKTsgcG9pbnRlci1ldmVudHM6bm9uZTsgbWl4LWJsZW5kLW1vZGU6IG11bHRpcGx5OyI+CiAgICAgIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBmaWxsPSJub25lIiBzdHJva2U9IiM1YTNhMjIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNCAyIi8+CiAgICAgIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjM1IiBmaWxsPSJub25lIiBzdHJva2U9IiM1YTNhMjIiIHN0cm9rZS13aWR0aD0iMSIvPgogICAgICA8dGV4dCB4PSI1MCIgeT0iNDUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM1YTNhMjIiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCIgbGV0dGVyLXNwYWNpbmc9IjEiPlBBUiBBVklPTjwvdGV4dD4KICAgICAgPHRleHQgeD0iNTAiIHk9IjY1IiBmb250LXNpemU9IjEwIiBmaWxsPSIjNWEzYTIyIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgbGV0dGVyLXNwYWNpbmc9IjEiPkFJUiBNQUlMPC90ZXh0PgogICAgICA8cGF0aCBkPSJNIDAgNTAgUSAyNSAzMCwgNTAgNTAgVCAxMDAgNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzVhM2EyMiIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjYiLz4KICAgICAgPHBhdGggZD0iTSAwIDYwIFEgMjUgNDAsIDUwIDYwIFQgMTAwIDYwIiBmaWxsPSJub25lIiBzdHJva2U9IiM1YTNhMjIiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC42Ii8+CiAgICA8L3N2Zz5gOwogICAgCiAgdmFyIGNvZmZlZVN0YWluU1ZHID0gYAogICAgPHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHN0eWxlPSJwb3NpdGlvbjphYnNvbHV0ZTsgYm90dG9tOiA4MHB4OyBsZWZ0OiAtNDBweDsgb3BhY2l0eTogMC4xMjsgdHJhbnNmb3JtOiByb3RhdGUoLTI1ZGVnKTsgcG9pbnRlci1ldmVudHM6bm9uZTsgbWl4LWJsZW5kLW1vZGU6IG11bHRpcGx5OyI+CiAgICAgIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQwIiBmaWxsPSJub25lIiBzdHJva2U9IiM0YTJlMTUiIHN0cm9rZS13aWR0aD0iMyIgb3BhY2l0eT0iMC44Ii8+CiAgICAgIDxjaXJjbGUgY3g9IjUzIiBjeT0iNDgiIHI9IjM4IiBmaWxsPSJub25lIiBzdHJva2U9IiM0YTJlMTUiIHN0cm9rZS13aWR0aD0iMS41IiBvcGFjaXR5PSIwLjUiLz4KICAgICAgPGNpcmNsZSBjeD0iNDgiIGN5PSI1MiIgcj0iNDEiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzRhMmUxNSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSIyMCA1IDEwIDUiIG9wYWNpdHk9IjAuNiIvPgogICAgICA8Y2lyY2xlIGN4PSIxNSIgY3k9Ijc1IiByPSI0IiBmaWxsPSIjNGEyZTE1IiBvcGFjaXR5PSIwLjciLz4KICAgICAgPGNpcmNsZSBjeD0iMjUiIGN5PSI4NSIgcj0iMiIgZmlsbD0iIzRhMmUxNSIgb3BhY2l0eT0iMC41Ii8+CiAgICA8L3N2Zz5gOwogIAogIHZhciBmdWxsVGV4dCA9IHBvc3RtYXJrU1ZHICsgY29mZmVlU3RhaW5TVkcgKyBkYXRlSFRNTCArIHRpdGxlSFRNTCArIGJvZHlIVE1MICsgc2lnbkhUTUw7CiAgCiAgbGV0IGh0bWwgPSBgPGRpdiBjbGFzcz0icGFnZS1jb250ZW50IiBzdHlsZT0ib3ZlcmZsb3c6dmlzaWJsZTsgaGVpZ2h0OmF1dG87IG1pbi1oZWlnaHQ6IDEwMCU7Ij4ke2Z1bGxUZXh0fTwvZGl2PmA7CiAgCiAgbGV0dGVyQ29udGFpbmVyLmlubmVySFRNTCA9IGh0bWw7CgoKICAKICB2YXIgYWxidW1QYWdlc0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbGJ1bVBhZ2VzQ29udGFpbmVyJyk7CiAgCiAgLy8gSWYgbm8gcGhvdG9zLCBtYWtlIDEgcGFnZSB0aGF0IHNheXMgTk8gUEhPVE9TCiAgbGV0IGFsYnVtSXRlbXMgPSBbXTsKICBpZihwaG90b3MgJiYgcGhvdG9zLmxlbmd0aCA+IDApewogICAgZm9yKGxldCBpPTA7IGk8cGhvdG9zLmxlbmd0aDsgaSsrKXsKICAgICAgYWxidW1JdGVtcy5wdXNoKGAKICAgICAgICA8ZGl2IGNsYXNzPSJwYWdlLXRpdGxlIj7wn5OWIFNjcmFwYm9vazwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InBvbGFyb2lkIiBzdHlsZT0id2lkdGg6OTAlO21hcmdpbi10b3A6MTBweDt0cmFuc2Zvcm06cm90YXRlKCR7TWF0aC5yYW5kb20oKSo2LTN9ZGVnKTsiPgogICAgICAgICAgPGRpdiBjbGFzcz0idGFwZSI+PC9kaXY+CiAgICAgICAgICA8aW1nIHNyYz0iJHtlc2NhcGVIVE1MKHBob3Rvc1tpXSl9IiBjcm9zc29yaWdpbj0iYW5vbnltb3VzIiBvbmNsaWNrPSJlbmxhcmdlUGhvdG8odGhpcy5zcmMpIiBzdHlsZT0iY3Vyc29yOnBvaW50ZXI7IGhlaWdodDoyMDBweDtvYmplY3QtZml0OmNvdmVyO3dpZHRoOjEwMCU7Ij4KICAgICAgICA8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJwaG90by1jYXB0aW9uIj5QSE9UTyAjJHtpKzF9IE9GICR7cGhvdG9zLmxlbmd0aH08L2Rpdj4KICAgICAgYCk7CiAgICB9CiAgfSBlbHNlIHsKICAgIGFsYnVtSXRlbXMucHVzaChgCiAgICAgIDxkaXYgY2xhc3M9InBhZ2UtdGl0bGUiPvCfk5YgU2NyYXBib29rPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InBvbGFyb2lkIiBzdHlsZT0iZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2hlaWdodDoyNDBweDtiYWNrZ3JvdW5kOiNmMGYwZjA7ZmxleC1kaXJlY3Rpb246Y29sdW1uOyI+CiAgICAgICAgPGRpdiBjbGFzcz0idGFwZSI+PC9kaXY+CiAgICAgICAgPHNwYW4gc3R5bGU9ImZvbnQtZmFtaWx5OidOdW5pdG8nLHNhbnMtc2VyaWY7Zm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToxM3B4O2NvbG9yOnJnYmEoMCwwLDAsMC4zKTtsaW5lLWhlaWdodDoxLjg7dGV4dC1hbGlnbjpjZW50ZXI7Ij5OTyBQSE9UT1M8YnI+QVRUQUNIRUR+PC9zcGFuPgogICAgICA8L2Rpdj4KICAgIGApOwogIH0KCiAgdG90YWxBbGJ1bVBhZ2VzID0gTWF0aC5jZWlsKGFsYnVtSXRlbXMubGVuZ3RoIC8gMik7CgogIGZvcihsZXQgaT0wOyBpPHRvdGFsQWxidW1QYWdlczsgaSsrKXsKICAgIGxldCBmcm9udElkeCA9IGkgKiAyOwogICAgbGV0IGJhY2tJZHggPSBpICogMiArIDE7CiAgICAKICAgIGxldCBmcm9udENvbnRlbnQgPSBhbGJ1bUl0ZW1zW2Zyb250SWR4XSB8fCAnJzsKICAgIGxldCBiYWNrQ29udGVudCA9IGFsYnVtSXRlbXNbYmFja0lkeF0gfHwgJyc7CiAgICAKICAgIGxldCBwYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7CiAgICBwYWdlLmNsYXNzTmFtZSA9ICdib29rLXBhZ2UnOwogICAgcGFnZS5zdHlsZS56SW5kZXggPSAxMCAtIGk7CiAgICBwYWdlLnN0eWxlLnNldFByb3BlcnR5KCctLXonLCAoLWkgKiAwLjIpICsgJ3B4Jyk7CiAgICBwYWdlLmlkID0gJ2FsYnVtUGFnZV8nICsgaTsKICAgIAogICAgcGFnZS5pbm5lckhUTUwgPSBgCiAgICAgIDxkaXYgY2xhc3M9InBhZ2UtZmFjZSBiYWNrIj4ke2JhY2tDb250ZW50fTwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwYWdlLWZhY2UgZnJvbnQiPiR7ZnJvbnRDb250ZW50fTwvZGl2PgogICAgYDsKICAgIGFsYnVtUGFnZXNDb250YWluZXIuYXBwZW5kQ2hpbGQocGFnZSk7CiAgfQoKCiAgc2V0VGltZW91dChmdW5jdGlvbigpewogICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRpbmdTY3JlZW4nKS5zdHlsZS5vcGFjaXR5ID0gJzAnOwogICAgc2V0VGltZW91dCgoKSA9PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZ1NjcmVlbicpLnJlbW92ZSgpLCA1MDApOwogICAgc2V0U3RhdHVzKCdTb21lb25lIHdyb3RlIHlvdSBhIGxldHRlciBcdUQ4M0RcdURDOEMgVGFwIHRoZSBlbnZlbG9wZScpOwogIH0sIDUwMCk7Cn0pOwoKZnVuY3Rpb24gc2V0U3RhdHVzKHRleHQpIHsgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXR1c0NoaXAnKS5pbm5lckhUTUwgPSB0ZXh0OyB9CmZ1bmN0aW9uIHNldENvbnRyb2xzKGNsb3NlQnRuLCBuYXZCdG5zKSB7CiAgdmFyIGMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xvc2VCdG4nKTsKICBsZXQgcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcmV2QnRuJyk7CiAgdmFyIG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV4dEJ0bicpOwogIGMuY2xhc3NOYW1lID0gJ2J0biBhY3Rpb24tYnRuJyArIChjbG9zZUJ0biA/ICcgYWN0aXZlJyA6ICcnKTsKICBwLmNsYXNzTmFtZSA9ICdidG4gYWN0aW9uLWJ0biBzZWNvbmRhcnknICsgKG5hdkJ0bnMgPyAnIGFjdGl2ZScgOiAnJyk7CiAgbi5jbGFzc05hbWUgPSAnYnRuIGFjdGlvbi1idG4gc2Vjb25kYXJ5JyArIChuYXZCdG5zID8gJyBhY3RpdmUnIDogJycpOwp9CgoKICAvLyBGaXJlZmx5IEJ1cnN0CiAgZnVuY3Rpb24gc3Bhd25FbnZlbG9wZUJ1cnN0KCkgewogICAgdmFyIGVudiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlbnZQb3MnKTsKICAgIHZhciByZWN0ID0gZW52LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpOwogICAgZm9yKGxldCBpPTA7IGk8MjA7IGkrKykgewogICAgICBsZXQgZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOwogICAgICBmLmNsYXNzTmFtZSA9ICdlbnYtZmlyZWZseSc7CiAgICAgIGYuc3R5bGUubGVmdCA9IChyZWN0LmxlZnQgKyByZWN0LndpZHRoLzIpICsgJ3B4JzsKICAgICAgZi5zdHlsZS50b3AgPSAocmVjdC50b3AgKyByZWN0LmhlaWdodC8yKSArICdweCc7CiAgICAgIGxldCBhbmdsZSA9IE1hdGgucmFuZG9tKCkgKiBNYXRoLlBJICogMjsKICAgICAgdmFyIHNwZWVkID0gTWF0aC5yYW5kb20oKSAqIDE1MCArIDUwOwogICAgICBmLnN0eWxlLnNldFByb3BlcnR5KCctLXR4JywgKE1hdGguY29zKGFuZ2xlKSpzcGVlZCkrJ3B4Jyk7CiAgICAgIGYuc3R5bGUuc2V0UHJvcGVydHkoJy0tdHknLCAoTWF0aC5zaW4oYW5nbGUpKnNwZWVkIC0gMTUwKSsncHgnKTsKICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChmKTsKICAgICAgc2V0VGltZW91dCgoZnVuY3Rpb24oZWwpeyByZXR1cm4gZnVuY3Rpb24oKXsgZWwucmVtb3ZlKCk7IH0gfSkoZiksIDIwMDApOwogICAgfQogIH0KCiAgLy8gSW50ZXJhY3RpdmUgUGFydGljbGUgUGh5c2ljcwogIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpIHsKICAgIGlmKHN0YXRlICE9PSAnZGVzaycpIHJldHVybjsKICAgIHZhciBtb3RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tb3RlLCAuYmxvc3NvbScpOwogICAgdmFyIG14ID0gZS5jbGllbnRYOwogICAgdmFyIG15ID0gZS5jbGllbnRZOwogICAgCiAgICBtb3Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG0pewogICAgICB2YXIgcmVjdCA9IG0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7CiAgICAgIHZhciBkeCA9IHJlY3QubGVmdCArIHJlY3Qud2lkdGgvMiAtIG14OwogICAgICB2YXIgZHkgPSByZWN0LnRvcCArIHJlY3QuaGVpZ2h0LzIgLSBteTsKICAgICAgbGV0IGRpc3QgPSBNYXRoLnNxcnQoZHgqZHggKyBkeSpkeSk7CiAgICAgIGlmKGRpc3QgPCAxNTApeyAKICAgICAgICB2YXIgZm9yY2UgPSAoMTUwIC0gZGlzdCkgLyAxNTA7CiAgICAgICAgdmFyIHB1c2hYID0gKGR4IC8gZGlzdCkgKiBmb3JjZSAqIDYwOwogICAgICAgIHZhciBwdXNoWSA9IChkeSAvIGRpc3QpICogZm9yY2UgKiA2MDsKICAgICAgICBtLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIHB1c2hYICsgJ3B4LCAnICsgcHVzaFkgKyAncHgpJzsKICAgICAgICBtLnN0eWxlLnRyYW5zaXRpb24gPSAndHJhbnNmb3JtIDAuM3MgZWFzZS1vdXQnOwogICAgICB9IGVsc2UgewogICAgICAgIG0uc3R5bGUudHJhbnNmb3JtID0gJyc7CiAgICAgICAgbS5zdHlsZS50cmFuc2l0aW9uID0gJ3RyYW5zZm9ybSAycyBlYXNlLWluJzsKICAgICAgfQogICAgfSk7CiAgfSk7CgogIGZ1bmN0aW9uIHNwYXduSGVhcnRzKCl7CiAgbGV0IGVudlBvcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlbnZQb3MnKTsKICBmb3IobGV0IGk9MDsgaTw2OyBpKyspewogICAgKGZ1bmN0aW9uKGlkeCl7CiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsKICAgICAgICBsZXQgaCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOwogICAgICAgIGguaW5uZXJIVE1MID0gJ/CfkpYnOwogICAgICAgIGguc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnOwogICAgICAgIGguc3R5bGUubGVmdCA9ICc1MCUnOwogICAgICAgIGguc3R5bGUudG9wID0gJzMwJSc7CiAgICAgICAgaC5zdHlsZS5mb250U2l6ZSA9ICgyMCArIE1hdGgucmFuZG9tKCkqMjApICsgJ3B4JzsKICAgICAgICBoLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7CiAgICAgICAgaC5zdHlsZS56SW5kZXggPSA2MDsKICAgICAgICBoLnN0eWxlLnRyYW5zaXRpb24gPSAnYWxsIDEuMnMgZWFzZS1vdXQnOwogICAgICAgIGguc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgtNTAlLCAtNTAlKSBzY2FsZSgwLjUpJzsKICAgICAgICBoLnN0eWxlLm9wYWNpdHkgPSAnMSc7CiAgICAgICAgZW52UG9zLmFwcGVuZENoaWxkKGgpOwogICAgICAgIAogICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsKICAgICAgICAgIGxldCB0eCA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDMwMDsKICAgICAgICAgIGxldCB0eSA9IC0xMDAgLSBNYXRoLnJhbmRvbSgpICogMjAwOwogICAgICAgICAgaC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKGNhbGMoLTUwJSArICcgKyB0eCArICdweCksIGNhbGMoLTUwJSArICcgKyB0eSArICdweCkpIHNjYWxlKDEuNSkgcm90YXRlKCcgKyAoTWF0aC5yYW5kb20oKSo5MC00NSkgKyAnZGVnKSc7CiAgICAgICAgICBoLnN0eWxlLm9wYWNpdHkgPSAnMCc7CiAgICAgICAgfSwgNTApOwogICAgICAgIAogICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgaC5yZW1vdmUoKTsgfSwgMTIwMCk7CiAgICAgIH0sIGlkeCAqIDEwMCk7CiAgICB9KShpKTsKICB9Cn0KCmZ1bmN0aW9uIHVwZGF0ZU5hdkJ0bnMoKSB7CiAgbGV0IHAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJldkJ0bicpOwogIHZhciBuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25leHRCdG4nKTsKICAKICBpZiAoc3RhdGUgPT09ICdhbGJ1bV9waWNrZWQnKSB7CiAgICBwLnN0eWxlLm9wYWNpdHkgPSAoY3VycmVudEFsYnVtUGFnZSA9PT0gMCkgPyAnMC4zJyA6ICcxJzsKICAgIHAuc3R5bGUucG9pbnRlckV2ZW50cyA9IChjdXJyZW50QWxidW1QYWdlID09PSAwKSA/ICdub25lJyA6ICdhdXRvJzsKICAgIG4uc3R5bGUub3BhY2l0eSA9IChjdXJyZW50QWxidW1QYWdlID49IHRvdGFsQWxidW1QYWdlcykgPyAnMC4zJyA6ICcxJzsKICAgIG4uc3R5bGUucG9pbnRlckV2ZW50cyA9IChjdXJyZW50QWxidW1QYWdlID49IHRvdGFsQWxidW1QYWdlcykgPyAnbm9uZScgOiAnYXV0byc7CiAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJ2NhcmRfb3BlbicpIHsKICAgIHAuc3R5bGUub3BhY2l0eSA9IChjdXJyZW50TGV0dGVyUGFnZSA9PT0gMCkgPyAnMC4zJyA6ICcxJzsKICAgIHAuc3R5bGUucG9pbnRlckV2ZW50cyA9IChjdXJyZW50TGV0dGVyUGFnZSA9PT0gMCkgPyAnbm9uZScgOiAnYXV0byc7CiAgICBuLnN0eWxlLm9wYWNpdHkgPSAoY3VycmVudExldHRlclBhZ2UgPj0gdG90YWxMZXR0ZXJQYWdlcykgPyAnMC4zJyA6ICcxJzsKICAgIG4uc3R5bGUucG9pbnRlckV2ZW50cyA9IChjdXJyZW50TGV0dGVyUGFnZSA+PSB0b3RhbExldHRlclBhZ2VzKSA/ICdub25lJyA6ICdhdXRvJzsKICB9Cn0KCmZ1bmN0aW9uIGhhbmRsZUVudmVsb3BlKCl7CiAgaWYoaXNBbmltYXRpbmcpIHJldHVybjsKICAKICBpZihzdGF0ZSA9PT0gJ2Rlc2snKXsKICAgIGlzQW5pbWF0aW5nID0gdHJ1ZTsKICAgIHN0YXRlID0gJ2Vudl9waWNrZWQnOwogICAgc2V0U3RhdHVzKCdPUEVOSU5HIEVOVkVMT1BFLi4uJyk7CiAgICAKICAgIGxldCBlbnZQb3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZW52UG9zJyk7CiAgICBsZXQgZW52SW5uZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZW52SW5uZXInKTsKICAgIGxldCBhbGJQb3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWxiUG9zJyk7CiAgICAKICAgIGVudklubmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lkbGUtZmxvYXQnKTsKICAgIGVudlBvcy5jbGFzc0xpc3QuYWRkKCdwaWNrZWQtdXAnKTsKICAgIGFsYlBvcy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsgCiAgICAKICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsKICAgICAgZW52UG9zLmNsYXNzTGlzdC5hZGQoJ29wZW5lZCcpOwogICAgICBzcGF3bkhlYXJ0cygpOwogICAgICAKICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpewogICAgICAgIGVudlBvcy5jbGFzc0xpc3QuYWRkKCdkcmF3bi1vdXQnKTsKICAgICAgICAKICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7CiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FyZE1pbmknKS5zdHlsZS5vcGFjaXR5ID0gJzAnOwogICAgICAgICAgZW52UG9zLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpOwogICAgICAgICAgCiAgICAgICAgICB2YXIgbGV0dGVyQm9vayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZXR0ZXJCb29rVmlldycpOwogICAgICAgICAgbGV0dGVyQm9vay5jbGFzc0xpc3QuYWRkKCdvcGVuJyk7CiAgICAgICAgICAKICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsKICAgICAgICAgICAgc2V0U3RhdHVzKCdUYWtlIHlvdXIgdGltZS4gRXZlcnkgd29yZCB3YXMgd3JpdHRlbiBmb3IgeW91IFx1RDgzRFx1REM5QicpOwogICAgICAgICAgICBzZXRDb250cm9scyh0cnVlLCBmYWxzZSk7CiAgICAgICAgICAgIGlzQW5pbWF0aW5nID0gZmFsc2U7CiAgICAgICAgICAgIHN0YXRlID0gJ2NhcmRfb3Blbic7CiAgICAgICAgICB9LCAxMDAwKTsKICAgICAgICAgIAogICAgICAgIH0sIDEyMDApOwogICAgICB9LCA4MDApOwogICAgfSwgMTAwMCk7CiAgfQp9CgpmdW5jdGlvbiBzcGF3bkFsYnVtU3RhcnMoKXsKICBsZXQgYWxiUG9zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsYlBvcycpOwogIGZvcihsZXQgaT0wOyBpPDg7IGkrKyl7CiAgICAoZnVuY3Rpb24oaWR4KXsKICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpewogICAgICAgIGxldCBzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7CiAgICAgICAgcy5pbm5lckhUTUwgPSAn4pyoJzsKICAgICAgICBzLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJzsKICAgICAgICBzLnN0eWxlLmxlZnQgPSAnNTAlJzsKICAgICAgICBzLnN0eWxlLnRvcCA9ICc1MCUnOwogICAgICAgIHMuc3R5bGUuZm9udFNpemUgPSAoMTIgKyBNYXRoLnJhbmRvbSgpKjE2KSArICdweCc7CiAgICAgICAgcy5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnOwogICAgICAgIHMuc3R5bGUuekluZGV4ID0gNjA7CiAgICAgICAgcy5zdHlsZS50cmFuc2l0aW9uID0gJ2FsbCAxLjVzIGN1YmljLWJlemllcigwLjIsIDAuOCwgMC4yLCAxKSc7CiAgICAgICAgcy5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKC01MCUsIC01MCUpIHNjYWxlKDAuMiknOwogICAgICAgIHMuc3R5bGUub3BhY2l0eSA9ICcxJzsKICAgICAgICBzLnN0eWxlLmZpbHRlciA9ICdkcm9wLXNoYWRvdygwIDAgOHB4ICNGRkYpJzsKICAgICAgICBhbGJQb3MuYXBwZW5kQ2hpbGQocyk7CiAgICAgICAgCiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpewogICAgICAgICAgbGV0IHR4ID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogNDAwOwogICAgICAgICAgbGV0IHR5ID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogNDAwOwogICAgICAgICAgcy5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKGNhbGMoLTUwJSArICcgKyB0eCArICdweCksIGNhbGMoLTUwJSArICcgKyB0eSArICdweCkpIHNjYWxlKDEuNSkgcm90YXRlKCcgKyAoTWF0aC5yYW5kb20oKSoxODApICsgJ2RlZyknOwogICAgICAgICAgcy5zdHlsZS5vcGFjaXR5ID0gJzAnOwogICAgICAgIH0sIDUwKTsKICAgICAgICAKICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IHMucmVtb3ZlKCk7IH0sIDE1MDApOwogICAgICB9LCBpZHggKiA4MCk7CiAgICB9KShpKTsKICB9Cn0KCmZ1bmN0aW9uIGhhbmRsZUFsYnVtKCl7CiAgaWYoaXNBbmltYXRpbmcpIHJldHVybjsKICAKICBpZihzdGF0ZSA9PT0gJ2Rlc2snKXsKICAgIGlzQW5pbWF0aW5nID0gdHJ1ZTsKICAgIHN0YXRlID0gJ2FsYnVtX3BpY2tlZCc7CiAgICBjdXJyZW50QWxidW1QYWdlID0gMDsKICAgIGlmKExFVFRFUi5waG90b3MgJiYgTEVUVEVSLnBob3Rvcy5sZW5ndGggPiAwKSBzZXRTdGF0dXMoJ0FMQlVNIE9QRU4hIENMSUNLIFBSRVYvTkVYVCcpOyBlbHNlIHNldFN0YXR1cygnQUxCVU0gSVMgRU1QVFknKTsKICAgIAogICAgbGV0IGFsYlBvcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbGJQb3MnKTsKICAgIGxldCBhbGJJbm5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbGJJbm5lcicpOwogICAgbGV0IGVudlBvcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlbnZQb3MnKTsKICAgIAogICAgYWxiSW5uZXIuY2xhc3NMaXN0LnJlbW92ZSgnaWRsZS1mbG9hdC1hbHQnKTsKICAgIGFsYlBvcy5jbGFzc0xpc3QuYWRkKCdwaWNrZWQtdXAnKTsKICAgIGVudlBvcy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsKICAgIAogICAgc2V0VGltZW91dChmdW5jdGlvbigpewogICAgICBhbGJQb3MuY2xhc3NMaXN0LmFkZCgnb3BlbmVkJyk7CiAgICAgIHNwYXduQWxidW1TdGFycygpOwogICAgICBzZXRDb250cm9scyh0cnVlLCB0b3RhbEFsYnVtUGFnZXMgPiAwKTsKICAgICAgdXBkYXRlTmF2QnRucygpOwogICAgICBpc0FuaW1hdGluZyA9IGZhbHNlOwogICAgfSwgMTAwMCk7CiAgfQp9CgpmdW5jdGlvbiB0dXJuUGFnZShkaXIpewogIGlmKGlzQW5pbWF0aW5nKSByZXR1cm47CiAgCiAgaWYgKHN0YXRlID09PSAnYWxidW1fcGlja2VkJykgewogICAgICBsZXQgbmV4dElkeCA9IGN1cnJlbnRBbGJ1bVBhZ2UgKyBkaXI7CiAgICAgIGlmKG5leHRJZHggPj0gMCAmJiBuZXh0SWR4IDw9IHRvdGFsQWxidW1QYWdlcyl7CiAgICAgICAgaXNBbmltYXRpbmcgPSB0cnVlOwogICAgICAgIAogICAgICAgIGlmKGRpciA+IDAgJiYgY3VycmVudEFsYnVtUGFnZSA8IHRvdGFsQWxidW1QYWdlcyl7CiAgICAgICAgICBsZXQgcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbGJ1bVBhZ2VfJyArIGN1cnJlbnRBbGJ1bVBhZ2UpOwogICAgICAgICAgaWYocCkgcC5jbGFzc0xpc3QuYWRkKCdmbGlwcGVkJyk7CiAgICAgICAgICBjdXJyZW50QWxidW1QYWdlKys7CiAgICAgICAgfSBlbHNlIGlmKGRpciA8IDAgJiYgY3VycmVudEFsYnVtUGFnZSA+IDApewogICAgICAgICAgY3VycmVudEFsYnVtUGFnZS0tOwogICAgICAgICAgbGV0IHAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWxidW1QYWdlXycgKyBjdXJyZW50QWxidW1QYWdlKTsKICAgICAgICAgIGlmKHApIHAuY2xhc3NMaXN0LnJlbW92ZSgnZmxpcHBlZCcpOwogICAgICAgIH0KICAgICAgICAKICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGlzQW5pbWF0aW5nID0gZmFsc2U7IH0sIDgwMCk7CiAgICAgICAgCiAgICAgICAgaWYoY3VycmVudEFsYnVtUGFnZSA+PSB0b3RhbEFsYnVtUGFnZXMpIHNldFN0YXR1cygnRU5EIE9GIEFMQlVNLiBUQVAgQ0xPU0UuJyk7CiAgICAgICAgZWxzZSBpZihMRVRURVIucGhvdG9zICYmIExFVFRFUi5waG90b3MubGVuZ3RoID4gMCkgc2V0U3RhdHVzKCdQSE9UTyAjJyArIChjdXJyZW50QWxidW1QYWdlICsgMSkgKyAnIE9GICcgKyB0b3RhbEFsYnVtUGFnZXMpOwogICAgICAgIGVsc2Ugc2V0U3RhdHVzKCdBTEJVTSBJUyBFTVBUWScpOwogICAgICAgIHVwZGF0ZU5hdkJ0bnMoKTsKICAgICAgfQogIH0gZWxzZSBpZiAoc3RhdGUgPT09ICdjYXJkX29wZW4nKSB7CiAgICAgIGxldCBuZXh0SWR4ID0gY3VycmVudExldHRlclBhZ2UgKyBkaXI7CiAgICAgIGlmKG5leHRJZHggPj0gMCAmJiBuZXh0SWR4IDw9IHRvdGFsTGV0dGVyUGFnZXMpewogICAgICAgIGlzQW5pbWF0aW5nID0gdHJ1ZTsKICAgICAgICAKICAgICAgICBpZihkaXIgPiAwICYmIGN1cnJlbnRMZXR0ZXJQYWdlIDwgdG90YWxMZXR0ZXJQYWdlcyl7CiAgICAgICAgICBsZXQgcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZXR0ZXJQYWdlXycgKyBjdXJyZW50TGV0dGVyUGFnZSk7CiAgICAgICAgICBpZihwKSBwLmNsYXNzTGlzdC5hZGQoJ2ZsaXBwZWQnKTsKICAgICAgICAgIGN1cnJlbnRMZXR0ZXJQYWdlKys7CiAgICAgICAgfSBlbHNlIGlmKGRpciA8IDAgJiYgY3VycmVudExldHRlclBhZ2UgPiAwKXsKICAgICAgICAgIGN1cnJlbnRMZXR0ZXJQYWdlLS07CiAgICAgICAgICBsZXQgcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZXR0ZXJQYWdlXycgKyBjdXJyZW50TGV0dGVyUGFnZSk7CiAgICAgICAgICBpZihwKSBwLmNsYXNzTGlzdC5yZW1vdmUoJ2ZsaXBwZWQnKTsKICAgICAgICB9CiAgICAgICAgCiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpeyBpc0FuaW1hdGluZyA9IGZhbHNlOyB9LCA4MDApOwogICAgICAgIAogICAgICAgIGlmKGN1cnJlbnRMZXR0ZXJQYWdlID49IHRvdGFsTGV0dGVyUGFnZXMpIHsgc2V0U3RhdHVzKCdUaGF0IHdhcyB0aGUgd2hvbGUgbGV0dGVyLiBUYXAgY2xvc2Ugd2hlbiB5b3VcdTIwMTlyZSByZWFkeSBcdUQ4M0RcdURDOUInKTsgc2hvd0VuZE1vbWVudCgpOyB9CiAgICAgICAgZWxzZSBzZXRTdGF0dXMoJ1JFQURJTkcgUEFHRSAnICsgKGN1cnJlbnRMZXR0ZXJQYWdlICsgMSkpOwogICAgICAgIHVwZGF0ZU5hdkJ0bnMoKTsKICAgICAgfQogIH0KfQoKZnVuY3Rpb24gY2xvc2VBY3RpdmUoKXsKICBpZihpc0FuaW1hdGluZykgcmV0dXJuOwogIGhpZGVFbmRNb21lbnQoKTsKICAKICBpZihzdGF0ZSA9PT0gJ2NhcmRfb3BlbicpewogICAgaXNBbmltYXRpbmcgPSB0cnVlOwogICAgc2V0U3RhdHVzKCdDTE9TSU5HIExFVFRFUi4uLicpOwogICAgc2V0Q29udHJvbHMoZmFsc2UsIGZhbHNlKTsKICAgIAogICAgdmFyIGxldHRlckJvb2sgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGV0dGVyQm9va1ZpZXcnKTsKICAgIGxldCBlbnZQb3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZW52UG9zJyk7CiAgICBsZXQgYWxiUG9zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsYlBvcycpOwogICAgbGV0IGVudklubmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VudklubmVyJyk7CiAgICAKICAgIGZvcihsZXQgaT0wOyBpPHRvdGFsTGV0dGVyUGFnZXM7IGkrKyl7CiAgICAgIGxldCBwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xldHRlclBhZ2VfJyArIGkpOwogICAgICBpZihwKSBwLmNsYXNzTGlzdC5yZW1vdmUoJ2ZsaXBwZWQnKTsKICAgIH0KICAgIAogICAgc2V0VGltZW91dChmdW5jdGlvbigpewogICAgICBsZXR0ZXJCb29rLmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nKTsKICAgICAgZW52UG9zLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpOwogICAgICAKICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpewogICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXJkTWluaScpLnN0eWxlLm9wYWNpdHkgPSAnMSc7CiAgICAgICAgZW52UG9zLmNsYXNzTGlzdC5yZW1vdmUoJ2RyYXduLW91dCcpOwogICAgICAgIAogICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsKICAgICAgICAgIGVudlBvcy5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuZWQnKTsKICAgICAgICAgIAogICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpewogICAgICAgICAgICBlbnZQb3MuY2xhc3NMaXN0LnJlbW92ZSgncGlja2VkLXVwJyk7CiAgICAgICAgICAgIGFsYlBvcy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTsKICAgICAgICAgICAgCiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsKICAgICAgICAgICAgICBlbnZJbm5lci5jbGFzc0xpc3QuYWRkKCdpZGxlLWZsb2F0Jyk7CiAgICAgICAgICAgICAgc3RhdGUgPSAnZGVzayc7CiAgICAgICAgICAgICAgaXNBbmltYXRpbmcgPSBmYWxzZTsKICAgICAgICAgICAgICBzZXRTdGF0dXMoJ1RBUCBFTlZFTE9QRSBPUiBBTEJVTSBUTyBFWFBMT1JFJyk7CiAgICAgICAgICAgIH0sIDgwMCk7CiAgICAgICAgICB9LCA4MDApOwogICAgICAgIH0sIDgwMCk7CiAgICAgIH0sIDEwMDApOwogICAgfSwgODAwKTsKICB9IAogIGVsc2UgaWYgKHN0YXRlID09PSAnYWxidW1fcGlja2VkJykgewogICAgaXNBbmltYXRpbmcgPSB0cnVlOwogICAgc2V0U3RhdHVzKCdDTE9TSU5HIEFMQlVNLi4uJyk7CiAgICBzZXRDb250cm9scyhmYWxzZSwgZmFsc2UpOwogICAgCiAgICBsZXQgYWxiUG9zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsYlBvcycpOwogICAgbGV0IGFsYklubmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsYklubmVyJyk7CiAgICBsZXQgZW52UG9zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VudlBvcycpOwogICAgCiAgICBmb3IobGV0IGk9MDsgaTx0b3RhbEFsYnVtUGFnZXM7IGkrKyl7CiAgICAgIGxldCBwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsYnVtUGFnZV8nICsgaSk7CiAgICAgIGlmKHApIHAuY2xhc3NMaXN0LnJlbW92ZSgnZmxpcHBlZCcpOwogICAgfQogICAgCiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7CiAgICAgIGFsYlBvcy5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuZWQnKTsKICAgICAgCiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsKICAgICAgICBhbGJQb3MuY2xhc3NMaXN0LnJlbW92ZSgncGlja2VkLXVwJyk7CiAgICAgICAgZW52UG9zLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpOwogICAgICAgIAogICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsKICAgICAgICAgIGFsYklubmVyLmNsYXNzTGlzdC5hZGQoJ2lkbGUtZmxvYXQtYWx0Jyk7CiAgICAgICAgICBzdGF0ZSA9ICdkZXNrJzsKICAgICAgICAgIGlzQW5pbWF0aW5nID0gZmFsc2U7CiAgICAgICAgICBzZXRTdGF0dXMoJ1RBUCBFTlZFTE9QRSBPUiBBTEJVTSBUTyBFWFBMT1JFJyk7CiAgICAgICAgfSwgODAwKTsKICAgICAgfSwgODAwKTsKICAgIH0sIDgwMCk7CiAgfQp9Cgpkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkgewogIGlmIChzdGF0ZSA9PT0gJ2NhcmRfb3BlbicgfHwgc3RhdGUgPT09ICdhbGJ1bV9vcGVuJykgewogICAgaWYgKGUua2V5ID09PSAnQXJyb3dSaWdodCcpIHR1cm5QYWdlKDEpOwogICAgZWxzZSBpZiAoZS5rZXkgPT09ICdBcnJvd0xlZnQnKSB0dXJuUGFnZSgtMSk7CiAgICBlbHNlIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIGNsb3NlQWN0aXZlKCk7CiAgfQp9KTsKCi8vIFN3aXBlIC8gU2Nyb2xsIHRvIFR1cm4gUGFnZXMKbGV0IHN3aXBlU3RhcnRYID0gMDsKZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGUgPT4geyBzd2lwZVN0YXJ0WCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uc2NyZWVuWDsgfSk7CmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZSA9PiB7CiAgaWYgKHN0YXRlICE9PSAnY2FyZF9vcGVuJyAmJiBzdGF0ZSAhPT0gJ2FsYnVtX3BpY2tlZCcpIHJldHVybjsKICBsZXQgc3dpcGVFbmRYID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5zY3JlZW5YOwogIGlmIChzd2lwZVN0YXJ0WCAtIHN3aXBlRW5kWCA+IDUwKSB0dXJuUGFnZSgxKTsKICBlbHNlIGlmIChzd2lwZUVuZFggLSBzd2lwZVN0YXJ0WCA+IDUwKSB0dXJuUGFnZSgtMSk7Cn0pOwoKbGV0IHdoZWVsVGltZW91dDsKZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBlID0+IHsKICBpZiAoc3RhdGUgIT09ICdjYXJkX29wZW4nICYmIHN0YXRlICE9PSAnYWxidW1fcGlja2VkJykgcmV0dXJuOwogIGlmICh3aGVlbFRpbWVvdXQgfHwgaXNBbmltYXRpbmcpIHJldHVybjsKICAKICBsZXQgZGVsdGEgPSBNYXRoLmFicyhlLmRlbHRhWCkgPiBNYXRoLmFicyhlLmRlbHRhWSkgPyBlLmRlbHRhWCA6IGUuZGVsdGFZOwogIGlmIChkZWx0YSA+IDQwKSB7CiAgICB0dXJuUGFnZSgxKTsKICAgIHdoZWVsVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4gd2hlZWxUaW1lb3V0ID0gbnVsbCwgODAwKTsKICB9IGVsc2UgaWYgKGRlbHRhIDwgLTQwKSB7CiAgICB0dXJuUGFnZSgtMSk7CiAgICB3aGVlbFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHdoZWVsVGltZW91dCA9IG51bGwsIDgwMCk7CiAgfQp9KTsKPC9zY3JpcHQ+CjwvYm9keT4KPC9odG1sPg==')));
        var dataStr = JSON.stringify(letterData)
          .replace(/</g, '\\u003c')
          .replace(/>/g, '\\u003e')
          .replace(/&/g, '\\u0026');
        var html = template.replace(
          'var __EMBEDDED__ = null;',
          'var __EMBEDDED__ = ' + dataStr + ';'
        );
        var fontLink = '<link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet">';
        html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=[^"]*" rel="stylesheet">/, fontLink);
        html = html.replace('</body>', '<script>' + effectsScript.replace(/<\/script/gi, '<\\/script') + '</script></body>');
        return html;
      });
    }

    // Wired up to the "EXPORT AS HTML FILE" button — was previously missing entirely
    function exportLetter() {
      var body = document.getElementById('lt-body').value.trim();
      if (!body) {
        toast('Your page is still blank. Add a few words first 💛', 'err');
        document.getElementById('lt-body').focus();
        pipSay("Even one kind sentence is plenty. I'll wait!");
        return;
      }
      var btn = document.getElementById('exportbtn');
      var lbl = document.getElementById('exportlbl');
      var prevLbl = lbl.innerHTML;
      btn.disabled = true;
      lbl.textContent = 'Folding your letter…';

      var letterData = gatherLetterData();
      generateStandaloneHTML(letterData).then(function (html) {
        var blob = new Blob([html], { type: 'text/html' });
        var url = URL.createObjectURL(blob);
        var safeTo = (letterData.to || 'letter').replace(/^Dear\s+/i, '').replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '').toLowerCase() || 'letter';
        var a = document.createElement('a');
        a.href = url;
        a.download = 'letter-for-' + safeTo + '.html';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        saveLetterLocally();
        openSeal();
      }).catch(function (err) {
        console.error(err);
        toast("That didn't work, but your letter is safe. Please try again 💛", 'err');
      }).finally(function () {
        btn.disabled = false;
        lbl.innerHTML = prevLbl; hydrateSprites(lbl);
      });
    }

    // ─── SEALING RITUAL ─────────────────────────────────────────
    let sealReturn = null;
    function openSeal() {
      const ov = document.getElementById('sealOv');
      const wax = document.getElementById('ssWax');
      wax.style.setProperty('--wax', S.wax);
      wax.innerHTML = pxSprite(S.stamp, 3);
      sealReturn = document.activeElement;
      ov.hidden = false;
      // restart the CSS animation each time the overlay opens
      ov.querySelectorAll('.ss *').forEach(n => { n.style.animation = 'none'; void n.offsetWidth; n.style.animation = ''; });
      ov.querySelector('.btn-pri').focus();
      sfx('stamp');
      setTimeout(() => { if (!ov.hidden) { burstAt(innerWidth / 2, innerHeight * 0.4, 26); sfx('chime'); } }, 1900);
    }
    function closeSeal() {
      document.getElementById('sealOv').hidden = true;
      if (sealReturn && sealReturn.focus) sealReturn.focus();
    }
    function peekFromSeal() { closeSeal(); previewLetter(); }
    function newFromSeal() { closeSeal(); clearLetter(true); }

    // ============================================================
    // PIXEL POLISH v2 — sprites, village scene, dividers, menu, particles
    // ============================================================
    Object.assign(PX_PAL, { g: '#6BAE7B', G: '#9CC5A1', n: '#3B2A4A', u: '#F6E3C3', W: '#A8D4FF', a: '#F2A93B', e: '#E8706A' });
    Object.assign(PX, {"pencil": [".........kkk", "........kppk", ".......kPPkk", "......kykkk.", ".....kyyYk..", "....kyyYk...", "...kyyYk....", "..kkyYk.....", ".kooYk......", ".kkkk......."], "envelope": ["kkkkkkkkkkkk", "kkkcccccckkk", "kwkkcccckkwk", "kwwkkccckwwk", "kwwwkrrkwwwk", "kwwwwrRwwwwk", "kwwwwwwwwwwk", "kkkkkkkkkkkk"], "mailbox": ["..kkkkkkkk..", ".kRRRRRRRRk.", "kRRRRRRRRRRk", "kRRRkkkkRRRk", "kRRRRRRRRRRk", "kRRRRRRRRRRk", "kkkkkkkkkkkk", "....kbbk....", "....kbbk....", "....kbbk....", "..kkkbbkkk.."], "paper": ["kkkkkkkk..", "kccccccckk", "kcPPPcccck", "kcccccccck", "kckkkkkkck", "kcccccccck", "kckkkkkkck", "kcccccccck", "kckkkkccck", "kcccccccck", "kcccccccck", "kkkkkkkkkk"], "floppy": ["kkkkkkkkkk.", "kSSSSSSSSkk", "kSwwwwwwSSk", "kSwwwwwwSSk", "kSSSSSSSSSk", "kSSkkkkkSSk", "kSkSSSSSkSk", "kSkSSSSSkSk", "kSkSSSSSkSk", "kkkkkkkkkkk"], "sun": [".....kk.....", ".k...yy...k.", "..k.kkkk.k..", "...kyyyyk...", "k.kywyyyYk.k", "kykyyyyyYkyk", "k.kyyyyYYk.k", "...kYYYYYk..", "..k.kkkk.k..", ".k...yy...k.", ".....kk....."], "speaker": [".....k......", "....kk...k..", "kkkkkk....k.", "kwwwkk.k..k.", "kwwwkk..k.k.", "kwwwkk..k.k.", "kwwwkk.k..k.", "kkkkkk....k.", "....kk...k..", ".....k......"], "mute": [".....k......", "....kk......", "kkkkkk..k.k.", "kwwwkk...k..", "kwwwkk..k.k.", "kwwwkk......", "kwwwkk..k.k.", "kkkkkk...k..", "....kk..k.k.", ".....k......"], "cat": [".kk..kk.......", "kOOkkOOk......", "kOOOOOOkkkkkk.", "kOkOOkOOOOOOOk", "kOOOPOOOOOOOOk", "kOOOOOOOOOOOOk", "kOOOOOOOOOOOOk", ".kkkkkkkkkkkkk"], "cottage": ["..........kk....", ".....kk...kck...", "....kRRk..kck...", "...kRRRRkkkck...", "..kRRRRRRRRRk...", ".kRRRRRRRRRRRk..", "kRRRRRRRRRRRRRk.", "kkkkkkkkkkkkkkk.", ".kuuuuuuuuuuuk..", ".kukkkkuuuuuuk..", ".kukWWkuubbbbk..", ".kukWWkuubbbbk..", ".kukkkkuubbbbk..", ".kuuuuuuubbkbk..", ".kuuuuuuubbbbk..", ".kkkkkkkkkkkkk.."], "tree": ["...kkkk...", "..kggggk..", ".kgGgggGk.", "kgggggggGk", "kgGgggggGk", "kggggGgggk", ".kgggggGk.", "..kkkkkk..", "....kbk...", "....kbk...", "....kbk..."], "carrier": ["...kkkk...", "..kRRRRk..", ".kRRRRRRk.", ".kkkkkkkk.", "..kooook..", "..kokkok..", "..kooook..", ".kSSSSSSk.", "kSSSSSSSbk", "kSSSSSSSbk", ".kLLkkLLk.", ".kLLk.kLLk", ".kkk...kkk"], "bird": [".kk...kk.", "kssk.kssk", ".kssksskk", "..kkkkk.."], "lantern": ["...kk...", "..kkkk..", ".kyyyyk.", "kyywwyYk", "kyywwyYk", "kyyyyyYk", ".kkkkkk.", "...kk..."], "flowerS": [".kkk.", "kpyPk", ".kkk.", "..k..", ".gk..", "..kg."]});
    const MINI = {"mheart": [".pp.pp.", "ppppppp", "ppppppp", ".ppppp.", "..ppp..", "...p..."], "mstar": ["...y...", "...y...", "yyyyyyy", "..yyy..", ".yy.yy.", ".y...y."], "msq": ["yy", "yy"]};

    // pxSprite v2: optional palette remap, and window pixels ("W") that can light up via CSS
    function pxSprite(name, px, cls, remap) {
      const rows = PX[name]; if (!rows) return '';
      const w = Math.max.apply(null, rows.map(r => r.length)), h = rows.length;
      let rects = '';
      rows.forEach((row, y) => {
        let x = 0;
        while (x < row.length) {
          const ch = row[x];
          if (ch === '.') { x++; continue; }
          let e = x; while (e < row.length && row[e] === ch) e++;
          const key = (remap && remap[ch]) || ch;
          const win = ch === 'W' ? ' class="win"' : '';
          rects += '<rect' + win + ' x="' + x + '" y="' + y + '" width="' + (e - x) + '" height="1" fill="' + (PX_PAL[key] || '#000') + '"/>';
          x = e;
        }
      });
      return '<svg class="px-sprite ' + (cls || '') + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + (w * (px || 3)) + '" height="' + (h * (px || 3)) + '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + rects + '</svg>';
    }
    function hydrateSprites(root) {
      (root || document).querySelectorAll('[data-sprite]').forEach(el => {
        if (el.dataset.done) return; el.dataset.done = '1';
        let remap = null;
        if (el.dataset.remap) { remap = {}; el.dataset.remap.split(',').forEach(p => { const kv = p.split(':'); remap[kv[0]] = kv[1]; }); }
        el.innerHTML = pxSprite(el.dataset.sprite, parseInt(el.dataset.px, 10) || 3, el.dataset.cls || '', remap);
      });
    }
    function spriteHTML(name, px, remap) { return pxSprite(name, px, '', remap); }
    function miniSVG(kind, px, color) {
      const rows = MINI[kind]; let r = '';
      rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] !== '.') r += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + color + '"/>'; });
      return '<svg xmlns="http://www.w3.org/2000/svg" width="' + rows[0].length * px + '" height="' + rows.length * px + '" viewBox="0 0 ' + rows[0].length + ' ' + rows.length + '" shape-rendering="crispEdges" aria-hidden="true">' + r + '</svg>';
    }

    // pixel particles: hearts, stars and squares drawn on the grid (no smooth circles, no glyphs)
    function burstAt(x, y, n) {
      if (REDUCED) return;
      const cols = ['#FFB8D0', '#FF8FB5', '#C8A8FF', '#8FDDC8', '#FFE066', '#A8D4FF'], kinds = ['mheart', 'mstar', 'msq'];
      const snap = v => Math.round(v / 4) * 4;
      for (let i = 0; i < (n || 14); i++) {
        const el = document.createElement('span'), a = Math.random() * Math.PI * 2, d = 56 + Math.random() * 110, kind = kinds[i % 3];
        el.className = 'bit'; el.innerHTML = miniSVG(kind, kind === 'msq' ? 4 : 3, cols[i % cols.length]);
        el.style.cssText = 'left:' + snap(x) + 'px;top:' + snap(y) + 'px;--dx:' + snap(Math.cos(a) * d) + 'px;--dy:' + snap(Math.sin(a) * d - 32) + 'px;--t:' + (0.8 + Math.random() * .6).toFixed(2) + 's;';
        document.body.appendChild(el); el.addEventListener('animationend', () => el.remove());
      }
    }
    // sound + theme toggles use pixel icons
    function setupTools() {
      const sb = document.getElementById('soundBtn'), tb = document.getElementById('themeBtn');
      const paintSound = () => {
        const on = localStorage.getItem('ppx-sound') === '1';
        sb.innerHTML = pxSprite(on ? 'speaker' : 'mute', 2); sb.setAttribute('aria-pressed', on);
        sb.setAttribute('aria-label', 'Sound effects: ' + (on ? 'on' : 'off')); sb.title = 'Sound effects (' + (on ? 'on' : 'off') + ')';
      };
      const paintTheme = () => {
        const dark = document.documentElement.dataset.theme === 'night';
        tb.innerHTML = pxSprite(dark ? 'sun' : 'moon', 2); tb.setAttribute('aria-pressed', dark);
        tb.setAttribute('aria-label', dark ? 'Switch to daytime theme' : 'Switch to starry night theme'); tb.title = dark ? 'Daytime' : 'Starry night';
      };
      try { if (localStorage.getItem('ppx-theme') === 'night') document.documentElement.dataset.theme = 'night'; } catch (e) { }
      paintSound(); paintTheme();
      sb.addEventListener('click', () => { localStorage.setItem('ppx-sound', localStorage.getItem('ppx-sound') === '1' ? '0' : '1'); paintSound(); sfx('pop'); });
      tb.addEventListener('click', () => {
        const dark = document.documentElement.dataset.theme === 'night';
        if (dark) delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = 'night';
        localStorage.setItem('ppx-theme', dark ? 'day' : 'night'); paintTheme();
      });
    }

    // ---- tiles + scenic dividers ----
    function tileURL(rows, px) {
      const w = rows[0].length, h = rows.length; let r = '';
      rows.forEach((row, y) => { let x = 0; while (x < row.length) { const ch = row[x]; if (ch === '.') { x++; continue; } let e = x; while (e < row.length && row[e] === ch) e++; r += '<rect x="' + x * px + '" y="' + y * px + '" width="' + (e - x) * px + '" height="' + px + '" fill="' + (PX_PAL[ch] || '#000') + '"/>'; x = e; } });
      return 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + w * px + '" height="' + h * px + '" shape-rendering="crispEdges">' + r + '</svg>') + '")';
    }
    function grid(w, h, fn) { const g = Array.from({ length: h }, () => Array(w).fill('.')); fn(g); return g.map(r => r.join('')); }
    const TILES = {
      flowers: grid(44, 10, g => {
        for (let x = 0; x < 44; x++) { g[9][x] = 'g'; if (x % 3 === 0) g[8][x] = 'g'; if (x % 5 === 1) g[8][x] = 'G'; }
        [[5, 'p', 3], [14, 'y', 4], [23, 'l', 3], [31, 'P', 4], [39, 's', 3]].forEach(a => {
          const x = a[0], c = a[1], t = a[2];
          g[t][x] = c; g[t + 1][x - 1] = c; g[t + 1][x + 1] = c; g[t + 1][x] = 'y'; g[t + 2][x] = c;
          for (let y = t + 3; y < 9; y++) g[y][x] = 'g'; g[7][x + 1] = 'g'; g[6][x - 1] = 'g';
        });
      }),
      fence: grid(20, 12, g => {
        for (let y = 0; y < 12; y++) { for (let x = 0; x < 6; x++) g[y][x] = (x === 0 || x === 5 || y === 11) ? 'k' : 'o'; }
        g[0][0] = '.'; g[0][5] = '.'; g[0][1] = 'k'; g[0][4] = 'k'; g[0][2] = 'k'; g[0][3] = 'k';
        for (let x = 6; x < 20; x++) { g[3][x] = 'k'; g[4][x] = 'o'; g[5][x] = 'o'; g[6][x] = 'k'; g[7][x] = 'k'; g[8][x] = 'o'; g[9][x] = 'o'; g[10][x] = 'k'; }
      }),
      clothes: grid(44, 14, g => {
        for (let x = 0; x < 44; x++) g[0][x] = 'k';
        const env = (x, c) => { for (let yy = 1; yy < 8; yy++) for (let xx = 0; xx < 9; xx++) { const edge = xx === 0 || xx === 8 || yy === 7; g[yy][x + xx] = edge ? 'k' : c; } g[2][x + 3] = 'k'; g[2][x + 5] = 'k'; g[3][x + 4] = 'k'; g[1][x + 2] = 'y'; g[1][x + 6] = 'y'; g[5][x + 4] = 'r'; };
        env(4, 'p'); env(24, 's');
      })
    };
    function buildDividers() {
      const cfg = { clothes: [56, 'clothes'], flowers: [40, 'flowers'], fence: [48, 'fence'] };
      document.querySelectorAll('.px-div[data-div]').forEach(d => {
        const c = cfg[d.dataset.div]; if (!c) return;
        d.style.setProperty('--dh', c[0] + 'px'); d.style.setProperty('background-image', tileURL(TILES[c[1]], 4), 'important');
        if (d.dataset.walker) { const w = document.createElement('div'); w.className = 'walker'; w.innerHTML = '<span>' + spriteHTML('carrier', 4) + '</span>'; w.style.animationDelay = (d.dataset.walker | 0) + 's'; d.appendChild(w); }
      });
      const ft = document.getElementById('fenceTop'); if (ft) ft.style.setProperty('background-image', tileURL(TILES.fence, 4), 'important');
      const dith = (n) => { const r = Array.from({ length: 2 }, () => Array(2).fill('.')); [[0, 0], [1, 1], [1, 0]].slice(0, n).forEach(p => r[p[1]][p[0]] = 'n'); return tileURL(r.map(x => x.join('')), 4); };
      const cd = document.getElementById('ctaDither'); if (cd) cd.style.setProperty('background-image', [dith(1), dith(2), dith(3)].join(','), 'important');
    }

    // ---- village (hero + evening) ----
    function hillsSVG(cls, H, base, amp, f1, f2, ph, cell) {
      const W = 3200, cols = W / cell; let r = '';
      for (let i = 0; i < cols; i++) {
        const v = Math.sin(i * f1 + ph) * .6 + Math.sin(i * f2 + ph * 1.7) * .4;
        const h = Math.max(cell, Math.round((base + amp * v) / cell) * cell);
        r += '<rect x="' + i * cell + '" y="' + (H - h) + '" width="' + cell + '" height="' + h + '"/>';
        if (i % 2 === 0) r += '<rect class="dth" x="' + i * cell + '" y="' + (H - h - cell) + '" width="' + cell + '" height="' + cell + '"/>';
      }
      return '<svg class="hills ' + cls + '" xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" shape-rendering="crispEdges" aria-hidden="true"><g>' + r + '</g></svg>';
    }
    function pathSVG(H) {
      const W = 3200, cell = 8, cols = W / cell; let r = '';
      for (let i = 0; i < cols; i++) { const k = Math.round(Math.sin(i * .07) * 2) * 8; r += '<rect x="' + i * cell + '" y="' + (H - 40 - k) + '" width="' + cell + '" height="16"/>'; }
      return '<svg class="hills fill-path" xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" shape-rendering="crispEdges" aria-hidden="true"><g>' + r + '</g></svg>';
    }
    function buildVillage(el, o) {
      o = o || {};
      const cots = o.cots, remap = o.remap;
      let h = '';
      h += '<div class="vl vl-far" data-lag=".30">' + hillsSVG('fill-h1', 200, 120, 56, .035, .09, 1.2, 8) + '</div>';
      h += '<div class="vl vl-mid" data-lag=".20">' + hillsSVG('fill-h2', 150, 88, 32, .05, .13, 3.1, 8);
      o.trees.forEach(t => { h += '<span class="tr' + (t.sm ? ' hide-sm' : '') + '" style="left:' + t.l + ';animation-delay:' + (t.d || 0) + 's">' + spriteHTML('tree', 8) + '</span>'; });
      h += '</div>';
      h += '<div class="vl vl-town" data-lag=".12">';
      cots.forEach((c, i) => {
        h += '<div class="cot' + (c.sm ? ' hide-sm' : '') + '" style="left:' + c.l + '">' + spriteHTML('cottage', 8, c.remap) +
          '<i class="smk" style="left:84px;animation-delay:' + (-i * 1.1) + 's"></i><i class="smk" style="left:84px;animation-delay:' + (-i * 1.1 - 2) + 's"></i>' +
          (c.cat ? '<span class="cat">' + spriteHTML('cat', 4) + '</span>' : '') + '</div>';
      });
      h += '</div>';
      h += '<div class="vl vl-near" data-lag=".05">' + hillsSVG('fill-h3', 96, 56, 14, .06, .17, 5.3, 8) + pathSVG(96);
      h += '<span class="mb" style="left:' + o.mb + '">' + spriteHTML('mailbox', 4) + '</span>';
      for (let i = 0; i < 9; i++) h += '<span class="gfl" style="left:' + (5 + i * 11 + (i % 3) * 2) + '%;bottom:' + (6 + (i * 7) % 18) + 'px">' + spriteHTML('flowerS', 4) + '</span>';
      h += '</div>';
      if (o.carrier) h += '<div class="carrier"><span>' + spriteHTML('carrier', 4) + '</span></div>';
      if (o.birds) h += '<div class="bird"><span>' + spriteHTML('bird', 4) + '</span></div><div class="bird" style="top:44px;animation-delay:-14s"><span>' + spriteHTML('bird', 4) + '</span></div>';
      el.innerHTML = h;
    }
    function setupVillages() {
      const hv = document.getElementById('heroVillage');
      if (hv) buildVillage(hv, {
        carrier: true, birds: true, mb: '47%',
        trees: [{ l: '14%' }, { l: '38%', d: -2, sm: true }, { l: '70%', d: -1 }, { l: '92%', d: -3, sm: true }],
        cots: [{ l: '4%', remap: { R: 'L' } }, { l: '21%', cat: true, sm: true }, { l: '58%', remap: { R: 'M' }, sm: true }, { l: '73%', remap: { R: 'a' } }]
      });
      const cv = document.getElementById('ctaVillage');
      if (cv) buildVillage(cv, {
        mb: '52%',
        trees: [{ l: '10%' }, { l: '34%', d: -2, sm: true }, { l: '76%', d: -1 }, { l: '94%', d: -3, sm: true }],
        cots: [{ l: '6%', remap: { u: 'b', R: 'L', b: 'n' } }, { l: '25%', remap: { u: 'b', R: 'R', b: 'n' }, sm: true }, { l: '66%', remap: { u: 'b', R: 'M', b: 'n' }, sm: true }, { l: '82%', remap: { u: 'b', R: 'L', b: 'n' } }]
      });
      hydrateSprites();
      // parallax: far layers lag the scroll a little; positions snap to whole pixels
      if (!hv) return;
      const layers = hv.querySelectorAll('.vl'), hero = document.getElementById('home');
      const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
      let ticking = false, vis = true;
      const clear = () => layers.forEach(l => l.style.removeProperty('transform'));
      const upd = () => {
        ticking = false;
        if (prefersReducedMotion.matches) { clear(); return; }
        if (!vis) return;
        const y = Math.min(scrollY, 360);
        layers.forEach(l => {
          const lag = Number.parseFloat(l.dataset.lag);
          if (Number.isFinite(lag)) l.style.transform = 'translate3d(0,' + Math.round(y * lag) + 'px,0)';
        });
      };
      new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) upd(); }, { threshold: 0 }).observe(hero);
      addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
      prefersReducedMotion.addEventListener('change', upd);
    }
    function setupAmbient() {
      const hs = document.querySelector('.hero-scene');
      if (hs) { const box = document.createElement('div'); box.className = 'pollen-box'; let h = '';
        for (let i = 0; i < 12; i++) h += '<i class="pollen" style="left:' + (4 + i * 8) + '%;top:' + (38 + (i * 13) % 42) + '%;--d:' + (11 + (i * 3) % 9) + 's;--o:' + (-(i * 2.3)).toFixed(1) + 's;--dx:' + (40 + (i * 17) % 90) + 'px;--dy:' + (-(60 + (i * 23) % 110)) + 'px"></i>';
        box.innerHTML = h; hs.appendChild(box); }
      const fb = document.getElementById('fireflies');
      if (fb) { let h = ''; for (let i = 0; i < 16; i++) h += '<i class="fire" style="left:' + (3 + i * 6) + '%;top:' + (38 + (i * 11) % 50) + '%;--d:' + (7 + (i * 5) % 7) + 's;--o:' + (-(i * 1.7)).toFixed(1) + 's;--dx:' + (-30 + (i * 19) % 80) + 'px;--dy:' + (-(30 + (i * 29) % 70)) + 'px"></i>'; fb.innerHTML = h; }
      buildStars('csf', 24);
    }

    // ---- mobile mailbox menu ----
    function setupMenu() {
      const btn = document.getElementById('menuBtn'), m = document.getElementById('mnav'); if (!btn || !m) return;
      const set = open => {
        m.hidden = !open; btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.classList.toggle('menu-open', open); btn.innerHTML = pxSprite(open ? 'envelope' : 'mailbox', 2);
        if (open) m.querySelector('a').focus();
      };
      btn.addEventListener('click', () => set(m.hidden));
      m.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && !m.hidden) { set(false); btn.focus(); } });
      matchMedia('(min-width: 701px)').addEventListener('change', e => { if (e.matches && !m.hidden) set(false); });
    }

    // reveal: small sparkle puff, then settle in either scroll direction
    function setupObs() {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(en => {
          en.target.classList.toggle('vis', en.isIntersecting);
        });
      }, { rootMargin: '0px 0px -32px 0px', threshold: .12 });
      document.querySelectorAll('.fi').forEach(el => obs.observe(el));
    }

    runWhenReady(() => {
      buildDividers(); setupVillages(); setupAmbient(); setupMenu(); hydrateSprites();
      // keep the hero village's cottages in sync with night mode: windows glow
    });


(function(){
  const sky=document.createElement('div');sky.id='skyFx';sky.setAttribute('aria-hidden','true');document.body.prepend(sky);
  const st=[['#FFD9C0','#CFE6F5'],['#FFE9B8','#FFD2A0'],['#F7A8A8','#B9A6D9'],['#3B2A4A','#5A3F7A']];
  const hx=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
  const mix=(a,b,t)=>{const x=hx(a),y=hx(b);return 'rgb('+x.map((v,i)=>Math.round(v+(y[i]-v)*t)).join(',')+')'};
  let tk=false;const upd=()=>{tk=false;const m=document.documentElement.scrollHeight-innerHeight;const p=Math.max(0,Math.min(1,scrollY/(m||1)))*3;const i=Math.min(2,Math.floor(p)),t=p-i;
    sky.style.setProperty('--s1',mix(st[i][0],st[i+1][0],t));sky.style.setProperty('--s2',mix(st[i][1],st[i+1][1],t));};
  addEventListener('scroll',()=>{if(!tk){tk=true;requestAnimationFrame(upd)}},{passive:true});upd();
})();


/* ===== AWE LAYER ===== */
(function () {
  'use strict';
  const root = document.documentElement;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const pack = c => (255 << 24) | (clamp(Math.round(c[2]), 0, 255) << 16) | (clamp(Math.round(c[1]), 0, 255) << 8) | clamp(Math.round(c[0]), 0, 255);
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function noise1(seed) { const r = rng(seed), L = []; for (let i = 0; i < 1024; i++) L.push(r()); return x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(L[i & 1023], L[(i + 1) & 1023], u); }; }
  const isNight = () => root.getAttribute('data-theme') === 'night';
  const pal3 = (k, tod) => { const p = clamp(tod, 0, 1) * 2, i = Math.min(1, Math.floor(p)); return mix(k[i], k[i + 1], p - i); };

  /* ---------- palettes: [night, dawn, day] ---------- */
  const SKY = [['#14113A', '#2A2260', '#5B3A86', '#B5648E'], ['#5A6FB8', '#A486C8', '#F59A94', '#FFD08A'], ['#8FC0F5', '#C9C8F6', '#FFC9C4', '#FFE6A6']].map(a => a.map(hex));
  const skyAt = (tod, g) => { const s = SKY[0].map((_, i) => pal3([SKY[0][i], SKY[1][i], SKY[2][i]], tod)); const p = clamp(g, 0, 1) * 3, i = Math.min(2, Math.floor(p)); return mix(s[i], s[i + 1], p - i); };
  const LAYER = [
    [hex('#3A2F72'), hex('#A07FB8'), hex('#B4A3E6')],
    [hex('#2C2560'), hex('#8466A0'), hex('#9C8BDC')],
    [hex('#231D52'), hex('#6F5890'), hex('#8DB3E0')]
  ];
  const SNOW = [hex('#8F85C8'), hex('#FFD9D0'), hex('#FFF8F2')];
  const CLOUD = { body: [hex('#5E4F96'), hex('#FFC0B8'), hex('#FFF8F0')], top: [hex('#8E80C8'), hex('#FFE6C0'), hex('#FFFFFF')], shade: [hex('#41386F'), hex('#D890A8'), hex('#E2D2F4')] };
  const WARM = [255, 226, 160], DEEP = [60, 40, 110];

  /* ---------- scene ---------- */
  const cv = $('aweSky'), hero = $('home');
  let ctx, W = 0, H = 0, S = 4, PAD = 16, img, u32;
  let far, mid, near, litF, litM, litN, snowD, hash;
  let sunX = 0, yHor = 0, sky = null;
  let todCur = 0, todTarget = isNight() ? 0 : 1, anim = null, palKey = -1, nightKey = null;
  let mxT = 0, mxS = 0, myT = 0, myS = 0, scrollArt = 0;
  let clouds = [], birds = [], stars = [], sparks = [];
  let cloudKey = -1;

  function mkCloud(r, w, h) {
    const m = new Uint8Array(w * h), bumps = [], n = 4 + Math.floor(r() * 3);
    for (let k = 0; k < n; k++) {
      const t = k / (n - 1), mound = Math.sin(t * Math.PI), rad = h * (.34 + .36 * mound + r() * .18);
      bumps.push([rad * 1.2 + (w - 2.4 * rad) * t, h - rad * .62, rad]);
    }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { for (const b of bumps) { const dx = (x - b[0]) / 1.35, dy = y - b[1]; if (dx * dx + dy * dy <= b[2] * b[2]) { m[y * w + x] = 1; break; } } }
    const cls = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!m[y * w + x]) continue;
      const up = y === 0 || !m[(y - 1) * w + x], dn2 = y >= h - 2 || !m[(y + 2) * w + x];
      cls[y * w + x] = up ? 2 : dn2 ? 3 : 1;
    }
    return { w, h, cls };
  }
  function paintCloud(cl, tod) {
    const c = cl.cv || (cl.cv = document.createElement('canvas')); c.width = cl.w; c.height = cl.h;
    const x = c.getContext('2d'), id = x.createImageData(cl.w, cl.h), d = new Uint32Array(id.data.buffer);
    const col = [0, pack(pal3(CLOUD.body, tod)), pack(pal3(CLOUD.top, tod)), pack(pal3(CLOUD.shade, tod))];
    for (let i = 0; i < cl.cls.length; i++) d[i] = cl.cls[i] ? col[cl.cls[i]] : 0;
    x.putImageData(id, 0, 0);
  }

  function ridge(len, seed, freq, ridged) {
    const n1 = noise1(seed), n2 = noise1(seed + 7), n3 = noise1(seed + 13), a = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      const x = i * freq;
      a[i] = ridged ? .6 * (1 - Math.abs(2 * n1(x) - 1)) + .28 * (1 - Math.abs(2 * n2(x * 2.3) - 1)) + .12 * n3(x * 5.1)
        : .65 * n1(x) + .25 * n2(x * 2.7) + .1 * n3(x * 6);
    }
    return a;
  }
  function build() {
    const r = hero.getBoundingClientRect();
    S = r.width < 700 ? 3 : 4;
    W = Math.ceil(r.width / S); H = Math.ceil(r.height / S);
    cv.width = W; cv.height = H; cv.style.width = W * S + 'px'; cv.style.height = H * S + 'px';
    ctx = cv.getContext('2d', { alpha: false }); ctx.imageSmoothingEnabled = false;
    img = ctx.createImageData(W, H); u32 = new Uint32Array(img.data.buffer);
    sunX = Math.round(W * (W * S < 700 ? .62 : .76));
    yHor = H - 48;
    const len = W + PAD * 2 + 2, wl = Math.max(1, S === 3 ? 1.33 : 1);
    const gen = (seed, freq, ridged, base, amp, dip, dipW) => {
      const v = ridge(len, seed, freq * wl * (360 / Math.max(W, 200)) * (W / 360), ridged), o = new Int16Array(len);
      for (let i = 0; i < len; i++) { const dxx = (i - PAD - sunX) / dipW; o[i] = Math.round(base - amp * v[i] + dip * Math.exp(-dxx * dxx)); }
      return o;
    };
    far = gen(11, .014, true, H * .60, H * .24, H * .15, W * .085);
    mid = gen(23, .024, true, H * .70, H * .17, H * .09, W * .06);
    near = gen(37, .034, false, H * .81, H * .12, 0, 1);
    const lit = a => { const o = new Float32Array(len), K = 8; for (let i = 0; i < len; i++) { const s = a[Math.min(len - 1, i + K)] - a[Math.max(0, i - K)], side = (sunX - (i - PAD)) >= 0 ? 1 : -1; o[i] = Math.round(clamp(s / 12, -1, 1) * 2) / 2 * side; } return o; };
    litF = lit(far); litM = lit(mid); litN = lit(near);
    snowD = new Uint8Array(len); for (let i = 0; i < len; i++) { const lim = H * .44; snowD[i] = far[i] < lim ? Math.round((lim - far[i]) * .55) : 0; }
    hash = new Uint8Array(1024); const hr = rng(5); for (let i = 0; i < 1024; i++) hash[i] = Math.floor(hr() * 100);

    const r1 = rng(101); stars = [];
    for (let i = 0; i < Math.round(W * H / 260); i++) stars.push({ x: Math.floor(r1() * W), y: Math.floor(r1() * H * .6), big: r1() < .13, ph: r1() * 6.28, sp: .5 + r1() * 1.2 });
    const r2 = rng(202); clouds = [];
    const defs = [[.10, 54, 13, .7, .30], [.22, 40, 10, 1.0, .65], [.30, 62, 15, 1.5, .85], [.14, 30, 8, .5, .15], [.38, 48, 12, 1.9, .55], [.07, 36, 9, .6, .50], [.26, 28, 7, 1.2, .08]];
    defs.forEach((d, i) => { const m = mkCloud(r2, d[1], d[2]); clouds.push({ ...m, x: d[4] * (W + 80) - 40, y: Math.round(d[0] * H), v: d[3], layer: d[3] }); });
    const r4 = rng(404); birds = [];
    for (let i = 0; i < 6; i++) birds.push({ dx: -i * 6 - r4() * 2, dy: Math.abs(i - 2.5) * 3 * (i % 2 ? 1 : 1) + r4(), ph: r4() * 6.28 });
    birds.x = -30; birds.y = H * .2; birds.t0 = 0;
    const r5 = rng(505); sparks = []; for (let i = 0; i < 7; i++) sparks.push({ a: r5() * 6.28, d: 1.4 + r5() * 1.2, ph: r5() * 6.28 });
    palKey = -1; cloudKey = -1;
  }

  /* ---------- palette caches (rebuilt when time-of-day changes) ---------- */
  const NB = 12; let SKY_RGB = [], SKY_LUT = new Uint32Array(NB + 1), rowSky = [], LC = [];
  function buildPal(tod) {
    SKY_RGB = []; for (let i = 0; i <= NB; i++) { const c = skyAt(tod, i / NB); SKY_RGB.push(c); SKY_LUT[i] = pack(c); }
    rowSky = []; for (let y = 0; y < H; y++) rowSky.push(skyAt(tod, Math.min(1, y / yHor)));
    const alt = clamp((tod - .15) / .6, 0, 1);
    LC = [0, 1, 2].map(L => {
      const base = pal3(LAYER[L], tod), lit = mix(base, WARM, .26 + .26 * alt), rim = mix(base, WARM, .62), dark = mix(base, DEEP, .30), snow = pal3(SNOW, tod);
      const o = { b: new Uint32Array(H), l: new Uint32Array(H), r: new Uint32Array(H), d: new Uint32Array(H), s: new Uint32Array(H) };
      const hz = [.34, .22, .10][L];
      for (let y = 0; y < H; y++) {
        const h = hz + .38 * smooth(H * .50, yHor + 6, y), s = rowSky[y];
        o.b[y] = pack(mix(base, s, h)); o.l[y] = pack(mix(lit, s, h * .8)); o.r[y] = pack(mix(rim, s, h * .5)); o.d[y] = pack(mix(dark, s, h * .7)); o.s[y] = pack(mix(snow, s, h * .35));
      }
      return o;
    });
  }

  /* ---------- per-frame render ---------- */
  function render(t) {
    const tod = todCur, n = isNight();
    const key = Math.round(tod * 200);
    if (key !== palKey) { buildPal(tod); palKey = key; }
    const ck = Math.round(tod * 40); if (ck !== cloudKey) { clouds.forEach(c => paintCloud(c, tod)); cloudKey = ck; }
    mxS += (mxT - mxS) * .06; myS += (myT - myS) * .06;
    const oF = Math.round(-mxS * 3) + PAD, oM = Math.round(-mxS * 6) + PAD, oN = Math.round(-mxS * 10) + PAD;
    const dF = Math.round(scrollArt * .45 + myS * -1.5), dM = Math.round(scrollArt * .30 + myS * -3), dN = Math.round(scrollArt * .16 + myS * -5);
    const r = Math.max(9, Math.round(H * .055));
    const sunAlt = ease(clamp(tod / .85, 0, 1));
    const sy = Math.round(lerp(H * .74 + r, H * (W * S < 700 ? .16 : .27), sunAlt) + scrollArt * .5), sx = sunX + Math.round(-mxS * 1.5);
    const glowS = clamp(tod * 1.7, 0, 1) * (.5 + .5 * sunAlt), rayS = clamp((tod - .25) / .5, 0, 1);
    const R = r * 4.4, R2 = R * R, RR = H * 1.05;
    const moonA = clamp(1 - tod / .5, 0, 1), mR = Math.max(7, Math.round(H * .045)), mX = Math.round(W * (W * S < 700 ? .22 : .17)), mY = Math.round(H * .22 + scrollArt * .5);
    const bX = mX + Math.round(mR * .55), bY = mY - Math.round(mR * .2), bR2 = (mR * .86) * (mR * .86), mR2 = mR * mR;
    const sunR2 = r * r, c1 = pack([255, 251, 230]), c2 = pack([255, 240, 168]), c3 = pack([255, 217, 104]), moonC = [255, 246, 220];
    const layers = [LC[0], LC[1], LC[2]];
    for (let x = 0; x < W; x++) {
      const fy = far[x + oF] + dF, my = mid[x + oM] + dM, ny = near[x + oN] + dN;
      const fl = litF[x + oF], ml = litM[x + oM], nl = litN[x + oN], sd = snowD[x + oF];
      for (let y = 0; y < H; y++) {
        const idx = y * W + x, bz = BAYER[((y & 3) << 2) | (x & 3)];
        let L, d, ry, lit;
        if (y >= ny) { L = 2; d = y - ny; lit = nl; }
        else if (y >= my) { L = 1; d = y - my; lit = ml; }
        else if (y >= fy) { L = 0; d = y - fy; lit = fl; }
        else L = -1;
        if (L >= 0) {
          const P = layers[L];
          let c = P.b[y];
          if (L === 0 && d < sd) c = (d < sd - 2 || bz < (sd - d) / 3) ? P.s[y] : c;
          else if (d < 1) c = lit >= -.2 ? P.r[y] : c;
          else if (lit > .15) { if (bz < lit * .4 * (1 - smooth(0, 14, d))) c = P.l[y]; }
          else if (lit < -.15) { if (bz < -lit * .42 * (1 - smooth(4, 26, d))) c = P.d[y]; }
          u32[idx] = c; continue;
        }
        const g = y / yHor * NB; let gi = Math.floor(g + bz); if (gi > NB) gi = NB;
        let rgb = null;
        const dxs = x - sx, dys = y - sy, d2 = dxs * dxs + dys * dys;
        if (glowS > 0 && d2 < R2) {
          const f = 1 - Math.sqrt(d2) / R, amt = Math.floor(f * f * 6 * glowS + bz) / 6 * .75;
          if (amt > 0) rgb = mix(SKY_RGB[gi], WARM, amt);
        }
        if (rayS > 0 && d2 > sunR2 && d2 < RR * RR) {
          const ang = Math.atan2(dys, dxs), s = Math.sin(ang * 10 + t * .12) + .7 * Math.sin(ang * 23 - t * .17 + 1.3);
          if (s > .9) {
            const dist = Math.sqrt(d2), v = (s - .9) * (1 - dist / RR) * rayS * 1.7;
            if (v > .05 + .12 * bz) rgb = mix(rgb || SKY_RGB[gi], WARM, .17);
          }
        }
        if (moonA > 0) {
          const mdx = x - mX, mdy = y - mY;
          if (mdx * mdx + mdy * mdy <= mR2 && ((x - bX) * (x - bX) + (y - bY) * (y - bY)) > bR2 && moonA + bz * .4 > .55) rgb = moonC;
        }
        if (d2 <= sunR2 && glowS > 0) { const dd = d2 / sunR2; u32[idx] = dd < .25 ? c1 : dd < .72 ? c2 : c3; continue; }
        u32[idx] = rgb ? pack(rgb) : SKY_LUT[gi];
      }
    }
    ctx.putImageData(img, 0, 0);

    const topAt = x => Math.min(far[clamp(x + oF, 0, far.length - 1)] + dF, 9999);
    const starA = clamp(1 - tod * 1.8, 0, 1);
    if (starA > 0.02) {
      ctx.fillStyle = '#FFF4E0';
      for (const s of stars) {
        if (s.y > topAt(s.x) - 2) continue;
        const a = (.45 + .55 * Math.sin(t * s.sp + s.ph)) * starA; if (a < .12) continue;
        ctx.globalAlpha = a; ctx.fillRect(s.x, s.y, 1, 1);
        if (s.big && a > .5) { ctx.fillRect(s.x - 1, s.y, 1, 1); ctx.fillRect(s.x + 1, s.y, 1, 1); ctx.fillRect(s.x, s.y - 1, 1, 1); ctx.fillRect(s.x, s.y + 1, 1, 1); }
      }
      ctx.globalAlpha = 1;
      const ph = (t % 11) / 1.3;
      if (starA > .5 && ph < 1) { ctx.fillStyle = '#FFFFFF'; const sx0 = W * .55 - ph * 48, sy0 = H * .08 + ph * 26; for (let i = 0; i < 7; i++) { ctx.globalAlpha = (1 - i / 7) * (1 - ph); ctx.fillRect(Math.round(sx0 + i * 2), Math.round(sy0 - i), 1, 1); } ctx.globalAlpha = 1; }
    }
    if (glowS > .55 && sy < yHor) {
      ctx.fillStyle = '#FFFBE0';
      sparks.forEach(p => { if (Math.sin(t * 1.4 + p.ph) < .55) return; const px = Math.round(sx + Math.cos(p.a) * r * p.d), py = Math.round(sy + Math.sin(p.a) * r * p.d); if (py > fy0(px)) return; ctx.fillRect(px, py, 1, 1); ctx.fillRect(px - 1, py, 1, 1); ctx.fillRect(px + 1, py, 1, 1); ctx.fillRect(px, py - 1, 1, 1); ctx.fillRect(px, py + 1, 1, 1); });
    }
    function fy0(px) { return topAt(px); }

    const sc = scrollArt;
    clouds.forEach(c => {
      c.x += c.v * .042 * (REDUCE ? 0 : 1); if (c.x > W + 4) c.x = -c.w - 4;
      ctx.drawImage(c.cv, Math.round(c.x - mxS * c.layer * 2), Math.round(c.y + sc * .5 * (.5 + c.layer * .2)));
    });
    if (tod > .35) {
      const bt = (t % 80) / 80, bx = lerp(-30, W + 40, bt), by = H * .2 + Math.sin(bt * 6.28) * 4 + sc * .3;
      ctx.fillStyle = tod > .6 ? '#4A3228' : '#2A2260';
      birds.forEach(b => {
        const x = Math.round(bx + b.dx), y = Math.round(by + b.dy), up = Math.sin(t * 5 + b.ph) > 0;
        if (up) { ctx.fillRect(x - 2, y - 1, 1, 1); ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x + 2, y - 1, 1, 1); }
        else { ctx.fillRect(x - 2, y + 1, 1, 1); ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x + 2, y + 1, 1, 1); }
      });
    }
  }

  /* ---------- loop ---------- */
  let last = 0, visible = true, running = false, frame = 0, t0 = performance.now();
  function setTod(to, dur, easing) { anim = { from: todCur, to, t0: performance.now(), dur, e: easing || ease }; todTarget = to; }
  function loop(now) {
    if (!running) return;
    frame = requestAnimationFrame(loop);
    if (now - last < 41) return; last = now;
    if (anim) { const p = clamp((now - anim.t0) / anim.dur, 0, 1); todCur = lerp(anim.from, anim.to, anim.e(p)); if (p >= 1) { todCur = anim.to; anim = null; } }
    scrollArt = clamp(scrollY, 0, hero.offsetHeight) / S;
    render((now - t0) / 1000);
  }
  function syncAnimation() {
    if (!visible || document.hidden) {
      if (running) cancelAnimationFrame(frame);
      running = false;
    } else if (!running) {
      running = true;
      frame = requestAnimationFrame(loop);
    }
  }

  function initSky() {
    if (!cv || !hero) return;
    todCur = todTarget;
    build();
    if (REDUCE) { render(3); addEventListener('resize', () => { build(); render(3); }); new MutationObserver(() => { todCur = isNight() ? 0 : 1; palKey = -1; render(3); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] }); return; }
    new ResizeObserver(() => { const r = hero.getBoundingClientRect(); if (Math.ceil(r.width / S) !== W || Math.ceil(r.height / S) !== H) build(); }).observe(hero);
    new IntersectionObserver(e => { visible = e[0].isIntersecting; syncAnimation(); }, { threshold: 0 }).observe(hero);
    document.addEventListener('visibilitychange', syncAnimation);
    hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); mxT = ((e.clientX - r.left) / r.width - .5) * 2; myT = ((e.clientY - r.top) / r.height - .5) * 2; }, { passive: true });
    new MutationObserver(() => setTod(isNight() ? 0 : 1, 2400)).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    syncAnimation();
  }

  function init() { initSky(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
