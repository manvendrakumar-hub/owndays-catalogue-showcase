/* Product page tab: for each product (PID) two phones side by side, today and proposed, plus a list that reorders the proposed phone.
   Products are stacked one under the other; each keeps its own order. The phones are sized to fit one screen.
   The phone shows the real owndays.com mobile product page (header, photo carousel, title and price, best offers,
   colours, delivery, details, stores, promises, similar products, sticky "Select Lenses" bar). Only the media at the top differs.
   Data: data/pdp.json ({ products: [...] }). Plain JavaScript, no libraries. Videos load and play only while on screen. */
(function () {
  "use strict";
  var root = document.getElementById("pdp-root");
  if (!root) { return; }
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* line icons share one style (see .ic in pdp.css); fills are set per icon */
  function ic(path, cls) { return '<svg class="ic' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + path + "</svg>"; }
  var I = {
    back: ic('<path d="M20 12H5M11 5l-7 7 7 7"/>'),
    share: ic('<circle cx="18" cy="5.5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="18.5" r="2.6"/><path d="M8.3 10.8l7.4-4.1M8.3 13.2l7.4 4.1"/>'),
    heart: ic('<path d="M12 20.3S4 15.4 4 9.4A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 8 2.2c0 6-8 10.9-8 10.9z"/>'),
    bag: ic('<path d="M5 8h14l-1 12H6zM9 8V6.5a3 3 0 0 1 6 0V8"/>'),
    menu: ic('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    search: ic('<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5 20 20"/>'),
    target: ic('<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>'),
    pin: ic('<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>'),
    truck: ic('<path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/><path d="M5 9.5h5"/>'),
    bolt: '<svg class="bolt" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 2 5 13.5h5.8L9.5 22 19 10h-6z"/></svg>',
    badge: '<svg class="badge" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.8l2.4 1.9 3-.4 1.1 2.8 2.8 1.2-.4 3 1.9 2.3-1.9 2.4.4 3-2.8 1.1-1.1 2.8-3-.4L12 22.2l-2.4-1.9-3 .4-1.1-2.8L2.7 16.8l.4-3L1.3 11.5l1.9-2.4-.4-3L5.6 5l1.2-2.8 3 .4z"/><path class="w" d="M8.6 15.4 15.4 8.6"/><circle class="wf" cx="9" cy="9" r="1.3"/><circle class="wf" cx="15" cy="15" r="1.3"/></svg>',
    chat: ic('<path d="M3.5 5.5h11a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H9l-3.5 2.8v-2.8h-2A1.5 1.5 0 0 1 2 13V7a1.5 1.5 0 0 1 1.5-1.5zM17 9.5h3.5A1.5 1.5 0 0 1 22 11v6a1.5 1.5 0 0 1-1.5 1.5H19V21l-3-2.5h-4"/>'),
    sparkle: '<svg class="spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c.8 4.6 2.4 7.2 8 10-5.6 2.8-7.2 5.4-8 10-.8-4.6-2.4-7.2-8-10 5.6-2.8 7.2-5.4 8-10z"/></svg>',
    shareBox: ic('<path d="M12 15V3.5M8 7l4-4 4 4M7.5 10.5H6a1 1 0 0 0-1 1V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8.5a1 1 0 0 0-1-1h-1.5"/>'),
    similar: ic('<rect x="7.5" y="4.5" width="9" height="15" rx="2"/><path d="M4 7.5v9M20 7.5v9"/>'),
    chevR: '<svg class="chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1.5 7.2 5 3 8.5z"/></svg>',
    chevBig: ic('<path d="M9 5l7 7-7 7"/>'),
    prev: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M9 2 4 7l5 5"/></svg>',
    next: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M5 2l5 5-5 5"/></svg>',
    up: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 9l5-5 5 5"/></svg>',
    down: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 5l5 5 5-5"/></svg>',
    play: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11l9-5.5z"/></svg>',
    pause: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 1.5h3v11h-3zM8.5 1.5h3v11h-3z"/></svg>',
    signal: '<svg viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>',
    wifi: '<svg viewBox="0 0 17 12" aria-hidden="true"><path d="M8.5 11.2 6.3 8.9a3.1 3.1 0 0 1 4.4 0zM3.7 6.6a6.8 6.8 0 0 1 9.6 0l-1.3 1.4a4.9 4.9 0 0 0-7 0zM.9 3.7a10.8 10.8 0 0 1 15.2 0l-1.3 1.4a8.9 8.9 0 0 0-12.6 0z"/></svg>',
    battery: '<svg viewBox="0 0 27 13" aria-hidden="true"><rect x=".6" y=".6" width="22.8" height="11.8" rx="3.4" fill="none" stroke="#000" opacity=".4"/><rect x="2.2" y="2.2" width="19.6" height="8.6" rx="2.2"/><path d="M25 4.4v4.2c.9-.3 1.5-1.2 1.5-2.1S25.900 4.700 25 4.400z" opacity=".5"/></svg>'
  };

  /* flat illustrations for the promise cards and the delivery card (light blue, drawn for this mock-up) */
  var ART = {
    ship: '<svg viewBox="0 0 120 90" aria-hidden="true"><path d="M8 36c9-7 17-7 26-2-9 0-16 3-23 9z" fill="#fff" stroke="#9fd0ea"/><rect x="18" y="32" width="52" height="30" rx="4" fill="#79bde8"/><path d="M70 42h18l11 11v9H70z" fill="#4a9fd8"/><rect x="77" y="46" width="11" height="8" rx="1" fill="#d9f0fb"/><circle cx="36" cy="64" r="7.5" fill="#2b5d84"/><circle cx="36" cy="64" r="3" fill="#cfe9f7"/><circle cx="88" cy="64" r="7.5" fill="#2b5d84"/><circle cx="88" cy="64" r="3" fill="#cfe9f7"/></svg>',
    off: '<svg viewBox="0 0 120 90" aria-hidden="true"><circle cx="38" cy="44" r="17" fill="none" stroke="#5aaee0" stroke-width="5"/><circle cx="82" cy="44" r="17" fill="none" stroke="#5aaee0" stroke-width="5"/><path d="M55 42c3-3 7-3 10 0M21 38 8 30M99 38l13-8" fill="none" stroke="#5aaee0" stroke-width="5" stroke-linecap="round"/><g transform="rotate(-16 60 50)"><rect x="18" y="41" width="84" height="18" fill="#3f93cf"/><text x="60" y="54.500" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="Arial,sans-serif">50% OFF</text></g></svg>',
    warranty: '<svg viewBox="0 0 120 90" aria-hidden="true"><path d="M60 6 94 17v25c0 18-14 30-34 38C40 72 26 60 26 42V17z" fill="#7cc4ee"/><path d="M60 6 94 17v25c0 18-14 30-34 38z" fill="#5aaee0"/><text x="60" y="52" text-anchor="middle" font-size="34" font-weight="700" fill="#fff" font-family="Arial,sans-serif">1</text><path d="M32 60h56l-6 9H38z" fill="#e8b24a"/></svg>',
    care: '<svg viewBox="0 0 120 90" aria-hidden="true"><circle cx="38" cy="50" r="17" fill="none" stroke="#5aaee0" stroke-width="5"/><circle cx="80" cy="50" r="17" fill="none" stroke="#5aaee0" stroke-width="5"/><path d="M55 48c3-3 7-3 10 0" fill="none" stroke="#5aaee0" stroke-width="5" stroke-linecap="round"/><path d="M92 14 70 36" stroke="#3f93cf" stroke-width="7" stroke-linecap="round"/><circle cx="96" cy="12" r="10" fill="none" stroke="#3f93cf" stroke-width="5"/></svg>',
    scooter: '<svg viewBox="0 0 120 80" aria-hidden="true"><circle cx="26" cy="60" r="10" fill="#fff" stroke="#16658f" stroke-width="4"/><circle cx="92" cy="60" r="10" fill="#fff" stroke="#16658f" stroke-width="4"/><path d="M26 60h14c4 0 6-3 7-6l6-22h12M52 32h-4M70 60c0-12 6-22 14-24l8 24" fill="none" stroke="#16658f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 52h38l4 8H40z" fill="#1c9ac9"/><rect x="14" y="14" width="26" height="22" fill="#fff" stroke="#16658f" stroke-width="4"/><path d="M14 22h26" stroke="#16658f" stroke-width="4"/></svg>'
  };
  var BEN = {
    lens: ic('<ellipse cx="8" cy="14" rx="5.500" ry="4" transform="rotate(-20 8 14)"/><ellipse cx="17" cy="11" rx="5.500" ry="4" transform="rotate(-20 17 11)"/><path d="M13 12.500l.8-.3M19.500 4.500v3M18 6h3M5 5v2.500M3.800 6.300h2.500"/>', "ben"),
    eye: ic('<path d="M2.500 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12z"/><circle cx="12" cy="12" r="3"/>', "ben"),
    repair: ic('<circle cx="7" cy="14" r="4"/><circle cx="17" cy="14" r="4"/><path d="M11 13.500c.6-.6 1.400-.6 2 0M3.200 12.500 2 7.500M20.800 12.500 22 7.500"/>', "ben"),
    care: ic('<path d="M12 2.500 17.500 4.500v4.500c0 3-2.200 5-5.500 6-3.300-1-5.500-3-5.500-6V4.500z"/><path d="m9.800 8.800 1.600 1.600 2.800-2.800M2.500 17.500h4l3 2h5.500c1 0 1.500.9.800 1.600L12.500 22.500l-6-1.500H2.500"/>', "ben")
  };

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) { n.className = cls; } if (text !== undefined && text !== null) { n.textContent = text; } return n; }
  function html(tag, cls, markup) { var n = el(tag, cls); n.innerHTML = markup; return n; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var PHONE_W = 413, PHONE_H = 872, MAX_SCALE = 0.9, MIN_SCALE = 0.5, GAP = 28, SEQ_MIN = 300;
  var io = null, products = [];

  /* one carousel: slides = [{type:'image'|'video', src|video, poster, alt, chip, note}] */
  function carousel(label, slides, opts) {
    opts = opts || {};
    var box = el("div", "car");
    box.setAttribute("role", "group"); box.setAttribute("aria-roledescription", "carousel"); box.setAttribute("aria-label", label);
    var stage = el("div", "car-stage");
    var track = el("div", "car-track"); track.tabIndex = 0;
    track.setAttribute("aria-label", label + ", use the left and right arrow keys");
    var prev = html("button", "car-btn prev", I.prev), next = html("button", "car-btn next", I.next);
    prev.type = next.type = "button"; prev.setAttribute("aria-label", "Previous"); next.setAttribute("aria-label", "Next");
    var dots = el("div", "car-dots"); dots.setAttribute("aria-hidden", "true");
    var dotEls = [];
    var idx = 0, visible = false, videos = [];

    slides.forEach(function (s, i) {
      var li = el("div", "car-slide");
      li.setAttribute("role", "group"); li.setAttribute("aria-roledescription", "slide"); li.setAttribute("aria-label", (i + 1) + " of " + slides.length + (s.chip ? ", " + s.chip : ""));
      if (s.type === "video") {
        var v = document.createElement("video");
        v.muted = true; v.loop = true; v.playsInline = true; v.preload = "none"; v.poster = s.poster || "";
        v.setAttribute("aria-label", s.alt || s.chip || "Video"); v.setAttribute("data-src", s.video);
        li.appendChild(v);
        var pb = html("button", "car-play", reduce ? I.play : I.pause); pb.type = "button";
        pb.setAttribute("aria-label", reduce ? "Play video" : "Pause video");
        pb.addEventListener("click", function () {
          if (v.paused) { v.userPaused = false; load(v); v.play().catch(function () {}); } else { v.userPaused = true; v.pause(); }
        });
        v.addEventListener("play", function () { pb.innerHTML = I.pause; pb.setAttribute("aria-label", "Pause video"); });
        v.addEventListener("pause", function () { pb.innerHTML = I.play; pb.setAttribute("aria-label", "Play video"); });
        li.appendChild(pb);
        if (reduce) { v.userPaused = true; }
        videos.push({ v: v, i: i });
      } else {
        var im = document.createElement("img"); im.src = s.src; im.alt = s.alt || ""; im.decoding = "async"; if (i > 1) { im.loading = "lazy"; }
        li.appendChild(im);
      }
      if (s.chip) { li.appendChild(el("span", "car-chip", s.chip)); }
      if (s.note) { li.appendChild(el("div", "car-note", s.note)); }
      track.appendChild(li);
      var dot = el("i"); dots.appendChild(dot); dotEls.push(dot);
    });
    stage.appendChild(track); stage.appendChild(prev); stage.appendChild(next);
    box.appendChild(stage); box.appendChild(dots);

    function load(v) { var s = v.getAttribute("data-src"); if (s) { v.removeAttribute("data-src"); v.preload = "metadata"; v.src = s; } }
    function sync() {
      dotEls.forEach(function (d, i) { if (i === idx) { d.setAttribute("data-on", ""); } else { d.removeAttribute("data-on"); } });
      prev.disabled = idx === 0; next.disabled = idx === slides.length - 1;
      videos.forEach(function (o) {
        var near = Math.abs(o.i - idx) <= 1;
        if (near && visible) { load(o.v); }
        if (o.i === idx && visible && !document.hidden && !reduce && !o.v.userPaused) { var p = o.v.play(); if (p && p.catch) { p.catch(function () {}); } }
        else { o.v.pause(); }
      });
      if (opts.onChange) { opts.onChange(idx); }
    }
    function goTo(i, instant) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior: (reduce || instant) ? "auto" : "smooth" });
      if (instant) { idx = i; sync(); }
    }
    var raf = 0;
    track.addEventListener("scroll", function () {
      if (raf) { return; }
      raf = requestAnimationFrame(function () {
        raf = 0;
        var n = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
        if (n !== idx) { idx = n; sync(); }
      });
    }, { passive: true });
    prev.addEventListener("click", function () { goTo(idx - 1); });
    next.addEventListener("click", function () { goTo(idx + 1); });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(idx + 1); } else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(idx - 1); }
    });
    sync();
    return {
      node: box, goTo: goTo, index: function () { return idx; },
      setVisible: function (on) { visible = on; sync(); },
      pauseAll: function () { videos.forEach(function (o) { o.v.pause(); }); },
      resync: sync
    };
  }

  /* play only what is on screen (one observer for every phone on the tab) */
  function observe(screen, car) {
    if (!("IntersectionObserver" in window)) { car.setVisible(true); return; }
    if (!io) {
      io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { en.target.__car && en.target.__car.setVisible(en.isIntersecting); }); }, { threshold: 0.3 });
    }
    screen.__car = car; io.observe(screen);
  }
  document.addEventListener("visibilitychange", function () {
    products.forEach(function (pr) { pr.cars().forEach(function (c) { c.pauseAll(); if (!document.hidden) { c.resync(); } }); });
  });

  /* ---------- one product: its head, the two phones and the sequence list ---------- */
  function makeProduct(D) {
    var order = D.blocks.map(function (b) { return b.id; });
    var proposed = null, today = null, live = null, stage = null, headEl = null, proposedCol = null, seqHost = null;
    var kindsBtns = [], kindsRow = null, slideBlocks = [];
    function block(id) { return D.blocks.filter(function (x) { return x.id === id; })[0]; }

    /* ---------- the rest of the real page, below the carousel (the same on both phones) ---------- */
    function section(cls, markup) { return html("section", "pg " + cls, markup); }
    function band() { return el("div", "band"); }

    function titleBlock() {
      var P = D.page;
      return section("pg-title",
        '<div class="ttl"><h3>' + esc(D.title) + "</h3>" + I.heart.replace('class="ic"', 'class="ic fav"') + "</div>" +
        '<p class="sub">' + esc(P.subtitle) + "</p>" +
        '<p class="price">' + esc(P.price) + "</p>" +
        '<p class="incl">' + esc(P.priceNote) + "</p>" +
        '<div class="dchip">' + I.bolt + "<span>" + esc(P.deliveryChip) + "</span></div>" +
        '<div class="qrow">' + P.chips.map(function (c, i) { return '<span class="qchip">' + (i === P.chips.length - 1 ? I.similar : "") + esc(c) + "</span>"; }).join("") + "</div>");
    }
    function offersBlock() {
      var O = D.page.offer;
      return section("pg-offers",
        "<h4>Best Offers</h4>" +
        '<div class="offer"><div class="offer-h">' + esc(O.heading) + '</div><div class="offer-b"><b>' + esc(O.title) + "</b><span>" + I.badge + esc(O.text) + "</span></div></div>");
    }
    function coloursBlock() {
      var sw = D.page.colours.map(function (c) {
        var bg = "linear-gradient(#b4b5b9 50%, transparent 50%), " + (c.fill || c.hex);
        return '<span class="sw' + (c.selected ? " on" : "") + '" title="' + esc(c.name) + '"><i style="background:' + esc(bg) + '"></i></span>';
      }).join("");
      return section("pg-colours", '<span class="lab">Color<br>Options</span><div class="sws">' + sw + "</div>");
    }
    function deliveryBlock() {
      var Y = D.page.delivery;
      return section("pg-delivery",
        "<h4 class=\"big\">Delivery Details</h4>" +
        '<div class="loc"><span class="pinbox">' + I.pin + "</span><div><b>" + esc(Y.place) + "</b><span>" + esc(Y.area) + "</span></div></div>" +
        '<div class="dcard"><div class="dtop"><div><b>' + esc(Y.by) + " " + I.bolt + "</b><span>" + esc(Y.tagline) + "</span></div>" + ART.scooter + "</div>" +
        '<div class="dget">' + I.truck + "<b>" + esc(Y.date) + "</b></div></div>" +
        '<p class="dnote">' + esc(Y.note) + "</p>");
    }
    function detailsBlock() {
      var rows = D.page.details.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("");
      return section("pg-details", "<h4>Product Details</h4><dl>" + rows + '</dl><span class="more">' + esc(D.page.moreDetails) + "</span>");
    }
    function storesBlock() {
      var S = D.page.stores;
      return section("pg-stores",
        '<div class="hrow"><h4 class="big">' + esc(S.title) + '</h4><span class="btn-dark">' + esc(S.button) + "</span></div>" +
        '<div class="find">' + I.search + "<span>" + esc(S.search) + "</span></div>" +
        '<p class="loca">' + I.target + "<u>" + esc(S.location) + "</u></p>" +
        '<p class="benl">' + esc(S.benefitsLabel) + "</p>" +
        '<div class="bens">' + S.benefits.map(function (b) { return '<div class="benc"><span>' + BEN[b[0]] + "</span><b>" + esc(b[1]) + "</b></div>"; }).join("") + "</div>");
    }
    function promisesBlock() {
      var cards = D.page.promises.map(function (p) {
        return '<div class="prom">' + ART[p[0]] + "<b>" + esc(p[1]) + '</b><span class="learn">Learn More ' + I.chevR + "</span></div>";
      }).join("");
      return section("pg-promises", '<div class="hscroll">' + cards + "</div>");
    }
    function similarBlock() {
      var M = D.page.similar;
      var cards = M.items.map(function (it) {
        return '<div class="sim"><div class="sim-i"><img src="' + esc(it.src) + '" alt="" loading="lazy">' + I.heart.replace('class="ic"', 'class="ic fav"') + "</div>" +
          '<b class="sim-n">' + esc(it.name) + '</b><span class="sim-l">Lenses included</span><b class="sim-p">' + esc(it.price) + '</b><span class="sim-v">View</span></div>';
      }).join("");
      return section("pg-similar",
        '<div class="hrow"><h4 class="big">' + esc(M.title) + '</h4><span class="viewall"><u>' + esc(M.viewAll) + "</u>" + I.chevBig + "</span></div>" +
        '<div class="hscroll">' + cards + "</div>");
    }

    /* the phone around a carousel */
    function phone(title, car, mediaRow) {
      var box = el("div", "phone-box");
      var p = el("div", "phone"); p.setAttribute("role", "group"); p.setAttribute("aria-label", title + ", product " + D.pid + ", phone mock-up");
      var scr = el("div", "screen");
      scr.appendChild(el("div", "island"));
      var st = el("div", "status"); st.appendChild(el("span", null, "9:41")); st.appendChild(html("span", "st-r", I.signal + I.wifi + I.battery)); scr.appendChild(st);
      var url = el("div", "urlbar"); url.appendChild(html("div", "url", I.sparkle + "<span>owndays.com</span>" + I.shareBox)); scr.appendChild(url);

      var page = el("div", "page");
      var head = el("div", "p-head");
      head.appendChild(html("span", "hb", I.back));
      head.appendChild(el("span", "ht", D.title));
      head.appendChild(html("span", "hi", I.share + I.heart + I.bag + I.menu));
      page.appendChild(head);
      page.appendChild(car.node);
      if (mediaRow) { page.appendChild(mediaRow); }
      page.appendChild(el("div", "rule"));
      page.appendChild(titleBlock());
      page.appendChild(band());
      page.appendChild(offersBlock());
      page.appendChild(band());
      page.appendChild(coloursBlock());
      page.appendChild(deliveryBlock());
      page.appendChild(band());
      page.appendChild(detailsBlock());
      page.appendChild(storesBlock());
      page.appendChild(promisesBlock());
      page.appendChild(band());
      page.appendChild(similarBlock());
      scr.appendChild(page);

      scr.appendChild(html("div", "help", I.chat + "<span>Need Help?</span>"));
      var B = D.page.bar, bar = el("div", "bar");
      bar.appendChild(html("div", "bar-l", "<b>" + esc(B.price) + "</b> <em>" + esc(B.unit) + "</em><span>" + esc(B.sub) + "</span>"));
      bar.appendChild(el("div", "bar-cta", B.cta));
      scr.appendChild(bar);
      scr.appendChild(el("div", "home"));
      p.appendChild(scr); box.appendChild(p);

      var raf = 0;
      page.addEventListener("scroll", function () {
        if (raf) { return; }
        raf = requestAnimationFrame(function () { raf = 0; head.classList.toggle("scrolled", page.scrollTop > PHONE_W + 8); });
      }, { passive: true });
      return { node: box, screen: scr, page: page };
    }
    function column(name, tag, ph) {
      var c = el("div", "pdp-col");
      var h = el("div", "pdp-col-h"); h.appendChild(el("b", null, name)); h.appendChild(el("span", null, tag));
      c.appendChild(h); if (ph) { c.appendChild(ph.node); }
      return c;
    }

    /* the phones are drawn at the real width of a phone page (393 px) and scaled so that a whole phone fits one screen */
    function fit(vh, tabsH) {
      var w = stage.clientWidth;
      if (w < 120) { return; }
      var narrow = window.matchMedia("(max-width: 760px)").matches, mid = window.matchMedia("(max-width: 1100px)").matches;
      var sw = narrow ? w / PHONE_W : (mid ? (w - GAP) / (2 * PHONE_W) : (w - 2 * GAP - SEQ_MIN) / (2 * PHONE_W));
      var colH = stage.querySelector(".pdp-col-h");
      var over = tabsH + headEl.offsetHeight + (colH ? colH.offsetHeight : 24) + 72;   // 72 = page scroll gap, section padding, head and column-head margins, bottom air
      var sh = (vh - over) / PHONE_H;
      stage.style.setProperty("--s", String(Math.max(MIN_SCALE, Math.min(MAX_SCALE, sw, sh))));
    }

    /* slides for the proposed phone, from the current order */
    function proposedSlides() {
      var out = [];
      order.forEach(function (id) {
        var b = block(id);
        if (b.type === "images") { b.items.forEach(function (it, k) { out.push({ type: "image", src: it.src, alt: it.alt + ", " + b.label + " " + (k + 1), chip: b.short, block: id }); }); }
        else if (b.type === "video") { out.push({ type: "video", video: b.video, poster: b.poster, alt: b.label, chip: b.short, note: b.id === "tryon" ? b.note : "", block: id }); }
        else { out.push({ type: "image", src: b.src, alt: b.alt, chip: b.short, block: id }); }
      });
      return out;
    }
    function renderProposed() {
      var slides = proposedSlides();
      slideBlocks = slides.map(function (s) { return s.block; });
      var kinds = el("div", "p-kinds"); kinds.setAttribute("role", "group"); kinds.setAttribute("aria-label", "Jump to a block");
      kindsRow = kinds; kindsBtns = [];
      var car = carousel("Proposed product page media, product " + D.pid, slides, { onChange: function (i) { markKind(i); } });
      order.forEach(function (id) {
        var b = block(id);
        var btn = el("button", "p-kind", b.short); btn.type = "button"; btn.setAttribute("data-block", id);
        btn.addEventListener("click", function () { car.goTo(slideBlocks.indexOf(id)); });
        kinds.appendChild(btn); kindsBtns.push(btn);
      });
      var ph = phone("Proposed product page", car, kinds);
      var old = proposed;
      proposed = { car: car, ph: ph };
      if (old) { old.car.pauseAll(); if (io) { io.unobserve(old.ph.screen); } old.ph.node.replaceWith(ph.node); } else { proposedCol.appendChild(ph.node); }
      observe(ph.screen, car);
      markKind(0);
    }
    function markKind(i) {
      var id = slideBlocks[i];
      kindsBtns.forEach(function (b) {
        if (b.getAttribute("data-block") === id) {
          b.setAttribute("aria-current", "true");
          if (kindsRow && kindsRow.scrollWidth > kindsRow.clientWidth) { kindsRow.scrollTo({ left: Math.max(0, b.offsetLeft - 28), behavior: reduce ? "auto" : "smooth" }); }
        } else { b.removeAttribute("aria-current"); }
      });
    }

    /* sequence list */
    function thumbFor(b) { return b.type === "video" ? b.poster : (b.type === "images" ? b.items[0].src : b.src); }
    function countFor(b) { return b.type === "images" ? b.items.length + " photos" : (b.type === "video" ? "Video" : "Photo"); }
    function renderSeq() {
      var ol = seqHost.querySelector("ol"); ol.innerHTML = "";
      order.forEach(function (id, i) {
        var b = block(id);
        var li = el("li");
        li.appendChild(el("span", "n", String(i + 1)));
        var t = document.createElement("img"); t.className = "thumb"; t.src = thumbFor(b); t.alt = ""; li.appendChild(t);
        var lab = el("div", "lab"); lab.appendChild(el("b", null, b.label)); lab.appendChild(el("span", null, countFor(b))); li.appendChild(lab);
        var mv = el("div", "mv");
        var up = html("button", null, I.up), dn = html("button", null, I.down);
        up.type = dn.type = "button";
        up.setAttribute("aria-label", "Move " + b.label + " up"); dn.setAttribute("aria-label", "Move " + b.label + " down");
        up.disabled = i === 0; dn.disabled = i === order.length - 1;
        up.addEventListener("click", function () { move(i, -1); }); dn.addEventListener("click", function () { move(i, 1); });
        mv.appendChild(up); mv.appendChild(dn); li.appendChild(mv); ol.appendChild(li);
      });
    }
    function announce(t) { live.textContent = ""; setTimeout(function () { live.textContent = t; }, 30); }
    function move(i, d) {
      var j = i + d; if (j < 0 || j >= order.length) { return; }
      var id = order[i]; order.splice(i, 1); order.splice(j, 0, id);
      var b = block(id);
      renderSeq(); renderProposed(); fitNow();
      var again = seqHost.querySelectorAll("li")[j].querySelectorAll("button")[d < 0 ? 0 : 1];
      if (again && !again.disabled) { again.focus(); } else { var any = seqHost.querySelectorAll("li")[j].querySelector("button:not(:disabled)"); if (any) { any.focus(); } }
      announce(b.label + " is now number " + (j + 1) + " of " + order.length + ". The proposed phone starts on " + block(order[0]).label + ".");
    }
    function resetOrder() { order = D.blocks.map(function (b) { return b.id; }); renderSeq(); renderProposed(); announce("The original order is back."); }
    function fitNow() { var tabs = document.querySelector(".tabbar"); fit(window.innerHeight, tabs ? tabs.offsetHeight : 56); }

    /* build the section */
    var root2 = el("section", "pdp-prod"); root2.id = "pdp-" + D.pid; root2.setAttribute("aria-labelledby", "pdp-h-" + D.pid);
    headEl = el("header", "pdp-prod-h");
    headEl.appendChild(el("span", "pid", "PID " + D.pid));
    var h2 = el("h2", null, D.title); h2.id = "pdp-h-" + D.pid; headEl.appendChild(h2);
    headEl.appendChild(el("span", "pm", "Model " + D.model + " · " + D.page.price.replace(/\s/g, "") + " · Scroll inside a phone to see the whole page"));
    root2.appendChild(headEl);

    stage = el("div", "pdp-stage");
    // today: the photo carousel as owndays.com shows it
    var tcar = carousel("Product " + D.pid + " today, photo gallery", D.today.map(function (s) { return { type: "image", src: s.src, alt: s.alt }; }));
    var tph = phone("Product page today", tcar, null);
    today = { car: tcar, ph: tph };
    stage.appendChild(column("Today", "As owndays.com shows it", tph));
    observe(tph.screen, tcar);
    // proposed
    proposedCol = column("Proposed", "Opens on the 3D video", null);
    stage.appendChild(proposedCol);
    // sequence list
    seqHost = el("section", "seq"); seqHost.setAttribute("aria-labelledby", "seq-h-" + D.pid);
    var h = el("h3", null, "Sequence"); h.id = "seq-h-" + D.pid; seqHost.appendChild(h);
    seqHost.appendChild(el("p", null, "The order of these blocks is a design choice and can be changed. Move a block up or down and the proposed phone follows."));
    seqHost.appendChild(el("ol"));
    var rs = el("button", "reset", "Back to the proposed order"); rs.type = "button"; rs.addEventListener("click", resetOrder); seqHost.appendChild(rs);
    live = el("div"); live.className = "sr-only"; live.setAttribute("aria-live", "polite");
    live.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap";
    seqHost.appendChild(live);
    stage.appendChild(seqHost);
    root2.appendChild(stage);
    renderSeq(); renderProposed();

    return { node: root2, fit: fit, cars: function () { return [today.car, proposed.car]; }, pid: D.pid, short: D.short || D.title };
  }

  var rafFit = 0;
  function fitAll() {
    if (rafFit) { return; }
    rafFit = requestAnimationFrame(function () {
      rafFit = 0;
      var tabs = document.querySelector(".tabbar"), tabsH = tabs ? tabs.offsetHeight : 56, vh = window.innerHeight;
      products.forEach(function (pr) { pr.fit(vh, tabsH); });
    });
  }

  function build(list) {
    root.innerHTML = "";
    products = list.map(makeProduct);
    var jump = el("nav", "pdp-jump"); jump.setAttribute("aria-label", "Products on this page");
    jump.appendChild(el("span", null, "Products"));
    products.forEach(function (pr) {
      var b = el("button", null, pr.pid + " · " + pr.short); b.type = "button";
      b.addEventListener("click", function () { pr.node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); });
      jump.appendChild(b);
    });
    root.appendChild(jump);
    products.forEach(function (pr) { root.appendChild(pr.node); });
    var pids = list.map(function (d) { return d.pid; });
    root.appendChild(el("p", "pdp-foot", "Mock-up of the page: the layout, text, price and offer follow owndays.com/sg for products " + pids.join(" and ") + " (read on 14 Oct 2026); the phone is drawn for this demonstration. The photos and videos are real outputs for each product, except the try-on video, which is a sample made for another product. Similar products and the illustrations are stand-ins."));
    fitAll();
    if ("ResizeObserver" in window) { new ResizeObserver(fitAll).observe(root); }
    window.addEventListener("resize", fitAll);
  }

  fetch("data/pdp.json", { cache: "no-cache" }).then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.json(); })
    .then(function (d) { build(d.products); })
    .catch(function () { root.innerHTML = '<p class="loadnote">The product page demo could not be loaded.</p>'; });
})();
