const conn = require('../connection/index')
const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const {invoice} = require('../email/nodemailer')
const uploadDirectory = path.join(__dirname, '/../../public/uploads/products/')
const fs = require('fs')


// CEK CART
router.get(`/cart/get/:product_id/:customer_id`, (req, res)=>{
    // let {product_id, customer_id} = req.body
    // console.log(req.body)
    let sql = `SELECT * FROM t_carts WHERE product_id = ${req.params.product_id} AND customer_id = ${req.params.customer_id} `

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// GET QTY CART
router.get(`/cart/getQty/:id_cart`, (req, res)=>{
    let sql = `select c.qty, p.stock from t_carts c
    join t_products p
    on p.id = c.product_id where c.id= ${req.params.id_cart}`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// GET CART BY USER ID
router.get(`/cart/getAll/:customer_id`, (req, res)=>{
    let sql = 
    `select
        c.id,
        p.product,
        c.qty,
        c.price,
        p.stock,
        p.image_product
    from t_carts c
    join t_products p
        on c.product_id = p.id
    where customer_id = ${req.params.customer_id}`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        let data = result
        data.map(produk=>{
            // produk.image_name = `${uploadDirectory}${avatarName}`
            produk.image_product = `http://localhost:2018/product/getImage/${produk.image_product}`
            // console.log(produk.gambar)
        })
        res.send(result)
    })
})

// ADD TO CART
router.post(`/cart/post`, (req, res)=>{
    let sql = `INSERT INTO t_carts SET ?`
    let data = req.body
    // console.log(data)
    conn.query(sql, data, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// UPDATE CART QTY
router.patch(`/cart/update/:id_cart`, (req, res)=>{
    let sql = `UPDATE t_carts SET ? WHERE id = ${req.params.id_cart}`
    let data = req.body

    conn.query(sql, data, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// DELETE CART
router.delete(`/cart/delete/:id_cart`, (req, res)=>{
    let sql = `DELETE FROM t_carts where id = '${req.params.id_cart}'`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

router.post(`/cart/checkout`, (req, res)=>{
    let sql = `INSERT INTO t_transaction SET ?`
    
    let data = req.body

    conn.beginTransaction((err)=>{
        if(err) {throw err}
        
        conn.query(sql, data, (err, result)=>{
            if(err){conn.rollback(()=>{throw err})}
            
            let sql2 = `SELECT * FROM t_carts WHERE customer_id = ${req.body.customer_id}`
            conn.query(sql2, (err, result)=>{
                if(err) {conn.rollback(()=>{throw err})}

                let data_keranjang = result
                data_keranjang.map((val)=>{
                    val.transaction_id = req.body.transaction_id
                })

                let sql3 = `INSERT INTO t_transaction_detail (transaction_id, customer_id, product_id, qty, price, created_at) VALUES ?`
                let data3 = data_keranjang.map((val)=>{
                    return ([`${val.transaction_id}`, val.customer_id, val.product_id, val.qty, val.price, val.created_at])
                })

                conn.query(sql3, [data3], (err, result)=>{
                    if(err) {conn.rollback(()=>{throw err})}

                    let sql4 = `DELETE FROM t_carts where customer_id = ${req.body.customer_id}`
                    conn.query(sql4, (err, result)=>{
                        if(err) {conn.rollback(()=>{ throw err})}

                        let sql5 = 
                            `select 
                                u.email,
                                t.grand_total,
                                t.no_invoice,
                                p.product,
                                td.qty,
                                td.price,
                                t.created_at
                                
                            from t_transaction t
                            join t_transaction_detail td
                            on t.transaction_id = td.transaction_id
                            join t_products p
                            on p.id = td.product_id
                            join users u
                            on t.customer_id = u.id
                            where t.transaction_id = '${req.body.transaction_id}'`
                        conn.query(sql5, (err, result)=>{
                            if(err) {conn.rollback(()=>{ throw err})}

                            conn.commit((err)=>{
                                if(err){conn.rollback((err)=>{throw err})}
                            })
                            invoice(result)
                            res.send(result)
                        })
                        
                    })
                })

            })
        })
    })
})

module.exports = router