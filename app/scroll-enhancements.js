"use client";

import { useEffect } from "react";

export default function ScrollEnhancements() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const nav = document.querySelector(".nav");
    const hero = document.querySelector("#home");
    const cta = document.querySelector("#cta");
    const albumStage = document.querySelector(".album-stage");
    const cards = [...document.querySelectorAll(".step-card, .feat-card, .kind-card")];
    const scrollReveals = [...document.querySelectorAll(".sec-eye, .sec-h2, .sec-p, .cta-in, .px-div[data-div]")];
    const scenes = [...document.querySelectorAll(".how-sec, .feat-sec, .kind-sec, .faq-sec")];
    const sceneSet = new Set(scenes);
    const animatedAreas = [...document.querySelectorAll(".hero, .sec, .cta-sec, .footer, .px-div")];
    const navLinks = [...document.querySelectorAll(".nav-links a, .mnav a")].filter(
      (link) => link.hash && document.querySelector(link.hash),
    );
    const navSections = [...new Set(navLinks.map((link) => document.querySelector(link.hash)))];
    const visibleScenes = new Set();
    const tiltProperties = [
      "--depth-rotate-x",
      "--depth-rotate-y",
      "--depth-light-x",
      "--depth-light-y",
      "--depth-shadow-x",
      "--depth-shadow-y",
    ];
    let revealObserver;
    let sceneObserver;
    let scrollFrame = 0;
    let tiltFrame = 0;
    let photoFrame = 0;
    let pointerTarget = null;
    let photoPointer = null;
    let activeSection = null;
    let navigationInitialized = false;

    function clearPhotoTilt() {
      photoPointer = null;
      if (photoFrame) cancelAnimationFrame(photoFrame);
      photoFrame = 0;
      albumStage?.removeAttribute("data-photo-depth");
      albumStage?.style.removeProperty("--photo-rotate-x");
      albumStage?.style.removeProperty("--photo-rotate-y");
    }

    function applyPhotoTilt() {
      photoFrame = 0;
      if (!albumStage || !photoPointer || motion.matches || !finePointer.matches) return;

      const bounds = albumStage.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const x = Math.max(0, Math.min(1, (photoPointer.clientX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (photoPointer.clientY - bounds.top) / bounds.height));
      albumStage.dataset.photoDepth = "true";
      albumStage.style.setProperty("--photo-rotate-x", `${((0.5 - y) * 10).toFixed(2)}deg`);
      albumStage.style.setProperty("--photo-rotate-y", `${((x - 0.5) * 12).toFixed(2)}deg`);
    }

    function handlePhotoPointerMove(event) {
      if (motion.matches || !finePointer.matches || event.pointerType === "touch") {
        clearPhotoTilt();
        return;
      }

      if (!(event.target instanceof Element) || !event.target.closest(".photo-card")) return;

      photoPointer = { clientX: event.clientX, clientY: event.clientY };
      if (!photoFrame) photoFrame = requestAnimationFrame(applyPhotoTilt);
    }

    function clearTilt(card) {
      card.removeAttribute("data-depth-active");
      tiltProperties.forEach((property) => card.style.removeProperty(property));
    }

    function applyTilt() {
      tiltFrame = 0;
      if (!pointerTarget || motion.matches || !finePointer.matches) return;

      const { card, clientX, clientY } = pointerTarget;
      if (!card.isConnected) return;

      const bounds = card.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const x = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height));
      card.dataset.depthActive = "true";
      card.style.setProperty("--depth-rotate-x", `${((0.5 - y) * 12).toFixed(2)}deg`);
      card.style.setProperty("--depth-rotate-y", `${((x - 0.5) * 14).toFixed(2)}deg`);
      card.style.setProperty("--depth-light-x", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--depth-light-y", `${(y * 100).toFixed(1)}%`);
      card.style.setProperty("--depth-shadow-x", `${(8 - (x - 0.5) * 12).toFixed(1)}px`);
      card.style.setProperty("--depth-shadow-y", `${(9 - (y - 0.5) * 10).toFixed(1)}px`);
    }

    function handlePointerMove(event) {
      if (motion.matches || !finePointer.matches || event.pointerType === "touch") return;

      pointerTarget = {
        card: event.currentTarget,
        clientX: event.clientX,
        clientY: event.clientY,
      };
      if (!tiltFrame) tiltFrame = requestAnimationFrame(applyTilt);
    }

    function handlePointerLeave(event) {
      if (pointerTarget?.card === event.currentTarget) pointerTarget = null;
      clearTilt(event.currentTarget);
    }

    function updateVillageLayers(scene, villageSelector, scrollDistance) {
      scene?.querySelectorAll(`${villageSelector} .vl[data-lag]`).forEach((layer) => {
        const lag = Number.parseFloat(layer.dataset.lag);
        if (!Number.isFinite(lag)) return;

        layer.style.transform = `translate3d(0, ${Math.round(scrollDistance * lag)}px, 0)`;
      });
    }

    function updateHeroParallax() {
      if (!hero) return;

      const scrollDistance = Math.max(0, Math.min(360, -hero.getBoundingClientRect().top));
      updateVillageLayers(hero, ".hero-village", scrollDistance);
    }

    function updateCtaParallax() {
      if (!cta) return;

      const bounds = cta.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(1, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)),
      );
      updateVillageLayers(cta, ".cta-village", Math.round(progress * 260));
    }

    function clearVillageParallax() {
      [hero, cta].forEach((scene) => {
        scene?.querySelectorAll(".hero-village .vl, .cta-village .vl").forEach((layer) => {
          layer.style.removeProperty("transform");
        });
      });
    }

    function scrollRevealDelay(element) {
      if (element.matches(".sec-h2")) return 70;
      if (element.matches(".sec-p")) return 140;
      if (element.matches(".cta-in")) return 80;
      return 0;
    }

    function updateSceneDrift(scene) {
      const bounds = scene.getBoundingClientRect();
      const center = bounds.top + bounds.height / 2;
      const distanceFromCenter = window.innerHeight / 2 - center;
      const driftY = Math.max(-24, Math.min(24, distanceFromCenter * 0.04));
      const driftX = Math.max(-9, Math.min(9, distanceFromCenter * 0.014));
      scene.style.setProperty("--scene-drift", `${driftY.toFixed(2)}px`);
      scene.style.setProperty("--scene-drift-x", `${driftX.toFixed(2)}px`);
    }

    function clearSceneDrift(scene) {
      scene.style.removeProperty("--scene-drift");
      scene.style.removeProperty("--scene-drift-x");
    }

    function clearScrollReveal(element) {
      element.removeAttribute("data-scroll-reveal");
      element.removeAttribute("data-scroll-reveal-kind");
      element.style.removeProperty("--scroll-reveal-delay");
    }

    function setRevealState(element, isVisible) {
      const state = isVisible ? "visible" : "waiting";
      if (element.hasAttribute("data-scroll-reveal")) {
        element.dataset.scrollReveal = state;
      } else {
        element.dataset.scrollEntrance = state;
      }
    }

    function updateNavigation() {
      const line = (nav?.offsetHeight ?? 0) + 40;
      let current = null;
      navSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      });

      if (navigationInitialized && current === activeSection) return;
      navigationInitialized = true;
      activeSection = current;
      navLinks.forEach((link) => {
        if (current && link.hash === `#${current}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    function isInRevealViewport(element) {
      const bounds = element.getBoundingClientRect();
      return bounds.bottom > 0 && bounds.top < window.innerHeight - 32;
    }

    function updateScrollDepth() {
      scrollFrame = 0;
      updateNavigation();

      if (nav) {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0;
        nav.style.setProperty("--page-progress", progress.toFixed(4));
      }

      if (motion.matches) {
        clearVillageParallax();
        scenes.forEach(clearSceneDrift);
        return;
      }

      updateHeroParallax();
      updateCtaParallax();
      visibleScenes.forEach(updateSceneDrift);
    }

    function scheduleScrollDepth() {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollDepth);
    }

    function configureReveal() {
      revealObserver?.disconnect();
      cards.forEach((card) => card.removeAttribute("data-scroll-entrance"));
      scrollReveals.forEach(clearScrollReveal);
      if (motion.matches || !("IntersectionObserver" in window)) return;

      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(({ target, isIntersecting }) => {
            setRevealState(target, isIntersecting);
          });
        },
        { rootMargin: "0px 0px -32px 0px", threshold: 0.12 },
      );

      cards.forEach((card) => {
        setRevealState(card, isInRevealViewport(card));
        revealObserver.observe(card);
      });

      scrollReveals.forEach((element) => {
        if (element.matches(".px-div")) {
          element.dataset.scrollRevealKind = "divider";
        } else {
          element.style.setProperty("--scroll-reveal-delay", `${scrollRevealDelay(element)}ms`);
        }
        element.dataset.scrollReveal = "waiting";
        setRevealState(element, isInRevealViewport(element));
        revealObserver.observe(element);
      });
    }

    function configureScenes() {
      sceneObserver?.disconnect();
      visibleScenes.clear();
      scenes.forEach(clearSceneDrift);
      animatedAreas.forEach((area) => area.classList.remove("motion-paused"));
      if (motion.matches || !("IntersectionObserver" in window)) return;

      sceneObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(({ target, isIntersecting }) => {
            target.classList.toggle("motion-paused", !isIntersecting);
            if (!sceneSet.has(target)) return;

            if (isIntersecting) visibleScenes.add(target);
            else {
              visibleScenes.delete(target);
              clearSceneDrift(target);
            }
          });
          scheduleScrollDepth();
        },
        { rootMargin: "160px 0px", threshold: 0 },
      );

      animatedAreas.forEach((area) => sceneObserver.observe(area));
    }

    cards.forEach((card) => {
      const siblingIndex = [...card.parentElement.children].indexOf(card);
      card.dataset.depthCard = "true";
      card.style.setProperty("--depth-stagger", `${Math.min(siblingIndex, 4) * 55}ms`);
      card.addEventListener("pointerenter", handlePointerMove);
      card.addEventListener("pointermove", handlePointerMove);
      card.addEventListener("pointerleave", handlePointerLeave);
      card.addEventListener("pointercancel", handlePointerLeave);
    });

    function handleMotionChange() {
      configureReveal();
      configureScenes();
      if (motion.matches) {
        pointerTarget = null;
        cards.forEach(clearTilt);
        clearPhotoTilt();
      }
      scheduleScrollDepth();
    }

    function handlePointerChange() {
      if (!finePointer.matches) {
        pointerTarget = null;
        cards.forEach(clearTilt);
        clearPhotoTilt();
      }
    }

    albumStage?.addEventListener("pointermove", handlePhotoPointerMove);
    albumStage?.addEventListener("pointerleave", clearPhotoTilt);
    window.addEventListener("scroll", scheduleScrollDepth, { passive: true });
    window.addEventListener("resize", scheduleScrollDepth, { passive: true });
    motion.addEventListener("change", handleMotionChange);
    finePointer.addEventListener("change", handlePointerChange);
    configureReveal();
    configureScenes();
    scheduleScrollDepth();

    return () => {
      window.removeEventListener("scroll", scheduleScrollDepth);
      window.removeEventListener("resize", scheduleScrollDepth);
      motion.removeEventListener("change", handleMotionChange);
      finePointer.removeEventListener("change", handlePointerChange);
      albumStage?.removeEventListener("pointermove", handlePhotoPointerMove);
      albumStage?.removeEventListener("pointerleave", clearPhotoTilt);
      revealObserver?.disconnect();
      sceneObserver?.disconnect();
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      if (tiltFrame) cancelAnimationFrame(tiltFrame);
      clearPhotoTilt();
      clearVillageParallax();
      cards.forEach((card) => {
        card.removeEventListener("pointerenter", handlePointerMove);
        card.removeEventListener("pointermove", handlePointerMove);
        card.removeEventListener("pointerleave", handlePointerLeave);
        card.removeEventListener("pointercancel", handlePointerLeave);
        card.removeAttribute("data-depth-card");
        card.removeAttribute("data-scroll-entrance");
        clearTilt(card);
        card.style.removeProperty("--depth-stagger");
      });
      scrollReveals.forEach(clearScrollReveal);
      scenes.forEach(clearSceneDrift);
      animatedAreas.forEach((area) => area.classList.remove("motion-paused"));
      nav?.style.removeProperty("--page-progress");
    };
  }, []);

  return null;
}
