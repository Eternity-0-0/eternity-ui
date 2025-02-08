import type { Selection } from 'd3'
import { FILTER_CONFIG } from '@/constants/graph'

type D3Selection = Selection<any, any, any, any>

/**
 * Sets up the blur filter used for neon effects
 */
export function setupBlurFilter(defs: D3Selection) {
    const overlayFilter = defs.append('filter')
        .attr('id', 'overlay-blur')
        .attr('width', FILTER_CONFIG.BLUR.DIMENSIONS.width)
        .attr('height', FILTER_CONFIG.BLUR.DIMENSIONS.height)
        .attr('x', FILTER_CONFIG.BLUR.DIMENSIONS.x)
        .attr('y', FILTER_CONFIG.BLUR.DIMENSIONS.y)

    overlayFilter.append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('stdDeviation', FILTER_CONFIG.BLUR.STD_DEVIATION)

    return overlayFilter
}

/**
 * Sets up all SVG definitions (filters, etc.)
 */
export function setupSvgDefs(svg: D3Selection) {
    const defs = svg.append('defs')
    setupBlurFilter(defs)
    return defs
} 