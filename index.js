require('dotenv').config()
require('./src/db/connection')

const express = require('express')
const cors = require('cors')
const router = require('./src/routers/router')

const flateServer = express()

flateServer.use(cors())
flateServer.use(express.json())
flateServer.use(router)

const PORT = process.env.PORT || 5000

flateServer.listen(PORT,()=>{
    console.log(`Yshope server running successfully at port number ${PORT}`);
})

flateServer.get('/',(req,res)=>{
    res.send('<h1>Server running successfully and ready to accept clint request</h1>')
})