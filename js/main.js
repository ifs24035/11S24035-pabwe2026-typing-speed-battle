/**
 * @fileoverview Modul pengatur alur utama (Orchestrator) untuk Typing Speed Battle.
 * Sesuai spesifikasi Proposal Bab 3.2, 3.4, dan 6.6.
 * @module js/main
 */

import { CONFIG } from "./config.js";
import { WORDS } from "./words.js";
import { shuffle, evaluateWord, calculateWPM, calculateAccuracy, startTimer, stopTimer } from "./game.js";
import { getScores, saveScore, clearScores } from "./storage.js";
import * as ui from "./ui.js";

// Ambil seluruh elemen DOM berdasarkan ID persis yang telah disepakati
const modeSelect = document.getElementById("mode-select");
const durationSelect = document.getElementById("duration-select");
const timerEl = document.getElementById("timer");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const wordsDisplay = document.getElementById("words-display");
const typingInput = document.getElementById("typing-input");
const restartBtn = document.getElementById("restart-btn");
const resultPanel = document.getElementById("result-panel");
const nameInput = document.getElementById("name-input");
const saveBtn = document.getElementById("save-btn");
const leaderboardList = document.getElementById("leaderboard-list");
const clearBtn = document.getElementById("clear-btn");

// State permainan
const state = {
  words: [],
  index: 0,
  correctChars: 0,
  totalTyped: 0,
  correctWords: 0,
  wrongWords: 0,
  started: false,
  duration: 60,
  mode: "umum",
  lastWpm: 0,
  lastAccuracy: 0
};

/**
 * Menginisialisasi atau mereset ulang sesi permainan baru.
 */
function initGame() {
  stopTimer();

  state.mode = modeSelect ? modeSelect.value : "umum";
  state.duration = durationSelect ? parseInt(durationSelect.value, 10) : 60;
  state.index = 0;
  state.correctChars = 0;
  state.totalTyped = 0;
  state.correctWords = 0;
  state.wrongWords = 0;
  state.started = false;
  state.lastWpm = 0;
  state.lastAccuracy = 0;

  // Acak kata dari bank kata yang dipilih
  const wordBank = WORDS[state.mode] || WORDS.umum;
  state.words = shuffle(wordBank).slice(0, CONFIG.wordsPerRound);

  // Reset tampilan UI
  ui.hideResult(resultPanel);
  ui.updateTimer(state.duration, timerEl);
  ui.updateMetrics(0, 0);
  ui.renderWords(state.words, wordsDisplay);

  if (typingInput) {
    typingInput.disabled = false;
    typingInput.value = "";
    typingInput.placeholder = "Ketik kata di sini untuk memulai tes...";
    typingInput.focus();
  }

  if (saveBtn) {
    saveBtn.disabled = false;
    saveBtn.textContent = "Simpan Skor";
  }
}

/**
 * Mengakhiri sesi tes saat waktu habis.
 * @param {number} elapsedSec - Total durasi waktu berjalan dalam detik.
 */
function finishGame(elapsedSec) {
  if (typingInput) {
    typingInput.disabled = true;
    typingInput.value = "";
  }

  // Hitung metrik final
  state.lastWpm = calculateWPM(state.correctChars, elapsedSec);
  state.lastAccuracy = calculateAccuracy(state.correctChars, state.totalTyped);

  ui.updateMetrics(state.lastWpm, state.lastAccuracy);
  ui.showResult({
    wpm: state.lastWpm,
    accuracy: state.lastAccuracy,
    correctWords: state.correctWords,
    wrongWords: state.wrongWords
  }, resultPanel);
}

/* ==========================================================================
   Event Listeners
   ========================================================================== */

// 1. Ketikan pertama: Timer mulai otomatis (Proposal Bab 2.2 Skenario 3 & F-04)
if (typingInput) {
  typingInput.addEventListener("input", () => {
    if (!state.started && typingInput.value.length > 0) {
      state.started = true;
      startTimer(
        state.duration,
        (remaining) => {
          ui.updateTimer(remaining, timerEl);
          const elapsed = state.duration - remaining;
          if (elapsed > 0) {
            const currentWpm = calculateWPM(state.correctChars, elapsed);
            const currentAcc = calculateAccuracy(state.correctChars, state.totalTyped);
            ui.updateMetrics(currentWpm, currentAcc);
          }
        },
        finishGame
      );
    }
  });

  // 2. Tombol Spasi: Menilai kata dan beralih ke kata berikutnya (Proposal Bab 2.2 Skenario 4 & 6.6)
  typingInput.addEventListener("keydown", (e) => {
    if (e.key !== " ") return;
    e.preventDefault();

    const typed = typingInput.value.trim();
    if (!typed) return;

    const targetWord = state.words[state.index];
    const r = evaluateWord(typed, targetWord);

    // +1 untuk karakter spasi jika kata benar seluruhnya
    state.correctChars += r.correct + (r.isCorrect ? 1 : 0);
    state.totalTyped += r.total + 1;

    if (r.isCorrect) {
      state.correctWords++;
    } else {
      state.wrongWords++;
    }

    // Umpan balik visual warna per kata
    ui.markWord(state.index, r.isCorrect, wordsDisplay);

    state.index++;
    typingInput.value = "";

    // Sorot kata aktif berikutnya
    ui.highlightWord(state.index, wordsDisplay);

    // Perbarui metrik di dashboard secara real-time
    const currentWpm = calculateWPM(state.correctChars, Math.max(1, state.duration - parseInt(timerEl.textContent, 10)));
    const currentAcc = calculateAccuracy(state.correctChars, state.totalTyped);
    ui.updateMetrics(currentWpm, currentAcc);
  });
}

// 3. Tombol Ulangi Tes
if (restartBtn) {
  restartBtn.addEventListener("click", initGame);
}

// Tombol Escape shortcut keyboard untuk restart cepat
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    initGame();
  }
});

// 4. Perubahan Kategori Mode Kata
if (modeSelect) {
  modeSelect.addEventListener("change", initGame);
}

// 5. Perubahan Durasi Waktu
if (durationSelect) {
  durationSelect.addEventListener("change", initGame);
}

// 6. Simpan Skor ke Leaderboard
if (saveBtn) {
  saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const playerName = nameInput ? nameInput.value : "";
    
    saveScore({
      name: playerName,
      wpm: state.lastWpm,
      accuracy: state.lastAccuracy,
      mode: state.mode,
      duration: state.duration
    });

    // Refresh tampilan leaderboard
    ui.renderLeaderboard(getScores(), leaderboardList);

    saveBtn.disabled = true;
    saveBtn.textContent = "Tersimpan!";
  });
}

// 7. Hapus Leaderboard
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    const confirmClear = window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat skor di papan peringkat?");
    if (confirmClear) {
      clearScores();
      ui.renderLeaderboard([], leaderboardList);
    }
  });
}

/* ==========================================================================
   Bootstrapping / Inisialisasi Awal
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Muat leaderboard dari localStorage saat halaman pertama kali dibuka
  ui.renderLeaderboard(getScores(), leaderboardList);
  // Mulai persiapan game
  initGame();
});
