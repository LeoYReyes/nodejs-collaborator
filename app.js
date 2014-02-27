//var app = require('express')();
const fs = require("fs");
var options = {
  key: fs.readFileSync('privatekey.pem'),
  cert: fs.readFileSync('certificate.pem')
};
var serverHttps = require('https').createServer(options, handler);
var server = require('http').createServer(handler);

//var io = require('socket.io').listen(server);
var static = require('node-static');

var fileServer = new static.Server('./');

var portHttps = process.env.PORT || 443;
var port = process.env.PORT || 8080;
console.log(port);
serverHttps.listen(portHttps);
server.listen(port);
console.log(server);
var webRTC = require('webrtc.io').listen(serverHttps);


function handler (request, response) {
	fileServer.serve(request, response);
	/*request.addListener('end', function () {
        fileServer.serve(request, response);
    });*/
}


/*app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/style.css', function(req, res) {
  res.sendfile(__dirname + '/style.css');
});

app.get('/fullscreen.png', function(req, res) {
  res.sendfile(__dirname + '/fullscreen.png');
});

app.get('/script.js', function(req, res) {
  res.sendfile(__dirname + '/script.js');
});

app.get('/webrtc.io.js', function(req, res) {
  res.sendfile(__dirname + '/webrtc.io.js');
});
app.get('/images/color-picker.png',function(req, res) {
	res.sendfile(__dirname + '/images/color-picker.png');S
});*/


webRTC.rtc.on('connect', function(rtc) {
  //Client connected
  //console.log(rtc);
});

webRTC.rtc.on('send answer', function(rtc) {
  //answer sent
});

webRTC.rtc.on('disconnect', function(rtc) {
  //Client disconnect 
});

webRTC.rtc.on('draw_msg', function(data, socket) {
	var roomList = webRTC.rtc.rooms[data.room] || [];

	for (var i = 0; i < roomList.length; i++) {
		var socketId = roomList[i];

		if(socketId != socket.id) {
			var soc = webRTC.rtc.getSocket(socketId);

			if(soc) {
				soc.send(JSON.stringify({
					"eventName": "receive_draw_msg",
					"data": {
						"x": data.x,
						"y": data.y,
						"drawing": data.drawing,
						"color": data.color,
						"strokeSize": data.strokeSize,
						"id": data.id
					}
				}), function(error) {
					if(error) {
						console.log(error);
					}
				});
			}
		}
	}
});

webRTC.rtc.on('chat_msg', function(data, socket) {
  var roomList = webRTC.rtc.rooms[data.room] || [];

  for (var i = 0; i < roomList.length; i++) {
    var socketId = roomList[i];

    if (socketId !== socket.id) {
      var soc = webRTC.rtc.getSocket(socketId);

      if (soc) {
        soc.send(JSON.stringify({
          "eventName": "receive_chat_msg",
          "data": {
            "messages": data.messages,
            "color": data.color
          }
        }), function(error) {
          if (error) {
            console.log(error);
          }
        });
      }
    }
  }
});