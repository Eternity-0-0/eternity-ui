import { GraphData, Node, NodeShape } from '@/models/GraphData'

const COFACTOR_PADDING = 10  // Padding around text for cofactor nodes

/**
 * Maps backend node shape to frontend shape
 * For cofactors, always returns 'rectangle' for computation
 * For other nodes, uses the shape from backend or defaults based on type
 */
function mapNodeShape(node: Node): NodeShape {
    if (node.entity_subtype === 'cofactor') {
        return 'rectangle'  // Always use rectangle for cofactors
    }
    
    // For non-cofactors, use the node's shape (which includes default based on type)
    return node.shape
}

/**
 * Calculates text width using a temporary SVG element
 */
function calculateTextWidth(text: string, fontSize: number): number {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    textElement.setAttribute('font-size', `${fontSize}px`)
    textElement.textContent = text
    svg.appendChild(textElement)
    document.body.appendChild(svg)
    const width = textElement.getComputedTextLength()
    document.body.removeChild(svg)
    return width
}

/**
 * Resolves shapes and sizes for all nodes in the graph
 * Main entity nodes use config values, cofactor nodes get minimal rectangle size
 */
export function resolveGraphShapes(graph: GraphData): GraphData {
    // Process each node
    graph.nodes.forEach(node => {
        // Map the shape using our mapping function
        node.shape = mapNodeShape(node)

        if (node.shape === 'point') {
            // Points should be 5x5
            node.width = 5
            node.height = 5
        } else if (node.entity_subtype === 'cofactor') {
            // For cofactors, calculate minimal size based on text
            const textWidth = calculateTextWidth(node.nice_name, 14)  // 14px font size for cofactors
            node.width = textWidth + 2 * COFACTOR_PADDING
            node.height = 20  // Fixed height for single line of text
        } else {
            // For main nodes, use config values
            if (!node.width) {
                node.width = graph.size_config?.nodeWidth || 140
            }
            if (!node.height) {
                node.height = graph.size_config?.nodeHeight || 60
            }
        }
    })

    return graph
}

function getDefaultShape(type: string): Node['shape'] {
    switch (type) {
        case 'process':
            return 'rectangle'
        case 'effect':
            return 'octagon'
        case 'entity':
        default:
            return 'ellipse'
    }
}
