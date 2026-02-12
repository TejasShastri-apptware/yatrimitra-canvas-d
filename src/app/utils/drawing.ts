/**
 * Drawing utility functions for rendering floor plan elements
 */

import {
    Room,
    Door,
    Window,
    Camera,
    Wall,
    PencilPath,
    Point,
} from '../types/floorplan';
import {
    GRID_SIZE,
    DOOR_SIZE,
    WINDOW_SIZE,
    CAMERA_SIZE,
    COLORS,
} from './constants';

/**
 * Draws the grid on the canvas
 */
export function drawGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    panOffset: Point
): void {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    for (let x = panOffset.x % GRID_SIZE; x < width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = panOffset.y % GRID_SIZE; y < height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

/**
 * Draws a room element
 */
export function drawRoom(
    ctx: CanvasRenderingContext2D,
    room: Room,
    panOffset: Point,
    isSelected: boolean
): void {
    ctx.strokeStyle = isSelected ? COLORS.selected : COLORS.room;
    ctx.fillStyle = COLORS.roomFill;
    ctx.lineWidth = isSelected ? 3 : 2;

    ctx.fillRect(room.x + panOffset.x, room.y + panOffset.y, room.width, room.height);
    ctx.strokeRect(room.x + panOffset.x, room.y + panOffset.y, room.width, room.height);

    const centerX = room.x + panOffset.x + room.width / 2;
    const centerY = room.y + panOffset.y + room.height / 2;

    // Add room name in bright yellow if it exists
    if (room.name) {
        ctx.fillStyle = COLORS.roomName;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(room.name, centerX, centerY - 10);
    }

    // Add dimension labels
    ctx.fillStyle = COLORS.label;
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
        `${Math.abs(Math.round(room.width / GRID_SIZE))}x${Math.abs(Math.round(room.height / GRID_SIZE))}`,
        centerX,
        room.name ? centerY + 10 : centerY
    );
}

/**
 * Draws a door element
 */
export function drawDoor(
    ctx: CanvasRenderingContext2D,
    door: Door,
    panOffset: Point,
    isSelected: boolean
): void {
    ctx.save();
    ctx.translate(door.x + panOffset.x, door.y + panOffset.y);
    ctx.rotate((door.rotation * Math.PI) / 180);

    // Door frame
    ctx.strokeStyle = isSelected ? COLORS.selected : COLORS.door;
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(-DOOR_SIZE / 2, 0);
    ctx.lineTo(DOOR_SIZE / 2, 0);
    ctx.stroke();

    // Door arc
    ctx.strokeStyle = isSelected ? 'rgba(96, 165, 250, 0.6)' : 'rgba(139, 92, 246, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-DOOR_SIZE / 2, 0, DOOR_SIZE, 0, Math.PI / 2);
    ctx.stroke();

    // Selection circle
    if (isSelected) {
        ctx.fillStyle = COLORS.selected;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

/**
 * Draws a window element
 */
export function drawWindow(
    ctx: CanvasRenderingContext2D,
    window: Window,
    panOffset: Point,
    isSelected: boolean
): void {
    ctx.save();
    ctx.translate(window.x + panOffset.x, window.y + panOffset.y);
    ctx.rotate((window.rotation * Math.PI) / 180);

    // Window frame
    ctx.strokeStyle = isSelected ? COLORS.selected : COLORS.window;
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';

    ctx.fillRect(-WINDOW_SIZE / 2, -3, WINDOW_SIZE, 6);
    ctx.strokeRect(-WINDOW_SIZE / 2, -3, WINDOW_SIZE, 6);

    // Window divider
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(0, 3);
    ctx.stroke();

    // Selection circle
    if (isSelected) {
        ctx.fillStyle = COLORS.selected;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

/**
 * Draws a camera element
 */
export function drawCamera(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    panOffset: Point,
    isSelected: boolean
): void {
    ctx.save();
    ctx.translate(camera.x + panOffset.x, camera.y + panOffset.y);
    ctx.rotate((camera.rotation * Math.PI) / 180);

    // Camera view cone
    ctx.fillStyle = isSelected ? 'rgba(96, 165, 250, 0.15)' : 'rgba(34, 197, 94, 0.1)';
    ctx.strokeStyle = isSelected ? 'rgba(96, 165, 250, 0.4)' : 'rgba(34, 197, 94, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(60, -40);
    ctx.lineTo(60, 40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Camera body
    ctx.fillStyle = isSelected ? COLORS.selected : COLORS.camera;
    ctx.beginPath();
    ctx.arc(0, 0, CAMERA_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();

    // Camera lens
    ctx.fillStyle = COLORS.background;
    ctx.beginPath();
    ctx.arc(0, 0, CAMERA_SIZE / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/**
 * Draws a wall element
 */
export function drawWall(
    ctx: CanvasRenderingContext2D,
    wall: Wall,
    panOffset: Point,
    isSelected: boolean
): void {
    ctx.strokeStyle = isSelected ? COLORS.selected : COLORS.wall;
    ctx.lineWidth = wall.thickness;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(wall.x1 + panOffset.x, wall.y1 + panOffset.y);
    ctx.lineTo(wall.x2 + panOffset.x, wall.y2 + panOffset.y);
    ctx.stroke();

    // Draw endpoints for selected wall
    if (isSelected) {
        ctx.fillStyle = COLORS.selected;
        ctx.beginPath();
        ctx.arc(wall.x1 + panOffset.x, wall.y1 + panOffset.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(wall.x2 + panOffset.x, wall.y2 + panOffset.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Draws a pencil path element
 */
export function drawPencilPath(
    ctx: CanvasRenderingContext2D,
    path: PencilPath,
    panOffset: Point,
    isSelected: boolean
): void {
    if (path.points.length < 2) return;

    ctx.strokeStyle = isSelected ? COLORS.selected : path.color;
    ctx.lineWidth = isSelected ? path.lineWidth + 1 : path.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Add glow effect for selected paths
    if (isSelected) {
        ctx.shadowColor = COLORS.selected;
        ctx.shadowBlur = 8;
    }

    ctx.beginPath();
    ctx.moveTo(path.points[0].x + panOffset.x, path.points[0].y + panOffset.y);

    for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x + panOffset.x, path.points[i].y + panOffset.y);
    }

    ctx.stroke();

    // Reset shadow
    if (isSelected) {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }
}
