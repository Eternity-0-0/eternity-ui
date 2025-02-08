import type { Selection } from 'd3'
import type { Edge, Node, NodeShape } from '@/models/GraphData'
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
 * Sets up arrow markers in the SVG defs
 */
export function setupArrowMarkers(defs: D3Selection) {
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
 * Renders edges between nodes
 */
export function renderEdges(selection: D3Selection, edges: Edge[], nodes: Node[]) {
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
                return `M ${points.start.x},${points.start.y} L ${points.end.x},${points.end.y}`
            } catch (e: any) {
                return `M ${sourceNode.center.x},${sourceNode.center.y} L ${targetNode.center.x},${targetNode.center.y}`
            }
        })
        .attr('marker-end', edge => {
            const targetNode = nodes.find(n => n.id === edge.target)
            if (!targetNode) return 'url(#arrow-entity)'
            
            if (targetNode.entity_subtype === 'cofactor') {
                return `url(#${markerConfigs.cofactor.id})`
            }
            
            return `url(#${markerConfigs[targetNode.shape].id})`
        })
} 