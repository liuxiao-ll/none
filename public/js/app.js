

$(function(){
  $(window).on('resize', function() {
    var clientHeight = document.documentElement.clientHeight;
    $('.app-user-list-body').height(clientHeight - 200)
    $('.app-chat-body').height(clientHeight - 100)
  }).resize()
})

var client = io.connect('http://localhost:8000', {
  reconnectionAttempts: 3, //重连次数
  reconnection: false, //是否重连
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 2000, //超时时间
  autoConnect: true //自动连接
});

client.emit('serverEvents.send', 'i am client')
client.on('clientEvents.welcome', (data) => {
  console.log(data)
})
client.on('online', (data) => {
  console.log(data)
})
client.on('error', function(err) {
  console.log(err);
});
client.on('connect', function() {
  console.log('connect');
});
client.on('disconnect', function(err) {
  console.log('disconnect', err);
});
client.on('reconnect', function(count) {
  console.log('reconnect', count);
});
client.on('reconnect_attempt', function(count) {
  console.log('reconnect_attempt', count);
});
client.on('reconnecting', function(count) {
  console.log('reconnecting', count);
});
client.on('reconnect_error', function(err) {
  console.log('reconnect_error', err);
});
client.on('reconnect_failed', function() {
  console.log('reconnect_failed');
});