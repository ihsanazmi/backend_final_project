const nodemailer = require('nodemailer')
const config = require('./config')

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'project.computer.shop@gmail.com',
        clientId: config.clientId,
        clientSecret : config.clientSecret,
        refreshToken: config.refreshToken
    }
})

let sendVerification = (data)=>{
    let mail = {
        from: 'Komputer Shop <project.computer.shop@gmail.com',
        to: data.email,
        subject: 'Email Verification',
        html:`<h1>Dear ${data.name}</h1>
            <p>Ini adalah email verifikasi untuk akun ada karena telah registrasi di website kami.</p>
            <p>Silahkan klik <a href="http://localhost:3000/verification/${data.username}">disni</a> untuk melakukan verifikasi.</p>
            <br>
            <p>Terimakasih telah melakukan registrasi</p>
            <p>Selamat berbelanja :)</p>`
    }

    transporter.sendMail(mail, (err, result)=>{
        if(err) return console.log(err.message)

        console.log('Email berhasil dikirim')
    })
}

let sendReceipt = (data)=>{
    let mail = {
        from : 'Komputer Shop <project.computer.shop@gmail.com',
        to: data.email,
        subject: 'Invoice Belanja',
        html:`<center>
        <h1>Halo, ${data.name}</h1>
        <p>Pesanan dengan No invoice "${data.no_invoice}" telah dikirim</p>
        <div>
            <a href="http://localhost:3000/pembelian">Pantau pesanan anda</a>
        </div>
        <p>No Invoice: ${data.no_invoice}</p>
        <p>No Resi: ${data.no_resi}</p>
        <p>Tanggal Pengiriman: ${data.updated_at}</p>
        <p>Grand Total: ${data.grand_total}</p>
        <p>Alamat Pengiriman : ${data.destination}</p>
        <p>Penerima: ${data.penerima}</p>
        
        </center>`
    }
    transporter.sendMail(mail, (err, result)=>{
        if(err) return console.log(err.message)
        console.log('Email berhasil dikirim')
    })
}

let rejectTransaction = (data)=>{
    let mail = {
        from : 'Komputer Shop <project.computer.shop@gmail.com',
        to: data.email,
        subject: 'TRANSACTION REJECT',
        html:`<center>
        <h1>Halo, ${data.name}</h1>
        <p>Pesanan dengan No invoice "${data.no_invoice}" telah dikirim</p>
        <div>
            <a href="http://localhost:3000/pembelian">Pantau pesanan anda</a>
        </div>
        <p>No Invoice: ${data.no_invoice}</p>
        <p>No Resi: ${data.no_resi}</p>
        <p>Tanggal Pengiriman: ${data.updated_at}</p>
        <p>Grand Total: ${data.grand_total}</p>
        <p>Alamat Pengiriman : ${data.destination}</p>
        <p>Penerima: ${data.penerima}</p>
        
        </center>`
    }
    transporter.sendMail(mail, (err, result)=>{
        if(err) return console.log(err.message)
        console.log('Email berhasil dikirim')
    })
}

module.exports = {sendVerification, sendReceipt}