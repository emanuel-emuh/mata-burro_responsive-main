import { db, auth } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Elementos do DOM
const productsGrid = document.getElementById('productsGrid');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// Estado da Aplicação
let cart = [];
let allProductsData = []; // Guarda todos os produtos carregados do banco

// ==========================================
// 1. CARREGAR PRODUTOS (DO FIREBASE)
// ==========================================
async function loadProducts() {
    try {
        if (productsGrid) productsGrid.innerHTML = "<p style='color:#fff'>Carregando produtos...</p>";

        const querySnapshot = await getDocs(collection(db, "products"));

        // Limpa a lista da memória
        allProductsData = [];

        if (querySnapshot.empty) {
            productsGrid.innerHTML = "<p style='color:#ccc'>Nenhum produto cadastrado na loja.</p>";
            return;
        }

        // Salva os dados na nossa variável local
        querySnapshot.forEach((doc) => {
            const p = doc.data();
            p.id = doc.id; // Importante guardar o ID
            allProductsData.push(p);
        });

        // Ao carregar, mostra TODOS os produtos
        renderProducts(allProductsData);

    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        if (productsGrid) productsGrid.innerHTML = "<p style='color:red'>Erro de conexão com a loja.</p>";
    }
}

// ==========================================
// 2. RENDERIZAR PRODUTOS (DESENHAR NA TELA)
// ==========================================
function renderProducts(listaDeProdutos) {
    // Limpa o grid atual
    productsGrid.innerHTML = "";

    if (listaDeProdutos.length === 0) {
        productsGrid.innerHTML = "<p style='color:#ccc; padding: 20px;'>Nenhum produto encontrado nesta categoria.</p>";
        return;
    }

    listaDeProdutos.forEach(product => {
        // Usa a URL da imagem ou um placeholder se não tiver
        const imgUrl = product.image || 'img/logo.png';

        const card = document.createElement('div');
        card.className = 'shop-card';
        card.innerHTML = `
            <img src="${imgUrl}" alt="${product.name}" class="shop-img" onerror="this.src='https://via.placeholder.com/300?text=Imagem+Indisponível'">
            <div class="shop-info">
                <h3 class="shop-title">${product.name}</h3>
                <p class="shop-price">R$ ${product.price.toFixed(2)}</p>
                <button class="add-cart-btn" onclick="addToCart('${product.id}', '${product.name}', ${product.price})">
                    <i class="fas fa-cart-plus"></i> Adicionar
                </button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// ==========================================
// 3. FILTRAR PRODUTOS (POR CATEGORIA)
// ==========================================
// Adicionamos ao 'window' para os botões do HTML conseguirem chamar
window.filterProducts = (categoria) => {
    // A. Atualiza o visual dos botões (Classe 'active')
    const botoes = document.querySelectorAll('.filter-btn');
    botoes.forEach(btn => {
        // Verifica se o texto do botão corresponde à categoria clicada
        // Simplificação: compara textos em minúsculo ou trata o caso especial 'todos'
        const btnText = btn.innerText.toLowerCase();
        // Remove acentos para comparar (ex: acessórios -> acessorios)
        const btnNormalizado = btnText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (btnNormalizado === categoria || (categoria === 'todos' && btnNormalizado === 'todos')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // B. Filtra os dados
    if (categoria === 'todos') {
        renderProducts(allProductsData);
    } else {
        // Filtra onde product.category é igual à categoria clicada
        const filtrados = allProductsData.filter(p => p.category === categoria);
        renderProducts(filtrados);
    }
};

// ==========================================
// 4. CARRINHO DE COMPRAS
// ==========================================

// Adicionar Item
window.addToCart = (id, name, price) => {
    // Verifica se já existe
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ id, name, price, qty: 1 });
    }

    updateCartUI();
    // Efeito visual rápido (opcional, pode ser removido)
    // alert(`${name} adicionado!`); 
};

// Remover Item
window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCartUI();
};

// Atualizar Interface do Carrinho
function updateCartUI() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="color: #777; text-align: center; margin-top: 20px;">Carrinho vazio</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price * item.qty;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div>
                    <strong style="color: #fff;">${item.name}</strong> <small style="color:#aaa">(${item.qty}x)</small><br>
                    <span style="color:var(--orange-primary)">R$ ${(item.price * item.qty).toFixed(2)}</span>
                </div>
                <i class="fas fa-trash remove-item" onclick="removeFromCart(${index})" title="Remover"></i>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
    }

    if (cartTotalElement) cartTotalElement.innerText = total.toFixed(2);
    // Salva no navegador para não perder ao atualizar a página
    localStorage.setItem('mataBurroCart', JSON.stringify(cart));
}

// ==========================================
// 5. FINALIZAR COMPRA (WHATSAPP)
// ==========================================
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return alert("Seu carrinho está vazio!");

        const user = auth.currentUser;

        // Verifica se está logado (opcional, mas recomendado)
        /*
        if (!user) {
            if(confirm("Você precisa estar logado para comprar. Ir para login?")) {
                window.location.href = "login.html";
            }
            return;
        }
        */

        let clientName = "Visitante";
        if (user) {
            clientName = user.displayName || user.email;
        }

        // Monta a mensagem
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

        // Envia para o WhatsApp
        const phone = "5584999999999"; // COLOQUE SEU NÚMERO AQUI
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        window.open(url, '_blank');
    });
}

// ==========================================
// 6. INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Recupera carrinho salvo
    const savedCart = localStorage.getItem('mataBurroCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }

    // Carrega produtos
    loadProducts();
});