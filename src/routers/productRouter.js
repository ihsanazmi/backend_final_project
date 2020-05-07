const conn = require('../connection/index')
const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const uploadDirectory = path.join(__dirname, '/../../public/uploads/products/')
const fs = require('fs')

const _storage = multer.diskStorage({
    // menentukan folder penyimpanan foto
    destination: function(req, file, cb){
        cb(null, uploadDirectory)
    },
    // menentukan pola nama file
    filename: function(req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage : _storage,
    limits:{
        fileSize: 10000000 // byte, max 1MB
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|JPG|png)$/)){
            return cb(new Error('Format file harus jpg/jpeg/JPG/png'))
        }
        cb(null, true)
    }
})

// VIEW IMAGE PRODUCT
router.get('/product/getImage/:imgName', (req, res)=>{
    let letakFolder = {
        root: uploadDirectory
    }
    // res.send(uploadDirectory)
    let namaFile = req.params.imgName
    // res.send(letakFolder)
    res.sendFile(namaFile, letakFolder, function(err){
        if(err) return res.send({error: err.message})
    })
})

// GET ALL PRODUCT
router.get('/products', (req, res)=>{
    let sql = 
    `select 
        p.id as id,
        p.product as nama_produk,
        c.category as kategori,
        t.type as tipe,
        p.price as harga,
        p.image_product as gambar,
        t.id as id_tipe,
        c.id as id_category,
        p.stock,
        r.rating
    from t_products p
    join t_category_products c
        on p.category_id = c.id
    join t_type_products t
        on c.type_id = t.id
    left join (select 
        product_id,
        avg(rating) as rating
    from t_review
    group by (product_id)) r
        on p.id = r.product_id
    WHERE p.deleted = '0'`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error:err.message})

        let data = result
        data.map(produk=>{
            // produk.image_name = `${uploadDirectory}${avatarName}`
            produk.gambar = `http://localhost:2018/product/getImage/${produk.gambar}`
            // console.log(produk.gambar)
        })

        res.send(result)
    })
})

// GET DETAIL PRODUCT
router.get(`/products/getDetail/:id_product`, (req, res)=>{
    let sql = 
    `select 
        p.id,
        p.product,
        p.price,
        p.stock,
        p.description,
        p.image_product,
        r.rating
    from t_products p
    left join (select 
        product_id,
        avg(rating) as rating
    from t_review
    group by (product_id)) r
        on p.id = r.product_id 
    where id = ${req.params.id_product}`

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

// GET ONE PRODUCT BY ID PRODUCT
router.get('/products/get/:product_id', (req, res)=>{
    let sql = 
    `SELECT 
        p.product as nama_produk,
        c.category as kategori,
        t.type as tipe,
        p.price as harga,
        p.image_product as gambar,
        c.id as id_kategori,
        p.stock,
        p.description
    FROM t_products p
    JOIN t_category_products c
        ON p.category_id = c.id
    JOIN t_type_products t
        ON c.type_id = t.id
    WHERE p.id = ${req.params.product_id}`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        // let data = result[0]
        
        res.send(result)
    })
})

// COUNT ALL PRODUK
router.get('/products/hitungproduk', (req, res)=>{
    let sql = `SELECT count(*) as total from t_products`

    conn.query(sql, (err, result)=>{
        if(err) res.send({error: err.message})
        res.send(result)
    })
})


// INPUT PRODUCT WITH PICTURE
router.post(`/products/addProductWithImg/:nama_file`, upload.single('img') ,(req, res)=>{
    // let {product, category_id, price, stock, created_at, created_by, updated_by, deleted} = req.body
    let sql = `INSERT INTO t_products SET ? `
    let data = req.body
    if(req.file) data.image_product = req.file.filename

    conn.query(sql, data, (err, result)=>{
        if(err) return res.send({error:err.message})
        res.send(result)
    })
})

// INPUT PRODUCT WITHOUT PICTURE
router.post(`/products/addProductWithoutImg`, (req, res)=>{
    let sql = `INSERT INTO t_products SET ?`
    let data = req.body

    conn.query(sql, data, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// UPDATE PRODUCT WITHOUT PICTURE
router.patch(`/products/updateWithouimg/:id_product`, (req, res)=>{
    let sql = `UPDATE t_products SET ? WHERE id= ${req.params.id_product}`
    let data = req.body

    conn.query(sql, data, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// UPDATE PRODUCT WITH PICTURE
router.patch(`/products/update/:id_product/:nama_file`, upload.single('image_product'), (req, res)=>{
    // let {product, category_id, price, updated_at, updated_by} = req.body
    // console.log(req.body)
    let sql = `SELECT image_product FROM t_products WHERE id = ${req.params.id_product}`
    let sql2 = `UPDATE t_products SET ? WHERE id= ${req.params.id_product}`
    let data = req.body
    // console.log(req.file)
    if(req.file) data.image_product = req.file.filename

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        if (result[0].image_product !== null){
            console.log('unlink file')
            let imgName = result[0].image_product
            let imgPath = `${uploadDirectory}${imgName}`

            fs.unlinkSync(imgPath)
            
        }
        conn.query(sql2, data, (err, result)=>{
            if(err) return res.send({error: err.message})
            
            res.send(result)
        })
    })
})

// DELETE PRODUCT
router.patch(`/products/delete/:id_product`, (req, res)=>{
    let sql = `UPDATE t_products SET deleted = '1' WHERE id = '${req.params.id_product}'`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})

        res.send(result)
    })
})

// UPDATE STOCK

router.patch(`/products/stockUpdate/:id_product`, (req, res)=>{
    let sql = `UPDATE t_products SET ? WHERE id = ${req.params.id_product}`
    let data = req.body

    conn.query(sql, data, (err, result)=>{
        if(err) return res.send(err.message)
        res.send(result)
    })
})

// GET ALL PRODUCT STOCK
router.get('/products/getStock', (req, res)=>{
    let sql = `SELECT product as nama_produk, stock from t_products`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})

        res.send(result)
    })
})

// CANCEL STOCK
router.patch(`/products/updateStockCancel`, (req, res)=>{
    let sql1 = `SELECT product_id, qty FROM t_transaction_detail WHERE transaction_id = '${req.body.transaction_id}' AND customer_id = '${req.body.user_id}'`
    conn.query(sql1, (err, result)=>{
        if(err) return res.send({error: err.message})
        let qtyAll = result
        let data = result.map(val=>{
            return val.product_id
        })
        // console.log(data)
        // res.send(data)
        let sql2 = `select id, stock from t_products where id in(?)`

        conn.query(sql2, [data], (err, result)=>{
            if(err) return res.send({error:err.message})

            // res.send(result)
            for(let i = 0; i<result.length; i++){
                for(let j = 0; j<result.length; j++){
                    if(result[i].id === qtyAll[j].product_id){
                        result[i].stock = result[i].stock + qtyAll[j].qty
                    }
                }
            }

            for(let k = 0; k<result.length; k++){
                let sql3 = `UPDATE t_products SET stock = ${result[k].stock} where id = ${result[k].id}`
                conn.query(sql3, (err, result)=>{
                     if(err) return res.send({error: err.message})
                     // console.log(result)
                })
            }

            res.send(result)
        })
    })
})

// CHECKOUT STOCK
router.patch(`/product/updateStock`, (req, res)=>{
    let sql1 = `SELECT product_id, qty FROM t_carts WHERE customer_id = '${req.body.customer_id}'`

    conn.query(sql1, (err, result)=>{
        if(err) return res.send({error:err.message})
        let qtyAll = result
        let data = result.map(val=>{
           return val.product_id
        })

       let sql2 = `select id, stock from t_products where id in (?)`
       conn.query(sql2, [data], (err, result)=>{
           if(err) return res.send({error: err.message})
        //    console.log(qtyAll)
        //    console.log(result)
           for(let i = 0; i < result.length; i++){
               for(let j = 0; j<result.length; j++){
                   if(result[i].id === qtyAll[j].product_id){
                       result[i].stock = result[i].stock - qtyAll[j].qty
                   }
               }
           }
        //    res.send(result)
        //    console.log(result)
           for(let k = 0; k<result.length; k++){
               let sql3 = `UPDATE t_products SET stock = ${result[k].stock} where id = ${result[k].id}`
               conn.query(sql3, (err, result)=>{
                    if(err) return res.send({error: err.message})
                    // console.log(result)
               })
           }
           res.send(result)

       })
    })
})

// GET REVIEW
router.get(`/products/review/:id_product`, (req, res)=>{
    let sql = 
    `select 
        r.id,
        product_id,
        customer_id,
        r.rating,
        u.name,
        u.avatar,
        comment,
        created_at
    from t_review r
    join users u
        on r.customer_id = u.id
    where product_id = ${req.params.id_product}`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error:err.message})

        let data = result
        data.map(user=>{
            // produk.image_name = `${uploadDirectory}${avatarName}`
            user.avatar = `http://localhost:2018/avatar/${user.avatar}`
            // console.log(produk.gambar)
        })
        // /avatar/:imageName
        res.send(result)
    })
})

// GET TRANSACTION DETAIL
router.get(`/transaction/getDetail/:transaction_id`, (req, res)=>{
    // console.log(req.params.transaction_id)
    let sql = 
    `select 
        t.transaction_id,
        t.product_id,
        t.qty,
        t.price,
        p.product,
        p.image_product,
        t.reviewed,
        r.comment,
        r.rating
    from t_transaction_detail t
    join t_products p
        on p.id = t.product_id
    left join t_review r
        on r.transaction_id = t.transaction_id and t.product_id = r.product_id 
    where t.transaction_id = '${req.params.transaction_id}'`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        let data = result
        data.map(val=>{
            // produk.image_name = `${uploadDirectory}${avatarName}`
            val.image_product = `http://localhost:2018/product/getImage/${val.image_product}`
            // console.log(produk.gambar)
        })
        // console.log(result)
        res.send(result)
    })
})

router.post(`/transaction/review`, (req, res)=>{
    let sql = `INSERT INTO t_review SET ?`
    let data = req.body

    conn.query(sql, data, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

router.get(`/informasiStock`, (req, res)=>{
    let sql = 
    `select 
    id, product, stock, image_product 
    from t_products where stock <= 5 and deleted = 0`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        let data = result
        data.map(produk=>{
            produk.image_product = `http://localhost:2018/product/getImage/${produk.image_product}`
        })
        res.send(result)
    })
})

router.get(`/infoTotalTerjual`, (req, res)=>{
    let sql = 
    `select 
        t.id,
        t.product_id,
        t.qty,
        p.image_product,
        p.product,
        p.price,
        p.stock,
        r.rating
    from t_transaction_detail t
    join t_products p
        on t.product_id = p.id
    join t_review r
        on p.id = r.product_id
    group by product_id
    order by t.qty desc
    limit 10`
    conn.query(sql, (err, result)=>{
        if(err) return res.send({error:err.message})
        let data = result
        data.map(produk=>{
            produk.image_product = `http://localhost:2018/product/getImage/${produk.image_product}`
        })
        res.send(result)
    })
})

module.exports = router