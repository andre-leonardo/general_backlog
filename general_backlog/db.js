const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/backlog')
    .then(() => {
        console.log('Conexao estabelecida')
    }).catch(err => {
        console.log('Erro: ' + err)
    })

module.exports = mongoose