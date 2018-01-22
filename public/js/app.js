

$(function(){
  $(window).on('resize', function() {
    var clientHeight = document.documentElement.clientHeight;
    $('.app-user-list-body').height(clientHeight - 200)
    $('.app-chat-body').height(clientHeight - 100)
  }).resize()
  let nickName
  let $appChatContent = $('.app-chat-content')
  let $elTemplate = $('#el_template')
  let $elInputMsg = $('#el_input_msg')
  let $elBtnSend = $('#el_btn_send')
  // 工具方法
  function writeMessage(type, msg, title, isSelf ) {
    title= title || (type === 'system' ? '系统消息' : 'User')
    let template = $elTemplate.html()
    .replace('${title}', title)
    .replace('${bgClass}', type === 'system' ? 'label-danger' : 'label-info')
    .replace(/\${pullRight}/g, isSelf ? 'pull-right' : '')
    .replace('${textRight}', isSelf ? 'text-right' : 'aaaa')
    .replace('${info-icon}', type === 'system' ? 'glyphicon-info-sign' : 'glyphicon-user')
    .replace('${time}', '00:00:00')
    .replace('${msg}', msg);
    $appChatContent.append(template)
  }

  $elBtnSend.click(function(){
    let value = $elInputMsg.val()
    if (value) {
      client.emit('server.newMsg', {
        type: 'text',
        data: value,
        clientId: client.id
      })
    }
  })
  
  function sendMsg(msg, type) {
    var msgObj = {
      type: type || 'text',
      data: msg,
      clientId: client.id
    }
    client.emit('server.newMsg', msgObj);
  }

  $(document).on('paste', function(e){
    var originalEvent =  e.originalEvent;
    var items;
    if(originalEvent.clipboardData && originalEvent.clipboardData.items){
      items = originalEvent.clipboardData.items;
    }
    if(items){
      for(var i = 0, len = items.length; i< len; i++){
        var item = items[i];
        if(item.kind === 'file'){
          var pasteFile = item.getAsFile();
          if(pasteFile.size > 1024 * 1024){
            return;
          }
          var reader = new FileReader();
          reader.onloadend = function(){
            var imgBase64Str = reader.result;
            console.log(imgBase64Str)
            sendMsg(imgBase64Str, 'image');
          }
          //读取数据
          reader.readAsDataURL(pasteFile);
        }
      }
    }
  })
      
  // 定义变量
  var client = io.connect('http://localhost:8000', {
    reconnectionAttempts: 3, //重连次数
    reconnection: false, //是否重连
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 2000, //超时时间
    autoConnect: true //自动连接
  });
  do {
    nickName = prompt('请输入您的昵称：')
  } while (!nickName)
  client.emit('server.online', nickName)
  client.on('client.online', (nickName) => {
    writeMessage('system', nickName+'上线了')
  })

  client.on('client.offline', (nickName) =>{
    writeMessage('system', nickName+'下线了')
  })

  client.on('client.newMsg', (msgObj) => {
    if (msgObj.type === 'image') {
      msgObj.data = '<img src="'+ msgObj.data+'">'
    }
    writeMessage('user', msgObj.data, msgObj.nickName, msgObj.clientId === client.id)
    $appChatContent[0].scrollTop = $appChatContent[0].scrollHeight
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
})



