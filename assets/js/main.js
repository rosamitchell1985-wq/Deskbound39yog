/* ==========================================================================
   Deskbound — main.js
   Vanilla, classic script tag, no modules, no fetch. Runs from file:// too.
   Contents: safe storage, nav, consent, routine data, the 5-minute timer,
             region chips, forms.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Storage that cannot throw.
     Safari on file:// throws on localStorage access, so every read and write
     goes through here and falls back to an in-memory object for the session.
     --------------------------------------------------------------------- */
  var memory = {};
  var store = {
    get: function (key) {
      try {
        var v = window.localStorage.getItem(key);
        return v === null ? (key in memory ? memory[key] : null) : v;
      } catch (e) {
        return key in memory ? memory[key] : null;
      }
    },
    set: function (key, value) {
      memory[key] = String(value);
      try {
        window.localStorage.setItem(key, String(value));
      } catch (e) {
        /* storage blocked — the in-memory copy above keeps the session working */
      }
    }
  };

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function on(el, type, fn) {
    if (el) el.addEventListener(type, fn);
  }

  /* ---------------------------------------------------------------------
     Move catalog. Every cue is two lines: what to do, then the detail people
     get wrong. Used by the timer and by the printable routine lists.
     --------------------------------------------------------------------- */
  var MOVES = {
    catcow: {
      name: "Seated cat-cow",
      pos: "Seated",
      how:
        "Sit forward on the chair, feet flat, hands on your knees. Round your back and drop your head, then arch and lift your chest.",
      detail:
        "Slow. About eight rounds in a minute. The movement comes from the mid-back, not the neck."
    },
    chintuck: {
      name: "Chin tucks",
      pos: "Seated",
      how:
        "Sit tall. Slide your chin straight back over your throat, like you're making a double chin. Hold three seconds, release.",
      detail: "Your head stays level. If your chin drops toward your chest, you're doing a nod instead."
    },
    thread: {
      name: "Thread-the-needle at the desk",
      pos: "Standing",
      how:
        "Hands on the desk edge, walk your feet back until your arms are straight. Slide one arm under the other and let your upper back rotate.",
      detail: "Thirty seconds each side. Let the shoulder blade travel; keep your hips square to the desk."
    },
    doorway: {
      name: "Doorway chest opener",
      pos: "Standing",
      how:
        "Forearm flat on the door frame, elbow at shoulder height. Step through the doorway until you feel the front of the shoulder open.",
      detail: "Thirty seconds each side. Keep your ribs down — arching your low back fakes the stretch."
    },
    fold: {
      name: "Standing forward fold",
      pos: "Standing",
      how:
        "Feet hip-width, knees soft. Hinge at the hips and hang. Let your head, arms and jaw go heavy.",
      detail: "Bend the knees as much as you need to. Roll up slowly or you'll get a head rush."
    },
    wallangel: {
      name: "Wall angel",
      pos: "Standing",
      how:
        "Back against the wall, feet about a foot out. Arms up in a goalpost, backs of the hands toward the wall. Slide up and down.",
      detail: "Keep the low back and the hands in contact. Two inches of clean range beats a foot of cheating."
    },
    hipflexor: {
      name: "Hip flexor stretch at the desk",
      pos: "Standing",
      how:
        "Split stance, back foot a long step behind you, hand on the desk. Tuck your tailbone under and squeeze the back glute.",
      detail: "Thirty seconds each side. The stretch belongs in the front of the back hip, not the low back."
    },
    figure4: {
      name: "Seated figure-4",
      pos: "Seated",
      how:
        "Ankle across the opposite knee, shin roughly parallel to the floor. Sit tall, then hinge forward from the hips.",
      detail: "Thirty seconds each side. Stop where the outer hip pulls. Sharp knee pain means back off."
    },
    bridge: {
      name: "Glute bridge",
      pos: "Optional floor",
      how:
        "Floor version: on your back, knees bent, feet flat, lift your hips until shoulders, hips and knees line up. No floor? Stand and squeeze your glutes hard for five seconds.",
      detail: "Ten slow reps either way. Ribs stay down; the work is in the glutes, not the low back."
    },
    eartoshoulder: {
      name: "Ear-to-shoulder hold",
      pos: "Seated",
      how:
        "Sit on your right hand. Tip your left ear toward your left shoulder and let the weight of your head do the work.",
      detail: "Thirty seconds each side. No pulling. If it buzzes or tingles, come out of it."
    },
    scapsqueeze: {
      name: "Scapular squeeze",
      pos: "Seated",
      how:
        "Elbows bent at your sides, thumbs pointing out. Draw both shoulder blades back and down and hold for five seconds.",
      detail: "About ten reps. Shrugging up toward your ears is the common mistake — think back pockets."
    },
    kneehug: {
      name: "Standing knee hug",
      pos: "Standing",
      how:
        "Hold the desk with one hand. Lift the opposite knee toward your chest and hug it in, standing tall.",
      detail: "Thirty seconds each side. Don't crunch forward to meet the knee — bring the knee to you."
    }
  };

  /* Four routines, one per body-region chip. Five moves, one minute each. */
  var ROUTINES = {
    neck: {
      id: "neck",
      label: "Neck",
      title: "Neck and upper traps",
      pos: "Seated + standing",
      blurb: "For the ache that sits behind your ears by mid-afternoon.",
      moves: ["chintuck", "eartoshoulder", "catcow", "thread", "doorway"]
    },
    shoulders: {
      id: "shoulders",
      label: "Shoulders",
      title: "Shoulders and upper back",
      pos: "Standing",
      blurb: "For rounded, jammed-forward shoulders after a day on a laptop.",
      moves: ["scapsqueeze", "doorway", "wallangel", "thread", "chintuck"]
    },
    "lower-back": {
      id: "lower-back",
      label: "Lower back",
      title: "Lower back",
      pos: "Seated + standing",
      blurb: "For the stiffness that shows up when you finally stand up.",
      moves: ["catcow", "fold", "hipflexor", "figure4", "bridge"]
    },
    hips: {
      id: "hips",
      label: "Hips",
      title: "Hips",
      pos: "Seated + standing",
      blurb: "For hips that have been folded at 90 degrees since 8 AM.",
      moves: ["figure4", "hipflexor", "kneehug", "fold", "bridge"]
    }
  };

  var ROUTINE_ORDER = ["neck", "shoulders", "lower-back", "hips"];
  var STEP_MS = 60000;
  var STEPS = 5;

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function mmss(ms) {
    var total = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(total / 60) + ":" + pad2(total % 60);
  }

  /* ---------------------------------------------------------------------
     Beep. Web Audio, built on the first user gesture, muted by default.
     --------------------------------------------------------------------- */
  var audioCtx = null;

  function beep(kind) {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === "suspended" && audioCtx.resume) audioCtx.resume();
      var t = audioCtx.currentTime;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(kind === "end" ? 660 : 880, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
      if (kind === "end") {
        var osc2 = audioCtx.createOscillator();
        var g2 = audioCtx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, t + 0.32);
        g2.gain.setValueAtTime(0.0001, t + 0.32);
        g2.gain.exponentialRampToValueAtTime(0.22, t + 0.33);
        g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
        osc2.connect(g2);
        g2.connect(audioCtx.destination);
        osc2.start(t + 0.32);
        osc2.stop(t + 0.65);
      }
    } catch (e) {
      /* audio unavailable — the timer still runs and still announces */
    }
  }

  /* ---------------------------------------------------------------------
     The 5-minute desk reset.
     Elapsed time is always recomputed from Date.now(). setInterval only
     schedules repaints, so backgrounding the tab, locking the phone or
     dropping frames never drifts the clock.
     --------------------------------------------------------------------- */
  function Timer(root) {
    this.root = root;
    this.clockEl = $("[data-clock]", root);
    this.stepEl = $("[data-step]", root);
    this.nameEl = $("[data-move-name]", root);
    this.howEl = $("[data-move-how]", root);
    this.liveEl = $("[data-live]", root);
    this.titleEl = $("[data-routine-title]", root);
    this.posEl = $("[data-routine-pos]", root);
    this.startBtn = $("[data-start]", root);
    this.skipBtn = $("[data-skip]", root);
    this.resetBtn = $("[data-reset]", root);
    this.muteBtn = $("[data-mute]", root);
    this.muteLabel = $("[data-mute-label]", root);
    this.segFills = $$("[data-seg-fill]", root);
    this.segs = $$(".seg", root);

    this.routineKey = "lower-back";
    this.state = "idle"; // idle | running | paused | done
    this.startAt = 0;
    this.elapsed = 0;
    this.lastIndex = -1;
    this.ticker = null;
    this.soundOn = store.get("db_sound") === "on";

    var self = this;
    on(this.startBtn, "click", function () {
      self.toggle();
    });
    on(this.skipBtn, "click", function () {
      self.skip();
    });
    on(this.resetBtn, "click", function () {
      self.reset(true);
    });
    on(this.muteBtn, "click", function () {
      self.setSound(!self.soundOn, true);
    });
    on(document, "visibilitychange", function () {
      if (!document.hidden) self.render();
    });
    on(window, "pageshow", function () {
      self.render();
    });

    this.setSound(this.soundOn, false);
    this.load(store.get("db_routine") || "lower-back", false);
  }

  Timer.prototype.routine = function () {
    return ROUTINES[this.routineKey] || ROUTINES["lower-back"];
  };

  Timer.prototype.move = function (i) {
    var r = this.routine();
    return MOVES[r.moves[Math.min(Math.max(i, 0), STEPS - 1)]];
  };

  Timer.prototype.load = function (key, announce) {
    if (!ROUTINES[key]) key = "lower-back";
    this.routineKey = key;
    store.set("db_routine", key);
    this.reset(false);
    var r = this.routine();
    if (this.titleEl) this.titleEl.textContent = r.title;
    if (this.posEl) this.posEl.textContent = r.pos;
    this.render();
    if (announce) {
      this.say(r.title + " routine loaded. Five moves, one minute each. Press start when you're ready.");
    }
    syncChips(key);
  };

  Timer.prototype.setSound = function (onNow, announce) {
    this.soundOn = !!onNow;
    store.set("db_sound", this.soundOn ? "on" : "off");
    if (this.muteBtn) this.muteBtn.setAttribute("aria-pressed", this.soundOn ? "true" : "false");
    if (this.muteLabel) this.muteLabel.textContent = this.soundOn ? "Sound on" : "Sound off";
    if (this.soundOn && announce) beep("step");
  };

  Timer.prototype.say = function (msg) {
    if (this.liveEl) this.liveEl.textContent = msg;
  };

  Timer.prototype.now = function () {
    return this.state === "running" ? Date.now() - this.startAt : this.elapsed;
  };

  Timer.prototype.toggle = function () {
    if (this.state === "running") {
      this.pause();
    } else {
      this.start();
    }
  };

  Timer.prototype.start = function () {
    if (this.state === "done") this.reset(false);
    this.startAt = Date.now() - this.elapsed;
    this.state = "running";
    this.root.classList.add("is-running");
    this.startBtn.textContent = "Pause";
    var self = this;
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = setInterval(function () {
      self.render();
    }, 250);
    var idx = Math.min(Math.floor(this.now() / STEP_MS), STEPS - 1);
    var m = this.move(idx);
    this.say(
      (this.elapsed > 0 ? "Resumed" : "Started") +
        ". Move " + (idx + 1) + " of " + STEPS + ": " + m.name + ". " + m.how
    );
    this.lastIndex = idx;
    this.render();
  };

  Timer.prototype.pause = function () {
    this.elapsed = this.now();
    this.state = "paused";
    this.root.classList.remove("is-running");
    this.startBtn.textContent = "Resume";
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = null;
    this.say("Paused at " + mmss(STEP_MS - (this.elapsed % STEP_MS)) + " remaining in this move.");
    this.render();
  };

  Timer.prototype.skip = function () {
    var el = this.now();
    var next = (Math.floor(el / STEP_MS) + 1) * STEP_MS;
    if (next >= STEPS * STEP_MS) {
      this.elapsed = STEPS * STEP_MS;
      if (this.state === "running") this.startAt = Date.now() - this.elapsed;
      this.finish();
      return;
    }
    this.elapsed = next;
    if (this.state === "running") {
      this.startAt = Date.now() - this.elapsed;
    } else {
      this.lastIndex = Math.floor(next / STEP_MS);
      var m = this.move(this.lastIndex);
      this.say(
        "Skipped ahead. Move " + (this.lastIndex + 1) + " of " + STEPS + ": " + m.name + ". " + m.how
      );
    }
    this.render();
  };

  Timer.prototype.reset = function (announce) {
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = null;
    this.state = "idle";
    this.elapsed = 0;
    this.startAt = 0;
    this.lastIndex = -1;
    this.root.classList.remove("is-running");
    if (this.startBtn) this.startBtn.textContent = "Start";
    this.render();
    if (announce) this.say("Reset. Back to move one, five minutes on the clock.");
  };

  Timer.prototype.finish = function () {
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = null;
    this.state = "done";
    this.elapsed = STEPS * STEP_MS;
    this.root.classList.remove("is-running");
    this.startBtn.textContent = "Start again";
    if (this.soundOn) beep("end");
    this.say("Done. Five minutes finished. Go back to work.");
    this.render();
  };

  Timer.prototype.render = function () {
    var el = this.now();
    if (this.state === "running" && el >= STEPS * STEP_MS) {
      this.finish();
      return;
    }
    var done = this.state === "done";
    var idx = done ? STEPS - 1 : Math.min(Math.floor(el / STEP_MS), STEPS - 1);
    var within = done ? STEP_MS : el % STEP_MS;
    var left = done ? 0 : STEP_MS - within;

    if (this.state === "running" && idx !== this.lastIndex) {
      this.lastIndex = idx;
      var mv = this.move(idx);
      if (this.soundOn) beep("step");
      this.say("Next. Move " + (idx + 1) + " of " + STEPS + ": " + mv.name + ". " + mv.how);
    }

    var m = this.move(idx);
    if (this.clockEl) this.clockEl.textContent = done ? "0:00" : mmss(left);
    if (this.nameEl) this.nameEl.textContent = done ? "Finished" : m.name;
    if (this.howEl) {
      this.howEl.textContent = done
        ? "That's five minutes. Stand up again in about half an hour."
        : m.how + " " + m.detail;
    }
    if (this.stepEl) {
      var totalLeft = Math.max(0, STEPS * STEP_MS - el);
      this.stepEl.textContent = done
        ? "Complete — 5:00 of 5:00"
        : "Move " + (idx + 1) + " of " + STEPS + " — " + mmss(totalLeft) + " left";
    }
    for (var i = 0; i < this.segs.length; i++) {
      var fill = this.segFills[i];
      if (i < idx || done) {
        this.segs[i].classList.add("is-done");
        if (fill) fill.style.width = "100%";
      } else if (i === idx) {
        this.segs[i].classList.remove("is-done");
        if (fill) fill.style.width = Math.min(100, (within / STEP_MS) * 100).toFixed(1) + "%";
      } else {
        this.segs[i].classList.remove("is-done");
        if (fill) fill.style.width = "0%";
      }
    }
  };

  var timers = [];

  function syncChips(key) {
    $$("[data-routine-chip]").forEach(function (btn) {
      var isActive = btn.getAttribute("data-routine-chip") === key;
      if (btn.tagName === "BUTTON") btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      btn.classList.toggle("is-active", isActive);
    });
  }

  function loadRoutineEverywhere(key, scrollTo) {
    timers.forEach(function (t) {
      t.load(key, true);
    });
    if (scrollTo) {
      var target = $("#reset");
      if (target && target.scrollIntoView) target.scrollIntoView({ block: "start" });
    }
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  function init() {
    /* Year stamps in the footer */
    $$("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });

    /* Mobile nav */
    var toggle = $(".nav-toggle");
    var nav = $("#site-nav");

    function closeNav(refocus) {
      if (!toggle || !nav) return;
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      if (refocus) toggle.focus();
    }

    on(toggle, "click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
      nav.classList.toggle("is-open", !open);
    });

    /* Tapping a link closes the menu. Matters for same-page anchors, where the
       page does not reload and the drawer would otherwise stay open over it. */
    $$("#site-nav a").forEach(function (link) {
      on(link, "click", function () {
        closeNav(false);
      });
    });

    on(document, "keydown", function (e) {
      if (e.key === "Escape" && toggle && toggle.getAttribute("aria-expanded") === "true") {
        closeNav(true);
      }
    });

    /* Rotating to landscape or widening past the desktop breakpoint hides the
       toggle; drop the open state with it so aria-expanded never lies. */
    if (window.matchMedia) {
      var wide = window.matchMedia("(min-width: 48rem)");
      var onWide = function (e) {
        if (e.matches) closeNav(false);
      };
      if (wide.addEventListener) {
        wide.addEventListener("change", onWide);
      } else if (wide.addListener) {
        wide.addListener(onWide);
      }
    }

    /* Timers */
    timers = $$("[data-timer]").map(function (el) {
      return new Timer(el);
    });

    /* Region chips — buttons on pages that hold a timer, links elsewhere */
    $$("[data-routine-chip]").forEach(function (btn) {
      on(btn, "click", function (e) {
        var key = btn.getAttribute("data-routine-chip");
        if (btn.tagName === "BUTTON" || timers.length) {
          if (btn.tagName === "A") e.preventDefault();
          loadRoutineEverywhere(key, true);
          if (history.replaceState) history.replaceState(null, "", "#reset-" + key);
        }
      });
    });

    /* Deep link: index.html#reset-hips loads that routine straight into the timer */
    if (timers.length) {
      var hash = (window.location.hash || "").replace("#", "");
      if (hash.indexOf("reset-") === 0) {
        var key = hash.slice(6);
        if (ROUTINES[key]) {
          timers.forEach(function (t) {
            t.load(key, false);
          });
        }
      } else {
        syncChips(timers[0].routineKey);
      }
    }

    initConsent();
    initForms();
  }

  /* ---------------------------------------------------------------------
     Consent
     Two equally weighted buttons. The stored choice drives the ad and
     analytics integration point below, and can be changed from the footer.
     --------------------------------------------------------------------- */
  function applyConsent(choice) {
    document.documentElement.setAttribute("data-consent", choice);
    /* ------------------------------------------------------------------
       CMP / AD INTEGRATION POINT
       Load a Google-certified CMP here (TCF v2.3) before any ad or
       analytics tag. EEA, UK and Swiss traffic requires it even on a
       US-targeted site. With choice === "accepted" you may then request
       personalized ads; with "rejected" request non-personalized ads only
       and skip analytics entirely. Nothing is loaded by this build.
       ------------------------------------------------------------------ */
  }

  function initConsent() {
    var banner = $("#consent");
    var stored = store.get("db_consent");
    var gpc = navigator.globalPrivacyControl === true;

    if (gpc && !stored) {
      /* Global Privacy Control is an opt-out signal we honor without asking */
      store.set("db_consent", "rejected");
      store.set("db_consent_source", "gpc");
      stored = "rejected";
    }

    if (stored) {
      applyConsent(stored);
    } else if (banner) {
      banner.hidden = false;
    }

    function choose(choice) {
      store.set("db_consent", choice);
      store.set("db_consent_source", "banner");
      applyConsent(choice);
      if (banner) banner.hidden = true;
    }

    on($("#consent-accept"), "click", function () {
      choose("accepted");
    });
    on($("#consent-reject"), "click", function () {
      choose("rejected");
    });

    $$("[data-cookie-settings]").forEach(function (link) {
      on(link, "click", function (e) {
        e.preventDefault();
        if (banner) {
          banner.hidden = false;
          var btn = $("#consent-accept");
          if (btn) btn.focus();
        }
      });
    });

    $$("[data-do-not-sell]").forEach(function (link) {
      on(link, "click", function (e) {
        e.preventDefault();
        store.set("db_consent", "rejected");
        store.set("db_consent_source", "do-not-sell");
        applyConsent("rejected");
        if (banner) banner.hidden = true;
        var note = $("#dns-status");
        if (note) {
          note.textContent =
            "Recorded. This browser is set to opt out of the sale or sharing of personal information on Deskbound.";
          note.hidden = false;
        } else {
          window.alert(
            "Recorded. This browser is set to opt out of the sale or sharing of personal information on Deskbound."
          );
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
     Forms — no backend in this build. Validation and confirmation are local.
     --------------------------------------------------------------------- */
  function emailLooksValid(v) {
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim());
  }

  function setError(input, msg) {
    var box = input.closest ? input.closest(".field") : null;
    var errEl = box ? $(".err", box) : null;
    if (!errEl) {
      var described = input.getAttribute("aria-describedby");
      if (described) errEl = document.getElementById(described.split(" ")[0]);
    }
    if (errEl) errEl.textContent = msg || "";
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  function initForms() {
    $$("form[data-form]").forEach(function (form) {
      var status = $(".form-status", form.parentNode) || $("#" + form.getAttribute("data-status"));
      on(form, "submit", function (e) {
        e.preventDefault();
        var ok = true;
        var firstBad = null;

        $$("input, textarea", form).forEach(function (input) {
          if (!input.hasAttribute("required")) return;
          var v = input.value.trim();
          var msg = "";
          if (!v) {
            msg = "This field is required.";
          } else if (input.type === "email" && !emailLooksValid(v)) {
            msg = "Enter an email address in the form name@example.com.";
          } else if (input.tagName === "TEXTAREA" && v.length < 10) {
            msg = "Add a little more detail so we can actually answer.";
          }
          if (!setError(input, msg)) {
            ok = false;
            if (!firstBad) firstBad = input;
          }
        });

        if (!ok) {
          if (firstBad) firstBad.focus();
          return;
        }

        if (status) {
          status.hidden = false;
          status.textContent = "";
          var h = document.createElement("p");
          h.innerHTML =
            "<strong>" +
            (form.getAttribute("data-form") === "newsletter"
              ? "You're on the list."
              : "Message ready to send.") +
            "</strong>";
          var p = document.createElement("p");
          p.textContent =
            form.getAttribute("data-form") === "newsletter"
              ? "One desk reset lands in your inbox each Monday morning, Eastern Time. Unsubscribe from any email."
              : "This build has no server attached, so nothing was transmitted. Email hello@deskbound.co and we'll answer within two business days.";
          status.appendChild(h);
          status.appendChild(p);
          status.setAttribute("tabindex", "-1");
          status.focus();
        }
        form.reset();
        form.hidden = true;
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
