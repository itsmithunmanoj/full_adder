
// GET ALL NAVIGATION BUTTONS
const navigationButtons = document.querySelectorAll(".nav-item");

// GET ALL WEBSITE PAGES
const pages = document.querySelectorAll(".page");

// GET THE THEME BUTTON
const themeToggle = document.getElementById("themeToggle");


// FUNCTION TO CHANGE WEBSITE PAGE
function showPage(pageId) {

    // Hide all pages
    pages.forEach(page => {
        page.classList.remove("active");
    });

    // Show selected page
    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    // Update active sidebar button
    navigationButtons.forEach(button => {
        button.classList.remove("active");

        if (button.dataset.page === pageId) {
            button.classList.add("active");
        }
    });

    // Update page heading
    const heading = document.querySelector(".topbar h2");
    const breadcrumb = document.querySelector(".breadcrumb");

    if (pageId === "history" && typeof renderCalculationHistory === "function") {
        renderCalculationHistory();
    }

    if (heading && selectedPage) {
        const pageHeading = selectedPage.querySelector("h1")?.textContent
            || "Welcome to LogicLab";

        heading.textContent = pageId === "dashboard"
            ? "Welcome to LogicLab"
            : pageHeading;

        breadcrumb.textContent = "Digital Logic Lab / " + pageHeading;
    }
}


// SIDEBAR NAVIGATION
navigationButtons.forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});


// DASHBOARD CARD AND START BUTTON NAVIGATION
document.querySelectorAll("[data-page]:not(.nav-item)").forEach(element => {
    element.addEventListener("click", () => {
        showPage(element.dataset.page);
    });
});


// THEME SWITCHING
function updateThemeButton() {

    if (document.body.classList.contains("light")) {
        themeToggle.textContent = "🌙 Dark Mode";
    } else {
        themeToggle.textContent = "☀ Light Mode";
    }
}


// LOAD SAVED THEME
const savedTheme = localStorage.getItem("logicLabTheme");

if (savedTheme === "light") {
    document.body.classList.add("light");
}

updateThemeButton();


// CHANGE THEME WHEN BUTTON IS CLICKED
themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("light");

    const currentTheme = document.body.classList.contains("light")
        ? "light"
        : "dark";

    localStorage.setItem("logicLabTheme", currentTheme);

    updateThemeButton();
});

console.log("LogicLab Dashboard Loaded Successfully!");



// ==================================
// FULL ADDER SIMULATOR - C BACKEND
// ==================================

// Store the three input values
let A = 0;
let B = 0;
let Cin = 0;

// Prevent an older server response from overwriting a newer result
let latestRequest = 0;

// Get HTML elements
const valueA = document.getElementById("valueA");
const valueB = document.getElementById("valueB");
const valueCin = document.getElementById("valueCin");

const sumOutput = document.getElementById("sumOutput");
const carryOutput = document.getElementById("carryOutput");
const binaryResult = document.getElementById("binaryResult");

const calculationSteps = document.getElementById("calculationSteps");


// Update the appearance and accessibility state of a sliding switch
function updateSwitch(id, value) {
    const button = document.getElementById(id);
    if (!button) return;

    button.classList.toggle("is-on", value === 1);
    button.setAttribute("aria-checked", value === 1 ? "true" : "false");

    const stateLabel = button.querySelector(".switch-state");
    if (stateLabel) stateLabel.textContent = value === 1 ? "ON" : "OFF";
}

// Send the current inputs to Node.js.
// Node.js runs the C program and returns Sum and Carry.
async function calculateFullAdder() {
    const requestId = ++latestRequest;

    // Update input displays immediately when a switch is clicked
    valueA.textContent = A;
    valueB.textContent = B;
    valueCin.textContent = Cin;

    // Update the visual sliding switches immediately
    updateSwitch("toggleA", A);
    updateSwitch("toggleB", B);
    updateSwitch("toggleCin", Cin);

    // Update the circuit immediately, without waiting for the C backend.
    // Only wires carrying logic 1 will glow; logic 0 wires stay inactive.
    updateCircuitDisplay();

    try {
        const response = await fetch("/api/calculate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ A, B, Cin })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Calculation failed");
        }

        // Ignore an older response if the user has changed an input again
        if (requestId !== latestRequest) return;

        const Sum = data.sum;
        const Cout = data.carry;

        // Save this successful calculation in browser history
        saveCalculationHistory({ A, B, Cin, Sum, Cout, result: data.result, time: new Date().toISOString() });

        // Display results returned by the C program
        sumOutput.textContent = Sum;
        carryOutput.textContent = Cout;
        binaryResult.textContent = data.result;

        const xorAB = A ^ B;

        calculationSteps.innerHTML = `
            <p>1. XOR calculation: ${A} ⊕ ${B} = ${xorAB}</p>
            <p>2. Sum calculation: ${xorAB} ⊕ ${Cin} = ${Sum}</p>
            <p>3. Carry calculation:
            (${A} AND ${B}) OR (${Cin} AND ${xorAB}) = ${Cout}</p>
            <p><strong>Calculated using the C program.</strong></p>
            <p><strong>Final result: ${data.result}</strong></p>
        `;

        // Update the logic circuit display
        updateCircuitDisplay();
        highlightTruthTableRow();

    } catch (error) {
        if (requestId !== latestRequest) return;

        calculationSteps.textContent =
            "Backend error: " + error.message;
        highlightTruthTableRow();

        console.error("Full Adder backend error:", error);
    }
}

// Input switch buttons
document.getElementById("toggleA").addEventListener("click", () => {
    A = A === 0 ? 1 : 0;
    calculateFullAdder();
});

document.getElementById("toggleB").addEventListener("click", () => {
    B = B === 0 ? 1 : 0;
    calculateFullAdder();
});

document.getElementById("toggleCin").addEventListener("click", () => {
    Cin = Cin === 0 ? 1 : 0;
    calculateFullAdder();
});

// Reset all inputs
document.getElementById("resetSimulator").addEventListener("click", () => {
    A = 0;
    B = 0;
    Cin = 0;
    calculateFullAdder();
});

// Run once when the website loads
calculateFullAdder();

// ==================================
// STAGE 4 - LOGIC CIRCUIT CONNECTION
// ==================================

function updateCircuitDisplay() {

    // Intermediate calculations
    const X = A ^ B;
    const P = A & B;
    const Q = X & Cin;

    const Sum = X ^ Cin;
    const Cout = P | Q;


    // Update circuit input values
    document.getElementById("circuitA").textContent = A;
    document.getElementById("circuitB").textContent = B;
    document.getElementById("circuitCin").textContent = Cin;


    // Update intermediate results
    document.getElementById("intermediateX").textContent = X;
    document.getElementById("intermediateP").textContent = P;
    document.getElementById("intermediateQ").textContent = Q;


    // Update SVG output values
    document.getElementById("svgSum").textContent = Sum;
    document.getElementById("svgCarry").textContent = Cout;


    // Function to show active or inactive wires
    function setWire(id, value) {

        const wire = document.getElementById(id);

        if (wire) {
            wire.classList.toggle("active", value === 1);
        }
    }


    // Input signal wires
    setWire("wireA", A);
    setWire("wireB", B);
    setWire("wireAand", A);
    setWire("wireBand", B);

    // XOR 1 output
    setWire("wireX", X);
    setWire("wireXand", X);

    // Carry-in wires
    setWire("wireCinXor", Cin);
    setWire("wireCinAnd", Cin);

    // AND outputs
    setWire("wireP", P);
    setWire("wireQ", Q);

    // Final outputs
    setWire("wireSum", Sum);
    setWire("wireCarry", Cout);

    // Highlight a gate when its output is 1
    function setGate(id, value) {
        const gate = document.getElementById(id);
        if (gate) gate.classList.toggle("active", value === 1);
    }

    setGate("gateXor1", X);
    setGate("gateXor2", Sum);
    setGate("gateAnd1", P);
    setGate("gateAnd2", Q);
    setGate("gateOr", Cout);
}




// ==========================================
// STAGE 5 - BINARY CALCULATOR
// ==========================================

const binaryAInput = document.getElementById("binaryA");
const binaryBInput = document.getElementById("binaryB");

const calculateBinaryButton =
    document.getElementById("calculateBinary");

const resetBinaryButton =
    document.getElementById("resetBinary");


// Calculate binary addition using Full Adder logic
function addBinaryNumbers() {

    const numberA = binaryAInput.value.trim();
    const numberB = binaryBInput.value.trim();

    const error = document.getElementById("binaryError");

    // Validate empty inputs
    if (numberA === "" || numberB === "") {
        error.textContent = "Please enter both binary numbers.";
        return;
    }

    // Validate binary digits
    if (!/^[01]+$/.test(numberA) || !/^[01]+$/.test(numberB)) {
        error.textContent = "Only binary digits 0 and 1 are allowed.";
        return;
    }

    // Validate maximum length
    if (numberA.length > 16 || numberB.length > 16) {
        error.textContent = "Maximum input length is 16 bits.";
        return;
    }

    error.textContent = "";


    // Make both numbers the same length
    const maxLength = Math.max(numberA.length, numberB.length);

    const a = numberA.padStart(maxLength, "0");
    const b = numberB.padStart(maxLength, "0");


    let carry = 0;
    let result = "";
    let rows = [];


    // Start addition from the rightmost bit
    for (let i = maxLength - 1; i >= 0; i--) {

        const bitA = Number(a[i]);
        const bitB = Number(b[i]);
        const carryIn = carry;

        // Full Adder equations
        const xorAB = bitA ^ bitB;

        const sum = xorAB ^ carryIn;

        const carryOut =
            (bitA & bitB) | (xorAB & carryIn);


        // Add result bit to the beginning
        result = sum + result;


        // Store calculation for the table
        rows.push({
            bit: maxLength - 1 - i,
            a: bitA,
            b: bitB,
            carryIn: carryIn,
            sum: sum,
            carryOut: carryOut
        });


        carry = carryOut;
    }


    // Add final carry if needed
    if (carry === 1) {
        result = "1" + result;
    }


    // Display the results
    document.getElementById("displayBinaryA").textContent = a;
    document.getElementById("displayBinaryB").textContent = b;

    document.getElementById("displayBinaryResult").textContent = result;

    // Convert the binary result to decimal
    document.getElementById("decimalResult").textContent =
        parseInt(result, 2);


    // Display bit-by-bit Full Adder operations
    const tableBody = document.getElementById("binaryStepsBody");

    tableBody.innerHTML = "";

    rows.forEach(row => {

        const tableRow = document.createElement("tr");

        tableRow.innerHTML = `
            <td>${row.bit}</td>
            <td>${row.a}</td>
            <td>${row.b}</td>
            <td>${row.carryIn}</td>
            <td>${row.sum}</td>
            <td>${row.carryOut}</td>
        `;

        tableBody.appendChild(tableRow);
    });
}


// Calculate button
calculateBinaryButton.addEventListener("click", addBinaryNumbers);


// Reset calculator
resetBinaryButton.addEventListener("click", () => {

    binaryAInput.value = "";
    binaryBInput.value = "";

    document.getElementById("binaryError").textContent = "";

    document.getElementById("displayBinaryA").textContent = "----";
    document.getElementById("displayBinaryB").textContent = "----";
    document.getElementById("displayBinaryResult").textContent = "----";

    document.getElementById("decimalResult").textContent = "----";

    document.getElementById("binaryStepsBody").innerHTML = `
        <tr>
            <td colspan="6">
                Enter two binary numbers to see the calculation.
            </td>
        </tr>
    `;
});


// FULL ADDER TRUTH TABLE

function generateTruthTable() {

    const tableBody = document.getElementById("truthTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    for (let A = 0; A <= 1; A++) {

        for (let B = 0; B <= 1; B++) {

            for (let Cin = 0; Cin <= 1; Cin++) {

                const xorAB = A ^ B;

                const Sum = xorAB ^ Cin;

                const Cout = (A & B) | (Cin & xorAB);

                const row = document.createElement("tr");

                row.dataset.a = A;
                row.dataset.b = B;
                row.dataset.cin = Cin;

                row.innerHTML = `
                    <td>${A}</td>
                    <td>${B}</td>
                    <td>${Cin}</td>
                    <td>${Sum}</td>
                    <td>${Cout}</td>
                `;

                tableBody.appendChild(row);
            }
        }
    }

    highlightTruthTableRow();
}


// HIGHLIGHT CURRENT INPUT COMBINATION

function highlightTruthTableRow() {

    const tableBody = document.getElementById("truthTableBody");

    if (!tableBody) return;

    const rows = tableBody.querySelectorAll("tr");

    rows.forEach(row => {

        const rowA = Number(row.dataset.a);
        const rowB = Number(row.dataset.b);
        const rowCin = Number(row.dataset.cin);

        row.classList.remove("current-row");

        if (
            rowA === Number(A) &&
            rowB === Number(B) &&
            rowCin === Number(Cin)
        ) {
            row.classList.add("current-row");
        }
    });
}


// GENERATE TABLE WHEN WEBSITE LOADS

document.addEventListener("DOMContentLoaded", generateTruthTable);



// LEARNING MODE TRUTH TABLE

function generateLearningTruthTable() {

    const tableBody = document.getElementById(
        "learningTruthTableBody"
    );

    if (!tableBody) return;

    tableBody.innerHTML = "";

    for (let A = 0; A <= 1; A++) {
        for (let B = 0; B <= 1; B++) {
            for (let Cin = 0; Cin <= 1; Cin++) {

                const Sum = A ^ B ^ Cin;
                const Cout = (A & B) | (Cin & (A ^ B));

                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${A}</td>
                    <td>${B}</td>
                    <td>${Cin}</td>
                    <td>${Sum}</td>
                    <td>${Cout}</td>
                `;

                tableBody.appendChild(row);
            }
        }
    }
}

document.addEventListener(
    "DOMContentLoaded",
    generateLearningTruthTable
);


// FULL ADDER PRACTICE QUIZ

const quizQuestions = [
    {
        question: "How many inputs does a Full Adder have?",
        options: ["One", "Two", "Three", "Four"],
        answer: 2
    },
    {
        question: "How many outputs does a Full Adder produce?",
        options: ["One", "Two", "Three", "Four"],
        answer: 1
    },
    {
        question: "Which gate is used to calculate the Sum?",
        options: ["AND", "OR", "XOR", "NOT"],
        answer: 2
    },
    {
        question: "What is the Sum when A=1, B=1 and Cin=0?",
        options: ["0", "1", "10", "11"],
        answer: 0
    },
    {
        question: "What is the Carry output when A=1, B=1 and Cin=1?",
        options: ["0", "1", "10", "11"],
        answer: 1
    }
];

let currentQuestion = 0;
let quizScore = 0;
let selectedAnswer = null;
let answerSubmitted = false;

function loadQuizQuestion() {

    const question = quizQuestions[currentQuestion];

    document.getElementById("questionNumber").textContent =
        `Question ${currentQuestion + 1} of ${quizQuestions.length}`;

    document.getElementById("quizQuestion").textContent =
        question.question;

    document.getElementById("quizProgressBar").style.width =
        `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;

    document.getElementById("quizFeedback").textContent = "";

    document.getElementById("submitAnswer").hidden = false;
    document.getElementById("nextQuestion").hidden = true;

    selectedAnswer = null;
    answerSubmitted = false;

    const optionsContainer = document.getElementById("quizOptions");
    optionsContainer.innerHTML = "";

    question.options.forEach((option, index) => {

        const button = document.createElement("button");

        button.className = "quiz-option";
        button.textContent = option;

        button.addEventListener("click", () => {

            if (answerSubmitted) return;

            selectedAnswer = index;

            document.querySelectorAll(".quiz-option").forEach(btn => {
                btn.classList.remove("selected");
            });

            button.classList.add("selected");
        });

        optionsContainer.appendChild(button);
    });
}

function submitQuizAnswer() {

    if (selectedAnswer === null) {
        document.getElementById("quizFeedback").textContent =
            "Please select an answer first.";
        return;
    }

    const question = quizQuestions[currentQuestion];

    answerSubmitted = true;

    const options = document.querySelectorAll(".quiz-option");

    options[question.answer].classList.add("correct");

    if (selectedAnswer === question.answer) {

        quizScore++;

        document.getElementById("quizFeedback").textContent =
            "Correct answer! Well done.";

    } else {

        options[selectedAnswer].classList.add("wrong");

        document.getElementById("quizFeedback").textContent =
            "Wrong answer. The correct answer is " +
            question.options[question.answer] + ".";
    }

    document.getElementById("submitAnswer").hidden = true;
    document.getElementById("nextQuestion").hidden = false;
}

function nextQuizQuestion() {

    currentQuestion++;

    if (currentQuestion < quizQuestions.length) {
        loadQuizQuestion();
    } else {
        showQuizResult();
    }
}

function showQuizResult() {

    document.getElementById("quizQuestion").hidden = true;
    document.getElementById("quizOptions").hidden = true;
    document.getElementById("quizFeedback").hidden = true;
    document.getElementById("submitAnswer").hidden = true;
    document.getElementById("nextQuestion").hidden = true;
    document.querySelector(".quiz-progress").hidden = true;
    document.querySelector(".quiz-top").hidden = true;

    document.getElementById("quizResult").hidden = false;

    document.getElementById("finalScore").textContent =
        `${quizScore} / ${quizQuestions.length}`;

    document.getElementById("scoreMessage").textContent =
        quizScore === 5 ? "Excellent work!" :
        quizScore >= 3 ? "Good job! Keep practising." :
        "Keep learning and try again!";
}

function restartQuiz() {

    currentQuestion = 0;
    quizScore = 0;

    document.getElementById("quizResult").hidden = true;
    document.getElementById("quizQuestion").hidden = false;
    document.getElementById("quizOptions").hidden = false;
    document.getElementById("quizFeedback").hidden = false;
    document.querySelector(".quiz-progress").hidden = false;
    document.querySelector(".quiz-top").hidden = false;

    loadQuizQuestion();
}

// Quiz buttons

document.getElementById("submitAnswer").addEventListener(
    "click", submitQuizAnswer
);

document.getElementById("nextQuestion").addEventListener(
    "click", nextQuizQuestion
);

document.getElementById("restartQuiz").addEventListener(
    "click", restartQuiz
);

// Start quiz only when the quiz page exists
if (document.getElementById("quizQuestion")) {
    loadQuizQuestion();
}

// ==================================
// CALCULATION HISTORY (LOCALSTORAGE)
// ==================================
const HISTORY_KEY = "logicLabCalculationHistory";

function saveCalculationHistory(item) {
    try {
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
        history.unshift(item);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
    } catch (error) {
        console.error("Could not save calculation history:", error);
    }
}

function renderCalculationHistory() {
    const body = document.getElementById("historyTableBody");
    if (!body) return;

    let history = [];
    try {
        history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch (error) {
        console.error("Could not read calculation history:", error);
    }

    body.innerHTML = "";
    if (!history.length) {
        body.innerHTML = '<tr><td colspan="7">No calculations saved yet. Use the simulator first.</td></tr>';
        return;
    }

    history.forEach(item => {
        const row = document.createElement("tr");
        const date = new Date(item.time);
        const dateText = Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
        [dateText, item.A, item.B, item.Cin, item.Sum, item.Cout, item.result].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
        body.appendChild(row);
    });
}

const clearHistoryButton = document.getElementById("clearHistory");
if (clearHistoryButton) {
    clearHistoryButton.addEventListener("click", () => {
        localStorage.removeItem(HISTORY_KEY);
        renderCalculationHistory();
    });
}

renderCalculationHistory();