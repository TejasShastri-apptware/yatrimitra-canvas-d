import React, { useRef, useEffect, useState } from 'react';

// Import types
import type {
  Tool,
  Point,
  Room,
  Wall,
  PencilPath,
  FloorPlanElement,
  FloorPlanCanvasProps,
} from '../types/floorplan';

// Re-export types for backward compatibility
export type {
  Tool,
  Point,
  Room,
  Door,
  Window,
  Camera,
  Wall,
  PencilPath,
  FloorPlanElement,
} from '../types/floorplan';

// Import utilities
import { snapToGrid, distance } from '../utils/geometry';
import {
  drawGrid,
  drawRoom,
  drawDoor,
  drawWindow,
  drawCamera,
  drawWall,
  drawPencilPath,
  drawTextBlock,
} from '../utils/drawing';
import { findElementAtPoint } from '../utils/selection';
import {
  GRID_SIZE,
  DEFAULT_WALL_THICKNESS,
  DEFAULT_PENCIL_COLOR,
  DEFAULT_PENCIL_LINE_WIDTH,
  COLORS,
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_STEP,
} from '../utils/constants';

export function FloorPlanCanvas({
  selectedTool,
  elements,
  onElementsChange,
  selectedElementId,
  onSelectedElementChange,
  zoom = 1,
  onZoomChange,
}: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [pencilPoints, setPencilPoints] = useState<Point[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(selectedElementId || null);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null);
  const [draggedElementStartPos, setDraggedElementStartPos] = useState<any>(null);

  // Main rendering effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height, panOffset, zoom);

    // Draw all elements
    elements.forEach((element) => {
      const isSelected = element.id === selectedElement;

      switch (element.type) {
        case 'room':
          drawRoom(ctx, element, panOffset, isSelected, zoom);
          break;
        case 'door':
          drawDoor(ctx, element, panOffset, isSelected, zoom);
          break;
        case 'window':
          drawWindow(ctx, element, panOffset, isSelected, zoom);
          break;
        case 'camera':
          drawCamera(ctx, element, panOffset, isSelected, zoom);
          break;
        case 'wall':
          drawWall(ctx, element, panOffset, isSelected, zoom);
          break;
        case 'pencil':
          drawPencilPath(ctx, element, panOffset, isSelected, zoom);
          break;
        case 'text':
          drawTextBlock(ctx, element, panOffset, isSelected, zoom);
          break;
      }
    });

    // Draw preview while drawing
    if (isDrawing && startPoint && currentPoint) {
      if (selectedTool === 'room') {
        const width = currentPoint.x - startPoint.x;
        const height = currentPoint.y - startPoint.y;

        ctx.strokeStyle = COLORS.selected;
        ctx.fillStyle = 'rgba(96, 165, 250, 0.1)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        // Apply pan offset and zoom to convert world coordinates to screen coordinates
        ctx.strokeRect(startPoint.x * zoom + panOffset.x, startPoint.y * zoom + panOffset.y, width * zoom, height * zoom);
        ctx.fillRect(startPoint.x * zoom + panOffset.x, startPoint.y * zoom + panOffset.y, width * zoom, height * zoom);
        ctx.setLineDash([]);
      } else if (selectedTool === 'wall') {
        ctx.strokeStyle = COLORS.wall;
        ctx.lineWidth = DEFAULT_WALL_THICKNESS;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.7;
        ctx.setLineDash([5, 5]);

        ctx.beginPath();
        // Apply pan offset and zoom to convert world coordinates to screen coordinates
        ctx.moveTo(startPoint.x * zoom + panOffset.x, startPoint.y * zoom + panOffset.y);
        ctx.lineTo(currentPoint.x * zoom + panOffset.x, currentPoint.y * zoom + panOffset.y);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
    }

    // Draw pencil preview
    if (isDrawing && selectedTool === 'pencil' && pencilPoints.length > 1) {
      ctx.strokeStyle = COLORS.pencil;
      ctx.lineWidth = DEFAULT_PENCIL_LINE_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.8;

      ctx.beginPath();
      // Apply pan offset and zoom to convert world coordinates to screen coordinates
      ctx.moveTo(pencilPoints[0].x * zoom + panOffset.x, pencilPoints[0].y * zoom + panOffset.y);

      for (let i = 1; i < pencilPoints.length; i++) {
        ctx.lineTo(pencilPoints[i].x * zoom + panOffset.x, pencilPoints[i].y * zoom + panOffset.y);
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }, [elements, selectedElement, isDrawing, startPoint, currentPoint, selectedTool, panOffset, pencilPoints, zoom]);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    if (selectedTool === 'pan' || e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart(point);
      return;
    }

    if (selectedTool === 'select') {
      const clicked = findElementAtPoint(point, elements, panOffset, zoom);
      setSelectedElement(clicked ? clicked.id : null);
      onSelectedElementChange?.(clicked ? clicked.id : null);

      // Start dragging if an element is selected
      if (clicked) {
        setIsDragging(true);
        setDragStartPoint(point);
        // Store the original position of the element
        if (clicked.type === 'room') {
          setDraggedElementStartPos({ x: clicked.x, y: clicked.y });
        } else if (clicked.type === 'wall') {
          setDraggedElementStartPos({ x1: clicked.x1, y1: clicked.y1, x2: clicked.x2, y2: clicked.y2 });
        } else if (clicked.type === 'pencil') {
          setDraggedElementStartPos({ points: [...clicked.points] });
        } else if (clicked.type === 'text') {
          setDraggedElementStartPos({ x: clicked.x, y: clicked.y });
        } else {
          setDraggedElementStartPos({ x: clicked.x, y: clicked.y });
        }
      }
      return;
    }

    if (selectedTool === 'room') {
      const snapped = snapToGrid({ x: (point.x - panOffset.x) / zoom, y: (point.y - panOffset.y) / zoom });
      setIsDrawing(true);
      setStartPoint(snapped);
      setCurrentPoint(snapped);
    } else if (selectedTool === 'wall') {
      const snapped = snapToGrid({ x: (point.x - panOffset.x) / zoom, y: (point.y - panOffset.y) / zoom });
      setIsDrawing(true);
      setStartPoint(snapped);
      setCurrentPoint(snapped);
    } else if (selectedTool === 'pencil') {
      const unsnapped = { x: (point.x - panOffset.x) / zoom, y: (point.y - panOffset.y) / zoom };
      setIsDrawing(true);
      setStartPoint(unsnapped);
      setCurrentPoint(unsnapped);
      setPencilPoints([unsnapped]);
    } else if (selectedTool === 'door' || selectedTool === 'window' || selectedTool === 'camera') {
      const snapped = snapToGrid({ x: (point.x - panOffset.x) / zoom, y: (point.y - panOffset.y) / zoom });
      const newElement: FloorPlanElement =
        selectedTool === 'door'
          ? { id: Date.now().toString(), type: 'door', x: snapped.x, y: snapped.y, rotation: 0 }
          : selectedTool === 'window'
            ? { id: Date.now().toString(), type: 'window', x: snapped.x, y: snapped.y, rotation: 0 }
            : { id: Date.now().toString(), type: 'camera', x: snapped.x, y: snapped.y, rotation: 0 };

      onElementsChange([...elements, newElement]);
    } else if (selectedTool === 'text') {
      const snapped = snapToGrid({ x: (point.x - panOffset.x) / zoom, y: (point.y - panOffset.y) / zoom });
      const newText: FloorPlanElement = {
        id: Date.now().toString(),
        type: 'text',
        x: snapped.x,
        y: snapped.y,
        text: 'New Text',
        fontSize: 16,
        color: '#ffffff'
      };
      onElementsChange([...elements, newText]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    if (isPanning && panStart) {
      setPanOffset({
        x: panOffset.x + (point.x - panStart.x),
        y: panOffset.y + (point.y - panStart.y),
      });
      setPanStart(point);
      return;
    }

    // Handle dragging selected element
    if (isDragging && dragStartPoint && selectedElement && draggedElementStartPos) {
      const deltaX = (point.x - dragStartPoint.x) / zoom;
      const deltaY = (point.y - dragStartPoint.y) / zoom;

      const updatedElements = elements.map((el) => {
        if (el.id === selectedElement) {
          if (el.type === 'room') {
            return { ...el, x: draggedElementStartPos.x + deltaX, y: draggedElementStartPos.y + deltaY };
          } else if (el.type === 'wall') {
            return {
              ...el,
              x1: draggedElementStartPos.x1 + deltaX,
              y1: draggedElementStartPos.y1 + deltaY,
              x2: draggedElementStartPos.x2 + deltaX,
              y2: draggedElementStartPos.y2 + deltaY,
            };
          } else if (el.type === 'pencil') {
            return {
              ...el,
              points: draggedElementStartPos.points.map((p: Point) => ({
                x: p.x + deltaX,
                y: p.y + deltaY,
              })),
            };
          } else if (el.type === 'text') {
            return { ...el, x: draggedElementStartPos.x + deltaX, y: draggedElementStartPos.y + deltaY };
          } else {
            // Door, Window, Camera
            return { ...el, x: draggedElementStartPos.x + deltaX, y: draggedElementStartPos.y + deltaY };
          }
        }
        return el;
      });

      onElementsChange(updatedElements);
      return;
    }

    if (isDrawing && startPoint) {
      if (selectedTool === 'room' || selectedTool === 'wall') {
        const snapped = snapToGrid({ x: (point.x - panOffset.x) / zoom, y: (point.y - panOffset.y) / zoom });
        setCurrentPoint(snapped);
      } else if (selectedTool === 'pencil') {
        const unsnapped = { x: (point.x - panOffset.x) / zoom, y: (point.y - panOffset.y) / zoom };
        setPencilPoints((prev) => [...prev, unsnapped]);
        setCurrentPoint(unsnapped);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    if (isDragging) {
      setIsDragging(false);
      setDragStartPoint(null);
      setDraggedElementStartPos(null);
      return;
    }

    if (isDrawing && startPoint && currentPoint) {
      if (selectedTool === 'room') {
        const width = currentPoint.x - startPoint.x;
        const height = currentPoint.y - startPoint.y;

        if (Math.abs(width) > GRID_SIZE && Math.abs(height) > GRID_SIZE) {
          const newRoom: Room = {
            id: Date.now().toString(),
            type: 'room',
            x: width > 0 ? startPoint.x : startPoint.x + width,
            y: height > 0 ? startPoint.y : startPoint.y + height,
            width: Math.abs(width),
            height: Math.abs(height),
          };

          onElementsChange([...elements, newRoom]);
        }
      } else if (selectedTool === 'wall') {
        const length = distance(startPoint, currentPoint);

        if (length > GRID_SIZE) {
          const newWall: Wall = {
            id: Date.now().toString(),
            type: 'wall',
            x1: startPoint.x,
            y1: startPoint.y,
            x2: currentPoint.x,
            y2: currentPoint.y,
            thickness: DEFAULT_WALL_THICKNESS,
          };

          onElementsChange([...elements, newWall]);
        }
      }
    }

    if (isDrawing && selectedTool === 'pencil' && pencilPoints.length > 2) {
      const newPath: PencilPath = {
        id: Date.now().toString(),
        type: 'pencil',
        points: pencilPoints,
        color: DEFAULT_PENCIL_COLOR,
        lineWidth: DEFAULT_PENCIL_LINE_WIDTH,
      };

      onElementsChange([...elements, newPath]);
    }

    // Reset drawing state
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
    setPencilPoints([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedElement) {
        onElementsChange(elements.filter((el) => el.id !== selectedElement));
        setSelectedElement(null);
        onSelectedElementChange?.(null);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
    onZoomChange?.(newZoom);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ cursor: selectedTool === 'pan' || isPanning ? 'grab' : 'crosshair' }}
    />
  );
}