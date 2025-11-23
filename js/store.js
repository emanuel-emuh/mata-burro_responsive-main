import { db, auth } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Elementos do DOM
const productsGrid = document.getElementById('productsGrid');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// Estado da Aplicação
let cart = [];
let allProductsData = [];

// ==========================================
// 1. CARREGAR PRODUTOS (DO FIREBASE)
// ==========================================
async function loadProducts() {
    try {
        if (productsGrid) productsGrid.innerHTML = "<p style='color:#fff'>A carregar produtos...</p>";

        const querySnapshot = await getDocs(collection(db, "products"));

        allProductsData = [];

        if (querySnapshot.empty) {
            productsGrid.innerHTML = "<p style='color:#ccc'>Nenhum produto cadastrado.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const p = doc.data();
            p.id = doc.id;
            allProductsData.push(p);
        });

        renderProducts(allProductsData);

    } catch (error) {
        console.error("Erro ao carregar:", error);
        if (productsGrid) productsGrid.innerHTML = "<p style='color:red'>Erro de conexão.</p>";
    }
}

// ==========================================
// 2. RENDERIZAR PRODUTOS (A CORREÇÃO ESTÁ AQUI)
// ==========================================
function renderProducts(listaDeProdutos) {
    productsGrid.innerHTML = "";

    if (listaDeProdutos.length === 0) {
        productsGrid.innerHTML = "<p style='color:#ccc; padding: 20px;'>Nenhum produto encontrado.</p>";
        return;
    }

    listaDeProdutos.forEach(product => {
        const imgUrl = product.image || 'img/logo.png';

        const card = document.createElement('div');
        card.className = 'shop-card';

        // --- AQUI ESTAVA O PROBLEMA ---
        // Atualizei as classes para baterem com o novo loja.html:
        // 1. Envolvi a img em 'card-img-container'
        // 2. Troquei 'shop-info' por 'card-body'
        // 3. Troquei 'add-cart-btn' por 'add-btn'
        card.innerHTML = `
            <div class="card-img-container">
                <img src="${imgUrl}" alt="${product.name}" class="shop-img" onerror="this.src='https://via.placeholder.com/300?text=Sem+Imagem'">
            </div>
            <div class="card-body">
                <h3 class="shop-title">${product.name}</h3>
                <p class="shop-price">R$ ${product.price.toFixed(2)}</p>
                <button class="add-btn" onclick="addToCart('${product.id}', '${product.name}', ${product.price})">
                    <i class="fas fa-cart-plus"></i> Adicionar
                </button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// ==========================================
// 3. FILTRAR PRODUTOS
// ==========================================
window.filterProducts = (categoria) => {
    const botoes = document.querySelectorAll('.filter-btn');
    botoes.forEach(btn => {
        const btnText = btn.innerText.toLowerCase();
        // Remove acentos (ex: acessórios -> acessorios)
        const btnNormalizado = btnText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (btnNormalizado === categoria || (categoria === 'todos' && btnNormalizado === 'todos')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (categoria === 'todos') {
        renderProducts(allProductsData);
    } else {
        const filtrados = allProductsData.filter(p => p.category === categoria);
        renderProducts(filtrados);
    }
};

// ==========================================
// 4. CARRINHO DE COMPRAS
// ==========================================
window.addToCart = (id, name, price) => {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ id, name, price, qty: 1 });
    }

    updateCartUI();
};

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCartUI();
};

function updateCartUI() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="color: #666; text-align: center; margin-top: 20px;">Carrinho vazio</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price * item.qty;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="item-info">
                    <strong>${item.name}</strong>
                    <small>Quant: ${item.qty}</small>
                    <span class="item-price">R$ ${(item.price * item.qty).toFixed(2)}</span>
                </div>
                <i class="fas fa-trash remove-btn" onclick="removeFromCart(${index})" title="Remover"></i>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
    }

    if (cartTotalElement) cartTotalElement.innerText = total.toFixed(2);
    localStorage.setItem('mataBurroCart', JSON.stringify(cart));
}

// ==========================================
// 5. FINALIZAR COMPRA
// ==========================================
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return alert("Seu carrinho está vazio!");

        const user = auth.currentUser;
        let clientName = "Visitante";
        if (user) {
            clientName = user.displayName || user.email;
        }

        let message = `*NOVO PEDIDO - MATA-BURRO STORE*\n`;
        message += `👤 Cliente: ${clientName}\n`;
        message += `📅 Data: ${new Date().toLocaleDateString()}\n\n`;
        message += `*ITENS DO PEDIDO:*\n`;

        cart.forEach(item => {
            message += `- ${item.qty}x ${item.name} (R$ ${(item.price * item.qty).toFixed(2)})\n`;
        });

        const total = cartTotalElement.innerText;
        message += `\n💰 *VALOR TOTAL: R$ ${total}*`;
        message += `\n\n_Aguardo instruções de pagamento._`;

        const phone = "5584999999999"; // SEU NÚMERO AQUI
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        window.open(url, '_blank');
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const savedCart = localStorage.getItem('mataBurroCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
    loadProducts();
});