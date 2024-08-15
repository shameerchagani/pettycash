const express = require("express");
const { ensureAuthenticated } = require("../config/auth");
const router = express.Router();
const transactionController = require("../controlers/transactionController");
const Transactions = require("../models/transactions");

//login page
router.get("/", (req, res) => {
  res.render("welcome", { title: "Login", appName: "Transactions-app" });
});

//register page
router.get("/register", (req, res) => {
  res.render("register", { title: "Register", appName: "Transactions-app" });
});

//Dashboard and/or All Transactions
router.get("/dashboard", transactionController.dashboard_get)

//Get All The Transactions
router.get("/allTransactions", ensureAuthenticated, transactionController.allTransaction_get)

//Get Income Transactions
router.get("/incomeTransactions", ensureAuthenticated, transactionController.incomeTransaction_get)

//Get Expense Transactions
router.get("/expenseTransactions", ensureAuthenticated, transactionController.expenseTransaction_get)

//Get Investment Transactions
router.get("/investmentTransactions", ensureAuthenticated, transactionController.investmentTransaction_get)


//Post Transaction
router.post("/addTransaction", ensureAuthenticated, transactionController.transaction_handler);

//Delete Transaction Route
router.get(
  "/deleteTransaction/:id",
  ensureAuthenticated,
  transactionController.transaction_delete
);

//Done Transaction Route
router.get("/transactionDone/:id",
ensureAuthenticated,
transactionController.transaction_done
);

//Not Done Transaction Route
router.get("/transactionNotDone/:id",
ensureAuthenticated,
transactionController.transaction_notDone
);

//Done All Transaction Route.
router.get("/allTransactionDone", ensureAuthenticated, transactionController.transaction_allDone);



//Update Item Get View
router.get("/updateTransaction/:id", ensureAuthenticated, (req, res) => {
  Transactions.findById({ _id: req.params.id }).then((result) => {
    //console.log(`This is get Result: ${result}`);
    res.render("updateTransaction", {
      user: req.user,
      title: "Update Transaction",
      transaction: result,
    });
  });
});

//update item post
router.post(
  "/updateTransaction/:id",
  ensureAuthenticated,
  transactionController.transaction_update
);

module.exports = router;
