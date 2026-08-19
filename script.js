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

    function formatCount(value, decimals) {
      return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
    }

    function animateMetricCounts(container) {
      if (!container || container.dataset.countsAnimated === "true") return;
      container.dataset.countsAnimated = "true";

      const counters = [...container.querySelectorAll("[data-count-up]")];
      const duration = 1200;
      const ease = (value) => 1 - Math.pow(1 - value, 3);

      counters.forEach((counter, index) => {
        const target = Number(counter.dataset.countTo || counter.textContent);
        const decimals = Number(counter.dataset.countDecimals || 0);
        const delay = index * 90;
        let startTime;

        function setFinalValue() {
          counter.textContent = formatCount(target, decimals);
        }

        if (prefersReducedMotion.matches || captureMode || Number.isNaN(target)) {
          setFinalValue();
          return;
        }

        function updateCount(timestamp) {
          if (!startTime) startTime = timestamp + delay;
          const progress = clamp((timestamp - startTime) / duration);
          const current = target * ease(progress);
          counter.textContent = formatCount(current, decimals);

          if (progress < 1) {
            window.requestAnimationFrame(updateCount);
          } else {
            setFinalValue();
          }
        }

        window.requestAnimationFrame(updateCount);
      });
    }

    const revealTargets = document.querySelectorAll(
      "[data-reveal], [data-reveal-left], [data-reveal-right], [data-line-reveal], .hero-metrics-wrap"
    );

    if (prefersReducedMotion.matches || captureMode || !("IntersectionObserver" in window)) {
      revealTargets.forEach((element) => {
        element.classList.add("is-visible");
        if (element.classList.contains("hero-metrics-wrap")) animateMetricCounts(element);
      });
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            if (entry.target.classList.contains("hero-metrics-wrap")) animateMetricCounts(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
      );

      revealTargets.forEach((element) => revealObserver.observe(element));
    }

    const counterflowTrack = document.querySelector("[data-counterflow]");
    const counterflowComposition = document.querySelector("[data-counterflow-composition]");
    const recognitionScene = document.querySelector("[data-recognition-scene]");
    const freeListingScene = document.querySelector("[data-free-listing-scene]");
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
    const searchDemo = document.querySelector("[data-search-demo]");
    const navLinks = [...document.querySelectorAll("[data-nav-link]")];

    let metrics = {};
    let ticking = false;
    let heroDemoStarted = false;

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
        recognition: getScrollMetrics(recognitionScene),
        freeListing: getScrollMetrics(freeListingScene),
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

    function dispatchHeroDemoEvent(name, extra = {}) {
      window.dispatchEvent(
        new CustomEvent("blpe:hero-search-demo", {
          detail: {
            event: name,
            ...extra
          }
        })
      );
    }

    function initializeHeroSearchDemo() {
      if (!searchDemo || !heroStage || heroDemoStarted) return;
      heroDemoStarted = true;

      const fields = {
        country: searchDemo.querySelector('[data-demo-field="country"]'),
        state: searchDemo.querySelector('[data-demo-field="state"]'),
        city: searchDemo.querySelector('[data-demo-field="city"]'),
        practice: searchDemo.querySelector('[data-demo-field="practice"]')
      };
      const checks = {
        lawyers: searchDemo.querySelector('[data-demo-check="lawyers"]'),
        firms: searchDemo.querySelector('[data-demo-check="firms"]')
      };
      const submit = searchDemo.querySelector("[data-demo-submit]");
      const timers = new Set();
      let interrupted = false;

      const values = {
        country: "United States",
        state: "New York",
        city: "New York",
        practice: "Personal Injury Litigation - Plaintiffs"
      };

      function setTimer(callback, delay) {
        const timer = window.setTimeout(() => {
          timers.delete(timer);
          callback();
        }, delay);
        timers.add(timer);
      }

      function clearTimers() {
        timers.forEach((timer) => window.clearTimeout(timer));
        timers.clear();
      }

      function setFieldOpen(name, isOpen) {
        const field = fields[name];
        if (!field) return;
        field.classList.toggle("is-active", isOpen);
        field.classList.toggle("is-open", isOpen);
        field.querySelector("button")?.setAttribute("aria-expanded", String(isOpen));
      }

      function selectField(name) {
        const field = fields[name];
        if (!field) return;
        field.querySelector("[data-demo-value]").textContent = values[name];
        field.querySelector("[data-demo-option]")?.classList.add("is-selected");
        field.classList.add("is-selected");
      }

      function selectCheck(name) {
        const check = checks[name];
        if (!check) return;
        check.classList.add("is-active");
        check.querySelector("input").checked = true;
        setTimer(() => {
          check.classList.add("is-checked");
          check.classList.remove("is-active");
        }, 120);
      }

      function showCompletedState() {
        Object.keys(fields).forEach((name) => {
          setFieldOpen(name, false);
          selectField(name);
        });
        Object.keys(checks).forEach((name) => {
          const check = checks[name];
          check?.classList.add("is-checked");
          const input = check?.querySelector("input");
          if (input) input.checked = true;
        });
        submit?.classList.remove("is-engaged");
        heroStage.classList.add("hero-shell-ready");
        heroStage.classList.add("demo-results-visible");
        searchDemo.dataset.demoState = "complete";
      }

      function completeImmediately(reason) {
        clearTimers();
        interrupted = true;
        showCompletedState();
        if (reason) dispatchHeroDemoEvent(reason);
      }

      searchDemo.addEventListener(
        "pointerdown",
        () => {
          if (!interrupted && searchDemo.dataset.demoState !== "complete") {
            completeImmediately("hero_search_demo_interrupted");
          }
        },
        { once: true }
      );

      if (prefersReducedMotion.matches || captureMode) {
        showCompletedState();
        dispatchHeroDemoEvent("hero_search_demo_completed", { reducedMotion: prefersReducedMotion.matches });
        return;
      }

      const steps = [
        { state: "countryOpening", delay: 850, run: () => setFieldOpen("country", true) },
        { state: "countrySelected", delay: 520, event: "hero_search_demo_country_selected", run: () => selectField("country") },
        { state: "countryClosing", delay: 260, run: () => setFieldOpen("country", false) },
        { state: "stateOpening", delay: 260, run: () => setFieldOpen("state", true) },
        { state: "stateSelected", delay: 500, event: "hero_search_demo_state_selected", run: () => selectField("state") },
        { state: "stateClosing", delay: 240, run: () => setFieldOpen("state", false) },
        { state: "cityOpening", delay: 240, run: () => setFieldOpen("city", true) },
        { state: "citySelected", delay: 500, event: "hero_search_demo_city_selected", run: () => selectField("city") },
        { state: "cityClosing", delay: 240, run: () => setFieldOpen("city", false) },
        { state: "practiceOpening", delay: 260, run: () => setFieldOpen("practice", true) },
        { state: "practiceSelected", delay: 620, event: "hero_search_demo_practice_selected", run: () => selectField("practice") },
        { state: "practiceClosing", delay: 280, run: () => setFieldOpen("practice", false) },
        { state: "lawyersSelected", delay: 260, run: () => selectCheck("lawyers") },
        { state: "firmsSelected", delay: 260, event: "hero_search_demo_filters_selected", run: () => selectCheck("firms") },
        { state: "searchEngaged", delay: 420, event: "hero_search_demo_submitted", run: () => submit?.classList.add("is-engaged") },
        { state: "searchSettled", delay: 280, run: () => submit?.classList.remove("is-engaged") },
        { state: "resultsEntering", delay: 80, event: "hero_search_demo_results_visible", run: () => heroStage.classList.add("demo-results-visible") },
        { state: "complete", delay: 760, event: "hero_search_demo_completed", run: () => showCompletedState() }
      ];

      dispatchHeroDemoEvent("hero_search_demo_started");
      setTimer(() => heroStage.classList.add("hero-shell-ready"), 1220);

      let index = 0;
      function runNextStep() {
        if (interrupted) return;
        const step = steps[index];
        if (!step) return;
        setTimer(() => {
          if (interrupted) return;
          searchDemo.dataset.demoState = step.state;
          step.run();
          if (step.event) dispatchHeroDemoEvent(step.event);
          index += 1;
          runNextStep();
        }, step.delay);
      }

      runNextStep();
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

    function updateRecognitionScene() {
      if (!recognitionScene || captureMode) return;
      const progress = progressFor(metrics.recognition);
      const mobile = window.innerWidth <= 820;
      const travelScale = mobile ? 0.72 : window.innerWidth <= 1040 ? 0.82 : 1;
      const viewportHeight = window.innerHeight;
      const travel = (value) => viewportHeight * value * travelScale;

      const leftIn = range(progress, 0, 0.18);
      const leftDrift = range(progress, 0.18, 0.66);
      const leftExit = range(progress, 0.78, 1);
      const leftY = lerp(viewportHeight * 0.07 * travelScale, 0, leftIn)
        + lerp(0, -viewportHeight * 0.04 * travelScale, leftDrift)
        + lerp(0, -viewportHeight * 0.09 * travelScale, leftExit);
      const leftOpacity = lerp(0.75, 1, easeOutCubic(leftIn)) * lerp(1, 0, easeInOutCubic(leftExit));

      const ruleIn = easeOutCubic(range(progress, 0.06, 0.18));
      const ruleOut = easeInOutCubic(range(progress, 0.92, 1));

      const s1In = range(progress, 0.12, 0.34);
      const s2In = range(progress, 0.28, 0.50);
      const s3In = range(progress, 0.43, 0.66);
      const s1Out = range(progress, 0.78, 1);
      const s2Out = range(progress, 0.78, 1);
      const s3Out = range(progress, 0.78, 1);

      const exitFade = range(progress, 0.78, 0.92);
      const statementOpacity = (start, end) => easeOutCubic(range(progress, start, end)) * lerp(1, 0, easeInOutCubic(exitFade));

      setProperty(recognitionScene, "--recognition-copy-y", `${leftY.toFixed(2)}px`);
      setProperty(recognitionScene, "--recognition-copy-opacity", leftOpacity.toFixed(3));
      setProperty(recognitionScene, "--recognition-emphasis", easeOutCubic(range(progress, 0.66, 0.74)).toFixed(3));
      setProperty(recognitionScene, "--recognition-top-rule-scale", (ruleIn * lerp(1, 0, ruleOut)).toFixed(3));
      setProperty(recognitionScene, "--recognition-top-rule-opacity", lerp(0.42, 1, ruleIn).toFixed(3));

      setProperty(recognitionScene, "--recognition-s1-x", `${lerp(18, 0, s1In).toFixed(2)}px`);
      setProperty(recognitionScene, "--recognition-s1-y", `${(travel(0.42) * (1 - s1In) + travel(-0.28) * easeInOutCubic(s1Out)).toFixed(2)}px`);
      setProperty(recognitionScene, "--recognition-s1-opacity", statementOpacity(0.12, 0.25).toFixed(3));
      setProperty(recognitionScene, "--recognition-s1-scale", (lerp(0.985, 1, s1In)).toFixed(4));
      setProperty(recognitionScene, "--recognition-s1-line", easeOutCubic(range(progress, 0.34, 0.39)).toFixed(3));

      setProperty(recognitionScene, "--recognition-s2-x", `${lerp(13, 0, s2In).toFixed(2)}px`);
      setProperty(recognitionScene, "--recognition-s2-y", `${(travel(0.52) * (1 - s2In) + travel(-0.35) * easeInOutCubic(s2Out)).toFixed(2)}px`);
      setProperty(recognitionScene, "--recognition-s2-opacity", statementOpacity(0.28, 0.42).toFixed(3));
      setProperty(recognitionScene, "--recognition-s2-scale", (lerp(0.982, 1, s2In)).toFixed(4));
      setProperty(recognitionScene, "--recognition-s2-line", easeOutCubic(range(progress, 0.50, 0.55)).toFixed(3));

      setProperty(recognitionScene, "--recognition-s3-x", `${lerp(8, 0, s3In).toFixed(2)}px`);
      setProperty(recognitionScene, "--recognition-s3-y", `${(travel(0.62) * (1 - s3In) + travel(-0.44) * easeInOutCubic(s3Out)).toFixed(2)}px`);
      setProperty(recognitionScene, "--recognition-s3-opacity", statementOpacity(0.43, 0.58).toFixed(3));
      setProperty(recognitionScene, "--recognition-s3-scale", (lerp(0.975, 1, s3In)).toFixed(4));
      setProperty(recognitionScene, "--recognition-s3-line", easeOutCubic(range(progress, 0.66, 0.71)).toFixed(3));
    }

    function updateInstant() {
      if (!instantTrack || !instantLayout || window.innerWidth <= 820 || captureMode) return;
      const progress = progressFor(metrics.instant);
      const pageEntrance = easeOutCubic(range(progress, 0, 0.3));
      const layerEntrance = easeOutCubic(range(progress, 0.02, 0.46));
      const headlineEntrance = easeOutCubic(range(progress, 0.13, 0.42));
      const wordEntrance = easeOutCubic(range(progress, 0.17, 0.45));
      const solutionEntrance = easeOutCubic(range(progress, 0.5, 0.82));
      const statExit = easeInOutCubic(range(progress, 0.62, 0.9));

      setProperty(instantLayout, "--pages-y", `${lerp(120, -18, pageEntrance).toFixed(2)}px`);
      setProperty(instantLayout, "--pages-opacity", lerp(0.34, 1, layerEntrance).toFixed(3));
      setProperty(instantLayout, "--visibility-back-y", `${lerp(84, 0, easeOutCubic(range(progress, 0.02, 0.34))).toFixed(2)}px`);
      setProperty(instantLayout, "--visibility-mid-y", `${lerp(128, 0, easeOutCubic(range(progress, 0.1, 0.42))).toFixed(2)}px`);
      setProperty(instantLayout, "--visibility-front-y", `${lerp(172, 0, easeOutCubic(range(progress, 0.18, 0.52))).toFixed(2)}px`);
      setProperty(instantLayout, "--visibility-back-rotate", `${lerp(-9, -4, layerEntrance).toFixed(2)}deg`);
      setProperty(instantLayout, "--visibility-mid-rotate", `${lerp(8, 3, layerEntrance).toFixed(2)}deg`);
      setProperty(instantLayout, "--visibility-front-rotate", `${lerp(-5, -.8, layerEntrance).toFixed(2)}deg`);
      setProperty(instantLayout, "--visibility-button-scale", lerp(0.84, 1, easeOutCubic(range(progress, 0.24, 0.44))).toFixed(4));
      setProperty(instantLayout, "--headline-opacity", lerp(0.18, 1, headlineEntrance).toFixed(3));
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
      const headlineReveal = progress > 0.01 ? 100 : 0;
      const bottomInset = 100 - headlineReveal;
      setProperty(payHeadline, "--pay-headline-clip", `${bottomInset.toFixed(2)}%`);
      setProperty(paySection, "--pay-headline-accent", "rgb(235,70,74)");
    }

    function updateFreeListingScene() {
      if (!freeListingScene || captureMode) return;
      const progress = progressFor(metrics.freeListing);
      const mobile = window.innerWidth <= 820;
      const headerIn = easeOutCubic(range(progress, 0.12, 0.26));
      const bodyIn = easeOutCubic(range(progress, 0.22, 0.42));
      const cardIn = easeOutCubic(range(progress, 0.36, 0.52));
      const headingIn = easeOutCubic(range(progress, 0, 0.12));
      const headingOut = easeInOutCubic(range(progress, 0.72, 0.88));
      const cardOut = easeInOutCubic(range(progress, 0.68, 0.78));
      const headerOut = easeInOutCubic(range(progress, 0.76, 0.88));
      const bodyOut = easeInOutCubic(range(progress, 0.84, 1));
      const cardSettle = Math.sin(range(progress, 0.52, 0.62) * Math.PI) * 0.012;

      const headerStartY = mobile ? -26 : -40;
      const bodyStartY = mobile ? 42 : 70;
      const cardStartX = mobile ? 54 : 100;
      const cardExitX = mobile ? 78 : 140;
      const cardExitY = mobile ? -12 : -20;
      const headerExitY = mobile ? -48 : -80;
      const bodyExitY = mobile ? 56 : 90;
      const headingExitY = mobile ? -24 : -40;

      setProperty(freeListingScene, "--free-heading-opacity", (headingIn * (1 - headingOut)).toFixed(3));
      setProperty(freeListingScene, "--free-heading-y", `${(lerp(18, 0, headingIn) + lerp(0, headingExitY, headingOut)).toFixed(2)}px`);
      setProperty(freeListingScene, "--free-header-opacity", (headerIn * (1 - headerOut)).toFixed(3));
      setProperty(freeListingScene, "--free-header-y", `${(lerp(headerStartY, 0, headerIn) + lerp(0, headerExitY, headerOut)).toFixed(2)}px`);
      setProperty(freeListingScene, "--free-header-scale", lerp(0.985, 1, headerIn).toFixed(4));
      setProperty(freeListingScene, "--free-body-opacity", (bodyIn * (1 - bodyOut)).toFixed(3));
      setProperty(freeListingScene, "--free-body-y", `${(lerp(bodyStartY, 0, bodyIn) + lerp(0, bodyExitY, bodyOut)).toFixed(2)}px`);
      setProperty(freeListingScene, "--free-body-scale", (lerp(0.99, 1, bodyIn) + lerp(0, -0.015, bodyOut)).toFixed(4));
      setProperty(freeListingScene, "--free-card-opacity", (cardIn * (1 - cardOut)).toFixed(3));
      setProperty(freeListingScene, "--free-card-x", `${(lerp(cardStartX, 0, cardIn) + lerp(0, cardExitX, cardOut)).toFixed(2)}px`);
      setProperty(freeListingScene, "--free-card-y", `${(lerp(10, 0, cardIn) + lerp(0, cardExitY, cardOut)).toFixed(2)}px`);
      setProperty(freeListingScene, "--free-card-scale", (lerp(0.97, 1, cardIn) + cardSettle).toFixed(4));
      setProperty(freeListingScene, "--free-card-rotate", `${lerp(0, 2, cardOut).toFixed(2)}deg`);
    }

    function updateHero() {
      if (!hero || prefersReducedMotion.matches || captureMode) return;
      const progress = progressFor(metrics.hero);
      const cardExit = easeInOutCubic(range(progress, 0.06, 0.32));
      const cardFade = easeInOutCubic(range(progress, 0.24, 0.38));
      const searchExit = easeInOutCubic(range(progress, 0.34, 0.82));
      const searchFade = easeInOutCubic(range(progress, 0.58, 0.84));
      const textExit = easeInOutCubic(range(progress, 0.34, 0.66));
      const textFade = easeInOutCubic(range(progress, 0.5, 0.7));
      const mobile = window.innerWidth <= 820;

      setProperty(hero, "--hero-copy-y", `${lerp(0, mobile ? -560 : -760, textExit).toFixed(2)}px`);
      setProperty(hero, "--hero-copy-opacity", lerp(1, 0, textFade).toFixed(3));
      setProperty(hero, "--hero-search-x", "0px");
      setProperty(hero, "--hero-search-y", "0px");
      setProperty(hero, "--hero-search-opacity", lerp(1, 0, searchFade).toFixed(3));
      setProperty(hero, "--hero-search-scale", "1");
      setProperty(hero, "--hero-shell-x", "0px");
      setProperty(hero, "--hero-shell-y", `${lerp(0, mobile ? -620 : -900, searchExit).toFixed(2)}px`);
      setProperty(hero, "--hero-shell-opacity", lerp(1, 0, searchFade).toFixed(3));
      setProperty(hero, "--hero-shell-scale", "1");
      setProperty(hero, "--hero-line-one-x", "0px");
      setProperty(hero, "--hero-line-one-y", "0px");
      setProperty(hero, "--hero-line-one-opacity", "1");
      setProperty(hero, "--hero-line-two-x", "0px");
      setProperty(hero, "--hero-line-two-y", "0px");
      setProperty(hero, "--hero-line-two-opacity", "1");
      setProperty(hero, "--hero-line-three-x", "0px");
      setProperty(hero, "--hero-line-three-y", "0px");
      setProperty(hero, "--hero-line-three-opacity", "1");
      setProperty(hero, "--hero-line-four-x", "0px");
      setProperty(hero, "--hero-line-four-y", "0px");
      setProperty(hero, "--hero-line-four-opacity", "1");
      setProperty(hero, "--hero-early-opacity", "1");
      setProperty(hero, "--hero-final-opacity", "1");
      setProperty(hero, "--hero-final-y", "0px");
      setProperty(hero, "--hero-resolution-opacity", "1");
      setProperty(hero, "--hero-resolution-y", "0px");

      if (heroStage) {
        setProperty(heroStage, "--hero-results-x", "0px");
        setProperty(heroStage, "--hero-results-y", `${lerp(0, mobile ? -500 : -820, cardExit).toFixed(2)}px`);
        setProperty(heroStage, "--hero-results-opacity", lerp(1, 0, cardFade).toFixed(3));
        setProperty(heroStage, "--hero-results-scale", "1");
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
          setProperty(hero, "--hero-search-x", "0px");
          setProperty(hero, "--hero-search-y", "0px");
          setProperty(hero, "--hero-search-opacity", "1");
          setProperty(hero, "--hero-search-scale", "1");
          setProperty(hero, "--hero-shell-x", "0px");
          setProperty(hero, "--hero-shell-y", "0px");
          setProperty(hero, "--hero-shell-opacity", "1");
          setProperty(hero, "--hero-shell-scale", "1");
          setProperty(hero, "--hero-line-one-x", "0px");
          setProperty(hero, "--hero-line-one-y", "0px");
          setProperty(hero, "--hero-line-one-opacity", "1");
          setProperty(hero, "--hero-line-two-x", "0px");
          setProperty(hero, "--hero-line-two-y", "0px");
          setProperty(hero, "--hero-line-two-opacity", "1");
          setProperty(hero, "--hero-line-three-x", "0px");
          setProperty(hero, "--hero-line-three-y", "0px");
          setProperty(hero, "--hero-line-three-opacity", "1");
          setProperty(hero, "--hero-line-four-x", "0px");
          setProperty(hero, "--hero-line-four-y", "0px");
          setProperty(hero, "--hero-line-four-opacity", "1");
          setProperty(hero, "--hero-early-opacity", "1");
          setProperty(hero, "--hero-final-opacity", "1");
          setProperty(hero, "--hero-final-y", "0px");
          setProperty(hero, "--hero-resolution-opacity", "1");
          setProperty(hero, "--hero-resolution-y", "0px");
        }
        if (instantLayout) {
          setProperty(instantLayout, "--pages-y", "0px");
          setProperty(instantLayout, "--pages-opacity", "1");
          setProperty(instantLayout, "--visibility-back-y", "0px");
          setProperty(instantLayout, "--visibility-mid-y", "0px");
          setProperty(instantLayout, "--visibility-front-y", "0px");
          setProperty(instantLayout, "--visibility-back-rotate", "-4deg");
          setProperty(instantLayout, "--visibility-mid-rotate", "3deg");
          setProperty(instantLayout, "--visibility-front-rotate", "-.8deg");
          setProperty(instantLayout, "--visibility-button-scale", "1");
          setProperty(instantLayout, "--headline-opacity", "1");
          setProperty(instantLayout, "--word-x", "0px");
          setProperty(instantLayout, "--word-y", "0px");
          setProperty(instantLayout, "--word-scale", "1");
          setProperty(instantLayout, "--word-blur", "0px");
          setProperty(instantLayout, "--solution-opacity", "1");
          setProperty(instantLayout, "--solution-y", "0px");
          setProperty(instantLayout, "--stat-opacity", "1");
          setProperty(instantLayout, "--stat-y", "0px");
        }
        if (recognitionScene) {
          setProperty(recognitionScene, "--recognition-copy-y", "0px");
          setProperty(recognitionScene, "--recognition-copy-opacity", "1");
          setProperty(recognitionScene, "--recognition-emphasis", "1");
          setProperty(recognitionScene, "--recognition-top-rule-scale", "1");
          setProperty(recognitionScene, "--recognition-top-rule-opacity", "1");
          setProperty(recognitionScene, "--recognition-s1-x", "0px");
          setProperty(recognitionScene, "--recognition-s1-y", "0px");
          setProperty(recognitionScene, "--recognition-s1-opacity", "1");
          setProperty(recognitionScene, "--recognition-s1-scale", "1");
          setProperty(recognitionScene, "--recognition-s1-line", "1");
          setProperty(recognitionScene, "--recognition-s2-x", "0px");
          setProperty(recognitionScene, "--recognition-s2-y", "0px");
          setProperty(recognitionScene, "--recognition-s2-opacity", "1");
          setProperty(recognitionScene, "--recognition-s2-scale", "1");
          setProperty(recognitionScene, "--recognition-s2-line", "1");
          setProperty(recognitionScene, "--recognition-s3-x", "0px");
          setProperty(recognitionScene, "--recognition-s3-y", "0px");
          setProperty(recognitionScene, "--recognition-s3-opacity", "1");
          setProperty(recognitionScene, "--recognition-s3-scale", "1");
          setProperty(recognitionScene, "--recognition-s3-line", "1");
        }
        if (freeListingScene) {
          setProperty(freeListingScene, "--free-heading-opacity", "1");
          setProperty(freeListingScene, "--free-heading-y", "0px");
          setProperty(freeListingScene, "--free-header-opacity", "1");
          setProperty(freeListingScene, "--free-header-y", "0px");
          setProperty(freeListingScene, "--free-header-scale", "1");
          setProperty(freeListingScene, "--free-body-opacity", "1");
          setProperty(freeListingScene, "--free-body-y", "0px");
          setProperty(freeListingScene, "--free-body-scale", "1");
          setProperty(freeListingScene, "--free-card-opacity", "1");
          setProperty(freeListingScene, "--free-card-x", "0px");
          setProperty(freeListingScene, "--free-card-y", "0px");
          setProperty(freeListingScene, "--free-card-scale", "1");
          setProperty(freeListingScene, "--free-card-rotate", "0deg");
        }
        if (paySection && payHeadline) {
          setProperty(payHeadline, "--pay-headline-clip", "0%");
          setProperty(paySection, "--pay-headline-accent", "rgb(235,70,74)");
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
      updateRecognitionScene();
      updateFreeListingScene();
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

    Promise.all(imagePromises).then(() => {
      refreshMetrics();
      initializeHeroSearchDemo();
    });
    refreshMetrics();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
