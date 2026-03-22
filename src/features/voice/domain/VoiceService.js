import { APP_EVENTS } from '../../../shared/constants.js';
import { EventBus } from '../../../shared/EventBus.js';

/**
 * Manages local media (camera/microphone) for the voice channel.
 * Does NOT handle WebRTC negotiation — that belongs to WebRTCNegotiator.
 */
export class VoiceService {
  constructor(peerManager, localVideoEl) {
    this._peerManager  = peerManager;
    this._localVideoEl = localVideoEl;
    this.isActive      = false;
  }

  async join() {
    if (this.isActive) return;
    this.isActive = true;
    const stream = await this._peerManager.setupLocalStream();
    this._localVideoEl.srcObject = stream;
    EventBus.emit(APP_EVENTS.VOICE_JOINED);
  }

  leave(voiceUI) {
    if (!this.isActive) return;
    this.isActive = false;
    this._peerManager.stopAllTracks();
    this._localVideoEl.srcObject = null;

    const userIds = Array.from(this._peerManager.peerConnections.keys());
    userIds.forEach(userId => {
      this._peerManager.removePeerConnection(userId);
      voiceUI.removeVideoElement(userId);
    });

    EventBus.emit(APP_EVENTS.VOICE_LEFT);
  }

  toggleAudio() { return this._peerManager.toggleAudio(); }
  toggleVideo() { return this._peerManager.toggleVideo(); }
}
