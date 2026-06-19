/* =========================================================
   Portfolio — interactions & motion
   Live screenshots (thum.io) with graceful fallback, custom
   cursor, magnetic buttons, scroll reveals, count-up stats,
   scroll progress, mobile nav, FAQ accordion polish.
   All motion respects prefers-reduced-motion.
   ========================================================= */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  document.documentElement.classList.add("js");

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Project screenshots ----
     Each <img data-shot src="assets/shots/x.jpg"> is a real,
     bundled screenshot of the deployed site. We reveal it once it
     loads; if it ever fails, the styled fallback behind it stays. */
  document.querySelectorAll("img[data-shot]").forEach(function (img) {
    function ok() { img.classList.add("loaded"); }
    function fail() { img.classList.remove("loaded"); }
    if (img.complete && img.naturalWidth > 0) { ok(); }
    else { img.addEventListener("load", ok); img.addEventListener("error", fail); }
  });

  /* ---- Sticky header + scroll progress ---- */
  var header = document.getElementById("header");
  var progress = document.getElementById("scrollProgress");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 10);
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

  /* ---- Count-up stats ---- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = target + suffix; return; }
    var start = null, duration = 1400;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
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
        if (entry.isIntersecting) { showEl(entry.target); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(showEl);
  }

  /* ---- FAQ: only one open at a time ---- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) { if (other !== item) other.open = false; });
      }
    });
  });

  /* ---- Custom cursor + magnetic buttons (fine pointers only) ---- */
  if (finePointer && !reduce) {
    var cursor = document.getElementById("cursor");
    if (cursor) {
      document.documentElement.classList.add("cursor-on");
      cursor.style.display = "flex";
      cursor.style.alignItems = "center";
      cursor.style.justifyContent = "center";
      var label = document.createElement("span");
      label.className = "ct";
      cursor.appendChild(label);

      var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      var rx = cx, ry = cy;
      window.addEventListener("mousemove", function (e) { cx = e.clientX; cy = e.clientY; }, { passive: true });
      (function loop() {
        rx += (cx - rx) * 0.2; ry += (cy - ry) * 0.2;
        cursor.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
        requestAnimationFrame(loop);
      })();

      document.querySelectorAll("[data-cursor]").forEach(function (el) {
        var text = el.getAttribute("data-cursor-text");
        el.addEventListener("mouseenter", function () {
          if (text) { cursor.classList.add("has-text"); label.textContent = text; }
          else { cursor.classList.add("active"); }
        });
        el.addEventListener("mouseleave", function () {
          cursor.classList.remove("active", "has-text"); label.textContent = "";
        });
      });
      document.addEventListener("mouseleave", function () { cursor.style.opacity = "0"; });
      document.addEventListener("mouseenter", function () { cursor.style.opacity = "1"; });
    }

    /* Magnetic pull on key buttons */
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var strength = 0.4;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + (mx * strength) + "px," + (my * strength) + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }
})();
