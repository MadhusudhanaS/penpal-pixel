"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import Lenis from "lenis";

const PEN_SVG = `
  <svg viewBox="0 0 30 30" aria-hidden="true">
    <path fill="#5c3d2e" d="M21 1h5v5h-5zM17 5h5v5h-5zM13 9h5v5h-5zM9 13h5v5H9zM5 17h5v5H5zM1 21h5v5H1z"/>
    <path fill="#ffd4a8" d="M21 2h3v3h-3zM17 6h3v3h-3zM13 10h3v3h-3zM9 14h3v3H9zM5 18h3v3H5z"/>
    <path fill="#e8445a" d="M1 25h5v3H1zM2 28h3v2H2z"/>
    <path fill="#fffdf5" d="M18 5h2v2h-2zM14 9h2v2h-2zM10 13h2v2h-2z"/>
  </svg>
`;

const INTERACTIVE_SELECTOR =
  "a, button, summary, label, [role='button'], .btn-px, .nav-btn, .send-btn-main, .btn-soft, .al-btn, .occ, .quiet-toggle";
const TEXT_SELECTOR = "input, textarea, select, [contenteditable='true']";

function getSurfaceInk(target) {
  const section = target instanceof Element ? target.closest("section") : null;
  const background = getComputedStyle(section || document.body).backgroundColor;
  const match = background.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  const canvas = [255, 248, 240];
  const alpha = match ? Number(match[4] ?? 1) : 0;
  const surface = match
    ? [Number(match[1]), Number(match[2]), Number(match[3])].map((channel, index) =>
        Math.round(channel * alpha + canvas[index] * (1 - alpha)),
      )
    : canvas;
  const luminance = (surface[0] * 299 + surface[1] * 587 + surface[2] * 114) / 1000;
  const contrast = luminance < 135 ? [255, 222, 181] : [92, 61, 46];
  const ink = surface.map((channel, index) => Math.round(channel * 0.35 + contrast[index] * 0.65));

  return `rgb(${ink.join(", ")})`;
}

export default function UIEnhancements() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const scrollAreas = [...document.querySelectorAll(".lt-body")];
    const scrollAreaState = scrollAreas.map((area) => [area, area.hasAttribute("data-lenis-prevent")]);
    const particles = new Set();
    const trails = new Set();
    const mascot = document.querySelector(".hero-mascot");
    let lenis = null;
    let lenisFrame = 0;
    let cursor = null;
    let lastTrailAt = 0;
    let mascotFloat = null;
    let whisper;

    scrollAreas.forEach((area) => area.setAttribute("data-lenis-prevent", ""));

    function runLenisFrame(time) {
      if (!lenis) return;
      lenis.raf(time);
      lenisFrame = window.requestAnimationFrame(runLenisFrame);
    }

    function syncLenis() {
      const shouldRun = finePointer.matches && !reducedMotion.matches;
      if (shouldRun && !lenis) {
        lenis = new Lenis({
          duration: 1.05,
          easing: (progress) => 1 - Math.pow(1 - progress, 4),
          smoothWheel: true,
          syncTouch: false,
          wheelMultiplier: 0.9,
        });
        lenisFrame = window.requestAnimationFrame(runLenisFrame);
      } else if (!shouldRun && lenis) {
        window.cancelAnimationFrame(lenisFrame);
        lenis.destroy();
        lenis = null;
        lenisFrame = 0;
      }
    }

    function removeAnimatedElement(element, collection) {
      collection.delete(element);
      element.remove();
    }

    function spawnBurst(x, y, ink, count) {
      if (reducedMotion.matches) return;

      const colors = [ink, "#ff8fb5", "#ffc020", "#8fddc8", "#c8a8ff"];
      for (let index = 0; index < count; index += 1) {
        const bit = document.createElement("i");
        const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
        const distance = 14 + (index % 3) * 7;
        const destinationX = Math.round((Math.cos(angle) * distance) / 2) * 2;
        const destinationY = Math.round((Math.sin(angle) * distance) / 2) * 2;

        bit.className = "pixel-click-bit";
        bit.style.setProperty("--pixel-ink", colors[index % colors.length]);
        document.body.appendChild(bit);
        particles.add(bit);
        gsap.fromTo(
          bit,
          { x: Math.round(x - 2), y: Math.round(y - 2), scale: 0.7, autoAlpha: 1 },
          {
            x: Math.round(x - 2) + destinationX,
            y: Math.round(y - 2) + destinationY,
            scale: 0.45,
            autoAlpha: 0,
            duration: 0.48,
            delay: (index % 3) * 0.018,
            ease: "power2.out",
            onComplete: () => removeAnimatedElement(bit, particles),
          },
        );
      }
    }

    function spawnTrail(x, y, ink) {
      if (reducedMotion.matches || trails.size >= 8) return;

      const trail = document.createElement("span");
      trail.className = "pixel-ink-trail";
      trail.setAttribute("aria-hidden", "true");
      trail.style.setProperty("--pixel-ink", ink);
      trail.innerHTML = "<i></i><i></i><i></i><i></i>";
      document.body.appendChild(trail);
      trails.add(trail);
      gsap.fromTo(
        trail,
        { x: Math.round(x - 2), y: Math.round(y - 2), scale: 1, autoAlpha: 0.95 },
        {
          scale: 0.45,
          autoAlpha: 0,
          duration: 0.42,
          ease: "power1.out",
          onComplete: () => removeAnimatedElement(trail, trails),
        },
      );
    }

    function mountCursor() {
      if (cursor || !finePointer.matches) return;

      cursor = document.createElement("span");
      cursor.className = "pixel-pen-cursor";
      cursor.setAttribute("aria-hidden", "true");
      cursor.innerHTML = PEN_SVG;
      document.body.appendChild(cursor);
      document.body.classList.add("has-pixel-pen");
      cursor.style.transform = "translate3d(-40px, -40px, 0)";
      cursor.style.opacity = "0";
    }

    function unmountCursor() {
      if (!cursor) return;
      cursor.remove();
      cursor = null;
      document.body.classList.remove("has-pixel-pen");
    }

    function syncCursor() {
      if (finePointer.matches) mountCursor();
      else unmountCursor();
    }

    function updateCursor(event) {
      if (!cursor) return null;
      const target = event.target instanceof Element ? event.target : null;
      const isTextEntry = Boolean(target?.closest(TEXT_SELECTOR));
      const isInteractive = Boolean(target?.closest(INTERACTIVE_SELECTOR));
      cursor.classList.toggle("is-interactive", isInteractive);
      cursor.style.transform = `translate3d(${Math.round(event.clientX - 2)}px, ${Math.round(event.clientY - 2)}px, 0)`;
      cursor.style.opacity = isTextEntry ? "0" : "1";
      return { target, isTextEntry };
    }

    function handlePointerOver(event) {
      updateCursor(event);
    }

    function handlePointerMove(event) {
      const pointer = updateCursor(event);
      if (!pointer || pointer.isTextEntry || reducedMotion.matches || trails.size >= 8) return;
      const now = performance.now();
      if (now - lastTrailAt < 36) return;

      lastTrailAt = now;
      spawnTrail(event.clientX, event.clientY, getSurfaceInk(pointer.target));
    }

    function handlePointerDown(event) {
      if (event.button !== 0) return;

      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(TEXT_SELECTOR)) return;

      const control = target?.closest(INTERACTIVE_SELECTOR);
      spawnBurst(event.clientX, event.clientY, getSurfaceInk(target), control ? 7 : 5);
    }

    function handlePointerLeave() {
      if (cursor) cursor.style.opacity = "0";
    }

    function syncMascotMotion() {
      mascotFloat?.kill();
      mascotFloat = null;
      if (mascot && !reducedMotion.matches) {
        mascotFloat = gsap.to(mascot, {
          y: -7,
          duration: 1.7,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          snap: { y: 1 },
        });
      } else if (mascot) {
        gsap.set(mascot, { clearProps: "transform" });
      }
    }

    const onMascotEnter = () => {
      mascot?.classList.add("penny-is-happy");
      if (reducedMotion.matches || !mascot) return;
      mascotFloat?.pause();
      gsap.to(mascot, { y: -10, scale: 1.04, duration: 0.22, ease: "back.out(1.8)", overwrite: "auto" });
    };
    const onMascotLeave = () => {
      mascot?.classList.remove("penny-is-happy");
      if (reducedMotion.matches || !mascot) return;
      gsap.to(mascot, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
        onComplete: () => mascotFloat?.resume(),
      });
    };

    if (mascot) {
      whisper = document.createElement("span");
      whisper.className = "penny-whisper";
      whisper.textContent = "Hi, friend!";
      mascot.appendChild(whisper);
      mascot.addEventListener("pointerenter", onMascotEnter);
      mascot.addEventListener("pointerleave", onMascotLeave);
      syncMascotMotion();
    }

    syncLenis();
    syncCursor();
    reducedMotion.addEventListener("change", syncLenis);
    reducedMotion.addEventListener("change", syncMascotMotion);
    finePointer.addEventListener("change", syncLenis);
    finePointer.addEventListener("change", syncCursor);
    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      reducedMotion.removeEventListener("change", syncLenis);
      reducedMotion.removeEventListener("change", syncMascotMotion);
      finePointer.removeEventListener("change", syncLenis);
      finePointer.removeEventListener("change", syncCursor);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerleave", handlePointerLeave);
      mascot?.removeEventListener("pointerenter", onMascotEnter);
      mascot?.removeEventListener("pointerleave", onMascotLeave);
      mascotFloat?.kill();
      if (mascot) gsap.set(mascot, { clearProps: "transform" });
      whisper?.remove();
      unmountCursor();
      particles.forEach((particle) => {
        gsap.killTweensOf(particle);
        particle.remove();
      });
      trails.forEach((trail) => {
        gsap.killTweensOf(trail);
        trail.remove();
      });
      if (lenis) {
        window.cancelAnimationFrame(lenisFrame);
        lenis.destroy();
      }
      scrollAreaState.forEach(([area, hadPrevent]) => {
        if (!hadPrevent) area.removeAttribute("data-lenis-prevent");
      });
    };
  }, []);

  return null;
}
