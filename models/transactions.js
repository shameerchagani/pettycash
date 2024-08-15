const mongoose = require('mongoose')
const TransactionsSchema = new mongoose.Schema({
    date: {type: Date, require: true},
    type : {type: String, require: true, trim: true},
    name:{type: String, require: true, trim: true},
    amount:{type: Number, require: true, trim: true},
    comments: {type: String, require: true, trim: true},
    done: {type: String, default: 'n'} ,
    created_date: {type: Date, default: Date.now},
    created_by: {type: String, required: true},
    updated_date: {type: Date,default: Date.now},
    updated_by: {type: String},
})

const Transactions = mongoose.model("Transactions", TransactionsSchema);
module.exports = Transactions