import { MSG } from '../shared/constants.js';
import { logger } from '../shared/logger.js';

/**
 * Handles the WebRTC signaling protocol: offer/answer/ICE exchange.
 * Depends only on PeerConnectionManager and WebSocketManager.
 */
export class WebRTCNegotiator {
  constructor(peerManager, wsManager) {
    this._peerManager      = peerManager;
    this._wsManager        = wsManager;
    this._iceCandidateQueue = new Map();
    this._myUserId         = null;
    this._onTrackCallback  = null;
  }

  setMyUserId(id) { this._myUserId = id; }

  /** Called when a remote track arrives. Callback: (userId, stream) => void */
  onTrack(cb) { this._onTrackCallback = cb; }

  // ── Peer connection lifecycle ──────────────────────────────────────────────

  getOrCreate(userId) {
    let pc = this._peerManager.peerConnections.get(userId);
    if (!pc) {
      pc = this._peerManager.createPeerConnection(userId);
      this._setupHandlers(pc, userId);
    }
    return pc;
  }

  /**
   * Initiates an offer to a peer (if our ID is "smaller" to avoid glare).
   * Creates the peer connection if it doesn't exist yet.
   */
  async initiateIfNeeded(userId) {
    const pc = this.getOrCreate(userId);

    // Glare prevention: only the peer with the lexicographically smaller ID sends the offer.
    if (this._myUserId > userId) {
      logger.log(`Waiting for offer from ${userId} (their ID is smaller).`);
      return;
    }

    const stream = this._peerManager.localStream;
    if (stream) stream.getTracks().forEach(t => pc.addTrack(t, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this._wsManager.send({ type: MSG.OFFER, userId, offer });
    logger.log(`Offer sent to ${userId}.`);
  }

  /** Adds local tracks to an already-existing peer connection (used when joining voice late). */
  addLocalTracks(userId) {
    const pc     = this._peerManager.peerConnections.get(userId);
    const stream = this._peerManager.localStream;
    if (!pc || !stream) return;
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
  }

  // ── Incoming signaling handlers ────────────────────────────────────────────

  async handleOffer(userId, offer) {
    const pc     = this.getOrCreate(userId);
    const stream = this._peerManager.localStream;
    if (stream) stream.getTracks().forEach(t => pc.addTrack(t, stream));

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await this._flushIceQueue(userId, pc);
    this._wsManager.send({ type: MSG.ANSWER, userId, answer });
    logger.log(`Answer sent to ${userId}.`);
  }

  async handleAnswer(userId, answer) {
    const pc = this._peerManager.peerConnections.get(userId);
    if (!pc || pc.signalingState !== 'have-local-offer') {
      logger.warn(`Unexpected answer from ${userId}, state: ${pc?.signalingState}`);
      return;
    }
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
    await this._flushIceQueue(userId, pc);
    logger.log(`Answer accepted from ${userId}.`);
  }

  async handleIceCandidate(userId, candidate) {
    const pc = this._peerManager.peerConnections.get(userId);
    if (!pc || !pc.remoteDescription?.type) {
      if (!this._iceCandidateQueue.has(userId)) this._iceCandidateQueue.set(userId, []);
      this._iceCandidateQueue.get(userId).push(candidate);
      return;
    }
    try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
    catch (e) { logger.error(`ICE error for ${userId}:`, e); }
  }

  removeUser(userId) {
    this._peerManager.removePeerConnection(userId);
    this._iceCandidateQueue.delete(userId);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  async _flushIceQueue(userId, pc) {
    const queue = this._iceCandidateQueue.get(userId);
    if (!queue) return;
    for (const c of queue) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); }
      catch (e) { logger.error(`Queued ICE error for ${userId}:`, e); }
    }
    this._iceCandidateQueue.delete(userId);
  }

  _setupHandlers(pc, userId) {
    pc.ontrack = (event) => {
      logger.log(`Track received from ${userId}.`);
      if (this._onTrackCallback) this._onTrackCallback(userId, event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this._wsManager.send({ type: MSG.ICE_CANDIDATE, userId, candidate: event.candidate });
      }
    };
  }
}
