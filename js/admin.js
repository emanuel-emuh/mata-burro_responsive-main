import { auth, db, storage } from './firebase-config.js'; // Adicionei 'storage'
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
// Importações necessárias para upload de imagem
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

const productForm = document.getElementById('productForm');
const fileInput = document.getElementById('prodFile');
const imgPreview = document.getElementById('imgPreview');

// 1. PRÉ-VISUALIZAÇÃO DA IMAGEM
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imgPreview.src = e.target.result;
            imgPreview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
});

// 2. VERIFICAÇÃO DE SEGURANÇA (ADMIN)
onAuthStateChanged(auth, async(user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
            console.log("Admin logado: " + user.email);
        } else {
            alert("Acesso Negado!");
            window.location.href = "index.html";
        }
    } else {
        window.location.href = "login.html";
    }
});

// 3. SALVAR PRODUTO COM UPLOAD
productForm.addEventListener('submit', async(e) => {
    e.preventDefault();

    const name = document.getElementById('prodName').value;
    const price = parseFloat(document.getElementById('prodPrice').value);
    const description = document.getElementById('prodDesc').value;
    const file = fileInput.files[0]; // Pega o arquivo real
    const btn = productForm.querySelector('button');

    if (!file) {
        alert("Por favor, selecione uma imagem.");
        return;
    }

    try {
        btn.innerText = "Enviando Imagem..."; // Feedback importante
        btn.disabled = true;

        // A. Cria uma referência no Storage (pasta 'produtos')
        // Usamos Date.now() para garantir que o nome seja único
        const storageRef = ref(storage, `produtos/${Date.now()}_${file.name}`);

        // B. Faz o Upload do arquivo
        await uploadBytes(storageRef, file);

        // C. Pega a URL pública da imagem que acabamos de subir
        const imageUrl = await getDownloadURL(storageRef);

        btn.innerText = "Salvando no Banco...";

        // D. Salva os dados no Firestore (usando a URL que recebemos)
        await addDoc(collection(db, "products"), {
            name: name,
            price: price,
            image: imageUrl, // Aqui vai o link do Storage
            description: description,
            createdAt: new Date()
        });

        alert("Produto cadastrado com sucesso!");
        productForm.reset();
        imgPreview.style.display = 'none';

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao salvar: " + error.message);
    } finally {
        btn.innerText = "Salvar Produto";
        btn.disabled = false;
    }
});