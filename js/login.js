import { auth } from './firebase-config.js';
// ADICIONADO: signInWithEmailAndPassword na importação
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// 1. Seleciona os elementos da página
const loginBtn = document.getElementById('navLoginBtn');
const buyButtons = document.querySelectorAll('.buy-btn, .buy-button');
const loginForm = document.getElementById('loginForm'); // ADICIONADO

// 2. Lógica de Login (ESTA PARTE FALTAVA)
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede a página de recarregar

        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        const btn = loginForm.querySelector('button');
        const originalText = btn.innerText;

        // Feedback visual
        btn.innerText = "Entrando...";
        btn.disabled = true;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Sucesso
                console.log("Logado com sucesso!");
                window.location.href = "index.html"; // Redireciona para a home
            })
            .catch((error) => {
                // Erro
                console.error("Erro ao logar:", error);
                btn.innerText = originalText;
                btn.disabled = false;

                alert("Erro ao entrar: Verifique o e-mail e a senha.");
            });
    });
}

// 3. Monitora se o usuário entrou ou saiu (MANTÉM O QUE JÁ TINHAS)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // ... (todo o teu código de UI para user logado mantém-se igual) ...
        console.log("Usuário logado:", user.email);

        let userName = user.displayName;
        if (!userName) {
            userName = user.email.split('@')[0];
            userName = userName.charAt(0).toUpperCase() + userName.slice(1);
        }

        if (loginBtn) {
            loginBtn.innerHTML = `<i class="fas fa-user-circle" style="margin-right: 5px;"></i> ${userName}`;
            loginBtn.href = "#";
            loginBtn.title = "Clique para Sair";

            loginBtn.onclick = (e) => {
                e.preventDefault();
                if (confirm(`Olá, ${userName}!\nDeseja sair da sua conta?`)) {
                    logoutUser();
                }
            };
        }

        buyButtons.forEach(btn => {
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
            btn.onclick = null;
        });

    } else {
        // ... (código de visitante mantém-se igual) ...
        if (loginBtn) {
            loginBtn.innerHTML = 'Login';
            loginBtn.href = "login.html";
            loginBtn.onclick = null;
        }

        // Bloqueio dos botões de compra...
    }
});

// Função para deslogar
function logoutUser() {
    signOut(auth).then(() => {
        // Se estiver na página de admin ou perfil, talvez queira redirecionar
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Erro ao sair:", error);
    });
}