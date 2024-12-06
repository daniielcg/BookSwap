import { 
    initializeApp 
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";

import { 
    getAuth, createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

import { 
    getFirestore, collection, query, where, getDocs, doc, setDoc 
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";



const firebaseConfig = {
    apiKey: "AIzaSyAg_fxX0Oqd9kjQqRWEBvABInr30fgUomM",
    authDomain: "login-e-register-b34e7.firebaseapp.com",
    projectId: "login-e-register-b34e7",
    storageBucket: "login-e-register-b34e7.appspot.com",
    messagingSenderId: "408660648165",
    appId: "1:408660648165:web:d3192dfe1812d84bdbb40c",
    measurementId: "G-SRSCS6VEDV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to check if the username already exists
async function isUsernameTaken(nome) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("nome", "==", nome));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Returns true if username is found
}

// Function to display error messages
function displayError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'block';
    errorMessage.querySelector('p').textContent = message;
}

// Function to hide error messages
function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

// Function to get current date in "DD de mês de AAAA" format
function getCurrentDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    
    const meses = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    
    const month = meses[now.getMonth()];
    return `${day} de ${month} de ${year}`;
}

// Submit button event listener
const submit = document.getElementById('submit');
submit.addEventListener('click', async function (event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    hideError();

    try {
        // Check if the username is already taken
        if (await isUsernameTaken(nome)) {
            displayError('O nome de utilizador já está em uso. Escolha outro nome.');
            return;
        }

        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const dataCriacao = getCurrentDate();

        // Save the user's name to Firestore
        await setDoc(doc(db, "users", user.uid), {
            nome: nome,
            email: email,
            dataCriacao: dataCriacao
        });

        document.getElementById("successMessage").style.display = "block";

        setTimeout(() => {
            document.getElementById("successMessage").style.display = "none";
            window.location.href = "../html/login.html";
        }, 2000);

    } catch (error) {
        let errorMessage = '';

        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Este e-mail já está registado. Tente fazer login.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'O formato do e-mail é inválido. Tente novamente.';
        } else if (error.code === 'auth/missing-password') {
            errorMessage = 'Preencha o campo da senha';
        } else if (error.code === 'auth/missing-email') {
            errorMessage = 'Preencha o campo do email';
        } else {
            errorMessage = error.message;
        }

        displayError(errorMessage);
    }
});
