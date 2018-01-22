'use strict';

var http = require('http');
var path = require('path');
var express = require('express');
var SocketIo = require('socket.io');

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

io.on('connection', (socket) => {
  socket.on('serverEvents.send', (data) => {
    console.log(data);
  });
  // setInterval(()=>{
  //   socket.emit('clientEvents.welcome', '当前服务器时间，' + new Date());
  // }, 1333);
  io.emit('online', socket.id)
});

server.listen('8000', (err) => {
    if(err){
        return console.error(err);
    }
    console.log('Server started, listening port %s', server.address().port);
}); 