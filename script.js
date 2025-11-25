/**
 * Mastermind Game Core Logic
 */

// Game State
const GAME_VERSION = 'v1.1.0';
let secretAnswer = "";
let isGameOver = false;

// Update Title with Version
document.title = `Mastermind 終極密碼 (${GAME_VERSION})`;

// DOM Elements
const guessInput = document.getElementById('guess-input');
const submitBtn = document.getElementById('submit-btn');
const restartBtn = document.getElementById('restart-btn');
const historyList = document.getElementById('history-list');
const gameStatus = document.getElementById('game-status');

/**
 * Generates a 4-digit secret answer with unique digits (0-9).
 * @returns {string} A string of 4 unique digits.
 */
function generateAnswer() {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let answer = "";

    // Shuffle and pick first 4
    // Fisher-Yates Shuffle for better randomness
    for (let i = digits.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [digits[i], digits[j]] = [digits[j], digits[i]];
    }

    answer = digits.slice(0, 4).join('');
    console.log("Secret Answer (Debug):", answer); // For debugging purposes
    return answer;
}

/**
 * Compares the user's guess with the secret answer.
 * @param {string} guess - The user's 4-digit guess.
 * @param {string} answer - The secret 4-digit answer.
 * @returns {object} An object containing the count of A and B.
 *                   { A: number, B: number }
 *                   A: Correct number and correct position.
 *                   B: Correct number but wrong position.
 */
function checkGuess(guess, answer) {
    let countA = 0;
    let countB = 0;

    // First pass: Check for A (Correct position and value)
    for (let i = 0; i < 4; i++) {
        if (guess[i] === answer[i]) {
            countA++;
        }
    }

    // Second pass: Check for B (Correct value but wrong position)
    // We check if the digit exists in the answer, and it's NOT a direct match (A)
    // However, for standard 1A2B with unique digits, we can simply count how many digits overlap
    // and subtract A from that total to get B.
    // Since digits are unique, if guess[i] is in answer, it's either A or B.

    let totalMatches = 0;
    for (let i = 0; i < 4; i++) {
        if (answer.includes(guess[i])) {
            totalMatches++;
        }
    }

    countB = totalMatches - countA;

    return { A: countA, B: countB };
}

/**
 * Validates the user input.
 * @param {string} guess - The user's input string.
 * @returns {object} { valid: boolean, message: string }
 */
function isValid(guess) {
    // Check length
    if (guess.length !== 4) {
        return { valid: false, message: "請輸入 4 位數字" };
    }

    // Check if numeric
    if (!/^\d+$/.test(guess)) {
        return { valid: false, message: "只能輸入數字" };
    }

    // Check for unique digits
    const uniqueDigits = new Set(guess);
    if (uniqueDigits.size !== 4) {
        return { valid: false, message: "數字不能重複" };
    }

    return { valid: true, message: "" };
}

/**
 * Handles the game initialization.
 */
function initGame() {
    secretAnswer = generateAnswer();
    isGameOver = false;
    guessInput.value = "";
    guessInput.disabled = false;
    submitBtn.disabled = false;
    restartBtn.classList.add('hidden');
    historyList.innerHTML = "";
    gameStatus.textContent = "遊戲開始！請輸入你的猜測。";
    gameStatus.className = "status-message";
    guessInput.focus();
}

/**
 * Handles the user's guess submission.
 */
function handleGuess() {
    if (isGameOver) return;

    const guess = guessInput.value;
    const validation = isValid(guess);

    if (!validation.valid) {
        gameStatus.textContent = validation.message;
        gameStatus.className = "status-message error";
        return; // Stop execution if invalid
    }

    // Valid guess, proceed to check
    const result = checkGuess(guess, secretAnswer);

    // Update History
    addHistoryItem(guess, result);

    // Update Status
    if (result.A === 4) {
        gameStatus.textContent = `恭喜！你猜對了！答案是 ${secretAnswer}`;
        gameStatus.className = "status-message win";
        endGame(true);
    } else {
        gameStatus.textContent = `猜測結果：${result.A}A${result.B}B`;
        gameStatus.className = "status-message";
        guessInput.value = "";
        guessInput.focus();
    }
}

/**
 * Adds a history item to the list.
 * @param {string} guess 
 * @param {object} result 
 */
function addHistoryItem(guess, result) {
    const item = document.createElement('div');
    item.className = 'history-item';

    const isWin = result.A === 4;
    const resultClass = isWin ? 'result-val correct' : 'result-val';

    item.innerHTML = `
        <span class="guess-val">${guess}</span>
        <span class="${resultClass}">${result.A}A${result.B}B</span>
    `;

    // Prepend to show latest at top
    historyList.prepend(item);
}

/**
 * Ends the game.
 * @param {boolean} win 
 */
function endGame(win) {
    isGameOver = true;
    guessInput.disabled = true;
    submitBtn.disabled = true;
    restartBtn.classList.remove('hidden');
}

// Event Listeners
submitBtn.addEventListener('click', handleGuess);

guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleGuess();
    }
});

restartBtn.addEventListener('click', initGame);

// Start game on load
initGame();
