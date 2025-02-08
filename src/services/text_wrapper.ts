import type { Selection } from 'd3'

type D3Selection = Selection<any, any, any, any>

interface TextConfig {
    fontSize: number
    minFontSize: number
    maxWidth: number
    maxHeight: number
    lineHeight: number
}

interface TextMetrics {
    width: number
    height: number
}

/**
 * Wraps and sizes text to fit within given constraints
 * Handles multi-line text with proper spacing and font size adjustments
 */
export function wrapAndSizeText(
    textElement: D3Selection,
    text: string,
    config: TextConfig
) {
    // Initial font size
    let fontSize = config.fontSize
    textElement.attr('font-size', fontSize + 'px')

    // Measure and wrap text, adjusting font size if needed
    let metrics = wrapAndMeasure(textElement, text, config)
    
    // Adjust font size if text is too tall or any line is too wide
    while ((metrics.height > config.maxHeight || metrics.width > config.maxWidth) && fontSize > config.minFontSize) {
        fontSize--
        textElement.attr('font-size', fontSize + 'px')
        metrics = wrapAndMeasure(textElement, text, config)
    }

    // Final positioning of lines
    const totalLines = textElement.selectAll('tspan').size()
    const totalHeight = totalLines * config.lineHeight
    const startY = -(totalHeight / 2) + (config.lineHeight / 2)

    // Adjust vertical positions of all tspans
    textElement.selectAll('tspan')
        .attr('dy', (_, i) => {
            if (i === 0) return startY + 0.3 + 'em'
            return config.lineHeight + 'em'
        })
}

/**
 * Internal function to wrap text and measure its dimensions
 */
function wrapAndMeasure(
    textElement: D3Selection,
    text: string,
    config: TextConfig
): TextMetrics {
    // Clear existing content
    textElement.text(null)

    // Split by spaces but preserve them
    const words = text.match(/\S+|\s+/g) || []
    let line: string[] = []
    let lineCount = 0
    let tspan = textElement.append('tspan').attr('x', 0)

    for (let word of words) {
        line.push(word)
        tspan.text(line.join(''))  // Join without extra space since spaces are preserved in words
        if (tspan.node()!.getComputedTextLength() > config.maxWidth) {
            line.pop()
            if (line.length) {
                tspan.text(line.join(''))
                line = [word]
                tspan = textElement.append('tspan')
                    .attr('x', 0)
                    .attr('dy', config.lineHeight + 'em')
                    .text(word)
                lineCount++
            }
        }
    }

    // Handle the last line if it's not empty
    if (line.length > 0 && tspan.text() !== line.join('')) {
        tspan.text(line.join(''))
    }

    return {
        width: Math.max(
            ...Array.from(textElement.selectAll('tspan').nodes())
                .map(node => (node as SVGTextElement).getComputedTextLength())
        ),
        height: (lineCount + 1) * config.lineHeight * parseFloat(textElement.attr('font-size'))
    }
} 