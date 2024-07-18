let userName;
let myVideoStream;
let videoEnabled = true;
let audioEnabled = true;

function joinRoom() {
  userName = document.getElementById('username').value;
  if (userName.trim() !== '') {
    document.getElementById('name-prompt').style.display = 'none';
    document.getElementById('video-grid').style.display = 'block';
    document.getElementById('controls').style.display = 'block';
    initializeSocket();
  } else {
    alert('Please enter your name.');
  }
}

function initializeSocket() {
  const socket = io('/');
  const videoGrid = document.getElementById('video-grid');
  const myVideo = document.createElement('video');
  myVideo.muted = true;

  var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '5050',
  });

  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
    .then((stream) => {
      myVideoStream = stream;
      addVideoStream(myVideo, stream);

      peer.on('call', (call) => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', (userVideoStream) => {
          addVideoStream(video, userVideoStream);
        });
      });

      socket.on('user-connected', (userId, userName) => {
        connectToNewUser(userId, stream);
        alert(`${userName} has joined the room`);
      });
    });

  peer.on('open', (id) => {
    const roomId = location.pathname.split('/')[1];
    socket.emit('join-room', roomId, id, userName);
    generateInviteLink(roomId);
  });

  const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
  };

  const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
      videoGrid.append(video);
    });
  };
}

function toggleVideo() {
  videoEnabled = !videoEnabled;
  myVideoStream.getVideoTracks()[0].enabled = videoEnabled;
  alert(`Camera ${videoEnabled ? 'enabled' : 'disabled'}`);
}

function toggleAudio() {
  audioEnabled = !audioEnabled;
  myVideoStream.getAudioTracks()[0].enabled = audioEnabled;
  alert(`Microphone ${audioEnabled ? 'enabled' : 'disabled'}`);
}

function invitePeople() {
  const inviteLink = document.getElementById('invite-link');
  inviteLink.style.display = 'block';
  inviteLink.select();
  document.execCommand('copy');
  alert('Invite link copied to clipboard!');
}

function generateInviteLink(roomId) {
  const inviteLink = document.getElementById('invite-link');
  inviteLink.value = `${window.location.origin}/${roomId}`;
}
