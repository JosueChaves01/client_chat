/**
 * @file app.js
 * Application entry point. Wires together all features and infrastructure.
 */

// ── Shared ───────────────────────────────────────────────────────────────────
import { config }      from './shared/config.js';
import { MSG, DOM_ID, APP_EVENTS } from './shared/constants.js';
import { EventBus }    from './shared/EventBus.js';

// ── Infrastructure ───────────────────────────────────────────────────────────
import { userStore }            from './infrastructure/UserStore.js';
import { WebSocketManager }     from './infrastructure/WebSocketManager.js';
import { PeerConnectionManager }from './infrastructure/PeerConnectionManager.js';
import { WebRTCNegotiator }     from './infrastructure/WebRTCNegotiator.js';

// ── Features: Chat ───────────────────────────────────────────────────────────
import { ChatService } from './features/chat/domain/ChatService.js';
import { ChatUI }      from './features/chat/ui/ChatUI.js';

// ── Features: Voice ──────────────────────────────────────────────────────────
import { VoiceService }     from './features/voice/domain/VoiceService.js';
import { VoiceUI }          from './features/voice/ui/VoiceUI.js';
import { VoiceControlsUI }  from './features/voice/ui/VoiceControlsUI.js';

// ── Features: Channels ───────────────────────────────────────────────────────
import { ChannelSwitcherUI } from './features/channels/ui/ChannelSwitcherUI.js';

// ── Features: Profile ────────────────────────────────────────────────────────
import { ProfileService }  from './features/profile/domain/ProfileService.js';
import { ProfileModalUI }  from './features/profile/ui/ProfileModalUI.js';

// ── Features: Users ──────────────────────────────────────────────────────────
import { UserListUI } from './features/users/ui/UserListUI.js';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Instantiate infrastructure
// ═══════════════════════════════════════════════════════════════════════════════

const wsManager   = new WebSocketManager(config.WEBSOCKET_URL);
const peerManager = new PeerConnectionManager();
const negotiator  = new WebRTCNegotiator(peerManager, wsManager);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Instantiate UI and domain services
// ═══════════════════════════════════════════════════════════════════════════════

const localVideo = document.getElementById(DOM_ID.LOCAL_VIDEO);

const voiceUI        = new VoiceUI(userStore);
const voiceControlsUI = new VoiceControlsUI();
const chatUI         = new ChatUI();
const channelSwitcherUI = new ChannelSwitcherUI();
const userListUI     = new UserListUI(userStore);

const chatService    = new ChatService(wsManager, userStore);
const voiceService   = new VoiceService(peerManager, localVideo);
const profileService = new ProfileService(userStore, wsManager);
const profileModal   = new ProfileModalUI(profileService);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Wire negotiator callbacks
// ═══════════════════════════════════════════════════════════════════════════════

negotiator.onTrack((userId, stream) => voiceUI.setVideoStream(userId, stream));

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Helper: refresh user list panel
// ═══════════════════════════════════════════════════════════════════════════════

function refreshUserList() {
  userListUI.setPeerConnections(
    Object.fromEntries(peerManager.peerConnections),
    negotiator._myUserId,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Mount UI components
// ═══════════════════════════════════════════════════════════════════════════════

chatUI.mount();
chatUI.bindSend(text => chatService.sendMessage(text));

userListUI.mount();
profileModal.mount();

voiceControlsUI.mount({
  onToggleMic: () => voiceService.toggleAudio(),
  onToggleCam: () => voiceService.toggleVideo(),
  onDisconnect: () => {
    voiceService.leave(voiceUI);
    voiceControlsUI.hide();
    channelSwitcherUI.activateGeneral();
  },
});

channelSwitcherUI.mount({
  onVoiceJoin: () => {
    if (voiceService.isActive) return;
    voiceService.join()
      .then(() => {
        // Add local tracks to existing peer connections and create video tiles
        for (const userId of peerManager.peerConnections.keys()) {
          voiceUI.createVideoElement(userId);
          negotiator.addLocalTracks(userId);
        }
        voiceControlsUI.show();
      })
      .catch(err => console.error('Error joining voice:', err));
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Register WebSocket message handlers
// ═══════════════════════════════════════════════════════════════════════════════

wsManager.onMessage(MSG.ASSIGN_ID, (msg) => {
  negotiator.setMyUserId(msg.userId);
  userStore.updateUser(msg.userId, msg.username);
  profileService.sendSavedUsername();
  refreshUserList();
});

wsManager.onMessage(MSG.USER_JOINED, (msg) => {
  userStore.updateUser(msg.userId, msg.username);
  if (voiceService.isActive) voiceUI.createVideoElement(msg.userId);
  negotiator.initiateIfNeeded(msg.userId);
  refreshUserList();
  EventBus.emit(APP_EVENTS.USER_JOINED, { userId: msg.userId });
});

wsManager.onMessage(MSG.EXISTING_USERS, (msg) => {
  msg.users.forEach(user => {
    userStore.updateUser(user.userId, user.username);
    if (voiceService.isActive) voiceUI.createVideoElement(user.userId);
    negotiator.initiateIfNeeded(user.userId);
  });
  refreshUserList();
});

wsManager.onMessage(MSG.USER_LEFT, (msg) => {
  userStore.removeUser(msg.userId);
  negotiator.removeUser(msg.userId);
  voiceUI.removeVideoElement(msg.userId);
  refreshUserList();
  EventBus.emit(APP_EVENTS.USER_LEFT, { userId: msg.userId });
});

wsManager.onMessage(MSG.USER_UPDATED, (msg) => {
  userStore.updateUser(msg.userId, msg.username);
  refreshUserList();
  EventBus.emit(APP_EVENTS.USER_UPDATED, { userId: msg.userId });
});

wsManager.onMessage(MSG.CHAT_MESSAGE,  (msg) => chatService.handleIncoming(msg));
wsManager.onMessage(MSG.OFFER,         (msg) => negotiator.handleOffer(msg.fromUserId, msg.offer));
wsManager.onMessage(MSG.ANSWER,        (msg) => negotiator.handleAnswer(msg.fromUserId, msg.answer));
wsManager.onMessage(MSG.ICE_CANDIDATE, (msg) => negotiator.handleIceCandidate(msg.fromUserId, msg.candidate));

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Start
// ═══════════════════════════════════════════════════════════════════════════════

wsManager.connect();
