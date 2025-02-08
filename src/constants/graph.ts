/**
 * Node size configurations
 */
export const NODE_SIZES = {
    POINT: {
        width: 5,
        height: 5
    },
    STANDARD: {
        width: 140,
        height: 60
    },
    COFACTOR: {
        height: 20,  // Fixed height for single line
        textPadding: 10  // Padding around text
    }
} as const

/**
 * Text rendering configurations
 */
export const TEXT_CONFIG = {
    FONT_SIZES: {
        COFACTOR: 14,
        STANDARD: 16,
        MIN: 5
    },
    DIMENSIONS: {
        MAX_WIDTH: 120,
        MAX_HEIGHT: 50,
        LINE_HEIGHT: 1.2
    },
    VERTICAL_OFFSET: 0.3  // em units for dy attribute
} as const

/**
 * SVG marker configurations
 */
export const MARKER_CONFIG = {
    REF_X: 8,
    VIEW_BOX: '0 -5 10 10',
    SIZE: 6,
    PATH: 'M0,-5L10,0L0,5'
} as const

/**
 * Edge rendering configurations
 */
export const EDGE_CONFIG = {
    STROKE_WIDTH: 1.5
} as const

/**
 * Filter configurations
 */
export const FILTER_CONFIG = {
    BLUR: {
        STD_DEVIATION: 2,
        DIMENSIONS: {
            width: '200%',
            height: '200%',
            x: '-50%',
            y: '-50%'
        }
    }
} as const

/**
 * Layout configurations
 */
export const LAYOUT_CONFIG = {
    SCALE_PADDING: 0.95,  // 5% padding around the graph
    RECTANGLE_CORNER_RADIUS: 5,
    OCTAGON_FACTOR: 0.3  // Factor for octagon corner calculation
} as const 