const mongoose = require('mongoose')
const Schema = mongoose.Schema

const usersSchema = new Schema({
    email: { type: String, required: true, unique: true }, // you can remove unique attribute
    password: { type: String, required: true},
    name: { type: String, required: true},
}, {timestamps: true})

const COLLECTION_NAME = "usernames"
const User = mongoose.model(COLLECTION_NAME, usersSchema) // 'usernames' is collection 
module.exports = User
