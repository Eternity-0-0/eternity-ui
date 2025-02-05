import { Node, Position } from '@/models/GraphData'

/**
 * Computes the intersection point of a line with an ellipse
 * @param source Source node of the edge
 * @param target Target node of the edge (must be an ellipse)
 * @returns The point where the arrow should be drawn
 */
export function computeArrowPoint(source: Node, target: Node): Position {
    if (!source.center || !target.center) {
        throw new Error('Both nodes must have center positions')
    }

    // If target is not an ellipse, throw error for now
    if (target.shape !== 'ellipse') {
        throw new Error('Target node must be an ellipse')
    }

    const { x: x1, y: y1 } = source.center
    const { x: x2, y: y2 } = target.center

    // Translate to origin for easier calculation
    const dx = x2 - x1
    const dy = y2 - y1

    // Get the angle of the line
    const angle = Math.atan2(dy, dx)

    // Ellipse parameters (a is half width, b is half height)
    const a = target.width / 2
    const b = target.height / 2

    // Calculate the intersection point
    // For parametric equation of ellipse: x = h + a*cos(t), y = k + b*sin(t)
    // where (h,k) is the center of ellipse
    // We need to move in the direction opposite to the line from source to target
    const t = Math.atan2(dy * a, dx * b)  // Angle adjusted for ellipse aspect ratio
    const intersectionX = x2 - a * Math.cos(t)
    const intersectionY = y2 - b * Math.sin(t)

    // Calculate vectors
    const originalVector = { x: dx, y: dy }
    const intersectionVector = { 
        x: intersectionX - x1, 
        y: intersectionY - y1 
    }

    // Normalize vectors
    const originalLength = Math.sqrt(originalVector.x * originalVector.x + originalVector.y * originalVector.y)
    const intersectionLength = Math.sqrt(intersectionVector.x * intersectionVector.x + intersectionVector.y * intersectionVector.y)

    const normalizedOriginal = {
        x: originalVector.x / originalLength,
        y: originalVector.y / originalLength
    }
    const normalizedIntersection = {
        x: intersectionVector.x / intersectionLength,
        y: intersectionVector.y / intersectionLength
    }

    // Calculate dot product of normalized vectors
    const dotProduct = normalizedOriginal.x * normalizedIntersection.x + normalizedOriginal.y * normalizedIntersection.y
    const isOnLine = Math.abs(dotProduct - 1) < 0.0001

    console.log('Arrow point check:', {
        originalVector,
        intersectionVector,
        normalizedOriginal,
        normalizedIntersection,
        dotProduct,
        isOnLine,
        source: { x: x1, y: y1 },
        target: { x: x2, y: y2 },
        intersection: { x: intersectionX, y: intersectionY }
    })

    if (!isOnLine) {
        console.warn('Intersection point is not on the line between centers!')
    }

    return {
        x: intersectionX,
        y: intersectionY
    }
}

/**
 * Helper function to get the distance between two points
 */
function distance(p1: Position, p2: Position): number {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return Math.sqrt(dx * dx + dy * dy)
} 