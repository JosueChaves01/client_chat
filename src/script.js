import { VideoConferenceApp } from './VideoConferenceApp.js';
import { userManager } from './UserManager.js';

// --- Elementos del DOM ---
const localVideo = document.getElementById('localVideo');
const messageInput = document.getElementById('messageInput');

// Profile elements
const userProfile = document.getElementById('userProfile');
const userNameElement = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const modal = document.getElementById('profileModal');
const closeModal = document.querySelector('.close-modal');
const saveProfileBtn = document.getElementById('saveProfile');
const newUsernameInput = document.getElementById('newUsername');
const avatarUpload = document.getElementById('avatarUpload');
const modalAvatar = document.getElementById('modalAvatar');

// Channel views
const generalView = document.getElementById('general-view');
const voiceView = document.getElementById('voice-view');
const voiceStatusBar = document.getElementById('voice-status-bar');
const channelItems = document.querySelectorAll('.channel-item');

// Voice controls (en el sidebar)
const toggleMicButton = document.getElementById('toggle-mic');
const toggleCamButton = document.getElementById('toggle-cam');
const disconnectButton = document.getElementById('disconnect-voice');

// --- Profile Modal Functions ---
function openModal() {
    newUsernameInput.value = userManager.getCurrentUsername();
    modalAvatar.src = userManager.getCurrentAvatar();
    modal.style.display = 'flex';
    void modal.offsetHeight;
    modal.classList.add('show');
    setTimeout(() => newUsernameInput.focus(), 100);
}

function closeModalHandler() {
    modal.classList.remove('show');
    setTimeout(() => {
        if (!modal.classList.contains('show')) {
            modal.style.display = 'none';
        }
    }, 300);
}

async function saveProfile() {
    const newUsername = newUsernameInput.value.trim();
    if (newUsername) {
        userManager.updateCurrentUser(newUsername);
        updateProfileUI();
        closeModalHandler();
    }
}

function updateProfileUI() {
    userNameElement.textContent = userManager.getCurrentUsername();
    userAvatar.src = userManager.getCurrentAvatar();
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarUrl = e.target.result;
            userManager.updateCurrentUser(null, avatarUrl);
            modalAvatar.src = avatarUrl;
            updateProfileUI();
        };
        reader.readAsDataURL(file);
    }
}

// --- Event Listeners ---
const _listenerController = new AbortController();
const _signal = _listenerController.signal;

document.addEventListener('DOMContentLoaded', () => {
    if (userProfile) {
        userProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal();
        }, { signal: _signal });
    }

    if (closeModal) {
        closeModal.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModalHandler();
        }, { signal: _signal });
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            saveProfile();
        }, { signal: _signal });
    }

    if (avatarUpload) {
        avatarUpload.addEventListener('change', handleAvatarUpload, { signal: _signal });
    }

    if (newUsernameInput) {
        newUsernameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') saveProfile();
        }, { signal: _signal });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModalHandler();
    }, { signal: _signal });
});

// --- Initialize the Application ---
async function main() {
    try {
        updateProfileUI();

        const app = new VideoConferenceApp(localVideo);

        // Conectar WebSocket para el chat de texto (sin cámara aún)
        app.start();

        // --- Chat de texto (#general) ---
        messageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                app.sendChatMessage(messageInput.value);
                messageInput.value = '';
            }
        });


        // --- Channel Switching ---
        channelItems.forEach(item => {
            item.addEventListener('click', () => {
                const channel = item.dataset.channel;

                // Actualizar canal activo
                channelItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                if (channel === 'general') {
                    // Cambio de vista inmediato y sincrónico
                    voiceView.classList.add('hidden');
                    generalView.classList.remove('hidden');
                    // El usuario SIGUE en voz, no llamamos leaveVoice

                } else if (channel === 'voice-chat') {
                    // Cambio de vista inmediato y sincrónico
                    generalView.classList.add('hidden');
                    voiceView.classList.remove('hidden');

                    // Si no está en voz, unirse en background sin bloquear la vista
                    if (!app.voiceActive) {
                        app.joinVoice()
                            .then(() => voiceStatusBar.classList.remove('hidden'))
                            .catch(err => console.error('Error al unirse a la voz:', err));
                    }
                }
            });
        });

        // --- Botón Desconectar ---
        disconnectButton.addEventListener('click', () => {
            channelItems.forEach(i => i.classList.remove('active'));
            document.querySelector('[data-channel="general"]').classList.add('active');
            voiceView.classList.add('hidden');
            generalView.classList.remove('hidden');
            voiceStatusBar.classList.add('hidden');
            app.leaveVoice();
        });

        // --- Controles de micrófono y cámara (sidebar) ---
        toggleMicButton.addEventListener('click', () => {
            const isAudioEnabled = app.toggleAudio();
            if (isAudioEnabled === null) return;
            toggleMicButton.classList.toggle('active', !isAudioEnabled);
            toggleMicButton.title = isAudioEnabled ? 'Mute' : 'Unmute';
        });

        toggleCamButton.addEventListener('click', () => {
            const isVideoEnabled = app.toggleVideo();
            if (isVideoEnabled === null) return;
            toggleCamButton.classList.toggle('active', !isVideoEnabled);
            toggleCamButton.title = isVideoEnabled ? 'Cam Off' : 'Cam On';
        });

    } catch (error) {
        console.error('Fallo al iniciar la aplicación:', error);
    }
}

main().catch(console.error);
