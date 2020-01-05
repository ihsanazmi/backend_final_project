const express = require('express')
const cors = require('cors')

const userRouter = require('./routers/userRouter')
const adminRouter = require('./routers/adminRouter')
const productRouter = require('./routers/productRouter')
const tipeRouter = require('./routers/tipeRouter')
const kategoriRouter = require('./routers/kategoriRouter')
const cartRouter = require('./routers/cartRouter')
const transactionRouter = require('./routers/transactionRouter')

const app = express()
const port = 2018

app.use(cors())
app.use(express.json())
app.use(userRouter)
app.use(adminRouter)
app.use(productRouter)
app.use(tipeRouter)
app.use(kategoriRouter)
app.use(cartRouter)
app.use(transactionRouter)

app.listen(port, ()=>{
    console.log(`running at port ${port}`)
})