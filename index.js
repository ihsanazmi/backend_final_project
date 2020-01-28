const express = require('express')
const cors = require('cors')

const userRouter = require('./src/routers/userRouter')
const adminRouter = require('./src/routers/adminRouter')
const productRouter = require('./src/routers/productRouter')
const tipeRouter = require('./src/routers/tipeRouter')
const kategoriRouter = require('./src/routers/kategoriRouter')
const cartRouter = require('./src/routers/cartRouter')
const transactionRouter = require('./src/routers/transactionRouter')
const reviewRouter = require('./src/routers/reviewRouter')

const app = express()
const port = process.env.PORT || 2018
// const port = 2018

app.use(cors())
app.use(express.json())
app.use(userRouter)
app.use(adminRouter)
app.use(productRouter)
app.use(tipeRouter)
app.use(kategoriRouter)
app.use(cartRouter)
app.use(transactionRouter)
app.use(reviewRouter)

app.get('/', (req, res) => {
    res.send(`<h1>Running at ${port}</h1>`)
})

app.listen(port, ()=>{
    console.log(`running at port ${port}`)
})