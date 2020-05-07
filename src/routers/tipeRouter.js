const conn = require('../connection/index')
const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const uploadDirectory = path.join(__dirname, '/../../public/uploads/tipe/')
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

// VIEW IMAGE TIPE
router.get('/product/getImageTipe/:imgName', (req, res)=>{
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

// GET ALL TIPE PRODUK
router.get('/products/type_products', (req, res)=>{
    let sql = 'select id, type, type_image from t_type_products where deleted = 0'

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        let data = result
        // console.log(data)
        data.map(tipe=>{
            // produk.image_name = `${uploadDirectory}${avatarName}`
            tipe.type_image = `http://localhost:2018/product/getImageTipe/${tipe.type_image}`
            // console.log(produk.gambar)
        })
        res.send(result)
        // console.log(result)
    })
})

// GET TIPE BY ID
router.get('/products/getTipeId/:id_tipe', (req, res)=>{
    let sql = `SELECT * FROM t_type_products WHERE id = ${req.params.id_tipe}`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error:err.message})

        res.send(result)
    })
})

// UPDATE TIPE
router.patch(`/products/updateTipe/:id_tipe`, (req, res)=>{
    let sql = `UPDATE t_type_products SET ? WHERE id = ${req.params.id_tipe}`
    let data = req.body

    conn.query(sql, data, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})
// UPDATE TIPE WITH IMG
router.patch(`/products/updateTipeWithImg/:id_tipe/:type`, upload.single('type_image'), (req, res)=>{
    // let {product, category_id, price, updated_at, updated_by} = req.body
    // console.log(req.body)
    let sql = `SELECT type_image FROM t_type_products WHERE id = ${req.params.id_tipe}`
    let sql2 = `UPDATE t_type_products SET ? WHERE id= ${req.params.id_tipe}`
    let data = req.body
    // console.log(req.file)
    if(req.file) data.type_image = req.file.filename
    
    // console.log(req.params.id_tipe)
    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        if (result[0].type_image !== null){
            let imgName = result[0].type_image
            let imgPath = `${uploadDirectory}${imgName}`
            
            fs.unlinkSync(imgPath)
            
        }
        // console.log('tidak unlink file')
        conn.query(sql2, data, (err, result)=>{
            if(err) return res.send({error: err.message})
            // console.log(result)
            res.send(result)
        })
    })
})

// INSERT TIPE WTIHOUT IMG
router.post(`/products/saveTipe`, (req, res)=>{
    let sql = `INSERT INTO t_type_products SET ?`
    let data = req.body

    conn.query(sql, data, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// INSERT TYPE WITH IMG
router.post(`/products/saveTipewithImg`, upload.single('type_image'), (req, res)=>{
    let sql = `INSERT INTO t_type_products SET ? `
    let data = req.body
    if(req.file) data.type_image = req.file.filename

    conn.query(sql, data, (err, result)=>{
        if(err) return res.send({error:err.message})
        res.send(result)
    })
})

// DELETE TIPE
router.patch(`/products/deleteTipe/:id_tipe`, (req, res)=>{
    let sql = `UPDATE t_type_products SET deleted = '1' WHERE id= ${req.params.id_tipe}`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})

        res.send(result)
    })
})

module.exports = router