import { db } from './firebase-config.js';
import { collection, getDocs, query, limit } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const newsGrid = document.getElementById('newsGrid');

async function loadNews() {
    if (!newsGrid) return;

    try {
        const q = query(collection(db, "news"), limit(3)); // Pega 3 notícias
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            newsGrid.innerHTML = "<p style='color:#ccc; grid-column: 1/-1; text-align: center;'>Nenhuma notícia recente.</p>";
            return;
        }

        newsGrid.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const news = doc.data();

            // Formata a data (AAAA-MM-DD -> DD/MM/AAAA)
            const dateObj = new Date(news.date);
            const dateFormatted = dateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

            const card = `
                <div class="news-card">
                    <div class="news-image">
                        <img src="${news.image}" alt="${news.title}" onerror="this.src='https://via.placeholder.com/400x200?text=Mata-Burro'">
                    </div>
                    <div class="news-content">
                        <span class="news-date"><i class="far fa-calendar-alt"></i> ${dateFormatted}</span>
                        <h3>${news.title}</h3>
                        <p>${news.summary}</p>
                        <a href="#" class="read-more">Ler mais <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            `;
            newsGrid.innerHTML += card;
        });

    } catch (error) {
        console.error("Erro:", error);
        newsGrid.innerHTML = "<p style='color:red'>Erro ao carregar notícias.</p>";
    }
}

document.addEventListener('DOMContentLoaded', loadNews);