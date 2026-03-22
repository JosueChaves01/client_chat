import { DOM_ID, CSS_CLASS } from '../../../shared/constants.js';

/**
 * Manages the voice control buttons (mute, cam, disconnect) in the sidebar.
 */
export class VoiceControlsUI {
  constructor() {
    this._statusBar     = document.getElementById(DOM_ID.VOICE_STATUS_BAR);
    this._micBtn        = document.getElementById(DOM_ID.TOGGLE_MIC);
    this._camBtn        = document.getElementById(DOM_ID.TOGGLE_CAM);
    this._disconnectBtn = document.getElementById(DOM_ID.DISCONNECT_VOICE);
  }

  mount({ onToggleMic, onToggleCam, onDisconnect }) {
    this._micBtn.addEventListener('click', () => {
      const enabled = onToggleMic();
      if (enabled === null) return;
      this._micBtn.classList.toggle(CSS_CLASS.ACTIVE, !enabled);
      this._micBtn.title = enabled ? 'Mute' : 'Unmute';
    });

    this._camBtn.addEventListener('click', () => {
      const enabled = onToggleCam();
      if (enabled === null) return;
      this._camBtn.classList.toggle(CSS_CLASS.ACTIVE, !enabled);
      this._camBtn.title = enabled ? 'Cam Off' : 'Cam On';
    });

    this._disconnectBtn.addEventListener('click', onDisconnect);
  }

  show() { this._statusBar.classList.remove(CSS_CLASS.HIDDEN); }
  hide() { this._statusBar.classList.add(CSS_CLASS.HIDDEN); }
}
