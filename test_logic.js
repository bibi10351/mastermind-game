const { generateAnswer, checkGuess } = require('./script.js');

// Mocking DOM for node environment if needed, or just extracting logic
// Since script.js has DOM manipulation mixed in, we might need to adjust for pure logic testing.
// However, for this simple task, I will create a separate logic-only file or just mock the necessary parts if I were running it in a real test runner.
// But here, I'll just create a simple standalone test script that COPY-PASTES the logic functions to verify them independently 
// to avoid DOM errors in a node environment.

console.log("Running Logic Tests...");

// --- Logic from script.js ---
function generateAnswerTest() {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let answer = "";
    for (let i = digits.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [digits[i], digits[j]] = [digits[j], digits[i]];
    }
    answer = digits.slice(0, 4).join('');
    return answer;
}

function checkGuessTest(guess, answer) {
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
// ----------------------------

// Test 1: Generate Answer
const ans = generateAnswerTest();
console.log(`Generated Answer: ${ans}`);
if (ans.length !== 4) console.error("FAIL: Length is not 4");
if (new Set(ans).size !== 4) console.error("FAIL: Digits are not unique");
if (!/^\d+$/.test(ans)) console.error("FAIL: Not all digits");

// Test 2: Check Guess Logic
const testCases = [
    { guess: "1234", answer: "1234", expected: { A: 4, B: 0 } },
    { guess: "1234", answer: "4321", expected: { A: 0, B: 4 } },
    { guess: "1234", answer: "1256", expected: { A: 2, B: 0 } },
    { guess: "1234", answer: "5678", expected: { A: 0, B: 0 } },
    { guess: "1234", answer: "1357", expected: { A: 1, B: 1 } }, // 1 is A, 3 is B
];

let allPass = true;
testCases.forEach((tc, index) => {
    const res = checkGuessTest(tc.guess, tc.answer);
    if (res.A !== tc.expected.A || res.B !== tc.expected.B) {
        console.error(`FAIL Case ${index + 1}: Guess ${tc.guess}, Ans ${tc.answer}. Expected ${tc.expected.A}A${tc.expected.B}B, Got ${res.A}A${res.B}B`);
        allPass = false;
    } else {
        console.log(`PASS Case ${index + 1}`);
    }
});

if (allPass) {
    console.log("All logic tests passed!");
} else {
    console.error("Some tests failed.");
}
