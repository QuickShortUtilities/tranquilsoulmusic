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

  /* ---------- Social icon circles ----------
     Injected into .foot-brand so all pages get them from one place.
     Keeps the HTML clean and consistent. */
  var footBrand = document.querySelector(".foot-brand");
  if (footBrand) {
    var SOCIALS = [
      { href: "/radio.html",   label: "Radio",      svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8.5 8.5a6 6 0 0 0 0 7M5.5 5.5a10 10 0 0 0 0 13M15.5 8.5a6 6 0 0 1 0 7M18.5 5.5a10 10 0 0 1 0 13"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>' },
      { href: "https://open.spotify.com/artist/tranquilsoulmusic", label: "Spotify", rel: "noopener", svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.305-1.76-8.786-.963-.335.077-.67-.133-.746-.469-.077-.335.132-.67.469-.746 3.809-.87 7.077-.496 9.713 1.115.293.18.386.563.207.856zm1.223-2.723c-.226.367-.706.482-1.072.257-2.687-1.652-6.785-2.131-9.965-1.166-.413.125-.848-.108-.973-.52-.125-.413.108-.848.52-.973 3.632-1.102 8.147-.568 11.233 1.33.366.226.48.706.257 1.072zm.105-2.835C14.692 8.95 8.375 8.744 5.14 9.744c-.495.15-1.017-.13-1.167-.625-.15-.495.13-1.016.625-1.167 3.71-1.127 9.875-.91 13.434 1.38.454.268.605.86.337 1.313-.267.454-.86.605-1.312.337z"/></svg>' },
      { href: "https://www.youtube.com/@Tranquil-Soul-Music", label: "YouTube", rel: "noopener", svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' },
      { href: "https://soundcloud.com/tranquilsoulmusic", label: "SoundCloud", rel: "noopener", svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.56 8.87V17h8.76c1.5 0 1.68-1.95 1.68-2.92a3.85 3.85 0 0 0-3.85-3.85c-.2 0-.4.02-.6.05a5.5 5.5 0 0 0-5.99-1.41zm-1.5.56c-.1-.02-.2-.03-.3-.03a2.68 2.68 0 0 0-2.68 2.68v5.1h3V9.43h-.02zm-3.93 1.83a2 2 0 0 0-2 2v3.47H6v-3.47a2 2 0 0 0-2-2h.13zM.87 12.87V16h2.26v-3.13a1.13 1.13 0 0 0-2.26 0z"/></svg>' },
      { href: "https://www.instagram.com/tranquilsoulmusic/", label: "Instagram", rel: "noopener", svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>' },
      { href: "https://www.tiktok.com/@tranquilsoulmusic", label: "TikTok", rel: "noopener", svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.67a8.27 8.27 0 0 0 4.83 1.53V6.75a4.85 4.85 0 0 1-1.06-.06z"/></svg>' },
      { href: "https://x.com/Tranquilsmusic", label: "X", rel: "noopener", svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' }
    ];

    var row = document.createElement("div");
    row.className = "foot-social";
    row.setAttribute("role", "list");
    row.setAttribute("aria-label", "Social media");

    SOCIALS.forEach(function (s) {
      var a = document.createElement("a");
      a.className = "social-icon";
      a.href = s.href;
      a.setAttribute("aria-label", s.label);
      a.setAttribute("role", "listitem");
      if (s.rel) a.rel = s.rel;
      a.innerHTML = s.svg;
      row.appendChild(a);
    });

    footBrand.appendChild(row);
  }

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

/* Tranquil Soul — polish layer.
   Kept in its own IIFE so nothing here can break the nav, the radio or the
   signup form above if a browser trips over it. */

(function () {
  "use strict";

  var docEl = document.documentElement;
  var motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Page transitions ----------
     Same-origin navigations fade out before the browser unloads, and every
     page fades in (CSS, on .js body). The ground colour is identical on both
     sides of the swap, so what you see is a crossfade rather than a flash. */

  // A page restored from the back/forward cache keeps whatever classes it had
  // when it left — including the one that fades it to nothing.
  window.addEventListener("pageshow", function () {
    docEl.classList.remove("is-leaving");
  });

  if (motionOK) {
    document.addEventListener("click", function (e) {
      // Anything the browser would treat specially stays the browser's job:
      // new tabs, downloads, right/middle clicks.
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      if (a.hasAttribute("data-no-transition")) return;

      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }

      // mailto:, tel:, and anything off-site.
      if (url.protocol !== "http:" && url.protocol !== "https:") return;
      if (url.origin !== location.origin) return;
      // In-page anchor — let it scroll.
      if (url.pathname === location.pathname && url.search === location.search) return;

      e.preventDefault();
      docEl.classList.add("is-leaving");

      var gone = false;
      var go = function () {
        if (gone) return;
        gone = true;
        location.href = url.href;
      };
      document.body.addEventListener("animationend", function onEnd(ev) {
        if (ev.animationName !== "page-out" || ev.target !== document.body) return;
        document.body.removeEventListener("animationend", onEnd);
        go();
      });
      // animationend never fires on a backgrounded tab.
      setTimeout(go, 320);
    });
  }

  /* ---------- Radio visualiser ----------
     The stream is a cross-origin YouTube iframe: there is no waveform to read,
     so these rings breathe on a fixed period. They are shown only while the
     player reports state 1 (playing), which is the honest part — an idle
     player gets nothing. */

  var radioFrame = document.getElementById("radio-iframe");
  var radioPlayer = radioFrame && radioFrame.closest ? radioFrame.closest(".radio-player") : null;

  if (radioFrame && radioPlayer) {
    var embed = radioFrame.parentNode;
    var viz = document.createElement("div");
    viz.className = "radio-viz";
    viz.setAttribute("aria-hidden", "true");
    for (var r = 0; r < 3; r++) {
      var ring = document.createElement("span");
      ring.className = "radio-ring";
      viz.appendChild(ring);
    }
    embed.insertBefore(viz, embed.firstChild);

    // The two pages size the iframe differently (640x360 and 600x340), and a
    // guessed width leaves the rings starting INSIDE the frame — they then
    // surface as two disembodied horizontal lines before the corners clear it.
    // Measuring the frame is the only way a ripple starts exactly on its edge.
    var syncViz = function () {
      var box = radioFrame.getBoundingClientRect();
      if (!box.width || !box.height) return;
      viz.style.setProperty("--viz-w", box.width + "px");
      viz.style.setProperty("--viz-h", box.height + "px");
    };
    syncViz();
    radioFrame.addEventListener("load", syncViz);
    if (window.ResizeObserver) new ResizeObserver(syncViz).observe(radioFrame);
    else window.addEventListener("resize", syncViz);

    var setPlaying = function (on) {
      radioPlayer.classList.toggle("is-playing", on);
      viz.classList.toggle("is-live", on);
    };

    // The iframe already carries enablejsapi=1, so a "listening" handshake is
    // enough to be sent state changes — no need to load the YouTube API.
    var handshake = function () {
      try {
        radioFrame.contentWindow.postMessage(
          JSON.stringify({ event: "listening", id: "tsm-radio", channel: "widget" }),
          "https://www.youtube.com"
        );
      } catch (err) { /* not ready yet */ }
    };

    var YT_ORIGIN = /^https:\/\/(www\.)?youtube(-nocookie)?\.com$/;

    window.addEventListener("message", function (e) {
      if (!YT_ORIGIN.test(e.origin)) return;
      if (e.source !== radioFrame.contentWindow) return;

      var data;
      try { data = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch (err) { return; }
      if (!data) return;

      var state = null;
      if (data.event === "onStateChange" && typeof data.info === "number") {
        state = data.info;
      } else if (data.event === "infoDelivery" && data.info && typeof data.info.playerState === "number") {
        state = data.info.playerState;
      }
      if (state === null) return;

      setPlaying(state === 1);
    });

    // Switching station replaces the src; the new player starts silent.
    if (window.MutationObserver) {
      new MutationObserver(function () { setPlaying(false); })
        .observe(radioFrame, { attributes: true, attributeFilter: ["src"] });
    }

    radioFrame.addEventListener("load", function () {
      // The player answers a handshake only once it has booted, and there is
      // no event for that — so ask a few times, then stop.
      var tries = 0;
      var t = setInterval(function () {
        handshake();
        if (++tries >= 8) clearInterval(t);
      }, 350);
    });
  }

  /* ---------- Magnetic buttons ----------
     Buttons lean towards a cursor that comes near. Mouse only: on a
     touchscreen there is no "near", and the pull would just be a lag. */

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var magnets = Array.prototype.slice.call(document.querySelectorAll(".btn"));

  if (finePointer && motionOK && magnets.length) {
    var FIELD = 46;   // px of reach beyond the button's own edge
    var PULL  = 0.28; // share of the offset the button actually travels
    var MAX   = 10;   // px, so a big button never slides far from its slot

    magnets.forEach(function (el) { el.classList.add("magnetic"); });

    var rects = [];
    var stale = true;
    var queued = false;
    var px = -1e4, py = -1e4;

    var cap = function (v) { return Math.max(-MAX, Math.min(MAX, v)); };

    var release = function (el) {
      if (!el.classList.contains("is-pulled")) return;
      el.classList.remove("is-pulled");
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    };

    var apply = function () {
      queued = false;
      if (stale) {
        rects = magnets.map(function (el) { return el.getBoundingClientRect(); });
        stale = false;
      }
      for (var i = 0; i < magnets.length; i++) {
        var rect = rects[i];
        var el = magnets[i];
        if (!rect || !rect.width) { release(el); continue; }

        var dx = px - (rect.left + rect.width / 2);
        var dy = py - (rect.top + rect.height / 2);

        if (Math.abs(dx) < rect.width / 2 + FIELD && Math.abs(dy) < rect.height / 2 + FIELD) {
          el.classList.add("is-pulled");
          el.style.setProperty("--mx", cap(dx * PULL).toFixed(2) + "px");
          el.style.setProperty("--my", cap(dy * PULL).toFixed(2) + "px");
        } else {
          release(el);
        }
      }
    };

    var schedule = function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      schedule();
    }, { passive: true });

    // Scrolling moves the buttons under a stationary cursor, so the cached
    // rectangles have to go.
    var invalidate = function () { stale = true; schedule(); };
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);

    var releaseAll = function () {
      px = py = -1e4;
      magnets.forEach(release);
    };
    window.addEventListener("blur", releaseAll);
    document.addEventListener("mouseleave", releaseAll);
  }

  /* ---------- Drop cap ----------
     Tagged here rather than in the markup so a new article picks one up
     without anyone remembering the class. The lede is a standfirst, so the
     cap belongs on the first paragraph of body text after it. */

  var post = document.querySelector("article.post");
  if (post) {
    var paras = post.querySelectorAll(":scope > p");
    for (var p = 0; p < paras.length; p++) {
      if (paras[p].classList.contains("lede")) continue;
      if (!paras[p].textContent.trim()) continue;
      paras[p].classList.add("has-dropcap");
      break;
    }
  }
})();
