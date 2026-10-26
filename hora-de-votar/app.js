"use strict";

const nf = new Intl.NumberFormat("pt-BR");
const pf = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 2 });
const pf4 = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 4 });
const fmt = (n) => nf.format(n);
const UF_NAME = { zz: "Exterior" };
const ufLabel = (uf) => (uf === "zz" ? "EXT" : uf.toUpperCase());
const hhmm = (min) => {
  const d = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(d / 60)).padStart(2, "0")}:${String(d % 60).padStart(2, "0")}`;
};
const hhmmss = (sec) => `${hhmm(Math.floor(sec / 60))}:${String(((sec % 60) + 60) % 60).padStart(2, "0")}`;
const CLOSE_MIN = 17 * 60;
const SVGNS = "http://www.w3.org/2000/svg";
// where timeline.json / stats.json live: the local copy when previewing, the hora-de-votar repo
// (raw.githubusercontent.com allows cross-origin reads) when embedded on the website
const LOCAL = ["localhost", "127.0.0.1", ""].includes(location.hostname);
const DATA_BASE = LOCAL ? "data/" : "https://raw.githubusercontent.com/JnCoe/hora-de-votar/main/docs/data/";

function el(tag, attrs = {}, parent) {
  const isSvg = ["svg", "path", "line", "rect", "text", "g"].includes(tag);
  const e = isSvg ? document.createElementNS(SVGNS, tag) : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") e.textContent = v;
    else e.setAttribute(k, v);
  }
  if (parent) parent.appendChild(e);
  return e;
}
const setText = (id, text) => { document.getElementById(id).textContent = text; };

async function main() {
  const [tl, st] = await Promise.all([
    fetch(`${DATA_BASE}timeline.json`).then((r) => r.json()),
    fetch(`${DATA_BASE}stats.json`).then((r) => r.json()),
  ]);
  const slider = document.getElementById("slider");
  const minuteAt = (i) => tl.start_minute + i;
  let scope = "all";
  let N, cum, total, ufs, ufCum, rate, bars;
  const ufTable = table("t-uf", ["UF", "Votos depois", "% da UF", "Último voto"], [1, 2, 3], [], true);
  const close = responsive(document.getElementById("chart-close"),
    (w) => closeHist(document.getElementById("chart-close"), st.close_histogram_15min, w));

  // (Re)build every series for a scope: "all" = Brasil + exterior, "br" = only Brazil.
  function build() {
    const s = seriesFor(tl, scope);
    N = s.per_minute.length;
    cum = new Float64Array(N + 1);
    cum[0] = s.base;
    for (let i = 0; i < N; i++) cum[i + 1] = cum[i] + s.per_minute[i];
    total = cum[N];

    ufCum = {};
    for (const uf of s.ufs) {
      const a = new Float64Array(N + 1);
      const p = tl.by_uf[uf].per_minute;
      a[0] = tl.by_uf[uf].base;
      for (let i = 0; i < N; i++) a[i + 1] = a[i] + p[i];
      ufCum[uf] = a;
    }
    ufs = [...s.ufs].sort((a, b) => (ufCum[b][N] - ufCum[b][0]) - (ufCum[a][N] - ufCum[a][0]));

    slider.max = N;
    // tick labels under the slider, every hour
    const ticks = document.getElementById("ticks");
    ticks.replaceChildren();
    for (let m = Math.ceil(tl.start_minute / 60) * 60; m <= minuteAt(N); m += 60) {
      el("span", { text: `${m / 60}h`, style: `left:${((m - tl.start_minute) / N) * 100}%` }, ticks);
    }
    const rateHost = document.getElementById("chart-rate");
    const barsHost = document.getElementById("uf-bars");
    if (rate) rate.destroy();
    barsHost.replaceChildren();
    rate = responsive(rateHost, (w) => rateChart(rateHost, s, (i) => { stop(); setIndex(i); }, w));
    bars = ufBars(barsHost, ufs, ufCum, N);
    renderScopeTiles(st, scope);
    setText("scope-note", scope === "all"
      ? "Brasil e exterior, sempre em horário de Brasília. No exterior a votação segue o horário local: às 17:00 de Brasília, as seções nas Américas ainda estavam abertas."
      : "Só seções no Brasil, onde a votação fecha às 17:00 de Brasília em todo o país.");
  }

  for (const btn of document.querySelectorAll(".scope button")) {
    btn.addEventListener("click", () => {
      stop();
      for (const b of document.querySelectorAll(".scope button")) {
        b.setAttribute("aria-pressed", String(b === btn));
      }
      const keep = +slider.value;
      scope = btn.dataset.scope;
      build();
      setIndex(keep);
    });
  }

  function setIndex(i) {
    i = Math.max(0, Math.min(N, i));
    slider.value = i;
    const t = hhmm(minuteAt(i));
    const after = total - cum[i];
    setText("clock", t);
    for (const s of document.querySelectorAll(".js-time")) s.textContent = t;
    setText("dock-after", fmt(after));
    setText("n-before", fmt(cum[i]));
    setText("p-before", `${pf.format(cum[i] / total)} do total registrado`);
    setText("n-after", fmt(after));
    setText("p-after", `${pf4.format(after / total)} do total registrado`);
    setTile("after", `Votos depois das ${t}`, fmt(after),
      `${pf4.format(after / total)} de todos os votos${scope === "br" ? " no Brasil" : ", com o exterior"}`);
    rate.update(i);
    bars.update(i);
    close.update(minuteAt(i));
    ufTable.set(
      ufs.map((uf) => {
        const ufAfter = ufCum[uf][N] - ufCum[uf][i];
        const last = st.by_uf.find((r) => r.uf === uf);
        return [[ufLabel(uf), fmt(ufAfter), pf4.format(ufAfter / ufCum[uf][N]), last ? hhmmss(last.last_t) : "–"],
          [ufLabel(uf), ufAfter, ufAfter / ufCum[uf][N], last ? last.last_t : 0]];
      }));
  }

  slider.addEventListener("input", () => { stop(); setIndex(+slider.value); });

  let timer = null;
  const playBtn = document.getElementById("play");
  function stop() {
    clearInterval(timer); timer = null;
    playBtn.textContent = "▶"; playBtn.setAttribute("aria-label", "Reproduzir");
  }
  playBtn.addEventListener("click", () => {
    if (timer) return stop();
    if (+slider.value >= N) setIndex(0);
    playBtn.textContent = "❚❚"; playBtn.setAttribute("aria-label", "Pausar");
    timer = setInterval(() => {
      if (+slider.value >= N) return stop();
      setIndex(+slider.value + 1);
    }, Math.max(15, 9000 / N));
  });

  renderTiles();
  build();
  setIndex(CLOSE_MIN - tl.start_minute); // start at the official close
  renderStats(st, tl);
}

// Per-minute series for a scope, trimmed after its last vote.
function seriesFor(tl, scope) {
  const zz = tl.by_uf.zz;
  let base = tl.base;
  let pm = tl.per_minute;
  let ufs = Object.keys(tl.by_uf);
  if (scope === "br" && zz) {
    base -= zz.base;
    pm = pm.map((v, i) => v - zz.per_minute[i]);
    ufs = ufs.filter((u) => u !== "zz");
  }
  let n = pm.length;
  while (n > 0 && pm[n - 1] === 0) n--;
  return { base, per_minute: pm.slice(0, n), start_minute: tl.start_minute, ufs };
}

// Draws a chart at the host's real width (so labels keep their size on phones) and redraws it
// when the width changes. draw(width) returns { update(x) }; the last x is replayed on redraw.
function responsive(host, draw) {
  let view = null, last = null, w = 0;
  const render = () => {
    const nw = Math.round(host.clientWidth);
    if (!nw || nw === w) return;
    w = nw;
    host.replaceChildren();
    view = draw(w);
    if (last !== null) view.update(last);
  };
  const ro = new ResizeObserver(render);
  ro.observe(host);
  render();
  return {
    update(x) { last = x; if (view) view.update(x); },
    destroy() { ro.disconnect(); },
  };
}

// tooltip position, kept inside the chart so it never pushes the page sideways
function placeTip(tip, host, x, y) {
  tip.hidden = false;
  const half = tip.offsetWidth / 2;
  tip.style.left = `${Math.max(half, Math.min(host.clientWidth - half, x))}px`;
  tip.style.top = `${y}px`;
}

function rateChart(host, tl, onPick, W) {
  const narrow = W < 560;
  const H = narrow ? 220 : 260, P = { l: narrow ? 40 : 52, r: 10, t: 12, b: 26 };
  const N = tl.per_minute.length;
  const max = Math.max(...tl.per_minute);
  const yMax = niceMax(max);
  const x = (i) => P.l + (i / N) * (W - P.l - P.r);
  const y = (v) => H - P.b - (v / yMax) * (H - P.t - P.b);
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img",
    "aria-label": "Votos por minuto a partir das 15h" }, host);

  for (let k = 0; k <= 4; k++) {
    const v = (yMax / 4) * k;
    el("line", { class: "gridline", x1: P.l, x2: W - P.r, y1: y(v), y2: y(v) }, svg);
    el("text", { x: P.l - 8, y: y(v) + 4, "text-anchor": "end", text: compact(v) }, svg);
  }
  for (let m = Math.ceil(tl.start_minute / 60) * 60; m <= tl.start_minute + N; m += 60) {
    el("text", { x: x(m - tl.start_minute), y: H - 6, "text-anchor": "middle",
      text: `${Math.floor(m / 60) % 24}h` }, svg);
  }
  const closeI = CLOSE_MIN - tl.start_minute;
  const pts = (from, to) => {
    let d = `M${x(from)},${y(0)}`;
    for (let i = from; i < to; i++) d += `L${x(i)},${y(tl.per_minute[i])}L${x(i + 1)},${y(tl.per_minute[i])}`;
    return d + `L${x(to)},${y(0)}Z`;
  };
  const line = (from, to) => {
    let d = "";
    for (let i = from; i < to; i++) d += `${i === from ? "M" : "L"}${x(i)},${y(tl.per_minute[i])}L${x(i + 1)},${y(tl.per_minute[i])}`;
    return d;
  };
  const split = Math.max(0, Math.min(N, closeI));
  el("path", { d: pts(0, split), fill: "var(--accent-wash)" }, svg);
  el("path", { d: line(0, split), fill: "none", stroke: "var(--accent)", "stroke-width": 2, "stroke-linejoin": "round" }, svg);
  if (split < N) {
    el("path", { d: pts(split, N), fill: "var(--late-wash)" }, svg);
    el("path", { d: line(split, N), fill: "none", stroke: "var(--late)", "stroke-width": 2, "stroke-linejoin": "round" }, svg);
    el("line", { x1: x(split), x2: x(split), y1: P.t, y2: H - P.b, stroke: "var(--text-muted)", "stroke-width": 1 }, svg);
    el("text", { x: x(split) + 6, y: P.t + 10, text: narrow ? "17h" : "17h · encerramento" }, svg);
  }
  const cur = el("line", { x1: 0, x2: 0, y1: P.t, y2: H - P.b, stroke: "var(--text-primary)", "stroke-width": 1.5 }, svg);
  const tip = el("div", { class: "tip", hidden: "" }, host);

  const hit = el("rect", { x: P.l, y: P.t, width: W - P.l - P.r, height: H - P.t - P.b, fill: "transparent" }, svg);
  const idxFromEvent = (ev) => {
    const r = svg.getBoundingClientRect();
    const sx = ((ev.clientX - r.left) / r.width) * W;
    return Math.max(0, Math.min(N - 1, Math.floor(((sx - P.l) / (W - P.l - P.r)) * N)));
  };
  const show = (ev) => {
    const i = idxFromEvent(ev);
    tip.textContent = `${hhmm(tl.start_minute + i)} · ${fmt(tl.per_minute[i])} votos`;
    placeTip(tip, host, x(i + 0.5), y(tl.per_minute[i]));
  };
  hit.addEventListener("pointermove", show);
  hit.addEventListener("pointerdown", show);
  hit.addEventListener("pointerleave", () => { tip.hidden = true; });
  hit.addEventListener("click", (ev) => onPick(idxFromEvent(ev) + 1));

  return {
    update(i) {
      cur.setAttribute("x1", x(i)); cur.setAttribute("x2", x(i));
      cur.style.display = i === 0 ? "none" : "";
    },
  };
}

// Votes computed after the selected minute, scaled to the largest UF at that minute.
function ufBars(host, ufs, ufCum, N) {
  const rows = ufs.map((uf) => {
    el("div", { text: ufLabel(uf), title: UF_NAME[uf] || uf.toUpperCase() }, host);
    const track = el("div", { class: "track" }, host);
    const fill = el("div", { class: "fill" }, track);
    const val = el("div", { class: "val" }, host);
    return { uf, fill, val };
  });
  return {
    update(i) {
      const max = Math.max(1, ...ufs.map((u) => ufCum[u][N] - ufCum[u][i]));
      for (const r of rows) {
        const v = ufCum[r.uf][N] - ufCum[r.uf][i];
        r.fill.style.width = `${(v / max) * 100}%`;
        r.val.textContent = fmt(v);
      }
    },
  };
}

// The three tiles: the first follows the clock, the other two only the Brasil/exterior toggle.
function renderTiles() {
  const tiles = document.getElementById("tiles");
  for (const key of ["after", "secoes", "last"]) {
    const t = el("div", { class: key === "after" ? "tile tile-late" : "tile", id: `tile-${key}` }, tiles);
    el("div", { class: "label" }, t);
    el("div", { class: "value" }, t);
    el("div", { class: "note" }, t);
  }
}
function setTile(key, label, value, note) {
  const [l, v, n] = document.getElementById(`tile-${key}`).children;
  l.textContent = label; v.textContent = value; n.textContent = note;
}
function renderScopeTiles(st, scope) {
  const br = st.by_uf.filter((r) => r.uf !== "zz");
  const sum = (rows, k) => rows.reduce((a, r) => a + r[k], 0);
  if (scope === "br") {
    setTile("secoes", "Seções com votos depois das 17h", fmt(sum(br, "secoes_late")),
      `de ${fmt(sum(br, "secoes"))} seções no Brasil`);
  } else {
    setTile("secoes", "Seções com votos depois das 17h", fmt(st.secoes_with_late),
      `de ${fmt(st.secoes_ok)} seções com log · no exterior, 17h locais`);
  }
  const latest = st.latest_secoes[0];
  const last = st.by_uf.reduce((a, r) => (r.last_t > a.last_t ? r : a));
  if (scope === "all" && last.uf === "zz") {
    setTile("last", "Último voto", hhmmss(last.last_t), "no exterior, em horário de Brasília");
  } else {
    setTile("last", scope === "br" ? "Último voto no Brasil" : "Último voto", latest ? hhmmss(latest.last_t) : "–",
      latest ? `${latest.mun_nome} (${latest.uf.toUpperCase()}), zona ${+latest.zona}, seção ${+latest.secao}` : "");
  }
}

function renderStats(st, tl) {
  table("t-latest", ["Último voto", "Município", "Zona/seção", "Local", "Votos após 17h"], [4], [3])
    .set(st.latest_secoes.map((r) => [[hhmmss(r.last_t), `${r.mun_nome} (${ufLabel(r.uf)})`,
      `${+r.zona} / ${+r.secao}`, r.local || "–", fmt(r.late)]]));
  renderShare(st, tl);
  renderCoverage(st);
}

// A table whose rows can be replaced. rows: [display strings, raw values]; when sortable, every
// column sorts by the raw values and the chosen order survives set().
function table(id, head, numCols = [], wrapCols = [], sortable = false) {
  const t = document.getElementById(id);
  const tr = el("tr", {}, el("thead", {}, t));
  const tb = el("tbody", {}, t);
  const cls = (j) => (numCols.includes(j) ? "num" : wrapCols.includes(j) ? "wrap" : "");
  let rows = [];
  let sort = sortable ? { j: 1, asc: false } : null; // the data comes sorted by late votes
  const fill = () => {
    const order = rows.map((_, k) => k);
    if (sort) {
      const cmp = (a, b) => {
        const x = rows[a][1][sort.j], y = rows[b][1][sort.j];
        return typeof x === "number" ? x - y : String(x).localeCompare(String(y), "pt-BR");
      };
      order.sort((a, b) => (sort.asc ? cmp(a, b) : cmp(b, a)));
    }
    tb.replaceChildren();
    for (const k of order) {
      const row = el("tr", {}, tb);
      rows[k][0].forEach((c, j) => el("td", { text: c, class: cls(j) }, row));
    }
  };
  const ths = head.map((h, j) => {
    const th = el("th", { class: cls(j), scope: "col" }, tr);
    if (!sortable) { th.textContent = h; return th; }
    const btn = el("button", { type: "button", class: "sort", text: h }, th);
    btn.addEventListener("click", () => {
      // numbers start high-to-low, text starts A-Z; a second click flips it
      const asc = sort.j === j ? !sort.asc : !numCols.includes(j);
      sort = { j, asc };
      for (const o of ths) o.removeAttribute("aria-sort");
      th.setAttribute("aria-sort", asc ? "ascending" : "descending");
      fill();
    });
    return th;
  });
  if (sortable) ths[1].setAttribute("aria-sort", "descending");
  return { set(r) { rows = r; fill(); } };
}

function closeHist(host, hist, width) {
  // buckets are minutes relative to 17:00 (Brazil only); keep 17:00 onward, up to the last bucket
  const map = new Map(hist.filter((h) => h.bucket_min >= 0).map((h) => [h.bucket_min, h.secoes]));
  const last = Math.max(0, ...map.keys());
  const buckets = [];
  for (let b = 0; b <= last; b += 15) buckets.push([b, map.get(b) || 0]);
  const W = width, H = 220, P = { l: 44, r: 16, t: 10, b: 30 };
  const yMax = niceMax(Math.max(1, ...buckets.map((b) => b[1])));
  const bw = (W - P.l - P.r) / buckets.length;
  const y = (v) => H - P.b - (v / yMax) * (H - P.t - P.b);
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img",
    "aria-label": "Seções no Brasil por horário do último voto" }, host);
  for (let k = 0; k <= 4; k++) {
    const v = (yMax / 4) * k;
    el("line", { class: "gridline", x1: P.l, x2: W - P.r, y1: y(v), y2: y(v) }, svg);
    el("text", { x: P.l - 6, y: y(v) + 4, "text-anchor": "end", text: compact(v) }, svg);
  }
  // time labels on the bucket edges: every 30 min (every hour when narrow), plus the end of the last bucket
  const every = bw < 30 ? 4 : 2;
  for (let k = 0; k <= buckets.length; k++) {
    if (k % every && k !== buckets.length) continue;
    if (k !== buckets.length && buckets.length - k < every) continue; // too close to the last label
    el("text", { x: P.l + k * bw, y: H - 12, "text-anchor": "middle", text: hhmm(CLOSE_MIN + k * 15) }, svg);
  }
  const tip = el("div", { class: "tip", hidden: "" }, host);
  const bars = buckets.map(([b, n], k) => {
    const w = Math.min(24, bw - 2);
    const x0 = P.l + k * bw + (bw - w) / 2;
    const h = H - P.b - y(n);
    const r = Math.min(4, h / 2, w / 2);
    const top = y(n);
    const d = `M${x0},${H - P.b}V${top + r}Q${x0},${top} ${x0 + r},${top}H${x0 + w - r}Q${x0 + w},${top} ${x0 + w},${top + r}V${H - P.b}Z`;
    const bar = n > 0 ? el("path", { d, fill: "var(--late)", class: "hist-bar" }, svg) : null;
    const label = `${hhmm(CLOSE_MIN + b)}–${hhmm(CLOSE_MIN + b + 15)}`;
    const hitR = el("rect", { x: P.l + k * bw, y: P.t, width: bw, height: H - P.t - P.b, fill: "transparent" }, svg);
    const show = () => {
      tip.textContent = `${label} · ${fmt(n)} seções`;
      placeTip(tip, host, x0 + w / 2, top);
    };
    hitR.addEventListener("pointermove", show);
    hitR.addEventListener("pointerdown", show);
    hitR.addEventListener("pointerleave", () => { tip.hidden = true; });
    return { end: CLOSE_MIN + b + 15, bar };
  });
  const cur = el("line", { y1: P.t, y2: H - P.b, stroke: "var(--text-primary)", "stroke-width": 1.5 }, svg);
  return {
    update(m) {
      // seções whose last vote came before the selected time are done: fade them
      for (const { end, bar } of bars) if (bar) bar.style.opacity = end <= m ? 0.25 : 1;
      const cx = P.l + ((m - CLOSE_MIN) / 15) * bw;
      cur.style.display = m > CLOSE_MIN && cx <= W - P.r ? "" : "none";
      cur.setAttribute("x1", cx); cur.setAttribute("x2", cx);
    },
  };
}

// Brazil only, fixed at 17:00: the share of seções that still had someone voting after the
// close against the share of votes computed after it, then the 15-min periods after 17:00.
function renderShare(st, tl) {
  const hist = st.close_histogram_15min;
  const secoesAll = hist.reduce((a, h) => a + h.secoes, 0);
  const secoesLate = hist.filter((h) => h.bucket_min >= 0).reduce((a, h) => a + h.secoes, 0);
  const br = seriesFor(tl, "br");
  const closeI = CLOSE_MIN - br.start_minute;
  const votesAll = br.base + br.per_minute.reduce((a, b) => a + b, 0);
  const votesLate = br.per_minute.slice(closeI).reduce((a, b) => a + b, 0);

  const host = document.getElementById("share");
  const row = (share, text, detail) => {
    const r = el("div", { class: "share-row" }, host);
    const head = el("div", { class: "share-head" }, r);
    el("span", { class: "share-num", text: pf4.format(share) }, head);
    const p = el("span", { class: "share-text", text }, head);
    el("span", { class: "muted", text: ` (${detail})` }, p);
    const bar = el("div", { class: "share-bar", role: "img", "aria-label": `${pf4.format(share)}: ${text}` }, r);
    el("i", { style: `width: max(3px, ${share * 100}%)` }, bar);
  };
  row(secoesLate / secoesAll, "das seções do Brasil ainda registraram algum voto depois das 17h",
    `${fmt(secoesLate)} de ${fmt(secoesAll)}`);
  row(votesLate / votesAll, "dos votos do Brasil foram computados depois das 17h",
    `${fmt(votesLate)} de ${fmt(votesAll)}`);
  el("p", { class: "share-take", text: `Em média, cada seção que ainda votava depois das 17h recebeu ` +
    `${(votesLate / secoesLate).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} voto depois do encerramento.` }, host);

  // the 15-min periods after 17:00: seções by their last vote, votes by when they were computed
  const keys = hist.filter((h) => h.bucket_min >= 0).map((h) => h.bucket_min).sort((a, b) => a - b);
  const lastKey = keys[keys.length - 1];
  const secoes = new Map(hist.map((h) => [h.bucket_min, h.secoes]));
  const votes = new Map(keys.map((b) => [b, 0]));
  br.per_minute.forEach((n, i) => {
    const rel = br.start_minute + i - CLOSE_MIN;
    if (rel < 0) return;
    const b = Math.min(lastKey, Math.floor(rel / 15) * 15);
    votes.set(b, votes.get(b) + n);
  });
  const maxS = Math.max(...keys.map((b) => secoes.get(b) || 0));
  const maxV = Math.max(...keys.map((b) => votes.get(b)));
  const t = document.getElementById("t-periods");
  const hr = el("tr", {}, el("thead", {}, t));
  el("th", { text: "Faixa", scope: "col" }, hr);
  el("th", { text: "Seções", scope: "col" }, hr);
  el("th", { text: "Votos", scope: "col" }, hr);
  const tb = el("tbody", {}, t);
  const cell = (row, n, max) => {
    const td = el("td", { class: "bar-cell" }, row);
    el("span", { text: fmt(n) }, td);
    el("i", { style: `width: ${n ? Math.max(2, (n / max) * 100) : 0}%` }, el("span", { class: "mini" }, td));
  };
  for (const b of keys) {
    const r = el("tr", {}, tb);
    el("td", { text: `${hhmm(CLOSE_MIN + b)}–${hhmm(CLOSE_MIN + b + 15)}` }, r);
    cell(r, secoes.get(b) || 0, maxS);
    cell(r, votes.get(b), maxV);
  }
  const tot = el("tr", { class: "total" }, tb);
  el("td", { text: "Total" }, tot);
  el("td", { text: fmt(secoesLate), class: "num" }, tot);
  el("td", { text: fmt(votesLate), class: "num" }, tot);
}

function renderCoverage(st) {
  const missing = st.official_comparecimento_all - st.total_votes;
  const matched = st.total_votes / st.official_comparecimento_all;
  document.getElementById("coverage").textContent =
    `Os votos de cada município são somados e comparados com o comparecimento oficial divulgado pelo TSE. ` +
    `Os logs de ${fmt(st.secoes_ok)} seções têm ${fmt(st.total_votes)} votos; o comparecimento oficial, ` +
    `com o exterior, é de ${fmt(st.official_comparecimento_all)}: os logs cobrem ${pf4.format(matched)} dos votos. ` +
    `Cada um dos ${fmt(missing)} que faltam tem explicação: votação em cédula, logs não publicados e falhas de urna.`;
  document.getElementById("faq-match").textContent =
    `O TSE informa ${fmt(st.official_comparecimento_all)} eleitores que votaram. Nos logs há ` +
    `${fmt(st.total_votes)} votos, ou ${pf4.format(matched)} do total. Os ${fmt(missing)} votos que faltam ` +
    `(${pf4.format(1 - matched)}) se dividem assim:`;

  // the known parts of the gap, investigated seção by seção; urna failures are whatever remains
  const known = [
    ["Votação em cédula de papel no exterior (29 seções): não existe horário dos votos", 831],
    ["Urna eletrônica cujo log o TSE não publicou (Niterói, RJ, e Guarulhos, SP)", 454],
  ];
  const parts = [...known,
    ["Falhas de urna: votos no boletim de urna sem linha “computado” no log", missing - known.reduce((a, [, n]) => a + n, 0)]];
  const t = document.getElementById("t-gap");
  const tr = el("tr", {}, el("thead", {}, t));
  el("th", { text: "Votos que não estão nos logs" }, tr);
  el("th", { text: "Votos", class: "num" }, tr);
  const tb = el("tbody", {}, t);
  for (const [name, n] of parts) {
    const row = el("tr", {}, tb);
    el("td", { text: name, class: "wrap" }, row);
    el("td", { text: fmt(n), class: "num" }, row);
  }
  const row = el("tr", { class: "total" }, tb);
  el("td", { text: "Total" }, row);
  el("td", { text: fmt(missing), class: "num" }, row);
}

function niceMax(v) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}
function compact(v) {
  if (v >= 1e6) return `${+(v / 1e6).toFixed(1)}M`.replace(".", ",");
  if (v >= 1e3) return `${+(v / 1e3).toFixed(1)}K`.replace(".", ",");
  return String(Math.round(v));
}

// The clock sticks to the top of the screen: section anchors land below it.
const dock = document.getElementById("dock");
new ResizeObserver(() => {
  document.documentElement.style.setProperty("--dock-h", `${dock.offsetHeight}px`);
}).observe(dock);

// Links to an FAQ answer open it.
function openTarget(hash) {
  const t = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
  if (t && t.tagName === "DETAILS") t.open = true;
}
document.addEventListener("click", (ev) => {
  const a = ev.target.closest('a[href^="#"]');
  if (a) openTarget(a.getAttribute("href"));
});
openTarget(location.hash);

main().catch((e) => {
  document.getElementById("n-before").textContent = "Erro ao carregar os dados.";
  console.error(e);
});
