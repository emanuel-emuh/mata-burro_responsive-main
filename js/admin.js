import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const productForm = document.getElementById('productForm');

// 1. VERIFICAÇÃO DE SEGURANÇA
onAuthStateChanged(auth, async(user) => {
    if (user) {
        // Verifica no banco de dados se o user tem role: "admin"
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists() && userDoc.data().role === "admin") {
            console.log("Acesso Admin Permitido");
        } else {
            alert("Acesso Negado! Apenas administradores.");
            window.location.href = "index.html";
        }
    } else {
        window.location.href = "login.html";
    }
});

// 2. SALVAR PRODUTO
productForm.addEventListener('submit', async(e) => {
    e.preventDefault();

    const name = document.getElementById('prodName').value;
    const price = parseFloat(document.getElementById('prodPrice').value);
    const image = document.getElementById('prodImage').value;
    const description = document.getElementById('prodDesc').value;
    const btn = productForm.querySelector('button');

    try {
        btn.innerText = "Salvando...";
        btn.disabled = true;

        await addDoc(collection(db, "products"), {
            name: name,
            price: price,
            image: image,
            description: description,
            createdAt: new Date()
        });

        alert("Produto cadastrado com sucesso!");
        productForm.reset();
        document.getElementById('imgPreview').style.display = 'none';

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao salvar produto.");
    } finally {
        btn.innerText = "Salvar Produto";
        btn.disabled = false;
    }
});