const mysql = require('mysql')

const conn = mysql.createConnection({
    // user: "devuser",
    // password: "Ihsanazmi26",
    // host: "localhost",
    // database: "ecommerce",
    // port: 3306
    user: "kumisproject",
    password: "Ihsanazmi26",
    host: "db4free.net",
    database: "ecommerce_kumis",
    port: 3306
})

module.exports = conn