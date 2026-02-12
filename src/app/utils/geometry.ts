/**
 * Geometry utility functions for the Floor Plan Designer
 */

import { Point } from '../types/floorplan';
import { GRID_SIZE } from './constants';

/**
 * Snaps a point to the nearest grid intersection
 */
export function snapToGrid(point: Point): Point {
    return {
        x: Math.round(point.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(point.y / GRID_SIZE) * GRID_SIZE,
    };
}

/**
 * Calculates the distance from a point to a line segment
 */
export function pointToLineDistance(
    point: Point,
    lineStart: Point,
    lineEnd: Point
): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq !== 0 ? dot / lenSq : -1;

    let xx, yy;

    if (param < 0) {
        xx = lineStart.x;
        yy = lineStart.y;
    } else if (param > 1) {
        xx = lineEnd.x;
        yy = lineEnd.y;
    } else {
        xx = lineStart.x + param * C;
        yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;

    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Checks if a point is inside a rectangle
 */
export function isPointInRect(
    point: Point,
    rect: { x: number; y: number; width: number; height: number }
): boolean {
    return (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
    );
}

/**
 * Checks if a point is near a line segment within a threshold
 */
export function isPointNearLine(
    point: Point,
    lineStart: Point,
    lineEnd: Point,
    threshold: number
): boolean {
    return pointToLineDistance(point, lineStart, lineEnd) < threshold;
}

/**
 * Checks if a point is near any segment of a path
 */
export function isPointNearPath(
    point: Point,
    path: Point[],
    threshold: number
): boolean {
    for (let i = 0; i < path.length - 1; i++) {
        if (isPointNearLine(point, path[i], path[i + 1], threshold)) {
            return true;
        }
    }
    return false;
}

/**
 * Calculates the distance between two points
 */
export function distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}
