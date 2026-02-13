/**
 * Type definitions for the Floor Plan Designer application
 */

export type Tool = 'select' | 'room' | 'door' | 'window' | 'camera' | 'wall' | 'pencil' | 'pan';

export interface Point {
    x: number;
    y: number;
}

export interface Room {
    id: string;
    type: 'room';
    x: number;
    y: number;
    width: number;
    height: number;
    name?: string;
}

export interface Door {
    id: string;
    type: 'door';
    x: number;
    y: number;
    rotation: number;
}

export interface Window {
    id: string;
    type: 'window';
    x: number;
    y: number;
    rotation: number;
}

export interface Camera {
    id: string;
    type: 'camera';
    x: number;
    y: number;
    rotation: number;
}

export interface Wall {
    id: string;
    type: 'wall';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    thickness: number;
}

export interface PencilPath {
    id: string;
    type: 'pencil';
    points: Point[];
    color: string;
    lineWidth: number;
}

export type FloorPlanElement = Room | Door | Window | Camera | Wall | PencilPath;

export interface FloorPlanCanvasProps {
    selectedTool: Tool;
    elements: FloorPlanElement[];
    onElementsChange: (elements: FloorPlanElement[]) => void;
    selectedElementId?: string | null;
    onSelectedElementChange?: (id: string | null) => void;
    zoom?: number;
    onZoomChange?: (zoom: number) => void;
}
