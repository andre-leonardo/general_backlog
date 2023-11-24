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
const Customlog = require("./models/customIndetifier")
require('dotenv').config()

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



let resposta = {}
app.get('/game', isLoggedIn, async(req, res) => {
    const user = req.user
    const backlogs = await Backlog.find({})
    let showResult = false;
    let resposta = null;
    res.render('game', {showResult, resposta, user, backlogs})
})

app.post('/game', isLoggedIn, async(req, res) => {
    const game_api = process.env.API_GAMES
    let showResult = true;
    let {name}  = req.body
    const user = req.user
    const backlogs = await Backlog.find({})
    //console.log(name)
    const options = {
        url: 'http://www.giantbomb.com/api/search?api_key='+ game_api +'&format=json&query=' + name + '&resources=game',
        headers: {
          'User-Agent': 'I\'m Doing a college work, it\'s a site of backlogs, where you can make backlogs of various things, and games is one of them, that is why I decided to use this API',
        }
    };
    request(options, (error, response, body) => {
        if(!error && response.statusCode == 200){
            resposta = JSON.parse(body)
        }
        res.render('game', {showResult, resposta, backlogs, user})
    })
    
})
app.post('/game/add', isLoggedIn, async(req, res) => {
    const { itemName, itemImage, itemRelease, doNotSave, itemType } = req.body
    const type = itemType
    const user = req.user
    const posterUrl = 'https://image.tmdb.org/t/p/original/' + itemImage
    if(doNotSave == 'false'){
        if(itemType === "movie"){
            const novoLog = new Backlog({ name: itemName, cover: posterUrl, 
                finishStatus: 1,type: type, released: itemRelease, user: user._id})
            try {
                await novoLog.save()
            } catch (err) {
                console.error('Erro:', err)
            }
        }else{
            const novoLog = new Backlog({ name: itemName, cover: itemImage, 
                finishStatus: 1,type: type, released: itemRelease, user: user._id})
            try {
                await novoLog.save()
            } catch (err) {
                console.error('Erro:', err)
            }
        }
            
      
    }
    if(type === "game")
        res.redirect('/game')
    if(type === "movie")
        res.redirect('/movie')
})

app.get('/gamedetail/:id', isLoggedIn, async(req, res) => {
    const id = req.params.id
    let check = 0
    var show = function() {
        check++
        console.log(check)
    }
    const backlog = await Backlog.findById(id)
    res.render('gamedetail', {backlog, check, show})
})

app.delete('/delete/:id', async (req, res) => {
    const id = req.params.id
    const backlog = await Backlog.findById(id)
    await Backlog.findByIdAndDelete(id)
    if(backlog.type === "game")
        res.redirect('/game')
    if(backlog.type === "movie")
        res.redirect('/movie')
})

app.patch('/update/:id', async (req, res) => {
    const id = req.params.id
    try{
        await Backlog.findByIdAndUpdate(id, req.body, {runValidators: true})
    }catch (err) {
        console.error('Erro:', err)
    }
    
    res.redirect('/gamedetail/' + id)
})

app.get('/movie', isLoggedIn, async(req, res) => {
    const user = req.user
    const backlogs = await Backlog.find({})
    let showResult = false;
    let resposta = null;
    res.render('movie', {showResult, resposta, user, backlogs})
})

app.post('/movie', isLoggedIn, async(req, res) => {
    const movie_api = process.env.API_MOVIES
    const movie_bearer = process.env.MOVIES_BEARER
    let showResult = true;
    let {name}  = req.body
    const user = req.user
    const backlogs = await Backlog.find({})
    const options = {
        url: 'https://api.themoviedb.org/3/search/movie?query=' + name +'&api_key=' + movie_api,
        header: 'Authorization: Bearer ' + movie_bearer,
        header: 'accept: application/json'
    };
    request(options, (error, response, body) => {
        if(!error && response.statusCode == 200){
            resposta = JSON.parse(body)
        }
        res.render('movie', {showResult, resposta, backlogs, user})
    })
})

app.get('/custom', isLoggedIn, async(req, res) => {
    const user = req.user
    const customlogs = await Customlog.find({})
    let showResult = false;
    let resposta = null;
    res.render('custom', {showResult, user, customlogs})
})

app.post('/custom/add', isLoggedIn, async(req, res) => {
    const { itemName } = req.body
    const user = req.user
    const novoLog = new Customlog({ name: itemName, user: user._id})
    try {
        await novoLog.save()
    } catch (err) {
        console.error('Erro:', err)
    }
    res.redirect('/custom')
})

app.get('/custom/:id', isLoggedIn, async(req, res) => {
    const user = req.user.id
    const id = req.params
    const customlogs = await Customlog.findById(id)
    res.render('customTrue', {user, customlogs})
})


app.listen(3000, () => console.log("Servidor na porta 3000"))