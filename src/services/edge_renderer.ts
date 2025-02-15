import type { Selection } from 'd3'
import * as d3 from 'd3'
import type { Edge, Node, NodeShape, Position } from '@/models/GraphData'
import { computeArrowPoints } from '@/services/arrowHelper'
import { MARKER_CONFIG, EDGE_CONFIG } from '@/constants/graph'

type D3Selection = Selection<any, any, any, any>

interface MarkerConfig {
    id: string
    refX: number
}

const markerConfigs: Record<NodeShape | 'cofactor', MarkerConfig> = {
    'ellipse': { id: 'arrow-entity', refX: MARKER_CONFIG.REF_X },
    'rectangle': { id: 'arrow-process', refX: MARKER_CONFIG.REF_X },
    'octagon': { id: 'arrow-effect', refX: MARKER_CONFIG.REF_X },
    'point': { id: 'arrow-process', refX: MARKER_CONFIG.REF_X },
    'no': { id: 'arrow-cofactor', refX: MARKER_CONFIG.REF_X },
    'cofactor': { id: 'arrow-cofactor', refX: MARKER_CONFIG.REF_X }
}

/**
 * Returns the angle of the node border at the intersection point
 * For rectangles: returns 0° for vertical borders, 90° for horizontal borders
 * For ellipses: returns the angle of the tangent line at intersection point
 */
function getBorderAngleAtIntersection(targetNode: Node, intersectionPoint: Position): number {
    if (!targetNode.center) return 0;
    
    const dx = intersectionPoint.x - targetNode.center.x;
    const dy = intersectionPoint.y - targetNode.center.y;
    
    if (targetNode.shape === 'rectangle') {
        const halfWidth = targetNode.width / 2;
        const halfHeight = targetNode.height / 2;
        const tolerance = 0.1;
        
        // Vertical edges (left or right sides)
        if (Math.abs(Math.abs(dx) - halfWidth) < tolerance) {
            return 0;  // Vertical border
        }
        // Horizontal edges (top or bottom)
        else if (Math.abs(Math.abs(dy) - halfHeight) < tolerance) {
            return 90;  // Horizontal border
        }
        
        return 0; // Fallback
    }
    else if (targetNode.shape === 'ellipse') {
        const a = targetNode.width / 2;
        const b = targetNode.height / 2;
        
        // For ellipse (x²/a² + y²/b² = 1), the tangent angle at point (x,y) is:
        // tan(θ) = -(b²x)/(a²y)
        // In SVG coordinates, y increases downward, so we need to:
        // 1. Negate dy to convert to mathematical coordinates
        // 2. Calculate the angle in mathematical coordinates
        // 3. Convert back to SVG angle system
        let tangentAngle = 90;
        if (dx !== 0) {
            tangentAngle = (Math.atan(-b * b * dx / (a * a * dy)) * 180 / Math.PI + 360) % 360;
        }


        // Draw a tangential line for debugging
        const tangentLineLength = 40; // Length of the tangential line
        const tangentRad = tangentAngle * Math.PI / 180;
        
        // Calculate start and end points of the tangent line
        const startPoint = {
            x: intersectionPoint.x - Math.cos(tangentRad) * tangentLineLength / 2,
            y: intersectionPoint.y - Math.sin(tangentRad) * tangentLineLength / 2
        };
        const endPoint = {
            x: intersectionPoint.x + Math.cos(tangentRad) * tangentLineLength / 2,
            y: intersectionPoint.y + Math.sin(tangentRad) * tangentLineLength / 2
        };

        // Get the SVG element and create/update the debug line
        const svg = d3.select('svg');
        const debugLineId = `tangent-${targetNode.id}`;
        let debugLine = svg.select<SVGLineElement>(`#${debugLineId}`);
        
        if (debugLine.empty()) {
            debugLine = svg.append<SVGLineElement>('line')
                .attr('id', debugLineId)
                .attr('class', 'debug-tangent')
                .style('stroke', 'red')
                .style('stroke-width', 2)
                .style('stroke-dasharray', '4,4');
        }
        
        debugLine
            .attr('x1', startPoint.x)
            .attr('y1', startPoint.y)
            .attr('x2', endPoint.x)
            .attr('y2', endPoint.y);
        
        return - tangentAngle;
    }
    
    return 0; // Default return for other shapes
}

/**
 * Adjusts the end point of the edge to account for the marker size
 */
function adjustEndPoint(start: Position, end: Position, markerSize: number): Position {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return end;
    
    // Move the end point back by the marker size
    return {
        x: end.x - (dx / length) * markerSize,
        y: end.y - (dy / length) * markerSize
    };
}

/**
 * Sets up arrow markers in the SVG defs
 */
export function setupArrowMarkers(defs: D3Selection) {
    // Regular arrow marker
    Object.entries(markerConfigs).forEach(([_, config]) => {
        defs.append('marker')
            .attr('id', config.id)
            .attr('viewBox', MARKER_CONFIG.VIEW_BOX)
            .attr('refX', config.refX)
            .attr('refY', 0)
            .attr('markerWidth', MARKER_CONFIG.SIZE)
            .attr('markerHeight', MARKER_CONFIG.SIZE)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', MARKER_CONFIG.PATH)
            .attr('fill', 'var(--edge-color-dark)')
    })
}

/**
 * Creates or updates a T-arrow marker with a specific rotation
 */
function getOrCreateTMarker(defs: D3Selection, baseId: string, edgeId: string, rotation: number): string {
    const markerId = `${baseId}-t-${edgeId}`
    
    // Check if marker already exists
    let marker = defs.select<SVGMarkerElement>(`#${markerId}`)
    
    marker.attr('orient', rotation)
    if (marker.empty()) {
        // Create new marker if it doesn't exist
        marker = defs.append<SVGMarkerElement>('marker')
            .attr('id', markerId)
            .attr('viewBox', '-10 -7 20 14')  // Increased height of viewBox
            .attr('refX', 0)
            .attr('refY', 0)
            .attr('markerWidth', MARKER_CONFIG.SIZE)
            .attr('markerHeight', MARKER_CONFIG.SIZE)
            .attr('orient', rotation)
        console.log(rotation)
        
        marker.append('path')
            .attr('d', 'M 0,-12 L 0,12')  // Increased length from 8 to 12
            .attr('stroke', 'var(--edge-color-dark)')
            .attr('fill', 'none')
            .attr('stroke-width', '4')
    } else {
        // Update existing marker's rotation
        marker.attr('orient', rotation)
    }
    
    return markerId
}

/**
 * Renders edges between nodes
 */
export function renderEdges(selection: D3Selection, edges: Edge[], nodes: Node[]) {
    // Get the SVG's defs element, creating it if it doesn't exist
    const svg = selection.node()?.ownerSVGElement
    let defs = d3.select(svg).select<SVGDefsElement>('defs')
    if (defs.empty()) {
        defs = d3.select(svg).append<SVGDefsElement>('defs')
    }
    
    return selection.selectAll('path')
        .data(edges)
        .enter()
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', 'var(--edge-color-dark)')
        .attr('stroke-width', EDGE_CONFIG.STROKE_WIDTH)
        .attr('d', edge => {
            const sourceNode = nodes.find(n => n.id === edge.source)
            const targetNode = nodes.find(n => n.id === edge.target)
            if (!sourceNode?.center || !targetNode?.center) return ''

            try {
                const points = computeArrowPoints(sourceNode, targetNode)
                if (edge.marker === 't-arrow') {
                    const adjustedEnd = adjustEndPoint(points.start, points.end, 10)
                    return `M ${points.start.x},${points.start.y} L ${adjustedEnd.x},${adjustedEnd.y}`
                }
                // Regular arrows should end slightly before the endpoint
                const adjustedEnd = adjustEndPoint(points.start, points.end, 3)
                return `M ${points.start.x},${points.start.y} L ${adjustedEnd.x},${adjustedEnd.y}`
            } catch (e: any) {
                return `M ${sourceNode.center.x},${sourceNode.center.y} L ${targetNode.center.x},${targetNode.center.y}`
            }
        })
        .attr('marker-end', edge => {
            const targetNode = nodes.find(n => n.id === edge.target)
            if (!targetNode) return 'url(#arrow-entity)'
            
            try {
                const points = computeArrowPoints(nodes.find(n => n.id === edge.source)!, targetNode)
                const borderAngle = getBorderAngleAtIntersection(targetNode, points.end)
                
                // Calculate edge angle
                const dx = points.end.x - points.start.x;
                const dy = points.end.y - points.start.y;
                const edgeAngle = Math.atan2(dy, dx) * 180 / Math.PI;
                
                // Calculate rotation needed to make edge perpendicular to border
                const rotationAngle = 90 - borderAngle;
                
                console.log(
                    `Edge intersection:
  From: ${edge.source}
  To: ${targetNode.id} (${targetNode.shape})
  Border angle: ${borderAngle.toFixed(2)}°
  Edge angle: ${edgeAngle.toFixed(2)}°
  Marker rotation: ${rotationAngle}°
  Marker: ${edge.marker}
  Intersection point: (${points.end.x.toFixed(1)}, ${points.end.y.toFixed(1)})
  Target node center: (${targetNode.center?.x.toFixed(1)}, ${targetNode.center?.y.toFixed(1)})`
                )

                if (edge.marker === 't-arrow') {
                    const baseId = targetNode.entity_subtype === 'cofactor' ? 
                        markerConfigs.cofactor.id : 
                        markerConfigs[targetNode.shape].id
                    
                    // Create or update unique marker for this edge
                    const markerId = getOrCreateTMarker(defs, baseId, `${edge.source}-${edge.target}`, rotationAngle)
                    return `url(#${markerId})`
                } else {
                    return `url(#${markerConfigs[targetNode.shape].id})`
                }
            } catch (e) {
                console.error('Failed to calculate intersection angle:', e)
                return 'url(#arrow-entity)'
            }
        })
} 