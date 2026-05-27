const { useState, useEffect, useRef } = React;

// Ключ для localStorage
const STORAGE_KEY = "planner_data";

// Сохранение данных
const saveData = (desktops, currentDesktopId) => {
  const data = { desktops, currentDesktopId };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  console.log("💾 Сохранено:", data);
};

// Загрузка данных
const loadData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  console.log("📀 Загружено:", saved);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        desktops: parsed.desktops || [],
        currentDesktopId: parsed.currentDesktopId || null,
      };
    } catch (e) {
      return { desktops: [], currentDesktopId: null };
    }
  }
  return { desktops: [], currentDesktopId: null };
};

// ========== ДИАЛОГИ ==========
const RenameDialog = ({ isOpen, title, defaultValue, onConfirm, onCancel }) => {
  const [value, setValue] = useState(defaultValue || "");
  useEffect(() => setValue(defaultValue || ""), [defaultValue, isOpen]);
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
            onKeyPress={(e) => e.key === "Enter" && onConfirm(value)}
            autoFocus
          />
        </div>
        <div className="dialog-footer">
          <button className="dialog-btn dialog-btn-cancel" onClick={onCancel}>
            Отмена
          </button>
          <button
            className="dialog-btn dialog-btn-confirm"
            onClick={() => onConfirm(value)}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="custom-dialog-overlay" onClick={onCancel}>
      <div className="custom-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3>{title}</h3>
        </div>
        <div className="dialog-body">
          <p>{message}</p>
        </div>
        <div className="dialog-footer">
          <button className="dialog-btn dialog-btn-cancel" onClick={onCancel}>
            Отмена
          </button>
          <button className="dialog-btn dialog-btn-delete" onClick={onConfirm}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== ДИАЛОГ ДЛЯ ИЗМЕНЕНИЯ НАЗВАНИЯ БЛОКА ==========
const BlockRenameDialog = ({
  isOpen,
  title,
  defaultValue,
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState(defaultValue || "");
  useEffect(() => setValue(defaultValue || ""), [defaultValue, isOpen]);
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
            onKeyPress={(e) => e.key === "Enter" && onConfirm(value)}
            autoFocus
          />
        </div>
        <div className="dialog-footer">
          <button className="dialog-btn dialog-btn-cancel" onClick={onCancel}>
            Отмена
          </button>
          <button
            className="dialog-btn dialog-btn-confirm"
            onClick={() => onConfirm(value)}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== СТАРТОВЫЙ ЭКРАН ==========
const StartScreen = ({ onStart }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
  const handleStart = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setIsAnimating(true);
    const pulseLayer = document.createElement("div");
    pulseLayer.className = "pulse-overlay";
    pulseLayer.style.transformOrigin = `${centerX}px ${centerY}px`;
    document.body.appendChild(pulseLayer);
    setTimeout(() => {
      pulseLayer.style.transform = "scale(100)";
      pulseLayer.style.opacity = "1";
    }, 10);
    setTimeout(() => setShouldHide(true), 300);
    setTimeout(() => {
      pulseLayer.style.opacity = "0";
      setTimeout(() => pulseLayer.remove(), 500);
      onStart();
    }, 1600);
  };
  return (
    <div
      className="start-screen"
      style={{ opacity: shouldHide ? 0 : 1, transition: "opacity 0.5s ease" }}
    >
      <button
        className="start-btn"
        onClick={handleStart}
        style={{
          transform: isAnimating ? "scale(0.8)" : "scale(1)",
          opacity: isAnimating ? 0 : 1,
          transition: "transform 0.4s ease, opacity 0.4s ease",
        }}
      >
        START
      </button>
    </div>
  );
};

// ========== УВЕДОМЛЕНИЕ ==========
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
        <button className="notification-close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="notification-body">
        <div className="tip-item">✨ Перетаскивай блоки за заголовок</div>
        <div className="tip-item">📏 Изменяй размер блоков за уголок</div>
        <div className="tip-item">🎨 Настрой цвета через кнопку 🎨 в меню</div>
        <div className="tip-item">➕ Добавляй новые блоки через кнопку +</div>
        <div className="tip-item">🕐 Добавляй часы через меню</div>
        <div className="tip-item">📅 Добавляй календарь через меню</div>
        <div className="tip-item">
          ✏️ Дважды кликни по заголовку блока, чтобы изменить название
        </div>
        <div className="tip-item">
          📄 Экспортируй задачи в PDF через меню блока
        </div>
        <div className="tip-item">
          ⊞ Включай сетку для точного позиционирования блоков
        </div>
        <div className="tip-item">❌ Удаляй блоки красным крестиком в углу</div>
        <div className="tip-item">✅ Отмечай выполненные задачи</div>
        <div className="tip-item">
          🔒 Блокируй расположение блоков кнопкой 🔒 справа сверху
        </div>
      </div>
      <div className="notification-footer">
        <label className="dont-show-again">
          <input
            type="checkbox"
            checked={dontShow}
            onChange={handleDontShowChange}
          />
          Больше не показывать
        </label>
      </div>
    </div>
  );
};

// ========== МОДАЛЬНОЕ ОКНО КАСТОМИЗАЦИИ ==========
const CustomizeModal = ({ isOpen, onClose, colors, onSave }) => {
  const [localColors, setLocalColors] = useState(colors);
  useEffect(() => {
    setLocalColors(colors);
  }, [colors, isOpen]);
  if (!isOpen) return null;
  const handleSave = () => {
    onSave(localColors);
    onClose();
  };
  const handleReset = () => {
    const defaultColors = {
      bgPage: "#f0f8ff",
      text: "#1e2a3e",
      cardBg: "#ffffff",
      accent: "#87CEEB",
    };
    setLocalColors(defaultColors);
    onSave(defaultColors);
  };
  return (
    <div className="modal" style={{ display: "block" }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Кастомизация стола</h2>
          <button className="close-modal" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="customize-section">
            <label>🎨 Фон страницы</label>
            <input
              type="color"
              value={localColors.bgPage}
              onChange={(e) =>
                setLocalColors({ ...localColors, bgPage: e.target.value })
              }
              className="color-circle"
            />
          </div>
          <div className="customize-section">
            <label>📝 Цвет текста</label>
            <input
              type="color"
              value={localColors.text}
              onChange={(e) =>
                setLocalColors({ ...localColors, text: e.target.value })
              }
              className="color-circle"
            />
          </div>
          <div className="customize-section">
            <label>📦 Фон блоков</label>
            <input
              type="color"
              value={localColors.cardBg}
              onChange={(e) =>
                setLocalColors({ ...localColors, cardBg: e.target.value })
              }
              className="color-circle"
            />
          </div>
          <div className="customize-section">
            <label>✨ Акцент</label>
            <input
              type="color"
              value={localColors.accent}
              onChange={(e) =>
                setLocalColors({ ...localColors, accent: e.target.value })
              }
              className="color-circle"
            />
          </div>
          <div className="modal-buttons">
            <button className="modal-reset-btn" onClick={handleReset}>
              Сбросить
            </button>
            <button className="modal-save-btn" onClick={handleSave}>
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== БЛОК ЗАДАЧ ==========
const TaskBlock = ({
  block,
  onUpdate,
  onDelete,
  colors,
  isLocked,
  isGridEnabled = false,
  snapToGrid = (v) => v,
}) => {
  const [tasks, setTasks] = useState(block.tasks || []);
  const [newTask, setNewTask] = useState("");
  const [x, setX] = useState(block.x || 50);
  const [y, setY] = useState(block.y || 50);
  const [width, setWidth] = useState(block.width || 420);
  const [height, setHeight] = useState(block.height || 420);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const taskListRef = useRef(null);
  const dragStartX = useRef(0),
    dragStartY = useRef(0);
  const dragStartPosX = useRef(0),
    dragStartPosY = useRef(0);
  const resizeStartWidth = useRef(0),
    resizeStartHeight = useRef(0);
  const resizeStartMouseX = useRef(0),
    resizeStartMouseY = useRef(0);

  useEffect(() => {
    setX(block.x !== undefined ? block.x : 50);
    setY(block.y !== undefined ? block.y : 50);
    setWidth(block.width !== undefined ? block.width : 420);
    setHeight(block.height !== undefined ? block.height : 420);
    setTasks(block.tasks || []);
  }, [block.id, block.x, block.y, block.width, block.height]);

  const saveChanges = (newX, newY, newWidth, newHeight, newTasks, newTitle) => {
    onUpdate({
      ...block,
      tasks: newTasks !== undefined ? newTasks : tasks,
      title: newTitle !== undefined ? newTitle : block.title,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const newTasks = [
      ...tasks,
      { id: Date.now(), text: newTask, completed: false },
    ];
    setTasks(newTasks);
    saveChanges(x, y, width, height, newTasks, undefined);
    setNewTask("");
  };

  const toggleTask = (id) => {
    const newTasks = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    setTasks(newTasks);
    saveChanges(x, y, width, height, newTasks, undefined);
  };

  const deleteTask = (id) => {
    const newTasks = tasks.filter((t) => t.id !== id);
    setTasks(newTasks);
    saveChanges(x, y, width, height, newTasks, undefined);
  };

  const handleRename = (newTitle) => {
    if (newTitle && newTitle.trim()) {
      saveChanges(x, y, width, height, undefined, newTitle.trim());
    }
    setShowRenameDialog(false);
    setShowMenu(false);
  };

  const exportToPDF = () => {
    const completedTasks = tasks.filter((t) => t.completed);
    const pendingTasks = tasks.filter((t) => !t.completed);

    let content = `
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${block.title || "Список задач"}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #2c3e50; border-bottom: 2px solid #87CEEB; padding-bottom: 10px; }
                    h2 { color: #7f8c8d; margin-top: 20px; }
                    .task-list { list-style: none; padding: 0; }
                    .task-item { padding: 8px 0; border-bottom: 1px solid #ecf0f1; }
                    .completed { text-decoration: line-through; color: #95a5a6; }
                    .pending { color: #2c3e50; }
                    .date { color: #7f8c8d; font-size: 12px; margin-top: 20px; text-align: center; }
                    .stats { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ecf0f1; font-size: 12px; color: #7f8c8d; }
                </style>
            </head>
            <body>
                <h1>${block.title || "Список задач"}</h1>
                <p><strong>Статистика:</strong> ✅ ${completedTasks.length} выполнено | 📝 ${pendingTasks.length} в процессе | 📋 ${tasks.length} всего</p>
        `;

    if (pendingTasks.length > 0) {
      content += `<h2>📋 Активные задачи</h2><ul class="task-list">`;
      pendingTasks.forEach((task) => {
        content += `<li class="task-item pending">☐ ${task.text}</li>`;
      });
      content += `</ul>`;
    }

    if (completedTasks.length > 0) {
      content += `<h2>✅ Выполненные задачи</h2><ul class="task-list">`;
      completedTasks.forEach((task) => {
        content += `<li class="task-item completed">✓ ${task.text}</li>`;
      });
      content += `</ul>`;
    }

    content += `
                <div class="date">Создано: ${new Date().toLocaleString("ru-RU")}</div>
                <div class="stats">📄 Экспортировано из приложения "Your choice"</div>
            </body>
            </html>
        `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();

    setShowMenu(false);
  };

  useEffect(() => {
    if (taskListRef.current) {
      taskListRef.current.style.overflowY =
        taskListRef.current.scrollHeight > taskListRef.current.clientHeight
          ? "auto"
          : "hidden";
    }
  }, [tasks, height]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showMenu &&
        !e.target.closest(".block-menu") &&
        !e.target.closest(".menu-trigger")
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showMenu]);

  const handleDragStart = (e) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    dragStartX.current = e.clientX - x;
    dragStartY.current = e.clientY - y;
    dragStartPosX.current = x;
    dragStartPosY.current = y;
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    setX(e.clientX - dragStartX.current);
    setY(e.clientY - dragStartY.current);
  };

  const handleDragEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      if (dragStartPosX.current !== x || dragStartPosY.current !== y) {
        let newX = x;
        let newY = y;
        if (isGridEnabled) {
          newX = snapToGrid(x);
          newY = snapToGrid(y);
        }
        if (newX !== x || newY !== y) {
          setX(newX);
          setY(newY);
        }
        saveChanges(newX, newY, width, height, undefined, undefined);
      }
    }
  };

  const handleResizeStart = (e) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    resizeStartWidth.current = width;
    resizeStartHeight.current = height;
    resizeStartMouseX.current = e.clientX;
    resizeStartMouseY.current = e.clientY;
    setIsResizing(true);
  };

  const handleResizeMove = (e) => {
    if (!isResizing) return;
    const deltaX = e.clientX - resizeStartMouseX.current;
    const deltaY = e.clientY - resizeStartMouseY.current;
    setWidth(Math.max(420, resizeStartWidth.current + deltaX));
    setHeight(Math.max(420, resizeStartHeight.current + deltaY));
  };

  const handleResizeEnd = () => {
    if (isResizing) {
      setIsResizing(false);
      saveChanges(x, y, width, height, undefined, undefined);
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      const moveHandler = (e) => {
        if (isDragging) handleDragMove(e);
        if (isResizing) handleResizeMove(e);
      };
      const upHandler = () => {
        if (isDragging) handleDragEnd();
        if (isResizing) handleResizeEnd();
      };
      window.addEventListener("mousemove", moveHandler);
      window.addEventListener("mouseup", upHandler);
      return () => {
        window.removeEventListener("mousemove", moveHandler);
        window.removeEventListener("mouseup", upHandler);
      };
    }
  }, [isDragging, isResizing, x, y, width, height]);

  return (
    <div
      className="free-card-container"
      style={{
        position: "absolute",
        left: x + "px",
        top: y + "px",
        width: width + "px",
        height: height + "px",
        cursor: isDragging ? "grabbing" : "default",
        zIndex: isDragging || isResizing ? 1000 : 1,
      }}
    >
      <div
        className="free-card"
        style={{
          backgroundColor: colors.cardBg,
          borderColor: colors.accent + "80",
        }}
      >
        {!isLocked && (
          <button className="card-delete" onClick={() => onDelete(block.id)}>
            ✕
          </button>
        )}
        <div
          className="card-header card-drag-handle"
          style={{ cursor: isLocked ? "default" : "grab" }}
          onMouseDown={handleDragStart}
        >
          <div className="card-title">
            <span>{block.icon || "📋"}</span>
            <span
              style={{ color: colors.accent, cursor: "pointer" }}
              onDoubleClick={() => !isLocked && setShowRenameDialog(true)}
              title="Дважды кликни для изменения названия"
            >
              {block.title}
            </span>
            {!isLocked && (
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  marginLeft: "8px",
                }}
              >
                <button
                  className="menu-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1rem",
                    opacity: 0.6,
                  }}
                >
                  ⋮
                </button>
                {showMenu && (
                  <div
                    className="block-menu"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      background: "white",
                      borderRadius: "8px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                      zIndex: 100,
                      minWidth: "150px",
                    }}
                  >
                    <button
                      onClick={() => {
                        setShowRenameDialog(true);
                        setShowMenu(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "8px 12px",
                        textAlign: "left",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                      }}
                    >
                      ✏️ Переименовать
                    </button>
                    <button
                      onClick={exportToPDF}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "8px 12px",
                        textAlign: "left",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                      }}
                    >
                      📄 Экспорт в PDF
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <ul
          ref={taskListRef}
          className="task-list"
          style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
        >
          {tasks.map((task) => (
            <li key={task.id} className="task-item">
              <input
                type="checkbox"
                className="task-check"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
              />
              <span
                className={`task-text ${task.completed ? "done" : ""}`}
                style={{ color: colors.text }}
              >
                {task.text}
              </span>
              {!isLocked && (
                <button
                  className="delete-task"
                  onClick={() => deleteTask(task.id)}
                >
                  🗑️
                </button>
              )}
            </li>
          ))}
        </ul>
        {!isLocked && (
          <div className="add-task-form">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              placeholder="Новая задача..."
              style={{ color: colors.text }}
            />
            <button
              onClick={addTask}
              style={{ backgroundColor: colors.accent }}
            >
              + Добавить
            </button>
          </div>
        )}
        {!isLocked && (
          <div className="resize-handle" onMouseDown={handleResizeStart}>
            <div></div>
          </div>
        )}
      </div>
      <BlockRenameDialog
        isOpen={showRenameDialog}
        title="Изменить название блока"
        defaultValue={block.title}
        onConfirm={handleRename}
        onCancel={() => setShowRenameDialog(false)}
      />
    </div>
  );
};

// ========== ЧАСЫ ==========
const ClockWidget = ({
  block,
  onUpdate,
  onDelete,
  colors,
  isLocked,
  isGridEnabled = false,
  snapToGrid = (v) => v,
}) => {
  const [time, setTime] = useState(new Date());
  const [x, setX] = useState(block.x || 50);
  const [y, setY] = useState(block.y || 50);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0),
    dragStartY = useRef(0);
  const dragStartPosX = useRef(0),
    dragStartPosY = useRef(0);

  useEffect(() => {
    setX(block.x !== undefined ? block.x : 50);
    setY(block.y !== undefined ? block.y : 50);
  }, [block.id, block.x, block.y]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const savePosition = () => {
    onUpdate({ ...block, x, y });
  };

  const handleMouseDown = (e) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    dragStartX.current = e.clientX - x;
    dragStartY.current = e.clientY - y;
    dragStartPosX.current = x;
    dragStartPosY.current = y;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setX(e.clientX - dragStartX.current);
    setY(e.clientY - dragStartY.current);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (dragStartPosX.current !== x || dragStartPosY.current !== y) {
        let newX = x;
        let newY = y;
        if (isGridEnabled) {
          newX = snapToGrid(x);
          newY = snapToGrid(y);
        }
        if (newX !== x || newY !== y) {
          setX(newX);
          setY(newY);
        }
        savePosition();
      }
    }
  };

  useEffect(() => {
    if (isDragging) {
      const moveHandler = (e) => handleMouseMove(e);
      const upHandler = () => handleMouseUp();
      window.addEventListener("mousemove", moveHandler);
      window.addEventListener("mouseup", upHandler);
      return () => {
        window.removeEventListener("mousemove", moveHandler);
        window.removeEventListener("mouseup", upHandler);
      };
    }
  }, [isDragging, x, y]);

  const renderDigitalClock = () => {
    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const seconds = time.getSeconds().toString().padStart(2, "0");
    const date = time.toLocaleDateString("ru-RU", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    return (
      <div className="digital-clock">
        <div className="digital-time" style={{ color: colors.text }}>
          {hours}:{minutes}:{seconds}
        </div>
        <div className="digital-date" style={{ color: colors.text }}>
          {date}
        </div>
      </div>
    );
  };

  return (
    <div
      className="free-card-container"
      style={{
        position: "absolute",
        left: x + "px",
        top: y + "px",
        width: block.width || 180,
        height: block.height || 140,
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging ? 1000 : 1,
      }}
    >
      <div
        className="free-card clock-widget"
        style={{
          backgroundColor: colors.cardBg,
          borderColor: colors.accent + "80",
          padding: "0.8rem",
          width: "100%",
          height: "100%",
          cursor: isLocked ? "default" : "grab",
        }}
        onMouseDown={handleMouseDown}
      >
        {!isLocked && (
          <button
            className="card-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
          >
            ✕
          </button>
        )}
        {renderDigitalClock()}
      </div>
    </div>
  );
};

// ========== КАЛЕНДАРЬ (адаптивный) ==========
const CalendarWidget = ({
  block,
  onUpdate,
  onDelete,
  colors,
  isLocked,
  isGridEnabled = false,
  snapToGrid = (v) => v,
}) => {
  const [currentDate, setCurrentDate] = useState(() =>
    block.currentDate ? new Date(block.currentDate) : new Date(),
  );
  const [selectedDate, setSelectedDate] = useState(() =>
    block.selectedDate ? new Date(block.selectedDate) : new Date(),
  );
  const [x, setX] = useState(block.x || 50);
  const [y, setY] = useState(block.y || 50);
  const [width, setWidth] = useState(Math.max(350, block.width || 380));
  const [height, setHeight] = useState(Math.max(320, block.height || 360));
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartX = useRef(0),
    dragStartY = useRef(0);
  const dragStartPosX = useRef(0),
    dragStartPosY = useRef(0);
  const resizeStartWidth = useRef(0),
    resizeStartHeight = useRef(0);
  const resizeStartMouseX = useRef(0),
    resizeStartMouseY = useRef(0);

  useEffect(() => {
    setX(block.x !== undefined ? block.x : 50);
    setY(block.y !== undefined ? block.y : 50);
    setWidth(Math.max(350, block.width !== undefined ? block.width : 380));
    setHeight(Math.max(320, block.height !== undefined ? block.height : 360));
    if (block.currentDate) setCurrentDate(new Date(block.currentDate));
    if (block.selectedDate) setSelectedDate(new Date(block.selectedDate));
  }, [block.id, block.x, block.y, block.width, block.height]);

  const saveChanges = () => {
    onUpdate({
      ...block,
      x,
      y,
      width,
      height,
      currentDate: currentDate.toISOString(),
      selectedDate: selectedDate.toISOString(),
    });
  };

  const handleDragStart = (e) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    dragStartX.current = e.clientX - x;
    dragStartY.current = e.clientY - y;
    dragStartPosX.current = x;
    dragStartPosY.current = y;
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    setX(e.clientX - dragStartX.current);
    setY(e.clientY - dragStartY.current);
  };

  const handleDragEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      if (dragStartPosX.current !== x || dragStartPosY.current !== y) {
        let newX = x;
        let newY = y;
        if (isGridEnabled) {
          newX = snapToGrid(x);
          newY = snapToGrid(y);
        }
        if (newX !== x || newY !== y) {
          setX(newX);
          setY(newY);
        }
        saveChanges();
      }
    }
  };

  const handleResizeStart = (e) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    resizeStartWidth.current = width;
    resizeStartHeight.current = height;
    resizeStartMouseX.current = e.clientX;
    resizeStartMouseY.current = e.clientY;
    setIsResizing(true);
  };

  const handleResizeMove = (e) => {
    if (!isResizing) return;
    const deltaX = e.clientX - resizeStartMouseX.current;
    const deltaY = e.clientY - resizeStartMouseY.current;
    setWidth(Math.max(350, resizeStartWidth.current + deltaX));
    setHeight(Math.max(320, resizeStartHeight.current + deltaY));
  };

  const handleResizeEnd = () => {
    if (isResizing) {
      setIsResizing(false);
      saveChanges();
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      const moveHandler = (e) => {
        if (isDragging) handleDragMove(e);
        if (isResizing) handleResizeMove(e);
      };
      const upHandler = () => {
        if (isDragging) handleDragEnd();
        if (isResizing) handleResizeEnd();
      };
      window.addEventListener("mousemove", moveHandler);
      window.addEventListener("mouseup", upHandler);
      return () => {
        window.removeEventListener("mousemove", moveHandler);
        window.removeEventListener("mouseup", upHandler);
      };
    }
  }, [isDragging, isResizing, x, y, width, height]);

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
    saveChanges();
  };
  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
    saveChanges();
  };
  const handleDateClick = (day) => {
    setSelectedDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
    );
    saveChanges();
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    const days = [];

    const isSmall = width < 450;
    const fontSize = isSmall ? "0.7rem" : "0.85rem";
    const dayPadding = isSmall ? "4px 2px" : "8px 4px";

    let startOffset = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < startOffset; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="calendar-day"
          style={{ padding: dayPadding, fontSize }}
        ></div>,
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;
      const isToday =
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year;
      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
          onClick={() => handleDateClick(day)}
          style={{
            color: isSelected ? "white" : colors.text,
            padding: dayPadding,
            fontSize: fontSize,
          }}
        >
          {day}
        </div>,
      );
    }

    return days;
  };

  const isSmall = width < 450;
  const headerPadding = isSmall ? "6px 10px" : "8px 12px";
  const headerFontSize = isSmall ? "0.8rem" : "0.9rem";
  const navBtnSize = isSmall ? "0.9rem" : "1rem";
  const weekDayFontSize = isSmall ? "0.65rem" : "0.7rem";

  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];
  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <div
      className="free-card-container"
      style={{
        position: "absolute",
        left: x + "px",
        top: y + "px",
        width: width + "px",
        height: height + "px",
        cursor: isDragging ? "grabbing" : "default",
        zIndex: isDragging || isResizing ? 1000 : 1,
      }}
    >
      <div
        className="free-card"
        style={{
          backgroundColor: colors.cardBg,
          borderColor: colors.accent + "80",
          padding: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          cursor: isLocked ? "default" : "grab",
        }}
        onMouseDown={handleDragStart}
      >
        {!isLocked && (
          <button
            className="card-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
          >
            ✕
          </button>
        )}
        <div
          className="calendar-widget"
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <div
            className="calendar-header"
            style={{ padding: headerPadding, flexShrink: 0 }}
          >
            <button
              className="calendar-nav-btn"
              onClick={handlePrevMonth}
              style={{
                color: colors.text,
                fontSize: navBtnSize,
                padding: isSmall ? "2px 6px" : "4px 8px",
              }}
            >
              ◀
            </button>
            <span
              className="calendar-month-year"
              style={{
                color: colors.text,
                fontSize: headerFontSize,
                fontWeight: "bold",
              }}
            >
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              className="calendar-nav-btn"
              onClick={handleNextMonth}
              style={{
                color: colors.text,
                fontSize: navBtnSize,
                padding: isSmall ? "2px 6px" : "4px 8px",
              }}
            >
              ▶
            </button>
          </div>
          <div
            className="calendar-weekdays"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              textAlign: "center",
              padding: isSmall ? "4px 0" : "8px 0",
              fontSize: weekDayFontSize,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {weekDays.map((day) => (
              <div key={day} style={{ color: colors.text }}>
                {day}
              </div>
            ))}
          </div>
          <div
            className="calendar-days"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              flex: 1,
              padding: isSmall ? "4px" : "8px",
              gap: isSmall ? "1px" : "2px",
              overflowY: "auto",
              minHeight: 0,
            }}
          >
            {renderCalendar()}
          </div>
        </div>
        {!isLocked && (
          <div className="resize-handle" onMouseDown={handleResizeStart}>
            <div></div>
          </div>
        )}
      </div>
    </div>
  );
};

// ========== РАБОЧИЙ СТОЛ ==========
const Workspace = ({
  desktop,
  onUpdate,
  onBack,
  colors,
  isLocked,
  onToggleLock,
  onOpenCustomize,
}) => {
  const [blocks, setBlocks] = useState(desktop.blocks || []);
  const [showTips, setShowTips] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGridEnabled, setIsGridEnabled] = useState(
    desktop.isGridEnabled || false,
  );
  const GRID_SIZE = 20;

  const snapToGrid = (value) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  useEffect(() => {
    const tipsShown = localStorage.getItem("skyPlanner_tipsShownInWorkspace");
    if (!tipsShown) {
      setShowTips(true);
      localStorage.setItem("skyPlanner_tipsShownInWorkspace", "true");
      setTimeout(() => setShowTips(false), 8000);
    }
  }, []);

  useEffect(() => {
    onUpdate({ ...desktop, isGridEnabled });
  }, [isGridEnabled]);

  const updateBlocks = (newBlocks) => {
    setBlocks(newBlocks);
    onUpdate({ ...desktop, blocks: newBlocks, isGridEnabled });
  };

  const addTaskBlock = () => {
    let centerX = (window.innerWidth - 420) / 2;
    let centerY = (window.innerHeight - 420) / 2;

    if (isGridEnabled) {
      centerX = snapToGrid(centerX);
      centerY = snapToGrid(centerY);
    }

    const newBlock = {
      id: Date.now(),
      type: "task",
      title: "Новый блок задач",
      icon: "📝",
      tasks: [],
      x: Math.max(20, centerX),
      y: Math.max(20, centerY),
      width: 420,
      height: 420,
    };
    updateBlocks([...blocks, newBlock]);
    setIsMenuOpen(false);
  };

  const addClockBlock = () => {
    let centerX = (window.innerWidth - 180) / 2;
    let centerY = (window.innerHeight - 140) / 2;

    if (isGridEnabled) {
      centerX = snapToGrid(centerX);
      centerY = snapToGrid(centerY);
    }

    const newBlock = {
      id: Date.now(),
      type: "clock",
      title: "Часы",
      clockType: "digital",
      x: Math.max(20, centerX),
      y: Math.max(20, centerY),
      width: 180,
      height: 140,
    };
    updateBlocks([...blocks, newBlock]);
    setIsMenuOpen(false);
  };

  const addCalendarBlock = () => {
    let centerX = (window.innerWidth - 380) / 2;
    let centerY = (window.innerHeight - 360) / 2;

    if (isGridEnabled) {
      centerX = snapToGrid(centerX);
      centerY = snapToGrid(centerY);
    }

    const newBlock = {
      id: Date.now(),
      type: "calendar",
      title: "Календарь",
      x: Math.max(20, centerX),
      y: Math.max(20, centerY),
      width: 380,
      height: 360,
      currentDate: new Date().toISOString(),
      selectedDate: new Date().toISOString(),
    };
    updateBlocks([...blocks, newBlock]);
    setIsMenuOpen(false);
  };

  const deleteBlock = (id) => {
    updateBlocks(blocks.filter((b) => b.id !== id));
  };

  const updateBlock = (updated) => {
    let newX = updated.x;
    let newY = updated.y;

    if (isGridEnabled) {
      newX = snapToGrid(updated.x);
      newY = snapToGrid(updated.y);
    }

    updateBlocks(
      blocks.map((b) =>
        b.id === updated.id ? { ...updated, x: newX, y: newY } : b,
      ),
    );
  };

  const toggleGrid = () => {
    const newGridState = !isGridEnabled;
    setIsGridEnabled(newGridState);

    if (newGridState) {
      const snappedBlocks = blocks.map((block) => ({
        ...block,
        x: snapToGrid(block.x),
        y: snapToGrid(block.y),
      }));
      setBlocks(snappedBlocks);
      onUpdate({
        ...desktop,
        blocks: snappedBlocks,
        isGridEnabled: newGridState,
      });
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (
        isMenuOpen &&
        !e.target.closest(".floating-menu") &&
        !e.target.closest(".floating-menu-btn")
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [isMenuOpen]);

  useEffect(() => {
    setBlocks(desktop.blocks || []);
    setIsGridEnabled(desktop.isGridEnabled || false);
  }, [desktop.blocks, desktop.isGridEnabled]);

  if (blocks.length === 0) {
    return (
      <div className="planner-app" style={{ backgroundColor: colors.bgPage }}>
        <div className="control-panel">
          <button className="back-btn" onClick={onBack}>
            ← Назад к столам
          </button>
          <div className="control-buttons">
            <button
              className={`grid-btn ${isGridEnabled ? "active" : ""}`}
              onClick={toggleGrid}
              title="Включить/выключить сетку"
            >
              ⊞
            </button>
            <button className="lock-btn" onClick={onToggleLock}>
              {isLocked ? "🔒" : "🔓"}
            </button>
          </div>
        </div>
        <div
          className="free-canvas"
          style={{
            position: "relative",
            minHeight: "calc(100vh - 80px)",
            overflow: "hidden",
          }}
        >
          {isGridEnabled && <div className="grid-overlay"></div>}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
              padding: "2rem",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📭</div>
            <h3 style={{ color: colors.text, marginBottom: "0.5rem" }}>
              Пока тут пусто🥺
            </h3>
            <p
              style={{
                color: colors.text,
                opacity: 0.7,
                marginBottom: "1.5rem",
              }}
            >
              Нажмите на кнопку + в левом нижнем углу, чтобы добавить блок
            </p>
            <button
              onClick={addTaskBlock}
              style={{
                backgroundColor: colors.accent,
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "40px",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              <span>➕</span> Добавить первый блок
            </button>
          </div>
        </div>
        <button
          className="floating-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          +
        </button>
        {isMenuOpen && (
          <div className="floating-menu">
            <button className="menu-item" onClick={addTaskBlock}>
              <span>📦</span>
              <span>Добавить блок задач</span>
            </button>
            <button className="menu-item" onClick={addClockBlock}>
              <span>🕐</span>
              <span>Добавить часы</span>
            </button>
            <button className="menu-item" onClick={addCalendarBlock}>
              <span>📅</span>
              <span>Добавить календарь</span>
            </button>
            <button className="menu-item" onClick={onOpenCustomize}>
              <span>🎨</span>
              <span>Настройка цветов</span>
            </button>
          </div>
        )}
        {showTips && (
          <TipsNotification
            onClose={() => setShowTips(false)}
            onDontShowAgain={() =>
              localStorage.setItem("skyPlanner_dontShowTips", "true")
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="planner-app" style={{ backgroundColor: colors.bgPage }}>
      <div className="control-panel">
        <button className="back-btn" onClick={onBack}>
          ← Назад к столам
        </button>
        <div className="control-buttons">
          <button
            className={`grid-btn ${isGridEnabled ? "active" : ""}`}
            onClick={toggleGrid}
            title="Включить/выключить сетку"
          >
            ⊞
          </button>
          <button className="lock-btn" onClick={onToggleLock}>
            {isLocked ? "🔒" : "🔓"}
          </button>
        </div>
      </div>
      <div
        className="free-canvas"
        style={{
          position: "relative",
          minHeight: "calc(100vh - 80px)",
          overflow: "hidden",
        }}
      >
        {isGridEnabled && <div className="grid-overlay"></div>}
        {blocks.map((block) => {
          if (block.type === "clock")
            return (
              <ClockWidget
                key={block.id}
                block={block}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
                colors={colors}
                isLocked={isLocked}
                isGridEnabled={isGridEnabled}
                snapToGrid={snapToGrid}
              />
            );
          if (block.type === "calendar")
            return (
              <CalendarWidget
                key={block.id}
                block={block}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
                colors={colors}
                isLocked={isLocked}
                isGridEnabled={isGridEnabled}
                snapToGrid={snapToGrid}
              />
            );
          return (
            <TaskBlock
              key={block.id}
              block={block}
              onUpdate={updateBlock}
              onDelete={deleteBlock}
              colors={colors}
              isLocked={isLocked}
              isGridEnabled={isGridEnabled}
              snapToGrid={snapToGrid}
            />
          );
        })}
      </div>
      <button
        className="floating-menu-btn"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        +
      </button>
      {isMenuOpen && (
        <div className="floating-menu">
          <button className="menu-item" onClick={addTaskBlock}>
            <span>📦</span>
            <span>Добавить блок задач</span>
          </button>
          <button className="menu-item" onClick={addClockBlock}>
            <span>🕐</span>
            <span>Добавить часы</span>
          </button>
          <button className="menu-item" onClick={addCalendarBlock}>
            <span>📅</span>
            <span>Добавить календарь</span>
          </button>
          <button className="menu-item" onClick={onOpenCustomize}>
            <span>🎨</span>
            <span>Настройка цветов</span>
          </button>
        </div>
      )}
      {showTips && (
        <TipsNotification
          onClose={() => setShowTips(false)}
          onDontShowAgain={() =>
            localStorage.setItem("skyPlanner_dontShowTips", "true")
          }
        />
      )}
    </div>
  );
};

// ========== ЭКРАН ВЫБОРА СТОЛОВ ==========
const DesktopsScreen = ({
  desktops,
  onCreateDesktop,
  onSelectDesktop,
  onDeleteDesktop,
  onRenameDesktop,
  isMaxDesktops,
}) => {
  const [tooltipId, setTooltipId] = useState(null);
  useEffect(() => {
    const shown = localStorage.getItem("renameTooltip");
    if (!shown && desktops.length) {
      setTooltipId(desktops[0].id);
      setTimeout(() => {
        setTooltipId(null);
        localStorage.setItem("renameTooltip", "true");
      }, 5000);
    }
  }, [desktops]);
  return (
    <div className="desktops-screen">
      <div className="desktops-header">
        <h1>Your choice</h1>
        <p className="subtitle">your choice - your decisions</p>
      </div>
      <div className="desktops-grid">
        <div
          className={`desktop-card add-desktop-card ${isMaxDesktops ? "disabled" : ""}`}
          onClick={() => !isMaxDesktops && onCreateDesktop()}
          style={isMaxDesktops ? { cursor: "not-allowed", opacity: 0.6 } : {}}
        >
          <div className="add-icon">➕</div>
          <h3>Создать новый стол</h3>
          {isMaxDesktops && (
            <p className="limit-message">
              ⚠️ Лимит рабочих столов достигнут - 20шт.
            </p>
          )}
        </div>
        {desktops.map((d) => {
          const total =
            d.blocks?.reduce((s, b) => s + (b.tasks?.length || 0), 0) || 0;
          const done =
            d.blocks?.reduce(
              (s, b) => s + (b.tasks?.filter((t) => t.completed).length || 0),
              0,
            ) || 0;
          return (
            <div
              key={d.id}
              className="desktop-card"
              onClick={() => onSelectDesktop(d.id)}
            >
              <button
                className="desktop-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDesktop(d.id, d.name);
                }}
              >
                🗑️
              </button>
              <div
                className="desktop-title"
                onClick={(e) => {
                  e.stopPropagation();
                  onRenameDesktop(d.id, d.name);
                }}
              >
                📌 {d.name}
              </div>
              <div className="desktop-stats">
                <span>✅ {done} выполнено</span>
                <span>📝 {total} всего</span>
              </div>
              {tooltipId === d.id && (
                <div className="rename-tooltip">
                  ✏️ Кликни по названию стола для изменения
                  <div className="tooltip-arrow">👇</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ========== ГЛАВНЫЙ КОМПОНЕНТ ==========
const App = () => {
  const [showStart, setShowStart] = useState(true);
  const [desktops, setDesktops] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [rename, setRename] = useState({ open: false, id: null, name: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    id: null,
    name: "",
  });

  const currentDesktop = desktops.find((d) => d.id === currentId);
  const colors = currentDesktop?.colors || {
    bgPage: "#f0f8ff",
    text: "#1e2a3e",
    cardBg: "#ffffff",
    accent: "#87CEEB",
  };
  const locked = currentDesktop?.isLocked || false;

  useEffect(() => {
    const { desktops: saved, currentDesktopId: savedId } = loadData();
    if (saved && saved.length) {
      setDesktops(saved);
      setShowStart(false);
      if (savedId && saved.some((d) => d.id === savedId)) setCurrentId(savedId);
    }
  }, []);

  useEffect(() => {
    if (!showStart && desktops.length) saveData(desktops, currentId);
  }, [desktops, currentId, showStart]);

  if (showStart)
    return (
      <StartScreen
        onStart={() => {
          setShowStart(false);
          setDesktops([]);
          setCurrentId(null);
        }}
      />
    );
  if (currentDesktop) {
    return (
      <>
        <Workspace
          desktop={currentDesktop}
          onUpdate={(updated) =>
            setDesktops((prev) =>
              prev.map((d) => (d.id === updated.id ? updated : d)),
            )
          }
          onBack={() => setCurrentId(null)}
          colors={colors}
          isLocked={locked}
          onToggleLock={() =>
            setDesktops((prev) =>
              prev.map((d) =>
                d.id === currentId ? { ...d, isLocked: !d.isLocked } : d,
              ),
            )
          }
          onOpenCustomize={() => setShowCustomize(true)}
        />
        <CustomizeModal
          isOpen={showCustomize}
          onClose={() => setShowCustomize(false)}
          colors={colors}
          onSave={(newColors) =>
            setDesktops((prev) =>
              prev.map((d) =>
                d.id === currentId ? { ...d, colors: newColors } : d,
              ),
            )
          }
        />
      </>
    );
  }
  return (
    <>
      <DesktopsScreen
        desktops={desktops}
        onCreateDesktop={() => setRename({ open: true, id: null, name: "" })}
        onSelectDesktop={setCurrentId}
        onDeleteDesktop={(id, name) =>
          setDeleteConfirm({ open: true, id, name })
        }
        onRenameDesktop={(id, name) => setRename({ open: true, id, name })}
        isMaxDesktops={desktops.length >= 20}
      />
      <CustomizeModal
        isOpen={showCustomize}
        onClose={() => setShowCustomize(false)}
        colors={colors}
        onSave={(newColors) =>
          setDesktops((prev) =>
            prev.map((d) =>
              d.id === currentId ? { ...d, colors: newColors } : d,
            ),
          )
        }
      />
      <RenameDialog
        isOpen={rename.open}
        title={
          rename.id === null ? "Название нового стола" : "Изменить название"
        }
        defaultValue={rename.name}
        onConfirm={(newName) => {
          if (!newName?.trim()) return;
          if (rename.id === null) {
            if (desktops.length >= 20) {
              alert("Лимит столов 20");
              setRename({ open: false, id: null, name: "" });
              return;
            }
            const newDesktop = {
              id: Date.now(),
              name: newName.trim(),
              blocks: [],
              colors: {
                bgPage: "#f0f8ff",
                text: "#1e2a3e",
                cardBg: "#ffffff",
                accent: "#87CEEB",
              },
              isLocked: false,
            };
            setDesktops((prev) => [...prev, newDesktop]);
            setCurrentId(newDesktop.id);
          } else {
            setDesktops((prev) =>
              prev.map((d) =>
                d.id === rename.id ? { ...d, name: newName.trim() } : d,
              ),
            );
          }
          setRename({ open: false, id: null, name: "" });
        }}
        onCancel={() => setRename({ open: false, id: null, name: "" })}
      />
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="Удалить стол?"
        message={`Удалить "${deleteConfirm.name}"? Все задачи будут потеряны.`}
        onConfirm={() => {
          setDesktops((prev) => prev.filter((d) => d.id !== deleteConfirm.id));
          if (currentId === deleteConfirm.id) setCurrentId(null);
          setDeleteConfirm({ open: false, id: null, name: "" });
        }}
        onCancel={() => setDeleteConfirm({ open: false, id: null, name: "" })}
      />
    </>
  );
};

const root = document.getElementById("root");
ReactDOM.createRoot(root).render(React.createElement(App));
