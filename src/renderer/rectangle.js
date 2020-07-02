import { getCentroidFromRegularShape, rotate } from './shapeUtils'

export const renderRectangle = (element, rc, ctx, negativeWidth, negativeHeight) => {
    if (element.angle && element.angle != 0) {
        const [cx, cy] = getCentroidFromRegularShape(element, negativeHeight, negativeWidth)
        const [topXr, topYr] = rotate(cx, cy, element.x + negativeWidth, element.y + negativeHeight, element.angle)
        const [rightXr, rightYr] = rotate(cx, cy, element.x + element.width + negativeWidth, element.y + negativeHeight, element.angle)
        const [bottomXr, bottomYr] = rotate(cx, cy, element.x + element.width + negativeWidth, element.y + element.height + negativeHeight, element.angle)
        const [leftXr, leftYr] = rotate(cx, cy, element.x + negativeWidth, element.y + element.height + negativeHeight, element.angle)
        rc.polygon([
            [topXr, topYr],
            [rightXr, rightYr],
            [bottomXr, bottomYr],
            [leftXr, leftYr],
        ], element)
    } else {
        let initialStroke = element.stroke
        ctx.setLineDash([])
        element.stroke = 'transparent'
        rc.rectangle(
            element.x + negativeWidth,
            element.y + negativeHeight,
            element.width,
            element.height,
            element
        )
        element.stroke = initialStroke
        element.fill = 'transparent'
        if (element.strokeStyle == 'dashed')
            ctx.setLineDash([12, 8])
        if (element.strokeStyle == 'dotted')
            ctx.setLineDash([3, 6])
        rc.rectangle(
            element.x + negativeWidth,
            element.y + negativeHeight,
            element.width,
            element.height,
            element
        )
    }
}