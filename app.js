const express = require("express")
const request = require('request')
const app = express()
const path = require('path')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.render('home')
})


app.listen(3000, () => console.log("Servidor na porta 3000"))