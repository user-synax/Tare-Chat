/**
 * WebRTC Utility for P2P Voice Chat
 */

const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

let peerConnection = null;
let localStream = null;

export const startLocalStream = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    return localStream;
  } catch (error) {
    console.error("Error accessing microphone:", error);
    throw error;
  }
};

export const createPeerConnection = (socket, to, onTrack) => {
  if (peerConnection) {
    peerConnection.close();
  }

  peerConnection = new RTCPeerConnection(configuration);

  // Add local tracks to peer connection
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });
  }

  // Handle incoming tracks
  peerConnection.ontrack = (event) => {
    if (onTrack) onTrack(event.streams[0]);
  };

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("webrtc_ice_candidate", {
        candidate: event.candidate,
        to,
      });
    }
  };

  return peerConnection;
};

export const createOffer = async (socket, to) => {
  if (!peerConnection) return;
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  return offer;
};

export const createAnswer = async (socket, to, offer) => {
  if (!peerConnection) return;
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("webrtc_answer", {
    answer,
    to,
  });
  return answer;
};

export const handleAnswer = async (answer) => {
  if (!peerConnection) return;
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
};

export const handleIceCandidate = async (candidate) => {
  if (!peerConnection) return;
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error("Error adding ice candidate:", error);
  }
};

export const endCall = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }
};

export const toggleMute = () => {
  if (localStream) {
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return !audioTrack.enabled; // Returns isMuted
    }
  }
  return false;
};
