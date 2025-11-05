import { VideoConferenceApp } from './VideoConferenceApp.js';

// --- Elementos del DOM y Variables Globales ---
const localVideo = document.getElementById('localVideo');
const messageInput = document.getElementById('messageInput');

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

    } catch (error) {
        console.error('Fallo al iniciar la aplicación:', error);
    }
}

main().catch(console.error);
