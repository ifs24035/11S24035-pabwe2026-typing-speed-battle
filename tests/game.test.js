// tests/game.test.js -> jalankan: node tests/game.test.js
import assert from "node:assert/strict";
import { calculateWPM, calculateAccuracy, evaluateWord } from "../js/game.js";

assert.equal(calculateWPM(50, 30), 20);
assert.equal(calculateWPM(300, 60), 60);
assert.equal(calculateWPM(50, 0), 0); // tidak boleh Infinity
assert.equal(calculateAccuracy(45, 50), 90);
assert.equal(calculateAccuracy(0, 0), 0); // tidak boleh NaN
assert.deepEqual(evaluateWord("datbase", "database"),
 { correct: 3, total: 7, isCorrect: false });

console.log("Semua pengujian lulus");
