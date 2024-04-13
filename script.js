// ! SMART PIGGY

const mainContainer = document.querySelector(".container_main");
const financialContainer = document.querySelector(".container_financial");
const welcomeContainer = document.querySelector(".welcome_container ");
const welcomeMessage = document.querySelector(".welcome_message");
const transactionsDiv = document.querySelector(".transactions_div");
const cryptoDiv = document.querySelector(".crypto_div");
const formLogin = document.querySelector(".form_login");

const btnOpenAcc = document.querySelector(".btn_open_acc");
const btnSignup = document.querySelector(".btn_signup");
const formCreateAcc = document.querySelector(".form_create_acc");
const createAccOverlay = document.querySelector(".create_acc_overlay");
const inputName = document.querySelector(".input_name");
const inputSSN = document.querySelector(".input_ssn");
const selectCurrency = document.querySelector(".select_currency");
const cryptoCheckbox = document.querySelector(".input_crypto_checkbox");
const btcNewAcc = document.querySelector(".btc_new_acc");
const ethNewAcc = document.querySelector(".eth_new_acc");
const usdcNewAcc = document.querySelector(".usdc_new_acc");
const btnSubmitForm = document.querySelector(".btn_submit");

const popUpMessage = document.querySelector(".create_acc_message");
const messageStatus = document.querySelector(".message_status");
const messageText = document.querySelector(".message_text");

const btnBanking = document.querySelector(".btn_banking");
const btnCrypto = document.querySelector(".btn_crypto");

const btnCloseOverlay = document.querySelector(".x_close_overlay");
const formCol3 = document.querySelector(".form_column_3");

const whatWeOffer = document.querySelector(".services");
const whatWeOfferOverlay = document.querySelector(".services_overlay");
const navRight = document.querySelector(".nav_2");

const headingYourCrypto = document.querySelector(".heading_your_crypto");
const headingTransactions = document.querySelector(".heading_transactions");

const inputUsername = document.querySelector(".input_login");
const inputPassword = document.querySelector(".input_password");

//
const servicesDiv = document.querySelector(".services_div");
const transferForm = document.querySelector(".transfer_form");
const loanForm = document.querySelector(".loan_form");
const infoTransfer = document.querySelector(".info_transfer");
const infoLoan = document.querySelector(".info_loan");
const msgLoan = document.querySelector(".loan_message");
const msgTransfer = document.querySelector(".transfer_message");
const transferTo = document.querySelector(".transfer_to");
const transferAmount = document.querySelector(".transfer_amount");
const loanAmount = document.querySelector(".loan_amount");
const servicesMessageDiv = document.querySelector(".services_message_div");
const iconPiggy = document.querySelector(".icon_piggy");
const overallBalanceEl = document.querySelector(".overall_balance");
const currentDateTimeOverallEl = document.querySelector(
  ".current_date_time_overall"
);
const currentDateTimeCryptoEl = document.querySelector(
  ".current_date_time_crypto"
);
const formTradeCrypto = document.querySelector(".buy_sell_div");

//
//

let currentAccount;
let accounts = [];
let loggedIn = false;

async function getCryptoPrices() {
  const btcRes = await fetch(
    "https://api.coinpaprika.com/v1/tickers/btc-bitcoin"
  );
  const btcData = await btcRes.json();
  const btcPrice = btcData.quotes.USD.price;
  const ethRes = await fetch(
    "https://api.coinpaprika.com/v1/tickers/eth-ethereum"
  );
  const ethData = await ethRes.json();
  const ethPrice = ethData.quotes.USD.price;
  const usdcPrice = 1;

  return {
    btc: btcPrice,
    eth: ethPrice,
    usdc: usdcPrice,
  };
}

async function calcDisplayCrypto(account) {
  try {
    const btcQt = document.querySelector(".btc_qt");
    const ethQt = document.querySelector(".eth_qt");
    const usdcQt = document.querySelector(".usdc_qt");
    const btcValue = document.querySelector(".btc_value");
    const ethValue = document.querySelector(".eth_value");
    const usdcValue = document.querySelector(".usdc_value");

    const btcPop = document.querySelector(".btc_perc");
    const ethPop = document.querySelector(".eth_perc");
    const usdcPop = document.querySelector(".usdc_perc");
    const cryptoBalance = document.querySelector(".crypto_acc_balance");

    // * quantities
    btcQt.textContent = account.crypto.btc;
    ethQt.textContent = account.crypto.eth;
    usdcQt.textContent = account.crypto.usdc;

    // * prices
    const prices = await getCryptoPrices();
    console.log(prices);

    const percentages = {
      btc: btcPop,
      eth: ethPop,
      usdc: usdcPop,
    };

    const values = {
      btc: btcValue,
      eth: ethValue,
      usdc: usdcValue,
    };

    const totalCryptoValue =
      account.crypto.btc * prices.btc +
      account.crypto.eth * prices.eth +
      account.crypto.usdc * prices.usdc;

    numberFormatAndDisplayBasedOnCurrency(cryptoBalance, totalCryptoValue);

    const cryptoArray = Object.keys(account.crypto);
    cryptoArray.forEach((crypto) => {
      const percentage = `${
        ((account.crypto[crypto] * prices[crypto]) / totalCryptoValue) * 100
      }`;
      const value = account.crypto[crypto] * prices[crypto];
      percentages[crypto].textContent = `${Number(percentage).toFixed(2)}%`;

      numberFormatAndDisplayBasedOnCurrency(values[crypto], value);
      displayCurrentDateAndTime(currentDateTimeCryptoEl);
    });
  } catch (err) {
    console.error(`⛔⛔⛔ Something went wrong. ${err}`);
  }
}

async function tradeCrypto(e) {
  e.preventDefault();
  const prices = await getCryptoPrices();
  const buyOrSell = document.querySelector(".buy_sell").value;
  const cryptoToTrade = document.querySelector(".select_crypto").value;
  const cryptoTradeQt = +document.querySelector(".buy_sell_qt").value;
  const cryptoPrice = prices[cryptoToTrade];
  const cryptoTValue = cryptoTradeQt * cryptoPrice;

  // ! buying
  if (buyOrSell === "buy") {
    // conditions
    if (
      cryptoTValue > currentAccount.overallBalance ||
      cryptoTradeQt <= 0 ||
      isNaN(cryptoTValue)
    )
      return new Error(`You don't have enough funds to buy this currency`);
    // ! success

    // create financial movement + date
    currentAccount.transactions.push(-cryptoTValue);
    currentAccount.transactionsDates.push(
      formatDateBasedOnCurrency(currentAccount, new Date())
    );

    // add to crypto assets
    currentAccount.crypto[cryptoToTrade] += cryptoTradeQt;
  }
  // ! selling
  if (buyOrSell === "sell") {
    if (
      currentAccount.crypto[cryptoToTrade] < cryptoTradeQt ||
      cryptoTradeQt <= 0 ||
      isNaN(cryptoTValue)
    )
      return new Error(`You don't have enough of this coin to sell`);
    // ! success
    // create financial movement + date
    currentAccount.transactions.push(cryptoTValue);
    currentAccount.transactionsDates.push(
      formatDateBasedOnCurrency(currentAccount, new Date())
    );
    // add to crypto assets
    currentAccount.crypto[cryptoToTrade] -= cryptoTradeQt;
  }
  // ? doesn't work in this case
  // clearInputFields(cryptoTradeQt);
  // ! updateUI method to be created
  // overwriting the existing "accounts" in localStorage
  renderTransactions(currentAccount);
  calcDisplayBalanceAndDates();

  // stop listening
  formTradeCrypto.removeEventListener("submit", tradeCrypto);
}

// function tradeCrypto
function formatDateBasedOnCurrency(
  account,
  toFormat,
  options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }
) {
  const formattedDate =
    account.currency === "$"
      ? `${new Intl.DateTimeFormat("en-US", options).format(toFormat)}`
      : `${new Intl.DateTimeFormat("de-DE", options).format(toFormat)}`;

  return formattedDate.replaceAll(".", "/");
}

function numberFormatAndDisplayBasedOnCurrency(
  htmlEl,
  toFormat,
  options = {
    style: "currency",
    currency: currentAccount.currency === "$" ? "USD" : "EUR",
  }
) {
  htmlEl.textContent =
    currentAccount.currency === "$"
      ? `${new Intl.NumberFormat("en-US", options).format(toFormat)}`
      : `${new Intl.NumberFormat("de-DE", options).format(toFormat)}`;
}

function prepareAndRenderSpinner(htmlEl, mainOrServices = "main") {
  if (mainOrServices === "main") {
    mainContainer.style.opacity = 0.2;
  }
  if (mainOrServices === "services") {
    // servicesMessageDiv.style.opacity = 0.5;
  }
  htmlEl.classList.remove("hidden");
  htmlEl.classList.add("dominate");
  renderSpinner(htmlEl);
}
function removeSpinnerOpenContainer(
  messageToDisplay,
  containerToOpen,
  divToOpen,
  toRender
) {
  setTimeout(() => {
    removeSpinner(messageToDisplay);
    toggleDominateClass(messageToDisplay);
    mainContainer.style.opacity = 1;
    openOverlay(containerToOpen, divToOpen);
    renderTransactions(toRender);
    welcomeMessageLoggedIn();
  }, 1000);
}
function switchTab(tabToDisplay, tabToHide, btnToActivate, btnToDeactivate) {
  btnToActivate.classList.add("active");
  btnToActivate.classList.remove("hidden_tab");
  btnToDeactivate.classList.remove("active");
  btnToDeactivate.classList.add("hidden_tab");

  tabToDisplay.classList.remove("hidden");
  tabToHide.classList.add("hidden");
}
function openOverlay(el1, el2) {
  el1.classList.remove("hidden");
  el1.classList.add("visible");
  el2?.classList.remove("hidden");
  el2?.classList.add("visible");
}
function closeOverlay(el1, el2) {
  el1.classList.add("hidden");
  el1.classList.remove("visible");
  el2?.classList.add("hidden");
  el2?.classList.remove("visible");
}
function renderSpinner(el) {
  el.querySelector(".spinner")?.classList.remove("hidden");
  el.closest(".spinner")?.classList.remove("hidden");
}
function removeSpinner(el) {
  // console.log(el.closest(".spinner"));
  el.querySelector(".spinner")?.classList.add("hidden");
  el.closest(".spinner")?.classList.add("hidden");
}
function clearInputFields(...fields) {
  if (typeof fields === "object") {
    fields.forEach((f) => {
      f.value = "";
      f.blur();
    });
  } else {
    fields.value = "";
    fields.blur();
  }
}
function displayMessageText(el) {
  el.querySelector(".message_text")?.classList.remove("hidden");
  el.closest(".message_text")?.classList.remove("hidden");
  el.querySelector(".message_status")?.classList.remove("hidden");
  el.querySelector(".message_status")?.classList.add("dominate");
}
function displayWelcomeMessage() {
  const currentHour = new Date().getHours();
  let timeOfDay;
  if (currentHour >= 6 && currentHour <= 12) timeOfDay = "morning";
  if (currentHour >= 12 && currentHour <= 18) timeOfDay = "afternoon";
  if (currentHour >= 18 && currentHour <= 24) timeOfDay = "evening";
  if (currentHour >= 0 && currentHour <= 6) timeOfDay = "night";

  if (!currentAccount) welcomeMessage.textContent = `Good ${timeOfDay}`;

  if (currentAccount) {
    welcomeMessage.textContent = `Good ${timeOfDay}, ${
      currentAccount.name.split(" ")[0]
    }`;
    welcomeMessage.style.position = "absolute";
    welcomeMessage.style.top = "2rem";
    welcomeMessage.style.right = "2rem";

    welcomeMessage.style.fontSize = "var(--base-plus-3-font-size";
  }
}
function welcomeMessageLoggedIn() {
  navRight.innerHTML = "";
  navRight.insertAdjacentElement("afterbegin", welcomeMessage);

  displayWelcomeMessage();
}
function randomRoundNumber(min, max) {
  const num = Math.round(Math.random() * (max - min) + min);
  const leftover = num % 50;
  // ! avoid zeros - run function again!
  if (num === 0 && leftover === 0) return randomRoundNumber(-5000, 5000);
  return leftover !== 0 ? num - leftover : num;
}
function toggleDominateClass(el) {
  if (!el.classList.contains("dominate") && el.classList.contains("hidden")) {
    el.classList.add("dominate");
    el.classList.remove("hidden");
  }
  if (el.classList.contains("dominate") && !el.classList.contains("hidden")) {
    el.classList.add("hidden");
    el.classList.remove("dominate");
  }
}

function generateTransactionsArray() {
  // between 5 and 12 transactions
  const arrLength = Math.random() * 12 + 5;
  return Array.from({ length: arrLength }, () =>
    randomRoundNumber(-5000, 5000)
  ).reverse();
}
function createTransactionDates(
  account,
  options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  },
  currency = account.currency
) {
  const dates = account.transactions.map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index - 1);
    const formattedDate =
      currency === "$"
        ? `${new Intl.DateTimeFormat("en-US", options).format(date)}`
        : `${new Intl.DateTimeFormat("de-DE", options).format(date)}`;

    return formattedDate.replaceAll(".", "/");
  });

  const finalArray = dates.reverse();
  return finalArray;
}

function daysPassed(date2, date1, currency = "USD") {
  // console.log(date1);
  let dateFixed;
  // console.log(currency);
  // reverse dates to correctly calculate daysPassed
  if (currency === "EUR") {
    // console.log(date1);
    const [day, month, year] = String(date1).split("/");

    // console.log(day, month, year);
    const dateFix = `${month}/${day}/${year}`;
    // console.log(dateFix);
    dateFixed = new Date(dateFix);
  }
  const diffMs = currency === "USD" ? date2 - date1 : date2 - dateFixed;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.abs(diffDays);
}
// console.log(new Date().toDateString());
function formatDatesArrayToDisplay(
  datesArray,
  currency = currentAccount.currency
) {
  const toDisplay = datesArray.map((date) => {
    const daysSince =
      currency === "USD"
        ? Math.floor(daysPassed(new Date(), new Date(date)))
        : Math.floor(daysPassed(new Date(), date, "EUR"));
    // console.log(daysSince);
    if (daysSince === 0) return "Today";
    if (daysSince === 1) return "Yesterday";
    if (daysSince > 1 && daysSince <= 7) return `${daysSince} days ago`;
    // ? maybe this is the problem?
    if (daysSince > 7 && currency !== "USD") {
      const [month, day, year] = date.split("/");
      return `${day}/${month}/${year}`;
    }
    return date;
  });
  return toDisplay;
}

function renderTransactions(account) {
  const currency = account.currency === "$" ? "USD" : "EUR";
  const datesToDisplay = formatDatesArrayToDisplay(
    account.transactionsDates,
    currency
  );

  account.transactions.forEach((mov, i) => {
    const dateToDisplay = datesToDisplay[i];

    const options = {
      style: "currency",
      currency: account.currency === "$" ? "USD" : "EUR",
    };
    // ? create NumFormat function (refactor)
    const formattedMov =
      account.currency === "$"
        ? `${new Intl.NumberFormat("en-US", options).format(mov)}`
        : `${new Intl.NumberFormat("de-DE", options).format(mov)}`;

    const type = mov > 0 ? "deposit" : "withdrawal";

    const html = `
    <div class="transaction ${type}">
      <div class="transaction_type">
        <img
        src="img/${type}.svg"
        viewBox="0 0 256 256"
        class="icon icon_${type} "
        ></img>
      </div>
      <div class="transaction_date">${dateToDisplay}</div>
      <div class="transaction_amount">${formattedMov}</div>
    </div>
      `;

    transactionsDiv.insertAdjacentHTML("afterbegin", html);
  });
}
function createNewAccount(e) {
  e.preventDefault();

  if (inputName.value.split(" ").length < 2 || inputSSN.value.length < 5)
    return alert(
      "Input wrong! Name must be at least two words and SSN at least 5 characters long!"
    );

  // ! pushing into accounts array - unnamed object
  const newAccount = {
    name: inputName.value,
    username: inputName.value.split(" ")[0].toLowerCase(),
    ssn: inputSSN.value,
    password: inputSSN.value.slice(-4),
    currency: selectCurrency.value,
    transactions: generateTransactionsArray(),
    crypto: {
      btc: +btcNewAcc.value,
      eth: +ethNewAcc.value,
      usdc: +usdcNewAcc.value,
    },
  };

  newAccount.transactionsDates = createTransactionDates(newAccount);
  accounts.push(newAccount);
  currentAccount = newAccount;
  // console.log(accounts);
  localStorage.setItem("accounts", JSON.stringify(accounts));

  // ! UI react to creating new account
  prepareAndRenderSpinner(popUpMessage);
  setTimeout(() => {
    removeSpinner(popUpMessage);
    displayMessageText(popUpMessage);
    setTimeout(() => {
      closeOverlay(createAccOverlay, formCreateAcc);
      removeSpinnerOpenContainer(
        popUpMessage,
        financialContainer,
        transactionsDiv,
        newAccount
      );
      calcDisplayBalanceAndDates();
      formCreateAcc.removeEventListener("submit", createNewAccount);
    }, 1000);
  }, 2000);
}
function login(e) {
  e.preventDefault();
  currentAccount = accounts.find(
    (acc) => acc.username === inputUsername.value.trim()
  );

  if (!currentAccount) {
    alert("No account under this username  ):   Please try again ");
    return;
  }
  if (currentAccount.password !== inputPassword.value) {
    alert("Wrong password  ):   Please try again ");
    return;
  }
  console.log(currentAccount);
  prepareAndRenderSpinner(popUpMessage);

  // ! successful login
  setTimeout(() => {
    loggedIn = true;
    closeOverlay(welcomeContainer);
    removeSpinnerOpenContainer(
      popUpMessage,
      financialContainer,
      transactionsDiv,
      currentAccount
    );
    calcDisplayBalanceAndDates();
    calcDisplayCrypto(currentAccount);
    clearInputFields(inputUsername, inputPassword);
  }, 1000);

  formLogin.removeEventListener("submit", login);
}
function displayCurrentDateAndTime(htmlEl) {
  const date = new Date();
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
    hour12: currentAccount.currency === "$" ? true : false,
  };

  // ? create DateTimeFormat function (refactor)
  htmlEl.textContent =
    currentAccount.currency !== "$"
      ? `on ${new Intl.DateTimeFormat("en-US", options).format(date)}`
      : `on ${new Intl.DateTimeFormat("en-EU", options).format(date)}`;
}

function calcDisplayBalanceAndDates() {
  const totalBalance = currentAccount.transactions.reduce(
    (acm, mov) => (acm += mov)
  );
  numberFormatAndDisplayBasedOnCurrency(overallBalanceEl, totalBalance);
  displayCurrentDateAndTime(currentDateTimeOverallEl);

  currentAccount.overallBalance = totalBalance;
}
function transferMoney(e) {
  e.preventDefault();

  const receiverInput = transferTo.value;
  const amountInput = transferAmount.value;
  const receiverAcc = accounts.find((acc) => acc.username === receiverInput);

  clearInputFields(transferTo, transferAmount);
  // ? guard clause (opposite condition)
  if (
    !receiverAcc ||
    amountInput > currentAccount.overallBalance ||
    amountInput <= 0 ||
    receiverAcc === currentAccount
  )
    return alert(
      "Something went wrong, please try again. Hint: receiver must be a Smart Piggy member, while you must have sufficient funds to transfer. Also, you cannot transfer funds to yourself."
    );

  // ? spinner
  prepareAndRenderSpinner(servicesMessageDiv, "services");
  setTimeout(() => {
    clearInputFields(transferAmount, transferTo);
    currentAccount.transactions.push(-amountInput);
    receiverAcc.transactions.push(+amountInput);
    receiverAcc.transactionsDates.push(
      formatDateBasedOnCurrency(receiverAcc, new Date())
    );
    currentAccount.transactionsDates.push(
      formatDateBasedOnCurrency(currentAccount, new Date())
    );
    removeSpinner(servicesDiv);
    toggleDominateClass(servicesMessageDiv);
    renderTransactions(currentAccount);
    calcDisplayBalanceAndDates();
    // console.log(currentAccount);
    // console.log(receiverAcc);
  }, 2000);

  // ! updateUI method to be created

  localStorage.setItem("accounts", JSON.stringify(accounts));

  renderTransactions(currentAccount);
  calcDisplayBalanceAndDates();
  console.log(receiverAcc);
  console.log(currentAccount);
}

function requestLoan(e) {
  e.preventDefault();
  const amount = +loanAmount.value;

  // ? upside-down condition - guard clause
  if (
    isNaN(amount) ||
    amount > 0.5 * currentAccount.overallBalance ||
    amount < 0
  )
    return alert(
      "Something went wrong   ): Maximum loan amount is 50% of your current balance"
    );

  // ? spinner
  prepareAndRenderSpinner(servicesMessageDiv, "services");
  setTimeout(() => {
    clearInputFields(loanAmount);
    currentAccount.transactions.push(amount);
    currentAccount.transactionsDates.push(
      formatDateBasedOnCurrency(currentAccount, new Date())
    );
    removeSpinner(servicesDiv);
    toggleDominateClass(servicesMessageDiv);
    renderTransactions(currentAccount);
    calcDisplayBalanceAndDates();
  }, 2000);

  localStorage.setItem("accounts", JSON.stringify(accounts));
}

//
//
//
//  * EVENTS
//
//
//

// ! TRANSFER AND LOAN
transferForm.addEventListener("submit", transferMoney);
loanForm.addEventListener("submit", requestLoan);

// ! LOGIN
formLogin.addEventListener("submit", login);

// ! CREATING AN ACCOUNT EVENT
formCreateAcc.addEventListener("submit", createNewAccount);

// ! TRADE CRYPTO
formTradeCrypto.addEventListener("submit", tradeCrypto);

// ! hover overlay info and transfer
infoTransfer.addEventListener("mouseenter", function () {
  openOverlay(msgTransfer);
});
infoTransfer.addEventListener("mouseleave", function () {
  closeOverlay(msgTransfer);
});
infoLoan.addEventListener("mouseenter", function () {
  openOverlay(msgLoan);
});
infoLoan.addEventListener("mouseleave", function () {
  closeOverlay(msgLoan);
});

// ! consolidate this into one (event delegation)
btnBanking.addEventListener("click", function () {
  switchTab(transactionsDiv, cryptoDiv, btnBanking, btnCrypto);
});
btnCrypto.addEventListener("click", function () {
  switchTab(cryptoDiv, transactionsDiv, btnCrypto, btnBanking);
});
btnOpenAcc.addEventListener("click", function () {
  openOverlay(createAccOverlay, formCreateAcc);
  inputName.focus();
});
btnSignup.addEventListener("click", function () {
  openOverlay(createAccOverlay, formCreateAcc);
  inputName.focus();
});

// ! CRYPTO CHECKBOX
cryptoCheckbox.addEventListener("change", function () {
  formCol3.classList.toggle("hidden");
  formCol3.classList.toggle("visible");
  btcNewAcc.focus();
});

// ! hover overlay whatWeOffer
whatWeOffer.addEventListener("mouseenter", function () {
  openOverlay(whatWeOfferOverlay);
});
whatWeOffer.addEventListener("mouseleave", function () {
  closeOverlay(whatWeOfferOverlay);
});
btnCloseOverlay.addEventListener("click", function () {
  closeOverlay(createAccOverlay, formCreateAcc);
});
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && createAccOverlay.classList.contains("visible"))
    closeOverlay(createAccOverlay, formCreateAcc);
});
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && loggedIn === true) {
    if (confirm("Are you sure you want to log out?")) {
      reset();
    }
  }
});

function reset() {
  closeOverlay(financialContainer);
  openOverlay(welcomeContainer);
  currentAccount = undefined;
  init();
}

function init() {
  displayWelcomeMessage();
  popUpMessage.classList.add("hidden");
  // popUpMessage.classList.add("dominate");
  accounts = JSON.parse(localStorage.getItem("accounts")) || accounts;

  // // ! fake logged in
  // currentAccount = accounts[0];
  // openOverlay(financialContainer, transactionsDiv);
  // // ! always call renderT and THEN calcDis !!!!
  // renderTransactions(currentAccount);
  // calcDisplayBalanceAndDates(currentAccount);
  // calcDisplayCrypto(currentAccount);

  console.log(accounts);
  console.log(currentAccount);
  console.log("this is the alternative branch!! ");
  console.log("one more alt-branch thing");
  inputUsername.focus();
}

function newStuff() {
  console.log("aaaaaaaaaaa");
}

init();

// localStorage.clear();
