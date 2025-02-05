import { GraphData, Node } from '@/models/GraphData'

const COFACTOR_PADDING = 10  // Padding around text for cofactor nodes

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
        if (node.entity_subtype === 'cofactor') {
            // For cofactors, calculate minimal size based on text
            const textWidth = calculateTextWidth(node.nice_name, 14)  // 14px font size for cofactors
            node.width = textWidth + 2 * COFACTOR_PADDING
            node.height = 20  // Fixed height for single line of text
            node.shape = 'rectangle'  // Always use rectangle for computation
        } else {
            // For main nodes, use config values
            if (!node.width) {
                node.width = graph.size_config?.nodeWidth || 140
            }
            if (!node.height) {
                node.height = graph.size_config?.nodeHeight || 60
            }
            // Set shape based on type if not already set
            if (!node.shape) {
                node.shape = getDefaultShape(node.type)
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
