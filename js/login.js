import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// 1. Seleciona os elementos da página
const loginBtn = document.getElementById('navLoginBtn');
const buyButtons = document.querySelectorAll('.buy-btn, .buy-button'); 

// 2. Monitora se o usuário entrou ou saiu
onAuthStateChanged(auth, (user) => {
    if (user) {
        // ============================
        // ESTÁ LOGADO
        // ============================
        console.log("Usuário logado:", user.email);
        
        // Pega o nome do usuário (ou cria um baseado no email)
        let userName = user.displayName;
        if (!userName) {
            userName = user.email.split('@')[0];
            userName = userName.charAt(0).toUpperCase() + userName.slice(1);
        }

        // Atualiza o botão do topo com o Nome e Ícone
        if (loginBtn) {
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

        // Libera os botões de compra (remove bloqueios anteriores)
        buyButtons.forEach(btn => {
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
            btn.onclick = null; // Remove a função de bloqueio, permitindo o link normal
        });

    } else {
        // ============================
        // NÃO ESTÁ LOGADO (VISITANTE)
        // ============================
        console.log("Visitante");

        // Reseta o botão do topo para 'Login'
        if (loginBtn) {
            loginBtn.innerHTML = 'Login';
            loginBtn.href = "login.html";
            loginBtn.onclick = null;
        }

        // Bloqueia o clique nos botões de compra
        buyButtons.forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault(); // Impede de ir para o WhatsApp
                
                const desejaLogar = confirm("🔒 ACESSO RESTRITO\n\nVocê precisa de uma conta para comprar itens exclusivos.\n\nDeseja fazer login ou criar conta agora?");
                
                if (desejaLogar) {
                    window.location.href = "login.html";
                }
            };
        });
    }
});

// Função para deslogar
function logoutUser() {
    signOut(auth).then(() => {
        window.location.reload();
    }).catch((error) => {
        console.error("Erro ao sair:", error);
    });
}
