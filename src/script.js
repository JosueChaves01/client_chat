import { VideoConferenceApp } from './VideoConferenceApp.js';

// --- Elementos del DOM y Variables Globales ---
const localVideo = document.getElementById('localVideo');
const messageInput = document.getElementById('messageInput');
const toggleMicButton = document.getElementById('toggle-mic');
const toggleCamButton = document.getElementById('toggle-cam');
const changeNameButton = document.getElementById('change-name');

// --- Inicialización de la Aplicación ---
async function main() {
    try {
        const app = new VideoConferenceApp(localVideo);
        await app.start();

        // Event listener para enviar mensajes de chat
        messageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Evita el salto de línea en el input
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
