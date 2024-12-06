// Importações necessárias do Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';

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
const database = getDatabase(app);
const auth = getAuth();
const firestore = getFirestore(app); // Inicializar Firestore
const db = getFirestore(app);

const bookListSection = document.getElementById('bookList');


function displayAllAds() {
    const allAdsRef = ref(database, 'login-e-register/');
    bookListSection.innerHTML = ''; // Limpa a seção antes de adicionar novos anúncios
    
    

    get(allAdsRef).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((userSnapshot) => {
                const userId = userSnapshot.key; // ID do usuário

                // Referência ao documento do usuário no Firestore
                const userDocRef = doc(db, "users", userId);

                // Buscar os dados do usuário (incluindo a imagem de perfil)
                getDoc(userDocRef).then((userDoc) => {
                    if (userDoc.exists()) {
                        const user = userDoc.data(); // Dados do usuário
                        const profileImageURL = user.img || '../img/user.jpg'; // Usando 'img' para pegar a URL da imagem

                        // Itera sobre os anúncios do usuário
                        userSnapshot.forEach((adSnapshot) => {
                            const ad = adSnapshot.val();
                            const adElement = document.createElement('div');
                            adElement.classList.add('ad-item');

                            let actionButtonHTML = '';

                            // Adiciona o título ao atributo dataset
                            adElement.dataset.title = ad.name.toLowerCase(); // Adiciona o título no dataset

                            // Verifica se o anúncio é do usuário logado
                            onAuthStateChanged(auth, (loggedInUser) => {
                                if (loggedInUser && loggedInUser.uid === userId) {
                                    // Se for o próprio usuário, exibe um link para o próprio perfil
                                    actionButtonHTML = `<a href="perfil.html" class="view-profile-btn">Ver meu perfil</a>`;
                                } else {
                                    // Caso contrário, exibe o botão de contato
                                    actionButtonHTML = `
                                        <button class="contact-btn" id="contactButton" data-uid="${userId}" onclick="contactUser('${userId}')">Enviar mensagem</button>
                                    `;
                                }

                                // Agora insere o HTML do anúncio
                                adElement.innerHTML = `
                                    <img src="${ad.imageURL}" alt="${ad.name}" class="ad-image"/>
                                    <h3>${ad.name}</h3>
                                    <p>Tipo de livro: ${ad.bookType}</p>
                                    <p>${ad.msgContent}</p>
                                    <div class="ad-footer">
                                        ${actionButtonHTML} 
                                        <a href="perfil_anu.html?uid=${userId}">
                                            <img src="${profileImageURL}" alt="Profile" class="profile-image"/>
                                        </a>
                                        <p class="date">${ad.publishedDate}</p>
                                    </div>
                                `;

                                // Adiciona o elemento à página
                                bookListSection.appendChild(adElement);
                            });
                        });
                    } else {
                        console.log('Usuário não encontrado no Firestore.');
                    }
                }).catch((error) => {
                    console.error('Erro ao buscar os dados do usuário:', error);
                });
            });
        } else {
            bookListSection.innerHTML = '<p>Nenhum anúncio encontrado.</p>';
        }
    }).catch((error) => {
        console.error('Erro ao recuperar os anúncios:', error);
    });
}

auth.onAuthStateChanged(user => {
    const loginMessageSection = document.getElementById("loginMessageSection");

    if (user) {
        // Usuário está logado, esconda a mensagem
        loginMessageSection.style.display = "none";

        // Aqui você pode carregar os anúncios, por exemplo
        loadBookList();
    } else {
        // Usuário não está logado, mostra a mensagem de login
        loginMessageSection.style.display = "block";
    }
});



window.contactUser = function (sellerId) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const currentUserId = user.uid;
            const chatId = currentUserId < sellerId
                ? `${currentUserId}_${sellerId}`
                : `${sellerId}_${currentUserId}`;

            const chatRef = doc(firestore, 'chats', chatId);

            getDoc(chatRef).then((docSnapshot) => {
                if (!docSnapshot.exists()) {
                    // Criar um novo chat
                    setDoc(chatRef, {
                        users: [currentUserId, sellerId],
                        createdAt: serverTimestamp()
                    }).then(() => {
                        console.log("Chat criado com sucesso!");

                        // Adicionar chatId ao perfil do usuário autenticado
                        addChatToUser(currentUserId, chatId);
                        // Adicionar chatId ao perfil do vendedor
                        addChatToUser(sellerId, chatId);

                        window.location.href = `../html/chat.html?chatId=${chatId}`;
                    }).catch((error) => {
                        console.error("Erro ao criar o chat:", error);
                    });
                } else {
                    console.log("Chat já existe, redirecionando...");
                    window.location.href = `../html/chat.html?chatId=${chatId}`;
                }
            }).catch((error) => {
                console.error("Erro ao verificar a existência do chat:", error);
            });
        } else {
            alert("Por favor, faça login para iniciar uma conversa.");
        }
    });
};

// Função para adicionar chat ao perfil do usuário
function addChatToUser(userId, chatId) {
    const userRef = doc(firestore, 'users', userId);
    updateDoc(userRef, {
        chats: arrayUnion(chatId)
    }).catch((error) => {
        console.error("Erro ao adicionar chat ao perfil do usuário:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.getElementById("searchBar");
    const clearSearch = document.getElementById("clearSearch");

    function filterAds() {
        const query = searchBar.value.toLowerCase().trim(); // Texto inserido na barra de pesquisa
        const ads = document.querySelectorAll(".ad-item"); // Seleciona todos os anúncios

        ads.forEach((ad) => {
            const title = ad.dataset.title || ""; // Obtém o título do anúncio (verifica o atributo `data-title`)
            ad.style.display = title.includes(query) ? "block" : "none"; // Mostra ou oculta os anúncios
        });

        clearSearch.style.display = query ? "inline" : "none"; // Mostra o botão "Limpar" apenas se houver texto na barra
    }

    // Adiciona evento de entrada para filtrar anúncios em tempo real
    searchBar.addEventListener("input", filterAds);

    // Evento para limpar a pesquisa
    clearSearch.addEventListener("click", () => {
        searchBar.value = ""; // Limpa o campo de pesquisa
        clearSearch.style.display = "none"; // Esconde o botão "Limpar"
        document.querySelectorAll(".ad-item").forEach((ad) => {
            ad.style.display = "block"; // Mostra todos os anúncios novamente
        });
    });
});

// Carregar anúncios ao iniciar a página
displayAllAds();
