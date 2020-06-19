const sqlQuery = require('./mysql');

let socketio = {}
function getSocket(server) {
    socketio.io = require('socket.io')(server);

    let io = socketio.io;
    // 实时通讯链接
    // io.on('connection', 事件回调函数)  监听socketio的连接事件
    io.on('connection', function (socket) {
        // 此处的socket是当前浏览器某个浏览器与服务器的连接对象

        // 接受登录事件
        socket.on('login', async function (data) {

            // 先判断是否有人在登录，如果有人登录的话，那么将其断开
            let sqlStr1 = 'select * from user where isonline     = ? and username = ?'
            let result1 = await sqlQuery(sqlStr1, [1, data.username]);
            if (result1.length > 0) {
                socket.to(result1[0].socketid).emit('logout', { content: '有人登录进来,强制下线' })
            }

            // 修改数据库登录状态信息
            let sqlStr = 'update user set socketid = ?, isonline = ? where username = ?';
            let result = await sqlQuery(sqlStr, [socket.id, 1, data.username])
            socket.emit('login', {
                state: 'ok',
                content: '登录成功'
            })

            
            let sqlStr2 = 'select * from user';
            let result2 = await sqlQuery(sqlStr2);
            // let result2 = di();
            // 通知
            io.sockets.emit('users', Array.from(result2))

            // 最新未接受消息
            let sqlStr3 = 'select * from chat where isread = ? and `to` = ?';
            let result3 = await sqlQuery(sqlStr3, ['false', data.username]);
            // console.log(result3)
            socket.emit('unReadMsg', Array.from(result3))
            // let sqlStr4 = 'update chat set isread = ? where `from` = ? and `to` = ?';
            // for (let i = 0; i < result3.length; i++) {
            //     let result4 = await sqlQuery(sqlStr4, ['true', result3[i].from, result3[i].to])

            // }

        })

        async function di() {
            let sqlStr = 'select * from user';
            let result = await sqlQuery(sqlStr);
            return result;
        }

        // 监听断开事件
        socket.on('disconnect', async function () {
            // 修改数据库登录信息
            let sqlStr = 'update user set socketid = ?, isonline = ? where socketid = ?';
            let result = await sqlQuery(sqlStr, [null, 0, socket.id])

            let sqlStr2 = 'select * from user';
            let result2 = await sqlQuery(sqlStr2);
            io.sockets.emit('users', Array.from(result2))
        })

        // 获取用户
        socket.on('users', async function () {
            let sqlStr = 'select * from user';
            let result = await sqlQuery(sqlStr);
            socket.emit('users', Array.from(result))
        })


        // 监听
        socket.on('sendMsg', async function (msg) {
            // 判断接受消息者是否在线
            let strSql = 'select * from user where username = ? and isonline = ?';
            let result = await sqlQuery(strSql, [msg.to.username, 1]);
            if (result.length > 0) {
                // 如果此人在线 直接发送消息
                // 获取对象用户的 socketid
                let toid = result[0].socketid;
                // 向指定 socketid 的用户发送消息
                socket.to(toid).emit('accept', msg)
                // 将聊天内容存放到数据库 设置已读 true
                let strSql1 = 'insert into chat (`from`, `to`, content, `time`, isread) values (?, ?, ?, ?, ?)';
                let arr1 = [msg.from.username, msg.to.username, msg.content, msg.time, 'true'];
                sqlQuery(strSql1, arr1)
            } else {
                // 如果此人不在线
                // 将聊天内容存放到数据库 设置未读为 false
                let strSql1 = 'insert into chat (`from`, `to`, content, `time`, isread) values (?, ?, ?, ?, ?)';
                let arr1 = [msg.from.username, msg.to.username, msg.content, msg.time, 'false'];
                sqlQuery(strSql1, arr1)
            }
        })

        // 监听已读消息状态
        socket.on('readMsg', (data) => {
            let sqlStr = 'update chat set isread = ? where `from` = ? and `to` = ?'
            let result = sqlQuery(sqlStr, ['true', data.username, data.self])
            console.log(data)
        })
    })


}

socketio.getSocket = getSocket;

module.exports = socketio;