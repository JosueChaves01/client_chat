// ── WebSocket message types ──────────────────────────────────────────────────
export const MSG = {
  ASSIGN_ID:     'assign-id',
  USER_JOINED:   'user-joined',
  EXISTING_USERS:'existing-users',
  USER_LEFT:     'user-left',
  USER_UPDATED:  'user-updated',
  CHAT_MESSAGE:  'chat-message',
  SET_USERNAME:  'set-username',
  OFFER:         'offer',
  ANSWER:        'answer',
  ICE_CANDIDATE: 'ice-candidate',
};

// ── Internal app events (EventBus) ───────────────────────────────────────────
export const APP_EVENTS = {
  PROFILE_UPDATED:       'profile:updated',
  USER_JOINED:           'user:joined',
  USER_LEFT:             'user:left',
  USER_UPDATED:          'user:updated',
  CHAT_MESSAGE_RECEIVED: 'chat:message-received',
  CHAT_MESSAGE_SENT:     'chat:message-sent',
  VOICE_JOINED:          'voice:joined',
  VOICE_LEFT:            'voice:left',
  CHANNEL_CHANGED:       'channel:changed',
};

// ── DOM element IDs ──────────────────────────────────────────────────────────
export const DOM_ID = {
  LOCAL_VIDEO:      'localVideo',
  VIDEO_GRID:       'videoGrid',
  MESSAGES:         'messages',
  MESSAGE_INPUT:    'messageInput',
  USER_PROFILE:     'userProfile',
  USER_NAME:        'userName',
  USER_AVATAR:      'userAvatar',
  PROFILE_MODAL:    'profileModal',
  MODAL_AVATAR:     'modalAvatar',
  NEW_USERNAME:     'newUsername',
  AVATAR_UPLOAD:    'avatarUpload',
  SAVE_PROFILE:     'saveProfile',
  VOICE_STATUS_BAR: 'voice-status-bar',
  TOGGLE_MIC:       'toggle-mic',
  TOGGLE_CAM:       'toggle-cam',
  DISCONNECT_VOICE: 'disconnect-voice',
  GENERAL_VIEW:     'general-view',
  VOICE_VIEW:       'voice-view',
};

// ── CSS class names ──────────────────────────────────────────────────────────
export const CSS_CLASS = {
  CHANNEL_ITEM:         'channel-item',
  ACTIVE:               'active',
  HIDDEN:               'hidden',
  USERS_PANEL:          'users-panel',
  MAIN_VIDEO_CONTAINER: 'main-video-container',
  PARTICIPANTS_GRID:    'participants-grid',
  VIDEO_TILE:           'video-tile',
  VIDEO_INFO:           'video-info',
  AUDIO_INDICATOR:      'audio-indicator',
  USERNAME_LABEL:       'username',
  MAIN_VIDEO:           'main-video',
  USER_LIST:            'user-list',
  USER_ITEM:            'user-item',
  CURRENT_USER:         'current-user',
  USER_AVATAR:          'user-avatar',
  USERS_HEADER:         'users-header',
  CLOSE_MODAL:          'close-modal',
};

// ── Channel names (data-channel values) ─────────────────────────────────────
export const CHANNEL = {
  GENERAL:    'general',
  VOICE_CHAT: 'voice-chat',
};

// ── LocalStorage keys ────────────────────────────────────────────────────────
export const STORAGE_KEY = {
  USER_PROFILE: 'userProfile',
};

// ── Username validation ──────────────────────────────────────────────────────
export const VALIDATION = {
  USERNAME_MIN:     1,
  USERNAME_MAX:     30,
  USERNAME_PATTERN: /^[\w\s\-áéíóúÁÉÍÓÚñÑ]+$/,
};

// ── Avatar service ───────────────────────────────────────────────────────────
export const AVATAR = {
  BASE_URL:      'https://ui-avatars.com/api/',
  DEFAULT_BG:    'C17C54',
  DEFAULT_COLOR: 'fff',
  FALLBACK_BG:   '2D2424',
  FALLBACK_COLOR:'F0E6D2',
};

// ── UI timing (ms) ───────────────────────────────────────────────────────────
export const TIMING = {
  MODAL_TRANSITION_MS: 300,
  FOCUS_DELAY_MS:      100,
};
