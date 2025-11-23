import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const loginBtn = document.getElementById('navLoginBtn');

// Monitora o estado de autenticação
onAuthStateChanged(auth, (user) => {
    if (user) {
        // --- USUÁRIO LOGADO ---
        console.log("Usuário logado:", user.email);

        // 1. Tenta pegar o Nick (displayName)
        let userName = user.displayName;

        // Se não tiver Nick, usa a parte antes do @ do email
        if (!userName) {
            userName = user.email.split('@')[0];
        }

        // 2. Muda o botão de Login para mostrar o Perfil
        if (loginBtn) {
            // Ícone de usuário + Nome
            loginBtn.innerHTML = `<i class="fas fa-user-circle" style="margin-right: 5px;"></i> ${userName}`;

            // Muda o estilo para parecer um "perfil" (opcional)
            loginBtn.style.border = "2px solid var(--orange-primary)";
            loginBtn.style.color = "#fff";
            loginBtn.title = "Clique para Sair";
            loginBtn.href = "#"; // Não vai para link nenhum

            // 3. Ao clicar, faz Logout
            loginBtn.onclick = (e) => {
                e.preventDefault();
                const sair = confirm(`Olá, ${userName}!\nDeseja sair da conta?`);
                if (sair) {
                    signOut(auth).then(() => {
                        // Recarrega a página para atualizar o menu
                        window.location.reload();
                    }).catch((error) => {
                        console.error("Erro ao sair:", error);
                    });
                }
            };
        }

    } else {
        // --- VISITANTE (NÃO LOGADO) ---
        if (loginBtn) {
            loginBtn.innerHTML = 'Login';
            loginBtn.href = "login.html";
            loginBtn.style.color = ""; // Volta ao original
            loginBtn.style.border = ""; // Volta ao original

            // Remove o evento de clique de logout
            loginBtn.onclick = null;
        }
    }
});