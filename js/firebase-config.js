import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
// ADICIONADO: Importação do Storage
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCVwiHgelGVcMDS1Cxii6UDfq5YaYBEpXI",
    authDomain: "mataburro-ae8bd.firebaseapp.com",
    projectId: "mataburro-ae8bd",
    storageBucket: "mataburro-ae8bd.firebasestorage.app",
    messagingSenderId: "276601104622",
    appId: "1:276601104622:web:c098684dc5feeb29ce2bff"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// ADICIONADO: Exporta o storage
export const storage = getStorage(app);