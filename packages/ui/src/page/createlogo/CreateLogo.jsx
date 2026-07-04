import { useEffect, useState, useContext, useRef } from "react";
import { UserContext, AuthContext } from "../../contexts/Contexts.jsx";
import { useToast } from "../../hooks/useToast.js";
import styles from "./CreateLogo.module.css";
import { useCanvasControls } from "../../components/logo/useCanvasControls.js";
import { useFileOperations } from "../../components/logo/useFileOperations.js";
import TopToolbar from "../../components/logo/TopToolbar.jsx";
import ToolbarSection from "../../components/logo/ToolbarSection.jsx";
import LogoUploadForm from "../../components/logo/LogoUploadForm.jsx";
import PropTypes from "prop-types";

export default function CreateLogo({ openAuthModal }) {
  const fileInputRef = useRef(null);
  const { userData } = useContext(UserContext);
  const { isAuthenticated } = useContext(AuthContext);
  const toast = useToast();
  const isGuest = userData?.role === "GUEST";

  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [exportType, setExportType] = useState("png");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [textConfig, setTextConfig] = useState({
    font: "Arial",
    fontSize: 32,
    bold: false,
    italic: false,
    underline: false,
  });
  const [currentColor, setCurrentColor] = useState("#000000");
  const [shapesConfig, setShapesConfig] = useState({ isFilled: true });
  const [drawingConfig, setDrawingConfig] = useState({
    isDrawing: false,
    brushSize: 5,
  });

  const canvasControls = useCanvasControls();

  const deactivateOtherTools = (toolToKeepActive) => {
    if (toolToKeepActive !== "draw" && drawingConfig.isDrawing) {
      setDrawingConfig((prev) => ({ ...prev, isDrawing: false }));
      canvasControls.fabricCanvasRef.current.isDrawingMode = false;
    }
    setActiveTool(toolToKeepActive);
  };

  // Initialize canvas with cleanup
  useEffect(() => {
    const canvas = canvasControls.initializeCanvas();
    if (canvas) {
      setupEventListeners(canvas);
    }

    const mediaQuery = window.matchMedia("(min-width: 1025px)");
    setSidebarOpen(mediaQuery.matches);
    const handler = (e) => setSidebarOpen(e.matches);
    mediaQuery.addEventListener("change", handler);

    const handleBeforeUnload = (e) => {
      const canvas = canvasControls.fabricCanvasRef.current;
      if (canvas && canvas.getObjects().length > 0) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      mediaQuery.removeEventListener("change", handler);
      canvasControls.disposeCanvas();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
    // Mount-only: canvas and listeners must not re-init every render; handlers close over initial canvasControls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fileOperations = useFileOperations(
    canvasControls.fabricCanvasRef,
    isGuest,
    toast
  );

  const setupEventListeners = (canvas) => {
    canvas.on("selection:created", updateControls);
    canvas.on("selection:updated", updateControls);
    canvas.on("selection:cleared", resetControls);

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
  };

  const updateControls = () => {
    const obj = canvasControls.getActiveText();
    if (obj) {
      setTextConfig({
        font: obj.fontFamily || "Arial",
        fontSize: obj.fontSize || 32,
        bold: obj.fontWeight === "bold" || obj.fontWeight === 700,
        italic: obj.fontStyle === "italic",
        underline: !!obj.underline,
      });
    }
  };

  const resetControls = () => {
    setTextConfig({
      font: "Arial",
      fontSize: 32,
      bold: false,
      italic: false,
      underline: false,
    });
  };

  const handleResize = () => {
    const canvas = canvasControls.fabricCanvasRef.current;
    if (!canvas) return;

    const newWidth = Math.min(window.innerWidth - 40, 900);
    canvas.setDimensions({
      width: newWidth,
      height: window.innerWidth < 768 ? 400 : 650,
    });
    canvas.renderAll();
    canvasControls.saveHistory();
  };

  const handleKeyDown = (e) => {
    const canvas = canvasControls.fabricCanvasRef.current;
    const activeObj = canvas?.getActiveObject();
    const isEditingText = activeObj?.isEditing;
    const isTypingInInput = ["INPUT", "TEXTAREA"].includes(
      document.activeElement?.tagName
    );

    if (isEditingText || isTypingInInput) return;

    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      canvasControls.deleteSelected();
    }
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "z":
          e.preventDefault();
          canvasControls.undo();
          break;
        case "y":
          e.preventDefault();
          canvasControls.redo();
          break;
        case "d":
          e.preventDefault();
          canvasControls.duplicateSelected();
          break;
        case "b":
          e.preventDefault();
          toggleTextStyle("bold");
          break;
      }
    }
  };

  // Handlers
  const handleChangeColor = (e) => {
    const color = e.target.value;
    setCurrentColor(color);

    if (drawingConfig.isDrawing) {
      canvasControls.setupDrawing(color, drawingConfig.brushSize);
    }

    const obj = canvasControls.getActiveObject();
    if (obj) {
      if (obj.type === "path") {
        obj.set("stroke", color);
      } else {
        obj.set({
          fill: shapesConfig.isFilled ? color : "transparent",
          stroke: color,
          strokeWidth: shapesConfig.isFilled ? 1 : 4,
        });
      }
      canvasControls.fabricCanvasRef.current?.renderAll();
      canvasControls.saveHistory();
    }
  };

  const toggleTextStyle = (style) => {
    const text = canvasControls.getActiveText();
    if (!text) return;

    const newValue = !textConfig[style];
    setTextConfig((prev) => ({ ...prev, [style]: newValue }));

    const styleMap = {
      bold: { fontWeight: newValue ? "bold" : "normal" },
      italic: { fontStyle: newValue ? "italic" : "normal" },
      underline: { underline: newValue },
    };

    text.set(styleMap[style]);
    canvasControls.fabricCanvasRef.current?.renderAll();
    canvasControls.saveHistory();
  };

  const handleResetCanvas = () => {
    if (window.confirm("Are you sure you want to clear the entire canvas?")) {
      canvasControls.resetCanvas();
      toast?.success("Canvas cleared");
      setActiveTool(null);
    }
  };

  const handleUploadClick = () => {
    if (!isAuthenticated || isGuest) {
      openAuthModal("/createlogo");
      setIsUploadModalOpen(true);
      return;
    }
    setIsUploadModalOpen(true);
  };

  const handleExportClick = () => {
    if (!isAuthenticated || isGuest) {
      openAuthModal("/createlogo");
      return;
    }
    fileOperations.handleExport(exportType);
  };

  // Configuration objects for ToolbarSection
  const config = {
    text: textConfig,
    shapes: shapesConfig,
    drawing: drawingConfig,
  };

  // Update handlers to manage active tool state
  const handlers = {
    text: {
      addText: () => {
        canvasControls.addText({
          fontSize: textConfig.fontSize,
          color: currentColor,
          fontFamily: textConfig.font,
          bold: textConfig.bold,
          italic: textConfig.italic,
          underline: textConfig.underline,
        });
        deactivateOtherTools(null);
      },
      changeFont: (e) => {
        const font = e.target.value;
        setTextConfig((prev) => ({ ...prev, font }));
        const text = canvasControls.getActiveText();
        if (text) {
          text.set("fontFamily", font);
          canvasControls.fabricCanvasRef.current?.renderAll();
          canvasControls.saveHistory();
        }
      },
      changeSize: (e) => {
        const size = parseInt(e.target.value, 10);
        setTextConfig((prev) => ({ ...prev, fontSize: size }));
        const text = canvasControls.getActiveText();
        if (text) {
          text.set("fontSize", size);
          canvasControls.fabricCanvasRef.current?.renderAll();
          canvasControls.saveHistory();
        }
      },
      toggleStyle: toggleTextStyle,
    },
    shapes: {
      setFilled: (value) =>
        setShapesConfig((prev) => ({ ...prev, isFilled: value })),
      addShape: (type) => {
        canvasControls.addShape(type, currentColor, shapesConfig.isFilled);
        deactivateOtherTools(null); // Shapes don't stay active after adding
      },
    },
    drawing: {
      toggleDrawing: () => {
        const newMode = !drawingConfig.isDrawing;
        setDrawingConfig((prev) => ({ ...prev, isDrawing: newMode }));
        canvasControls.fabricCanvasRef.current.isDrawingMode = newMode;
        if (newMode) {
          canvasControls.setupDrawing(currentColor, drawingConfig.brushSize);
          setActiveTool("draw");
        } else {
          setActiveTool(null);
        }
      },
      setBrushSize: (size) => {
        setDrawingConfig((prev) => ({ ...prev, brushSize: size }));
        if (drawingConfig.isDrawing) {
          canvasControls.setupDrawing(currentColor, size);
        }
      },
    },
    triggerImageUpload: () => fileInputRef.current?.click(),
  };

  return (
    <div className={styles.container}>
      <TopToolbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        duplicateSelected={canvasControls.duplicateSelected}
        deleteSelected={canvasControls.deleteSelected}
        bringToFront={canvasControls.bringToFront}
        sendToBack={canvasControls.sendToBack}
        undo={canvasControls.undo}
        redo={canvasControls.redo}
        resetCanvas={handleResetCanvas}
        currentColor={currentColor}
        handleChangeColor={handleChangeColor}
        handleUploadClick={handleUploadClick}
        handleExport={handleExportClick}
        exportType={exportType}
        setExportType={setExportType}
        isGuest={isGuest}
      />

      <div className={styles.editorLayout}>
        <ToolbarSection
          sidebarOpen={sidebarOpen}
          config={config}
          handlers={handlers}
          activeTool={activeTool}
        />

        <div className={styles.canvasWrapper}>
          <canvas ref={canvasControls.canvasRef} />
        </div>
      </div>

      <input
        ref={(el) => (fileInputRef.current = el)}
        type="file"
        accept={fileOperations.getAllowedFileTypes?.() || "image/*"}
        onChange={fileOperations.handleImageUpload}
        style={{ display: "none" }}
      />

      {isUploadModalOpen && (
        <LogoUploadForm
          closeModal={() => setIsUploadModalOpen(false)}
          getCanvasDataUrl={fileOperations.getCanvasDataUrl}
        />
      )}
    </div>
  );
}
CreateLogo.propTypes = {
  openAuthModal: PropTypes.func.isRequired,
};
