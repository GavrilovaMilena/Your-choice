const { useState, useEffect } = React;

// Компонент стартового экрана
const StartScreen = ({ onStart }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [pulseStyle, setPulseStyle] = useState({});

    const handleStart = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        setPulseStyle({
            transformOrigin: `${centerX}px ${centerY}px`,
            display: 'block'
        });
        setIsAnimating(true);
        
        setTimeout(() => {
            setPulseStyle({
                transformOrigin: `${centerX}px ${centerY}px`,
                transform: 'scale(100)',
                opacity: 1,
                display: 'block'
            });
        }, 10);
        
        setTimeout(() => {
            onStart();
        }, 1600);
    };

    return (
        <>
            <div className="start-screen">
                <button className="start-btn" onClick={handleStart}>
                    START
                </button>
            </div>
            {isAnimating && (
                <div 
                    className="pulse-overlay" 
                    style={pulseStyle}
                    onTransitionEnd={() => {
                        const overlay = document.querySelector('.pulse-overlay');
                        if (overlay) overlay.style.display = 'none';
                    }}
                />
            )}
        </>
    );
};

// Компонент уведомления с подсказками
const TipsNotification = ({ onClose, onDontShowAgain }) => {
    const [dontShow, setDontShow] = useState(false);

    const handleDontShowChange = (e) => {
        setDontShow(e.target.checked);
        if (e.target.checked) {
            onDontShowAgain();
            setTimeout(() => onClose(), 300);
        }
    };

    return (
        <div className="tips-notification">
            <div className="notification-header">
                <span className="notification-title">💡 Подсказки дня</span>
                <button className="notification-close" onClick={onClose}>&times;</button>
            </div>
            <div className="notification-body">
                <div className="tip-item">✨ Нажми на иконку ⋮⋮ чтобы перетащить любой блок</div>
                <div className="tip-item">🎨 Нажми на кнопку 🎨 для настройки цветов</div>
                <div className="tip-item">✅ Отмечай выполненные задачи</div>
                <div className="tip-item">➕ Добавляй новые дела</div>
                <div className="tip-item">🔒 Блокируй расположение блоков замком</div>
            </div>
            <div className="notification-footer">
                <label className="dont-show-again">
                    <input type="checkbox" checked={dontShow} onChange={handleDontShowChange} />
                    Больше не показывать
                </label>
            </div>
        </div>
    );
};

// Компонент модального окна кастомизации
const CustomizeModal = ({ isOpen, onClose, colors, onSave, onReset }) => {
    const [localColors, setLocalColors] = useState(colors);

    useEffect(() => {
        setLocalColors(colors);
    }, [colors, isOpen]);

    if (!isOpen) return null;

    const handleChange = (key, value) => {
        setLocalColors(prev => ({ ...prev, [key]: value }));
        // Применяем предпросмотр
        onSave({ ...localColors, [key]: value }, true);
    };

    const handleSave = () => {
        onSave(localColors, false);
        onClose();
    };

    const handleReset = () => {
        const defaultColors = {
            bgPage: '#f0f8ff',
            text: '#1e2a3e',
            cardBg: '#ffffff',
            accent: '#87CEEB'
        };
        setLocalColors(defaultColors);
        onSave(defaultColors, false);
    };

    return (
        <div className="modal" style={{ display: isOpen ? 'block' : 'none' }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Кастомизация внешнего вида</h2>
                    <button className="close-modal" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="customize-section">
                        <label>🎨 Фон страницы</label>
                        <input 
                            type="color" 
                            value={localColors.bgPage}
                            onChange={(e) => handleChange('bgPage', e.target.value)}
                            className="color-circle"
                        />
                    </div>
                    <div className="customize-section">
                        <label>📝 Цвет текста</label>
                        <input 
                            type="color" 
                            value={localColors.text}
                            onChange={(e) => handleChange('text', e.target.value)}
                            className="color-circle"
                        />
                    </div>
                    <div className="customize-section">
                        <label>📦 Фон блоков</label>
                        <input 
                            type="color" 
                            value={localColors.cardBg}
                            onChange={(e) => handleChange('cardBg', e.target.value)}
                            className="color-circle"
                        />
                    </div>
                    <div className="customize-section">
                        <label>✨ Цвет иконок/акцент</label>
                        <input 
                            type="color" 
                            value={localColors.accent}
                            onChange={(e) => handleChange('accent', e.target.value)}
                            className="color-circle"
                        />
                    </div>
                    <div className="modal-buttons">
                        <button className="modal-reset-btn" onClick={handleReset}>
                            Сбросить к стандартным
                        </button>
                        <button className="modal-save-btn" onClick={handleSave}>
                            Сохранить изменения
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Компонент рабочего стола (планер задач)
const Workspace = ({ desktop, onUpdate, onBack, colors, isLocked, onToggleLock }) => {
    const [tasks, setTasks] = useState(desktop.tasks || []);
    const [newTask, setNewTask] = useState('');
    const [draggedItem, setDraggedItem] = useState(null);

    useEffect(() => {
        setTasks(desktop.tasks || []);
    }, [desktop]);

    const saveTasks = (newTasks) => {
        setTasks(newTasks);
        onUpdate({ ...desktop, tasks: newTasks });
    };

    const addTask = () => {
        if (!newTask.trim()) return;
        const newTasks = [...tasks, { id: Date.now(), text: newTask, completed: false }];
        saveTasks(newTasks);
        setNewTask('');
    };

    const toggleTask = (id) => {
        const newTasks = tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks(newTasks);
    };

    const deleteTask = (id) => {
        const newTasks = tasks.filter(task => task.id !== id);
        saveTasks(newTasks);
    };

    const handleDragStart = (e, id) => {
        if (isLocked) {
            e.preventDefault();
            return;
        }
        setDraggedItem(id);
        e.dataTransfer.setData('text/plain', id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        if (isLocked || draggedItem === null) return;
        
        const draggedIndex = tasks.findIndex(t => t.id === draggedItem);
        const targetIndex = tasks.findIndex(t => t.id === targetId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            const newTasks = [...tasks];
            const [removed] = newTasks.splice(draggedIndex, 1);
            newTasks.splice(targetIndex, 0, removed);
            saveTasks(newTasks);
        }
        setDraggedItem(null);
    };

    // Применение цветов
    useEffect(() => {
        document.querySelector('.planner-app')?.style.setProperty('background-color', colors.bgPage);
    }, [colors]);

    return (
        <div className="planner-app" style={{ backgroundColor: colors.bgPage }}>
            <div className="control-panel">
                <button className="back-btn" onClick={onBack}>
                    ← Назад к столам
                </button>
                <div className="control-buttons">
                    <button className="control-btn" onClick={onToggleLock}>
                        <span>{isLocked ? '🔒' : '🔓'}</span>
                    </button>
                </div>
            </div>
            
            <div className="dashboard">
                <div className="card" style={{ backgroundColor: colors.cardBg, borderColor: colors.accent + '80' }}>
                    <div className="card-header">
                        <div className="card-title">
                            <span className="block-icon">📋</span>
                            <span style={{ color: colors.accent }}>Мои задачи</span>
                        </div>
                    </div>
                    <ul className="task-list">
                        {tasks.map(task => (
                            <li 
                                key={task.id}
                                className="task-item"
                                draggable={!isLocked}
                                onDragStart={(e) => handleDragStart(e, task.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, task.id)}
                                style={{ cursor: isLocked ? 'default' : 'grab' }}
                            >
                                <input 
                                    type="checkbox" 
                                    className="task-check"
                                    checked={task.completed}
                                    onChange={() => toggleTask(task.id)}
                                    style={{ accentColor: colors.accent }}
                                />
                                <span className={`task-text ${task.completed ? 'done' : ''}`}>
                                    {task.text}
                                </span>
                                <button 
                                    className="delete-task"
                                    onClick={() => deleteTask(task.id)}
                                >
                                    🗑️
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="add-task-form">
                        <input 
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTask()}
                            placeholder="Новая задача..."
                        />
                        <button onClick={addTask} style={{ backgroundColor: colors.accent }}>
                            + Добавить
                        </button>
                    </div>
                </div>
            </div>
            <div className="info-text" style={{ color: colors.text }}>
                ✨ Небесный планер | Перемещай задачи, если стол разблокирован ✨
            </div>
        </div>
    );
};

// Компонент выбора рабочего стола
const DesktopsScreen = ({ desktops, onCreateDesktop, onSelectDesktop, onDeleteDesktop }) => {
    return (
        <div className="desktops-screen">
            <div className="desktops-header">
                <h1>📋 Мои столы</h1>
                <p>Выберите рабочий стол или создайте новый</p>
            </div>
            <div className="desktops-grid">
                {/* Карточка создания нового стола */}
                <div className="desktop-card add-desktop-card" onClick={onCreateDesktop}>
                    <div className="add-icon">➕</div>
                    <h3>Создать новый стол</h3>
                    <p>Нажмите чтобы добавить</p>
                </div>
                
                {/* Существующие столы */}
                {desktops.map(desktop => (
                    <div key={desktop.id} className="desktop-card" onClick={() => onSelectDesktop(desktop.id)}>
                        <button 
                            className="desktop-delete"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Удалить стол "${desktop.name}"?`)) {
                                    onDeleteDesktop(desktop.id);
                                }
                            }}
                        >
                            🗑️
                        </button>
                        <div className="desktop-title">📌 {desktop.name}</div>
                        <div className="desktop-stats">
                            <span>✅ {desktop.tasks?.filter(t => t.completed).length || 0} выполнено</span>
                            <span>📝 {desktop.tasks?.length || 0} всего</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Главный компонент приложения
const App = () => {
    const [showStart, setShowStart] = useState(true);
    const [desktops, setDesktops] = useState([]);
    const [currentDesktop, setCurrentDesktop] = useState(null);
    const [colors, setColors] = useState({
        bgPage: '#f0f8ff',
        text: '#1e2a3e',
        cardBg: '#ffffff',
        accent: '#87CEEB'
    });
    const [isLocked, setIsLocked] = useState(false);
    const [showTips, setShowTips] = useState(false);
    const [showCustomize, setShowCustomize] = useState(false);

    // Загрузка данных из localStorage
    useEffect(() => {
        const savedDesktops = localStorage.getItem('skyPlanner_desktops');
        const savedColors = localStorage.getItem('skyPlanner_colors');
        const savedLocked = localStorage.getItem('skyPlanner_locked');
        const dontShowTips = localStorage.getItem('skyPlanner_dontShowTips');

        if (savedDesktops) {
            const parsed = JSON.parse(savedDesktops);
            setDesktops(parsed);
            if (parsed.length === 0) {
                setShowStart(true);
            } else {
                setShowStart(false);
            }
        } else {
            setShowStart(true);
        }

        if (savedColors) {
            setColors(JSON.parse(savedColors));
        }

        if (savedLocked) {
            setIsLocked(JSON.parse(savedLocked));
        }

        if (!dontShowTips && savedDesktops && JSON.parse(savedDesktops).length > 0) {
            setTimeout(() => setShowTips(true), 1000);
        }
    }, []);

    // Сохранение данных
    useEffect(() => {
        if (desktops.length > 0 || !showStart) {
            localStorage.setItem('skyPlanner_desktops', JSON.stringify(desktops));
        }
    }, [desktops]);

    useEffect(() => {
        localStorage.setItem('skyPlanner_colors', JSON.stringify(colors));
        // Применяем цвета глобально
        document.body.style.backgroundColor = colors.bgPage;
    }, [colors]);

    useEffect(() => {
        localStorage.setItem('skyPlanner_locked', JSON.stringify(isLocked));
    }, [isLocked]);

    const handleStart = () => {
        setShowStart(false);
        // Создаем первый дефолтный стол
        const defaultDesktop = {
            id: Date.now(),
            name: 'Мой первый стол',
            tasks: [
                { id: 1, text: 'Создать красивый планер ✨', completed: false },
                { id: 2, text: 'Настроить цвета под настроение', completed: false },
                { id: 3, text: 'Перемещать задачи', completed: false }
            ]
        };
        setDesktops([defaultDesktop]);
        setCurrentDesktop(defaultDesktop);
        
        setTimeout(() => {
            setShowTips(true);
        }, 1000);
    };

    const createNewDesktop = () => {
        const name = prompt('Введите название нового рабочего стола:', 'Новый стол');
        if (!name) return;
        
        const newDesktop = {
            id: Date.now(),
            name: name,
            tasks: []
        };
        setDesktops(prev => [...prev, newDesktop]);
        setCurrentDesktop(newDesktop);
    };

    const selectDesktop = (id) => {
        const desktop = desktops.find(d => d.id === id);
        setCurrentDesktop(desktop);
    };

    const deleteDesktop = (id) => {
        setDesktops(prev => prev.filter(d => d.id !== id));
        if (currentDesktop?.id === id) {
            setCurrentDesktop(null);
        }
    };

    const updateDesktop = (updatedDesktop) => {
        setDesktops(prev => prev.map(d => 
            d.id === updatedDesktop.id ? updatedDesktop : d
        ));
    };

    const saveColorsHandler = (newColors, isPreview) => {
        setColors(newColors);
        if (!isPreview) {
            localStorage.setItem('skyPlanner_colors', JSON.stringify(newColors));
        }
    };

    const handleDontShowTips = () => {
        localStorage.setItem('skyPlanner_dontShowTips', 'true');
    };

    // Если показываем стартовый экран
    if (showStart) {
        return <StartScreen onStart={handleStart} />;
    }

    // Если выбран конкретный рабочий стол
    if (currentDesktop) {
        return (
            <>
                <Workspace 
                    desktop={currentDesktop}
                    onUpdate={updateDesktop}
                    onBack={() => setCurrentDesktop(null)}
                    colors={colors}
                    isLocked={isLocked}
                    onToggleLock={() => setIsLocked(!isLocked)}
                />
                {showTips && (
                    <TipsNotification 
                        onClose={() => setShowTips(false)}
                        onDontShowAgain={handleDontShowTips}
                    />
                )}
                <CustomizeModal 
                    isOpen={showCustomize}
                    onClose={() => setShowCustomize(false)}
                    colors={colors}
                    onSave={saveColorsHandler}
                />
            </>
        );
    }

    // Показываем список столов
    return (
        <>
            <DesktopsScreen 
                desktops={desktops}
                onCreateDesktop={createNewDesktop}
                onSelectDesktop={selectDesktop}
                onDeleteDesktop={deleteDesktop}
            />
            {showTips && (
                <TipsNotification 
                    onClose={() => setShowTips(false)}
                    onDontShowAgain={handleDontShowTips}
                />
            )}
            <CustomizeModal 
                isOpen={showCustomize}
                onClose={() => setShowCustomize(false)}
                colors={colors}
                onSave={saveColorsHandler}
            />
        </>
    );
};

// Рендерим приложение
ReactDOM.createRoot(document.getElementById('root')).render(<App />);