const nodemailer = require('nodemailer')
const config = require('./config')
const moment = require('moment')

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
        html:`<div style="background-color: #a0dfa4; color: black; text-align: center; margin: 0 auto; font-family: monospace;">
        <h1 style="padding: 10px">Hello, ${data.name}</h1>
        <div
            style="background-color: #eaeaea; color: #1C2A48; text-align: center; margin: 0 auto; height: 100%; padding: 20px;">
            <h1 style="font-size: 70px">Account Verification !</h1>
            <p>Dear ${data.name}</p>
            <p>This is verification email to your account because your email has registered in our website.</p>
            <p>Click the button below to verifiy your account !</p>
            <a href="https://komputer-shop.com/verification/${data.username}">
                <button style=" 
            background-color: #a0dfa4;
            border: none;
            color: #1C2A48;
            padding: 15px 32px;
            text-align: center;
            display: inline-block;
            font-size: 16px;
            ">Verify Now !</button></a>
            <p>Thanks for register to our website!</p>
            <p>Please enjoy the shoping!</p>
        </div>
    </div>`
    }

    transporter.sendMail(mail, (err, result)=>{
        if(err) return console.log(err.message)

        // console.log('Email berhasil dikirim')
    })
}

let invoice = (data)=>{
    let grand_total = `Rp ${Intl.NumberFormat().format(data[0].grand_total).replace(/,/g, '.')}`
    let tgl_pembelian = moment(data[0].created_at).format('MMMM Do YYYY, h:mm:ss a')
    let batas_waktu = new Date(data[0].created_at)
    batas_waktu.setDate(batas_waktu.getDate()+2)
    batas_waktu = moment(batas_waktu).format('MMMM Do YYYY, h:mm:ss a')

    var render_detail =()=>{
        var output = ''
        data.forEach((val)=>{
            
            output += `<tr>
            <td style="border-bottom: 1px solid #eaeaea; padding-top: 10px ">${val.product}</td>
            <td style="border-bottom: 1px solid #eaeaea; padding-top: 10px ">${val.qty}X</td>
            <td style="border-bottom: 1px solid #eaeaea; padding-top: 10px ">Rp.${Intl.NumberFormat().format(val.price).replace(/,/g, '.')}</td>
        </tr>`
            
        })
        return output
    }

    let mail={
        from :'Komputer Shop <project.computer.shop@gmail.com',
        to: data[0].email,
        subject: `Menunggu Pembayaran untuk invoice ${data[0].no_invoice}`,
        html:`<style>
        .body_email{
            width: 50%
        }
        @media (max-width: 767px){
            .body_email{
                width: 100%
            }
        }
    </style>
    <div class="body_email" style="border: 1px solid #eaeaea; border-radius: 10px; padding: 1rem; margin: 0 auto; ">
        <h1>Toko Online Komputer</h1>
        <h2 style="color: #666">Mohon segera selesaikan pembayaran Anda</h2>
        <p style="color:#999">Checkout berhasil pada tanggal ${tgl_pembelian}</p>
        
        <table style="width:100%">
            <thead>
                <tr>
                    <td style="width:50%; font-weight: 600">Total Pembayaran</td>
                    <td style="width:50%; font-weight: 600">Batas Waktu Pembayaran</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="color: #999">${grand_total}</td>
                    <td style="color: #999">${batas_waktu}</td>
                </tr>
            </tbody>
        </table>
        <table style="width:100%; padding-top: 20px">
            <thead>
                <tr>
                    <td style="width:50%; font-weight: 600">Metode Pembayaran</td>
                    <td style="width:50%; font-weight: 600">No. Invoice</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="color: #999">Transfer Bank</td>
                    <td style="color: #999">${data[0].no_invoice}</td>
                </tr>
            </tbody>
        </table>
        <table style="width:100%; padding-top: 20px">
            <thead>
                <tr>
                    <td style="width:50%; font-weight: 600">Status Pembayaran</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="color: #999">Menunggu Pembayaran</td>
                </tr>
            </tbody>
        </table>
        
        <div style="padding-top: 40px; ">
            <p style="font-weight: 600; ">Detail Pesanan</p>
        </div>
        <table style="width:100%;">
            <thead>
                <th >
                    <td style="width: 60%; "></td>
                    <td ></td>
                    <td ></td>
                </th>
            </thead>
            <tbody >
                ${render_detail()}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="font-weight: 600; padding-top: 40px">Total Pembayaran</td>
                    <td style="font-weight: 600; padding-top: 40px">${grand_total}</td>
                </tr>
            </tfoot>
        </table>
    
        <div style="margin-top: 40px">
            <p style="font-size: 18px; color:#999">Pantau status pembayaran anda pada halaman Pembelian.</p>
            <a href="https://komputer-shop.com/pembelian">
                <button style=" 
            background-color: #a0dfa4;
            border: none;
            color: #1C2A48;
            padding: 15px 32px;
            text-align: center;
            display: inline-block;
            font-size: 16px;
            ">Cek Status Pembayaran</button></a>
        </div>
    
    </div>`
    }
    transporter.sendMail(mail,(err, result)=>{
        if(err) return console.log(err.message)
        console.log('Email Terkirim')
    })
}

let sendReceipt = (data)=>{
    let grand_total = `Rp ${Intl.NumberFormat().format(data[0].grand_total).replace(/,/g, '.')}`
    let waktu_pembayaran = moment(data[0].created_at).format('MMMM Do YYYY, h:mm:ss a')
    let waktu_pengiriman = moment(data[0].updated_at).format('MMMM Do YYYY, h:mm:ss a')

    var render_detail =()=>{
        var output = ''
        data.forEach((val)=>{
            
            output += `<tr >
            <td style="border-bottom: 1px solid #eaeaea; padding-top: 10px ">${val.product}</td>
            <td style="border-bottom: 1px solid #eaeaea; padding-top: 10px ">${val.qty}X</td>
            <td style="border-bottom: 1px solid #eaeaea; padding-top: 10px ">Rp.${Intl.NumberFormat().format(val.price).replace(/,/g, '.')}</td>
        </tr>`
            
        })
        return output
    }

    let mail = {
        from : 'Komputer Shop <project.computer.shop@gmail.com',
        to: data[0].email,
        subject: 'Invoice Belanja',
        html:`<style>
                .body_email{
                    width: 50%
                }
                @media (max-width: 767px){
                    .body_email{
                        width: 100%
                    }
                }
            </style>
        <div class="body_email" style=" border: 1px solid #eaeaea; border-radius: 10px; padding: 1rem; margin: 0 auto; ">
            <h1>Toko Online Komputer</h1>
            <h2>Pesanan anda sudah kami kirim</h2>
            <p>Terimakasih telah menyelesaikan transaksi di toko kami. Pembayaran via transfer bank berhasil</p>
            <table style="width:100%">
                <thead>
                    <tr>
                        <td style="width:50%; font-weight: 600">Total Pembayaran</td>
                        <td style="width:50%; font-weight: 600">No. Invoice</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="color: #999">${grand_total}</td>
                        <td style="color: #999">${data[0].no_invoice}</td>
                    </tr>
                </tbody>
            </table>
            <table style="width:100%; padding-top: 20px">
                <thead>
                    <tr>
                        <td style="width:50%; font-weight: 600">Metode Pembayaran</td>
                        <td style="width:50%; font-weight: 600">Waktu Pembayaran</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="color: #999">Transfer Bank</td>
                        <td style="color: #999">${waktu_pembayaran}</td>
                    </tr>
                </tbody>
            </table>
            <table style="width:100%; padding-top: 20px">
                <thead>
                    <tr>
                        <td style="width:50%; font-weight: 600">Nomor Resi</td>
                        <td style="width:50%; font-weight: 600">Tanggal Pengiriman</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="color: #999">${data[0].no_resi}</td>
                        <td style="color: #999">${waktu_pengiriman}</td>
                    </tr>
                </tbody>
            </table>
            <table style="width:100%; padding-top: 20px">
                <thead>
                    <tr>
                        <td style="width:50%; font-weight: 600">Alamat Pengiriman</td>
                        <td style="width:50%; font-weight: 600">Nama Penerima</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="color: #999">${data[0].destination}</td>
                        <td style="color: #999">${data[0].penerima}</td>
                    </tr>
                </tbody>
            </table>
            <table style="width:100%; padding-top: 20px">
                <thead>
                    <tr>
                        <td style="width:50%; font-weight: 600">Status Pembayaran</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="color: #999">Sudah Diverifikasi</td>
                    </tr>
                </tbody>
            </table>
            <div style="display: flex; flex-direction:row; padding-top: 40px">
                <a style="width: 50%" href="https://komputer-shop.com/pembelian">
                    <button style=" 
                    background-color: #a0dfa4;
                    border: 1px solid #eaeaea;
                    color: #1C2A48;
                    padding: 15px 32px;
                    text-align: center;
                    font-size: 16px;
                    width: 100%
                    ">Cek Status Pesanan</button>
                </a>
                <a style="width: 50%" href="https://komputer-shop.com">
                    <button style=" 
                    background-color: white;
                    border: 1px solid #eaeaea;
                    color: black;
                    padding: 15px 32px;
                    text-align: center;
                    font-size: 16px;
                    width: 100%
                    ">Belanja Lagi</button>
                </a>
            </div>

            <div style="padding-top: 40px; ">
                    <p style="font-weight: 600; ">Detail Pesanan</p>
                </div>
                <table style="width:100%;">
                    <thead>
                        <th >
                            <td style="width: 60%; "></td>
                            <td ></td>
                            <td ></td>
                        </th>
                    </thead>
                    <tbody >
                        ${render_detail()}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="font-weight: 600; padding-top: 40px">Total Pembayaran</td>
                            <td style="font-weight: 600; padding-top: 40px">${grand_total}</td>
                        </tr>
                    </tfoot>
                </table>
        </div>`
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
            <a href="https://komputer-shop.com/pembelian">Pantau pesanan anda</a>
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

module.exports = {sendVerification, sendReceipt,invoice}