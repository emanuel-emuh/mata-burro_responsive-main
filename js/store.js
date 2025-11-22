import { db, auth } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const productsGrid = document.getElementById('productsGrid');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

let cart = [];

// 1. Carregar Produtos do Firebase
async function loadProducts() {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        productsGrid.innerHTML = ""; // Limpa o loading

        if (querySnapshot.empty) {
            productsGrid.innerHTML = "<p>Nenhum produto cadastrado ainda.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const product = doc.data();
            product.id = doc.id; // Salva o ID do documento

            // Cria o HTML do Card
            const card = document.createElement('div');
            card.className = 'shop-card';
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="shop-img">
                <div class="shop-info">
                    <h3 class="shop-title">${product.name}</h3>
                    <p class="shop-price">R$ ${product.price.toFixed(2)}</p>
                    <button class="add-cart-btn" onclick="addToCart('${product.id}', '${product.name}', ${product.price})">
                        Adicionar ao Carrinho
                    </button>
                </div>
            `;
            productsGrid.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        productsGrid.innerHTML = "<p>Erro ao carregar loja.</p>";
    }
}

// 2. Função Global para Adicionar ao Carrinho
window.addToCart = (id, name, price) => {
    // Verifica se já existe no carrinho
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ id, name, price, qty: 1 });
    }

    updateCartUI();
};

// 3. Atualizar Visual do Carrinho
function updateCartUI() {
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
                    <strong>${item.name}</strong><br>
                    <small>${item.qty}x R$ ${item.price.toFixed(2)}</small>
                </div>
                <i class="fas fa-trash remove-item" onclick="removeFromCart(${index})"></i>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
    }

    cartTotalElement.innerText = total.toFixed(2);
    // Salva no LocalStorage para não perder se atualizar a página
    localStorage.setItem('mataBurroCart', JSON.stringify(cart));
}

// 4. Remover do Carrinho
window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCartUI();
};

// 5. Finalizar Compra (WhatsApp)
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return alert("Seu carrinho está vazio!");

    const user = auth.currentUser;
    if (!user) {
        const irLogin = confirm("Você precisa estar logado para finalizar a compra. Ir para login?");
        if (irLogin) window.location.href = "login.html";
        return;
    }

    // Monta a mensagem
    let message = `*NOVO PEDIDO - MATA-BURRO*\n`;
    message += `Cliente: ${user.displayName || user.email}\n\n`;
    message += `*ITENS:*\n`;

    cart.forEach(item => {
        message += `- ${item.qty}x ${item.name} (R$ ${(item.price * item.qty).toFixed(2)})\n`;
    });

    const total = cartTotalElement.innerText;
    message += `\n*TOTAL: R$ ${total}*`;

    // Codifica para URL e abre WhatsApp
    const phone = "5584999999999"; // COLOQUE SEU NÚMERO AQUI
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Recupera carrinho salvo
    const savedCart = localStorage.getItem('mataBurroCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
    loadProducts();
});