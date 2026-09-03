/* Tranquil Soul — shared behaviour.
   No framework: the whole point of this site is that it loads instantly on a
   phone over mobile data, because most of the traffic arrives from a YouTube
   or Spotify link on a phone. */

(function () {
  "use strict";

  var motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav ---------- */
  var header = document.querySelector("header.nav");
  if (header) {
    // The nav is undecorated over the hero and only grows a rule and a darker
    // ground once there is content sliding under it.
    var syncScrolled = function () {
      if (window.scrollY > 8) header.setAttribute("data-scrolled", "");
      else header.removeAttribute("data-scrolled");
    };
    syncScrolled();
    window.addEventListener("scroll", syncScrolled, { passive: true });
  }

  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    var isNarrow = function () { return window.matchMedia("(max-width: 820px)").matches; };
    var sync = function () { links.hidden = isNarrow(); };
    sync();
    window.addEventListener("resize", sync);
    toggle.addEventListener("click", function () {
      links.hidden = !links.hidden;
      toggle.setAttribute("aria-expanded", String(!links.hidden));
    });
  }

  /* ---------- Radio ----------
     Stations are declared in the markup via data-* so a non-developer can add
     one without touching this file. */
  var audio = document.getElementById("radio-audio");
  if (audio) {
    var playBtn = document.getElementById("radio-play");
    var nameEl = document.getElementById("radio-name");
    var stateEl = document.getElementById("radio-state");
    var vol = document.getElementById("radio-vol");
    var stations = Array.prototype.slice.call(document.querySelectorAll(".station"));
    var current = null;

    var player = audio.closest(".player");

    var setState = function (text) { if (stateEl) stateEl.textContent = text; };
    var setIcon = function (playing) {
      if (playBtn) playBtn.textContent = playing ? "❚❚" : "▶";
      if (playBtn) playBtn.setAttribute("aria-label", playing ? "Pause radio" : "Play radio");
      // Drives the halo and the live dot. Purely decorative — the state text
      // is what actually reports whether audio is running.
      if (player) player.classList.toggle("is-playing", playing);
    };

    var select = function (btn, autoplay) {
      current = btn;
      stations.forEach(function (s) { s.setAttribute("aria-current", String(s === btn)); });
      if (nameEl) nameEl.textContent = btn.dataset.name;
      audio.src = btn.dataset.src;
      if (autoplay) {
        setState("Connecting…");
        audio.play().catch(function () {
          // Autoplay is blocked until a gesture, and a stream may simply be
          // down. Either way, say so rather than looking broken.
          setState("Tap play to start");
          setIcon(false);
        });
      } else {
        setState("Ready");
      }
    };

    stations.forEach(function (btn) {
      btn.addEventListener("click", function () { select(btn, true); });
    });

    if (playBtn) {
      playBtn.addEventListener("click", function () {
        if (!current && stations.length) { select(stations[0], true); return; }
        if (audio.paused) {
          setState("Connecting…");
          audio.play().catch(function () { setState("Stream unavailable"); });
        } else {
          audio.pause();
        }
      });
    }

    audio.addEventListener("playing", function () { setState("Live"); setIcon(true); });
    audio.addEventListener("pause", function () { setState("Paused"); setIcon(false); });
    audio.addEventListener("waiting", function () { setState("Buffering…"); });
    audio.addEventListener("error", function () { setState("Stream unavailable"); setIcon(false); });

    if (vol) {
      audio.volume = Number(vol.value);
      vol.addEventListener("input", function () { audio.volume = Number(vol.value); });
    }

    if (stations.length) select(stations[0], false);
  }

  /* ---------- Email capture ----------
     Posts to whatever endpoint the form declares. Until a list provider is
     connected the address is kept locally and the visitor is told plainly that
     it hasn't been sent — never a fake success message. */
  document.querySelectorAll("form[data-capture]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input[type=email]");
      var status = form.querySelector(".form-status");
      var endpoint = form.dataset.endpoint;
      if (!input || !input.value) return;

      if (!endpoint) {
        try {
          var held = JSON.parse(localStorage.getItem("pendingSignups") || "[]");
          held.push({ email: input.value, at: new Date().toISOString(), source: form.dataset.capture });
          localStorage.setItem("pendingSignups", JSON.stringify(held));
        } catch (err) { /* private browsing */ }
        if (status) status.textContent = "Saved on this device — the mailing list isn't connected yet.";
        return;
      }

      if (status) status.textContent = "Sending…";
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: input.value, source: form.dataset.capture })
      }).then(function (r) {
        if (!r.ok) throw new Error();
        if (status) status.textContent = "You're on the list. Check your inbox.";
        form.reset();
      }).catch(function () {
        if (status) status.textContent = "That didn't send. Try again in a moment.";
      });
    });
  });

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Scroll reveal ----------
     The hidden state lives in CSS behind html.js, so a visitor without
     JavaScript never sees a blank page; this only ever adds .is-in. The
     selector must stay in step with the reveal block in style.css. */
  var REVEAL = ".reveal, .hero .wrap > *";
  var targets = Array.prototype.slice.call(document.querySelectorAll(REVEAL));

  if (!motionOK || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    // Stagger by position among revealed siblings so a section assembles
    // itself rather than appearing all at once. Capped, so a long grid never
    // leaves the last card hanging.
    var seen = new Map();
    targets.forEach(function (el) {
      var n = seen.get(el.parentNode) || 0;
      seen.set(el.parentNode, n + 1);
      el.style.setProperty("--d", Math.min(n * 0.06, 0.42) + "s");
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });

    targets.forEach(function (el) { io.observe(el); });
  }
})();
