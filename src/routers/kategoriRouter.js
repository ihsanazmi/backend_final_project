const conn = require('../connection/index')
const router = require('express').Router()

// GET ALL CATEGORY PRODUCT
router.get('/products/getkategori', (req, res)=>{
    let sql = 
    `select 
        c.id,
        c.category,
        t.type
    from t_category_products c
    join t_type_products t
    on c.type_id = t.id
    where c.deleted = '0'`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// GET KATEGORI BY ID
router.get('/products/getKategoriId/:id_kategori', (req, res)=>{
    let sql = `SELECT * FROM t_category_products WHERE id = ${req.params.id_kategori}`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error:err.message})

        res.send(result)
    })

})

// GET KATEGORI FOR UI HOME
router.get('/products/homekategori', (req,res)=>{
    let sql = 
    `select 
        c.id,
        c.category,
        t.type_image
    from t_category_products c
    Join t_type_products t
        on t.id = c.type_id
    where c.deleted = 0`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        let data = result
        data.map(tipe=>{
            // produk.image_name = `${uploadDirectory}${avatarName}`
            tipe.type_image = `https://backend-komputer-shop.herokuapp.com/product/getImageTipe/${tipe.type_image}`
            // console.log(produk.gambar)
        })
        res.send(data)
    })
})


// INPUT KATEGORI
router.post('/products/inputkategori', (req, res)=>{
    let sql = `INSERT INTO t_category_products SET ?`
    let sql2 = `SELECT * FROM t_category_products`
    let data = req.body

    conn.query(sql, data, (err, result)=>{
        if(err) return res.send({error: err.message})
        conn.query(sql2, (err, result)=>{
            if(err) return res.send({error: err.message})
            res.send(result)
        })
    })
})

// UPDATE CATEGORY
router.patch(`/products/updateKategori/:id_kategori`, (req, res)=>{
    let sql = `UPDATE t_category_products SET ? WHERE id = ${req.params.id_kategori}`
    let data = req.body

    conn.query(sql, data, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// INSERT CATEGORY
router.post(`/products/saveKategori`, (req, res)=>{
    let sql = `INSERT INTO t_category_products SET ?`
    let data = req.body

    conn.query(sql, data, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// DELETE KATEGORI
router.patch(`/products/deleteKategori/:id_kategori`, (req, res)=>{
    let sql = `UPDATE t_category_products SET deleted = '1' WHERE id= ${req.params.id_kategori}`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})

        res.send(result)
    })

})

module.exports = router