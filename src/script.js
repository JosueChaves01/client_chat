import { VideoConferenceApp } from './VideoConferenceApp.js';
import { userManager } from './UserManager.js';

// --- Elementos del DOM ---
const localVideo = document.getElementById('localVideo');
const messageInput = document.getElementById('messageInput');
const toggleMicButton = document.getElementById('toggle-mic');
const toggleCamButton = document.getElementById('toggle-cam');

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

// --- Profile Modal Functions ---
function openModal() {
    // Set current values in the modal
    newUsernameInput.value = userManager.getCurrentUsername();
    modalAvatar.src = userManager.getCurrentAvatar();
    
    // Show the modal with animation
    modal.style.display = 'flex';
    // Force reflow to ensure the transition works
    void modal.offsetHeight;
    modal.classList.add('show');
    
    // Set focus to the username input
    setTimeout(() => {
        newUsernameInput.focus();
    }, 100);
}

function closeModalHandler() {
    // Hide the modal with animation
    modal.classList.remove('show');
    
    // Wait for the animation to complete before hiding the modal
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

// Handle avatar upload
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
document.addEventListener('DOMContentLoaded', () => {
    // Make sure the elements exist before adding event listeners
    if (userProfile) {
        userProfile.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling up
            openModal();
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModalHandler();
        });
    }
    
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            saveProfile();
        });
    }
    
    if (avatarUpload) {
        avatarUpload.addEventListener('change', handleAvatarUpload);
    }

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModalHandler();
        }
    });
});

// Allow pressing Enter to save the profile
newUsernameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        saveProfile();
    }
});

// --- Initialize the Application ---
async function main() {
    try {
        // Initialize the app with the current user's data
        updateProfileUI();
        
        const app = new VideoConferenceApp(localVideo);
        await app.start();

        // Event listener for sending chat messages
        messageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent new line in input
                app.sendChatMessage(messageInput.value);
                messageInput.value = ''; // Limpia el input
            }
        });

        // Event listener para mutear/desmutear el micrófono
        toggleMicButton.addEventListener('click', () => {
            const isAudioEnabled = app.toggleAudio();
            toggleMicButton.textContent = isAudioEnabled ? 'Mute' : 'Unmute';
            toggleMicButton.classList.toggle('active', !isAudioEnabled);
        });

        // Event listener para apagar/encender la cámara
        toggleCamButton.addEventListener('click', () => {
            const isVideoEnabled = app.toggleVideo();
            toggleCamButton.textContent = isVideoEnabled ? 'Cam Off' : 'Cam On';
            toggleCamButton.classList.toggle('active', !isVideoEnabled);
        });

        // Event listener para cambiar el nombre de usuario
        changeNameButton.addEventListener('click', () => {
            app.promptAndSetUsername();
        });

    } catch (error) {
        console.error('Fallo al iniciar la aplicación:', error);
    }
}

main().catch(console.error);
