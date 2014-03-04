//TODO: send clear message to server

var videos = [];
var context;
var currentEffect;
var color = '#000000';
var strokeSize = 5;
var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection;
$("#videoFrame").draggable();
if (window.location.protocol != "https:")
    window.location.href = "https:" + window.location.href.substring(window.location.protocol.length, window.location.href.lastIndexOf(":"));
//alert(window.innerWidth + "   " + window.innerHeight);
  var button = document.getElementById("chatbutton");
  button.addEventListener('click', function(event) {
	   (messageContainer.style.height == '0px' || messageContainer.style.height == '' )
        ? messageContainer.style.cssText = 'height:400px;display:block'
        : messageContainer.style.cssText = 'height:0px;display:none';
		//(messages.style.display == 'none') ? messages.style.display = 'block' : messages.style.display = 'none';
  },false);

function getNumPerRow() {
  var len = videos.length;
  var biggest;

  // Ensure length is even for better division.
  if(len % 2 === 1) {
    len++;
  }

  biggest = Math.ceil(Math.sqrt(len));
  while(len % biggest !== 0) {
    biggest++;
  }
  return biggest;
}

function subdivideVideos() {
  var perRow = getNumPerRow();
  var numInRow = 0;
  for(var i = 0, len = videos.length; i < len; i++) {
    var video = videos[i];
    setWH(video, i);
    numInRow = (numInRow + 1) % perRow;
  }
}

function setWH(video, i) {
  var perRow = getNumPerRow();
  var perColumn = Math.ceil(videos.length / perRow);
  var width = //Math.floor((window.innerWidth) / perRow);
  			Math.floor(1000 / perRow);
  var height = //Math.floor((window.innerHeight - 190) / perColumn);
  			Math.floor(500 / perColumn);
  video.width = width;
  video.height = height;
  video.style.position = "relative";
  video.style.left = (i % perRow) * width + "px";
  video.style.top = Math.floor(i / perRow) * height + "px";
}

function addVideo(socketId) {
  var videoFrame = document.createElement("div");
  videoFrame.id = "videoFrame";
  //videoFrame.className = "ui-draggable";
  $(videoFrame).draggable();
  var muteImg = document.createElement("img");
  muteImg.src = "images/NotMuted.png";
  muteImg.id = "notMuted";
  var video = document.createElement("video");
  //video.className = "flip";
  video.id = "remote" + socketId;
  video.setAttribute("autoplay",true);
  videoFrame.appendChild(muteImg);
  videoFrame.appendChild(video);
  document.getElementById('videos').appendChild(videoFrame);
  videos.push(video);
  return video;
}
function createVideoFrame() {
	
}

function removeVideo(socketId) {
  var video = document.getElementById('remote' + socketId);
  if(video) {
    videos.splice(videos.indexOf(video), 1);
    video.parentNode.removeChild(video);
  }
}

function addToChat(msg, color) {
  var messages = document.getElementById('messages');
  msg = sanitize(msg);
  if(color) {
    msg = '<span style="color: ' + color + '; padding-left: 15px">' + msg + '</span>';
  } else {
    msg = '<strong style="padding-left: 15px">' + msg + '</strong>';
  }
  messages.innerHTML = messages.innerHTML + msg + '<br>';
  messages.scrollTop = 10000;
}

function sanitize(msg) {
  return msg.replace(/</g, '&lt;');
}

function initTools() {
	var button = document.getElementById("toolsButton");
	button.addEventListener('click', function(event) {
		(toolsContainer.style.height == '0px' || toolsContainer.style.height == '' )
			? toolsContainer.style.cssText = 'height:300px;display:block'
			: toolsContainer.style.cssText = 'height:0px;display:none';
	});
	var imageObj = new Image();
	imageObj.src = 'images/color-picker.png';
	var padding = 0;
	var colorcanvas = document.getElementById('colorPalette');
	var colorcanvasCtx = colorcanvas.getContext('2d');
	var colorCanvasOffset = {};
	colorCanvasOffset.left = document.getElementById('colorPalette').offsetLeft;
	colorCanvasOffset.top = document.getElementById('colorPalette').offsetTop;
	var colorcoord = {};
	imageObj.onload = function() {
		colorcanvasCtx.drawImage(imageObj, padding, padding);
    };
	colorcanvas.addEventListener('mousedown', function(event) {
		colorcoord.x = event.pageX - colorCanvasOffset.left;
		colorcoord.y = event.pageY - colorCanvasOffset.top;
		strokeSize = 1;
		// color picker image is 256x256 and is offset by 0px
		var imageData = colorcanvasCtx.getImageData(padding, padding, imageObj.width, imageObj.width);
		var data = imageData.data;
		var x = colorcoord.x;
		var y = colorcoord.y;
		var red = data[((imageObj.width * y) + x) * 4];
		var green = data[((imageObj.width * y) + x) * 4 + 1];
		var blue = data[((imageObj.width * y) + x) * 4 + 2];
		color = 'rgb(' + red + ',' + green + ',' + blue + ')';
		//alert(color);
	});
}
/* SSL KEY GEN
openssl genrsa -out privatekey.pem 1024 
openssl req -new -key privatekey.pem -out certrequest.csr 
openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
*/
function initScreenShare() {
	navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia;
	var button = document.getElementById("screenShare");
	button.addEventListener('click', function(event) {
		 navigator.getUserMedia({
			audio: false,
			video: {
			   mandatory: {
				   chromeMediaSource: 'screen',
				   maxWidth: 1280,
				   maxHeight: 720
			   },
			   optional: []
			}
		}, function(stream) {
		   document.getElementById('ss').src = window.URL.createObjectURL(stream);;
		 }, function() {
		   //Error, no stream provided
		   alert("failed to screen share");
		 }
		)
	})
}
function initFullScreen() {
  var button = document.getElementById("fullscreen");
  button.addEventListener('click', function(event) {
    var elem = document.getElementById("fs");
    //show full screen
    elem.webkitRequestFullScreen();
  });
}

function initNewRoom() {
  var button = document.getElementById("newRoom");

  button.addEventListener('click', function(event) {

    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';
    for(var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }

    window.location.hash = randomstring;
    location.reload();
  })
}

var websocketDraw = {
  send: function(message) {
    rtc._socket.send(message);
  },
  recv: function(message) {
    return message;
  },
  event: 'receive_draw_msg'
};
var websocketChat = {
  send: function(message) {
    rtc._socket.send(message);
  },
  recv: function(message) {
    return message;
  },
  event: 'receive_chat_msg'
};

var dataChannelChat = {
  send: function(message) {
    for(var connection in rtc.dataChannels) {
      var channel = rtc.dataChannels[connection];
      channel.send(message);
    }
  },
  recv: function(channel, message) {
    return JSON.parse(message).data;
  },
  event: 'data stream data'
};
function initDraw() {
	var draw;
	
	console.log('initializing websocket draw');
	draw = websocketDraw;
	
	var room = window.location.hash.slice(1);
	// Generate unique ID
	var id = Math.round(Date()*Math.random());
	var canvas = document.getElementById("canvas");
	var canvasCtx = canvas.getContext("2d");
	var canvasOffset = {};
	canvasOffset.left = document.getElementById("drawboard").offsetLeft;
	canvasOffset.top = document.getElementById("drawboard").offsetTop;
	var drawing = false;
	//var cursors = {}; TODO: implement user cursors?
	var prev = {};
	var clients = {};
	var strokeSize = 5;
	var button = document.getElementById("clearcanvas");
  	button.addEventListener('click', function(event) {
		canvas.width = canvas.width;
	},false);
	canvas.addEventListener('mousedown',function(event) {
		event.preventDefault();
		drawing = true;
		prev.x = event.pageX - canvasOffset.left;
		prev.y = event.pageY - canvasOffset.top;
	}, false);
	canvas.addEventListener('mouseleave',function() {
		drawing = false;
	}, false);
	document.addEventListener('mouseup',function() {
		drawing = false;
	}, false);
	// wont draw on canvas unless u move mouse at least a little
	canvas.addEventListener('mousemove', function(event) {
		draw.send(JSON.stringify( {
			"eventName": "draw_msg",
			"data": {
				"x": event.pageX - canvasOffset.left,
				"y": event.pageY - canvasOffset.top,
				"drawing": drawing,
				"color": color,
				"strokeSize": strokeSize,
				"id": id,
				"room": room
			}
		}));
		if(drawing) {
			drawLine(prev.x, prev.y, event.pageX - canvasOffset.left, event.pageY - canvasOffset.top, strokeSize, color);
			
			prev.x = event.pageX - canvasOffset.left;
			prev.y = event.pageY - canvasOffset.top;	
		}
	}, false);
	function drawLine(fromx, fromy, tox, toy, strokeSizeIn, colorIn) {
		canvasCtx.beginPath();
		canvasCtx.moveTo(fromx, fromy);
		canvasCtx.lineTo(tox, toy);
		canvasCtx.strokeStyle = colorIn;
		canvasCtx.lineWidth = strokeSizeIn;
		canvasCtx.stroke();
		canvasCtx.closePath();
	}
	rtc.on(draw.event, function() {
		var drawData = draw.recv.apply(this, arguments);
		if(drawData.drawing && clients[drawData.id]) {
			// draw on canvas. clients[drawData.id] holds prev position of user's mouse pointer
			drawLine(clients[drawData.id].x, clients[drawData.id].y, drawData.x, drawData.y, drawData.strokeSize, drawData.color);
		}
		clients[drawData.id] = drawData;
	}, false);
}

function initChat() {
  var chat;

  if(rtc.dataChannelSupport) {
    console.log('initializing data channel chat');
    chat = dataChannelChat;
  } else {
    console.log('initializing websocket chat');
    chat = websocketChat;
  }

  var input = document.getElementById("chatinput");
  var room = window.location.hash.slice(1);
  var color = "#" + ((1 << 24) * Math.random() | 0).toString(16);

  input.addEventListener('keydown', function(event) {
    var key = event.which || event.keyCode;
    if(key === 13) {
      chat.send(JSON.stringify({
        "eventName": "chat_msg",
        "data": {
          "messages": input.value,
          "room": room,
          "color": color
        }
      }));
      addToChat(input.value);
      input.value = "";
    }
  }, false);
  rtc.on(chat.event, function() {
    var data = chat.recv.apply(this, arguments);
    console.log(data.color);
    addToChat(data.messages, data.color.toString(16));
  });
}


function init() {
  if(PeerConnection) {
    rtc.createStream({
      "video": true,
      "audio": true
    }, function(stream) {
		window.AudioContext = window.AudioContext||window.webkitAudioContext;
		audioContext = new AudioContext();
		var mediaStreamSource = audioContext.createMediaStreamSource( stream );
		// Connect it to the destination to hear yourself (or any other node for processing!)
   		mediaStreamSource.connect( audioContext.destination );
      //	mediaStreamSource.connect();
		
		document.getElementById('you').src = URL.createObjectURL(stream);
      	videos.push(document.getElementById('you'));
      	//rtc.attachStream(stream, 'you');
      	subdivideVideos();
    });
  } else {
    alert('Your browser is not supported or you have to turn on flags. In chrome you go to chrome://flags and turn on Enable PeerConnection remember to restart chrome');
  }


  var room = window.location.hash.slice(1);
  //alert(room)
//alert( window.location.href.substring(window.location.protocol.length).split('#')[0]);
  rtc.connect("wss:" + window.location.href.substring(window.location.protocol.length).split('#')[0], room);
  //alert("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], room);
	//rtc.connect("ws://localhost:8080")
  rtc.on('add remote stream', function(stream, socketId) {
    console.log("ADDING REMOTE STREAM...");
    var clone = addVideo(socketId);
    document.getElementById(clone.id).setAttribute("class", "");	
    rtc.attachStream(stream, clone.id);
	document.getElementById(clone.id).addEventListener("click", function() {
		stream.getAudioTracks()[0].enabled = !(stream.getAudioTracks()[0].enabled);
		/*if(stream.getAudioTracks()[0].enabled) {
			document.getElementById(clone.id).setAttribute("poster", "images/NotMuted.png");
		} else {
			document.getElementById(clone.id).setAttribute("poster", "images/Muted.png");
		}*/
	});
	videos.push(document.getElementById(clone.id));
    subdivideVideos();
  });
  rtc.on('disconnect stream', function(data) {
    console.log('remove ' + data);
    removeVideo(data);
  });
  initFullScreen();
  initNewRoom();
  initTools();
  initChat();
  initDraw();
  initScreenShare();
}

window.onresize = function(event) {
  subdivideVideos();
};