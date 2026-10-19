// js/storage.js - Pengelolaan leaderboard di localStorage sesuai proposal Bab 6.4
import { CONFIG } from "./config.js";

/**
 * Mengambil data skor dari localStorage secara aman dari JSON rusak atau storage kosong.
 * @returns {Array<Object>}
 */
export function getScores() {
  try {
    const raw = localStorage.getItem(CONFIG.storageKey);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Data leaderboard rusak, memakai daftar kosong.", err);
    return [];
  }
}

/**
 * Menyimpan rekor skor baru ke localStorage terurut WPM menurun dan dibatasi 10 entri.
 * @param {{ name: string, wpm: number, accuracy: number, mode: string, duration: number }} param0
 * @returns {Array<Object>}
 */
export function saveScore({ name, wpm, accuracy, mode, duration }) {
  const scores = getScores();
  scores.push({
    name: (typeof name === "string" ? name.trim().slice(0, CONFIG.maxNameLength) : "") || "Anonim",
    wpm: typeof wpm === "number" ? Math.max(0, Math.round(wpm)) : 0,
    accuracy: typeof accuracy === "number" ? Math.max(0, Math.min(100, Math.round(accuracy))) : 0,
    mode: mode === "it" ? "it" : "umum",
    duration: Number(duration) === 30 ? 30 : 60,
    date: new Date().toISOString(),
  });

  scores.sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy);

  const topScores = scores.slice(0, CONFIG.maxScores);
  localStorage.setItem(CONFIG.storageKey, JSON.stringify(topScores));
  return topScores;
}

/**
 * Menghapus data leaderboard dari localStorage.
 */
export function clearScores() {
  localStorage.removeItem(CONFIG.storageKey);
}
