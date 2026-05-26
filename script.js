const { useState, useEffect, useRef } = React;

// Функция для сохранения всех данных в localStorage
const saveToLocalStorage = (desktops, currentDesktopId) => {
  localStorage.setItem("skyPlanner_desktops", JSON.stringify(desktops));
  localStorage.setItem("skyPlanner_currentDesktop", currentDesktopId || "");
  console.log("✅ Saved to localStorage:", {
    desktops: desktops.map((d) => ({
      id: d.id,
      name: d.name,
      blocks: d.blocks?.map((b) => ({
        id: b.id,
        type: b.type,
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
      })),
    })),
    currentDesktopId,
  });
};

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
        <div className="tip-item">📅 Добавляй календарь через меню</div>
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

// Компонент блока (карточки) задач - ИСПРАВЛЕННОЕ СОХРАНЕНИЕ ПОЗИЦИИ
const TaskBlock = ({ block, onUpdate, onDelete, colors, isLocked }) => {
  const [tasks, setTasks] = useState(block.tasks || []);
  const [newTask, setNewTask] = useState("");
  // ВАЖНО: используем значения из props при инициализации
  const [position, setPosition] = useState({
    x: block.x || 50,
    y: block.y || 50,
  });
  const [size, setSize] = useState({
    width: block.width || 420,
    height: block.height || 420,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const taskListRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  // При обновлении блока извне - обновляем позицию
  useEffect(() => {
    console.log(
      "🎯 TaskBlock updating position from props:",
      block.id,
      "x:",
      block.x,
      "y:",
      block.y,
    );
    if (block.x !== undefined && block.y !== undefined) {
      setPosition({ x: block.x, y: block.y });
    }
    if (block.width !== undefined && block.height !== undefined) {
      setSize({ width: block.width, height: block.height });
    }
    setTasks(block.tasks || []);
  }, [block.id, block.x, block.y, block.width, block.height]);

  const saveChanges = (newPosition, newSize, newTasks) => {
    console.log(
      "💾 Saving block position:",
      block.id,
      "old x/y:",
      block.x,
      block.y,
      "new x/y:",
      newPosition.x,
      newPosition.y,
    );
    const updatedBlock = {
      ...block,
      tasks: newTasks !== undefined ? newTasks : tasks,
      x: newPosition.x,
      y: newPosition.y,
      width: newSize.width,
      height: newSize.height,
    };
    onUpdate(updatedBlock);
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const newTasks = [
      ...tasks,
      { id: Date.now(), text: newTask, completed: false },
    ];
    setTasks(newTasks);
    saveChanges(position, size, newTasks);
    setNewTask("");
  };

  const toggleTask = (id) => {
    const newTasks = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    setTasks(newTasks);
    saveChanges(position, size, newTasks);
  };

  const deleteTask = (id) => {
    const newTasks = tasks.filter((t) => t.id !== id);
    setTasks(newTasks);
    saveChanges(position, size, newTasks);
  };

  useEffect(() => {
    if (taskListRef.current) {
      const shouldScroll =
        taskListRef.current.scrollHeight > taskListRef.current.clientHeight;
      taskListRef.current.style.overflowY = shouldScroll ? "auto" : "hidden";
    }
  }, [tasks, size.height]);

  const handleMouseDown = (e) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    hasMovedRef.current = false;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    dragStartPos.current = { x: position.x, y: position.y };
  };

  const handleMouseMove = (e) => {
    if (isDragging && !isLocked) {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      if (
        Math.abs(newX - dragStartPos.current.x) > 2 ||
        Math.abs(newY - dragStartPos.current.y) > 2
      ) {
        hasMovedRef.current = true;
      }
      setPosition({ x: newX, y: newY });
    }
    if (isResizing && !isLocked) {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;
      const newWidth = Math.max(420, resizeStartRef.current.width + deltaX);
      const newHeight = Math.max(420, resizeStartRef.current.height + deltaY);
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (
        hasMovedRef.current &&
        (dragStartPos.current.x !== position.x ||
          dragStartPos.current.y !== position.y)
      ) {
        console.log("📍 Saving position after drag:", position.x, position.y);
        saveChanges(position, size, undefined);
      }
    }
    if (isResizing) {
      setIsResizing(false);
      saveChanges(position, size, undefined);
    }
  };

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

  useEffect(() => {
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
          onMouseDown={handleMouseDown}
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

// Компонент виджета часов
const ClockWidget = ({ block, onUpdate, onDelete, colors, isLocked }) => {
  const [time, setTime] = useState(new Date());
  const [position, setPosition] = useState({
    x: block.x || 50,
    y: block.y || 50,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  useEffect(() => {
    console.log(
      "🎯 ClockWidget updating position from props:",
      block.id,
      "x:",
      block.x,
      "y:",
      block.y,
    );
    if (block.x !== undefined && block.y !== undefined) {
      setPosition({ x: block.x, y: block.y });
    }
  }, [block.id, block.x, block.y]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const savePosition = () => {
    console.log(
      "💾 Saving clock position:",
      block.id,
      "x:",
      position.x,
      "y:",
      position.y,
    );
    onUpdate({ ...block, x: position.x, y: position.y });
  };

  const handleMouseDown = (e) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    hasMovedRef.current = false;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    dragStartPos.current = { x: position.x, y: position.y };
  };

  const handleMouseMove = (e) => {
    if (isDragging && !isLocked) {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      if (
        Math.abs(newX - dragStartPos.current.x) > 2 ||
        Math.abs(newY - dragStartPos.current.y) > 2
      ) {
        hasMovedRef.current = true;
      }
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (
        hasMovedRef.current &&
        (dragStartPos.current.x !== position.x ||
          dragStartPos.current.y !== position.y)
      ) {
        savePosition();
      }
    }
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
  }, [isDragging]);

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

// Компонент виджета календаря
const CalendarWidget = ({ block, onUpdate, onDelete, colors, isLocked }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    if (block.currentDate) {
      return new Date(block.currentDate);
    }
    return new Date();
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    if (block.selectedDate) {
      return new Date(block.selectedDate);
    }
    return new Date();
  });
  const [position, setPosition] = useState({
    x: block.x || 50,
    y: block.y || 50,
  });
  const [size, setSize] = useState({
    width: block.width || 320,
    height: block.height || 280,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  useEffect(() => {
    console.log(
      "🎯 CalendarWidget updating position from props:",
      block.id,
      "x:",
      block.x,
      "y:",
      block.y,
    );
    if (block.x !== undefined && block.y !== undefined) {
      setPosition({ x: block.x, y: block.y });
    }
    if (block.width !== undefined && block.height !== undefined) {
      setSize({ width: block.width, height: block.height });
    }
    if (block.currentDate) {
      setCurrentDate(new Date(block.currentDate));
    }
    if (block.selectedDate) {
      setSelectedDate(new Date(block.selectedDate));
    }
  }, [
    block.id,
    block.x,
    block.y,
    block.width,
    block.height,
    block.currentDate,
    block.selectedDate,
  ]);

  const saveChanges = () => {
    console.log(
      "💾 Saving calendar position:",
      block.id,
      "x:",
      position.x,
      "y:",
      position.y,
    );
    onUpdate({
      ...block,
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
      currentDate: currentDate.toISOString(),
      selectedDate: selectedDate.toISOString(),
    });
  };

  const handleMouseDown = (e) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    hasMovedRef.current = false;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    dragStartPos.current = { x: position.x, y: position.y };
  };

  const handleMouseMove = (e) => {
    if (isDragging && !isLocked) {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      if (
        Math.abs(newX - dragStartPos.current.x) > 2 ||
        Math.abs(newY - dragStartPos.current.y) > 2
      ) {
        hasMovedRef.current = true;
      }
      setPosition({ x: newX, y: newY });
    }
    if (isResizing && !isLocked) {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;
      const newWidth = Math.max(320, resizeStartRef.current.width + deltaX);
      const newHeight = Math.max(280, resizeStartRef.current.height + deltaY);
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (
        hasMovedRef.current &&
        (dragStartPos.current.x !== position.x ||
          dragStartPos.current.y !== position.y)
      ) {
        saveChanges();
      }
    }
    if (isResizing) {
      setIsResizing(false);
      saveChanges();
    }
  };

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

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

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
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    setSelectedDate(newDate);
    saveChanges();
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();

    const days = [];

    let startOffset = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day"></div>);
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
          style={{ color: isSelected ? "white" : colors.text }}
        >
          {day}
        </div>,
      );
    }

    return days;
  };

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
          padding: 0,
          overflow: "hidden",
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
        <div className="calendar-widget">
          <div className="calendar-header">
            <button
              className="calendar-nav-btn"
              onClick={handlePrevMonth}
              style={{ color: colors.text }}
            >
              ◀
            </button>
            <span
              className="calendar-month-year"
              style={{ color: colors.text }}
            >
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              className="calendar-nav-btn"
              onClick={handleNextMonth}
              style={{ color: colors.text }}
            >
              ▶
            </button>
          </div>
          <div className="calendar-weekdays">
            {weekDays.map((day) => (
              <div key={day} style={{ color: colors.text }}>
                {day}
              </div>
            ))}
          </div>
          <div className="calendar-days">{renderCalendar()}</div>
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
      ...blocks.map((b) => (b.x || 50) + (b.width || 180)),
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

  const addNewCalendar = () => {
    const maxX = Math.max(
      50,
      ...blocks.map((b) => (b.x || 50) + (b.width || 320)),
    );
    const newCalendar = {
      id: Date.now(),
      type: "calendar",
      title: "Календарь",
      x: maxX + 20,
      y: 50,
      width: 320,
      height: 280,
      currentDate: new Date().toISOString(),
      selectedDate: new Date().toISOString(),
    };
    saveBlocks([...blocks, newCalendar]);
    setIsMenuOpen(false);
  };

  const deleteBlock = (blockId) => {
    saveBlocks(blocks.filter((b) => b.id !== blockId));
  };

  const updateBlock = (updatedBlock) => {
    console.log(
      "🔄 updateBlock called:",
      updatedBlock.id,
      "position:",
      updatedBlock.x,
      updatedBlock.y,
    );
    setBlocks((prev) =>
      prev.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)),
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
            <button className="menu-item" onClick={addNewCalendar}>
              <span>📅</span>
              <span>Добавить календарь</span>
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
          if (block.type === "calendar") {
            return (
              <CalendarWidget
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
          <button className="menu-item" onClick={addNewCalendar}>
            <span>📅</span>
            <span>Добавить календарь</span>
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

  // Загрузка данных при монтировании
  useEffect(() => {
    const savedDesktops = localStorage.getItem("skyPlanner_desktops");
    const savedCurrentDesktop = localStorage.getItem(
      "skyPlanner_currentDesktop",
    );

    console.log("📀 Loaded from localStorage - raw data:", savedDesktops);

    if (savedDesktops) {
      const parsed = JSON.parse(savedDesktops);
      console.log(
        "📀 Parsed desktops:",
        parsed.map((d) => ({
          id: d.id,
          name: d.name,
          blocks: d.blocks?.map((b) => ({
            id: b.id,
            type: b.type,
            x: b.x,
            y: b.y,
            width: b.width,
            height: b.height,
          })),
        })),
      );

      // Убеждаемся, что у каждого блока есть x, y, width, height
      const desktopsWithDefaults = parsed.map((d) => ({
        ...d,
        blocks:
          d.blocks?.map((b) => ({
            ...b,
            x: b.x !== undefined ? b.x : 50,
            y: b.y !== undefined ? b.y : 50,
            width:
              b.width !== undefined
                ? b.width
                : b.type === "clock"
                  ? 180
                  : b.type === "calendar"
                    ? 320
                    : 420,
            height:
              b.height !== undefined
                ? b.height
                : b.type === "clock"
                  ? 140
                  : b.type === "calendar"
                    ? 280
                    : 420,
          })) || [],
        colors: d.colors || {
          bgPage: "#f0f8ff",
          text: "#1e2a3e",
          cardBg: "#ffffff",
          accent: "#87CEEB",
        },
        isLocked: d.isLocked || false,
      }));

      setDesktops(desktopsWithDefaults);
      setShowStart(false);

      if (savedCurrentDesktop) {
        const currentId = parseInt(savedCurrentDesktop);
        if (desktopsWithDefaults.some((d) => d.id === currentId)) {
          setCurrentDesktopId(currentId);
        }
      }
    } else {
      setShowStart(true);
    }
  }, []);

  // Сохранение при каждом изменении
  useEffect(() => {
    if (!showStart && desktops.length > 0) {
      console.log(
        "✅ Saving to localStorage - desktops:",
        desktops.map((d) => ({
          id: d.id,
          blocks: d.blocks?.map((b) => ({ id: b.id, x: b.x, y: b.y })),
        })),
      );
      localStorage.setItem("skyPlanner_desktops", JSON.stringify(desktops));
      localStorage.setItem("skyPlanner_currentDesktop", currentDesktopId || "");
    }
  }, [desktops, currentDesktopId, showStart]);

  const handleStart = () => {
    setShowStart(false);
    setDesktops([]);
    setCurrentDesktopId(null);
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
    console.log("🔄 updateDesktop called:", updatedDesktop.id);
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
