'use strict';

var http = require('http');
var path = require('path');
var express = require('express');
var SocketIo = require('socket.io');
var fs = require('fs')
let roomMap = {
  'aa1': 'roomA',
  'aa2': 'roomA',
  'bb1': 'roomB',
  'bb2': 'roomB'
}
let getRoom = (userId) => {
  return roomMap[userId] || 'default-room'
}
var app = express();
app.use(express.static(path.join(__dirname, './public')));
var server = http.Server(app);
var io = new SocketIo(server, {
  pingTimeout: 1000 * 10, //default 1000 * 60,超时时间
  pingInterval: 1000 * 2, //default 1000 * 2.5 ping的频率
  transports: ['websocket', 'polling'],
  allowUpgrades: true, //default true, 传输方式是否允许升级
  httpCompression: true//default true,使用加密
  // path: '/socket.io', //提供客户端js的路径
  // serveClient: false //是否提供客户端js（socket.io-client）
});

//用户认证
io.set('authorization', (handshakeData, accept) => {
  if(handshakeData.headers.cookie){
    handshakeData.headers.userId = Date.now();
    accept(null, true);
  }else{
    accept('Authorization Error', false);
  }
});
let userMap = new Map()
var getUserList = (userMap) => {
  let userList = []
  for (let client of userMap.values()) {
    userList.push(client.nickName)
  }
  return userList
}

var isRoom =(userId) => {
  return ['roomA', 'roomB'].indexOf(roomId) > 0
}
io.on('connection', (socket) => {
  socket.on('serverEvents.send', (data) => {
  });
  // setInterval(()=>{
  //   socket.emit('clientEvents.welcome', '当前服务器时间，' + new Date());
  // }, 1333);
  io.emit('online', socket.id)

  // 上线
  socket.on('server.online', (nickName) => {
    socket.nickName = nickName
    var roomId = getRoom(nickName)
    socket.join(roomId)
    io.emit('client.online', nickName)
    socket.emit('client.joinroom', {
      nickName: nickName,
      roomId: roomId
    })
  })

  // 下线
  socket.on('disconnect', () => {
    userMap.delete(socket.id)
    socket.broadcast.emit('client.offline', socket.nickName)
  })

  // 接受聊天
  socket.on('server.newMsg', (msgObj) => {
    if (msgObj.type === 'text') {
      let splitPoint = msgObj.data.indexOf(':')
      if (splitPoint > 0) {
        let roomId = msgObj.data.substring(0,splitPoint)
        if (isRoom(roomId)) {
          let msg = msgObj.data.substring(splitPoint + 1)
          msgObj.data = msg
          io.to(roomId).emit('client.newMsg')
          return
        }
      }
    }
    msgObj.now = Date.now()
    msgObj.nickName = socket.nickName
    io.emit('client.newMsg', msgObj)
  })

  socket.on('server.getOnlineList', () => {
    socket.emit('client.onlineList', getUserList(userMap))
  })
  // 文件
  socket.on('server.sendfile', (fileMsgObj) => {
    let filePath = path.resolve(__dirname, `./public/files/${fileMsgObj.fileName}`)
    fs.writeFileSync(filePath, fileMsgObj.file, 'binary')
    io.emit('client.file', {
      nickName: socket.nickName,
      now: Date.now(),
      fileName: fileMsgObj.fileName,
      clientId: fileMsgObj.clientId
    })
  })
  userMap.set(socket.id, socket)
});



server.listen('8000', (err) => {
    if(err){
        return console.error(err);
    }
    console.log('Server started, listening port %s', server.address().port);
}); 