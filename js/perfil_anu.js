import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';

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

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const database = getDatabase(app); // Inicializa Realtime Database
const auth = getAuth(app); // Inicializa Firebase Authentication

// Obtém o UID da URL
function getUidFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('uid'); // Retorna o UID do usuário da URL
}

// Função para carregar anúncios do usuário
function displayUserAds() {
    const userId = getUidFromUrl(); // Captura o UID do usuário

    if (!userId) {
        document.getElementById('bookListSection').innerHTML = '<p>Usuário não especificado.</p>';
        return;
    }

    const userAdsRef = ref(database, `login-e-register/${userId}`); // Referência ao usuário específico
    document.getElementById('bookListSection').innerHTML = ''; // Limpa a seção antes de adicionar os anúncios

    get(userAdsRef).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((adSnapshot) => {
                const ad = adSnapshot.val();
                const adElement = document.createElement('div');
                adElement.classList.add('ad-item');

                let actionButtonHTML = '';

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

                    // Agora, recupere a URL da imagem de perfil do banco de dados do Firestore
                    const userRef = doc(db, "users", userId);
                    getDoc(userRef).then((userSnapshot) => {
                        if (userSnapshot.exists()) {
                            const userData = userSnapshot.data();
                            // Pegue a URL da imagem de perfil, se houver; caso contrário, use uma imagem padrão
                            const profileImageURL = userData.img || '../img/user.jpg'; 

                            // Agora insere o HTML do anúncio
                            adElement.innerHTML = `
                                <img src="${ad.imageURL}" alt="${ad.name}" class="ad-image"/>
                                <h3>${ad.name}</h3>
                                <p>Tipo de livro: ${ad.bookType}</p>
                                <p>${ad.msgContent}</p>
                                <div class="ad-footer">
                                    <a href="perfil_anu.html?uid=${userId}">
                                        <img src="${profileImageURL}" alt="Profile" class="profile-image"/>
                                    </a>
                                    <p class="date">${ad.publishedDate}</p>
                                </div>
                            `;

                            // Adiciona o elemento à página
                            document.getElementById('bookListSection').appendChild(adElement);
                        } 
                    })
                });
            });
        } else {
            document.getElementById('bookListSection').innerHTML = '<p>Este usuário ainda não publicou nenhum anúncio.</p>';
        }
    }).catch((error) => {
        console.error('Erro ao carregar anúncios do usuário:', error);
    });
}// Função para carregar o perfil do usuário
function loadUserProfile() {
    const uid = getUidFromUrl(); // Obtém o UID

    if (!uid) {
        return;
    }

    const userRef = doc(db, "users", uid); // Referência ao Firestore

    getDoc(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.data();

            // Exibe os dados do usuário, se disponíveis
            if (userData) {
                // Defina valores padrão caso os campos não existam
                document.getElementById('userName').innerText = userData.nome || 'Nome não definido';
                document.getElementById('morada-text').innerText = userData.morada || '----------';
                document.getElementById('bio-text').innerText = userData.bio || '----------';
                document.getElementById('dataCriacao').innerText = userData.dataCriacao || 'Data de criação não disponível';
            }
        } else {
            console.error('Usuário não encontrado no Firestore');
        }
    }).catch((error) => {
        console.error('Erro ao carregar dados do perfil:', error);
    });
}

// Chama as funções ao carregar a página
window.onload = () => {
    loadUserProfile();
    displayUserAds();
};
