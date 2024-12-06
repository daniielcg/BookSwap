import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";

// Firebase Configuração
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

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const profileImage = document.getElementById("profileImage");
const dropdownMenu = document.getElementById("dropdownMenu");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.style.display = "none";
    profileImage.style.display = "block";

    const userRef = doc(db, "users", user.uid); // Correção no uso de `doc`
    getDoc(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          document.getElementById("userName").innerText = userData.nome || "Usuário";
        } 
      })
     
  } else {
    loginBtn.style.display = "block";
    profileImage.style.display = "none";
    dropdownMenu.classList.remove("active");
  }
});

profileImage.addEventListener("click", () => dropdownMenu.classList.toggle("active"));
window.addEventListener("click", (e) => {
  if (!profileImage.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.classList.remove("active");
  }
});

logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => console.log("Desconectado com sucesso"));
});