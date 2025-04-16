const mangoose = require('mongoose')

const flateSchema = new mangoose.Schema({
    flateName: {
        type: String,
        require: true
    },
    place: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true
    },
})

const flats = mangoose.model('flats', flateSchema)

module.exports = flats