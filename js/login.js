import { auth, db } from './firebase-config.js'; // ADICIONADO: db
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"; // ADICIONADO: ferramentas do Firestore

const loginBtn = document.getElementById('navLoginBtn');
const buyButtons = document.querySelectorAll('.buy-btn, .buy-button');
const loginForm = document.getElementById('loginForm');

// LÓGICA DE LOGIN COMPLETA
if (loginForm) {
    loginForm.addEventListener('submit', async(e) => { // Note o 'async' aqui
        e.preventDefault();

        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        const btn = loginForm.querySelector('button');
        const originalText = btn.innerText;

        btn.innerText = "Verificando...";
        btn.disabled = true;

        try {
            // 1. O Authentication verifica a senha
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("Senha correta. Buscando dados no Firestore...");

            // 2. AGORA sim, vamos ao seu Banco de Dados (Firestore)
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                console.log("Dados do Firestore:", userData);

                // Exemplo: Se for Admin, manda para a página de Admin
                if (userData.role === 'admin') {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "index.html";
                }
            } else {
                // Usuário existe no Auth mas não tem documento no Firestore (caso raro)
                console.log("Usuário sem registro no banco!");
                window.location.href = "index.html";
            }

        } catch (error) {
            console.error("Erro:", error);
            btn.innerText = originalText;
            btn.disabled = false;

            if (error.code === 'auth/invalid-credential') {
                alert("E-mail ou senha incorretos.");
            } else {
                alert("Erro ao entrar: " + error.message);
            }
        }
    });
}

// ... (O resto do código onAuthStateChanged mantém igual) ...
// Apenas certifique-se de manter a função onAuthStateChanged e logoutUser abaixo disto
onAuthStateChanged(auth, (user) => {
    // ... seu código de UI ...
    // (Copie do exemplo anterior a parte do onAuthStateChanged)
    if (user) {
        // Lógica de usuário logado
        if (loginBtn) {
            // Tenta pegar o nome do Auth, se não tiver, tenta do email
            let userName = user.displayName;
            if (!userName) {
                userName = user.email.split('@')[0];
            }

            loginBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${userName}`;
            loginBtn.href = "#";
            loginBtn.onclick = (e) => {
                e.preventDefault();
                if (confirm("Deseja sair?")) logoutUser();
            }
        }
        // Libera botões
        buyButtons.forEach(btn => {
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
            btn.onclick = null;
        });
    } else {
        // Lógica de visitante
        if (loginBtn) {
            loginBtn.innerHTML = 'Login';
            loginBtn.href = "login.html";
            loginBtn.onclick = null;
        }
        // Bloqueia botões...
    }
});

function logoutUser() {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    });
}