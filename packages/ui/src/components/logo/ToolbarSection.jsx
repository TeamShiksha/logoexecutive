import {
  Type,
  Pencil,
  Minus,
  ArrowRight,
  Bold,
  Italic,
  Underline,
  Square as SquareIcon,
  Circle as CircleIcon,
  Triangle as TriangleIcon,
  Shapes,
  Image,
} from "lucide-react";
import styles from "./ToolbarSection.module.css";
import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";

const TextPanel = ({ config, handlers, activeTool }) => (
  <div className={styles.subPanel}>
    <div className={styles.panelHeader}>Text</div>

    <div className={styles.panelGroup}>
      <label className={styles.panelLabel}>Font</label>
      <select
        className={styles.select}
        value={config.font}
        onChange={handlers.changeFont}
      >
        {[
          "Arial",
          "Helvetica",
          "Times New Roman",
          "Courier New",
          "Georgia",
          "Verdana",
        ].map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>
    </div>

    <div className={styles.panelGroup}>
      <label className={styles.panelLabel}>Size</label>
      <select
        className={styles.select}
        value={config.fontSize}
        onChange={handlers.changeSize}
      >
        {[8, 12, 16, 24, 32, 40, 48, 64].map((size) => (
          <option key={size} value={size}>
            {size}px
          </option>
        ))}
      </select>
    </div>

    <div className={styles.panelGroup}>
      <label className={styles.panelLabel}>Style</label>
      <div className={styles.styleRow}>
        <button
          className={`${styles.styleBtn} ${config.bold ? styles.active : ""}`}
          onClick={() => handlers.toggleStyle("bold")}
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          className={`${styles.styleBtn} ${config.italic ? styles.active : ""}`}
          onClick={() => handlers.toggleStyle("italic")}
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          className={`${styles.styleBtn} ${config.underline ? styles.active : ""}`}
          onClick={() => handlers.toggleStyle("underline")}
          title="Underline"
        >
          <Underline size={14} />
        </button>
      </div>
    </div>

    <button
      className={`${styles.panelAction} ${activeTool === "text" ? styles.active : ""}`}
      onClick={handlers.addText}
    >
      <Type size={14} />
      Add Text
    </button>
  </div>
);

TextPanel.propTypes = {
  config: PropTypes.shape({
    font: PropTypes.string.isRequired,
    fontSize: PropTypes.number.isRequired,
    bold: PropTypes.bool.isRequired,
    italic: PropTypes.bool.isRequired,
    underline: PropTypes.bool.isRequired,
  }).isRequired,
  handlers: PropTypes.shape({
    addText: PropTypes.func.isRequired,
    changeFont: PropTypes.func.isRequired,
    changeSize: PropTypes.func.isRequired,
    toggleStyle: PropTypes.func.isRequired,
  }).isRequired,
  activeTool: PropTypes.string,
};

const ShapesPanel = ({ config, handlers }) => (
  <div className={styles.subPanel}>
    <div className={styles.panelHeader}>Shapes</div>

    <div className={styles.panelGroup}>
      <label className={styles.panelLabel}>Style</label>
      <div className={styles.fillRow}>
        <button
          className={`${styles.fillBtn} ${config.isFilled ? styles.active : ""}`}
          onClick={() => handlers.setFilled(true)}
        >
          Fill
        </button>
        <button
          className={`${styles.fillBtn} ${!config.isFilled ? styles.active : ""}`}
          onClick={() => handlers.setFilled(false)}
        >
          Outline
        </button>
      </div>
    </div>

    <div className={styles.panelGroup}>
      <label className={styles.panelLabel}>Add Shape</label>
      <div className={styles.shapeGrid}>
        {[
          { type: "rectangle", icon: <SquareIcon size={16} />, label: "Rect" },
          { type: "circle", icon: <CircleIcon size={16} />, label: "Circle" },
          { type: "triangle", icon: <TriangleIcon size={16} />, label: "Tri" },
          { type: "line", icon: <Minus size={16} />, label: "Line" },
          { type: "arrow", icon: <ArrowRight size={16} />, label: "Arrow" },
        ].map((shape) => (
          <button
            key={shape.type}
            className={styles.shapeBtn}
            onClick={() => handlers.addShape(shape.type)}
            title={shape.label}
          >
            {shape.icon}
            <span>{shape.label}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

ShapesPanel.propTypes = {
  config: PropTypes.shape({
    isFilled: PropTypes.bool.isRequired,
  }).isRequired,
  handlers: PropTypes.shape({
    setFilled: PropTypes.func.isRequired,
    addShape: PropTypes.func.isRequired,
  }).isRequired,
};

const DrawPanel = ({ config, handlers }) => (
  <div className={styles.subPanel}>
    <div className={styles.panelHeader}>Draw</div>

    <div className={styles.panelGroup}>
      <button
        className={`${styles.panelAction} ${config.isDrawing ? styles.active : ""}`}
        onClick={handlers.toggleDrawing}
      >
        <Pencil size={14} />
        {config.isDrawing ? "Drawing…" : "Enable Pen"}
      </button>
    </div>

    <div className={styles.panelGroup}>
      <div className={styles.sliderHeader}>
        <label className={styles.panelLabel}>Brush Size</label>
        <span className={styles.sliderValue}>{config.brushSize}</span>
      </div>
      <input
        type="range"
        min="1"
        max="50"
        value={config.brushSize}
        onChange={(e) => handlers.setBrushSize(parseInt(e.target.value, 10))}
        className={styles.slider}
      />
    </div>
  </div>
);

DrawPanel.propTypes = {
  config: PropTypes.shape({
    isDrawing: PropTypes.bool.isRequired,
    brushSize: PropTypes.number.isRequired,
  }).isRequired,
  handlers: PropTypes.shape({
    toggleDrawing: PropTypes.func.isRequired,
    setBrushSize: PropTypes.func.isRequired,
  }).isRequired,
};

const RailBtn = ({ icon, label, active, onClick }) => (
  <button
    className={`${styles.railBtn} ${active ? styles.railBtnActive : ""}`}
    onClick={onClick}
    title={label}
  >
    {icon}
  </button>
);

RailBtn.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default function ToolbarSection({
  sidebarOpen,
  config,
  handlers,
  activeTool,
}) {
  const [openPanel, setOpenPanel] = useState(null);
  const sidebarRef = useRef(null);

  const toggle = (panel) =>
    setOpenPanel((prev) => (prev === panel ? null : panel));

  useEffect(() => {
    const handleClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div
      ref={sidebarRef}
      className={`${styles.sidebarWrapper} ${sidebarOpen ? styles.open : styles.closed}`}
    >
      <aside className={styles.rail}>
        <div className={styles.railGroup}>
          <RailBtn
            icon={<Type size={17} />}
            label="Text"
            active={openPanel === "text"}
            onClick={() => toggle("text")}
          />
        </div>

        <div className={styles.railDivider} />

        <div className={styles.railGroup}>
          <RailBtn
            icon={<Shapes size={17} />}
            label="Shapes"
            active={openPanel === "shapes"}
            onClick={() => toggle("shapes")}
          />
        </div>

        <div className={styles.railDivider} />

        <div className={styles.railGroup}>
          <RailBtn
            icon={<Pencil size={17} />}
            label="Draw"
            active={openPanel === "draw" || config.drawing.isDrawing}
            onClick={() => toggle("draw")}
          />
        </div>

        <div className={styles.railDivider} />

        <div className={styles.railGroup}>
          <RailBtn
            icon={<Image size={17} />}
            label="Import Image"
            active={false}
            onClick={handlers.triggerImageUpload}
          />
        </div>
      </aside>

      {openPanel && (
        <div className={styles.subPanelContainer}>
          {openPanel === "text" && (
            <TextPanel
              config={config.text}
              handlers={handlers.text}
              activeTool={activeTool}
            />
          )}
          {openPanel === "shapes" && (
            <ShapesPanel config={config.shapes} handlers={handlers.shapes} />
          )}
          {openPanel === "draw" && (
            <DrawPanel config={config.drawing} handlers={handlers.drawing} />
          )}
        </div>
      )}
    </div>
  );
}

ToolbarSection.propTypes = {
  sidebarOpen: PropTypes.bool.isRequired,
  config: PropTypes.shape({
    text: PropTypes.shape({
      font: PropTypes.string.isRequired,
      fontSize: PropTypes.number.isRequired,
      bold: PropTypes.bool.isRequired,
      italic: PropTypes.bool.isRequired,
      underline: PropTypes.bool.isRequired,
    }).isRequired,
    shapes: PropTypes.shape({
      isFilled: PropTypes.bool.isRequired,
    }).isRequired,
    drawing: PropTypes.shape({
      isDrawing: PropTypes.bool.isRequired,
      brushSize: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  handlers: PropTypes.shape({
    text: PropTypes.shape({
      addText: PropTypes.func.isRequired,
      changeFont: PropTypes.func.isRequired,
      changeSize: PropTypes.func.isRequired,
      toggleStyle: PropTypes.func.isRequired,
    }).isRequired,
    shapes: PropTypes.shape({
      setFilled: PropTypes.func.isRequired,
      addShape: PropTypes.func.isRequired,
    }).isRequired,
    drawing: PropTypes.shape({
      toggleDrawing: PropTypes.func.isRequired,
      setBrushSize: PropTypes.func.isRequired,
    }).isRequired,
    triggerImageUpload: PropTypes.func.isRequired,
  }).isRequired,
  activeTool: PropTypes.string,
};
