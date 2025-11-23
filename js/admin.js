import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc, collection, addDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const productForm = document.getElementById('productForm');
const newsForm = document.getElementById('newsForm');

// ==========================================
// 1. VERIFICAÇÃO DE SEGURANÇA (ADMIN)
// ==========================================
onAuthStateChanged(auth, async(user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists() && userDoc.data().role === "admin") {
                console.log("Admin logado: " + user.email);
                // Carrega TODAS as listas ao iniciar
                loadAdminProducts();
                loadAdminNews();
                loadAdminUsers(); // <--- NOVO: Carrega usuários
            } else {
                alert("Acesso Negado. Apenas administradores.");
                window.location.href = "index.html";
            }
        } catch (error) {
            console.error("Erro de permissão:", error);
            window.location.href = "index.html";
        }
    } else {
        window.location.href = "login.html";
    }
});

// ==========================================
// 2. GERENCIAR PRODUTOS
// ==========================================

// Listar Produtos
async function loadAdminProducts() {
    const container = document.getElementById('adminProductList');
    if (!container) return;

    container.innerHTML = '<p style="color:#888; text-align:center;">Atualizando...</p>';

    try {
        const snap = await getDocs(collection(db, "products"));

        if (snap.empty) {
            container.innerHTML = '<p style="color:#ccc; text-align:center;">Nenhum produto cadastrado.</p>';
            return;
        }

        container.innerHTML = ""; // Limpa lista

        snap.forEach(docSnap => {
            const p = docSnap.data();
            container.innerHTML += `
                <div class="admin-product-item">
                    <div class="prod-info">
                        <img src="${p.image}" class="prod-thumb" onerror="this.src='img/logo.png'">
                        <div class="prod-details">
                            <h4>${p.name}</h4>
                            <p>R$ ${p.price.toFixed(2)}</p>
                        </div>
                    </div>
                    <button class="delete-btn" onclick="window.deleteItem('products', '${docSnap.id}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erro produtos:", error);
        container.innerHTML = '<p style="color:red;">Erro ao carregar produtos.</p>';
    }
}

// Salvar Produto
if (productForm) {
    productForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        const btn = productForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = "Salvando...";
        btn.disabled = true;

        try {
            await addDoc(collection(db, "products"), {
                name: document.getElementById('prodName').value,
                price: parseFloat(document.getElementById('prodPrice').value),
                category: document.getElementById('prodCategory').value,
                image: document.getElementById('prodImage').value,
                imageBack: document.getElementById('prodImageBack').value || "",
                description: document.getElementById('prodDesc').value,
                createdAt: new Date()
            });

            alert("✅ Produto salvo com sucesso!");
            productForm.reset();
            document.querySelectorAll('.preview-container').forEach(el => el.classList.remove('active'));
            loadAdminProducts();

        } catch (error) {
            alert("Erro ao salvar produto: " + error.message);
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

// ==========================================
// 3. GERENCIAR NOTÍCIAS
// ==========================================

// Listar Notícias
async function loadAdminNews() {
    const container = document.getElementById('adminNewsList');
    if (!container) return;

    container.innerHTML = '<p style="color:#888; text-align:center;">Atualizando...</p>';

    try {
        const snap = await getDocs(collection(db, "news"));

        if (snap.empty) {
            container.innerHTML = '<p style="color:#ccc; text-align:center;">Nenhuma notícia publicada.</p>';
            return;
        }

        container.innerHTML = "";

        snap.forEach(docSnap => {
            const n = docSnap.data();
            container.innerHTML += `
                <div class="admin-product-item">
                    <div class="prod-info">
                        <img src="${n.image}" class="prod-thumb" onerror="this.src='img/logo.png'">
                        <div class="prod-details">
                            <h4>${n.title}</h4>
                            <p style="font-size:0.8rem; color:#888;">${n.date}</p>
                        </div>
                    </div>
                    <button class="delete-btn" onclick="window.deleteItem('news', '${docSnap.id}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erro notícias:", error);
        container.innerHTML = '<p style="color:red;">Erro ao carregar notícias.</p>';
    }
}

// Salvar Notícia
if (newsForm) {
    newsForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        const btn = newsForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = "Publicando...";
        btn.disabled = true;

        try {
            await addDoc(collection(db, "news"), {
                title: document.getElementById('newsTitle').value,
                date: document.getElementById('newsDate').value,
                image: document.getElementById('newsImage').value,
                summary: document.getElementById('newsSummary').value,
                createdAt: new Date()
            });

            alert("📰 Notícia publicada!");
            newsForm.reset();
            document.querySelectorAll('.preview-container').forEach(el => el.classList.remove('active'));
            loadAdminNews();

        } catch (error) {
            alert("Erro ao publicar notícia: " + error.message);
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

// ==========================================
// 4. GERENCIAR USUÁRIOS (NOVO)
// ==========================================

async function loadAdminUsers() {
    const container = document.getElementById('adminUsersList');
    if (!container) return;

    container.innerHTML = '<p style="color:#888; text-align:center;">Carregando usuários...</p>';

    try {
        const snap = await getDocs(collection(db, "users"));

        if (snap.empty) {
            container.innerHTML = '<p style="color:#ccc; text-align:center;">Nenhum usuário encontrado.</p>';
            return;
        }

        container.innerHTML = "";

        snap.forEach(docSnap => {
            const u = docSnap.data();
            // Ícone especial para admins
            const icon = u.role === 'admin' ? '<i class="fas fa-crown" style="color:gold"></i>' : '<i class="fas fa-user"></i>';
            const roleColor = u.role === 'admin' ? 'var(--orange-primary)' : '#888';

            container.innerHTML += `
                <div class="admin-product-item">
                    <div class="prod-info">
                        <div style="width:40px; height:40px; background:#333; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.2rem; color:#ccc;">
                            ${icon}
                        </div>
                        <div class="prod-details">
                            <h4 style="text-transform:none;">${u.username || 'Sem Nick'}</h4>
                            <p style="font-size:0.8rem; color:#aaa; font-weight:normal;">${u.email}</p>
                            <p class="prod-cat" style="color:${roleColor} !important; margin-top:2px;">${u.role ? u.role.toUpperCase() : 'MEMBRO'}</p>
                        </div>
                    </div>
                    <button class="delete-btn" onclick="window.deleteItem('users', '${docSnap.id}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erro usuários:", error);
        container.innerHTML = '<p style="color:red;">Erro ao carregar usuários.</p>';
    }
}

// ==========================================
// 5. FUNÇÃO GLOBAL DE EXCLUIR (ATUALIZADA)
// ==========================================
window.deleteItem = async(collectionName, id) => {
    let msg = "Tem certeza que deseja excluir este item?";

    if (collectionName === 'users') {
        msg = "⚠️ ATENÇÃO: Isso removerá os dados do usuário do banco de dados.\n(O login/senha continuará existindo no Authentication, mas ele perderá o acesso ao perfil). Continuar?";
    }

    if (confirm(msg)) {
        try {
            await deleteDoc(doc(db, collectionName, id));
            alert("Item removido com sucesso!");

            // Atualiza a lista correta dependendo do que foi apagado
            if (collectionName === 'products') loadAdminProducts();
            else if (collectionName === 'news') loadAdminNews();
            else if (collectionName === 'users') loadAdminUsers(); // Atualiza lista de usuários

        } catch (error) {
            console.error("Erro ao deletar:", error);
            alert("Erro ao excluir.");
        }
    }
};