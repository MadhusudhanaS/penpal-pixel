(function () {
  const style = document.createElement("style");
  style.textContent = `
    html, body, body * {
      font-family: "Pixelify Sans", sans-serif !important;
    }

    #environment {
      background:
        radial-gradient(ellipse at 50% 40%, rgba(255, 247, 215, .72) 0%, rgba(255, 238, 210, .3) 27%, transparent 58%),
        radial-gradient(ellipse at 14% 44%, rgba(233, 150, 178, .2) 0%, transparent 43%),
        radial-gradient(ellipse at 86% 38%, rgba(170, 160, 212, .17) 0%, transparent 40%),
        linear-gradient(180deg, #ee9f91 0%, #f8b49b 38%, #ffd1ad 70%, #f2d3bd 100%);
    }

    #stars {
      opacity: .38;
      background-image:
        radial-gradient(3px 3px at 20px 30px, rgba(255, 251, 232, .92), transparent 65%),
        radial-gradient(2px 2px at 72px 82px, rgba(255, 255, 255, .86), transparent 65%),
        radial-gradient(2px 2px at 142px 126px, rgba(255, 244, 224, .8), transparent 65%);
      background-size: 180px 180px;
      filter: drop-shadow(0 0 3px rgba(255, 243, 220, .32));
    }

    #desk {
      background: linear-gradient(180deg, #9a6f51 0%, #8b6246 20%, #79543d 100%);
      border-top: 6px solid #6e4a38;
      box-shadow:
        inset 0 3px 0 rgba(255, 233, 200, .22),
        inset 0 10px 0 rgba(74, 49, 39, .1),
        0 -14px 32px rgba(92, 59, 47, .16);
    }

    #desk::before {
      opacity: .62;
      background-image:
        repeating-linear-gradient(90deg, transparent 0 72px, rgba(77, 48, 35, .12) 72px 76px),
        repeating-linear-gradient(0deg, rgba(255, 235, 209, .05) 0 3px, transparent 3px 19px);
    }

    #scanlines {
      background:
        linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(68, 45, 48, .035) 50%),
        linear-gradient(90deg, rgba(255, 142, 150, .016), rgba(255, 220, 184, .008), rgba(116, 137, 185, .016));
      background-size: 100% 6px, 12px 100%;
      box-shadow: inset 0 0 90px rgba(84, 52, 48, .16);
      opacity: .42;
    }

    #envPos {
      width: min(330px, calc(100vw - 32px));
      height: 220px;
      left: calc(50% - 172px);
      translate: -50% 0;
    }

    #albPos {
      left: calc(50% + 208px);
      translate: -50% 0;
    }

    .item-positioner.picked-up,
    #albPos.picked-up {
      translate: 0 0;
      scale: 1;
    }

    #envPos .envelope-front {
      padding: 0 14px 14px;
    }

    #envPos .envelope-text {
      position: relative;
      z-index: 5;
      max-width: 100%;
      margin: 0;
      overflow: hidden;
      color: #4a3728;
      font-size: 13px;
      font-weight: 900;
      line-height: 1.25;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ppx-cover-note {
      position: absolute;
      z-index: 4;
      right: 72px;
      bottom: 52px;
      left: 16px;
      display: grid;
      gap: 3px;
      padding: 6px 8px;
      border: 2px solid #6b5040;
      background: #fffdf5;
      box-shadow: 3px 3px 0 rgb(92 61 46 / 20%);
      transform: rotate(-1deg);
    }

    .ppx-cover-note__label {
      color: #b83a68;
      font-size: 9px;
      font-weight: 900;
      letter-spacing: .08em;
      line-height: 1.15;
      text-transform: uppercase;
    }

    .ppx-cover-note__excerpt {
      display: -webkit-box;
      overflow: hidden;
      margin: 0;
      color: #4a3728;
      font-size: 12px;
      font-weight: 700;
      line-height: 1.3;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    #letterPagesContainer {
      color: #4a3728;
      font-family: "Pixelify Sans", sans-serif !important;
      line-height: 1.75;
      overscroll-behavior: contain;
      scrollbar-color: #e4a5b8 rgb(255 253 245 / 45%);
      scrollbar-width: thin;
    }

    #letterPagesContainer .page-content {
      padding: clamp(24px, 4vw, 40px);
      color: #4a3728;
      font-family: "Pixelify Sans", sans-serif !important;
      font-size: clamp(17px, 2vw, 21px);
      font-weight: 600;
      line-height: 1.75;
    }

    #letterPagesContainer .letter-para {
      margin-bottom: 14px;
      text-align: left;
    }

    #letterPagesContainer .letter-title {
      color: #9c4565;
      font-size: clamp(22px, 3vw, 30px);
      font-weight: 900;
      line-height: 1.25;
    }

    .card-fullscreen.open .letter-reveal {
      animation: ppx-letter-unfold .56s cubic-bezier(.2, .8, .2, 1) forwards;
      animation-delay: var(--delay, 0s);
    }

    @keyframes ppx-letter-unfold {
      from {
        opacity: 0;
        transform: translate3d(0, 9px, 0) scale(.99);
      }

      to {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
      }
    }

    .ppx-letter-pixel,
    .ppx-letter-cursor,
    .ppx-letter-trail {
      position: fixed;
      z-index: 1001;
      pointer-events: none;
      image-rendering: pixelated;
      will-change: transform, opacity;
    }

    .ppx-letter-pixel {
      top: 0;
      left: 0;
      width: 5px;
      height: 5px;
      background: var(--pixel-ink, #8b5a55);
      animation: ppx-pixel-burst 620ms cubic-bezier(.2, .8, .2, 1) var(--pixel-delay, 0ms) forwards;
    }

    .ppx-letter-cursor {
      top: 0;
      left: 0;
      width: 30px;
      height: 30px;
      opacity: 0;
      filter: drop-shadow(2px 2px 0 rgb(92 61 46 / 24%));
      transition: opacity 120ms ease;
    }

    .ppx-letter-cursor svg {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
      shape-rendering: crispEdges;
    }

    .ppx-letter-trail {
      width: 16px;
      height: 12px;
      background:
        linear-gradient(var(--pixel-ink, #8b5a55), var(--pixel-ink, #8b5a55)) 0 4px / 4px 4px no-repeat,
        linear-gradient(var(--pixel-ink, #8b5a55), var(--pixel-ink, #8b5a55)) 6px 0 / 4px 4px no-repeat,
        linear-gradient(var(--pixel-ink, #8b5a55), var(--pixel-ink, #8b5a55)) 6px 8px / 4px 4px no-repeat,
        linear-gradient(var(--pixel-ink, #8b5a55), var(--pixel-ink, #8b5a55)) 12px 4px / 4px 4px no-repeat;
      animation: ppx-trail-fade 420ms ease-out forwards;
    }

    @keyframes ppx-pixel-burst {
      0% {
        opacity: 0;
        transform: translate3d(0, 0, 0) scale(.6);
      }

      18% {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
      }

      100% {
        opacity: 0;
        transform: translate3d(var(--pixel-dx), var(--pixel-dy), 0) scale(.5);
      }
    }

    @keyframes ppx-trail-fade {
      to {
        opacity: 0;
        transform: scale(.45);
      }
    }

    .ppx-letter-cursor-enabled,
    .ppx-letter-cursor-enabled * {
      cursor: none !important;
    }

    .ppx-letter-cursor-enabled :is(input, textarea, select, [contenteditable="true"]) {
      cursor: text !important;
    }

    .end-heart {
      display: none !important;
    }

    @media (max-width: 720px) {
      #envPos,
      #albPos {
        top: 50%;
        bottom: auto !important;
        translate: -50% -50%;
        scale: .78;
      }

      #envPos {
        left: calc(50% - 135px);
      }

      #albPos {
        left: calc(50% + 165px);
      }
    }

    @media (max-width: 600px) {
      #envPos,
      #albPos {
        scale: .56;
      }

      #envPos {
        left: calc(50% - 95px);
      }

      #albPos {
        left: calc(50% + 115px);
      }
    }

    @media (max-width: 380px) {
      #envPos,
      #albPos {
        scale: .48;
      }

      #envPos {
        left: calc(50% - 70px);
      }

      #albPos {
        left: calc(50% + 82px);
      }
    }

    @media (max-width: 720px) and (max-aspect-ratio: 4/5) {
      #envPos,
      #albPos {
        left: 50%;
        scale: .62;
      }

      #envPos {
        top: calc(50% - 126px);
      }

      #albPos {
        top: calc(50% + 126px);
      }
    }

    @media (max-width: 720px) and (max-aspect-ratio: 4/5) and (max-height: 520px) {
      #envPos,
      #albPos {
        scale: .56;
      }

      #envPos {
        top: calc(50% - 112px);
      }

      #albPos {
        top: calc(50% + 112px);
      }
    }

    @media (max-width: 600px) {
      #letterBookView {
        width: min(560px, calc(100vw - 24px)) !important;
        height: min(520px, calc(100dvh - 140px)) !important;
      }

      #letterPagesContainer {
        padding: 24px 18px 20px !important;
        font-size: 16px;
        line-height: 1.55;
      }

      .ppx-cover-note {
        right: 68px;
        bottom: 48px;
        left: 12px;
        padding: 5px 6px;
      }

      .ppx-cover-note__excerpt {
        font-size: 11px;
      }

      #letterPagesContainer .page-content {
        padding: 20px;
        font-size: 17px;
      }

      #letterPagesContainer .letter-title {
        font-size: 23px;
      }

      .bottom-bar {
        bottom: 8px !important;
        display: flex;
        gap: 8px;
        justify-content: center;
      }

      .bottom-bar .action-btn {
        padding: 8px 10px;
        font-size: 11px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .ppx-letter-pixel,
      .ppx-letter-trail {
        display: none !important;
        animation: none !important;
      }

      .ppx-letter-cursor {
        transition: none;
      }

      .card-fullscreen.open .letter-reveal {
        animation: none !important;
        opacity: 1;
        transform: none;
      }
    }
  `;
  document.head.appendChild(style);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const letter = window.LETTER || {};
  const envelopeFront = document.querySelector("#envPos .envelope-front");
  const recipient = envelopeFront?.querySelector(".envelope-text");
  const envelopePosition = document.getElementById("envPos");
  const albumPosition = document.getElementById("albPos");
  const pixelColors = ["#ff8fb5", "#ffc020", "#8fddc8", "#c8a8ff", "#a8d4ff"];
  let cursor;
  let lastTrailAt = 0;
  let activeTrails = 0;

  if (envelopeFront && !envelopeFront.querySelector(".ppx-cover-note")) {
    const note = document.createElement("div");
    const label = document.createElement("span");
    const excerpt = document.createElement("p");
    const message = typeof letter.body === "string" ? letter.body.trim().replace(/\s+/g, " ") : "";

    note.className = "ppx-cover-note";
    note.setAttribute("role", "note");
    label.className = "ppx-cover-note__label";
    label.textContent = "A little note for you";
    excerpt.className = "ppx-cover-note__excerpt";
    excerpt.textContent = message
      ? `${message.slice(0, 118).trimEnd()}${message.length > 118 ? "…" : ""}`
      : "Your letter is waiting inside.";
    note.setAttribute("aria-label", `Letter preview: ${excerpt.textContent}`);
    note.append(label, excerpt);
    if (recipient) envelopeFront.insertBefore(note, recipient);
    else envelopeFront.appendChild(note);
  }

  function spawnPixels(x, y, count) {
    if (reducedMotion.matches) return;

    for (let index = 0; index < count; index += 1) {
      const pixel = document.createElement("span");
      const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
      const distance = 18 + (index % 4) * 7;
      pixel.className = "ppx-letter-pixel";
      pixel.setAttribute("aria-hidden", "true");
      pixel.style.left = `${Math.round(x - 2)}px`;
      pixel.style.top = `${Math.round(y - 2)}px`;
      pixel.style.setProperty("--pixel-ink", pixelColors[index % pixelColors.length]);
      pixel.style.setProperty("--pixel-dx", `${Math.round(Math.cos(angle) * distance)}px`);
      pixel.style.setProperty("--pixel-dy", `${Math.round(Math.sin(angle) * distance)}px`);
      pixel.style.setProperty("--pixel-delay", `${(index % 3) * 18}ms`);
      document.body.appendChild(pixel);
      pixel.addEventListener("animationend", () => pixel.remove(), { once: true });
    }
  }

  function burstFrom(element, count) {
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    spawnPixels(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, count);
  }

  window.spawnHearts = function () {
    burstFrom(envelopePosition, 12);
  };
  window.spawnAlbumStars = function () {
    burstFrom(albumPosition, 14);
  };

  const originalShowEndMoment = window.showEndMoment;
  if (typeof originalShowEndMoment === "function") {
    window.showEndMoment = function () {
      const result = originalShowEndMoment.apply(this, arguments);
      burstFrom(document.getElementById("endMoment"), 18);
      return result;
    };
  }

  function surfaceInk(target) {
    const surface = target instanceof Element ? target.closest("#environment") : null;
    const color = getComputedStyle(surface || document.body).backgroundColor;
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    const base = match ? [Number(match[1]), Number(match[2]), Number(match[3])] : [255, 212, 168];
    const luminance = (base[0] * 299 + base[1] * 587 + base[2] * 114) / 1000;
    const contrast = luminance < 135 ? [255, 222, 181] : [92, 61, 46];
    const ink = base.map((channel, index) => Math.round(channel * 0.35 + contrast[index] * 0.65));
    return `rgb(${ink.join(", ")})`;
  }

  function spawnTrail(x, y, ink) {
    if (activeTrails >= 8) return;
    const trail = document.createElement("span");
    trail.className = "ppx-letter-trail";
    trail.setAttribute("aria-hidden", "true");
    trail.style.left = `${Math.round(x - 2)}px`;
    trail.style.top = `${Math.round(y - 2)}px`;
    trail.style.setProperty("--pixel-ink", ink);
    document.body.appendChild(trail);
    activeTrails += 1;
    trail.addEventListener(
      "animationend",
      () => {
        activeTrails = Math.max(0, activeTrails - 1);
        trail.remove();
      },
      { once: true },
    );
  }

  function mountCursor() {
    if (!finePointer.matches || cursor) return;
    cursor = document.createElement("span");
    cursor.className = "ppx-letter-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = `
      <svg viewBox="0 0 30 30">
        <path fill="#5c3d2e" d="M21 1h5v5h-5zM17 5h5v5h-5zM13 9h5v5h-5zM9 13h5v5H9zM5 17h5v5H5zM1 21h5v5H1z"/>
        <path fill="#ffd4a8" d="M21 2h3v3h-3zM17 6h3v3h-3zM13 10h3v3h-3zM9 14h3v3H9zM5 18h3v3H5z"/>
        <path fill="#e8445a" d="M1 25h5v3H1zM2 28h3v2H2z"/>
        <path fill="#fffdf5" d="M18 5h2v2h-2zM14 9h2v2h-2zM10 13h2v2h-2z"/>
      </svg>
    `;
    document.body.appendChild(cursor);
    document.body.classList.add("ppx-letter-cursor-enabled");
  }

  function updateCursor(event) {
    if (!cursor) return null;
    const target = event.target instanceof Element ? event.target : null;
    const isTextEntry = Boolean(target?.closest("input, textarea, select, [contenteditable='true']"));
    cursor.style.opacity = isTextEntry ? "0" : "1";
    cursor.style.transform = `translate3d(${Math.round(event.clientX - 2)}px, ${Math.round(event.clientY - 2)}px, 0)`;
    return { target, isTextEntry };
  }

  function handlePointerOver(event) {
    updateCursor(event);
  }

  function handlePointerMove(event) {
    const pointer = updateCursor(event);
    if (!pointer || pointer.isTextEntry || reducedMotion.matches || activeTrails >= 8) return;
    const now = performance.now();
    if (now - lastTrailAt < 36) return;

    lastTrailAt = now;
    spawnTrail(event.clientX, event.clientY, surfaceInk(pointer.target));
  }

  function handlePointerDown(event) {
    if (event.button !== 0 || reducedMotion.matches) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
    spawnPixels(event.clientX, event.clientY, target?.closest("button, a, .item-positioner") ? 7 : 5);
  }

  function handlePointerLeave() {
    if (cursor) cursor.style.opacity = "0";
  }

  function handlePointerCapabilityChange() {
    if (finePointer.matches) mountCursor();
    else {
      cursor?.remove();
      cursor = null;
      document.body.classList.remove("ppx-letter-cursor-enabled");
    }
  }

  document.addEventListener("pointerover", handlePointerOver, { passive: true });
  document.addEventListener("pointermove", handlePointerMove, { passive: true });
  document.addEventListener("pointerdown", handlePointerDown, { passive: true });
  window.addEventListener("pointerleave", handlePointerLeave);
  finePointer.addEventListener("change", handlePointerCapabilityChange);
  mountCursor();

  const envelopeInner = document.getElementById("envInner");
  if (envelopeInner && !reducedMotion.matches) {
    envelopeInner.animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-5px)" },
        { transform: "translateY(0)" },
      ],
      { duration: 2800, easing: "ease-in-out", iterations: Infinity },
    );
  }
})();
