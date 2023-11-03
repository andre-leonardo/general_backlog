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
const { name } = require("ejs")
const Backlog = require("./models/backlogs")

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));

app.use(expressSession({
    secret: "segredo",
    resave: false,
    saveUninitialized : false
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
    res.render('home', {isAuthenticated: req.isAuthenticated()})
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

//1d034147e4ee8574f39f3ecd2ecbbafc6c792276

let resposta = {}
app.get('/game', isLoggedIn,(req, res) => {
    let showResult = false;
    let resposta = null;
    res.render('game', {showResult, resposta})
})

app.post('/game', isLoggedIn,(req, res) => {
    let showResult = true;
    let {name}  = req.body
    console.log(name)
    const options = {
        url: 'http://www.giantbomb.com/api/search?api_key=1d034147e4ee8574f39f3ecd2ecbbafc6c792276&format=json&query=' + name + '&resources=game',
        headers: {
          'User-Agent': 'I\'m Doing a college work, it\'s a site of backlogs, where you can make backlogs of various things, and games is one of them, that is why I decided to use this API',
        }
    };
    request(options, (error, response, body) => {
        if(!error && response.statusCode == 200){
            resposta = JSON.parse(body)
        }
        res.render('game', {showResult, resposta})
    })
    
})
app.post('/game/add', isLoggedIn, async(req, res) => {
    const { itemName, itemImage, doNotSave } = req.body
    if(doNotSave == 'false'){
        console.log(itemName)
        console.log(req.body)
        const novoLog = new Backlog({ name: itemName, cover: itemImage })
        try {
            await novoLog.save()
            console.log('Log saved:', novoLog)
        } catch (err) {
            console.error('Erro:', err)
        }
    }
    res.redirect('/game')
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
app.get('/busca', isLoggedIn,(req, res) =>{
    let {nome, doNotSave}  = req.body
    request('http://www.giantbomb.com/api/search?api_key=1d034147e4ee8574f39f3ecd2ecbbafc6c792276&format=json&query='+ name +'&resources=game')
    res.render('busca')
})


app.listen(3000, () => console.log("Servidor na porta 3000"))