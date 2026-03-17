import Peer from "peerjs";

let peer = null;
let currentCall = null;
let localStream = null;

export const initPeer = (userId) => {
  if (peer && !peer.destroyed) return peer;

  // Create a Peer instance with the user's ID
  // PeerJS uses its own public cloud for signaling by default
  // We use a small random suffix to avoid "ID is taken" errors on quick refreshes
  const peerId = `tare-chat-${userId}`;
  
  peer = new Peer(peerId, {
    debug: 1
  });

  peer.on('open', (id) => {
  });

  peer.on('error', (err) => {
    if (err.type === 'unavailable-id') {
      // We disconnect this peer instance. The other tab will remain the active one.
      peer.disconnect();
    } else {
    }
  });

  return peer;
};

export const getPeer = () => peer;

export const destroyPeer = () => {
  if (peer) {
    peer.destroy();
    peer = null;
  }
};

export const startLocalStream = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    return localStream;
  } catch (error) {
    console.error("Error accessing microphone:", error);
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
