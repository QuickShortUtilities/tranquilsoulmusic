/* Tranquil Soul — shared behaviour.
   No framework: the whole point of this site is that it loads instantly on a
   phone over mobile data, because most of the traffic arrives from a YouTube
   or Spotify link on a phone. */

(function () {
  "use strict";

  /* ---------- Nav ---------- */
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

    var setState = function (text) { if (stateEl) stateEl.textContent = text; };
    var setIcon = function (playing) {
      if (playBtn) playBtn.textContent = playing ? "❚❚" : "▶";
      if (playBtn) playBtn.setAttribute("aria-label", playing ? "Pause radio" : "Play radio");
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
})();
