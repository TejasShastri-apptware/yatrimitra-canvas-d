/**
 * Selection utility functions for detecting element clicks
 */

import { FloorPlanElement, Point } from '../types/floorplan';
import { isPointInRect, isPointNearLine, isPointNearPath } from './geometry';

/**
 * Finds the element at a given point, considering pan offset
 */
export function findElementAtPoint(
    point: Point,
    elements: FloorPlanElement[],
    panOffset: Point
): FloorPlanElement | null {
    return elements.find((el) => isElementAtPoint(el, point, panOffset)) || null;
}

/**
 * Checks if a specific element is at the given point
 */
export function isElementAtPoint(
    element: FloorPlanElement,
    point: Point,
    panOffset: Point
): boolean {
    if (element.type === 'room') {
        return isPointInRect(point, {
            x: element.x + panOffset.x,
            y: element.y + panOffset.y,
            width: element.width,
            height: element.height,
        });
    } else if (element.type === 'wall') {
        const x1 = element.x1 + panOffset.x;
        const y1 = element.y1 + panOffset.y;
        const x2 = element.x2 + panOffset.x;
        const y2 = element.y2 + panOffset.y;

        return isPointNearLine(
            point,
            { x: x1, y: y1 },
            { x: x2, y: y2 },
            element.thickness / 2 + 5
        );
    } else if (element.type === 'pencil') {
        const offsetPoints = element.points.map((p) => ({
            x: p.x + panOffset.x,
            y: p.y + panOffset.y,
        }));

        return isPointNearPath(point, offsetPoints, element.lineWidth + 5);
    } else {
        // Door, Window, Camera - point-based elements
        const dx = point.x - (element.x + panOffset.x);
        const dy = point.y - (element.y + panOffset.y);
        return Math.sqrt(dx * dx + dy * dy) < 20;
    }
}
