document.addEventListener("DOMContentLoaded", () => {
    const display = document.getElementById("calc-display");
    const buttons = document.querySelectorAll(".calc-btn");

    if (!display || buttons.length === 0) return;

    let currentInput = "0";
    let previousInput = null;
    let operator = null;
    let shouldReset = false;

    function updateDisplay() {
        display.textContent = currentInput;
    }

    function calculate() {
        const first = Number(previousInput);
        const second = Number(currentInput);
        let result;

        if (operator === "+") result = first + second;
        else if (operator === "-") result = first - second;
        else if (operator === "*") result = first * second;
        else if (operator === "/") {
            if (second === 0) {
                currentInput = "Cannot divide by zero";
                previousInput = null;
                operator = null;
                shouldReset = true;
                updateDisplay();
                return;
            }
            result = first / second;
        }

        currentInput = String(Number(result.toFixed(8)));
        previousInput = null;
        operator = null;
        shouldReset = true;
        updateDisplay();
    }

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const value = button.dataset.value;
            const action = button.dataset.action;

            if (action === "clear") {
                currentInput = "0";
                previousInput = null;
                operator = null;
                shouldReset = false;
            } else if (action === "equals") {
                if (operator !== null && previousInput !== null) {
                    calculate();
                    return;
                }
            } else if (["+", "-", "*", "/"].includes(value)) {
                if (operator !== null && !shouldReset) calculate();
                previousInput = currentInput;
                operator = value;
                shouldReset = true;
            } else if (value === ".") {
                if (shouldReset) {
                    currentInput = "0.";
                    shouldReset = false;
                } else if (!currentInput.includes(".")) {
                    currentInput += ".";
                }
            } else if (value !== undefined) {
                if (shouldReset || currentInput === "0" ||
                    currentInput === "Cannot divide by zero") {
                    currentInput = value;
                    shouldReset = false;
                } else {
                    currentInput += value;
                }
            }

            updateDisplay();
        });
    });

    updateDisplay();
});