const express = require("express")
const request = require('request')
const methodOverride = require('method-override')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const passport = require('passport')
const localPassport = require('passport-local')
const expressSession = require('express-session')
require('dotenv').config()
const User = require('./models/user')
const Forum = require('./models/forum')

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

let pass = 0;
const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        pass = 0
        return next()
    }
     pass++
    res.redirect('/')
} 

app.get('/', (req, res) => {
    const user = req.user
    if(req.isAuthenticated()) pass = 0
    res.render('home', {pass, user, isAuthenticated: req.isAuthenticated()})
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
    let showResult = false;
    let resposta = null;
    res.render('game', {showResult, resposta, user})
})

app.post('/game', isLoggedIn, async(req, res) => {
    const game_api = process.env.API_GAMES
    let showResult = true;
    let {name}  = req.body
    const user = req.user
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


//add method for movies and games
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


//details for any backlogs item, not only games, the idc param is only used in custom logs
app.get('/gamedetail/:idu/:idl/:idc', isLoggedIn, async(req, res) => {
    const {idl, idu, idc} = req.params
    let check = 0
    const user = await User.findById(idu)
    const customlog = await user.customlogs.find(customlog => customlog._id.toString() === idc)
    const backlog = await user.backlogs.find(backlog => backlog._id.toString() === idl)
    res.render('gamedetail', {check, user, backlog, user, customlog})
})


app.delete('/delete/:idu/:idl/:idc',isLoggedIn, async (req, res) => {
    const {idu, idl, idc} = req.params
    const type = req.body
    try{
        await User.updateOne(
            { _id: idu },
            {
                $pull: {
                    backlogs: { _id: idl }
                }
            }
        )
    }catch (err) {
        console.error('Erro:', err)
    }
    if(type.type === "game")
        res.redirect('/game')
    else if(type.type === "movie")
        res.redirect('/movie')
    else res.redirect('/custom/' + idu + '/' + idc)
})

app.patch('/update/:idu/:idl/:idc', isLoggedIn, async (req, res) => {
    const {idu, idl, idc} = req.params
    const user = await User.findById(idu)
    const backlog = user.backlogs.find(backlog => backlog._id.toString() === idl)
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
        )
    }catch (err) {
        console.error('Erro:', err)
    }
    if(backlog.type == "game" || backlog.type == "movie")
    res.redirect('/gamedetail/' + idu + '/' + idl +  '/0')
    else{
        res.redirect('/gamedetail/' + idu + '/' + idl + '/' + idc)
    }
})


//dealing with custom backlogs
app.get('/custom', isLoggedIn, async(req, res) => {
    const user = req.user
    let showResult = false;
    res.render('custom', {showResult, user})
})

app.post('/custom/add', isLoggedIn, async(req, res) => {
    try {
    const { itemName } = req.body
    const user = req.user
    const novoLog = await User.findOneAndUpdate(
        {_id: user.id, 'customlogs.name': {$ne: itemName}}, 
        {$addToSet: {customlogs: {name: itemName}}},
        {new: true}
    )
    if(novoLog){
        res.redirect('/custom')
    }else {
        res.send('Item already exists')
    }
    } catch (err) {
        console.error('Erro:', err)
    }
    
})

app.get('/custom/:idu/:idl', isLoggedIn, async(req, res) => {
    const {idu, idl} = req.params
    const user = await User.findById(idu)
    const customlog = await user.customlogs.find(customlog => customlog._id.toString() === idl)
    res.render('customTrue', {user, customlog})
})

app.post('/customTrue/add/:idu/:idl', isLoggedIn, async(req, res) => {
    try {
    const { itemName, itemCover, itemReleased, itemType } = req.body
    const {idu, idl} = req.params
    const backlogs = {
        name: itemName, 
        cover: itemCover, 
        released: itemReleased,
        finishStatus: 1,
        type: itemType
    }
    const user = req.user
    await User.findOneAndUpdate(
        {_id: user.id}, 
        {$addToSet: {backlogs: backlogs} }
    )
    res.redirect('/custom/' + idu + '/' + idl)
    } catch (err) {
        console.error('Erro:', err)
    }
})

app.patch('/updateCustom/:idu/:idl', isLoggedIn, async (req, res) => {
    const {idu, idl} = req.params
    const {itemName} = req.body
    try{
        await User.updateOne(
            { _id: idu, 'customlogs._id': idl },
            {
                $set: {
                    'customlogs.$.name': itemName,
                },
            }
        )
    }catch (err) {
        console.error('Erro:', err)
    }
        res.redirect('/custom/' + idu + '/' + idl)
})

app.delete('/deleteCustomlog/:idu/:idl', isLoggedIn, async (req, res) => {
    const { idu, idl } = req.params;
    const {type} = req.body
    try {
        await User.updateOne(
            { _id: idu },
            {
                $pull: {
                    customlogs: { _id: idl }
                }
            }
        )
        await User.updateOne(
            { _id: idu },
            {
                $pull: {
                    'backlogs': { type: type }
                }
            }
        )
    } catch (err) {
        console.error('Error:', err);
    }

    res.redirect('/');
});



////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
/////////////////////////////////FORUM//////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////




app.get('/forum/:type', isLoggedIn, async (req, res) => {
    const {type} = req.params
    const user = req.user
    let forum = await Forum.findOne()
    if(!forum){
        try{
            forum = new Forum()
            await forum.save()
        }catch (err) {
            console.error('Erro:', err)
        }
    }
    if(!forum.discussion){

    }
    const discussion = await forum.discussion.find(discussion => discussion.discussionType === type)
    res.render('forum', {type, forum, discussion, user})       
})




///////CREATE A DISCUSSION

app.post('/forum/add/:id', isLoggedIn, async (req, res) => {
    const {type, itemName, itemText, itemCover} = req.body
    const {id} = req.params
    const user = req.user
    const discuss = {
        name: itemName,
        text: itemText,
        img: itemCover,
        discussionType: type,
        user: {
            id: user.id,
            username: user.username
        }
    }
    try{
        await Forum.findOneAndUpdate(
            {_id: id}, 
            {$addToSet: {discussion: discuss} }
        )
        res.redirect('/forum/' + type)
    }catch(err) {
        console.error('Erro:', err)
    }
})

app.patch('/updateForumDiscussion/:idf/:id', isLoggedIn, async (req, res) => {
    const {type, itemName, itemText, itemCover} = req.body
    const {idf, id} = req.params
    try{
        await Forum.findOneAndUpdate(
            { _id: idf, 'discussion._id': id },
            {
                $set: {
                    'discussion.$.name': itemName,
                    'discussion.$.img': itemCover,
                    'discussion.$.text': itemText,
                },
            }
        )
        res.redirect('/forum/' + type)
    }catch(err) {
        console.error('Erro:', err)
    }
})

app.delete('/deleteForumDiscussion/:type/:idf/:id', isLoggedIn, async (req, res) => {
    const {idf, id, type} = req.params
    try{
        await Forum.findOneAndUpdate(
            { _id: idf },
            {
                $pull: {
                    discussion: { _id: id }
                }
            }
        )
        res.redirect('/forum/' + type)
    } catch(err) {
        console.log(err)
    }
})



///////CREATE AN ANSWER TO THE DISCUSSION

app.post('/forumAnswer/add/:idf/:id', isLoggedIn, async (req, res) => {
    const {type, itemText, itemCover} = req.body
    const {idf, id} = req.params
    const user = req.user
    const  answer =  
        {
            text: itemText,
            img: itemCover,
            user: {
                id: user.id,
                username: user.username
            }
        }

    try{
        await Forum.findOneAndUpdate(
            { _id: idf, 'discussion._id': id },
            {
                $push: {
                    'discussion.$.answer': answer
                },
            }
        )
        res.redirect('/forum/' + type)
    }catch(err) {
        console.error('Erro:', err)
    }
})

app.patch('/updateForumAnswer/:idf/:idd/:ida/:userid/:username', isLoggedIn, async (req, res) => {
    const { type, itemText, itemCover } = req.body;
    const { idf, idd, ida, userid, username } = req.params;

    const answer = {
        'discussion.$[outer].answer.$[inner].text': itemText,
        'discussion.$[outer].answer.$[inner].img': itemCover,
    };


    const arrayFilters = [
        { 'outer._id': idd },
        { 'inner._id': ida },
    ];

    try {
        await Forum.findOneAndUpdate(
            {_id: idf, 'discussion._id': idd}, 
            { $set: answer }, 
            { arrayFilters }
        );
        res.redirect('/forum/' + type);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error')
    }
});
app.delete('/deleteForumAnswer/:type/:idf/:idd/:ida', isLoggedIn, async (req, res) => {
    const {idf, idd, ida, type} = req.params
    try{
        await Forum.findOneAndUpdate(
            { _id: idf, 'discussion._id': idd },
            {
                $pull: {
                    'discussion.$.answer': { _id: ida }
                }
            }
        )
        res.redirect('/forum/' + type)
    } catch(err) {
        console.log(err)
    }
})






app.listen(3000, () => console.log("Servidor na porta 3000"))