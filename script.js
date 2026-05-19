// ДОМ элементы
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const pulseLayer = document.getElementById('pulseLayer');
const plannerApp = document.getElementById('plannerApp');
const lockToggleBtn = document.getElementById('lockToggleBtn');
const customizeBtn = document.getElementById('customizeBtn');
const customizeModal = document.getElementById('customizeModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveColorsBtn = document.getElementById('saveColorsBtn');
const resetColorsBtn = document.getElementById('resetColorsBtn');
const dashboard = document.getElementById('dashboardContainer');
const tipsNotification = document.getElementById('tipsNotification');
const closeNotificationBtn = document.getElementById('closeNotificationBtn');
const dontShowAgainCheckbox = document.getElementById('dontShowAgainCheckbox');

// Состояние блокировки рабочего стола
let isDesktopLocked = false;

// ------------------- АНИМАЦИЯ ПУЛЬСАЦИИ -------------------
function startPulseAndOpenPlanner() {
    const rect = startBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    pulseLayer.style.transformOrigin = `${centerX}px ${centerY}px`;
    pulseLayer.style.opacity = '1';
    pulseLayer.style.transform = 'scale(0)';
    pulseLayer.style.transition = 'none';
    pulseLayer.offsetHeight;
    pulseLayer.style.transition = 'transform 0.9s cubic-bezier(0.2, 0.9, 0.4, 1.1), opacity 0.8s ease';
    pulseLayer.style.transform = 'scale(70)';
    pulseLayer.style.opacity = '1';
    
    setTimeout(() => {
        startScreen.style.opacity = '0';
        startScreen.style.visibility = 'hidden';
        plannerApp.style.display = 'block';
        pulseLayer.style.opacity = '0';
        pulseLayer.style.transform = 'scale(0)';
        setTimeout(() => {
            pulseLayer.style.display = 'none';
        }, 400);
        // Показываем уведомление после открытия планера
        showTipsNotification();
    }, 850);
}

startBtn.addEventListener('click', startPulseAndOpenPlanner);

// ------------------- УПРАВЛЕНИЕ ПОДСКАЗКАМИ -------------------
function showTipsNotification() {
    const dontShow = localStorage.getItem('skyPlanner_dontShowTips');
    if (dontShow === 'true') {
        return;
    }
    tipsNotification.style.display = 'block';
}

function closeNotification() {
    tipsNotification.style.display = 'none';
}

closeNotificationBtn.addEventListener('click', closeNotification);

dontShowAgainCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
        localStorage.setItem('skyPlanner_dontShowTips', 'true');
        closeNotification();
    } else {
        localStorage.setItem('skyPlanner_dontShowTips', 'false');
    }
});

// ------------------- МОДАЛЬНОЕ ОКНО КАСТОМИЗАЦИИ -------------------
function openModal() {
    customizeModal.style.display = 'block';
}

function closeModal() {
    customizeModal.style.display = 'none';
}

customizeBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === customizeModal) {
        closeModal();
    }
});

// ------------------- УПРАВЛЕНИЕ ЗАДАЧАМИ -------------------
const taskListEl = document.getElementById('taskList');
const newTaskInput = document.getElementById('newTaskInput');
const addTaskBtn = document.getElementById('addTaskBtn');

function bindTaskEvents() {
    document.querySelectorAll('.task-item').forEach(item => {
        const checkbox = item.querySelector('.task-check');
        const taskSpan = item.querySelector('.task-text');
        const delBtn = item.querySelector('.delete-task');
        
        if (checkbox && !checkbox.hasAttribute('data-listener')) {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) taskSpan.classList.add('done');
                else taskSpan.classList.remove('done');
                saveTasksToLocal();
            });
            checkbox.setAttribute('data-listener', 'true');
        }
        if (delBtn && !delBtn.hasAttribute('data-listener')) {
            delBtn.addEventListener('click', () => {
                item.remove();
                saveTasksToLocal();
            });
            delBtn.setAttribute('data-listener', 'true');
        }
    });
}

function saveTasksToLocal() {
    const tasks = [];
    document.querySelectorAll('.task-item').forEach(item => {
        const textSpan = item.querySelector('.task-text');
        const checkbox = item.querySelector('.task-check');
        tasks.push({
            text: textSpan.innerText,
            completed: checkbox.checked
        });
    });
    localStorage.setItem('skyPlanner_tasks', JSON.stringify(tasks));
}

function loadTasksFromLocal() {
    const saved = localStorage.getItem('skyPlanner_tasks');
    if (saved && JSON.parse(saved).length > 0) {
        const tasks = JSON.parse(saved);
        taskListEl.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            const chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.className = 'task-check';
            chk.checked = task.completed;
            const span = document.createElement('span');
            span.className = 'task-text' + (task.completed ? ' done' : '');
            span.innerText = task.text;
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-task';
            delBtn.innerText = '🗑️';
            li.appendChild(chk);
            li.appendChild(span);
            li.appendChild(delBtn);
            taskListEl.appendChild(li);
        });
        bindTaskEvents();
    } else {
        const defaultTasks = [
            { text: "Создать красивый планер ✨", completed: false },
            { text: "Настроить цвета под настроение", completed: false },
            { text: "Перемещать блоки куда угодно", completed: false }
        ];
        taskListEl.innerHTML = '';
        defaultTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            const chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.className = 'task-check';
            chk.checked = task.completed;
            const span = document.createElement('span');
            span.className = 'task-text' + (task.completed ? ' done' : '');
            span.innerText = task.text;
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-task';
            delBtn.innerText = '🗑️';
            li.appendChild(chk);
            li.appendChild(span);
            li.appendChild(delBtn);
            taskListEl.appendChild(li);
        });
        bindTaskEvents();
        saveTasksToLocal();
    }
}

addTaskBtn.addEventListener('click', () => {
    const newText = newTaskInput.value.trim();
    if (newText === '') return;
    const li = document.createElement('li');
    li.className = 'task-item';
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.className = 'task-check';
    const span = document.createElement('span');
    span.className = 'task-text';
    span.innerText = newText;
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-task';
    delBtn.innerText = '🗑️';
    li.appendChild(chk);
    li.appendChild(span);
    li.appendChild(delBtn);
    taskListEl.appendChild(li);
    newTaskInput.value = '';
    bindTaskEvents();
    saveTasksToLocal();
});

// ------------------- КАСТОМИЗАЦИЯ ЦВЕТОВ -------------------
const bgPageColor = document.getElementById('bgPageColor');
const textColor = document.getElementById('textColor');
const cardBgColor = document.getElementById('cardBgColor');
const accentColor = document.getElementById('accentColor');

// Стандартные цвета
const defaultColors = {
    bgPage: '#f0f8ff',
    text: '#1e2a3e',
    cardBg: '#ffffff',
    accent: '#87CEEB'
};

// Временное хранилище для предпросмотра
let tempColors = { ...defaultColors };

function applyColors(colors) {
    plannerApp.style.backgroundColor = colors.bgPage;
    document.querySelectorAll('.planner-app, .planner-app *').forEach(el => {
        if (!el.classList || (!el.classList.contains('color-input') && el.tagName !== 'INPUT' && el.tagName !== 'BUTTON' && !el.closest('.customize-section') && !el.closest('.modal'))) {
            el.style.color = colors.text;
        }
    });
    document.querySelectorAll('.card-title .block-icon, .card-title span').forEach(icon => {
        icon.style.color = colors.accent;
    });
    document.querySelectorAll('.card').forEach(card => {
        card.style.backgroundColor = colors.cardBg;
        card.style.borderColor = colors.accent + '80';
    });
    const addBtns = document.querySelectorAll('.add-task-form button');
    addBtns.forEach(btn => btn.style.backgroundColor = colors.accent);
    document.querySelectorAll('.modal-save-btn, .icon-btn, .control-btn').forEach(btn => {
        btn.style.color = colors.accent;
        btn.style.borderColor = colors.accent + '80';
    });
    document.querySelectorAll('.modal-save-btn').forEach(btn => {
        btn.style.backgroundColor = colors.accent;
    });
}

function saveColorsToLocal(colors) {
    localStorage.setItem('skyPlanner_colors', JSON.stringify(colors));
}

function loadColorsFromLocal() {
    const saved = localStorage.getItem('skyPlanner_colors');
    if (saved) {
        const cols = JSON.parse(saved);
        tempColors = { ...cols };
        bgPageColor.value = cols.bgPage;
        textColor.value = cols.text;
        cardBgColor.value = cols.cardBg;
        accentColor.value = cols.accent;
        applyColors(cols);
    } else {
        resetToDefaultColors();
    }
}

function resetToDefaultColors() {
    tempColors = { ...defaultColors };
    bgPageColor.value = defaultColors.bgPage;
    textColor.value = defaultColors.text;
    cardBgColor.value = defaultColors.cardBg;
    accentColor.value = defaultColors.accent;
    applyColors(defaultColors);
}

function previewColors() {
    const preview = {
        bgPage: bgPageColor.value,
        text: textColor.value,
        cardBg: cardBgColor.value,
        accent: accentColor.value
    };
    applyColors(preview);
}

function saveColors() {
    tempColors = {
        bgPage: bgPageColor.value,
        text: textColor.value,
        cardBg: cardBgColor.value,
        accent: accentColor.value
    };
    applyColors(tempColors);
    saveColorsToLocal(tempColors);
    closeModal();
}

// Предпросмотр при изменении цветов в модалке
bgPageColor.addEventListener('input', previewColors);
textColor.addEventListener('input', previewColors);
cardBgColor.addEventListener('input', previewColors);
accentColor.addEventListener('input', previewColors);

resetColorsBtn.addEventListener('click', () => {
    resetToDefaultColors();
    bgPageColor.value = defaultColors.bgPage;
    textColor.value = defaultColors.text;
    cardBgColor.value = defaultColors.cardBg;
    accentColor.value = defaultColors.accent;
});

saveColorsBtn.addEventListener('click', saveColors);

// ------------------- DRAG & DROP С БЛОКИРОВКОЙ -------------------
let draggedItem = null;

function updateDragState() {
    const handles = document.querySelectorAll('.drag-handle');
    if (isDesktopLocked) {
        handles.forEach(handle => {
            handle.setAttribute('draggable', 'false');
            handle.classList.add('drag-handle-disabled');
        });
        lockToggleBtn.querySelector('.lock-icon').innerHTML = '🔒';
        lockToggleBtn.title = 'Разблокировать перемещение блоков';
    } else {
        handles.forEach(handle => {
            handle.setAttribute('draggable', 'true');
            handle.classList.remove('drag-handle-disabled');
        });
        lockToggleBtn.querySelector('.lock-icon').innerHTML = '🔓';
        lockToggleBtn.title = 'Заблокировать перемещение блоков';
    }
}

function toggleDesktopLock() {
    isDesktopLocked = !isDesktopLocked;
    updateDragState();
    localStorage.setItem('skyPlanner_locked', JSON.stringify(isDesktopLocked));
}

lockToggleBtn.addEventListener('click', toggleDesktopLock);

function setupDragAndDrop() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.removeEventListener('dragover', card._dragoverHandler);
        card.removeEventListener('dragleave', card._dragleaveHandler);
        card.removeEventListener('drop', card._dropHandler);
        
        const dragoverHandler = (e) => {
            if (isDesktopLocked) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            card.classList.add('drag-over');
        };
        
        const dragleaveHandler = () => {
            card.classList.remove('drag-over');
        };
        
        const dropHandler = (e) => {
            if (isDesktopLocked) return;
            e.preventDefault();
            card.classList.remove('drag-over');
            if (!draggedItem || draggedItem === card) return;
            
            const parent = dashboard;
            const children = Array.from(parent.children);
            const fromIndex = children.indexOf(draggedItem);
            const toIndex = children.indexOf(card);
            
            if (fromIndex < toIndex) {
                parent.insertBefore(draggedItem, card.nextSibling);
            } else {
                parent.insertBefore(draggedItem, card);
            }
            saveOrderToLocal();
        };
        
        card._dragoverHandler = dragoverHandler;
        card._dragleaveHandler = dragleaveHandler;
        card._dropHandler = dropHandler;
        
        card.addEventListener('dragover', dragoverHandler);
        card.addEventListener('dragleave', dragleaveHandler);
        card.addEventListener('drop', dropHandler);
    });
    
    const handles = document.querySelectorAll('.drag-handle');
    handles.forEach(handle => {
        handle.removeEventListener('dragstart', handle._dragstartHandler);
        handle.removeEventListener('dragend', handle._dragendHandler);
        
        const dragstartHandler = (e) => {
            if (isDesktopLocked) {
                e.preventDefault();
                return false;
            }
            const card = handle.closest('.card');
            draggedItem = card;
            e.dataTransfer.setData('text/plain', card.id);
            e.dataTransfer.effectAllowed = 'move';
            card.style.opacity = '0.6';
        };
        
        const dragendHandler = () => {
            if (draggedItem) draggedItem.style.opacity = '';
            draggedItem = null;
            document.querySelectorAll('.card').forEach(c => c.classList.remove('drag-over'));
        };
        
        handle._dragstartHandler = dragstartHandler;
        handle._dragendHandler = dragendHandler;
        
        handle.addEventListener('dragstart', dragstartHandler);
        handle.addEventListener('dragend', dragendHandler);
    });
}

function saveOrderToLocal() {
    const order = [];
    document.querySelectorAll('.card').forEach(card => {
        order.push(card.id);
    });
    localStorage.setItem('skyPlanner_order', JSON.stringify(order));
}

function loadOrderFromLocal() {
    const savedOrder = localStorage.getItem('skyPlanner_order');
    if (savedOrder) {
        const orderIds = JSON.parse(savedOrder);
        const cardsMap = new Map();
        document.querySelectorAll('.card').forEach(card => cardsMap.set(card.id, card));
        const fragment = document.createDocumentFragment();
        for (let id of orderIds) {
            if (cardsMap.has(id)) {
                fragment.appendChild(cardsMap.get(id));
                cardsMap.delete(id);
            }
        }
        for (let leftover of cardsMap.values()) fragment.appendChild(leftover);
        dashboard.innerHTML = '';
        dashboard.appendChild(fragment);
        setupDragAndDrop();
    }
}

function loadLockState() {
    const savedLock = localStorage.getItem('skyPlanner_locked');
    if (savedLock !== null) {
        isDesktopLocked = JSON.parse(savedLock);
    } else {
        isDesktopLocked = false;
    }
    updateDragState();
}

// ------------------- ИНИЦИАЛИЗАЦИЯ -------------------
function init() {
    loadTasksFromLocal();
    loadColorsFromLocal();
    loadOrderFromLocal();
    loadLockState();
    setupDragAndDrop();
    bindTaskEvents();
}

init();