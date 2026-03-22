export class PeerConnectionManager {
    constructor() {
        this.peerConnections = new Map(); // Map of userId -> RTCPeerConnection
        this.localStream = null;
        this.rtcManager = null;
    }

    setRtcManager(rtcManager) {
        this.rtcManager = rtcManager;
    }

    async setupLocalStream() {
        this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (this.rtcManager) this.rtcManager.setLocalStream(this.localStream);
        return this.localStream;
    }

    createPeerConnection(userId) {
        const peerConnection = new RTCPeerConnection();
        this.peerConnections.set(userId, peerConnection);
        return peerConnection;
    }

    removePeerConnection(userId) {
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection) {
            peerConnection.close();
            this.peerConnections.delete(userId);
        }
    }

    /**
     * Activa o desactiva la pista de audio del stream local.
     * @returns {boolean} El nuevo estado de la pista de audio (true si está activa, false si no).
     */
    toggleAudio() {
        if (!this.localStream) {
            console.warn('toggleAudio: no hay stream local disponible.');
            return null;
        }
        const audioTrack = this.localStream.getAudioTracks()[0];
        if (!audioTrack) {
            console.warn('toggleAudio: no se encontró pista de audio.');
            return null;
        }
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
    }

    /**
     * Activa o desactiva la pista de video del stream local.
     * @returns {boolean|null} El nuevo estado de la pista de video, o null si no hay pista disponible.
     */
    toggleVideo() {
        if (!this.localStream) {
            console.warn('toggleVideo: no hay stream local disponible.');
            return null;
        }
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (!videoTrack) {
            console.warn('toggleVideo: no se encontró pista de video.');
            return null;
        }
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
    }
}