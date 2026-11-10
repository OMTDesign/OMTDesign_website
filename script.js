/* OMT Design — light redesign interactions */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* header state, scroll progress, back-to-top */
  var header = document.querySelector(".site-header");
  var toTop = document.getElementById("toTop");
  var bar = document.getElementById("progress");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("scrolled", y > 12);
    toTop.classList.toggle("show", y > 700);
    if (bar) bar.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + "%";
    ticking = false;
  }
  function requestScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }
  onScroll();
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll, { passive: true });
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* mobile nav */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  function closeNav(refocus) {
    if (!nav.classList.contains("open")) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    if (refocus) toggle.focus();
  }
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(true); });
  window.addEventListener("resize", function () { if (window.innerWidth > 1020) closeNav(false); });

  /* reveal on scroll, with sibling stagger */
  var revealables = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("in"); });
  } else {
    revealables.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) {
        return c.classList.contains("reveal");
      });
      el.style.setProperty("--i", Math.min(sibs.indexOf(el), 5));
      el.classList.add("stagger");
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* animated counters */
  var counters = document.querySelectorAll(".stat-num");
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion || isNaN(target)) { return; }
    var start = performance.now(), dur = 1200;
    function frame(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCounter(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* compare slider (agriculture): divider + handle follow the range thumb */
  document.querySelectorAll(".compare").forEach(function (box) {
    var range = box.querySelector(".cmp-range");
    if (!range) return;
    function sync() { box.style.setProperty("--pos", range.value + "%"); }
    range.addEventListener("input", sync);
    sync();
  });

  /* highlight the current section in the nav */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav > a[href^="#"]:not(.btn)'));
  var map = {};
  links.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    var sec = document.getElementById(id);
    if (sec) map[id] = a;
  });
  if ("IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var a = map[entry.target.id];
        if (!a || !entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove("active"); });
        a.classList.add("active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { sio.observe(document.getElementById(id)); });
  }

  /* offset anchor jumps so the sticky header never covers a heading */
  function headerOffset() {
    var h = header ? header.getBoundingClientRect().height : 0;
    return Math.round(h) + 14;
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
      window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? "auto" : "smooth" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* contact form: validates, then hands off to the visitor's mail client.
     REPLACE the address in ENQUIRY_EMAIL with your real inbox, and wire a
     real backend (WPForms / Contact Form 7 / Formspree) when migrating. */
  var ENQUIRY_EMAIL = "info@omtdesign.com";
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["name", "email", "message"].forEach(function (id) {
        var input = form.elements[id];
        var field = input.closest(".field");
        var valid = input.value.trim() !== "" && input.checkValidity();
        field.classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        note.className = "form-note err";
        note.textContent = "Please add your name, a valid email and a short message.";
        return;
      }
      var subject = "Website enquiry — " + form.elements.service.value;
      var body =
        "Name: " + form.elements.name.value + "\n" +
        "Email: " + form.elements.email.value + "\n" +
        "Phone: " + (form.elements.phone.value || "—") + "\n" +
        "Service: " + form.elements.service.value + "\n\n" +
        form.elements.message.value + "\n";
      window.location.href = "mailto:" + ENQUIRY_EMAIL +
        "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      note.className = "form-note ok";
      note.textContent = "Opening your email app with the message ready — just hit send. Prefer to write directly? " + ENQUIRY_EMAIL;
    });

    form.querySelectorAll("input, textarea").forEach(function (input) {
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field && field.classList.contains("invalid") && input.value.trim() !== "" && input.checkValidity()) {
          field.classList.remove("invalid");
          note.className = "form-note";
        }
      });
    });
  }

  /* when arriving from another page with a #hash, re-jump so the sticky header
     never covers the heading — same offset the same-page anchor jumps use */
  window.addEventListener("load", function () {
    var id = decodeURIComponent((location.hash || "").slice(1));
    if (!id) return;
    var target = document.getElementById(id);
    if (!target || target.tagName === "MAIN") return;
    var y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    if (y > 0) window.scrollTo({ top: y, behavior: "auto" });
  });

  /* year */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();

/* ── Trade Me showcase slideshow ─────────────────────── */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".showcase").forEach(function (box) {
    var slides = box.querySelectorAll(".slide");
    if (slides.length < 2) return;
    var dotsBox = box.querySelector(".show-dots");
    var dots = [];
    var idx = 0;
    var timer = null;
    for (var i = 0; i < slides.length; i++) {
      (function (n) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "show-dot" + (n === 0 ? " is-active" : "");
        b.setAttribute("aria-label", "Show item " + (n + 1));
        b.addEventListener("click", function () { show(n); restart(); });
        if (dotsBox) dotsBox.appendChild(b);
        dots.push(b);
      })(i);
    }
    function show(n) {
      idx = (n + slides.length) % slides.length;
      for (var k = 0; k < slides.length; k++) {
        slides[k].classList.toggle("is-active", k === idx);
      }
      for (var m = 0; m < dots.length; m++) {
        dots[m].classList.toggle("is-active", m === idx);
      }
    }
    function restart() {
      if (timer) window.clearInterval(timer);
      if (!reduceMotion) timer = window.setInterval(function () { show(idx + 1); }, 4500);
    }
    var prev = box.querySelector(".show-prev");
    var next = box.querySelector(".show-next");
    if (prev) prev.addEventListener("click", function () { show(idx - 1); restart(); });
    if (next) next.addEventListener("click", function () { show(idx + 1); restart(); });
    box.addEventListener("mouseenter", function () { if (timer) window.clearInterval(timer); });
    box.addEventListener("mouseleave", restart);
    restart();
  });
})();
