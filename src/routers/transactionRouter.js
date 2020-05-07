const conn = require('../connection/index')
const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const uploadDirectory = path.join(__dirname, '/../../public/uploads/payments/')
const fs = require('fs')
const {sendReceipt} = require('../email/nodemailer')
const moment =  require('moment')

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
router.get('/transaction/getImage/:imgName', (req, res)=>{
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

// UPLOAD PAYMENT PROOF
router.patch(`/transaction/upload/:id_transaction`, upload.single("payment_proof"), (req, res)=>{
    let sql = `UPDATE t_transaction SET payment_proof = '${req.file.filename}', status = '1', notes = '' WHERE transaction_id = '${req.params.id_transaction}'`
    let sql2 = `SELECT payment_proof FROM t_transaction WHERE transaction_id = '${req.params.id_transaction}'`

    conn.query(sql2, (err, result)=>{
        if (result[0].payment_proof !== null){
            console.log('unlink file')
            let imgName = result[0].payment_proof
            let imgPath = `${uploadDirectory}${imgName}`

            fs.unlinkSync(imgPath)        
        }

        conn.query(sql, (err, result)=>{
            if(err) return res.send({error: err.message})
            res.send(result)
        })
    })
})

// UPDATE NOMOR RESI
router.patch(`/transaction/updateresi/:transaction_id`, (req, res)=>{
    let sql = `UPDATE t_transaction SET no_resi = '${req.body.no_resi}', status = '2', updated_at = '${req.body.updated_at}' WHERE transaction_id = '${req.params.transaction_id}'`
    // let data = req.body
    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})

        let sql2 = `select 
            u.name,
            u.email,
            t.no_invoice,
            t.no_resi,
            t.destination,
            t.penerima,
            t.grand_total,
            t.updated_at
        from t_transaction t
        join users u
            on u.id = t.customer_id
        where transaction_id = '${req.params.transaction_id}'
        `
        conn.query(sql2, (err, result)=>{
            if(err) return res.send({error: err.message})
            let sql2 = `select 
                            u.email,
                            t.grand_total,
                            t.no_invoice,
                            t.created_at,
                            t.updated_at,
                            t.no_resi,
                            t.destination,
                            t.penerima,
                            p.product,
                            p.price,
                            td.qty
                        from t_transaction t
                        join t_transaction_detail td
                        on t.transaction_id = td.transaction_id
                        join t_products p
                        on p.id = td.product_id
                        join users u
                        on u.id = t.customer_id
                        where t.transaction_id = '${req.params.transaction_id}'`

            conn.query(sql2, (err, result)=>{
                if(err) return res.send({error: err.message})
                sendReceipt(result)
                // console.log(result)
                res.send(result)

            })
        })
    })
})


// GET TRANSACTIOn by CUSTOMER ID
router.get(`/transaction/:customer_id`, (req, res)=>{
    let sql = 
    `select 
        t.transaction_id,
        t.customer_id,
        t.no_invoice,
        t.destination,
        t.payment_proof,
        t.no_resi,
        t.grand_total,
        t.created_at,
        t.delivered_at,
        s.status,
        t.notes,
        t.penerima,
        a.phone_number
    from t_transaction t
    join t_status s
        on t.status = s.id
    join (
    select penerima, phone_number, user_id
    from t_address
    where user_id = ${req.params.customer_id} and status_active = 1	
    ) a
        on a.user_id = t.customer_id
    where t.customer_id = ${req.params.customer_id} and t.status <> '6'
    order by s.status asc`
    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})

        let data = result
        data.map(val=>{
            // produk.image_name = `${uploadDirectory}${avatarName}`
            if(val.payment_proof === null){
                val.payment_proof = 'NULL'
            }else{
                val.payment_proof = `http://localhost:2018/transaction/getImage/${val.payment_proof}`
            }
            // console.log(produk.gambar)
        })

        res.send(result)
    })
})

// GET ALL TRANSACTION
router.get(`/getAllTransaction`, (req, res)=>{
    let sql = 
    `select 
        t.transaction_id,
        t.no_invoice,
        t.customer_id,
        t.destination,
        t.payment_proof,
        t.payment_proof as img,
        t.no_resi,
        t.grand_total,
        t.created_at,
        t.delivered_at,
        s.status,
        a.penerima,
        a.phone_number,
        u.email,
        u.name
    from t_transaction t
    join t_status s
        on t.status = s.id
    join (
    select penerima, phone_number, user_id
    from t_address
    where status_active = '1'	
    ) a
        on a.user_id = t.customer_id
    join users u
        on a.user_id = u.id
    order by s.id asc`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error:err.message})

        let data = result
        data.map(val=>{
            // produk.image_name = `${uploadDirectory}${avatarName}`
            val.payment_proof = `http://localhost:2018/transaction/getImage/${val.payment_proof}`
            // console.log(produk.gambar)
        })
        // console.log(result)
        res.send(result)
    })
})

// REJECT TRANSACTION
router.patch(`/transaction/reject/:id_transaction`, (req, res)=>{
    let sql = `UPDATE t_transaction set status = '3', notes = '${req.body.notes}' where transaction_id = '${req.params.id_transaction}'`
    
    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// TRANSACTION DELIVERED
router.patch(`/transaction/delivered/:transaction_id`, (req, res)=>{
    console.log(req.body.delivered_at)
    let sql = `UPDATE t_transaction set status = 5, delivered_at = '${req.body.delivered_at}' WHERE transaction_id = '${req.params.transaction_id}'`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})

        res.send(result)
    })
})

// TRANSACTION COMPLETED
router.patch(`/transaction/completed/:transaction_id`, (req, res)=>{
    let sql = `UPDATE t_transaction  SET status = '4' WHERE transaction_id = '${req.params.transaction_id}'`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// TRANSACTION CANCELED
router.patch(`/transaction/cancelTransaction`, (req, res)=>{
    let sql = `UPDATE t_transaction SET status = '6' WHERE transaction_id = '${req.body.transaction_id}'`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// COUNT TRANSACTION
router.get(`/totalTransaction`, (req, res)=>{
    let sql = 
    `select 
        s.id,
        s.status,
        count(t.status) as total
    from t_status s
    left join t_transaction t
        on s.id = t.status
    group by s.status
    order by s.id asc`
    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

router.patch(`/transaction/updateReview`, (req, res)=>{
    let sql = `update t_transaction_detail set reviewed = '1' where transaction_id = '${req.body.transaction_id}' and product_id = '${req.body.product_id}'`
    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

module.exports = router