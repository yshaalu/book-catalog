let tasks = [];
let currentFilter = 'all';

// ЗАГРУЗКА ИЗ localStorage
function loadTasks() {
    const saved = localStorage.getItem('bookTasks');
    if (saved) {
        try {
            tasks = JSON.parse(saved);
            // Проверяем, что данные корректные
            if (!Array.isArray(tasks)) {
                tasks = getDefaultBooks();
            }
        } catch (e) {
            tasks = getDefaultBooks();
        }
    } else {
        // СТАРТОВЫЕ КНИГИ (загружаются при первом открытии)
        tasks = getDefaultBooks();
        saveTasks();
    }
    render();
}

// СТАРТОВЫЙ НАБОР КНИГ
function getDefaultBooks() {
    return [
        { 
            id: 1, 
            text: 'Мастер и Маргарита', 
            author: 'Михаил Булгаков',
            date: '2026-12-01', 
            priority: 'high', 
            completed: false 
        },
        { 
            id: 2, 
            text: 'Мартин Иден', 
            author: 'Джек Лондон',
            date: '2026-11-20', 
            priority: 'medium', 
            completed: false 
        },
        { 
            id: 3, 
            text: 'Vita Nostra', 
            author: 'Марина и Сергей Дяченко',
            date: '2026-10-15', 
            priority: 'high', 
            completed: false 
        },
        { 
            id: 4, 
            text: 'Гордость и предубеждение', 
            author: 'Джейн Остен',
            date: '2026-09-01', 
            priority: 'low', 
            completed: false 
        },
        { 
            id: 5, 
            text: 'Три товарища', 
            author: 'Эрих Мария Ремарк',
            date: '2026-08-10', 
            priority: 'medium', 
            completed: false 
        },
        { 
            id: 6, 
            text: 'Гарри Поттер и философский камень', 
            author: 'Джоан Роулинг',
            date: '2026-07-05', 
            priority: 'medium', 
            completed: false 
        }
    ];
}

// СОХРАНЕНИЕ В localStorage
function saveTasks() {
    localStorage.setItem('bookTasks', JSON.stringify(tasks));
    updateStats();
}

// ДОБАВЛЕНИЕ ЗАДАЧИ
function addTask() {
    const input = document.getElementById('taskInput');
    const authorInput = document.getElementById('authorInput');
    const dateInput = document.getElementById('dateInput');
    const priorityInput = document.getElementById('priorityInput');

    if (!input || !authorInput || !dateInput || !priorityInput) {
        console.error('Ошибка: не найдены элементы формы');
        return;
    }

    if (input.value.trim() === '') {
        alert('Введите название книги!');
        input.focus();
        return;
    }

    const newTask = {
        id: Date.now(),
        text: input.value.trim(),
        author: authorInput.value.trim() || 'Неизвестный автор',
        date: dateInput.value || new Date().toISOString().split('T')[0],
        priority: priorityInput.value,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    render();

    // Очистка полей
    input.value = '';
    authorInput.value = '';
    dateInput.value = '';
    input.focus();
}

// УДАЛЕНИЕ ВЫДЕЛЕННЫХ
function deleteSelected() {
    const checkboxes = document.querySelectorAll('.task-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('Выберите книги для удаления (отметьте чекбоксы слева)');
        return;
    }
    if (!confirm(`Удалить ${checkboxes.length} книг(и) из списка?`)) return;

    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    tasks = tasks.filter(task => !ids.includes(task.id));
    saveTasks();
    render();
}

// ПЕРЕКЛЮЧЕНИЕ СТАТУСА (выполнено/не выполнено)
function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        render();
    }
}

// УДАЛЕНИЕ ОДНОЙ ЗАДАЧИ
function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    if (!confirm(`Удалить книгу "${task.text}" из списка?`)) return;
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    render();
}

// ПЕРЕМЕЩЕНИЕ ВВЕРХ/ВНИЗ
function moveTask(id, direction) {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
        [tasks[index], tasks[index - 1]] = [tasks[index - 1], tasks[index]];
    } else if (direction === 'down' && index < tasks.length - 1) {
        [tasks[index], tasks[index + 1]] = [tasks[index + 1], tasks[index]];
    } else {
        return;
    }
    saveTasks();
    render();
}

// СОРТИРОВКА ПО ДАТЕ
function sortByDate() {
    if (tasks.length === 0) {
        alert('Список книг пуст. Добавьте книги для сортировки.');
        return;
    }
    tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    saveTasks();
    render();
    alert('📅 Книги отсортированы по дате!');
}

// ФИЛЬТРАЦИЯ
function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filters button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    render();
}

// СТАТИСТИКА
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const remaining = total - completed;
    const statsElement = document.getElementById('stats');
    if (statsElement) {
        statsElement.textContent = 
            `📊 Всего: ${total} | Осталось: ${remaining} | Прочитано: ${completed}`;
    }
}

// ОТРИСОВКА СПИСКА
function render() {
    const container = document.getElementById('taskList');
    if (!container) {
        console.error('Ошибка: элемент taskList не найден');
        return;
    }
    
    let filteredTasks = tasks;
    if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    } else if (currentFilter === 'high') {
        filteredTasks = tasks.filter(t => t.priority === 'high');
    } else if (currentFilter === 'medium') {
        filteredTasks = tasks.filter(t => t.priority === 'medium');
    } else if (currentFilter === 'low') {
        filteredTasks = tasks.filter(t => t.priority === 'low');
    }

    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <p style="color:#999;font-style:italic;padding:40px 0;text-align:center;font-size:18px;">
                📭 Нет книг в этом списке.<br>
                <span style="font-size:14px;color:#bbb;">Добавьте книги через форму выше</span>
            </p>
        `;
        updateStats();
        return;
    }

    container.innerHTML = filteredTasks.map(task => {
        const priorityClass = `priority-${task.priority}`;
        const completedClass = task.completed ? 'completed' : '';
        const priorityEmoji = task.priority === 'high' ? '🔥' : 
                             task.priority === 'medium' ? '📚' : '💤';

        return `
            <div class="task-card ${completedClass} ${priorityClass}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" data-id="${task.id}">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="toggleComplete(${task.id})" style="accent-color:#4caf50; cursor:pointer;">
                <span class="task-text">
                    <strong>${escapeHtml(task.text)}</strong>
                    <span style="color:#6b4c3a;font-size:14px;display:block;margin-top:2px;">
                        ✍️ ${escapeHtml(task.author)}
                    </span>
                </span>
                <span class="task-date">📅 ${task.date}</span>
                <span style="font-size:16px;" title="${task.priority === 'high' ? 'Срочно' : task.priority === 'medium' ? 'В планах' : 'Отложить'}">
                    ${priorityEmoji}
                </span>
                <button onclick="moveTask(${task.id}, 'up')" title="Переместить выше">⬆</button>
                <button onclick="moveTask(${task.id}, 'down')" title="Переместить ниже">⬇</button>
                <button class="delete-btn" onclick="deleteTask(${task.id})" title="Удалить книгу">✕</button>
            </div>
        `;
    }).join('');

    updateStats();
}

// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ БЕЗОПАСНОГО ВЫВОДА ТЕКСТА
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Книжная полка загружена!');
    loadTasks();
    
    // Кнопки фильтров
    document.querySelectorAll('.filters button').forEach(btn => {
        btn.addEventListener('click', function() {
            setFilter(this.dataset.filter);
        });
    });

    // Добавление по Enter в поле названия
    const taskInput = document.getElementById('taskInput');
    if (taskInput) {
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTask();
            }
        });
    }

    // Добавление по Enter в поле автора
    const authorInput = document.getElementById('authorInput');
    if (authorInput) {
        authorInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTask();
            }
        });
    }

    console.log('✅ Всего книг в списке:', tasks.length);
});