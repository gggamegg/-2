// Основной JavaScript файл

document.addEventListener('DOMContentLoaded', function() {
    
    // Мобильное меню
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Форма приемной комиссии
    const admissionsForm = document.getElementById('admissions-form');
    if (admissionsForm) {
        admissionsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Валидация файлов (PDF/A)
            const files = this.querySelectorAll('input[type="file"]');
            let valid = true;
            
            files.forEach(fileInput => {
                const file = fileInput.files[0];
                if (file && !file.name.toLowerCase().endsWith('.pdf')) {
                    valid = false;
                    showNotification('Пожалуйста, загрузите файлы в формате PDF', 'error');
                }
            });
            
            if (valid) {
                // Имитация отправки на сервер
                showNotification('Заявка успешно отправлена!', 'success');
                this.reset();
                
                // Здесь будет вызов API
                // fetch('/api/admissions', { method: 'POST', body: formData })
            }
        });
    }

    // Форма контактов
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Сообщение отправлено! Мы свяжемся с вами.', 'success');
            this.reset();
        });
    }

    // Загрузка расписания
    const loadScheduleBtn = document.getElementById('load-schedule');
    if (loadScheduleBtn) {
        loadScheduleBtn.addEventListener('click', function() {
            const group = document.getElementById('group-select').value;
            const week = document.getElementById('week-select').value;
            
            if (!group) {
                showNotification('Выберите группу', 'error');
                return;
            }
            
            // Имитация загрузки данных
            document.getElementById('schedule-placeholder').classList.add('hidden');
            document.getElementById('schedule-container').classList.remove('hidden');
            
            // Загрузка через REST API
            // fetch(`/api/schedule?group=${group}&week=${week}`)
            loadScheduleData(group);
        });
    }

    // Экспорт расписания
    const exportBtn = document.getElementById('export-ics');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            showNotification('Файл календаря загружен', 'success');
            // Генерация .ics файла
        });
    }

    // Выход из LMS
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Очистка JWT токена
            localStorage.removeItem('jwt_token');
            window.location.href = 'index.html';
        });
    }

    // Проверка аутентификации для LMS
    if (window.location.pathname.includes('lms.html')) {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            window.location.href = 'login.html';
        }
    }
});

// Уведомления
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Загрузка данных расписания
function loadScheduleData(group) {
    const scheduleBody = document.getElementById('schedule-body');
    
    // Пример данных (в реальности - из API)
    const scheduleData = [
        { day: 'Понедельник', time: '08:30-10:00', subject: 'Программирование', teacher: 'Петров А.С.', room: '301' },
        { day: 'Понедельник', time: '10:15-11:45', subject: 'Базы данных', teacher: 'Сидорова Е.В.', room: '302' },
        { day: 'Понедельник', time: '12:00-13:30', subject: 'Веб-разработка', teacher: 'Иванов И.И.', room: '303' },
        { day: 'Вторник', time: '08:30-10:00', subject: 'Математика', teacher: 'Козлова Н.П.', room: '201' },
        { day: 'Вторник', time: '10:15-11:45', subject: 'Английский язык', teacher: 'Смирнова О.А.', room: '205' },
    ];
    
    scheduleBody.innerHTML = scheduleData.map(item => `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3">${item.day}</td>
            <td class="px-4 py-3">${item.time}</td>
            <td class="px-4 py-3 font-semibold">${item.subject}</td>
            <td class="px-4 py-3">${item.teacher}</td>
            <td class="px-4 py-3">${item.room}</td>
        </tr>
    `).join('');
}

// PWA Service Worker регистрация
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.error('SW registration failed:', err));
}

// REST API клиент (для интеграции с Django Backend)
class APIClient {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('jwt_token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    // Методы API
    async getSchedule(group, week) {
        return this.request(`/schedule?group=${group}&week=${week}`);
    }

    async submitAdmission(formData) {
        return this.request('/admissions', {
            method: 'POST',
            body: JSON.stringify(formData),
        });
    }

    async getCourses() {
        return this.request('/lms/courses');
    }
}

// Инициализация API клиента
const api = new APIClient();