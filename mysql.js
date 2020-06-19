let mysql = require('mysql');

let options = {
    host:'localhost',
    user:'root',
    password:'root',
    database:'wechat'
}

let con = mysql.createConnection(options);

con.connect((err) => {
    // 如果连接失败
    if (err) {
        console.log(err)
    } else {
        console.log('数据库连接成功')
    }
})


function sqlQuery(strSql, arr) {
    return new Promise(function(resolve, reject) {
        con.query(strSql, arr, (err, result) => {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}


module.exports = sqlQuery;