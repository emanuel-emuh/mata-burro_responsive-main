import { auth, db } from './firebase-config.js'; //
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// 1. Seleciona os elementos da página
const loginBtn = document.getElementById('navLoginBtn');
const buyButtons = document.querySelectorAll('.buy-btn, .buy-button');
const loginForm = document.getElementById('loginForm');

// ==========================================
// 1. LÓGICA DE LOGIN (FORMULÁRIO)
// ==========================================
if (loginForm) {
    loginForm.addEventListener('submit', async(e) => {
        e.preventDefault(); // Impede o recarregamento da página

        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        const btn = loginForm.querySelector('button');
        const originalText = btn.innerText;

        // Feedback visual para o usuário
        btn.innerText = "Entrando...";
        btn.disabled = true;

        try {
            // A. Login no Authentication (Email/Senha)
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("Login Auth OK. Verificando cargo no Firestore...");

            // B. Busca dados extras no Firestore (Role/Cargo)
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();

                // C. Redirecionamento baseado no Cargo
                if (userData.role === "admin") {
                    console.log("É Admin! Redirecionando...");
                    window.location.href = "admin.html";
                } else {
                    console.log("É Membro. Redirecionando para Home...");
                    window.location.href = "index.html";
                }
            } else {
                // Se o usuário não tiver dados no banco, vai para a home por padrão
                window.location.href = "index.html";
            }

        } catch (error) {
            console.error("Erro no login:", error);
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

// ==========================================
// 2. MONITOR DE ESTADO (UI E PERMISSÕES)
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        // --- USUÁRIO LOGADO ---
        console.log("Usuário logado:", user.email);

        // A. Atualiza o Botão da Navbar (Nome + Logout)
        if (loginBtn) {
            let userName = user.displayName;
            if (!userName) {
                userName = user.email.split('@')[0];
                // Capitaliza a primeira letra
                userName = userName.charAt(0).toUpperCase() + userName.slice(1);
            }

            loginBtn.innerHTML = `<i class="fas fa-user-circle" style="margin-right: 5px;"></i> ${userName}`;
            loginBtn.href = "#";
            loginBtn.title = "Clique para Sair";

            // Ao clicar no nome, pergunta se quer sair
            loginBtn.onclick = (e) => {
                e.preventDefault();
                if (confirm(`Olá, ${userName}!\nDeseja sair da sua conta?`)) {
                    logoutUser();
                }
            };
        }

        // B. Libera os botões de compra
        if (buyButtons) {
            buyButtons.forEach(btn => {
                btn.style.opacity = "1";
                btn.style.cursor = "pointer";
                btn.onclick = null; // Remove qualquer bloqueio anterior
            });
        }

    } else {
        // --- VISITANTE (NÃO LOGADO) ---
        console.log("Visitante");

        // A. Reseta o botão da Navbar
        if (loginBtn) {
            loginBtn.innerHTML = 'Login';
            loginBtn.href = "login.html";
            loginBtn.onclick = null;
        }

        // B. Bloqueia os botões de compra
        if (buyButtons) {
            buyButtons.forEach(btn => {
                btn.onclick = (e) => {
                    e.preventDefault(); // Impede ir para o WhatsApp/Página de compra

                    const desejaLogar = confirm("🔒 ACESSO RESTRITO\n\nVocê precisa de uma conta para comprar itens exclusivos.\n\nDeseja fazer login ou criar conta agora?");

                    if (desejaLogar) {
                        window.location.href = "login.html";
                    }
                };
            });
        }
    }
});

// ==========================================
// 3. FUNÇÃO DE LOGOUT
// ==========================================
function logoutUser() {
    signOut(auth).then(() => {
        // Recarrega a página ou manda para o login
        window.location.href = "login.html";
    }).catch((error) => {
        console.error("Erro ao sair:", error);
    });
}