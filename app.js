const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema
const User = require('./modals/s_user')


// CONNECTIONG MONGOSE
const DATABASE_NAME = "git-login"
const dbURL = 'mongodb+srv://gaurav:gaurav@cluster0.qcdg3t5.mongodb.net/' + DATABASE_NAME
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log("[mongoose] you are connected to server "))
    .catch((err) => console.log("error => " + err))


// EXPRESS
const app = express()
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use("/public", express.static(__dirname + "/public"))


// SCHEMAS
const usersSchema = new Schema({
    serial_num: { type: Number },
    site_url: { type: String, required: true },
    site_url_password: { type: String, required: true }
})


// RENDRING PAGES
app.get('/', (req, res) => {
    res.render('login.ejs')
})

app.get('/singup', (req, res) => {
    res.render('singup.ejs')
})


// SINGUP BACKEND SYSTEM
app.post('/singup', async (req, res) => {
    try {
        const temp_err1 = false
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        // SAFETY
        if (req.body.password.length < 8) {
            res.render('error.ejs', { error_num: "99", error_msg: "Password length must be atleast 8 character long" })
        }
        else {
            // ADDING DATA TO DATABASE
            const user = new User({
                email: req.body.email,
                password: hashedPassword,
                name: req.body.name
            })
            user.save().then((result) => {
                res.redirect('/')
                console.log("singin sucessful by -> " + req.body.name)
            })
                .catch((err) => { if (err.code == 11000) { res.send("email already taken!") } })

        }

        
    }
    catch {
        res.redirect('/singup')
        console.log("singup error occured")
    }
})


// LOGIN BACKEND SYSTEM
app.post('/login', async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const user = await User.findOne({ email }).lean()

        if (!user) { res.render('error.ejs', { error_num: "101", error_msg: "We found no user with  -->   " + req.body.email }) } // res.render('',{error_number, error})
        else {
            try {
                if (await bcrypt.compare(password, user.password)) {

                    // DISPLAYING USER DATA ON WEB-PAGE
                    try {
                        const temp_user = mongoose.model((user.email + "s"), usersSchema)    // 'usernames'   --   user.email
                        temp_user.find({}).then((result) => {
                            res.render('home.ejs', {
                                user_name: user.name,
                                user_email: user.email,
                                user_data: { result }
                            })
                        })
                    }
                    catch {
                        res.render('home.ejs', {
                            user_name: user.name,
                            user_email: user.email,
                            user_data: { "::": "there are no password in your password list" }
                        })
                    }
                }
                else { res.render('error.ejs', { error_num: "102", error_msg: "Pleas check your password and try again !" }) }
            }
            catch { res.render('error.ejs', { error_num: "100", error_msg: "Some backend error occured !" }) }
        }
    }
    catch { res.redirect('/') }
})


// CREATING NEW PASSWORD BACKEND SYSTEM
app.post('/new-password', (req, res) => {

    // SCHEMA
    var COLLECTION_NAME = req.body.s_email + "s"  /// here added "s" for safty
    const temp_user_s = mongoose.model(COLLECTION_NAME, usersSchema)

    // NEW-PASSWORD FUNCTION 
    const temp_user = new temp_user_s({
        site_url: req.body.s_url,
        site_url_password: req.body.s_password
    })
    temp_user.save().then((result) => {
        console.log("password saving sucessful by -> [[]]")
    })
})


// PORT
app.listen(3000)
