const conn = require('../connection/index')
const router = require('express').Router()

router.get(`/review/:id_transaction/:product_id`, (req, res)=>{
    let sql = `select * from t_review where transaction_id = '${req.params.id_transaction}' and product_id = '${req.params.product_id}'`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error:err.message})
        res.send(result)
    })
})

module.exports = router