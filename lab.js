/* =========================================================
   Portfolio — Lab engine
   1) Animated "code editor" TV screen (canvas; a dropped-in
      assets/video/reel.mp4 overrides it automatically).
   2) Scroll-into-TV zoom (GSAP ScrollTrigger): the set scales
      up to fill the screen, the screen pauses, and an HD
      "Design Lab" panel takes over — like norml's mango zoom.
   3) "Pixel" — a procedural 3D robot head (Three.js): drag to
      spin, tap to say hi. Runs only while on screen.
   All motion respects prefers-reduced-motion.
   ========================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touch  = window.matchMedia("(max-width: 820px)").matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var hasThree = !!window.THREE;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ============ 1) Animated code-editor screen ============ */
  function codeScreen() {
    var cv = document.getElementById("tvCanvas");
    if (!cv) return null;
    var ctx = cv.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    function size() {
      var r = cv.getBoundingClientRect();
      W = Math.max(r.width, 320); H = Math.max(r.height, 200);
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener("resize", size);

    // a believable little program, tokenized [text, color]
    var PURPLE = "#c792ea", CY = "#7fdbff", GRN = "#9ece6a", ORG = "#ff9e64",
        GREY = "#5c6370", WHITE = "#d7dae0", YEL = "#e5c07b";
    var lines = [
      [["const ", PURPLE], ["dev ", CY], ["= ", WHITE], ["new ", PURPLE], ["Developer", YEL], ["({", WHITE]],
      [["  name", CY], [": ", WHITE], ["'Stanish'", GRN], [",", WHITE]],
      [["  stack", CY], [": [", WHITE], ["'JS'", GRN], [", ", WHITE], ["'TS'", GRN], [", ", WHITE], ["'Python'", GRN], [", ", WHITE], ["'Java'", GRN], ["],", WHITE]],
      [["  ships", CY], [": ", WHITE], ["true", ORG], [",", WHITE]],
      [["});", WHITE]],
      [["", WHITE]],
      [["async ", PURPLE], ["function ", PURPLE], ["build", YEL], ["(idea) {", WHITE]],
      [["  const ", PURPLE], ["plan ", CY], ["= ", WHITE], ["await ", PURPLE], ["dev", CY], [".", WHITE], ["scope", YEL], ["(idea);", WHITE]],
      [["  const ", PURPLE], ["ui ", CY], ["= ", WHITE], ["dev", CY], [".", WHITE], ["design", YEL], ["(plan, { clean: ", WHITE], ["true", ORG], [" });", WHITE]],
      [["  return ", PURPLE], ["dev", CY], [".", WHITE], ["deploy", YEL], ["(ui);", WHITE], ["   // live in minutes", GREY]],
      [["}", WHITE]],
      [["", WHITE]],
      [["// then automate the boring parts", GREY]],
      [["n8n", YEL], [".", WHITE], ["on", YEL], ["(", WHITE], ["'lead'", GRN], [").", WHITE], ["do", YEL], ["(notify, save, reply);", WHITE]],
    ];

    var lineH = 26, pad = 22, fontPx = 15;
    var scroll = 0, typed = 0, charT = 0, blink = 0, running = false, raf = 0;
    var fullLen = lines.reduce(function (a, l) { return a + l.reduce(function (s, t) { return s + t[0].length; }, 0) + 1; }, 0);

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // editor background
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0d1320"); g.addColorStop(1, "#0a0e18");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // title bar
      ctx.fillStyle = "rgba(255,255,255,.04)"; ctx.fillRect(0, 0, W, 34);
      var dots = ["#ff5f57", "#febc2e", "#28c840"];
      for (var d = 0; d < 3; d++) { ctx.beginPath(); ctx.fillStyle = dots[d]; ctx.arc(20 + d * 18, 17, 5, 0, 6.3); ctx.fill(); }
      ctx.fillStyle = "#6b7384"; ctx.font = "12px 'Space Mono', monospace";
      ctx.fillText("portfolio.js — building…", 80, 21);

      ctx.font = fontPx + "px 'Space Mono', monospace";
      ctx.textBaseline = "top";
      var y = 46 - scroll, count = 0, done = false;
      for (var i = 0; i < lines.length; i++) {
        // line number
        ctx.fillStyle = "#39414f";
        ctx.fillText(String(i + 1).padStart(2, "0"), 12, y);
        var x = pad + 28;
        for (var t = 0; t < lines[i].length; t++) {
          var seg = lines[i][t][0], col = lines[i][t][1];
          for (var c = 0; c < seg.length; c++) {
            if (count >= typed) { done = true; break; }
            ctx.fillStyle = col;
            var ch = seg[c];
            ctx.fillText(ch, x, y);
            x += ctx.measureText(ch).width;
            count++;
          }
          if (done) break;
        }
        // cursor at the head of typing
        if (done && Math.floor(blink) % 2 === 0) { ctx.fillStyle = "#ff7a45"; ctx.fillRect(x + 1, y, 8, fontPx + 2); }
        count++; // newline char
        y += lineH;
        if (done) break;
      }
      // subtle vignette
      var v = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.45)");
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    }

    function tick() {
      if (!running) return;
      charT += 1.1; blink += 0.04;
      if (charT >= 1) { typed += Math.floor(charT); charT = 0; }
      if (typed > fullLen) { typed = fullLen; }
      // start scrolling once enough lines are typed to fill the view
      var totalH = lines.length * lineH + 60;
      if (totalH > H) {
        scroll += 0.35;
        if (scroll > totalH - H + 40) { scroll = 0; typed = 0; } // loop
      }
      draw();
      raf = requestAnimationFrame(tick);
    }

    var api = {
      play: function () { if (!running && !reduce) { running = true; size(); raf = requestAnimationFrame(tick); } if (reduce) { typed = fullLen; draw(); } },
      pause: function () { running = false; cancelAnimationFrame(raf); },
      redraw: function () { size(); draw(); }
    };
    draw();
    return api;
  }

  /* ============ Optional real-video override ============ */
  function maybeVideo(screen) {
    var v = document.querySelector(".tv__video");
    if (!v) return;
    var src = v.getAttribute("data-src");
    if (!src) return;
    v.addEventListener("loadeddata", function () {
      v.classList.add("show");                 // CSS fades the <video> over the canvas
      var cv = document.getElementById("tvCanvas"); if (cv) cv.style.opacity = "0";
      if (!reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      screen && screen.pause();
    });
    v.addEventListener("error", function () { v.removeAttribute("src"); });
    // only attempt to load if the file is actually there
    fetch(src, { method: "HEAD" }).then(function (r) { if (r.ok) { v.src = src; v.load(); } }).catch(function () {});
  }

  /* ============ 2) Scroll-into-TV zoom ============ */
  function tvZoom(screen) {
    var sec = document.querySelector(".tv");
    var set = document.querySelector(".tv__set");
    if (!sec || !set) return;
    var video = document.querySelector(".tv__video");
    var SWAP = 0.42; // when the screen pauses & the Design Lab panel takes over

    function paused(p) {
      if (p) { screen && screen.pause(); if (video) video.pause(); }
      else { if (video && video.classList.contains("show")) { var q = video.play(); if (q && q.catch) q.catch(function(){}); } else { screen && screen.play(); } }
    }

    if (!hasGSAP || reduce) { screen && screen.play(); return; }

    var target = function () {
      return Math.max(window.innerWidth / set.offsetWidth, window.innerHeight / set.offsetHeight) * 1.28;
    };
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true,
        onUpdate: function (self) { paused(self.progress > SWAP); },
        onEnter: function () { paused(false); }, onEnterBack: function () { paused(false); }
      }
    });
    tl.fromTo(set, { scale: 0.9 }, { scale: target, ease: "power2.in", duration: 1 }, 0)
      .to(".tv__bezel", { opacity: 0, duration: 0.3 }, 0)
      .to("[data-tv-lead]", { opacity: 0, y: -24, duration: 0.32 }, 0)
      .to([".tv__canvas", ".tv__video", ".tv__scan", ".tv__glow"], { opacity: 0, duration: 0.18 }, SWAP)
      .fromTo(".tv__swap", { opacity: 0 }, { opacity: 1, duration: 0.22 }, SWAP)
      .fromTo(".tv__swap-copy", { opacity: 0, scale: 1.16 }, { opacity: 1, scale: 1, duration: 0.34, ease: "power2.out" }, SWAP + 0.04);

    // play screen whenever the section is in view but not yet zoomed past SWAP
    screen && screen.play();
  }

  /* ============ 3) "Pixel" — procedural 3D robot head ============ */
  function robot() {
    var cv = document.getElementById("eggCanvas");
    if (!cv || !hasThree) return;
    var T = window.THREE, host = cv.parentElement;
    var renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var scene = new T.Scene();
    var cam = new T.PerspectiveCamera(36, 1, 0.1, 100); cam.position.set(0, 0, 6.6);

    // lights — no env map needed
    scene.add(new T.AmbientLight(0xffffff, 0.66));
    var key = new T.DirectionalLight(0xffffff, 1.5); key.position.set(3, 4, 5); scene.add(key);
    var warm = new T.DirectionalLight(0xff7a45, 0.5); warm.position.set(-4, -1, 2); scene.add(warm);
    var cool = new T.DirectionalLight(0x6cb8ff, 0.6); cool.position.set(-2, 3, -4); scene.add(cool);

    var head = new T.Group(); scene.add(head);
    var shell = new T.MeshStandardMaterial({ color: 0xece7de, metalness: 0.35, roughness: 0.45 });
    var dark  = new T.MeshStandardMaterial({ color: 0x14130f, metalness: 0.5, roughness: 0.4 });
    var metal = new T.MeshStandardMaterial({ color: 0x9a958b, metalness: 0.8, roughness: 0.35 });
    var eyeMat = new T.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1.4, roughness: 0.3 });
    var accMat = new T.MeshStandardMaterial({ color: 0xff7a45, emissive: 0xd6552e, emissiveIntensity: 1.1, roughness: 0.4 });

    function box(w, h, d, m, x, y, z) { var me = new T.Mesh(new T.BoxGeometry(w, h, d), m); me.position.set(x || 0, y || 0, z || 0); head.add(me); return me; }
    function cyl(rt, rb, h, m, x, y, z, rx, rz) { var me = new T.Mesh(new T.CylinderGeometry(rt, rb, h, 24), m); me.position.set(x || 0, y || 0, z || 0); if (rx) me.rotation.x = rx; if (rz) me.rotation.z = rz; head.add(me); return me; }

    box(1.7, 1.55, 1.35, shell);                       // skull
    box(1.25, 0.78, 0.12, dark, 0, 0.05, 0.7);          // face screen
    var eyeL = box(0.2, 0.2, 0.1, eyeMat, -0.28, 0.12, 0.77);
    var eyeR = box(0.2, 0.2, 0.1, eyeMat, 0.28, 0.12, 0.77);
    for (var i = 0; i < 4; i++) box(0.1, 0.06, 0.08, accMat, -0.27 + i * 0.18, -0.26, 0.77); // mouth bars
    cyl(0.12, 0.12, 0.18, metal, -0.95, 0.1, 0, 0, Math.PI / 2);  // ear L
    cyl(0.12, 0.12, 0.18, metal, 0.95, 0.1, 0, 0, Math.PI / 2);   // ear R
    cyl(0.035, 0.035, 0.5, metal, 0, 1.05, 0);                    // antenna
    var tip = box(0.16, 0.16, 0.16, accMat, 0, 1.38, 0);          // antenna tip (glows)
    box(1.2, 0.18, 1.0, metal, 0, -0.92, 0);                      // neck base
    head.scale.setScalar(0.8);

    // motion state
    var rotY = 0.5, rotX = 0, tRY = 0.5, tRX = 0, drag = false, lx = 0, ly = 0, moved = 0, auto = true;
    var t = 0, hello = -1, running = false, raf = 0;
    var REST = -0.9, entered = false, eP = -1, lastY = null;
    function easeOutBounce(x){var n=7.5625,d=2.75;if(x<1/d)return n*x*x;if(x<2/d){x-=1.5/d;return n*x*x+0.75;}if(x<2.5/d){x-=2.25/d;return n*x*x+0.9375;}x-=2.625/d;return n*x*x+0.984375;}

    function px(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
    function py(e) { return e.touches ? e.touches[0].clientY : e.clientY; }
    cv.addEventListener("pointerdown", function (e) { drag = true; moved = 0; lx = px(e); ly = py(e); auto = false; });
    window.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var x = px(e), y = py(e), dx = x - lx, dy = y - ly; lx = x; ly = y; moved += Math.abs(dx) + Math.abs(dy);
      tRY += dx * 0.01; tRX = Math.max(-0.8, Math.min(0.8, tRX + dy * 0.01));
    });
    window.addEventListener("pointerup", function () {
      if (drag && moved < 7 && hello < 0) hello = 0;     // a tap = say hi
      drag = false; setTimeout(function () { auto = true; }, 2400);
    });

    function size() { var r = host.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); cam.aspect = r.width / r.height; cam.updateProjectionMatrix(); }
    window.addEventListener("resize", size); size();

    function frame() {
      if (!running) return;
      t += 0.016;
      if (auto && !reduce) tRY += 0.004;
      rotY += (tRY - rotY) * 0.08; rotX += (tRX - rotX) * 0.08;
      head.rotation.set(rotX, rotY, Math.sin(t * 0.6) * 0.04);
      // entrance: drop in from above the page and land with a bounce (once), then rest
      var bs = 0.8;
      if (reduce || entered) {
        head.position.y = REST + (reduce ? 0 : Math.sin(t * 0.9) * 0.035);
        head.scale.set(bs, bs, bs);
      } else {
        if (eP < 0) eP = 0;
        eP += 0.016 / 1.3;                                 // ~1.3s entrance
        var p = Math.min(eP, 1);
        var y = REST + (1 - easeOutBounce(p)) * 7.4;        // falls in from well above
        var vel = lastY == null ? 0 : (y - lastY); lastY = y;
        var st = Math.min(Math.abs(vel) * 6, 0.24);         // stretch along motion, squash across
        head.position.y = y;
        head.scale.set(bs * (1 - st * 0.5), bs * (1 + st), bs * (1 - st * 0.5));
        if (p >= 1) { entered = true; head.position.y = REST; head.scale.set(bs, bs, bs); }
      }
      // idle eye glow pulse
      var pulse = 1.2 + Math.sin(t * 2) * 0.25;
      eyeMat.emissiveIntensity = pulse; accMat.emissiveIntensity = 0.9 + Math.sin(t * 2 + 1) * 0.2;
      // "hello" reaction: blink + nod + flash
      if (hello >= 0) {
        hello += 0.016; var p = hello;
        var blinkS = p < 0.18 ? 1 - p / 0.18 : (p < 0.36 ? (p - 0.18) / 0.18 : 1);
        eyeL.scale.y = eyeR.scale.y = Math.max(0.05, blinkS);
        head.rotation.x = rotX + Math.sin(p * 10) * 0.12 * Math.max(0, 1 - p / 1.2);
        eyeMat.emissiveIntensity = 2.4;
        if (p > 1.2) { hello = -1; eyeL.scale.y = eyeR.scale.y = 1; }
      }
      renderer.render(scene, cam);
      raf = requestAnimationFrame(frame);
    }
    new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        if (x.isIntersecting && !running) { running = true; size(); frame(); }
        else if (!x.isIntersecting) { running = false; cancelAnimationFrame(raf); }
      });
    }, { threshold: 0.05 }).observe(host);

    if (reduce) { running = true; size(); renderer.render(scene, cam); running = false; }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var screen = codeScreen();
    maybeVideo(screen);
    tvZoom(screen);
    robot();
    if (hasGSAP) setTimeout(function () { ScrollTrigger.refresh(); }, 400);
  });
})();
