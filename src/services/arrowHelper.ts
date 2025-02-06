import { Node, Position } from '@/models/GraphData'

interface ArrowPoints {
    start: Position;
    end: Position;
}

/**
 * Computes the intersection points for both ends of an arrow between two nodes
 */
export function computeArrowPoints(source: Node, target: Node): ArrowPoints {
    if (!source.center || !target.center) {
        throw new Error('Both nodes must have center positions')
    }

    const { x: x1, y: y1 } = source.center
    const { x: x2, y: y2 } = target.center

    // Get end points based on node shapes
    const start = computeIntersection(x2, y2, x1, y1, source)  // From target to source for start point
    const end = computeIntersection(x1, y1, x2, y2, target)    // From source to target for end point

    return { start, end }
}

/**
 * Computes intersection with a node of any shape
 */
function computeIntersection(x1: number, y1: number, x2: number, y2: number, node: Node): Position {
    switch (node.shape) {
        case 'ellipse':
            return computeEllipseIntersection(x1, y1, x2, y2, node.width / 2, node.height / 2)
        case 'rectangle':
            return computeRectangleIntersection(x1, y1, x2, y2, node.width, node.height)
        default:
            // For now, treat octagon as rectangle
            return computeRectangleIntersection(x1, y1, x2, y2, node.width, node.height)
    }
}

/**
 * Computes the intersection point of a line with a node shape
 */
export function computeArrowPoint(source: Node, target: Node): Position {
    if (!source.center || !target.center) {
        throw new Error('Both nodes must have center positions')
    }

    const { x: x1, y: y1 } = source.center
    const { x: x2, y: y2 } = target.center

    // Translate to origin for easier calculation
    const dx = x2 - x1
    const dy = y2 - y1

    // Get the angle of the line
    const angle = Math.atan2(dy, dx)

    switch (target.shape) {
        case 'ellipse':
            return computeEllipseIntersection(x1, y1, x2, y2, target.width / 2, target.height / 2)
        case 'rectangle':
            return computeRectangleIntersection(x1, y1, x2, y2, target.width, target.height)
        default:
            // For now, treat octagon as rectangle
            return computeRectangleIntersection(x1, y1, x2, y2, target.width, target.height)
    }
}

/**
 * Computes intersection with an ellipse
 */
function computeEllipseIntersection(x1: number, y1: number, x2: number, y2: number, a: number, b: number): Position {
    const dx = x2 - x1
    const dy = y2 - y1

    // Get the angle adjusted for ellipse aspect ratio
    const t = Math.atan2(dy * a, dx * b)
    
    return {
        x: x2 - a * Math.cos(t),
        y: y2 - b * Math.sin(t)
    }
}

/**
 * Computes intersection with a rectangle
 */
function computeRectangleIntersection(x1: number, y1: number, x2: number, y2: number, width: number, height: number): Position {
    const halfWidth = width / 2
    const halfHeight = height / 2
    
    // Vector from source to target center
    const dx = x2 - x1
    const dy = y2 - y1
    
    // Normalize the vector
    const length = Math.sqrt(dx * dx + dy * dy)
    const nx = dx / length
    const ny = dy / length
    
    // Find intersection with rectangle edges
    // We'll find all possible intersections and choose the closest one to the source
    const intersections: Position[] = []
    
    // Check vertical edges
    const tx1 = (x2 - halfWidth - x1) / nx  // Left edge
    const tx2 = (x2 + halfWidth - x1) / nx  // Right edge
    
    if (tx1 >= 0) {
        const y = y1 + ny * tx1
        if (Math.abs(y - y2) <= halfHeight) {
            intersections.push({ x: x2 - halfWidth, y })
        }
    }
    if (tx2 >= 0) {
        const y = y1 + ny * tx2
        if (Math.abs(y - y2) <= halfHeight) {
            intersections.push({ x: x2 + halfWidth, y })
        }
    }
    
    // Check horizontal edges
    const ty1 = (y2 - halfHeight - y1) / ny  // Top edge
    const ty2 = (y2 + halfHeight - y1) / ny  // Bottom edge
    
    if (ty1 >= 0) {
        const x = x1 + nx * ty1
        if (Math.abs(x - x2) <= halfWidth) {
            intersections.push({ x, y: y2 - halfHeight })
        }
    }
    if (ty2 >= 0) {
        const x = x1 + nx * ty2
        if (Math.abs(x - x2) <= halfWidth) {
            intersections.push({ x, y: y2 + halfHeight })
        }
    }
    
    // Find the closest intersection to the source point
    let closestDist = Infinity
    let closestPoint = { x: x2, y: y2 }  // Default to center if no intersection found
    
    intersections.forEach(point => {
        const dist = (point.x - x1) * (point.x - x1) + (point.y - y1) * (point.y - y1)
        if (dist < closestDist) {
            closestDist = dist
            closestPoint = point
        }
    })
    
    return closestPoint
}

/**
 * Helper function to get the distance between two points
 */
function distance(p1: Position, p2: Position): number {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return Math.sqrt(dx * dx + dy * dy)
} 