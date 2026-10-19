/**
 * @fileoverview Modul manipulasi antarmuka (DOM) untuk Typing Speed Battle.
 * Sesuai spesifikasi Proposal Bab 3.5, 6.5, dan 6.6.
 * Mencegah celah XSS dengan menggunakan textContent murni untuk input pengguna.
 * @module js/ui
 */

/**
 * Merender deretan kata ke dalam container kata.
 * @param {string[]} words - Daftar kata acak.
 * @param {HTMLElement} container - Elemen kontainer kata (#words-display).
 */
export function renderWords(words, container) {
  if (!container || !Array.isArray(words)) return;

  container.replaceChildren();

  words.forEach((wordText, i) => {
    const span = document.createElement("span");
    span.className = "word";
    span.dataset.index = String(i);
    span.textContent = wordText;

    if (i === 0) {
      span.classList.add("current");
    }

    container.appendChild(span);
  });

  container.scrollTop = 0;
}

/**
 * Menyorot kata yang sedang aktif diketik (diberi kelas .current).
 * Otomatis menggulir kontainer jika kata berada di bawah area pandang.
 * @param {number} index - Indeks kata aktif.
 * @param {HTMLElement} container - Elemen kontainer kata (#words-display).
 */
export function highlightWord(index, container) {
  if (!container) return;

  const currentEl = container.querySelector(".word.current");
  if (currentEl) {
    currentEl.classList.remove("current");
  }

  const targetEl = container.children[index];
  if (targetEl) {
    targetEl.classList.add("current");

    // Auto-scroll bila kata berada di baris berikutnya
    const containerTop = container.offsetTop;
    const wordTop = targetEl.offsetTop;
    if (wordTop - containerTop > 70) {
      container.scrollTop = wordTop - containerTop - 30;
    }
  }
}

/**
 * Memberi status warna pada kata yang telah selesai diketik (spasi ditekan).
 * Hijau untuk benar, merah untuk salah (sesuai Proposal Bab 3.5).
 * @param {number} index - Indeks kata.
 * @param {boolean} isCorrect - Status kebenaran kata.
 * @param {HTMLElement} container - Elemen kontainer kata.
 */
export function markWord(index, isCorrect, container) {
  if (!container) return;

  const wordEl = container.children[index];
  if (wordEl) {
    wordEl.classList.remove("current");
    wordEl.classList.add(isCorrect ? "correct" : "incorrect");
  }
}

/**
 * Memperbarui angka sisa waktu di timer dashboard.
 * @param {number} remaining - Sisa waktu dalam detik.
 * @param {HTMLElement} [timerEl] - Elemen span timer.
 */
export function updateTimer(remaining, timerEl = document.getElementById("timer")) {
  if (timerEl) {
    timerEl.textContent = String(remaining);
  }
}

/**
 * Memperbarui metrik WPM dan akurasi di dashboard.
 * @param {number} wpm - Nilai WPM saat ini.
 * @param {number} accuracy - Nilai akurasi saat ini (%).
 */
export function updateMetrics(wpm, accuracy) {
  const wpmEl = document.getElementById("wpm");
  const accEl = document.getElementById("accuracy");
  if (wpmEl) wpmEl.textContent = String(wpm);
  if (accEl) accEl.textContent = String(accuracy);
}

/**
 * Menampilkan panel hasil akhir setelah waktu habis.
 * @param {{ wpm: number, accuracy: number, correctWords: number, wrongWords: number }} result
 * @param {HTMLElement} [panelEl] - Elemen section #result-panel.
 */
export function showResult(result, panelEl = document.getElementById("result-panel")) {
  if (!panelEl) return;

  panelEl.classList.remove("is-hidden");

  const wpmValEl = panelEl.querySelector(".result-wpm-val");
  const accValEl = panelEl.querySelector(".result-acc-val");
  const charsValEl = panelEl.querySelector(".result-chars-val");

  if (wpmValEl) wpmValEl.textContent = String(result.wpm);
  if (accValEl) accValEl.textContent = String(result.accuracy);
  if (charsValEl) {
    charsValEl.textContent = `${result.correctWords || 0} benar / ${result.wrongWords || 0} salah`;
  }

  const nameInput = panelEl.querySelector("#name-input");
  if (nameInput) {
    nameInput.value = "";
    nameInput.focus();
  }

  panelEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/**
 * Menyembunyikan panel hasil.
 * @param {HTMLElement} [panelEl]
 */
export function hideResult(panelEl = document.getElementById("result-panel")) {
  if (panelEl) {
    panelEl.classList.add("is-hidden");
  }
}

/**
 * Merender daftar skor ke leaderboard.
 * AMAN DARI XSS: Seluruh teks pengguna dipasang dengan textContent (Proposal Bab 6.5 & 8.5).
 * @param {Array<Object>} scores - Daftar 10 skor teratas.
 * @param {HTMLElement} listEl - Elemen ol (#leaderboard-list).
 */
export function renderLeaderboard(scores, listEl = document.getElementById("leaderboard-list")) {
  if (!listEl) return;

  listEl.replaceChildren();

  if (!Array.isArray(scores) || scores.length === 0) {
    const emptyLi = document.createElement("li");
    emptyLi.className = "empty-state";
    emptyLi.textContent = "Belum ada rekor skor tersimpan. Selesaikan satu sesi untuk mencatatkan namamu!";
    listEl.appendChild(emptyLi);
    return;
  }

  scores.forEach((s, i) => {
    const rank = i + 1;
    const li = document.createElement("li");
    li.className = `leaderboard-item rank-${rank}`;

    // Kolom Rank
    const rankCol = document.createElement("div");
    rankCol.className = "col-rank";
    const rankBadge = document.createElement("span");
    rankBadge.className = "rank-badge";
    rankBadge.textContent = String(rank);
    rankCol.appendChild(rankBadge);

    // Kolom Nama (Aman XSS dengan textContent murni)
    const nameCol = document.createElement("div");
    nameCol.className = "col-name player-name";
    nameCol.textContent = s.name || "Anonim";

    // Kolom Kategori Mode Kata
    const modeCol = document.createElement("div");
    modeCol.className = "col-mode item-mode";
    const modeBadge = document.createElement("span");
    modeBadge.className = "item-badge";
    modeBadge.textContent = s.mode === "it" ? "IT" : "Umum";
    modeCol.appendChild(modeBadge);

    // Kolom Durasi
    const durCol = document.createElement("div");
    durCol.className = "col-duration item-duration";
    durCol.textContent = `${s.duration || 60} dtk`;

    // Kolom Akurasi
    const accCol = document.createElement("div");
    accCol.className = "col-acc item-stat-mono";
    accCol.textContent = `${s.accuracy}%`;

    // Kolom WPM
    const wpmCol = document.createElement("div");
    wpmCol.className = "col-wpm item-stat-wpm";
    wpmCol.textContent = `${s.wpm}`;

    li.appendChild(rankCol);
    li.appendChild(nameCol);
    li.appendChild(modeCol);
    li.appendChild(durCol);
    li.appendChild(accCol);
    li.appendChild(wpmCol);

    listEl.appendChild(li);
  });
}
