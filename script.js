/**
 * Mastermind Game Core Logic
 */

// Game State
const GAME_VERSION = 'v1.2.0';
let secretAnswer = "";
let isGameOver = false;
let historyData = []; // Store guess history for persistence

// Update Main Title with Version
const mainTitle = document.querySelector('h1');
if (mainTitle) {
    mainTitle.innerHTML += ` <span style="font-size: 0.5rem; vertical-align: middle; opacity: 0.7;">(${GAME_VERSION})</span>`;
}

// DOM Elements
const guessInput = document.getElementById('guess-input');
const submitBtn = document.getElementById('submit-btn');
const newGameBtn = document.getElementById('new-game-btn');
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
    for (let i = digits.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [digits[i], digits[j]] = [digits[j], digits[i]];
    }

    answer = digits.slice(0, 4).join('');
    console.log("Secret Answer (Debug):", answer);
    return answer;
}

/**
 * Compares the user's guess with the secret answer.
 */
function checkGuess(guess, answer) {
    let countA = 0;
    let countB = 0;

    for (let i = 0; i < 4; i++) {
        if (guess[i] === answer[i]) {
            countA++;
        }
    }

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
 */
function isValid(guess) {
    if (guess.length !== 4) return { valid: false, message: "請輸入 4 位數字" };
    if (!/^\d+$/.test(guess)) return { valid: false, message: "只能輸入數字" };
    const uniqueDigits = new Set(guess);
    if (uniqueDigits.size !== 4) return { valid: false, message: "數字不能重複" };
    return { valid: true, message: "" };
}

/**
 * Saves current game state to LocalStorage.
 */
function saveState() {
    const state = {
        secretAnswer: secretAnswer,
        isGameOver: isGameOver,
        historyData: historyData
    };
    localStorage.setItem('mastermind_save', JSON.stringify(state));
}

/**
 * Loads game state from LocalStorage.
 * @returns {boolean} True if state was loaded successfully.
 */
function loadState() {
    const savedState = localStorage.getItem('mastermind_save');
    if (!savedState) return false;

    try {
        const state = JSON.parse(savedState);
        secretAnswer = state.secretAnswer;
        isGameOver = state.isGameOver;
        historyData = state.historyData || [];

        // Restore UI - render history
        historyList.innerHTML = "";
        historyData.forEach(item => {
            addHistoryItem(item.guess, item.result);
        });

        // Restore game state UI
        if (isGameOver) {
            guessInput.disabled = true;
            submitBtn.disabled = true;
            restartBtn.classList.remove('hidden');

            if (historyData.length > 0 && historyData[historyData.length - 1].result.A === 4) {
                gameStatus.textContent = `恭喜！你猜對了！答案是 ${secretAnswer}`;
                gameStatus.className = "status-message win";
            } else {
                gameStatus.textContent = "遊戲結束";
                gameStatus.className = "status-message";
            }
        } else {
            guessInput.disabled = false;
            submitBtn.disabled = false;
            restartBtn.classList.add('hidden');

            if (historyData.length > 0) {
                const last = historyData[historyData.length - 1];
                gameStatus.textContent = `猜測結果：${last.result.A}A${last.result.B}B`;
                gameStatus.className = "status-message";
            } else {
                gameStatus.textContent = "遊戲開始！請輸入你的猜測。";
                gameStatus.className = "status-message";
            }
        }

        console.log("Secret Answer (Restored):", secretAnswer);
        return true;
    } catch (e) {
        console.error("Failed to load state:", e);
        return false;
    }
}

/**
 * Resets the game - clears storage and initializes new game.
 */
function resetGame() {
    localStorage.removeItem('mastermind_save');
    secretAnswer = generateAnswer();
    isGameOver = false;
    historyData = [];

    guessInput.value = "";
    guessInput.disabled = false;
    submitBtn.disabled = false;
    restartBtn.classList.add('hidden');
    historyList.innerHTML = "";
    gameStatus.textContent = "遊戲開始！請輸入你的猜測。";
    gameStatus.className = "status-message";
    guessInput.focus();

    saveState();
}

/**
 * Initializes the application.
 */
function initialize() {
    if (!loadState()) {
        resetGame();
    }
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
        return;
    }

    const result = checkGuess(guess, secretAnswer);
    historyData.push({ guess: guess, result: result });
    addHistoryItem(guess, result);

    if (result.A === 4) {
        gameStatus.textContent = `恭喜！你猜對了！答案是 ${secretAnswer}`;
        gameStatus.className = "status-message win";
        endGame(true);
    } else {
        gameStatus.textContent = `猜測結果：${result.A}A${result.B}B`;
        gameStatus.className = "status-message";
        guessInput.value = "";
        guessInput.focus();
        saveState();
    }
}

/**
 * Adds a history item to the list.
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

    historyList.prepend(item);
}

/**
 * Ends the game.
 */
function endGame(win) {
    isGameOver = true;
    guessInput.disabled = true;
    submitBtn.disabled = true;
    restartBtn.classList.remove('hidden');
    saveState();
}

// Event Listeners
submitBtn.addEventListener('click', handleGuess);

guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleGuess();
    }
});

newGameBtn.addEventListener('click', () => {
    if (confirm('確定要放棄當前進度並重新開始嗎？')) {
        resetGame();
    }
});

restartBtn.addEventListener('click', resetGame);

// Start
initialize();
