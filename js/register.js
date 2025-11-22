import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('nameInput').value;
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        const btn = document.querySelector('.login-btn');

        // Validação simples
        if(name.length < 3) {
            alert("O Nick precisa ter pelo menos 3 letras.");
            return;
        }

        // Feedback visual
        const originalBtnText = btn.innerText;
        btn.innerText = "Criando conta...";
        btn.disabled = true;

        // 1. Criar Usuário
        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                
                // 2. Atualizar o Nome de Exibição (Nick) no Auth
                await updateProfile(user, {
                    displayName: name
                });

                // 3. Salvar dados no Banco de Dados (Firestore)
                // Isso cria uma pasta "users" e salva os dados lá
                await setDoc(doc(db, "users", user.uid), {
                    username: name,
                    email: email,
                    createdAt: new Date(),
                    role: "member" // Define como membro comum por padrão
                });

                alert("Conta criada com sucesso! Bem-vindo ao Mata-Burro.");
                window.location.href = "index.html"; // Redireciona para a home
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Erro no cadastro:", errorCode, errorMessage);

                btn.innerText = originalBtnText;
                btn.disabled = false;

                if (errorCode === 'auth/email-already-in-use') {
                    alert("Este e-mail já está cadastrado.");
                } else if (errorCode === 'auth/weak-password') {
                    alert("A senha deve ter pelo menos 6 caracteres.");
                } else {
                    alert("Erro ao cadastrar: " + errorMessage);
                }
            });
    });
}