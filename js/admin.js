import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc, collection, addDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const productForm = document.getElementById('productForm');
const productListContainer = document.getElementById('adminProductList');

// ==========================================
// 1. SEGURANÇA (ADMIN)
// ==========================================
onAuthStateChanged(auth, async(user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists() && userDoc.data().role === "admin") {
                console.log("Admin logado: " + user.email);
                loadAdminProducts(); // Carrega a lista
            } else {
                alert("Acesso Negado.");
                window.location.href = "index.html";
            }
        } catch (error) {
            console.error("Erro auth:", error);
            window.location.href = "index.html";
        }
    } else {
        window.location.href = "login.html";
    }
});

// ==========================================
// 2. LISTAR PRODUTOS
// ==========================================
async function loadAdminProducts() {
    if (!productListContainer) return;

    productListContainer.innerHTML = '<p style="color:#888; text-align:center;">Atualizando...</p>';

    try {
        const querySnapshot = await getDocs(collection(db, "products"));

        if (querySnapshot.empty) {
            productListContainer.innerHTML = '<p style="color:#ccc; text-align:center;">Nenhum produto cadastrado.</p>';
            return;
        }

        productListContainer.innerHTML = "";

        querySnapshot.forEach((docSnap) => {
            const product = docSnap.data();
            const id = docSnap.id;

            // Exibe Categoria se existir, senão 'Geral'
            const categoryDisplay = product.category ? product.category.toUpperCase() : 'GERAL';

            const itemHTML = `
                <div class="admin-product-item">
                    <div class="prod-info">
                        <img src="${product.image}" class="prod-thumb" onerror="this.src='img/logo.png'">
                        <div class="prod-details">
                            <h4>${product.name}</h4>
                            <p>R$ ${product.price.toFixed(2)}</p>
                            <p class="prod-cat">${categoryDisplay}</p>
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
        console.error("Erro lista:", error);
        productListContainer.innerHTML = '<p style="color:red;">Erro ao carregar lista.</p>';
    }
}

// ==========================================
// 3. DELETAR PRODUTO
// ==========================================
window.deleteProduct = async(id, name) => {
    if (confirm(`Tem certeza que deseja APAGAR:\n"${name}"?`)) {
        try {
            await deleteDoc(doc(db, "products", id));
            alert("Produto removido!");
            loadAdminProducts();
        } catch (error) {
            console.error(error);
            alert("Erro ao apagar.");
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
        // Pega o valor do seletor de Categoria
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
                category: category, // Salva no banco
                image: image,
                description: description,
                createdAt: new Date()
            });

            alert("✅ Produto cadastrado!");

            productForm.reset();
            document.getElementById('previewBox').classList.remove('active');
            loadAdminProducts();

        } catch (error) {
            console.error("Erro:", error);
            alert("Erro: " + error.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}