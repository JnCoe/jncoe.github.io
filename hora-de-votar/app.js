"use strict";

const nf = new Intl.NumberFormat("pt-BR");
const pf = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 2 });
const fmt = (n) => nf.format(n);
const UF_NAME = { zz: "Exterior" };
const ufLabel = (uf) => (uf === "zz" ? "EXT" : uf.toUpperCase());
const hhmm = (min) => {
  const d = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(d / 60)).padStart(2, "0")}:${String(d % 60).padStart(2, "0")}`;
};
const hhmmss = (sec) => `${hhmm(Math.floor(sec / 60))}:${String(((sec % 60) + 60) % 60).padStart(2, "0")}`;
const pf4 = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 4 });
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

async function main() {
  const [tl, st] = await Promise.all([
    fetch(`${DATA_BASE}timeline.json`).then((r) => r.json()),
    fetch(`${DATA_BASE}stats.json`).then((r) => r.json()),
  ]);
  const slider = document.getElementById("slider");
  const minuteAt = (i) => tl.start_minute + i;
  let N, cum, total, rate, bars;

  // (Re)build every series for a scope: "all" = Brasil + exterior, "br" = only Brazil.
  function build(scope) {
    const s = seriesFor(tl, scope);
    N = s.per_minute.length;
    cum = new Float64Array(N + 1);
    cum[0] = s.base;
    for (let i = 0; i < N; i++) cum[i + 1] = cum[i] + s.per_minute[i];
    total = cum[N];

    const ufCum = {};
    for (const uf of s.ufs) {
      const a = new Float64Array(N + 1);
      const p = tl.by_uf[uf].per_minute;
      for (let i = 0; i < N; i++) a[i + 1] = a[i] + p[i];
      ufCum[uf] = a;
    }
    const ufs = [...s.ufs].sort((a, b) => ufCum[b][N] - ufCum[a][N]);

    slider.max = N;
    // tick labels under the slider, every hour
    const ticks = document.getElementById("ticks");
    ticks.replaceChildren();
    for (let m = Math.ceil(tl.start_minute / 60) * 60; m <= minuteAt(N); m += 60) {
      el("span", { text: hhmm(m), style: `left:${((m - tl.start_minute) / N) * 100}%` }, ticks);
    }
    const rateHost = document.getElementById("chart-rate");
    const barsHost = document.getElementById("uf-bars");
    rateHost.replaceChildren();
    barsHost.replaceChildren();
    rate = rateChart(rateHost, s, (i) => setIndex(i));
    bars = ufBars(barsHost, ufs, ufCum, N);
  }

  for (const btn of document.querySelectorAll(".scope button")) {
    btn.addEventListener("click", () => {
      stop();
      for (const b of document.querySelectorAll(".scope button")) {
        b.setAttribute("aria-pressed", String(b === btn));
      }
      const keep = +slider.value;
      build(btn.dataset.scope);
      setIndex(keep);
    });
  }

  function setIndex(i) {
    i = Math.max(0, Math.min(N, i));
    slider.value = i;
    const m = minuteAt(i);
    document.getElementById("clock").textContent = hhmm(m);
    document.getElementById("counter").textContent = fmt(cum[i]);
    document.getElementById("counter-sub").textContent =
      `votos computados até ${hhmm(m)} · ${pf.format(cum[i] / total)} do total registrado`;
    const after = cum[i] - cum[Math.min(i, CLOSE_MIN - tl.start_minute)];
    document.getElementById("delta").innerHTML = i === 0
      ? `Soma de todos os votos até as 15h. Arraste para avançar minuto a minuto.`
      : `+${fmt(cum[i] - cum[0])} desde as 15h` +
        (m > CLOSE_MIN ? ` · <span class="late-flag">${fmt(after)} depois das 17h</span>` : "");
    rate.cursor(i);
    bars.update(i);
    document.getElementById("uf-title").textContent = `Votos depois das ${hhmm(m)}, por UF`;
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

  build("all");
  setIndex(0);
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

function rateChart(host, tl, onPick) {
  const W = 960, H = 260, P = { l: 52, r: 12, t: 12, b: 26 };
  const N = tl.per_minute.length;
  const max = Math.max(...tl.per_minute);
  const yMax = niceMax(max);
  const x = (i) => P.l + (i / N) * (W - P.l - P.r);
  const y = (v) => H - P.b - (v / yMax) * (H - P.t - P.b);
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img",
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
    el("text", { x: x(split) + 6, y: P.t + 10, text: "17h · encerramento" }, svg);
  }
  const cur = el("line", { x1: 0, x2: 0, y1: P.t, y2: H - P.b, stroke: "var(--text-primary)", "stroke-width": 1.5 }, svg);
  const tip = el("div", { class: "tip", hidden: "" }, host);

  const hit = el("rect", { x: P.l, y: P.t, width: W - P.l - P.r, height: H - P.t - P.b, fill: "transparent" }, svg);
  const idxFromEvent = (ev) => {
    const r = svg.getBoundingClientRect();
    const sx = ((ev.clientX - r.left) / r.width) * W;
    return Math.max(0, Math.min(N - 1, Math.floor(((sx - P.l) / (W - P.l - P.r)) * N)));
  };
  hit.addEventListener("pointermove", (ev) => {
    const i = idxFromEvent(ev);
    const r = svg.getBoundingClientRect();
    tip.hidden = false;
    tip.style.left = `${(x(i + 0.5) / W) * r.width}px`;
    tip.style.top = `${(y(tl.per_minute[i]) / H) * r.height}px`;
    tip.textContent = `${hhmm(tl.start_minute + i)} · ${fmt(tl.per_minute[i])} votos`;
  });
  hit.addEventListener("pointerleave", () => { tip.hidden = true; });
  hit.addEventListener("click", (ev) => onPick(idxFromEvent(ev) + 1));

  return {
    cursor(i) {
      cur.setAttribute("x1", x(i)); cur.setAttribute("x2", x(i));
      cur.style.display = i === 0 ? "none" : "";
    },
  };
}

// Votes computed after the selected minute: bars shrink as the slider moves on.
function ufBars(host, ufs, ufCum, N) {
  const max = Math.max(...ufs.map((u) => ufCum[u][N]));
  const rows = ufs.map((uf) => {
    el("div", { text: ufLabel(uf), title: UF_NAME[uf] || uf.toUpperCase() }, host);
    const track = el("div", { class: "track" }, host);
    const fill = el("div", { class: "fill" }, track);
    const val = el("div", { class: "val" }, host);
    return { uf, fill, val };
  });
  return {
    update(i) {
      for (const r of rows) {
        const v = ufCum[r.uf][N] - ufCum[r.uf][i];
        r.fill.style.width = `${(v / max) * 100}%`;
        r.val.textContent = fmt(v);
      }
    },
  };
}

function renderStats(st, tl) {
  const tiles = document.getElementById("tiles");
  const latest = st.latest_secoes[0];
  const tileData = [
    ["Votos após o encerramento", fmt(st.late_votes), `${pf.format(st.late_pct)} de todos os votos`],
    ["No Brasil", fmt(st.late_votes_brazil), "depois das 17h de Brasília"],
    ["Seções com votos após o encerramento", fmt(st.secoes_with_late), `de ${fmt(st.secoes_ok)} seções com log`],
    ["Último voto no Brasil", latest ? hhmmss(latest.last_t) : "–",
      latest ? `${latest.mun_nome} (${latest.uf.toUpperCase()}), zona ${+latest.zona}, seção ${+latest.secao}` : ""],
  ];
  for (const [label, value, note] of tileData) {
    const t = el("div", { class: "tile" }, tiles);
    el("div", { class: "label", text: label }, t);
    el("div", { class: "value", text: value }, t);
    el("div", { class: "note", text: note }, t);
  }

  table("t-uf", ["UF", "Votos após", "% da UF", "Seções", "Último voto"],
    st.by_uf.map((r) => [ufLabel(r.uf), fmt(r.late), pf.format(r.pct_late),
      fmt(r.secoes_late), hhmmss(r.last_t)]), [1, 2, 3, 4], [],
    st.by_uf.map((r) => [ufLabel(r.uf), r.late, r.pct_late, r.secoes_late, r.last_t]));
  table("t-mun", ["Município", "UF", "Votos após", "% do município", "Seções com fila", "Último voto"],
    st.top_municipios.map((r) => [r.mun_nome, ufLabel(r.uf), fmt(r.late), pf.format(r.pct_late),
      `${fmt(r.secoes_late)} de ${fmt(r.secoes)}`, hhmmss(r.last_t)]), [2, 3, 4, 5]);
  table("t-local", ["Local de votação", "Município", "Votos após", "% do local", "Último voto"],
    st.top_locais.map((r) => [r.local, `${r.mun_nome} (${ufLabel(r.uf)})`, fmt(r.late),
      pf.format(r.pct_late), hhmmss(r.last_t)]), [2, 3, 4], [0]);
  table("t-latest", ["Último voto", "Município", "Zona/seção", "Local", "Votos após 17h"],
    st.latest_secoes.map((r) => [hhmmss(r.last_t), `${r.mun_nome} (${ufLabel(r.uf)})`,
      `${+r.zona} / ${+r.secao}`, r.local || "–", fmt(r.late)]), [4], [3]);

  closeHist(document.getElementById("chart-close"), st.close_histogram_15min);
  stackBars(document.getElementById("stack"), periodBuckets(st, tl));
  renderCoverage(st);
}

// rows: display strings; sortRows (optional): raw values in the same shape, makes every column sortable
function table(id, head, rows, numCols = [], wrapCols = [], sortRows = null) {
  const t = document.getElementById(id);
  const tr = el("tr", {}, el("thead", {}, t));
  const tb = el("tbody", {}, t);
  const cls = (j) => (numCols.includes(j) ? "num" : wrapCols.includes(j) ? "wrap" : "");
  let order = rows.map((_, k) => k);
  const fill = () => {
    tb.replaceChildren();
    for (const k of order) {
      const row = el("tr", {}, tb);
      rows[k].forEach((c, j) => el("td", { text: c, class: cls(j) }, row));
    }
  };
  const ths = head.map((h, j) => {
    const th = el("th", { class: cls(j), scope: "col" }, tr);
    if (!sortRows) { th.textContent = h; return th; }
    const btn = el("button", { type: "button", class: "sort", text: h }, th);
    btn.addEventListener("click", () => {
      // numbers start high-to-low, text starts A-Z; a second click flips it
      const cur = th.getAttribute("aria-sort");
      const asc = cur ? cur === "descending" : !numCols.includes(j);
      for (const o of ths) o.removeAttribute("aria-sort");
      th.setAttribute("aria-sort", asc ? "ascending" : "descending");
      const cmp = (a, b) => {
        const x = sortRows[a][j], y = sortRows[b][j];
        return typeof x === "number" ? x - y : String(x).localeCompare(String(y), "pt-BR");
      };
      order = rows.map((_, k) => k).sort((a, b) => (asc ? cmp(a, b) : cmp(b, a)));
      fill();
    });
    return th;
  });
  if (sortRows) ths[1].setAttribute("aria-sort", "descending"); // the data comes sorted by late votes
  fill();
}

function closeHist(host, hist) {
  // buckets are minutes relative to 17:00 (Brazil only); keep 17:00 onward, up to the last bucket
  const map = new Map(hist.filter((h) => h.bucket_min >= 0).map((h) => [h.bucket_min, h.secoes]));
  const last = Math.max(0, ...map.keys());
  const buckets = [];
  for (let b = 0; b <= last; b += 15) buckets.push([b, map.get(b) || 0]);
  const W = 480, H = 220, P = { l: 44, r: 16, t: 10, b: 30 };
  const yMax = niceMax(Math.max(1, ...buckets.map((b) => b[1])));
  const bw = (W - P.l - P.r) / buckets.length;
  const y = (v) => H - P.b - (v / yMax) * (H - P.t - P.b);
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img",
    "aria-label": "Seções no Brasil por horário do último voto" }, host);
  for (let k = 0; k <= 4; k++) {
    const v = (yMax / 4) * k;
    el("line", { class: "gridline", x1: P.l, x2: W - P.r, y1: y(v), y2: y(v) }, svg);
    el("text", { x: P.l - 6, y: y(v) + 4, "text-anchor": "end", text: compact(v) }, svg);
  }
  // time labels on the bucket edges: every 30 min, plus the end of the last bucket
  for (let k = 0; k <= buckets.length; k++) {
    if (k % 2 && k !== buckets.length) continue;
    el("text", { x: P.l + k * bw, y: H - 12, "text-anchor": "middle", text: hhmm(CLOSE_MIN + k * 15) }, svg);
  }
  const tip = el("div", { class: "tip", hidden: "" }, host);
  buckets.forEach(([b, n], k) => {
    const w = Math.min(24, bw - 2);
    const x0 = P.l + k * bw + (bw - w) / 2;
    const h = H - P.b - y(n);
    const r = Math.min(4, h / 2, w / 2);
    const top = y(n);
    const d = `M${x0},${H - P.b}V${top + r}Q${x0},${top} ${x0 + r},${top}H${x0 + w - r}Q${x0 + w},${top} ${x0 + w},${top + r}V${H - P.b}Z`;
    if (n > 0) el("path", { d, fill: "var(--late)" }, svg);
    const label = `${hhmm(CLOSE_MIN + b)}–${hhmm(CLOSE_MIN + b + 15)}`;
    const hitR = el("rect", { x: P.l + k * bw, y: P.t, width: bw, height: H - P.t - P.b, fill: "transparent" }, svg);
    hitR.addEventListener("pointermove", () => {
      const rr = svg.getBoundingClientRect();
      tip.hidden = false;
      tip.style.left = `${((x0 + w / 2) / W) * rr.width}px`;
      tip.style.top = `${(top / H) * rr.height}px`;
      tip.textContent = `${label} · ${fmt(n)} seções`;
    });
    hitR.addEventListener("pointerleave", () => { tip.hidden = true; });
  });
}

// The 15-min periods of the close histogram (relative to 17:00, everything before 16:15 folded),
// counted two ways for Brazil: seções by their last vote, and votes by when they were computed.
function periodBuckets(st, tl) {
  const FIRST = -60;
  const keys = [];
  const secoes = new Map();
  for (const { bucket_min, secoes: n } of st.close_histogram_15min) {
    secoes.set(bucket_min, (secoes.get(bucket_min) || 0) + n);
  }
  const last = Math.max(...secoes.keys());
  for (let b = FIRST; b <= last; b += 15) keys.push(b);

  const br = seriesFor(tl, "br");
  const votes = new Map(keys.map((b) => [b, 0]));
  votes.set(FIRST, br.base); // everything before 15:00
  br.per_minute.forEach((n, i) => {
    const rel = br.start_minute + i - CLOSE_MIN;
    const b = Math.min(last, Math.max(FIRST, Math.floor(rel / 15) * 15));
    votes.set(b, votes.get(b) + n);
  });
  const label = (b) => (b === FIRST ? `até ${hhmm(CLOSE_MIN + b + 15)}` :
    `${hhmm(CLOSE_MIN + b)}–${hhmm(CLOSE_MIN + b + 15)}`);
  return {
    keys, label,
    rows: [
      { name: "Seções", unit: "seções", desc: "pelo horário do último voto", values: keys.map((b) => secoes.get(b) || 0) },
      { name: "Votos", unit: "votos", desc: "pelo horário em que foram computados", values: keys.map((b) => votes.get(b)) },
    ],
  };
}

function stackBars(host, { keys, label, rows }) {
  // before 17:00: green, darkest far from the close; after: orange, darkest latest
  const pre = keys.filter((b) => b < 0).length;
  const post = keys.length - pre;
  const color = (k) => k < pre
    ? `color-mix(in oklab, var(--accent) ${100 - (k / Math.max(1, pre - 1)) * 55}%, var(--card))`
    : `color-mix(in oklab, var(--late) ${55 + ((k - pre) / Math.max(1, post - 1)) * 45}%, var(--card))`;
  const tip = el("div", { class: "tip", hidden: "" }, host);
  for (const r of rows) {
    const total = r.values.reduce((a, b) => a + b, 0);
    const late = r.values.slice(pre).reduce((a, b) => a + b, 0);
    const row = el("div", { class: "stack-row" }, host);
    const lab = el("div", { class: "stack-label" }, row);
    const left = el("span", {}, lab);
    el("b", { text: r.name }, left);
    left.append(` ${r.desc}`);
    el("span", { class: "late-flag", text: `depois das 17h: ${pf4.format(late / total)}` }, lab);
    const bar = el("div", { class: "stack-bar", role: "img",
      "aria-label": `${r.name}: ${pf4.format(late / total)} depois das 17h` }, row);
    r.values.forEach((n, k) => {
      if (!n) return;
      const share = n / total;
      const seg = el("div", { class: "seg", tabindex: "0",
        "aria-label": `${label(keys[k])}: ${fmt(n)} ${r.unit} (${pf4.format(share)})`,
        style: `flex: ${share} 0 0; background: ${color(k)}` +
          (share > 0.004 && k ? "; box-shadow: inset 2px 0 0 var(--card)" : "") }, bar);
      const show = () => {
        const hr = host.getBoundingClientRect();
        const sr = seg.getBoundingClientRect();
        tip.hidden = false;
        tip.style.left = `${Math.min(hr.width - 90, Math.max(90, sr.left - hr.left + sr.width / 2))}px`;
        tip.style.top = `${sr.top - hr.top}px`;
        tip.textContent = `${label(keys[k])} · ${fmt(n)} ${r.unit} · ${pf4.format(share)}`;
      };
      seg.addEventListener("pointerenter", show);
      seg.addEventListener("focus", show);
      seg.addEventListener("pointerleave", () => { tip.hidden = true; });
      seg.addEventListener("blur", () => { tip.hidden = true; });
    });
  }
  // shared legend, which is also the table view of both bars
  const legend = el("div", { class: "stack-legend" }, host);
  keys.forEach((b, k) => {
    const s = el("span", {}, legend);
    el("i", { style: `background: ${color(k)}` }, s);
    s.append(`${label(b)}: ${rows.map((r) => `${fmt(r.values[k])} ${r.unit}`).join(" · ")}`);
  });
}

function renderCoverage(st) {
  const missing = st.official_comparecimento_all - st.total_votes;
  const matched = st.total_votes / st.official_comparecimento_all;
  document.getElementById("coverage").textContent =
    `Somamos os votos de cada município e comparamos com o comparecimento oficial divulgado pelo TSE. ` +
    `Os logs de ${fmt(st.secoes_ok)} seções têm ${fmt(st.total_votes)} votos; o comparecimento oficial, ` +
    `com o exterior, é de ${fmt(st.official_comparecimento_all)}: encontramos ${pf4.format(matched)} dos votos. ` +
    `Cada um dos ${fmt(missing)} que faltam tem explicação: votação em cédula, logs não publicados e falhas de urna.`;
  document.getElementById("faq-match").textContent =
    `O TSE informa ${fmt(st.official_comparecimento_all)} eleitores que votaram. Nos logs encontramos ` +
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

main().catch((e) => {
  document.getElementById("counter-sub").textContent = "Erro ao carregar os dados.";
  console.error(e);
});
