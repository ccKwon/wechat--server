let socketio = {}
function getSocket(server) {
    socketio.io = require('socket.io')(server);

    let io = socketio.io;
    // 实时通讯链接
    // io.on('connection', 事件回调函数)  监听socketio的连接事件
    io.on('connection', function (socket) {
        // 此处的socket是当前浏览器某个浏览器与服务器的连接对象

        io.sockets.emit('addUser', {
            id: socket.id,
            content: '有新用户加入'
        })

        // 向某个用户发送消息
        socket.on('sendUser', function (data) {
            // data = {
            //     from:'发送者ID',
            //     to: '收到者ID',
            //     content:''
            // }
            socket.to(data.to).emit('sendClient', data);
        })

        // socket.emit(), 发送客户端数据    （名称，内容）

        // 监听客户端发送过来的内容
        socket.on('my other event', function (data) {
            console.log(data)
        })
    })

    // 定义命名空间
    let qq = io.of('/qq');
    qq.on('connection', function (socket) {
        qq.emit('news', { content: 'qq命名空间发送过来的内容' })


        // 加入房间
        socket.on('addRoom', function (data) {
            console.log(data)
            let roomobj = socket.join(data.room)
        })

        // 监听群聊事件 并广播给所有人
        socket.on('sendMsgRoom', function (data) {
            // 发送到房间 + 内容
            console.log(data.content)
            socket.to(data.room).emit('qunliao',data);
        })
    })


}

socketio.getSocket = getSocket;

module.exports = socketio;