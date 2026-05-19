const { useState, useEffect } = React;

// Кастомный диалог
const CustomDialog = ({ isOpen, title, defaultValue, onConfirm, onCancel }) => {
    const [value, setValue] = useState(defaultValue || '');

    useEffect(() => {
        setValue(defaultValue || '');
    }, [defaultValue, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="custom-dialog-overlay" onClick={onCancel}>
            <div className="custom-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="dialog-header">
                    <h3>{title}</h3>
                </div>
                <div className="dialog-body">
                    <input 
                        type="text" 
                        value={value} 
                        onChange={(e) => setValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && onConfirm(value)}
                        autoFocus
                    />
                </div>
                <div className="dialog-footer">
                    <button className="dialog-btn dialog-btn-cancel" onClick={onCancel}>Отмена</button>
                    <button className="dialog-btn dialog-btn-confirm" onClick={() => onConfirm(value)}>Сохранить</button>
                </div>
            </div>
        </div>
    );
};

// Компонент стартового экрана
const StartScreen = ({ onStart }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldHide, setShouldHide] = useState(false);

    const handleStart = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        setIsAnimating(true);
        
        const pulseLayer = document.createElement('div');
        pulseLayer.className = 'pulse-overlay';
        pulseLayer.style.transformOrigin = `${centerX}px ${centerY}px`;
        document.body.appendChild(pulseLayer);
        
        setTimeout(() => {
            pulseLayer.style.transform = 'scale(100)';
            pulseLayer.style.opacity = '1';
        }, 10);
        
        setTimeout(() => setShouldHide(true), 300);
        
        setTimeout(() => {
            pulseLayer.style.opacity = '0';
            setTimeout(() => pulseLayer.remove(), 500);
            onStart();
        }, 1600);
    };

    return (
        <div className="start-screen" style={{ opacity: shouldHide ? 0 : 1, transition: 'opacity 0.5s ease' }}>
            <button className="start-btn" onClick={handleStart}
                style={{ transform: isAnimating ? 'scale(0.8)' : 'scale(1)', opacity: isAnimating ? 0 : 1, transition: 'transform 0.4s ease, opacity 0.4s ease' }}>
                START
            </button>
        </div>
    );
};

// Компонент уведомления
const TipsNotification = ({ onClose, onDontShowAgain }) => {
    const [dontShow, setDontShow] = useState(false);

    const handleDontShowChange = (e) => {
        setDontShow(e.target.checked);
        if (e.target.checked) {
            onDontShowAgain();
            setTimeout(onClose, 300);
        }
    };

    return (
        <div className="tips-notification">
            <div className="notification-header">
                <span>💡 Подсказки дня</span>
                <button className="notification-close" onClick={onClose}>&times;</button>
            </div>
            <div className="notification-body">
                <div className="tip-item">✨ Перетаскивай задачи (если стол разблокирован)</div>
                <div className="tip-item">🎨 Настрой цвета через кнопку 🎨</div>
                <div className="tip-item">✅ Отмечай выполненные задачи</div>
                <div className="tip-item">📋 Создавай несколько столов</div>
                <div className="tip-item">✏️ Дважды кликни по названию стола для изменения</div>
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

// Модальное окно кастомизации
const CustomizeModal = ({ isOpen, onClose, colors, onSave }) => {
    const [localColors, setLocalColors] = useState(colors);

    useEffect(() => {
        setLocalColors(colors);
    }, [colors, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(localColors, false);
        onClose();
    };

    const handleReset = () => {
        const defaultColors = { bgPage: '#f0f8ff', text: '#1e2a3e', cardBg: '#ffffff', accent: '#87CEEB' };
        setLocalColors(defaultColors);
        onSave(defaultColors, false);
    };

    return (
        <div className="modal" style={{ display: 'block' }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Кастомизация</h2>
                    <button className="close-modal" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="customize-section">
                        <label>🎨 Фон страницы</label>
                        <input type="color" value={localColors.bgPage} onChange={(e) => setLocalColors({...localColors, bgPage: e.target.value})} className="color-circle" />
                    </div>
                    <div className="customize-section">
                        <label>📝 Цвет текста</label>
                        <input type="color" value={localColors.text} onChange={(e) => setLocalColors({...localColors, text: e.target.value})} className="color-circle" />
                    </div>
                    <div className="customize-section">
                        <label>📦 Фон блоков</label>
                        <input type="color" value={localColors.cardBg} onChange={(e) => setLocalColors({...localColors, cardBg: e.target.value})} className="color-circle" />
                    </div>
                    <div className="customize-section">
                        <label>✨ Акцент</label>
                        <input type="color" value={localColors.accent} onChange={(e) => setLocalColors({...localColors, accent: e.target.value})} className="color-circle" />
                    </div>
                    <div className="modal-buttons">
                        <button className="modal-reset-btn" onClick={handleReset}>Сбросить</button>
                        <button className="modal-save-btn" onClick={handleSave}>Сохранить</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Компонент рабочего стола
const Workspace = ({ desktop, onUpdate, onBack, colors, isLocked, onToggleLock, onOpenCustomize }) => {
    const [tasks, setTasks] = useState(desktop.tasks || []);
    const [newTask, setNewTask] = useState('');

    const saveTasks = (newTasks) => {
        setTasks(newTasks);
        onUpdate({ ...desktop, tasks: newTasks });
    };

    const addTask = () => {
        if (!newTask.trim()) return;
        saveTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
        setNewTask('');
    };

    const toggleTask = (id) => {
        saveTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id) => {
        saveTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <div className="planner-app" style={{ backgroundColor: colors.bgPage }}>
            <div className="control-panel">
                <button className="back-btn" onClick={onBack}>← Назад к столам</button>
                <div className="control-buttons">
                    <button className="control-btn" onClick={onOpenCustomize}>🎨</button>
                    <button className="control-btn" onClick={onToggleLock}>{isLocked ? '🔒' : '🔓'}</button>
                </div>
            </div>
            <div className="dashboard">
                <div className="card" style={{ backgroundColor: colors.cardBg, borderColor: colors.accent + '80' }}>
                    <div className="card-header">
                        <div className="card-title">
                            <span>📋</span>
                            <span style={{ color: colors.accent }}>Мои задачи</span>
                        </div>
                    </div>
                    <ul className="task-list">
                        {tasks.map(task => (
                            <li key={task.id} className="task-item">
                                <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} style={{ accentColor: colors.accent }} />
                                <span className={`task-text ${task.completed ? 'done' : ''}`} style={{ color: colors.text }}>{task.text}</span>
                                <button className="delete-task" onClick={() => deleteTask(task.id)}>🗑️</button>
                            </li>
                        ))}
                    </ul>
                    <div className="add-task-form">
                        <input value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTask()} placeholder="Новая задача..." />
                        <button onClick={addTask} style={{ backgroundColor: colors.accent }}>+ Добавить</button>
                    </div>
                </div>
            </div>
            <div className="info-text" style={{ color: colors.text }}>✨ Небесный планер | Перемещай задачи, если стол разблокирован ✨</div>
        </div>
    );
};

// Компонент выбора рабочего стола
const DesktopsScreen = ({ desktops, onCreateDesktop, onSelectDesktop, onDeleteDesktop, onRenameDesktop }) => {
    const [showTooltipId, setShowTooltipId] = useState(null);

    useEffect(() => {
        const tooltipShown = localStorage.getItem('skyPlanner_renameTooltip');
        if (!tooltipShown && desktops.length > 0) {
            setShowTooltipId(desktops[0].id);
            setTimeout(() => {
                setShowTooltipId(null);
                localStorage.setItem('skyPlanner_renameTooltip', 'true');
            }, 5000);
        }
    }, [desktops]);

    const handleTitleClick = (desktop, e) => {
        e.stopPropagation();
        onRenameDesktop(desktop.id, desktop.name);
    };

    return (
        <div className="desktops-screen">
            <div className="desktops-header">
                <h1>Your choice</h1>
                <p className="subtitle">your choice - your decisions</p>
            </div>
            <div className="desktops-grid">
                <div className="desktop-card add-desktop-card" onClick={onCreateDesktop}>
                    <div className="add-icon">➕</div>
                    <h3>Создать новый стол</h3>
                </div>
                {desktops.map(desktop => (
                    <div key={desktop.id} className="desktop-card" onClick={() => onSelectDesktop(desktop.id)}>
                        <button className="desktop-delete" onClick={(e) => { e.stopPropagation(); onDeleteDesktop(desktop.id); }}>🗑️</button>
                        <div className="desktop-title" onClick={(e) => handleTitleClick(desktop, e)}>📌 {desktop.name}</div>
                        <div className="desktop-stats">
                            <span>✅ {desktop.tasks?.filter(t => t.completed).length || 0} выполнено</span>
                            <span>📝 {desktop.tasks?.length || 0} всего</span>
                        </div>
                        {showTooltipId === desktop.id && (
                            <div className="rename-tooltip">
                                ✏️ Нажми на название, чтобы изменить
                                <div className="tooltip-arrow">👇</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Главный компонент
const App = () => {
    const [showStart, setShowStart] = useState(true);
    const [desktops, setDesktops] = useState([]);
    const [currentDesktopId, setCurrentDesktopId] = useState(null);
    const [colors, setColors] = useState({ bgPage: '#f0f8ff', text: '#1e2a3e', cardBg: '#ffffff', accent: '#87CEEB' });
    const [isLocked, setIsLocked] = useState(false);
    const [showTips, setShowTips] = useState(false);
    const [showCustomize, setShowCustomize] = useState(false);
    const [renameDialog, setRenameDialog] = useState({ isOpen: false, desktopId: null, currentName: '' });
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, desktopId: null, desktopName: '' });

    // Загрузка данных
    useEffect(() => {
        const savedDesktops = localStorage.getItem('skyPlanner_desktops');
        const savedColors = localStorage.getItem('skyPlanner_colors');
        const savedLocked = localStorage.getItem('skyPlanner_locked');
        const savedCurrentDesktop = localStorage.getItem('skyPlanner_currentDesktop');
        const dontShowTips = localStorage.getItem('skyPlanner_dontShowTips');

        if (savedDesktops) {
            const parsed = JSON.parse(savedDesktops);
            setDesktops(parsed);
            if (parsed.length === 0) {
                setShowStart(true);
            } else {
                setShowStart(false);
                // Восстанавливаем текущий стол
                if (savedCurrentDesktop) {
                    const currentId = parseInt(savedCurrentDesktop);
                    if (parsed.some(d => d.id === currentId)) {
                        setCurrentDesktopId(currentId);
                    }
                }
            }
        } else {
            setShowStart(true);
        }

        if (savedColors) setColors(JSON.parse(savedColors));
        if (savedLocked) setIsLocked(JSON.parse(savedLocked));
        if (!dontShowTips && savedDesktops && JSON.parse(savedDesktops).length > 0) {
            setTimeout(() => setShowTips(true), 1000);
        }
    }, []);

    // Сохранение данных
    useEffect(() => {
        localStorage.setItem('skyPlanner_desktops', JSON.stringify(desktops));
        localStorage.setItem('skyPlanner_currentDesktop', currentDesktopId || '');
    }, [desktops, currentDesktopId]);

    useEffect(() => {
        localStorage.setItem('skyPlanner_colors', JSON.stringify(colors));
    }, [colors]);

    useEffect(() => {
        localStorage.setItem('skyPlanner_locked', JSON.stringify(isLocked));
    }, [isLocked]);

    const currentDesktop = desktops.find(d => d.id === currentDesktopId);

    const handleStart = () => {
        setShowStart(false);
        setDesktops([]);
        setTimeout(() => setShowTips(true), 500);
    };

    const createNewDesktop = () => {
        setRenameDialog({ isOpen: true, desktopId: null, currentName: '' });
    };

    const handleRenameConfirm = (newName) => {
        if (!newName || !newName.trim()) return;
        if (renameDialog.desktopId === null) {
            // Создание нового стола
            const newDesktop = { id: Date.now(), name: newName.trim(), tasks: [] };
            setDesktops(prev => [...prev, newDesktop]);
            setCurrentDesktopId(newDesktop.id);
        } else {
            // Переименование существующего
            setDesktops(prev => prev.map(d => d.id === renameDialog.desktopId ? { ...d, name: newName.trim() } : d));
        }
        setRenameDialog({ isOpen: false, desktopId: null, currentName: '' });
    };

    const handleDeleteDesktop = (id, name) => {
        setDeleteDialog({ isOpen: true, desktopId: id, desktopName: name });
    };

    const handleDeleteConfirm = () => {
        setDesktops(prev => prev.filter(d => d.id !== deleteDialog.desktopId));
        if (currentDesktopId === deleteDialog.desktopId) setCurrentDesktopId(null);
        setDeleteDialog({ isOpen: false, desktopId: null, desktopName: '' });
    };

    const selectDesktop = (id) => {
        setCurrentDesktopId(id);
    };

    const updateDesktop = (updatedDesktop) => {
        setDesktops(prev => prev.map(d => d.id === updatedDesktop.id ? updatedDesktop : d));
    };

    const saveColorsHandler = (newColors) => {
        setColors(newColors);
    };

    const handleDontShowTips = () => {
        localStorage.setItem('skyPlanner_dontShowTips', 'true');
    };

    if (showStart) return <StartScreen onStart={handleStart} />;
    if (currentDesktop) {
        return (
            <>
                <Workspace desktop={currentDesktop} onUpdate={updateDesktop} onBack={() => setCurrentDesktopId(null)} colors={colors} isLocked={isLocked} onToggleLock={() => setIsLocked(!isLocked)} onOpenCustomize={() => setShowCustomize(true)} />
                {showTips && <TipsNotification onClose={() => setShowTips(false)} onDontShowAgain={handleDontShowTips} />}
                <CustomizeModal isOpen={showCustomize} onClose={() => setShowCustomize(false)} colors={colors} onSave={saveColorsHandler} />
            </>
        );
    }
    return (
        <>
            <DesktopsScreen desktops={desktops} onCreateDesktop={createNewDesktop} onSelectDesktop={selectDesktop} onDeleteDesktop={handleDeleteDesktop} onRenameDesktop={(id, currentName) => setRenameDialog({ isOpen: true, desktopId: id, currentName })} />
            {showTips && <TipsNotification onClose={() => setShowTips(false)} onDontShowAgain={handleDontShowTips} />}
            <CustomizeModal isOpen={showCustomize} onClose={() => setShowCustomize(false)} colors={colors} onSave={saveColorsHandler} />
            <CustomDialog isOpen={renameDialog.isOpen} title={renameDialog.desktopId === null ? "Название нового стола" : "Изменить название"} defaultValue={renameDialog.currentName} onConfirm={handleRenameConfirm} onCancel={() => setRenameDialog({ isOpen: false, desktopId: null, currentName: '' })} />
            <CustomDialog isOpen={deleteDialog.isOpen} title="Удалить стол?" defaultValue={deleteDialog.desktopName} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteDialog({ isOpen: false, desktopId: null, desktopName: '' })} />
        </>
    );
};

const root = document.getElementById('root');
ReactDOM.createRoot(root).render(<App />);