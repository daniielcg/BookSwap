import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
import { getStorage, ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js';
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

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// Carregar a imagem de perfil ao carregar a página
window.addEventListener('load', function () {
    // Verificar se o utilizador está autenticado
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Referência ao documento do utilizador no Firestore
            const userDocRef = doc(db, "users", user.uid);
            getDoc(userDocRef)
                .then((docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const userData = docSnapshot.data();
                        const profileImage = document.getElementById('profileImage');

                        // Verificar se existe uma URL de imagem guardada no Firestore
                        if (userData.img) {
                           
                            
                            // Se a imagem for do Firebase Storage, buscar a URL de download
                            if (userData.img.includes("firebase")) {
                                const imageRef = ref(storage, userData.img);
                                getDownloadURL(imageRef)
                                    .then((url) => {
                                        // Atualizar o src da imagem para a URL do Firebase Storage
                                        profileImage.src = url;
                                        profileImage.style.display = 'block'; // Tornar a imagem visível
                                       
                                    })
                                    
                            } else {
                                // Caso a imagem não seja do Firebase Storage, usar a URL diretamente
                                profileImage.src = userData.img;
                                profileImage.style.display = 'block';
                               
                            }
                        } else {
                           
                            profileImage.src = "../img/user.jpg"; // Fallback para a imagem padrão
                            profileImage.style.display = 'block'; // Tornar a imagem visível
                        }
                    } 
                })
                
        }
    });
});



if (window.innerWidth <= 768) { // Ajusta o limite conforme necessário
    window.location.href = "../html/aviso.html";
}


