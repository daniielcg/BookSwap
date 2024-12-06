// Configuração do Firebase (já configurada no seu projeto)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
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

// Função para carregar todas as conversas do usuário
function loadConversations() {
    const conversasList = document.getElementById("conversas-list");

    // Verifica se o usuário está autenticado
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const currentUserId = user.uid;

            // Consulta os chats em que o usuário está envolvido
            const chatsRef = collection(firestore, "chats");
            const q = query(chatsRef, where("users", "array-contains", currentUserId));

            getDocs(q).then((querySnapshot) => {
                if (querySnapshot.empty) {
                    conversasList.innerHTML = "<p>Você não tem conversas ativas.</p>";
                } else {
                    querySnapshot.forEach((chatDoc) => {
                        const chatId = chatDoc.id;
                        const chatData = chatDoc.data();
                        const otherUserId = chatData.users.find(userId => userId !== currentUserId);

                        // Buscar o nome do outro usuário
                        const userRef = doc(firestore, "users", otherUserId);  // Correção aqui
                        getDoc(userRef).then((userDoc) => {
                            if (userDoc.exists()) {
                                const otherUserName = userDoc.data().nome; // Supondo que o campo do nome no Firestore seja 'nome'

                                // Criar um link para a conversa
                                const link = document.createElement("a");
                                link.href = `../html/chat.html?chatId=${chatId}`;
                                link.classList.add("conversa-link");
                                link.innerHTML = `Conversa com ${otherUserName}`;

                                // Adiciona o link na lista de conversas
                                const listItem = document.createElement("div");
                                listItem.classList.add("conversa-item");
                                listItem.appendChild(link);
                                conversasList.appendChild(listItem);
                            } 
                        })
                    });
                }
            })
        } 
    });
}

// Inicializar a página de conversas
loadConversations();
