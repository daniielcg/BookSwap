import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Inicialização do Firebase
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

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

function loadConversations() {
    const conversasList = document.getElementById("conversas-list");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const currentUserId = user.uid;

            const chatsRef = collection(firestore, "chats");
            const q = query(chatsRef, where("users", "array-contains", currentUserId));

            getDocs(q).then((querySnapshot) => {
                if (querySnapshot.empty) {
                    conversasList.innerHTML = "<p>Você não tem conversas ativas.</p>";
                } else {
                    querySnapshot.forEach((chatDoc) => {
                        const chatId = chatDoc.id;
                        const chatData = chatDoc.data();

                        console.log("Dados do chat:", chatData);

                        // Verificar se 'users' existe no chatData e tem pelo menos 1 usuário
                        if (chatData.users && chatData.users.length >= 1) {
                            const otherUserId = chatData.users.find(userId => userId !== currentUserId);

                            if (otherUserId) {
                                console.log("ID do outro usuário:", otherUserId);

                                // Buscar o nome do outro usuário no Firestore
                                const userRef = doc(firestore, "users", otherUserId);
                                getDoc(userRef).then((userDoc) => {
                                    if (userDoc.exists()) {
                                        const otherUserName = userDoc.data().nome;

                                        const listItem = document.createElement("div");
                                        listItem.classList.add("conversa-item");

                                        const link = document.createElement("a");
                                        link.href = `../html/chat.html?chatId=${chatId}`;
                                        link.classList.add("conversa-link");
                                        link.innerHTML = `Conversa com ${otherUserName}`;

                                        const trashIcon = document.createElement("i");
                                        trashIcon.classList.add("fa", "fa-trash", "trash-icon");
                                        trashIcon.setAttribute("data-chat-id", chatId);
                                        trashIcon.addEventListener("click", (event) => {
                                            event.preventDefault();
                                            removeChat(chatId, listItem, currentUserId);
                                        });

                                        listItem.appendChild(link);
                                        listItem.appendChild(trashIcon);
                                        conversasList.appendChild(listItem);
                                    }
                                }).catch((error) => {
                                    console.error("Erro ao buscar usuário:", error);
                                });
                            } else {
                                const listItem = document.createElement("div");
                                listItem.classList.add("conversa-item");

                                const link = document.createElement("a");
                                link.href = `../html/chat.html?chatId=${chatId}`;
                                link.classList.add("conversa-link");
                                link.innerHTML = `Conversa encerrada`;

                                const trashIcon = document.createElement("i");
                                trashIcon.classList.add("fa", "fa-trash", "trash-icon");
                                trashIcon.setAttribute("data-chat-id", chatId);
                                trashIcon.addEventListener("click", (event) => {
                                    event.preventDefault();
                                    removeChat(chatId, listItem, currentUserId);
                                });

                                listItem.appendChild(link);
                                listItem.appendChild(trashIcon);
                                conversasList.appendChild(listItem);
                            }
                        } else {
                            console.error("O campo 'users' contém um número inválido de usuários.");
                        }
                    });
                }
            }).catch((error) => {
                console.error("Erro ao carregar conversas:", error);
            });
        }
    });
}

function removeChat(chatId, listItem, currentUserId) {
    const chatRef = doc(firestore, "chats", chatId);

    getDoc(chatRef).then((chatDoc) => {
        if (chatDoc.exists()) {
            const chatData = chatDoc.data();

            // Remover o usuário atual da conversa
            const updatedUsers = chatData.users.filter(userId => userId !== currentUserId);

            if (updatedUsers.length > 0) {
                // Se ainda restar usuários, só remove o usuário atual
                updateDoc(chatRef, { users: updatedUsers }).then(() => {
                    listItem.remove();
                    sendExitMessage(chatId, 'Saiu da conversa.');
                });
            } else {
                // Se nenhum usuário restar, exclui o chat e as mensagens
                deleteDoc(chatRef).then(() => {
                    listItem.remove();
                    removeMessages(chatId);  // Remover mensagens associadas ao chat
                    sendExitMessage(chatId, 'Saiu da conversa.');
                });
            }
        }
    }).catch((error) => {
        console.error("Erro ao tentar remover o chat:", error);
    });
}

// Função para remover todas as mensagens associadas ao chat
function removeMessages(chatId) {
    const messagesRef = collection(firestore, `chats/${chatId}/messages`);
    getDocs(messagesRef).then((querySnapshot) => {
        querySnapshot.forEach((messageDoc) => {
            deleteDoc(messageDoc.ref);
        });
    }).catch((error) => {
        console.error("Erro ao remover mensagens:", error);
    });
}

function sendExitMessage(chatId, message) {
    const messagesRef = collection(firestore, `chats/${chatId}/messages`);
    addDoc(messagesRef, {
        sender: auth.currentUser.uid,
        text: message,
        createdAt: serverTimestamp()
    });
}

// Inicializar a página de conversas
loadConversations();
