import { CSS_CLASS } from '../../../shared/constants.js';

/**
 * Manages video tile elements inside the voice-chat view.
 */
export class VoiceUI {
  constructor(userStore) {
    this._userStore      = userStore;
    this._mainContainer  = document.querySelector(`.${CSS_CLASS.MAIN_VIDEO_CONTAINER}`);
  }

  _getGrid() {
    return this._mainContainer.querySelector(`.${CSS_CLASS.PARTICIPANTS_GRID}`);
  }

  _ensureGrid() {
    let grid = this._getGrid();
    if (!grid) {
      grid = document.createElement('div');
      grid.className = CSS_CLASS.PARTICIPANTS_GRID;
      this._mainContainer.appendChild(grid);
    }
    return grid;
  }

  /**
   * Creates and appends a video tile for a remote peer.
   * @returns {HTMLVideoElement}
   */
  createVideoElement(userId) {
    if (document.getElementById(`video-${userId}`)) {
      return document.getElementById(`video-${userId}`);
    }

    const username = this._userStore.getUsername(userId) || `User ${userId.slice(0, 6)}`;

    const video = document.createElement('video');
    video.id         = `video-${userId}`;
    video.autoplay   = true;
    video.playsInline = true;
    video.muted      = true;

    const indicator = document.createElement('div');
    indicator.className = CSS_CLASS.AUDIO_INDICATOR;

    const nameSpan = document.createElement('span');
    nameSpan.className   = CSS_CLASS.USERNAME_LABEL;
    nameSpan.textContent = username;

    const info = document.createElement('div');
    info.className = CSS_CLASS.VIDEO_INFO;
    info.appendChild(indicator);
    info.appendChild(nameSpan);

    const tile = document.createElement('div');
    tile.className = CSS_CLASS.VIDEO_TILE;
    tile.id        = `video-container-${userId}`;
    tile.appendChild(video);
    tile.appendChild(info);

    this._ensureGrid().appendChild(tile);
    return video;
  }

  /**
   * Attaches a MediaStream to the video element for a peer.
   */
  setVideoStream(userId, stream) {
    const video = document.getElementById(`video-${userId}`);
    if (!video) return;
    if (video.srcObject !== stream) {
      video.srcObject = stream;
      video.play().catch(() => {});
    }
  }

  /**
   * Removes the video tile for a peer.
   */
  removeVideoElement(userId) {
    const tile = document.getElementById(`video-container-${userId}`);
    if (tile) tile.remove();
  }
}
