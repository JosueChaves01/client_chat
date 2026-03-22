import { logger } from '../shared/logger.js';

/**
 * Manages RTCPeerConnection instances and the local media stream.
 */
export class PeerConnectionManager {
  constructor() {
    this.peerConnections = new Map(); // userId → RTCPeerConnection
    this.localStream     = null;
  }

  async setupLocalStream() {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    return this.localStream;
  }

  stopAllTracks() {
    if (!this.localStream) return;
    this.localStream.getTracks().forEach(t => t.stop());
    this.localStream = null;
  }

  createPeerConnection(userId) {
    const pc = new RTCPeerConnection();
    this.peerConnections.set(userId, pc);
    return pc;
  }

  removePeerConnection(userId) {
    const pc = this.peerConnections.get(userId);
    if (pc) { pc.close(); this.peerConnections.delete(userId); }
  }

  closeAll() {
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
  }

  toggleAudio() {
    if (!this.localStream) { logger.warn('toggleAudio: no local stream.'); return null; }
    const track = this.localStream.getAudioTracks()[0];
    if (!track) { logger.warn('toggleAudio: no audio track.'); return null; }
    track.enabled = !track.enabled;
    return track.enabled;
  }

  toggleVideo() {
    if (!this.localStream) { logger.warn('toggleVideo: no local stream.'); return null; }
    const track = this.localStream.getVideoTracks()[0];
    if (!track) { logger.warn('toggleVideo: no video track.'); return null; }
    track.enabled = !track.enabled;
    return track.enabled;
  }
}
