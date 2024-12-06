import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAg_fxX0Oqd9kjQqRWEBvABInr30fgUomM",
    authDomain: "login-e-register-b34e7.firebaseapp.com",
    databaseURL: "https://login-e-register-b34e7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "login-e-register-b34e7",
    storageBucket: "login-e-register-b34e7.appspot.com",
    messagingSenderId: "408660648165",
    appId: "1:408660648165:web:d3192dfe1812d84bdbb40c",
    measurementId: "G-SRSCS6VEDV"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

function getChatId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('chatId');
}

// Função para buscar o nome do usuário
async function getUserName(uid) {
    const userDocRef = doc(firestore, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        return userDoc.data().nome; // Supondo que o campo 'nome' exista na coleção 'users'
    } else {
        console.error('Usuário não encontrado');
        return 'Usuário desconhecido';
    }
}

function loadMessages(chatId) {
    const messagesRef = collection(firestore, `chats/${chatId}/messages`);
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));
    const renderedMessages = new Map();

    onSnapshot(messagesQuery, async (snapshot) => {
        const chatMessages = document.getElementById('chat-messages');
        snapshot.docChanges().forEach(async (change) => {
            const messageData = change.doc.data();
            const messageId = change.doc.id;

            if (change.type === 'added') {
                if (!renderedMessages.has(messageId)) {

                    // Obter o nome do remetente
                    const senderName = await getUserName(messageData.sender);
                    
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('message');
                    messageElement.setAttribute('data-id', messageId);

                    if (messageData.sender === auth.currentUser.uid) {
                        messageElement.classList.add('sender');
                    } else {
                        messageElement.classList.add('receiver');
                    }

                    messageElement.innerHTML = `
                        <div class="message-header">
                            <strong>${senderName}</strong>
                        </div>
                        <div class="message-body">
                            <span>${messageData.text}</span>
                        </div>
                        <div class="message-footer">
                            <small>${messageData.createdAt ? new Date(messageData.createdAt.seconds * 1000).toLocaleString() : 'Enviando...'}</small>
                        </div>
                    `;

                    chatMessages.appendChild(messageElement);
                    renderedMessages.set(messageId, messageElement);

                    // Scroll para a última mensagem
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            }

            // Atualizar "Enviando..." para timestamp real quando o campo createdAt for atualizado
            if (change.type === 'modified' && messageData.createdAt) {
                const messageElement = renderedMessages.get(messageId);
                if (messageElement) {
                    messageElement.querySelector('.message-footer small').innerText = `${new Date(messageData.createdAt.seconds * 1000).toLocaleString()}`;
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const chatId = getChatId();
    loadMessages(chatId);
});

document.getElementById('send-button').addEventListener('click', () => {
    sendMessage();
});

document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});

function sendMessage() {
    const chatId = getChatId();
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value;

    if (messageText.trim()) {
        const messagesRef = collection(firestore, `chats/${chatId}/messages`);
        addDoc(messagesRef, {
            sender: auth.currentUser.uid,
            text: messageText,
            createdAt: serverTimestamp()
        })
        .then(() => {
            messageInput.value = '';
        })
        
    }
}
