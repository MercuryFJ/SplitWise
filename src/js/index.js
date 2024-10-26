/*---CLASSES---*/
/*USER: This class contains the data of the user and her payments*/
class User {
  name; //User name
  genre; //Genre of the user (male or female)
  icon; //Avatar of the user
  paid = 0; //The amount paid of the user  
  debt = 0; //The money that others users must to pay to the user
  constructor(name, genre, icon) {
    this.name = name;
    this.genre = genre;
    this.icon = icon;
  }
}

/*EXPENSE: This class contains the data about the payment of an user*/
class Expense {
  user; //The user that do the payment
  amount; //Amount of money
  title; //The subject of the payment
  date; //The date on which the payment was made

  constructor(user, amount, title) {
    this.user = user;
    this.amount = amount;
    this.title = title;
    this.date = new Date();
  }
}

/*---CONSTANTS---*/
const monthContainer = document.getElementById("month-container");
const formAddUsers = document.getElementById('myForm');
const formAddPayments = document.getElementById('form-add-payment');
const containerUsers = document.getElementById("container-users");
const balancesContainer = document.getElementById("balances-container");
const selectElement = document.getElementById("selectUser");
const btnSettleUp = document.getElementById("btn-settle-up");

const date = new Date();

const regexAmount = /^\d+(\.\d{1,2})?$/;
const regexText = /^[^\s][a-zA-Z\s]*$/;

/*---CODE---*/
let arrayUsers = [];
let showDate = false;

/*---EVENTS---*/
formAddUsers.addEventListener('submit', function (event) {
  event.preventDefault();
  addUser();
  addUserDOM();
  addUserSelect();
  updateBalances();
  formAddUsers.reset();
});

formAddPayments.addEventListener('submit', function (event) {
  event.preventDefault();
  addPayment();
  formAddPayments.reset();
});

btnSettleUp.addEventListener("click", () => {
  arrayUsers.forEach(user => {
    user.debt = 0;
    user.paid = 0;
  });
  updateBalances();
});

/*---FUNCTIONS---*/
// This function hides all pages and displays the page with the given ID by adding the 'active' class to it.
function displayPage(pageID) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));
  document.getElementById(pageID).classList.add('active');
}

// This function adds a user by retrieving their name, genre, and icon from the form, validating the inputs, and then pushing the new user to the arrayUsers array.
function addUser() {
  let genreChecked = document.querySelector('input[name="genre"]:checked');
  let name = document.getElementById('name').value;
  let iconChecked = document.querySelector('input[name="icon"]:checked');
  let icon;

  if (!regexText.test(name) || genreChecked == null || iconChecked == null) {
    alert("Please fill in all required fields before proceeding.");
    return;
  }

  let genre = genreChecked.value;
  if (iconChecked.checked) {
    let label = document.querySelector(`label[for="${iconChecked.id}"]`);
    let img = label.querySelector('img');
    icon = img.src;
  }

  let user = new User(name, genre, icon);
  arrayUsers.push(user);
  updateBalances(user);
}

// This function updates the DOM to display all users in the container by creating user elements from the arrayUsers and appending them.
function addUserDOM() {
  containerUsers.innerHTML = "";

  arrayUsers.forEach(user => {
    containerUsers.classList.add("container-users");
    
    const userContainer = document.createElement("div");
    userContainer.classList.add("user");
    
    const userImg = document.createElement("img");
    userImg.src = user.icon;

    const nameSpan = document.createElement("span");
    nameSpan.classList.add("user-name");
    nameSpan.textContent = user.name;
    
    userContainer.append(userImg, nameSpan);
    containerUsers.append(userContainer);
  });
}

// This function populates a select dropdown with the names of users from the arrayUsers, setting a default disabled option.
function addUserSelect() {
  selectElement.innerHTML = '<option name="selectUser" disabled selected>select an option</option>';
  let count = 0;
  arrayUsers.forEach(user => {
    const optionElement = document.createElement("option");
    optionElement.setAttribute("name", "selectUser");
    optionElement.textContent = user.name;
    optionElement.value = count;
    count++;
    
    selectElement.append(optionElement);
  });
}

// This function processes a payment by validating input values, creating an Expense object, updating the user's paid amount, and adding the payment to the DOM.
function addPayment() {
  const amountValue = document.getElementById("amount").value;
  const titleValue = document.getElementById("title").value;
  const option = document.getElementById("selectUser").value;

  let user = arrayUsers[option];

  if (!regexAmount.test(amountValue) || !regexText.test(titleValue) || user === undefined) {
    alert("Please fill all fields with valid data before proceeding.");
    return
  }

  if (!showDate) {
    const options = { year: 'numeric', month: 'long' };
    const formatDate = date.toLocaleDateString('en-US', options);
    
    const pElement = document.getElementById("month-year-text"); 
    pElement.textContent = formatDate;
    
    monthContainer.append(pElement);
    showDate = true;
  }

  let expense = new Expense(user, amountValue, titleValue);
  user.paid += parseFloat(amountValue);
  addPaymentToDOM(expense);
}

// This function adds a payment entry to the DOM, creating elements to display the payment details, including date and amount paid.
function addPaymentToDOM(expense) {
  const paymentContainer = document.createElement("div");
  paymentContainer.classList.add("payment-container");

  const spanDateContainer = document.createElement("div");
  spanDateContainer.classList.add("span-date");

  const spanMonth = document.createElement("span");
  spanMonth.textContent = date.toLocaleString('default', { month: 'short' }).toUpperCase();
  
  const spanDay = document.createElement("span");
  spanDay.textContent = date.getDate();
  
  spanDateContainer.append(spanMonth, spanDay);
  
  const imgExpense = document.createElement("img");
  imgExpense.setAttribute("src", "./src/images/valo-coins.png");
  imgExpense.setAttribute("alt", "Valo coins image");
  
  const textPaymentContainer = document.createElement("div");
  textPaymentContainer.classList.add("text-payment-container");
  
  const titleElement = document.createElement("p");
  titleElement.textContent = expense.title;
  
  const paymentElement = document.createElement("p");
  paymentElement.textContent = expense.user.name + " paid " + expense.amount + "€";
  
  textPaymentContainer.append(titleElement, paymentElement);
  paymentContainer.append(spanDateContainer, imgExpense, textPaymentContainer);
  monthContainer.append(paymentContainer);
  
  getDebts();
  updateBalances();
}

// This function calculates the debts of users based on their total paid amounts compared to the average paid amount.
function getDebts() {
  let balance = 0;
  arrayUsers.forEach(user => {
    balance += user.paid;
  });

  arrayUsers.forEach(user => {
    user.debt = user.paid - (balance / arrayUsers.length);
    if (user.debt <= 0) {
      user.debt = 0;
    }
  });
}

// This function updates the displayed balances for each user, creating and appending elements that show their payment and debt status.
function updateBalances() {

  balancesContainer.innerHTML = "";

  arrayUsers.forEach(user => {
    const userContainer = document.createElement("div");
    userContainer.classList.add("user");
    const userImg = document.createElement("img");
    userImg.src = user.icon;

    const paymentsContainer = document.createElement("div");
    paymentsContainer.classList.add("payments");

    const nameSpan = document.createElement("span");
    nameSpan.classList.add("user-name");
    nameSpan.textContent = user.name;

    const paidElement = document.createElement("p");

    let genre = user.genre === "male" ? "He" : "She";
    paidElement.textContent = genre + " has paid " + user.paid + "€";

    const debtElement = document.createElement("p");
    debtElement.textContent = genre + " is owed " + user.debt + "€";

    paymentsContainer.append(nameSpan, paidElement, debtElement);
    userContainer.append(userImg, paymentsContainer);
    balancesContainer.append(userContainer);
  });
}

// ---MUSIC---

const music = document.getElementById('background-music');

function toggleMusic() {
    if (music.paused) {
        music.play(); // Reproduce la música si está en pausa
    } else {
        music.pause(); // Pausa la música si está reproduciendo
    }
}
