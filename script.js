document.documentElement.classList.add("js");

(() => {
  "use strict";

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (start, end, progress) => start + (end - start) * progress;
  const ACTIVATION_URL = "https://sso.bestlawyers.com/account/login";
  const easeOutCubic = (value) => 1 - Math.pow(1 - clamp(value), 3);
  const easeInOutCubic = (value) => {
    const t = clamp(value);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };
  const range = (progress, start, end) => clamp((progress - start) / (end - start));

  function initialize() {
    const body = document.body;
    const header = document.querySelector("[data-site-header]");
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileNavigation = document.querySelector("[data-mobile-navigation]");
    const pageProgress = document.querySelector("[data-page-progress]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const captureMode = new URLSearchParams(window.location.search).has("capture");

    if (captureMode) body.classList.add("capture-mode");

    function setHeaderState() {
      header?.classList.toggle("is-scrolled", window.scrollY > 10);
    }

    function closeMenu() {
      if (!menuButton || !mobileNavigation) return;
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
      mobileNavigation.hidden = true;
      body.classList.remove("menu-open");
    }

    menuButton?.addEventListener("click", () => {
      if (!mobileNavigation) return;
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      mobileNavigation.hidden = isOpen;
      body.classList.toggle("menu-open", !isOpen);
    });

    mobileNavigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    const revealTargets = document.querySelectorAll(
      "[data-reveal], [data-reveal-left], [data-reveal-right], [data-line-reveal], .hero-metrics-wrap"
    );

    if (prefersReducedMotion.matches || captureMode || !("IntersectionObserver" in window)) {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
      );

      revealTargets.forEach((element) => revealObserver.observe(element));
    }

    const counterflowTrack = document.querySelector("[data-counterflow]");
    const counterflowComposition = document.querySelector("[data-counterflow-composition]");
    const instantTrack = document.querySelector("[data-instant-track]");
    const instantLayout = instantTrack?.querySelector(".instant-layout");
    const comparisonTrack = document.querySelector("[data-comparison-track]");
    const comparisonStage = comparisonTrack?.querySelector(".comparison-stage");
    const profileStory = document.querySelector("[data-profile-story]");
    const profileGrid = profileStory?.querySelector(".profile-story-grid");
    const productProfile = document.querySelector("[data-product-profile]");
    const productProfileWrap = document.querySelector("[data-product-profile-wrap]");
    const paySection = document.querySelector("[data-pay-section]");
    const payHeadline = document.querySelector("[data-pay-headline]");
    const benefitsTrack = document.querySelector("[data-benefits-track]");
    const benefitsRail = document.querySelector("[data-benefits-rail]");
    const benefitsSticky = benefitsTrack?.querySelector(".benefits-sticky");
    const finalCta = document.querySelector("[data-final-cta]");
    const hero = document.querySelector("[data-hero]");
    const heroStage = document.querySelector("[data-hero-stage]");
    const navLinks = [...document.querySelectorAll("[data-nav-link]")];

    let metrics = {};
    let ticking = false;

    function getHeaderHeight() {
      return header?.offsetHeight || 0;
    }

    function getScrollMetrics(element) {
      if (!element) return { top: 0, distance: 1 };
      const rect = element.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      const viewportHeight = window.innerHeight - getHeaderHeight();
      return {
        top: top - getHeaderHeight(),
        distance: Math.max(1, element.offsetHeight - viewportHeight)
      };
    }

    function getOffsetScrollMetrics(element, startViewportRatio, endViewportRatio) {
      if (!element) return { top: 0, distance: 1 };
      const rect = element.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      const viewportHeight = window.innerHeight - getHeaderHeight();
      const start = top - viewportHeight * startViewportRatio;
      const end = top + element.offsetHeight - viewportHeight * endViewportRatio;

      return {
        top: start,
        distance: Math.max(1, end - start)
      };
    }

    function refreshMetrics() {
      const payRevealTarget = window.innerWidth <= 820 ? payHeadline : paySection;
      const payRevealEnd = window.innerWidth <= 820 ? 0.38 : 0.8;

      metrics = {
        hero: {
          top: 0,
          distance: Math.max(1, (hero?.offsetHeight || window.innerHeight) - getHeaderHeight())
        },
        counterflow: getScrollMetrics(counterflowTrack),
        instant: getScrollMetrics(instantTrack),
        comparison: getScrollMetrics(comparisonTrack),
        profile: getScrollMetrics(profileStory),
        pay: getOffsetScrollMetrics(payRevealTarget, 0.7, payRevealEnd),
        benefits: getScrollMetrics(benefitsTrack),
        finalCta: getScrollMetrics(finalCta)
      };

      if (benefitsTrack && benefitsRail && benefitsSticky && window.innerWidth > 820 && !captureMode) {
        const sidePadding = window.innerWidth * 0.16;
        const maxScroll = Math.max(0, benefitsRail.scrollWidth - window.innerWidth + sidePadding);
        benefitsTrack.style.height = `${Math.ceil(maxScroll + window.innerHeight * 1.08)}px`;
        metrics.benefits = getScrollMetrics(benefitsTrack);
        metrics.benefits.maxScroll = maxScroll;
      } else if (benefitsTrack) {
        benefitsTrack.style.removeProperty("height");
        metrics.benefits.maxScroll = 0;
      }

      updateScrollEffects();
    }

    function progressFor(metric) {
      return clamp((window.scrollY - metric.top) / metric.distance);
    }

    function setProperty(element, name, value) {
      element?.style.setProperty(name, value);
    }

    function updateCounterflow() {
      if (!counterflowTrack || !counterflowComposition || window.innerWidth <= 820 || captureMode) return;
      const progress = progressFor(metrics.counterflow);
      const entrance = easeOutCubic(range(progress, 0.02, 0.62));
      const opacity = easeOutCubic(range(progress, 0.03, 0.34));
      const focus = easeInOutCubic(range(progress, 0.48, 0.72));

      setProperty(counterflowComposition, "--cf-y", `${lerp(-window.innerHeight * 0.65, 0, entrance).toFixed(2)}px`);
      setProperty(counterflowComposition, "--cf-opacity", opacity.toFixed(3));
      setProperty(counterflowComposition, "--cf-scale", lerp(0.985, 1, entrance).toFixed(4));
      setProperty(counterflowComposition, "--cf-blur", `${lerp(6, 0, entrance).toFixed(2)}px`);
      setProperty(counterflowComposition, "--cf-focus", focus.toFixed(3));
    }

    function updateInstant() {
      if (!instantTrack || !instantLayout || window.innerWidth <= 820 || captureMode) return;
      const progress = progressFor(metrics.instant);
      const pageEntrance = easeOutCubic(range(progress, 0, 0.3));
      const headlineEntrance = easeOutCubic(range(progress, 0.13, 0.42));
      const wordEntrance = easeOutCubic(range(progress, 0.17, 0.45));
      const solutionEntrance = easeOutCubic(range(progress, 0.5, 0.82));
      const statExit = easeInOutCubic(range(progress, 0.62, 0.9));

      setProperty(instantLayout, "--pages-y", `${lerp(120, -18, pageEntrance).toFixed(2)}px`);
      setProperty(instantLayout, "--headline-opacity", headlineEntrance.toFixed(3));
      setProperty(instantLayout, "--word-x", `${lerp(-72, 0, wordEntrance).toFixed(2)}px`);
      setProperty(instantLayout, "--word-y", `${lerp(90, 0, wordEntrance).toFixed(2)}px`);
      setProperty(instantLayout, "--word-scale", lerp(0.72, 1, wordEntrance).toFixed(4));
      setProperty(instantLayout, "--word-blur", `${lerp(8, 0, wordEntrance).toFixed(2)}px`);
      setProperty(instantLayout, "--solution-opacity", solutionEntrance.toFixed(3));
      setProperty(instantLayout, "--solution-y", `${lerp(54, 0, solutionEntrance).toFixed(2)}px`);
      setProperty(instantLayout, "--stat-opacity", lerp(1, 0.34, statExit).toFixed(3));
      setProperty(instantLayout, "--stat-y", `${lerp(0, -22, statExit).toFixed(2)}px`);
    }

    function updateComparison() {
      if (!comparisonTrack || !comparisonStage || window.innerWidth <= 820 || captureMode) return;
      const progress = progressFor(metrics.comparison);
      const entrance = easeOutCubic(range(progress, 0.04, 0.58));
      const opacity = easeOutCubic(range(progress, 0.02, 0.25));

      setProperty(comparisonStage, "--free-y", `${lerp(window.innerHeight * 0.48, 0, entrance).toFixed(2)}px`);
      setProperty(comparisonStage, "--enhanced-y", `${lerp(-window.innerHeight * 0.48, 0, entrance).toFixed(2)}px`);
      setProperty(comparisonStage, "--comparison-opacity", opacity.toFixed(3));
    }

    function updateProfileStory() {
      if (!profileStory || !profileGrid || window.innerWidth <= 820 || captureMode) return;
      const progress = progressFor(metrics.profile);
      const browserEntrance = easeOutCubic(range(progress, 0, 0.18));
      const ctaEmphasis = easeInOutCubic(range(progress, 0.34, 0.48)) * (1 - range(progress, 0.48, 0.6));
      const listingExit = easeInOutCubic(range(progress, 0.42, 0.56));
      const profileEntrance = easeOutCubic(range(progress, 0.5, 0.64));
      const secondEntrance = easeOutCubic(range(progress, 0.52, 0.72));
      const profileScroll = easeInOutCubic(range(progress, 0.62, 0.98));
      const viewportHeight = productProfileWrap?.clientHeight || 0;
      const profileHeight = productProfile?.offsetHeight || 0;
      const maxProfileScroll = Math.max(0, profileHeight - viewportHeight + 24);

      setProperty(profileGrid, "--browser-scale", lerp(0.96, 1, browserEntrance).toFixed(4));
      setProperty(profileGrid, "--listing-opacity", (1 - listingExit).toFixed(3));
      setProperty(profileGrid, "--listing-scale", lerp(1, 1.04, listingExit).toFixed(4));
      setProperty(profileGrid, "--listing-cta-glow", ctaEmphasis.toFixed(3));
      setProperty(profileGrid, "--profile-opacity", profileEntrance.toFixed(3));
      setProperty(profileGrid, "--second-opacity", secondEntrance.toFixed(3));
      setProperty(profileGrid, "--second-y", `${lerp(44, 0, secondEntrance).toFixed(2)}px`);
      setProperty(profileGrid, "--profile-y", `${-maxProfileScroll * profileScroll}px`);
    }

    function updateBenefits() {
      if (!benefitsTrack || !benefitsRail || window.innerWidth <= 820 || captureMode) return;
      const progress = progressFor(metrics.benefits);
      const maxScroll = metrics.benefits.maxScroll || 0;
      benefitsRail.style.transform = `translate3d(${-maxScroll * progress}px, 0, 0)`;
    }

    function updatePayHeadlineReveal() {
      if (!paySection || !payHeadline || captureMode) return;
      const progress = progressFor(metrics.pay);
      const reveal = lerp(0, 100, progress);
      const bottomInset = 100 - reveal;
      setProperty(payHeadline, "--pay-headline-clip", `${bottomInset.toFixed(2)}%`);
    }

    function updateHero() {
      if (!hero || prefersReducedMotion.matches || captureMode) return;
      const progress = progressFor(metrics.hero);
      const earlyExit = easeInOutCubic(range(progress, 0.2, 0.46));
      const finalHold = easeInOutCubic(range(progress, 0.38, 0.58));
      const resolutionExit = easeInOutCubic(range(progress, 0.48, 0.68));
      const resultClear = easeInOutCubic(range(progress, 0.34, 0.64));
      const searchExit = easeInOutCubic(range(progress, 0.22, 0.72));
      const mobile = window.innerWidth <= 820;

      setProperty(hero, "--hero-copy-y", `${lerp(0, mobile ? -14 : -15, earlyExit).toFixed(2)}px`);
      setProperty(hero, "--hero-copy-opacity", lerp(1, 0.18, easeInOutCubic(range(progress, 0.58, 0.86))).toFixed(3));
      setProperty(hero, "--hero-search-y", `${lerp(0, mobile ? -16 : -50, searchExit).toFixed(2)}px`);
      setProperty(hero, "--hero-search-opacity", lerp(1, 0, easeInOutCubic(range(progress, 0.5, 0.82))).toFixed(3));
      setProperty(hero, "--hero-search-scale", lerp(1, mobile ? 0.995 : 0.985, searchExit).toFixed(4));
      setProperty(hero, "--hero-early-opacity", lerp(1, 0, earlyExit).toFixed(3));
      setProperty(hero, "--hero-final-opacity", lerp(1, 0, finalHold).toFixed(3));
      setProperty(hero, "--hero-final-y", `${lerp(0, -18, finalHold).toFixed(2)}px`);
      setProperty(hero, "--hero-resolution-opacity", lerp(1, 0, resolutionExit).toFixed(3));
      setProperty(hero, "--hero-resolution-y", `${lerp(0, -26, resolutionExit).toFixed(2)}px`);

      if (heroStage) {
        setProperty(heroStage, "--hero-results-x", `${lerp(0, mobile ? 0 : -18, resultClear).toFixed(2)}px`);
        setProperty(heroStage, "--hero-results-y", `${lerp(0, mobile ? 18 : 30, resultClear).toFixed(2)}px`);
        setProperty(heroStage, "--hero-results-opacity", lerp(1, 0, easeInOutCubic(range(progress, 0.42, 0.68))).toFixed(3));
        setProperty(heroStage, "--hero-results-scale", lerp(1, 0.985, resultClear).toFixed(4));
      }
    }

    function updateFinalCta() {
      if (!finalCta || captureMode) return;
      const progress = progressFor(metrics.finalCta);
      const descend = easeInOutCubic(range(progress, 0, 0.25));
      const release = easeInOutCubic(range(progress, 0.88, 1));
      const headlineY = lerp(-window.innerHeight * 0.32, 0, descend) + lerp(0, window.innerHeight * 0.62, release);
      const eyebrow = easeOutCubic(range(progress, 0.14, 0.25)) * (1 - range(progress, 0.9, 1));
      const argumentIn = easeOutCubic(range(progress, 0.3, 0.52));
      const argumentOut = easeInOutCubic(range(progress, 0.56, 0.68));
      const argumentOpacity = argumentIn * (1 - argumentOut);
      const mobile = window.innerWidth <= 820;
      const argumentX = argumentOut > 0
        ? lerp(0, mobile ? -42 : -window.innerWidth * 0.16, argumentOut)
        : lerp(mobile ? 42 : window.innerWidth * 0.18, 0, argumentIn);
      const actionIn = easeOutCubic(range(progress, 0.6, 0.76));
      const actionOut = easeInOutCubic(range(progress, 0.88, 1));
      const rule = easeInOutCubic(range(progress, 0.25, 0.34)) * (1 - range(progress, 0.9, 1));

      setProperty(finalCta, "--final-headline-y", `${headlineY.toFixed(2)}px`);
      setProperty(finalCta, "--final-headline-opacity", lerp(1, 0, range(progress, 0.96, 1)).toFixed(3));
      setProperty(finalCta, "--final-eyebrow-opacity", eyebrow.toFixed(3));
      setProperty(finalCta, "--final-eyebrow-x", `${lerp(mobile ? -18 : -34, 0, eyebrow).toFixed(2)}px`);
      setProperty(finalCta, "--final-rule-scale", rule.toFixed(3));
      setProperty(finalCta, "--final-argument-opacity", argumentOpacity.toFixed(3));
      setProperty(finalCta, "--final-argument-x", `${argumentX.toFixed(2)}px`);
      setProperty(finalCta, "--final-argument-y", `${lerp(30, -8, argumentIn).toFixed(2)}px`);
      setProperty(finalCta, "--final-action-opacity", (actionIn * (1 - actionOut)).toFixed(3));
      setProperty(finalCta, "--final-action-y", `${(lerp(window.innerHeight * 0.14, 0, actionIn) + lerp(0, window.innerHeight * 0.52, actionOut)).toFixed(2)}px`);
      setProperty(finalCta, "--final-note-opacity", (easeOutCubic(range(progress, 0.66, 0.8)) * (1 - actionOut)).toFixed(3));
      setProperty(finalCta, "--final-note-y", `${(lerp(18, 0, easeOutCubic(range(progress, 0.66, 0.8))) + lerp(0, window.innerHeight * 0.48, actionOut)).toFixed(2)}px`);
    }

    function updatePageProgress() {
      if (!pageProgress) return;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      pageProgress.style.transform = `scaleX(${clamp(window.scrollY / scrollable)})`;
    }

    function updateActiveNavigation() {
      if (!navLinks.length) return;
      const marker = window.scrollY + getHeaderHeight() + window.innerHeight * 0.24;
      let activeId = "";

      navLinks.forEach((link) => {
        const id = link.getAttribute("href")?.replace("#", "");
        const section = id ? document.getElementById(id) : null;
        if (section && section.offsetTop <= marker) activeId = id;
      });

      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
      });
    }

    function updateScrollEffects() {
      ticking = false;
      setHeaderState();
      updatePageProgress();
      updateActiveNavigation();

      if (prefersReducedMotion.matches || captureMode) {
        setProperty(payHeadline, "--pay-headline-clip", "100%");
        if (hero) {
          setProperty(hero, "--hero-copy-y", "0px");
          setProperty(hero, "--hero-copy-opacity", "1");
          setProperty(hero, "--hero-search-y", "0px");
          setProperty(hero, "--hero-search-opacity", "1");
          setProperty(hero, "--hero-search-scale", "1");
          setProperty(hero, "--hero-early-opacity", "1");
          setProperty(hero, "--hero-final-opacity", "1");
          setProperty(hero, "--hero-final-y", "0px");
          setProperty(hero, "--hero-resolution-opacity", "1");
          setProperty(hero, "--hero-resolution-y", "0px");
        }
        if (finalCta) {
          setProperty(finalCta, "--final-headline-y", "0px");
          setProperty(finalCta, "--final-headline-opacity", "1");
          setProperty(finalCta, "--final-eyebrow-opacity", "1");
          setProperty(finalCta, "--final-eyebrow-x", "0px");
          setProperty(finalCta, "--final-rule-scale", "1");
          setProperty(finalCta, "--final-argument-opacity", "0");
          setProperty(finalCta, "--final-argument-x", "0px");
          setProperty(finalCta, "--final-argument-y", "0px");
          setProperty(finalCta, "--final-action-opacity", "1");
          setProperty(finalCta, "--final-action-y", "0px");
          setProperty(finalCta, "--final-note-opacity", "1");
          setProperty(finalCta, "--final-note-y", "0px");
        }
        return;
      }
      updateHero();
      updateCounterflow();
      updateInstant();
      updateComparison();
      updateProfileStory();
      updatePayHeadlineReveal();
      updateBenefits();
      updateFinalCta();
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateScrollEffects);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1040) closeMenu();
      window.clearTimeout(refreshMetrics.resizeTimer);
      refreshMetrics.resizeTimer = window.setTimeout(refreshMetrics, 100);
    });

    prefersReducedMotion.addEventListener?.("change", refreshMetrics);

    const testimonialViewport = document.querySelector("[data-testimonial-viewport]");
    const testimonialPrev = document.querySelector("[data-testimonial-prev]");
    const testimonialNext = document.querySelector("[data-testimonial-next]");

    function moveTestimonials(direction) {
      if (!testimonialViewport) return;
      const card = testimonialViewport.querySelector(".testimonial-card");
      const amount = (card?.getBoundingClientRect().width || 390) + 18;
      testimonialViewport.scrollBy({ left: direction * amount, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
    }

    testimonialPrev?.addEventListener("click", () => moveTestimonials(-1));
    testimonialNext?.addEventListener("click", () => moveTestimonials(1));

    document.querySelectorAll("[data-activation-link]").forEach((link) => {
      link.href = ACTIVATION_URL;
      link.addEventListener("click", () => {
        window.dispatchEvent(
          new CustomEvent("blpe:cta", {
            detail: {
              placement: link.closest("header") ? "header" : link.closest(".profile-story") ? "profile-story" : "final"
            }
          })
        );
      });
    });

    const imagePromises = [...document.images].map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    });

    Promise.all(imagePromises).then(refreshMetrics);
    refreshMetrics();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
