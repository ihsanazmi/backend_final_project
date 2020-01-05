const conn = require('../connection/index')
const router = require('express').Router()

router.get(`/catalog/getType/:id_type`, (req, res)=>{
    let sql = 
    `select 
        p.id,
        p.product,
        p.price,
        p.stock,
        p.image_product,
        r.rating
    from t_products p
    join t_category_products c
        on c.id = p.category_id
    join t_type_products t
        on t.id = c.type_id
    left join (select 
        product_id,
        avg(rating) as rating
    from t_review
    group by(product_id)) r
        on p.id = r.product_id
    where t.id = ${req.params.id_type}`

    conn.query(sql, (err, result)=>{
        if(err) return res.send({error: err.message})
        res.send(result)
    })
})

module.exports = router