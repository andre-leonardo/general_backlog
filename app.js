const express = require("express")
const request = require('request')
const methodOverride = require('method-override')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const passport = require('passport')
const localPassport = require('passport-local')
const expressSession = require('express-session')
const User = require('./models/user')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));

app.use(expressSession({
    secret: "segredo",
    resave: false,
    saveUninitiaded: false
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use(new localPassport(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use(methodOverride('_method'))

const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
} 

app.get('/', (req, res) => {
    res.render('home')
})


app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', (req, res) => {
    User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
        if (err){
            console.log(err)
            res.redirect('register')
        } else{
            passport.authenticate('local')(req,res, () => {
                res.redirect('/')
            })
        }
    
    })
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', passport.authenticate('local', { 
    failureRedirect: '/login', failureMessage: true }), function(req, res) {
        res.redirect('/')
})


app.get("/logout", (req, res) => {
    req.logout(() => {})
    res.redirect('/')
})


app.get('/game', isLoggedIn,(req, res) => {
    res.render('game')
})
app.get('/book', isLoggedIn,(req, res) => {
    res.render('book')
})
app.get('/movie', isLoggedIn,(req, res) => {
    res.render('movie')
})
app.get('/custom', isLoggedIn,(req, res) => {
    res.render('custom')
})


app.listen(3000, () => console.log("Servidor na porta 3000"))