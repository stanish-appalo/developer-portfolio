/* =========================================================
   Portfolio — interactions & animation
   Scroll reveal, count-up stats, rotating hero word,
   3D tilt cards, scroll progress, mobile nav.
   All motion respects prefers-reduced-motion.
   ========================================================= */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Signal CSS that JS is active (enables reveal hidden state).
  document.documentElement.classList.add("js");

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Sticky header shadow + scroll progress bar ---- */
  var header = document.getElementById("header");
  var progress = document.getElementById("scrollProgress");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (progress) {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav ---- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Count-up animation ---- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = target + suffix; return; }
    var start = null, duration = 1400;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- Scroll reveal ---- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  function showEl(el) {
    var delay = parseInt(el.getAttribute("data-reveal-delay"), 10) || 0;
    if (!reduce && delay) el.style.transitionDelay = delay + "ms";
    el.classList.add("is-visible");
    el.querySelectorAll("[data-count]").forEach(countUp);
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          showEl(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(showEl); // fallback: just show everything
  }

  /* ---- Rotating hero word ---- */
  var rotator = document.getElementById("rotator");
  if (rotator && !reduce) {
    var words = ["fast", "modern", "responsive", "accessible", "full-stack"];
    var i = 0;
    setInterval(function () {
      i = (i + 1) % words.length;
      rotator.classList.remove("swap");
      // force reflow so the animation can replay
      void rotator.offsetWidth;
      rotator.textContent = words[i];
      rotator.classList.add("swap");
    }, 2200);
  }

  /* ---- 3D tilt on project cards ---- */
  if (!reduce && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      var max = 7; // degrees
      card.addEventListener("mouseenter", function () {
        card.style.transition = "transform .08s linear"; // snappy while tilting
      });
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateX(" + (-py * max).toFixed(2) + "deg) rotateY(" +
          (px * max).toFixed(2) + "deg) translateY(-6px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transition = "transform .4s cubic-bezier(.2,.7,.2,1)"; // smooth settle back
        card.style.transform = "";
      });
    });
  }
})();
