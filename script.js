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
      ...blocks.map((b) => (b.x || 50) + (b.width || 370)),
    );
    const newCalendar = {
      id: Date.now(),
      type: "calendar",
      title: "Календарь",
      x: maxX + 20,
      y: 50,
      width: 370,
      height: 360,
    };
    saveBlocks([...blocks, newCalendar]);
    setIsMenuOpen(false);
  };

  const deleteBlock = (blockId) => {
    saveBlocks(blocks.filter((b) => b.id !== blockId));
  };

  const updateBlock = (updatedBlock) => {
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
