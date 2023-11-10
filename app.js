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
    const user = req.user
    
    res.render('home', {user, isAuthenticated: req.isAuthenticated()})
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
        res.render('game', {showResult, resposta, user})
    })
    
})
app.post('/game/add', isLoggedIn, async(req, res) => {
    const { itemName, itemCover, itemReleased, doNotSave, itemType } = req.body
    const posterUrl = 'https://image.tmdb.org/t/p/original/' + itemCover
    const backlogs = {
        name: itemName, 
        cover: itemCover, 
        released: itemReleased,
        finishStatus: 1,
        type: itemType
    }
    const user = req.user
    
    if(doNotSave == 'false'){
        if(itemType === "movie"){
            const backlogs = {
                name: itemName, 
                cover: posterUrl, 
                released: itemReleased, 
                finishStatus: 1,
                type: itemType
            }
            const novoLog = await User.findOneAndUpdate(
                {_id: user.id}, {$addToSet: {backlogs: backlogs} })
            try {
                await novoLog.save()
            } catch (err) {
                console.error('Erro:', err)
            }
        }else{
            const novoLog = await User.findOneAndUpdate(
                {_id: user.id}, {$addToSet: {backlogs: backlogs} })
            try {
                await novoLog.save()
            } catch (err) {
                console.error('Erro:', err)
            }
        }
            
      
    }
    if(itemType === "game")
        res.redirect('/game')
    if(itemType === "movie")
        res.redirect('/movie')
})

app.get('/gamedetail/:idu/:idl', isLoggedIn, async(req, res) => {
    const {idl, idu} = req.params
    let check = 0
    const user = await User.findById(idu)
    const backlog = user.backlogs.find(backlog => backlog._id.toString() === idl);
    res.render('gamedetail', {check, user, backlog, user})
})

app.delete('/delete/:idu/:idl',isLoggedIn, async (req, res) => {
    const {idu, idl} = req.params
    const type = req.body
    try{
        await User.updateOne(
            { _id: idu },
            {
                $pull: {
                    backlogs: { _id: idl }
                }
            }
        );
    }catch (err) {
        console.error('Erro:', err)
    }
    if(type.type === "game")
        res.redirect('/game')
    if(type.type === "movie")
        res.redirect('/movie')
})

app.patch('/update/:idu/:idl', isLoggedIn, async (req, res) => {
    const {idu, idl} = req.params
    const {itemName, itemCover, itemReleased, itemDescription, score, finishStatus} = req.body
    try{
        await User.updateOne(
            { _id: idu, 'backlogs._id': idl },
            {
                $set: {
                    'backlogs.$.name': itemName,
                    'backlogs.$.cover': itemCover,
                    'backlogs.$.released': itemReleased,
                    'backlogs.$.description': itemDescription,
                    'backlogs.$.score': score,
                    'backlogs.$.finishStatus': finishStatus,
                },
            }
        );
    }catch (err) {
        console.error('Erro:', err)
    }
    
    res.redirect('/gamedetail/' + idu + '/' + idl)
})

app.get('/movie', isLoggedIn, async(req, res) => {
    const user = req.user
    let showResult = false;
    let resposta = null;
    res.render('movie', {showResult, resposta, user})
})

app.post('/movie', isLoggedIn, async(req, res) => {
    const movie_api = process.env.API_MOVIES
    const movie_bearer = process.env.MOVIES_BEARER
    let showResult = true;
    let {name}  = req.body
    const user = req.user
    const options = {
        url: 'https://api.themoviedb.org/3/search/movie?query=' + name +'&api_key=' + movie_api,
        header: 'Authorization: Bearer ' + movie_bearer,
        header: 'accept: application/json'
    };
    request(options, (error, response, body) => {
        if(!error && response.statusCode == 200){
            resposta = JSON.parse(body)
        }
        res.render('movie', {showResult, resposta, user})
    })
})

app.get('/custom', isLoggedIn, async(req, res) => {
    const user = req.user
    let showResult = false;
    res.render('custom', {showResult, user})
})

app.post('/custom/add', isLoggedIn, async(req, res) => {
    const { itemName } = req.body
    const customlogs = {
        name: itemName, 
    }
    const user = req.user
    const novoLog = await User.findOneAndUpdate(
        {_id: user.id}, {$addToSet: {customlogs: customlogs} })
    try {
        await novoLog.save()
    } catch (err) {
        console.error('Erro:', err)
    }
    res.redirect('/custom')
})

app.get('/custom/:idu/:idl', isLoggedIn, async(req, res) => {
    const {idu, idl} = req.params
    const user = await User.findById(idu)
    const customlog = user.customlogs.find(customlog => customlog._id.toString() === idl);
    res.render('customTrue', {user, customlog})
})


app.listen(3000, () => console.log("Servidor na porta 3000"))