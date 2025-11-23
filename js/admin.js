import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
// Importamos tudo o que precisamos do Firestore: ler, adicionar, listar e deletar
import { doc, getDoc, collection, addDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const productForm = document.getElementById('productForm');
const productListContainer = document.getElementById('adminProductList');

// ==========================================
// 1. SEGURANÇA: Verifica se é Admin
// ==========================================
onAuthStateChanged(auth, async(user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));

            // Se tiver a role 'admin', libera o acesso e carrega a lista
            if (userDoc.exists() && userDoc.data().role === "admin") {
                console.log("Admin logado: " + user.email);
                loadAdminProducts(); // <--- Carrega os produtos ao entrar
            } else {
                alert("Acesso Negado. Apenas administradores.");
                window.location.href = "index.html";
            }
        } catch (error) {
            console.error("Erro ao verificar permissão:", error);
            window.location.href = "index.html";
        }
    } else {
        window.location.href = "login.html";
    }
});

// ==========================================
// 2. LISTAR PRODUTOS (Carrega do Banco)
// ==========================================
async function loadAdminProducts() {
    if (!productListContainer) return;

    // Mostra mensagem de carregando
    productListContainer.innerHTML = '<p style="color:#888; text-align:center;">Atualizando lista...</p>';

    try {
        const querySnapshot = await getDocs(collection(db, "products"));

        if (querySnapshot.empty) {
            productListContainer.innerHTML = '<p style="color:#ccc; text-align:center;">Nenhum produto cadastrado.</p>';
            return;
        }

        // Limpa a lista antes de encher
        productListContainer.innerHTML = "";

        querySnapshot.forEach((docSnap) => {
            const product = docSnap.data();
            const id = docSnap.id; // ID do produto para poder apagar

            // Cria o HTML de cada produto na lista
            const itemHTML = `
                <div class="admin-product-item">
                    <div class="prod-info">
                        <img src="${product.image}" class="prod-thumb" onerror="this.src='img/logo.png'">
                        <div class="prod-details">
                            <h4>${product.name}</h4>
                            <p>R$ ${product.price.toFixed(2)}</p>
                        </div>
                    </div>
                    <button class="delete-btn" onclick="window.deleteProduct('${id}', '${product.name}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            `;
            productListContainer.innerHTML += itemHTML;
        });

    } catch (error) {
        console.error("Erro ao listar:", error);
        productListContainer.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar lista.</p>';
    }
}

// ==========================================
// 3. DELETAR PRODUTO (Global)
// ==========================================
// Colocamos no 'window' para o botão onclick no HTML conseguir achar a função
window.deleteProduct = async(id, name) => {
    const confirmDelete = confirm(`Tem certeza que deseja APAGAR:\n"${name}"?\n\nIsso não pode ser desfeito.`);

    if (confirmDelete) {
        try {
            await deleteDoc(doc(db, "products", id));
            alert("Produto removido com sucesso!");
            loadAdminProducts(); // Atualiza a lista na hora
        } catch (error) {
            console.error("Erro ao deletar:", error);
            alert("Erro ao excluir: " + error.message);
        }
    }
};

// ==========================================
// 4. SALVAR NOVO PRODUTO (Com Categoria)
// ==========================================
if (productForm) {
    productForm.addEventListener('submit', async(e) => {
        e.preventDefault();

        const name = document.getElementById('prodName').value;
        const price = parseFloat(document.getElementById('prodPrice').value);
        // PEGA A CATEGORIA SELECIONADA
        const category = document.getElementById('prodCategory').value;
        const image = document.getElementById('prodImage').value;
        const description = document.getElementById('prodDesc').value;
        const btn = productForm.querySelector('button');
        const originalText = btn.innerHTML;

        try {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            btn.disabled = true;

            await addDoc(collection(db, "products"), {
                name: name,
                price: price,
                category: category, // SALVA NO BANCO
                image: image,
                description: description,
                createdAt: new Date()
            });

            alert("✅ Produto cadastrado!");

            productForm.reset();
            document.getElementById('previewBox').classList.remove('active');
            loadAdminProducts();

        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro: " + error.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}