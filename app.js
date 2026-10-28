(() => {
  "use strict";
  const story = window.BIRTHDAY_STORY;
  const sceneRoot = document.querySelector("#scene");
  const progress = document.querySelector("#star-track");
  const progressCaption = document.querySelector("#progress-caption");
  const toast = document.querySelector("#toast");
  const musicButton = document.querySelector("#music-toggle");
  const musicLabel = document.querySelector("#music-label");
  const musicDialog = document.querySelector("#music-dialog");
  const spotifyPlayer = document.querySelector("#spotify-player");
  const sceneNames = ["The surprise", "A little pop of fun", "Make a wish", "Our little story", "A note for you", "With all my love"];
  const state = { scene: 0, popped: new Set(), candleOut: false, photo: 0, photoNoteOpen: false, envelopeOpen: false, busy: false, toastTimer: 0 };
  let tenorScriptLoading = false;

  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
  const safeUrl = (value) => { try { const u = new URL(value, location.href); return ["http:","https:","blob:"].includes(u.protocol) ? u.href : ""; } catch { return ""; } };
  const spotifyTrackId = String(story.music?.spotifyTrackId || "").replace(/[^a-zA-Z0-9]/g, "");
  if (spotifyTrackId) {
    const trackLabel = story.music?.label || "A song for you";
    spotifyPlayer.src = `https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator`;
    spotifyPlayer.title = `Spotify player: ${trackLabel}`;
    musicLabel.textContent = trackLabel;
    musicButton.setAttribute("aria-label", `Listen to ${trackLabel}`);
    document.querySelector("#music-title").textContent = trackLabel;
  }
  const lineBreaks = (value) => escapeHTML(value).replace(/\n/g, "<br>");
  const nickname = () => escapeHTML(story.nickname || "my love");
  const stickerMarkup = (src, alt, className) => {
    const url = safeUrl(src || "");
    return url ? `<img class="story-sticker ${className}" src="${escapeHTML(url)}" alt="${escapeHTML(alt)}" loading="lazy" onerror="this.remove()">` : "";
  };
  const stickerSetMarkup = (sources, alt, className) => (Array.isArray(sources) ? sources : [sources]).filter(Boolean).map((src, i) => stickerMarkup(src, `${alt} ${i + 1}`, `${className}-item sticker-item sticker-item-${i + 1}`)).join("");
  function tenorEmbed(postId, title, url, searchUrl, side) {
    return `<div class="tenor-sticker tenor-sticker-${side}" aria-label="${title}"><div class="tenor-gif-embed" data-postid="${postId}" data-share-method="host" data-aspect-ratio="1" data-width="100%"><a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a> from <a href="${searchUrl}" target="_blank" rel="noopener noreferrer">Tenor Stickers</a></div></div>`;
  }
  function activateTenorEmbeds() {
    if (tenorScriptLoading || !sceneRoot.querySelector(".tenor-gif-embed")) return;
    tenorScriptLoading = true;
    const script = document.createElement("script");
    script.src = "https://tenor.com/embed.js";
    script.async = true;
    script.onload = script.onerror = () => { tenorScriptLoading = false; script.remove(); };
    document.head.appendChild(script);
  }

  function updateProgress() {
    progress.innerHTML = sceneNames.map((name, i) => `<span class="progress-star ${i < state.scene ? "is-done" : ""} ${i === state.scene ? "is-current" : ""}" aria-label="${escapeHTML(name)}${i === state.scene ? ", current scene" : i < state.scene ? ", complete" : ""}">${i < state.scene ? "★" : "☆"}</span>`).join("");
    progress.setAttribute("aria-valuenow", String(state.scene + 1));
    progressCaption.textContent = sceneNames[state.scene];
  }

  function moveTo(next, options = {}) {
    if (state.busy || next < 0 || next >= sceneNames.length) return;
    if (!options.force && next === state.scene) return;
    state.busy = true;
    sceneRoot.classList.add("is-leaving");
    window.setTimeout(() => {
      state.scene = next;
      render();
      window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      sceneRoot.classList.remove("is-leaving");
      state.busy = false;
    }, 180);
  }

  function skipButton() { return `<button class="text-button skip-button" data-action="skip" type="button">Skip this scene <span aria-hidden="true">→</span></button>`; }
  function sparkle() { return `<span class="doodle doodle-one" aria-hidden="true">✦</span><span class="doodle doodle-two" aria-hidden="true">✧</span><span class="doodle doodle-three" aria-hidden="true">♡</span>`; }
  function renderOpening() {
    return `<article class="scene-card opening-card">${sparkle()}<div class="eyebrow"><span class="eyebrow-line"></span> a little surprise for you <span class="eyebrow-line"></span></div><div class="sticker-row opening-sticker-row">${stickerSetMarkup(story.stickers?.opening,"Cute bear sticker","opening-sticker")}</div><h1>${escapeHTML(story.opening)}</h1><p class="scene-subtitle">${escapeHTML(story.openingSubtitle)}</p><button class="button button-primary button-large" data-action="begin" type="button">Open your surprise <span aria-hidden="true">→</span></button><div class="opening-footnote"><span>take your time</span><span class="footnote-dot">·</span><span>made just for you</span></div></article>`;
  }
  function renderBalloons() {
    const colors = ["pink", "lilac", "peach", "blue", "rose"];
    const words = story.balloonWords || [];
    const all = state.popped.size === words.length;
    return `<article class="scene-card balloons-card"><div class="eyebrow">a little birthday fun</div><h1>Pop a little happiness</h1><p class="scene-subtitle">Each balloon is hiding a little piece of a message.</p><div class="balloon-stage">${tenorEmbed("16042385041696037829","Finger Guns Dudu Sticker","https://tenor.com/view/finger-guns-dudu-gif-16042385041696037829","https://tenor.com/search/finger+guns-stickers","left")}<div class="balloon-field" aria-label="Five balloons">${words.map((_,i) => `<div class="balloon-slot ${state.popped.has(i) ? "is-revealed" : ""}"><span class="balloon-word" aria-hidden="true">${escapeHTML(words[i] || "♡")}</span><button class="balloon ${colors[i % colors.length]} ${state.popped.has(i) ? "is-popped" : ""}" data-action="pop" data-index="${i}" aria-label="${state.popped.has(i) ? `Balloon ${i+1} popped, revealed ${escapeHTML(words[i] || "a word")}` : `Pop balloon ${i+1}`}" ${state.popped.has(i) ? "disabled" : ""} type="button"><span class="balloon-shine"></span><span class="balloon-knot"></span><span class="balloon-string"></span><span class="balloon-number">${i+1}</span></button></div>`).join("")}</div>${tenorEmbed("1627045753181950483","Pizza Sticker","https://tenor.com/view/pizza-gif-1627045753181950483","https://tenor.com/search/pizza-stickers","right")}</div><div class="balloon-message ${all ? "is-visible" : ""}" aria-live="polite">${all ? `<span class="message-sparkle" aria-hidden="true">✦</span>${escapeHTML(words.join(" "))}<span class="message-sparkle" aria-hidden="true">✦</span>` : `<span class="message-hint">${state.popped.size} of ${words.length} balloons popped</span>`}</div><div class="balloon-footer">${all ? `<button class="button button-primary" data-action="next" type="button">Make a birthday wish <span aria-hidden="true">→</span></button>` : skipButton()}</div></article>`;
  }
  function renderCandle() {
    return `<article class="scene-card candle-card"><div class="eyebrow">a birthday wish, just for you</div><h1>Make a wish, ${nickname()}</h1><p class="scene-subtitle">Tap the candle when you’re ready.</p><button class="candle-wrap ${state.candleOut ? "is-out" : ""}" data-action="candle" aria-label="${state.candleOut ? "The candle is out" : "Extinguish the birthday candle"}" type="button" ${state.candleOut ? "disabled" : ""}><span class="flame"><i></i></span><span class="smoke">〰</span><span class="candle"><span class="candle-wick"></span><span class="candle-drip"></span><span class="candle-stripe"></span></span><span class="candle-base"></span><span class="cake"><span class="cake-layer cake-top"></span><span class="cake-layer cake-bottom"></span><span class="plate"></span></span><span class="candle-sparkle sparkle-a">✦</span><span class="candle-sparkle sparkle-b">✧</span></button><div class="wish-copy ${state.candleOut ? "is-visible" : ""}" aria-live="polite">${state.candleOut ? `<span class="wish-label">your wish is on its way</span><p>${escapeHTML(story.candleWish)}</p><button class="button button-primary" data-action="next" type="button">A few favorite moments <span aria-hidden="true">→</span></button>` : `<span class="wish-hint">Close your eyes and think of something lovely</span>${skipButton()}`}</div></article>`;
  }
  function renderPhoto() {
    const p = story.photos[state.photo] || {src:"",caption:"A favorite moment to remember.",date:"",note:""};
    const src = safeUrl(p.src || "");
    const cinematic = state.photo % 2 === 1;
    const noteOpen = state.photoNoteOpen && Boolean(p.note);
    return `<article class="scene-card photos-card"><div class="eyebrow">a few pages from our story</div><h1>Little moments, kept close</h1><p class="scene-subtitle photo-subtitle">Swipe or use the arrows to browse the memories.</p><div class="photo-layout ${cinematic ? "is-cinematic" : "is-polaroid"}" id="photo-swipe"><div class="photo-frame">${src ? `<img src="${escapeHTML(src)}" alt="Photo ${state.photo + 1}: ${escapeHTML(p.caption)}" draggable="false" onload="this.closest('.photo-frame').classList.toggle('is-portrait',this.naturalHeight>this.naturalWidth)" onerror="this.hidden=true;this.closest('.photo-frame').classList.remove('is-portrait');this.nextElementSibling.hidden=false"><div class="photo-placeholder" hidden>${photoPlaceholder(state.photo)}</div>` : `<div class="photo-placeholder">${photoPlaceholder(state.photo)}</div>`}<span class="photo-decoration" aria-hidden="true">${state.photo % 2 ? "✦" : "♡"}</span></div><div class="photo-caption"><p>${escapeHTML(p.caption)}</p>${p.date ? `<span class="photo-date">${escapeHTML(p.date)}</span>` : ""}${p.note ? `<button class="photo-note-toggle" data-action="toggle-photo-note" type="button" aria-expanded="${noteOpen}" aria-controls="photo-note">${noteOpen ? "Hide our little note" : "Tap for a little note ♡"}</button>${noteOpen ? `<p class="photo-note" id="photo-note" aria-live="polite">${escapeHTML(p.note)}</p>` : ""}` : ""}</div></div><div class="photo-controls"><button class="icon-button" data-action="previous" type="button" aria-label="Previous photo" ${state.photo === 0 ? "disabled" : ""}>←</button><span class="photo-count">${String(state.photo+1).padStart(2,"0")} <i>/</i> ${String(story.photos.length).padStart(2,"0")}</span><button class="icon-button" data-action="next-photo" type="button" aria-label="Next photo">→</button></div><div class="photo-bottom">${state.photo === story.photos.length - 1 ? `<button class="button button-primary" data-action="next" type="button">Read your letter <span aria-hidden="true">→</span></button>` : skipButton()}</div></article>`;
  }
  function photoPlaceholder(i) { return `<span class="placeholder-sun">☼</span><span class="placeholder-label">your photo<br><b>${String(i+1).padStart(2,"0")}</b></span><span class="placeholder-hint">add a picture in<br><code>assets/photos/</code></span>`; }
  function renderLetter() {
    return `<article class="scene-card letter-card"><div class="eyebrow">a little note from me to you</div><h1>Something I want you to know</h1><p class="scene-subtitle">${state.envelopeOpen ? "All of it, just for you." : "There’s a letter with your name on it."}</p><button class="envelope ${state.envelopeOpen ? "is-open" : ""}" data-action="envelope" type="button" aria-label="${state.envelopeOpen ? "Letter opened" : "Open your birthday letter"}" ${state.envelopeOpen ? "disabled" : ""}><span class="envelope-shadow"></span><span class="letter-peek"><span>for ${nickname()}</span><i>♡</i></span><span class="envelope-back"></span><span class="envelope-flap"></span><span class="envelope-front"></span><span class="envelope-seal">♡</span></button><div class="letter-body ${state.envelopeOpen ? "is-visible" : ""}" aria-live="polite">${state.envelopeOpen ? `<div class="letter-paper"><span class="letter-topline">with love, always</span><div class="letter-text">${lineBreaks(story.letter)}</div><span class="letter-heart" aria-hidden="true">♡</span></div><button class="button button-primary" data-action="next" type="button">One last little thing <span aria-hidden="true">→</span></button>` : `<span class="wish-hint">Tap the envelope to open</span>${skipButton()}`}</div></article>`;
  }
  function renderFinale() {
    return `<article class="scene-card finale-card"><div class="finale-sky" aria-hidden="true"><span>♡</span><span>✦</span><span>✧</span><span>♡</span><span>·</span><span>✦</span><span>♡</span></div><div class="eyebrow">and now, my favorite part</div><div class="finale-heart" aria-hidden="true">♡<span>✦</span></div><h1>${escapeHTML(story.finalWish)}</h1><p class="finale-promise">${escapeHTML(story.finalPromise)}</p><div class="sticker-row finale-sticker-row">${stickerSetMarkup(story.stickers?.finale,"Sweet celebration sticker","finale-sticker")}</div><div class="finale-rule"><span></span> forever on your team <span></span></div><button class="button button-secondary" data-action="replay" type="button"><span aria-hidden="true">↺</span> Relive your surprise</button><p class="finale-signoff">all my love, always <span>♡</span></p></article>`;
  }

  const renderers = [renderOpening, renderBalloons, renderCandle, renderPhoto, renderLetter, renderFinale];
  function render() {
    updateProgress();
    state.lastMessage = state.scene === 1 ? state.lastMessage : "";
    sceneRoot.innerHTML = renderers[state.scene]();
    activateTenorEmbeds();
    sceneRoot.classList.remove("is-leaving");
  }

  function notify(message) { toast.textContent = message; toast.classList.add("is-visible"); clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200); }
  function advanceSkippedScene() {
    if (state.scene === 1) state.popped = new Set((story.balloonWords || []).map((_,i) => i));
    if (state.scene === 2) state.candleOut = true;
    if (state.scene === 3) state.photo = story.photos.length - 1;
    if (state.scene === 4) state.envelopeOpen = true;
    moveTo(state.scene + 1);
  }
  function setPhoto(index) { if (index < 0 || index >= story.photos.length) return; state.photo = index; state.photoNoteOpen = false; render(); }
  function reset() { Object.assign(state, { scene:0, popped:new Set(), candleOut:false, photo:0, photoNoteOpen:false, envelopeOpen:false, busy:false, lastMessage:"" }); render(); }

  sceneRoot.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button || button.disabled || state.busy) return;
    switch (button.dataset.action) {
      case "begin": moveTo(1); break;
      case "pop": {
        const i = Number(button.dataset.index);
        if (!Number.isInteger(i) || state.popped.has(i)) return;
        state.popped.add(i);
        const balloon = button; balloon.classList.add("is-popping");
        window.setTimeout(() => { if (state.scene === 1) render(); }, 340);
        break;
      }
      case "candle": state.candleOut = true; render(); break;
      case "previous": setPhoto(state.photo - 1); break;
      case "next-photo": setPhoto(state.photo + 1); break;
      case "toggle-photo-note": state.photoNoteOpen = !state.photoNoteOpen; render(); break;
      case "envelope": state.envelopeOpen = true; render(); break;
      case "next": moveTo(state.scene + 1); break;
      case "skip": advanceSkippedScene(); break;
      case "replay": document.querySelector("#replay-dialog").showModal(); break;
    }
  });
  document.querySelector("#cancel-replay").addEventListener("click", () => document.querySelector("#replay-dialog").close());
  document.querySelector("#confirm-replay").addEventListener("click", () => { document.querySelector("#replay-dialog").close(); reset(); });

  let pointerStart = null;
  sceneRoot.addEventListener("pointerdown", e => {
    if (state.scene !== 3 || !e.target.closest("#photo-swipe") || e.target.closest("button") || !e.isPrimary) return;
    pointerStart = { id:e.pointerId, x:e.clientX, y:e.clientY };
  });
  sceneRoot.addEventListener("pointerup", e => {
    if (!pointerStart || e.pointerId !== pointerStart.id) return;
    const dx = e.clientX - pointerStart.x;
    const dy = e.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) setPhoto(state.photo + (dx < 0 ? 1 : -1));
  });
  sceneRoot.addEventListener("pointercancel", () => { pointerStart = null; });
  document.addEventListener("keydown", e => {
    if (state.scene !== 3 || e.altKey || e.ctrlKey || e.metaKey || e.target.closest("button,input,textarea,select,[contenteditable='true']")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); setPhoto(state.photo + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); setPhoto(state.photo - 1); }
  });

  musicButton.addEventListener("click", () => {
    if (!spotifyTrackId) { notify("Add a Spotify track ID in content.js to set the song."); return; }
    musicDialog.showModal();
  });
  document.querySelector("#music-close").addEventListener("click", () => musicDialog.close());
  musicDialog.addEventListener("click", event => { if (event.target === musicDialog) musicDialog.close(); });

  render();
})();
