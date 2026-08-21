import { useRef, useState } from "react";
import {
  Canvas,
  PencilBrush,
  Textbox,
  Rect,
  Circle,
  Triangle,
  Line,
  Group,
  ActiveSelection,
} from "fabric";

export const useCanvasControls = () => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const isProcessingRef = useRef(false);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const isInitializedRef = useRef(false);

  const initializeCanvas = () => {
    // Fabric v7's dispose() completely removes the canvas container from the DOM.
    // Using useState for the initialization guard is too slow (async) for React 18 Strict Mode,
    // causing a race condition where the canvas is disposed and not properly recreated.
    // We MUST use a synchronous useRef to guard initialization.
    if (!canvasRef.current) return;
    if (isInitializedRef.current) return fabricCanvasRef.current;

    isInitializedRef.current = true;

    const canvas = new Canvas(canvasRef.current, {
      width: Math.min(window.innerWidth - 40, 900),
      height: 500,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    const initialJson = JSON.stringify(canvas.toJSON());
    setHistory([initialJson]);
    canvas.on("object:added", saveHistory);
    canvas.on("object:modified", saveHistory);
    canvas.on("object:removed", saveHistory);
    canvas.on("text:changed", saveHistory);

    return canvas;
  };

  const disposeCanvas = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
      isInitializedRef.current = false;
    }
  };

  const saveHistory = () => {
    if (!fabricCanvasRef.current) return;
    if (isProcessingRef.current) return;

    const json = JSON.stringify(fabricCanvasRef.current.toJSON());

    setHistory((prev) => {
      if (prev[prev.length - 1] === json) return prev;
      return [...prev, json].slice(-40);
    });

    setRedoStack([]);
  };

  const getCanvasCenter = () => {
    const canvas = fabricCanvasRef.current;
    return canvas
      ? {
          x: canvas.width / 2,
          y: canvas.height / 2,
        }
      : { x: 150, y: 150 };
  };

  const getActiveObject = () => fabricCanvasRef.current?.getActiveObject();
  const getActiveText = () => {
    const obj = getActiveObject();
    return obj && obj.type === "textbox" ? obj : null;
  };

  // Text controls
  const addText = (options) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCenter();
    const text = new Textbox("New text", {
      left: x,
      top: y,
      originX: "center",
      originY: "center",
      fontSize: options.fontSize || 32,
      width: 140,
      fill: options.color || "#000000",
      fontFamily: options.fontFamily || "Arial",
      fontWeight: options.bold ? "bold" : "normal",
      fontStyle: options.italic ? "italic" : "normal",
      underline: options.underline || false,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveHistory();
  };

  // Shape controls
  const addShape = (type, color, isFilled) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.discardActiveObject();
    const { x, y } = getCanvasCenter();

    let shape;

    // Declare variables outside switch
    let arrowLength, strokeWidth, line, head;

    switch (type) {
      case "rectangle":
        shape = new Rect({
          left: x,
          top: y,
          originX: "center",
          originY: "center",
          width: 150,
          height: 100,
          fill: isFilled ? color : "transparent",
          stroke: color,
          strokeWidth: isFilled ? 1 : 4,
          strokeUniform: true,
        });
        break;
      case "circle":
        shape = new Circle({
          left: x,
          top: y,
          originX: "center",
          originY: "center",
          radius: 60,
          fill: isFilled ? color : "transparent",
          stroke: color,
          strokeWidth: isFilled ? 1 : 4,
        });
        break;
      case "triangle":
        shape = new Triangle({
          left: x,
          top: y,
          originX: "center",
          originY: "center",
          width: 120,
          height: 100,
          fill: isFilled ? color : "transparent",
          stroke: color,
          strokeWidth: isFilled ? 1 : 4,
        });
        break;
      case "line":
        shape = new Line([x - 100, y, x + 100, y], {
          stroke: color,
          strokeWidth: 4,
        });
        break;
      case "arrow":
        arrowLength = 100;
        strokeWidth = 4;
        line = new Line([x - arrowLength / 2, y, x + arrowLength / 2, y], {
          stroke: color,
          strokeWidth,
          originX: "center",
          originY: "center",
        });
        head = new Triangle({
          width: 20,
          height: 30,
          fill: color,
          left: x + arrowLength / 2,
          top: y,
          originX: "center",
          originY: "center",
          angle: 90,
        });
        shape = new Group([line, head], {
          left: x,
          top: y,
          originX: "center",
          originY: "center",
        });
        break;
      default:
        return;
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    saveHistory();
  };

  // Drawing controls
  const setupDrawing = (color, size) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (!canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush = new PencilBrush(canvas);
    }

    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = size;
  };

  // Object management
  const duplicateSelected = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    // Clone each selected object
    const clonedObjects = [];
    let processed = 0;

    activeObjects.forEach((obj) => {
      obj.clone().then((cloned) => {
        cloned.set({
          left: cloned.left + 30,
          top: cloned.top + 30,
        });
        canvas.add(cloned);
        clonedObjects.push(cloned);
        processed++;

        // When all objects are cloned
        if (processed === activeObjects.length) {
          canvas.discardActiveObject();

          // Select the cloned objects
          if (clonedObjects.length === 1) {
            canvas.setActiveObject(clonedObjects[0]);
          } else if (clonedObjects.length > 1) {
            const selection = new ActiveSelection(clonedObjects, {
              canvas: canvas,
            });
            canvas.setActiveObject(selection);
          }

          canvas.renderAll();
          saveHistory();
        }
      });
    });
  };

  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  };

  const bringToFront = () => {
    const canvas = fabricCanvasRef.current;
    const obj = getActiveObject();
    if (obj && canvas) {
      canvas.bringObjectToFront(obj);
      canvas.renderAll();
    }
  };

  const sendToBack = () => {
    const canvas = fabricCanvasRef.current;
    const obj = getActiveObject();
    if (obj && canvas) {
      canvas.sendObjectToBack(obj);
      canvas.renderAll();
    }
  };

  const undo = async () => {
    if (isProcessingRef.current) return;
    if (history.length <= 1) return;

    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    isProcessingRef.current = true;

    const current = history[history.length - 1];
    const previous = history[history.length - 2];

    // Add current state to redo stack
    setRedoStack((prev) => [...prev, current]);

    // Remove last state from history
    setHistory((prev) => prev.slice(0, -1));

    // Load previous state
    await canvas.loadFromJSON(previous);
    canvas.renderAll();

    isProcessingRef.current = false;
  };

  const redo = async () => {
    if (isProcessingRef.current) return;
    if (redoStack.length === 0) return;

    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    isProcessingRef.current = true;

    // Get the next state from redo stack
    const nextState = redoStack[redoStack.length - 1];

    // Remove it from redo stack
    setRedoStack((prev) => prev.slice(0, -1));

    // Add current state to history
    setHistory((prev) => [...prev, nextState]);

    // Load the next state
    await canvas.loadFromJSON(nextState);
    canvas.renderAll();

    isProcessingRef.current = false;
  };

  const resetCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return false;

    canvas.clear();
    canvas.backgroundColor = null; // Let the CSS background color show through

    const initialJson = JSON.stringify(canvas.toJSON());
    setHistory([initialJson]);
    setRedoStack([]);
    canvas.renderAll();

    return true;
  };

  return {
    canvasRef,
    fabricCanvasRef,
    isProcessingRef,
    history,
    redoStack,
    isInitialized: isInitializedRef.current,
    initializeCanvas,
    disposeCanvas,
    saveHistory,
    getCanvasCenter,
    getActiveObject,
    getActiveText,
    addText,
    addShape,
    setupDrawing,
    duplicateSelected,
    deleteSelected,
    bringToFront,
    sendToBack,
    undo,
    redo,
    resetCanvas,
  };
};
