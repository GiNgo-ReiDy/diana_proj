(function() {
    // Проверка, чтобы избежать двойной вставки
    if (document.querySelector('.floating-home-btn')) return;

    // Создаём элемент <a> (так лучше для навигации и SEO/доступности)
    const btn = document.createElement('a');
    btn.className = 'floating-home-btn';
    btn.href = '/';
    btn.setAttribute('aria-label', 'Главная');
    btn.innerHTML = '<span style="font-weight:600">Главная</span>';

    // Inline-стили (страховой механизм — они имеют высокий приоритет)
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        padding: '10px 14px',
        borderRadius: '10px',
        fontWeight: '600',
        fontSize: '15px',
        textDecoration: 'none',
        color: '#ffffff',
        background: '#8a3bd3',
        boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
        zIndex: '99999',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        transition: 'transform .12s ease, background .12s ease, box-shadow .12s ease',
        userSelect: 'none',
    });

    // Поведение hover/active через JS (для браузеров, где CSS может быть перекрыт)
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-3px)';
        btn.style.background = '#6c2da5';
        btn.style.boxShadow = '0 10px 24px rgba(0,0,0,0.22)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.background = '#8a3bd3';
        btn.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)';
    });
    btn.addEventListener('mousedown', () => btn.style.transform = 'translateY(0)');
    btn.addEventListener('mouseup', () => btn.style.transform = 'translateY(-3px)');

    // Клавиатурная навигация: Enter / Space должны работать
    btn.setAttribute('tabindex', '0');
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            // имитируем клик — перейдёт на '/'
            e.preventDefault();
            window.location.href = btn.href;
        }
    });

    // Вставляем в конец body
    document.addEventListener('DOMContentLoaded', () => {
        // Попытка вставить перед скриптами (если нужно)
        document.body.appendChild(btn);
    });
})();
