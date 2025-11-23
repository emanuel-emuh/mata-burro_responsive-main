import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const productForm = document.getElementById('productForm');

// ==========================================
// 1. SEGURANÇA: Verifica se é Admin
// ==========================================
onAuthStateChanged(auth, async(user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === "admin") {
                console.log("Acesso Admin Permitido: " + user.email);
            } else {
                alert("ACESSO NEGADO: Apenas administradores.");
                window.location.href = "index.html";
            }
        } catch (error) {
            console.error("Erro ao verificar admin:", error);
            window.location.href = "index.html";
        }
    } else {
        // Se não estiver logado, manda pro login
        window.location.href = "login.html";
    }
});

// ==========================================
// 2. SALVAR PRODUTO (Direto no Banco)
// ==========================================
if (productForm) {
    productForm.addEventListener('submit', async(e) => {
        e.preventDefault();

        // Pega os valores dos campos
        const name = document.getElementById('prodName').value;
        const price = parseFloat(document.getElementById('prodPrice').value);
        const image = document.getElementById('prodImage').value; // Pega a URL digitada
        const description = document.getElementById('prodDesc').value;

        const btn = productForm.querySelector('button');
        const originalBtnText = btn.innerHTML;

        try {
            // Efeito visual de carregamento
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            btn.disabled = true;

            // Salva no Firestore
            await addDoc(collection(db, "products"), {
                name: name,
                price: price,
                image: image, // Salva o texto do link
                description: description,
                createdAt: new Date() // Data de criação
            });

            alert("✅ Produto cadastrado com sucesso!");

            // Limpa o formulário e esconde o preview
            productForm.reset();
            document.getElementById('previewBox').classList.remove('active');

        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar produto: " + error.message);
        } finally {
            // Restaura o botão
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
        }
    });
}