const { useState, useEffect } = React;
// Получаем Rnd из глобальной переменной
const Rnd = window.ReactRnd ? window.ReactRnd.Rnd : window.ReactRnd;

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
        <div className="tip-item">❌ Удаляй блоки красным крестиком в углу</div>
        <div className="tip-item">✅ Отмечай выполненные задачи</div>
        <div className="tip-item">
          🔒 Блокируй задачи кнопкой 🔒 справа сверху
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

// Компонент блока (карточки) задач
const TaskBlock = ({
  block,
  onUpdate,
  onDelete,
  colors,
  isLocked,
  onDragStop,
  onResizeStop,
}) => {
  const [tasks, setTasks] = useState(block.tasks || []);
  const [newTask, setNewTask] = useState("");

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    onUpdate({ ...block, tasks: newTasks });
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

  // Проверяем, что Rnd доступен
  if (!Rnd) {
    console.error("ReactRnd not loaded");
    return <div>Loading...</div>;
  }

  return (
    <Rnd
      default={{
        x: block.x || 50,
        y: block.y || 50,
        width: block.width || 380,
        height: block.height || 400,
      }}
      minWidth={280}
      minHeight={250}
      bounds="parent"
      dragHandleClassName="card-drag-handle"
      enableResizing={!isLocked}
      disableDragging={isLocked}
      onDragStop={(e, data) => {
        if (onDragStop) onDragStop(block.id, data.x, data.y);
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        if (onResizeStop) {
          onResizeStop(
            block.id,
            ref.offsetWidth,
            ref.offsetHeight,
            position.x,
            position.y,
          );
        }
      }}
      style={{ position: "absolute" }}
      className="rnd-container"
    >
      <div
        className="free-card"
        style={{
          backgroundColor: colors.cardBg,
          borderColor: colors.accent + "80",
        }}
      >
        <button className="card-delete" onClick={() => onDelete(block.id)}>
          ✕
        </button>
        <div className="card-header">
          <div
            className={`card-title card-drag-handle`}
            style={{ cursor: isLocked ? "default" : "grab" }}
          >
            <span>{block.icon || "📋"}</span>
            <span style={{ color: colors.accent }}>{block.title}</span>
          </div>
        </div>
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-item">
              <input
                type="checkbox"
                className="task-check"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                disabled={isLocked}
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
      </div>
    </Rnd>
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
    // Находим позицию для нового блока (сдвигаем относительно других)
    const maxX = Math.max(
      50,
      ...blocks.map((b) => (b.x || 50) + (b.width || 380)),
    );
    const newBlock = {
      id: Date.now(),
      title: "Новый блок задач",
      icon: "📝",
      tasks: [],
      x: maxX + 20,
      y: 50,
      width: 380,
      height: 400,
    };
    saveBlocks([...blocks, newBlock]);
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

  const handleDragStop = (blockId, x, y) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block) {
      updateBlock({ ...block, x, y });
    }
  };

  const handleResizeStop = (blockId, width, height, x, y) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block) {
      updateBlock({ ...block, width, height, x, y });
    }
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
        style={{ position: "relative", minHeight: "calc(100vh - 80px)" }}
      >
        {blocks.map((block) => (
          <TaskBlock
            key={block.id}
            block={block}
            onUpdate={updateBlock}
            onDelete={deleteBlock}
            colors={colors}
            isLocked={isLocked}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
          />
        ))}
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

// Рендерим приложение
const rootElement = document.getElementById("root");
if (ReactDOM.createRoot) {
  ReactDOM.createRoot(rootElement).render(React.createElement(App));
} else {
  ReactDOM.render(React.createElement(App), rootElement);
}
