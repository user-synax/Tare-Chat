import Peer from "peerjs";

let peer = null;
let currentCall = null;
let localStream = null;

export const initPeer = (userId) => {
  if (peer) return peer;

  // Create a Peer instance with the user's ID
  // PeerJS uses its own public cloud for signaling by default
  peer = new Peer(`tare-chat-${userId}`, {
    debug: 2
  });

  peer.on('open', (id) => {
    console.log('My peer ID is: ' + id);
  });

  peer.on('error', (err) => {
    console.error('Peer error:', err);
  });

  return peer;
};

export const getPeer = () => peer;

export const startLocalStream = async (video = false) => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
    return localStream;
  } catch (error) {
    console.error(`Error accessing media (video: ${video}):`, error);
    throw error;
  }
};

export const callUser = (remoteUserId, stream, onRemoteStream) => {
  if (!peer) return null;
  
  const call = peer.call(`tare-chat-${remoteUserId}`, stream);
  
  call.on('stream', (remoteStream) => {
    if (onRemoteStream) onRemoteStream(remoteStream);
  });

  currentCall = call;
  return call;
};

export const answerCall = (call, stream, onRemoteStream) => {
  call.answer(stream);
  
  call.on('stream', (remoteStream) => {
    if (onRemoteStream) onRemoteStream(remoteStream);
  });

  currentCall = call;
  return call;
};

export const endCurrentCall = () => {
  if (currentCall) {
    currentCall.close();
    currentCall = null;
  }
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
};

export const toggleMute = () => {
  if (localStream) {
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return !audioTrack.enabled; // returns isMuted
    }
  }
  return false;
};

export const toggleCamera = () => {
  if (localStream) {
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return !videoTrack.enabled; // returns isCameraOff
    }
  }
  return false;
};
