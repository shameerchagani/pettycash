const Transaction = require("../models/transactions");
const passport = require("passport");
const moment = require("moment")
const bcrypt = require("bcrypt");
const { forwardAuthenticated } = require("../config/auth");
const { ensureAuthenticated } = require("../config/auth");

//Post Transaction and Validation Handlers
const transaction_handler = async(req,res) =>{
    const {
        date,
        type,
        name,
        amount,
        comments,
        done
    } = req.body;
    let errors = [];
    if(!date || !type || !name || !amount || !comments || 
        date === "" || type === "" || name === "" || amount === "" ||comments === ""){
        errors.push({msg: "All Fields are Mandatory!"});
    }

//Backdated entry Validation For Non-admin users    
    if (req.user.role !== 'admin') {
      const date = req.body.date;
      const currentDate =moment()
      const backDate = moment().subtract(4,'day')
      if(moment(date).isBefore(backDate)){
        errors.push({ msg: "Date cannot be Older than 3 days!"});
      }else if(moment(date).isAfter(currentDate)){
        errors.push({ msg: "Date cannot be a Future Date!"});
      }
    }

    if(comments.length < 3){
        errors.push({msg: "Comments must be at least 5 letters"})
    }
    if(errors.length > 0){
        res.render("dashboard" , {
            errors,
            date,
            type,
            name,
            amount,
            comments,
            user : req.user,
        })
    } else {
            const addTransaction = await new Transaction({
                date,
                type,
                name,
                amount,
                comments,
                done,
                created_by: req.user.name,
            })
            addTransaction
            .save()
            .then((value)=>{
                //console.log(value)
                req.flash("success_msg", "Transaction Added Successfully")
                res.redirect("/dashboard")
            }).catch(error => console.log(error))
    }
}

//Get All The Transactions
const allTransaction_get = async(req,res) => {
    const transactions = await Transaction.find({}).sort({date: -1, name:1})
    res.render("allTransactions", {title: "All Transactions", appName: "Transactions-app", transactions, user: req.user })
}

//Get the Dash Board
const dashboard_get = async(req,res) =>{

//Get Total of Income
    const incomeTotal = await Transaction.aggregate([
    {
      $match: { type: "income" }
    },
    {
      $group: {
        _id: null,
        totalIncome: { $sum: "$amount" }
      }
    }
  ])

  //Get Total Expenses
  const expenseTotal = await Transaction.aggregate([
    {
      $match: { type: "expense" }
    },
    {
      $group: {
        _id: null,
        totalExpense: { $sum: "$amount" }
      }
    }
  ])
  // console.log(expenseTotal)

//derive balance
    const balance = Number(incomeTotal[0].totalIncome) - Number(expenseTotal[0].totalExpense)

//Data Table
    const transactions = await Transaction.find({}).sort({date: -1, name: 1}).limit(20)
        res.render("dashboard", {title: "Dashboard", appName: "Transactions-app", incomeTotal, balance, expenseTotal, transactions, user: req.user })
}

//Get All Income Transactions
const incomeTransaction_get = async(req,res) =>{
    const transactions = await Transaction.find({type: "income"}).sort({date: -1, name: 1})
    res.render("incomeTransactions", {title: "Income Transactions", appName: "Transactions-app", transactions, user: req.user })
}

//Get All Expense Transactions
const expenseTransaction_get = async(req,res) =>{
    const transactions = await Transaction.find({type: "expense"}).sort({date: -1, name: 1})
    res.render("expenseTransactions", {title: "Expense Transactions", appName: "Transactions-app", transactions, user: req.user })
}

//Get All Investment Transactions
const investmentTransaction_get = async(req,res) =>{
    const transactions = await Transaction.find({type: "investment"}).sort({date: -1, name: 1})
    res.render("investmentTransactions", {title: "Investment Transactions", appName: "Transactions-app", transactions, user: req.user })
}

//Get All completed Transactions
const completedTransaction_get = async(req,res) =>{
  const transactions = await Transaction.find({done: 'y'}).sort({date: -1})
  res.render("completedTransactions", {title: "Completed Transactions", appName: "Transactions-app", transactions, user: req.user})
}

//Get All Pending Transactions
const pendingTransaction_get = async(req,res) =>{
  const transactions = await Transaction.find({done: 'n'}).sort({date: -1})
  res.render("pendingTransactions", {title: "Pending Transactions", appName: "Transactions-app", transactions, user: req.user})
}

//Update The Transaction:
const transaction_update = async (req, res) => {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, updated_by: req.user.name, updated_date: Date.now() },
      (err, transaction) => {
        if (err) return next(err);
        req.flash("success_msg", "Transaction Updated Successfully");
        res.redirect("/dashboard");
      }
    );
  };

//Transaction Done y Controller
const transaction_done = async (req, res, next) => {
  if (req.user.role === "admin") {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {$set: {done: 'y'}, updated_By: req.user.name, updated_date: Date.now() },
      (err, transaction) => {
        if (err) return next(err);
        req.flash("success_msg", "Transaction Marked Done Successfully");
        //res.redirect("/pendingTransactions");
	res.send("Done Successfully");
      }
    )
  } else {
  req.flash("error_msg", "You are not authorized to perform this Transaction.");
  //res.redirect("/dashboard");
    res.send("Error in marking as done");
  }
  };

//Transaction Done n Controller
const transaction_notDone = async (req, res, next) => {
  if (req.user.role === "admin") {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {$set: {done: 'n'}, updated_By: req.user.name, updated_date: Date.now() },
      (err, transaction) => {
        if (err) return next(err);
        req.flash("success_msg", "Transaction Marked Done Successfully");
        res.redirect("/pendingTransactions");
      }
    )
  } else {
  req.flash("error_msg", "You are not authorized to perform this Transaction.");
  res.redirect("/pendingTransactions");
  }
  };

  //Mark All as done
  const transaction_allDone = async (req, res, next) => {
    if (req.user.role === "admin") {
      try {
        await Transaction.updateMany({}, { $set: { done: 'y' } });
  
        req.flash("success_msg", "All transactions marked as not done successfully");
        res.redirect("/allTransactions");
      } catch (err) {
        next(err);
      }
    } else {
      req.flash("error_msg", "You are not authorized to update all transactions");
      res.redirect("/dashboard");
    }
  };

//Transaction Delete Controller
const transaction_delete = async (req, res) => {
    if (req.user.role === "admin") {
      const transaction = await Transaction.findByIdAndDelete(req.params.id, (err, transaction) => {
        if (err) return next(err);
        req.flash("success_msg", "Transaction Deleted successfully");
        res.redirect("/dashboard");
      });
    } else {
      req.flash("error_msg", "You are not authorized to delete entry");
      res.redirect("/dashboard");
    }
  };
  



module.exports = {
    transaction_handler,
    allTransaction_get,
    incomeTransaction_get,
    expenseTransaction_get,
    investmentTransaction_get,
    dashboard_get,
    transaction_update,
    transaction_delete,
    transaction_done,
    transaction_notDone,
    transaction_allDone,
    pendingTransaction_get,
    completedTransaction_get
}