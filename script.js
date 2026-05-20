const { useState, useEffect, useRef } = React;

// Кастомный диалог для ввода текста (переименование)
const RenameDialog = ({ isOpen, title, defaultValue, onConfirm, onCancel }) => {
  const [value, setValue] = useState(defaultValue || "");

  useEffect(() => {
    setValue(defaultValue || "");
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

// Кастомный диалог подтверждения удаления
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

// Компонент стартового экрана
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

// Модальное окно кастомизации
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

// Компонент блока (карточки) задач с ручным перетаскиванием и изменением размера
const TaskBlock = ({ block, onUpdate, onDelete, colors, isLocked }) => {
  const [tasks, setTasks] = useState(block.tasks || []);
  const [newTask, setNewTask] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({
    x: block.x || 50,
    y: block.y || 50,
  });
  const [size, setSize] = useState({
    width: Math.max(420, block.width || 420),
    height: Math.max(420, block.height || 420),
  });
  const taskListRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    onUpdate({ ...block, tasks: newTasks, ...position, ...size });
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    saveTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
    setNewTask("");
  };

  const toggleTask = (id) => {
    saveTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const deleteTask = (id) => {
    saveTasks(tasks.filter((t) => t.id !== id));
  };

  // Проверяем, нужен ли скролл
  useEffect(() => {
    if (taskListRef.current) {
      const shouldScroll =
        taskListRef.current.scrollHeight > taskListRef.current.clientHeight;
      taskListRef.current.style.overflowY = shouldScroll ? "auto" : "hidden";
    }
  }, [tasks, size.height]);

  // Обработчики перетаскивания
  const handleDragStart = (e) => {
    if (isLocked) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleDragMove = (e) => {
    if (!isDragging || isLocked) return;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    onUpdate({ ...block, tasks, ...position, ...size });
  };

  // Обработчики изменения размера
  const handleResizeStart = (e) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
  };

  const handleResizeMove = (e) => {
    if (!isResizing || isLocked) return;
    const deltaX = e.clientX - resizeStartRef.current.x;
    const deltaY = e.clientY - resizeStartRef.current.y;
    const newWidth = Math.max(420, resizeStartRef.current.width + deltaX);
    const newHeight = Math.max(420, resizeStartRef.current.height + deltaY);
    setSize({ width: newWidth, height: newHeight });
  };

  const handleResizeEnd = () => {
    if (!isResizing) return;
    setIsResizing(false);
    onUpdate({ ...block, tasks, ...position, ...size });
  };

  // Глобальные обработчики событий
  useEffect(() => {
    const handleMouseMove = (e) => {
      handleDragMove(e);
      handleResizeMove(e);
    };
    const handleMouseUp = () => {
      handleDragEnd();
      handleResizeEnd();
    };

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing]);

  return (
    <div
      className="free-card-container"
      style={{
        position: "absolute",
        left: position.x + "px",
        top: position.y + "px",
        width: size.width + "px",
        height: size.height + "px",
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
            <span style={{ color: colors.accent }}>{block.title}</span>
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
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            placeholder="Новая задача..."
            style={{ color: colors.text }}
          />
          <button onClick={addTask} style={{ backgroundColor: colors.accent }}>
            + Добавить
          </button>
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

// Компонент виджета часов - только электронные, с правильным перетаскиванием
const ClockWidget = ({ block, onUpdate, onDelete, colors, isLocked }) => {
  const [time, setTime] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    x: block.x || 50,
    y: block.y || 50,
  });
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Синхронизация позиции с блоком при обновлении извне
  useEffect(() => {
    setPosition({ x: block.x || 50, y: block.y || 50 });
  }, [block.x, block.y]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseDown = (e) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isLocked) return;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    // Обновляем локальное состояние
    setPosition({ x: newX, y: newY });
    // НЕ вызываем onUpdate здесь, чтобы избежать задержек при перетаскивании
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Сохраняем финальную позицию в родительский компонент
    onUpdate({ ...block, x: position.x, y: position.y });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, position]);

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
        left: position.x + "px",
        top: position.y + "px",
        width: "180px",
        height: "140px",
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging ? 1000 : 1,
        minWidth: "180px",
        minHeight: "140px",
      }}
    >
      <div
        className="free-card clock-widget"
        style={{
          backgroundColor: colors.cardBg,
          borderColor: colors.accent + "80",
          padding: "0.8rem",
          cursor: isLocked ? "default" : "grab",
          width: "100%",
          height: "100%",
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

// Компонент рабочего стола
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

  useEffect(() => {
    const tipsShown = localStorage.getItem("skyPlanner_tipsShownInWorkspace");
    if (!tipsShown) {
      setShowTips(true);
      localStorage.setItem("skyPlanner_tipsShownInWorkspace", "true");
      setTimeout(() => setShowTips(false), 8000);
    }
  }, []);

  const saveBlocks = (newBlocks) => {
    setBlocks(newBlocks);
    onUpdate({ ...desktop, blocks: newBlocks });
  };

  const addNewBlock = () => {
    const maxX = Math.max(
      50,
      ...blocks.map((b) => (b.x || 50) + (b.width || 420)),
    );
    const newBlock = {
      id: Date.now(),
      type: "task",
      title: "Новый блок задач",
      icon: "📝",
      tasks: [],
      x: maxX + 20,
      y: 50,
      width: 420,
      height: 420,
    };
    saveBlocks([...blocks, newBlock]);
    setIsMenuOpen(false);
  };

  const addNewClock = () => {
    const maxX = Math.max(
      50,
      ...blocks.map((b) => (b.x || 50) + (b.width || 420)),
    );
    const newClock = {
      id: Date.now(),
      type: "clock",
      title: "Часы",
      clockType: "digital",
      x: maxX + 20,
      y: 50,
      width: 180,
      height: 140,
    };
    saveBlocks([...blocks, newClock]);
    setIsMenuOpen(false);
  };

  const deleteBlock = (blockId) => {
    saveBlocks(blocks.filter((b) => b.id !== blockId));
  };

  const updateBlock = (updatedBlock) => {
    saveBlocks(
      blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)),
    );
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleOpenCustomize = () => {
    onOpenCustomize();
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMenuOpen &&
        !e.target.closest(".floating-menu") &&
        !e.target.closest(".floating-menu-btn")
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  // Если блоков нет, показываем сообщение
  if (blocks.length === 0) {
    return (
      <div className="planner-app" style={{ backgroundColor: colors.bgPage }}>
        <div className="control-panel">
          <button className="back-btn" onClick={onBack}>
            ← Назад к столам
          </button>
          <button className="lock-btn" onClick={onToggleLock}>
            {isLocked ? "🔒" : "🔓"}
          </button>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100vh - 120px)",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📭</div>
          <h3 style={{ color: colors.text, marginBottom: "0.5rem" }}>
            Пока тут пусто🥺
          </h3>
          <p
            style={{ color: colors.text, opacity: 0.7, marginBottom: "1.5rem" }}
          >
            Нажмите на кнопку + в левом нижнем углу, чтобы добавить блок
          </p>
          <button
            onClick={addNewBlock}
            style={{
              backgroundColor: colors.accent,
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "40px",
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>➕</span> Добавить первый блок
          </button>
        </div>

        <button className="floating-menu-btn" onClick={handleMenuToggle}>
          +
        </button>

        {isMenuOpen && (
          <div className="floating-menu">
            <button className="menu-item" onClick={addNewBlock}>
              <span>📦</span>
              <span>Добавить блок задач</span>
            </button>
            <button className="menu-item" onClick={addNewClock}>
              <span>🕐</span>
              <span>Добавить часы</span>
            </button>
            <button className="menu-item" onClick={handleOpenCustomize}>
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
        <button className="lock-btn" onClick={onToggleLock}>
          {isLocked ? "🔒" : "🔓"}
        </button>
      </div>
      <div
        className="free-canvas"
        style={{
          position: "relative",
          minHeight: "calc(100vh - 80px)",
          overflow: "hidden",
        }}
      >
        {blocks.map((block) => {
          if (block.type === "clock") {
            return (
              <ClockWidget
                key={block.id}
                block={block}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
                colors={colors}
                isLocked={isLocked}
              />
            );
          }
          return (
            <TaskBlock
              key={block.id}
              block={block}
              onUpdate={updateBlock}
              onDelete={deleteBlock}
              colors={colors}
              isLocked={isLocked}
            />
          );
        })}
      </div>

      <button className="floating-menu-btn" onClick={handleMenuToggle}>
        +
      </button>

      {isMenuOpen && (
        <div className="floating-menu">
          <button className="menu-item" onClick={addNewBlock}>
            <span>📦</span>
            <span>Добавить блок задач</span>
          </button>
          <button className="menu-item" onClick={addNewClock}>
            <span>🕐</span>
            <span>Добавить часы</span>
          </button>
          <button className="menu-item" onClick={handleOpenCustomize}>
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

// Компонент выбора рабочего стола
const DesktopsScreen = ({
  desktops,
  onCreateDesktop,
  onSelectDesktop,
  onDeleteDesktop,
  onRenameDesktop,
  isMaxDesktops,
}) => {
  const [showTooltipId, setShowTooltipId] = useState(null);

  useEffect(() => {
    const tooltipShown = localStorage.getItem("skyPlanner_renameTooltip");
    if (!tooltipShown && desktops.length > 0) {
      setShowTooltipId(desktops[0].id);
      setTimeout(() => {
        setShowTooltipId(null);
        localStorage.setItem("skyPlanner_renameTooltip", "true");
      }, 5000);
    }
  }, [desktops]);

  const handleTitleClick = (desktop, e) => {
    e.stopPropagation();
    onRenameDesktop(desktop.id, desktop.name);
  };

  const handleCreateDesktop = () => {
    if (isMaxDesktops) return;
    onCreateDesktop();
  };

  return (
    <div className="desktops-screen">
      <div className="desktops-header">
        <h1>Your choice</h1>
        <p className="subtitle">your choice - your decisions</p>
      </div>
      <div className="desktops-grid">
        <div
          className={`desktop-card add-desktop-card ${isMaxDesktops ? "disabled" : ""}`}
          onClick={handleCreateDesktop}
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
        {desktops.map((desktop) => {
          const totalTasks =
            desktop.blocks?.reduce(
              (sum, block) => sum + (block.tasks?.length || 0),
              0,
            ) || 0;
          const completedTasks =
            desktop.blocks?.reduce(
              (sum, block) =>
                sum + (block.tasks?.filter((t) => t.completed).length || 0),
              0,
            ) || 0;
          return (
            <div
              key={desktop.id}
              className="desktop-card"
              onClick={() => onSelectDesktop(desktop.id)}
            >
              <button
                className="desktop-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDesktop(desktop.id, desktop.name);
                }}
              >
                🗑️
              </button>
              <div
                className="desktop-title"
                onClick={(e) => handleTitleClick(desktop, e)}
              >
                📌 {desktop.name}
              </div>
              <div className="desktop-stats">
                <span>✅ {completedTasks} выполнено</span>
                <span>📝 {totalTasks} всего</span>
              </div>
              {showTooltipId === desktop.id && (
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

// Главный компонент
const App = () => {
  const [showStart, setShowStart] = useState(true);
  const [desktops, setDesktops] = useState([]);
  const [currentDesktopId, setCurrentDesktopId] = useState(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [renameDialog, setRenameDialog] = useState({
    isOpen: false,
    desktopId: null,
    currentName: "",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    desktopId: null,
    desktopName: "",
  });

  const MAX_DESKTOPS = 20;
  const isMaxDesktops = desktops.length >= MAX_DESKTOPS;

  const currentDesktop = desktops.find((d) => d.id === currentDesktopId);
  const currentColors = currentDesktop?.colors || {
    bgPage: "#f0f8ff",
    text: "#1e2a3e",
    cardBg: "#ffffff",
    accent: "#87CEEB",
  };
  const isLocked = currentDesktop?.isLocked || false;

  useEffect(() => {
    const savedDesktops = localStorage.getItem("skyPlanner_desktops");
    const savedCurrentDesktop = localStorage.getItem(
      "skyPlanner_currentDesktop",
    );

    if (savedDesktops) {
      const parsed = JSON.parse(savedDesktops);
      const desktopsWithDefaults = parsed.map((d) => ({
        ...d,
        blocks: d.blocks || [],
        colors: d.colors || {
          bgPage: "#f0f8ff",
          text: "#1e2a3e",
          cardBg: "#ffffff",
          accent: "#87CEEB",
        },
        isLocked: d.isLocked || false,
      }));
      setDesktops(desktopsWithDefaults);
      if (desktopsWithDefaults.length === 0) {
        setShowStart(true);
      } else {
        setShowStart(false);
        if (savedCurrentDesktop) {
          const currentId = parseInt(savedCurrentDesktop);
          if (desktopsWithDefaults.some((d) => d.id === currentId)) {
            setCurrentDesktopId(currentId);
          }
        }
      }
    } else {
      setShowStart(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("skyPlanner_desktops", JSON.stringify(desktops));
    localStorage.setItem("skyPlanner_currentDesktop", currentDesktopId || "");
  }, [desktops, currentDesktopId]);

  const handleStart = () => {
    setShowStart(false);
    setDesktops([]);
  };

  const createNewDesktop = () => {
    if (desktops.length >= MAX_DESKTOPS) {
      alert(
        `Достигнуто максимальное количество рабочих столов (${MAX_DESKTOPS})`,
      );
      return;
    }
    setRenameDialog({ isOpen: true, desktopId: null, currentName: "" });
  };

  const handleRenameConfirm = (newName) => {
    if (!newName || !newName.trim()) return;
    if (renameDialog.desktopId === null) {
      if (desktops.length >= MAX_DESKTOPS) {
        alert(
          `Достигнуто максимальное количество рабочих столов (${MAX_DESKTOPS})`,
        );
        setRenameDialog({ isOpen: false, desktopId: null, currentName: "" });
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
      setCurrentDesktopId(newDesktop.id);
    } else {
      setDesktops((prev) =>
        prev.map((d) =>
          d.id === renameDialog.desktopId ? { ...d, name: newName.trim() } : d,
        ),
      );
    }
    setRenameDialog({ isOpen: false, desktopId: null, currentName: "" });
  };

  const handleDeleteDesktop = (id, name) => {
    setDeleteDialog({ isOpen: true, desktopId: id, desktopName: name });
  };

  const handleDeleteConfirm = () => {
    setDesktops((prev) => prev.filter((d) => d.id !== deleteDialog.desktopId));
    if (currentDesktopId === deleteDialog.desktopId) setCurrentDesktopId(null);
    setDeleteDialog({ isOpen: false, desktopId: null, desktopName: "" });
  };

  const selectDesktop = (id) => {
    setCurrentDesktopId(id);
  };

  const updateDesktop = (updatedDesktop) => {
    setDesktops((prev) =>
      prev.map((d) => (d.id === updatedDesktop.id ? updatedDesktop : d)),
    );
  };

  const updateCurrentDesktopColors = (newColors) => {
    if (currentDesktop) {
      const updated = { ...currentDesktop, colors: newColors };
      updateDesktop(updated);
    }
  };

  const toggleLock = () => {
    if (currentDesktop) {
      const updated = { ...currentDesktop, isLocked: !currentDesktop.isLocked };
      updateDesktop(updated);
    }
  };

  if (showStart) return <StartScreen onStart={handleStart} />;
  if (currentDesktop) {
    return (
      <>
        <Workspace
          desktop={currentDesktop}
          onUpdate={updateDesktop}
          onBack={() => setCurrentDesktopId(null)}
          colors={currentColors}
          isLocked={isLocked}
          onToggleLock={toggleLock}
          onOpenCustomize={() => setShowCustomize(true)}
        />
        <CustomizeModal
          isOpen={showCustomize}
          onClose={() => setShowCustomize(false)}
          colors={currentColors}
          onSave={updateCurrentDesktopColors}
        />
      </>
    );
  }
  return (
    <>
      <DesktopsScreen
        desktops={desktops}
        onCreateDesktop={createNewDesktop}
        onSelectDesktop={selectDesktop}
        onDeleteDesktop={handleDeleteDesktop}
        onRenameDesktop={(id, currentName) =>
          setRenameDialog({ isOpen: true, desktopId: id, currentName })
        }
        isMaxDesktops={isMaxDesktops}
      />
      <CustomizeModal
        isOpen={showCustomize}
        onClose={() => setShowCustomize(false)}
        colors={currentColors}
        onSave={updateCurrentDesktopColors}
      />
      <RenameDialog
        isOpen={renameDialog.isOpen}
        title={
          renameDialog.desktopId === null
            ? "Название нового стола"
            : "Изменить название"
        }
        defaultValue={renameDialog.currentName}
        onConfirm={handleRenameConfirm}
        onCancel={() =>
          setRenameDialog({ isOpen: false, desktopId: null, currentName: "" })
        }
      />
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Удалить стол?"
        message={`Вы уверены, что хотите удалить стол "${deleteDialog.desktopName}"? Все задачи будут потеряны.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setDeleteDialog({ isOpen: false, desktopId: null, desktopName: "" })
        }
      />
    </>
  );
};

const rootElement = document.getElementById("root");
if (ReactDOM.createRoot) {
  ReactDOM.createRoot(rootElement).render(React.createElement(App));
} else {
  ReactDOM.render(React.createElement(App), rootElement);
}
