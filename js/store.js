import { db, auth } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const productsGrid = document.getElementById('productsGrid');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

let cart = [];

// 1. Carregar Produtos
async function loadProducts() {
    try {
        // Feedback de carregamento
        if (productsGrid) productsGrid.innerHTML = "<p style='color:#fff'>Carregando produtos...</p>";

        const querySnapshot = await getDocs(collection(db, "products"));

        if (productsGrid) productsGrid.innerHTML = ""; // Limpa o loading

        if (querySnapshot.empty) {
            if (productsGrid) productsGrid.innerHTML = "<p style='color:#ccc'>Nenhum produto encontrado.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const product = doc.data();
            product.id = doc.id;

            // Previne erro se a imagem estiver vazia
            const imgUrl = product.image || 'img/logo.png';

            const card = document.createElement('div');
            card.className = 'shop-card';
            card.innerHTML = `
                <img src="${imgUrl}" alt="${product.name}" class="shop-img" onerror="this.src='https://via.placeholder.com/300?text=Sem+Imagem'">
                <div class="shop-info">
                    <h3 class="shop-title">${product.name}</h3>
                    <p class="shop-price">R$ ${product.price.toFixed(2)}</p>
                    <div class="shop-desc">${product.description || ''}</div>
                    <button class="add-cart-btn" onclick="addToCart('${product.id}', '${product.name}', ${product.price})">
                        <i class="fas fa-cart-plus"></i> Adicionar
                    </button>
                </div>
            `;
            if (productsGrid) productsGrid.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        if (productsGrid) productsGrid.innerHTML = "<p style='color:red'>Erro ao carregar loja. Verifique o console.</p>";
    }
}

// 2. Adicionar ao Carrinho (Global)
window.addToCart = (id, name, price) => {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ id, name, price, qty: 1 });
    }
    updateCartUI();
    // Feedback visual simples
    alert(`${name} adicionado ao carrinho!`);
};

// 3. Atualizar Interface do Carrinho
function updateCartUI() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="color: #777; text-align: center;">Carrinho vazio</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price * item.qty;
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div>
                    <strong>${item.name}</strong> <small>(${item.qty}x)</small><br>
                    <span style="color:var(--orange-primary)">R$ ${(item.price * item.qty).toFixed(2)}</span>
                </div>
                <i class="fas fa-trash remove-item" onclick="removeFromCart(${index})" title="Remover"></i>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
    }

    if (cartTotalElement) cartTotalElement.innerText = total.toFixed(2);
    localStorage.setItem('mataBurroCart', JSON.stringify(cart));
}

// 4. Remover do Carrinho
window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCartUI();
};

// 5. Finalizar Compra
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return alert("Seu carrinho está vazio!");

        const user = auth.currentUser;
        let clientName = "Cliente Visitante";

        if (user) {
            clientName = user.displayName || user.email;
        }

        let message = `*NOVO PEDIDO - MATA-BURRO*\n`;
        message += `👤 Cliente: ${clientName}\n\n`;
        message += `*ITENS:*\n`;

        cart.forEach(item => {
            message += `- ${item.qty}x ${item.name} (R$ ${(item.price * item.qty).toFixed(2)})\n`;
        });

        message += `\n💰 *TOTAL: R$ ${cartTotalElement.innerText}*`;

        const phone = "5584999999999"; // SEU NÚMERO
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