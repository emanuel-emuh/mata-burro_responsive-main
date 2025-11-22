// Função para virar a camisa
function flipJersey(button) {
    const jersey = button.previousElementSibling.querySelector('.jersey');
    if (jersey) {
        // Adiciona a propriedade que faltava para o efeito 3D funcionar
        jersey.style.transformStyle = 'preserve-3d'; 
        jersey.style.transform = jersey.style.transform === 'rotateY(180deg)' ? 'rotateY(0deg)' : 'rotateY(180deg)';
    }
}

// Opcional: Efeito de digitação no título
// O event listener garante que o código só rode após o HTML ser totalmente carregado.
document.addEventListener('DOMContentLoaded', function() {
    const titles = document.querySelectorAll('.section-title h2');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const title = entry.target;
                const text = title.getAttribute('data-text');
                
                // Evita que a animação rode múltiplas vezes
                if (title.textContent !== text) { 
                    title.textContent = '';
                    for (let i = 0; i < text.length; i++) {
                        setTimeout(() => {
                            title.textContent += text[i];
                        }, 100 + i * 50);
                    }
                }
                observer.unobserve(title); // Para a observação após a animação
            }
        });
    }, { threshold: 0.5 }); // A animação começa quando 50% do elemento está visível

    titles.forEach(title => {
        // Armazena o texto original em um atributo de dados
        title.setAttribute('data-text', title.textContent);
        title.textContent = ''; // Limpa o texto inicial
        observer.observe(title);
    });
});