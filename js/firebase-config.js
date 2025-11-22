// Importa os serviços do Firebase (App, Autenticação e Banco de Dados)
// Estou usando a versão 11.0.2 para garantir estabilidade (a versão 12.6.0 do seu snippet parece ser futura ou incorreta, pois a atual é a 11.x)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Suas credenciais (Copiadas do código que você enviou)
const firebaseConfig = {
    apiKey: "AIzaSyCVwiHgelGVcMDS1Cxii6UDfq5YaYBEpXI",
    authDomain: "mataburro-ae8bd.firebaseapp.com",
    projectId: "mataburro-ae8bd",
    storageBucket: "mataburro-ae8bd.firebasestorage.app",
    messagingSenderId: "276601104622",
    appId: "1:276601104622:web:c098684dc5feeb29ce2bff"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta as ferramentas para usarmos em outros arquivos
export const auth = getAuth(app);
export const db = getFirestore(app);