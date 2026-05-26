const { useState, useEffect, useRef } = React;

// Функция для сохранения всех данных в localStorage
const saveToLocalStorage = (desktops, currentDesktopId) => {
  const dataToSave = {
    desktops: desktops,
    currentDesktopId: currentDesktopId,
    version: "3.0",
    lastSaved: new Date().toISOString(),
  };
  localStorage.setItem("skyPlanner_data_v3", JSON.stringify(dataToSave));
  console.log("✅ Saved to localStorage V3:", dataToSave);
};

// Функция загрузки данных из localStorage (поддерживает старые версии)
const loadFromLocalStorage = () => {
  // Пробуем загрузить новую версию
  let savedData = localStorage.getItem("skyPlanner_data_v3");

  // Если нет, пробуем старую версию
  if (!savedData) {
    savedData = localStorage.getItem("skyPlanner_data");
  }
  if (!savedData) {
    savedData = localStorage.getItem("skyPlanner_desktops");
  }

  console.log("📀 Loaded from localStorage:", savedData);

  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      let desktops = [];
      let currentDesktopId = null;

      if (parsed.desktops) {
        desktops = parsed.desktops;
        currentDesktopId = parsed.currentDesktopId;
      } else if (Array.isArray(parsed)) {
        desktops = parsed;
      }

      return { desktops, currentDesktopId };
    } catch (e) {
      console.error("Error parsing localStorage data:", e);
      return { desktops: [], currentDesktopId: null };
    }
  }
  return { desktops: [], currentDesktopId: null };
};

// ... (RenameDialog, ConfirmDialog, StartScreen, TipsNotification, CustomizeModal остаются без изменений) ...

// Компонент блока (карточки) задач - полностью переписан
const TaskBlock = ({ block, onUpdate, onDelete, colors, isLocked }) => {
  const [tasks, setTasks] = useState(block.tasks || []);
  const [newTask, setNewTask] = useState("");
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
      "🎯 TaskBlock updating:",
      block.id,
      "x:",
      block.x,
      "y:",
      block.y,
    );
    setPosition({
      x: block.x !== undefined ? block.x : 50,
      y: block.y !== undefined ? block.y : 50,
    });
    setSize({
      width: block.width !== undefined ? block.width : 420,
      height: block.height !== undefined ? block.height : 420,
    });
    setTasks(block.tasks || []);
  }, [block.id, block.x, block.y, block.width, block.height]);

  const saveChanges = (newPosition, newSize, newTasks) => {
    const updatedBlock = {
      ...block,
      tasks: newTasks !== undefined ? newTasks : tasks,
      x: newPosition.x,
      y: newPosition.y,
      width: newSize.width,
      height: newSize.height,
    };
    console.log(
      "💾 Saving TaskBlock:",
      updatedBlock.id,
      "new x/y:",
      updatedBlock.x,
      updatedBlock.y,
    );
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
      "🎯 ClockWidget updating:",
      block.id,
      "x:",
      block.x,
      "y:",
      block.y,
    );
    setPosition({
      x: block.x !== undefined ? block.x : 50,
      y: block.y !== undefined ? block.y : 50,
    });
  }, [block.id, block.x, block.y]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const savePosition = () => {
    const updatedBlock = {
      ...block,
      x: position.x,
      y: position.y,
    };
    console.log(
      "💾 Saving ClockWidget:",
      updatedBlock.id,
      "new x/y:",
      updatedBlock.x,
      updatedBlock.y,
    );
    onUpdate(updatedBlock);
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
      "🎯 CalendarWidget updating:",
      block.id,
      "x:",
      block.x,
      "y:",
      block.y,
    );
    setPosition({
      x: block.x !== undefined ? block.x : 50,
      y: block.y !== undefined ? block.y : 50,
    });
    setSize({
      width: block.width !== undefined ? block.width : 320,
      height: block.height !== undefined ? block.height : 280,
    });
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
    const updatedBlock = {
      ...block,
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
      currentDate: currentDate.toISOString(),
      selectedDate: selectedDate.toISOString(),
    };
    console.log(
      "💾 Saving CalendarWidget:",
      updatedBlock.id,
      "new x/y:",
      updatedBlock.x,
      updatedBlock.y,
    );
    onUpdate(updatedBlock);
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

// Компонент рабочего стола (только измененная часть - saveBlocks и updateBlock)
// ... остальной код Workspace остается таким же, но с добавленными логами ...

// Главный компонент App - исправлен
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
    const { desktops: savedDesktops, currentDesktopId: savedCurrentDesktopId } =
      loadFromLocalStorage();

    console.log("📀 Loaded desktops:", savedDesktops);
    console.log("📀 Loaded currentDesktopId:", savedCurrentDesktopId);

    if (savedDesktops && savedDesktops.length > 0) {
      setDesktops(savedDesktops);
      setShowStart(false);
      if (
        savedCurrentDesktopId &&
        savedDesktops.some((d) => d.id === savedCurrentDesktopId)
      ) {
        setCurrentDesktopId(savedCurrentDesktopId);
      }
    } else {
      setShowStart(true);
    }
  }, []);

  // Сохранение при каждом изменении
  useEffect(() => {
    if (!showStart && desktops.length > 0) {
      console.log(
        "📀 Saving to localStorage V3, desktops:",
        desktops.map((d) => ({
          id: d.id,
          blocks: d.blocks?.map((b) => ({ id: b.id, x: b.x, y: b.y })),
        })),
      );
      saveToLocalStorage(desktops, currentDesktopId);
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
