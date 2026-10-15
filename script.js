/**
 * Tip Calculator
 * Tip Amount = Bill × Tip% / 100
 * Total Bill = Bill + Tip Amount
 * Amount Per Person = Total Bill / Number of People
 */

(function () {
  const DEFAULT_TIP = 15;
  const DEFAULT_PEOPLE = 1;

  const billInput = document.getElementById("bill-amount");
  const peopleInput = document.getElementById("people-count");
  const customTipInput = document.getElementById("custom-tip");
  const customTipField = document.getElementById("custom-tip-field");
  const tipButtons = document.querySelectorAll(".tip-btn");
  const form = document.getElementById("tip-form");

  const billError = document.getElementById("bill-error");
  const tipError = document.getElementById("tip-error");
  const peopleError = document.getElementById("people-error");

  const tipAmountEl = document.getElementById("tip-amount");
  const totalBillEl = document.getElementById("total-bill");
  const perPersonEl = document.getElementById("per-person");

  let selectedTip = DEFAULT_TIP;
  let usingCustomTip = false;

  const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function formatCurrency(value) {
    return currencyFormatter.format(value);
  }

  function setError(element, message) {
    element.textContent = message;
  }

  function clearErrors() {
    setError(billError, "");
    setError(tipError, "");
    setError(peopleError, "");
  }

  function showZeroResults() {
    tipAmountEl.textContent = formatCurrency(0);
    totalBillEl.textContent = formatCurrency(0);
    perPersonEl.textContent = formatCurrency(0);
  }

  /**
   * Parse a numeric field. Empty is allowed (returns null, no error).
   * Negative, NaN, and other invalid values return an error message.
   */
  function parsePositiveNumber(rawValue, label, { allowZero = false } = {}) {
    const trimmed = String(rawValue).trim();

    if (trimmed === "") {
      return { value: null, error: "" };
    }

    const value = Number(trimmed);

    if (!Number.isFinite(value)) {
      return { value: null, error: `Please enter a valid ${label}.` };
    }

    if (allowZero ? value < 0 : value <= 0) {
      return {
        value: null,
        error: allowZero
          ? `${label} cannot be negative.`
          : `${label} must be greater than 0.`,
      };
    }

    return { value, error: "" };
  }

  function parsePeople(rawValue) {
    const trimmed = String(rawValue).trim();

    if (trimmed === "") {
      return { value: null, error: "Enter how many people are splitting the bill." };
    }

    const value = Number(trimmed);

    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      return { value: null, error: "Number of people must be a whole number." };
    }

    if (value < 1) {
      return { value: null, error: "At least 1 person is required." };
    }

    return { value, error: "" };
  }

  function getTipPercent() {
    if (!usingCustomTip) {
      return { value: selectedTip, error: "" };
    }

    const parsed = parsePositiveNumber(customTipInput.value, "Tip percentage", {
      allowZero: true,
    });

    if (parsed.value === null && parsed.error === "") {
      return { value: null, error: "Enter a custom tip percentage." };
    }

    if (parsed.error) {
      return parsed;
    }

    if (parsed.value > 100) {
      return { value: null, error: "Tip percentage cannot be more than 100%." };
    }

    return parsed;
  }

  function calculate() {
    clearErrors();

    const bill = parsePositiveNumber(billInput.value, "Bill amount");
    const tip = getTipPercent();
    const people = parsePeople(peopleInput.value);

    setError(billError, bill.error);
    setError(tipError, tip.error);
    setError(peopleError, people.error);

    const hasValidInputs =
      bill.value !== null &&
      tip.value !== null &&
      people.value !== null &&
      !bill.error &&
      !tip.error &&
      !people.error;

    if (!hasValidInputs) {
      showZeroResults();
      return;
    }

    const tipAmount = (bill.value * tip.value) / 100;
    const totalBill = bill.value + tipAmount;
    const perPerson = totalBill / people.value;

    tipAmountEl.textContent = formatCurrency(tipAmount);
    totalBillEl.textContent = formatCurrency(totalBill);
    perPersonEl.textContent = formatCurrency(perPerson);
  }

  function setActiveTipButton(activeButton) {
    tipButtons.forEach((button) => {
      const isActive = button === activeButton;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function selectPresetTip(percent, button) {
    usingCustomTip = false;
    selectedTip = percent;
    customTipField.hidden = true;
    customTipInput.value = "";
    setActiveTipButton(button);
    calculate();
  }

  function selectCustomTip(button) {
    usingCustomTip = true;
    customTipField.hidden = false;
    setActiveTipButton(button);
    customTipInput.focus();
    calculate();
  }

  function resetCalculator() {
    billInput.value = "";
    peopleInput.value = String(DEFAULT_PEOPLE);
    customTipInput.value = "";
    usingCustomTip = false;
    selectedTip = DEFAULT_TIP;
    customTipField.hidden = true;

    const defaultButton = document.querySelector('.tip-btn[data-tip="15"]');
    setActiveTipButton(defaultButton);
    clearErrors();
    showZeroResults();
    billInput.focus();
  }

  tipButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tipValue = button.dataset.tip;
      if (tipValue === "custom") {
        selectCustomTip(button);
      } else {
        selectPresetTip(Number(tipValue), button);
      }
    });
  });

  billInput.addEventListener("input", calculate);
  peopleInput.addEventListener("input", calculate);
  customTipInput.addEventListener("input", calculate);

  form.addEventListener("reset", (event) => {
    event.preventDefault();
    resetCalculator();
  });

  showZeroResults();
})();
