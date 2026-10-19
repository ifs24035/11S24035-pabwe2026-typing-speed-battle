/**
 * @fileoverview Modul logika murni dan pengatur waktu untuk Typing Speed Battle.
 * Sesuai spesifikasi Proposal Bab 6.2, Bab 6.3, dan pengujian Bab 7.
 * @module js/game
 */

let timerId = null;

/**
 * Mengacak urutan array dengan algoritma Fisher-Yates (tidak mengubah array asli).
 * @template T
 * @param {T[]} array - Array sumber.
 * @returns {T[]} Salinan array baru teracak.
 */
export function shuffle(array) {
  if (!Array.isArray(array)) return [];
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * WPM = (karakter benar / 5) per menit. Mengembalikan 0 jika waktu <= 0.
 * @param {number} correctChars - Jumlah karakter benar.
 * @param {number} elapsedSeconds - Waktu berjalan dalam detik.
 * @returns {number} Nilai WPM bulat.
 */
export function calculateWPM(correctChars, elapsedSeconds) {
  if (typeof elapsedSeconds !== "number" || elapsedSeconds <= 0) return 0;
  if (typeof correctChars !== "number" || correctChars <= 0) return 0;
  return Math.round((correctChars / 5) / (elapsedSeconds / 60));
}

/**
 * Akurasi (%) = karakter benar / total karakter diketik.
 * Mengembalikan 0 jika totalTyped === 0 (mencegah NaN).
 * @param {number} correctChars - Karakter benar.
 * @param {number} totalTyped - Total karakter diketik.
 * @returns {number} Persentase akurasi (0 - 100).
 */
export function calculateAccuracy(correctChars, totalTyped) {
  if (typeof totalTyped !== "number" || totalTyped <= 0) return 0;
  const validCorrect = typeof correctChars === "number" && correctChars > 0 ? correctChars : 0;
  return Math.round((validCorrect / totalTyped) * 100);
}

/**
 * Membandingkan satu kata yang diketik dengan kata target.
 * @param {string} typed - Kata input pengguna.
 * @param {string} target - Kata target.
 * @returns {{ correct: number, total: number, isCorrect: boolean }}
 */
export function evaluateWord(typed, target) {
  const safeTyped = typeof typed === "string" ? typed : "";
  const safeTarget = typeof target === "string" ? target : "";

  let correct = 0;
  const limit = Math.min(safeTyped.length, safeTarget.length);
  for (let i = 0; i < limit; i++) {
    if (safeTyped[i] === safeTarget[i]) correct++;
  }

  return {
    correct,
    total: safeTyped.length,
    isCorrect: safeTyped === safeTarget && safeTarget.length > 0
  };
}

/**
 * Timer berbasis waktu sistem (Date.now()) untuk mencegah timer drift.
 * Pemanggilan stopTimer() di awal mencegah interval ganda saat Ulangi ditekan.
 * @param {number} durationSec - Durasi tes dalam detik.
 * @param {(remaining: number) => void} onTick - Callback pembaruan waktu tersisa.
 * @param {(durationSec: number) => void} onFinish - Callback saat waktu habis.
 * @returns {number} ID timer interval.
 */
export function startTimer(durationSec, onTick, onFinish) {
  stopTimer(); // cegah timer ganda
  const startTime = Date.now();

  timerId = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = Math.max(0, Math.ceil(durationSec - elapsed));
    if (typeof onTick === "function") {
      onTick(remaining);
    }
    if (remaining === 0) {
      stopTimer();
      if (typeof onFinish === "function") {
        onFinish(durationSec);
      }
    }
  }, 100);

  return timerId;
}

/**
 * Menghentikan interval timer dan mengosongkan timerId.
 */
export function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

/**
 * Mengecek apakah timer sedang aktif berjalan.
 * @returns {boolean}
 */
export function isTimerRunning() {
  return timerId !== null;
}
