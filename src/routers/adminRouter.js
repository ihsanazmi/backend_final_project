const conn = require('../connection/index')
const router = require('express').Router()

router.get('/admin/allUser', (req,res)=>{
    let sql = `SELECT * FROM users where role = '0'`

    conn.query(sql, (err, result)=>{
        if(err) return res.send(err.message)
        let data = result
        data.map(item=>{
            item.avatar = `http://localhost:2018/avatar/${item.avatar}`
            // console.log(item.avatar)
        })
        // console.log(data)
        res.send(result)
    })
})

module.exports = router