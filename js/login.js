import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// Sua configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAg_fxX0Oqd9kjQqRWEBvABInr30fgUomM",
    authDomain: "login-e-register-b34e7.firebaseapp.com",
    projectId: "login-e-register-b34e7",
    storageBucket: "login-e-register-b34e7.appspot.com",
    messagingSenderId: "408660648165",
    appId: "1:408660648165:web:d3192dfe1812d84bdbb40c",
    measurementId: "G-SRSCS6VEDV"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Executa o código após o DOM estar carregado
document.addEventListener('DOMContentLoaded', () => {

    // Verifica o estado de autenticação
    onAuthStateChanged(auth, (user) => {
        const loginBtn = document.getElementById("login-btn");
        const profileLink = document.getElementById("profileImage");
        const logoutBtn = document.getElementById("logout-btn");

        if (user) {
            const uid = user.uid; // Obter o UID do utilizador autenticado
            

            loginBtn.style.display = "none"; // Esconde o botão de login
            profileLink.style.display = "inline"; // Mostra o link do perfil
            logoutBtn.style.display = "inline"; // Mostra o botão de logout

            
        } else {
            loginBtn.style.display = "inline"; // Mostra o botão de login
            profileLink.style.display = "none"; // Esconde o link do perfil
            logoutBtn.style.display = "none"; // Esconde o botão de logout
        }
    });

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            signOut(auth).then(() => {
                // Logout bem-sucedido
                window.location.href = "../html/index.html"; // Redirecionar para a página inicial após logout
            })
        });
    }

    // Função de login
  
    const submit = document.getElementById('submit2');
    if (submit) {
    submit.addEventListener('click', function (event) {
        event.preventDefault();

        const email = document.getElementById('emailLo').value;
        const password = document.getElementById('senhaLo').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Redirecionar após o login
                window.location.href = "../html/index.html";
            })
            .catch((error) => {
                let errorMessage = "";
                const errorMessageElement = document.getElementById('error-message');
                
                switch (error.code) {
                    case 'auth/missing-password':
                        errorMessage = 'Por favor, insira a sua senha.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'O email inserido é inválido. Verifique o formato do email.';
                        break;
                    case 'auth/invalid-credential':
                        errorMessage = 'As credenciais fornecidas são inválidas. Tente novamente.';
                        break;
                    default:
                        errorMessage = 'Ocorreu um erro durante o login. Tente novamente.';
                        break;
                }
                
                // Exibe a mensagem de erro
                errorMessageElement.textContent = errorMessage;
                errorMessageElement.style.display = 'block'; // Certifique-se de que o elemento está visível
            });
    });
}

});


// Lidar com o evento de clique no botão "Repor senha"
const resetForm = document.getElementById("resetForm");
resetForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Impede o envio do formulário

  const email = document.getElementById("emailLo").value;
  const alertMessage = document.getElementById("alertMessage");

  // Verifica se o email foi inserido
  if (email) {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        // Exibe uma mensagem de sucesso
        alertMessage.textContent = "Email de reposição de senha enviado com sucesso!";
        alertMessage.classList.add("show");
        alertMessage.style.backgroundColor = "#d4edda"; // Verde claro para sucesso
        alertMessage.style.color = "#155724"; // Verde escuro para o texto
      })
      .catch((error) => {
        const errorMessage = error.message;
        // Exibe a mensagem de erro
        alertMessage.textContent = "Erro: " + errorMessage;
        alertMessage.classList.add("show");
        alertMessage.style.backgroundColor = "#f8d7da"; // Vermelho claro para erro
        alertMessage.style.color = "#721c24"; // Vermelho escuro para o texto
      });
  }
  

});


