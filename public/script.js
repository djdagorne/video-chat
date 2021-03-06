const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
  secure: true,
  host: 'peerjs-server.herokuapp.com',
  port: '443',
});
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then(stream => {
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
      })
    })

    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream);
    })
  })

myPeer.on('open', USER_ID => {
  socket.emit('join-room', ROOM_ID, USER_ID);
})

socket.on('user-connected', userId => {
  
});

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
})

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  //take stream from other user, make it an element on page.
  peers[userId] = call;
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  })
}