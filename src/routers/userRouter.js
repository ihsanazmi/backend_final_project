const conn = require('../connection/index')
const router = require('express').Router()
const valid = require('validator')
const bcryptjs = require('bcryptjs')
const {sendVerification} = require('../email/nodemailer')
const multer = require('multer')
const path = require('path')
const uploadDirectory = path.join(__dirname, '/../../public/uploads/avatars/')
const fs = require('fs')
// const fs = require('fs')

const _storage = multer.diskStorage({
    // menentukan folder penyimpanan foto
    destination: function(req, file, cb){
        cb(null, uploadDirectory)
    },
    // menentukan pola nama file
    filename: function(req, file, cb){
        cb(null, Date.now() + req.params.username + path.extname(file.originalname))
    }
})

const upload = multer({
    storage : _storage,
    limits:{
        fileSize: 10000000 // byte, max 1MB
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|JPG)$/)){
            return cb(new Error('Format file harus jpg/jpeg/JPG'))
        }
        cb(null, true)
    }
})

// POST AVATAR
router.post('/avatar/:username',upload.single('avatar'), (req, res)=>{
    const sql = `SELECT avatar FROM users WHERE username = '${req.params.username}'`
    const sql2 = `UPDATE users SET avatar = '${req.file.filename}' WHERE username = '${req.params.username}' `

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})

        if (result[0].avatar){
            
            let avatarName = result[0].avatar
            let imgPath = `${uploadDirectory}${avatarName}`

            if(avatarName !== 'avatar_default.png'){
                fs.unlinkSync(imgPath)
            }
        }

        conn.query(sql2, (err, result)=>{
            if(err) return res.send(err)
            res.send({filename: `https://api.komputer-shop.com/avatar/${req.file.filename}`})
        })

    })
})

// ACCESS IMAGE
router.get('/avatar/:imageName', (req, res)=>{
    let letakFolder = {
        root: uploadDirectory
    }
    // res.send(uploadDirectory)
    let namaFile = req.params.imageName
    // res.send(letakFolder)
    res.sendFile(namaFile, letakFolder, function(err){
        if(err) return res.send({error: err.message})
    })

})

// GET DATA USER
router.get(`/users/getDataUser/:username`, (req, res)=>{
    let sql = `SELECT name from users WHERE username = '${req.params.username}'`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// CHECK USERNME
router.get(`/users/cekUsername/:username`, (req, res)=>{
    let sql = `SELECT username FROM users WHERE username = '${req.params.username}'`
    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// CEK EMAIL
router.get(`/users/cekEmail/:email`, (req, res)=>{
    let sql = `SELECT email FROM users WHERE email = '${req.params.email}'`
    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// CREATE USER
router.post('/users', (req,res)=>{
    let sql = `INSERT INTO users SET ?`
    let data = req.body

    if(!valid.isEmail(data.email)) return res.send({error : "Format email salah"})
    data.password = bcryptjs.hashSync(data.password, 8)

    conn.query(sql, data, (err, result)=>{
        if(err) return res.send({error: err.message})

        sendVerification(data)
        res.send(result)
    })
})



// LOGIN
router.post('/users/login', (req, res)=>{
    let {email, password} = req.body
    let sql = `SELECT * FROM users WHERE email = '${email}'`

    conn.query(sql, async (err, result)=>{
        if(err) return ({error: err.message})

        if(result == 0 ) return res.send({error: "User Not Found"})

        let user = result[0]
        let hasil = await bcryptjs.compare(password, user.password)
        if(!hasil){
            return res.send({error: "Password Salah"})
        }
        if(!user.verify){
            return res.send({error: "Silahkan verifikasi email terlebih dahulu"})
        }
        res.send({
           ... user,
           avatar: `https://api.komputer-shop.com/avatar/${user.avatar}`
        })
    })
})

// UPDATE PROFILE
router.patch('/users/update/:id', (req, res)=>{
    let sql = `UPDATE users SET ? WHERE id = ?`
    let data = [req.body, req.params.id]
    // console.log(data[0])

    if(data[0].password){
        data[0].password = bcryptjs.hashSync(data[0].password, 8)
    }

    conn.query(sql, data, (err, result)=>{
        if(err) return res.send({error: err.message})

        res.send(result)
    })
})

// VERIFICATION EMAIL
router.get('/verification/:username', (req, res)=>{
    let sql = `UPDATE users SET verify = true WHERE username = '${req.params.username}'`

    conn.query(sql, (err, result)=>{
        if(err) return ({error: err.message})

        res.send(result)
    })
})

// READ PROFILE
router.get('/users/profile/:id', (req, res)=>{
    let sql = `SELECT * FROM users WHERE id = '${req.params.id}'`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})

        let user = result[0]

        if(!user) return res.send({error: "User not Found"})

        res.send({
            ...user,
            avatar: `https://api.komputer-shop.com/avatar/${user.avatar}`
        })
    })
})

// GET ALL KODEPOS
router.get('/kodepos', (req, res)=>{
    let sql = `SELECT * FROM t_kodepos`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})

        res.send(result)
    })
})

// GET USER ADDRESS
router.get('/users/address/:userid', (req, res)=>{
    let sql = `SELECT * FROM t_address WHERE user_id = '${req.params.userid}' ORDER BY status_active asc`

    conn.query(sql, (err, result)=>{
        if(err) res.send({error: err.message})

        res.send(result)
    })
})

// GET USER ADDRESS ACTIVE
router.get(`/users/addresActive/:user_id`, (req, res)=>{
    let sql = `SELECT * FROM t_address WHERE user_id = ${req.params.user_id} AND status_active = 1 `
    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

// UPDATE USER ADDRESS
router.patch('/address/update/:id', (req, res)=>{
    let sql = `UPDATE t_address set ? where id = '${req.params.id}'`
    let data = req.body

    conn.query(sql, data, (err, result)=>{
        if(err) return res.send({error: err.message})

        res.send(result)
    })
})

// DELETE USER ADDRESS
router.delete('/address/delete/:id', (req,res)=>{
    let sql = `DELETE FROM t_address where id = '${req.params.id}'`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})

        res.send(result)
    })
})

// UPDATE PRIMARY ADDRESS
router.patch('/users/address/update/:addressid/:userid', (req, res)=>{
    let sql = `UPDATE t_address SET status_active = '0' WHERE user_id = '${req.params.userid}' AND status_active = '1'`
    let sql2 = `UPDATE t_address SET status_active = '1' WHERE id = ${req.params.addressid}`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        // console.log(result)
        if(result){
            conn.query(sql2, (err, result)=>{
                if(err) return res.send({error: err.message})
                return res.send(result)
            })
        }
    })
})

// SAVE ALAMAT PENGIRIMAN
router.post('/address', (req, res)=>{
    let sql = `SELECT * FROM t_address`
    let sql2 = `UPDATE t_address SET status_active = '0' WHERE user_id = '${req.body.user_id}' AND status_active = '1'`
    let sql3 = `INSERT INTO t_address SET ?`
    let data = req.body

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        
        if(result){
            conn.query(sql2, (err, result)=>{
                if(err) return res.send({error: err.message})
                // res.send(result)
            })
        }

        conn.query(sql3, data, (err, result)=>{
            if(err) return res.send({error: err.message})

            res.send(result)
        })
    })
})

module.exports = router