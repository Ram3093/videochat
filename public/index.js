const socket=io('/');
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video');
myVideo.muted = true

const myPeer=new Peer(undefined,{
    path: "/peerjs",
    host:'/',
    port:'3000'
})

const users={}

var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
      // view own video 
    addVideoStream(myVideo, stream);
    
    //when user is connected then send our stream to user on his id 
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
      //  console.log(userId)
      })
    
   
  })

// handles all the call from root  
myPeer.on("call", function (call) {
    getUserMedia(
      { video: true, audio: true },
      function (stream) {
        call.answer(stream); // Answer the call with an A/V stream.
        const video = document.createElement("video");
        call.on("stream", function (remoteStream) {
          addVideoStream(video, remoteStream);
        });
      },
      function (err) {
        console.log("Failed to get local stream", err);
      }
    );
  });

//track of all users 
socket.on('user-disconnect',userId=>{
    if(users[userId]){   users[userId].close();    }
})

//on peer on join room
myPeer.on('open',id=>{
    socket.emit('join-room',RoomId,id);
})

// with every call connect to new user with id (provide by peer ) with stream and then call on id
function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
      video.remove()
    })
  
     users[userId] = call
  }
  
// append child to the videogrid
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    videoGrid.append(video)
  }