import type { Selection } from 'd3'
import { LAYOUT_CONFIG } from '@/constants/graph'

type D3Selection = Selection<any, any, any, any>

interface Bounds {
    x: number
    y: number
    width: number
    height: number
}

interface ViewportDimensions {
    width: number
    height: number
}

/**
 * Calculates the transform parameters to center and scale the graph within the viewport
 */
export function calculateGraphTransform(bounds: Bounds, viewport: ViewportDimensions) {
    const scale = Math.min(
        viewport.width / bounds.width,
        viewport.height / bounds.height
    ) * LAYOUT_CONFIG.SCALE_PADDING

    const tx = (viewport.width - bounds.width * scale) / 2 - bounds.x * scale
    const ty = (viewport.height - bounds.height * scale) / 2 - bounds.y * scale

    return { scale, tx, ty }
}

/**
 * Centers and scales the graph to fit within the viewport
 */
export function centerAndScaleGraph(g: D3Selection, viewport: ViewportDimensions) {
    const bounds = g.node()?.getBBox()
    if (!bounds) return { scale: 1, tx: 0, ty: 0 }  // Return default values if no bounds

    const { scale, tx, ty } = calculateGraphTransform(bounds, viewport)
    g.attr('transform', `translate(${tx}, ${ty}) scale(${scale})`)

    return { scale, tx, ty }  // Return the calculated transform values
} 