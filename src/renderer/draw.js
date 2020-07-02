import { getCentroidFromRegularShape, rotate } from './shapeUtils'

export const renderDraw = (element, rc, ctx, negativeWidth, negativeHeight) => {
    const firstPoint = element.points[0]
    const lastPoint = element.points[element.points.length - 1]
    ctx.fillStyle = element.strokeColor
    element.fill = 'transparent'
    if (firstPoint[0] == lastPoint[0] && firstPoint[1] == lastPoint[1])
        element.fill = element.backgroundColor
    if (element.angle && element.angle != 0) {
        const [cx, cy] = getCentroidFromRegularShape(element, negativeHeight, negativeWidth)
        element.points = element.points.map(pt => rotate(
            cx,
            cy,
            element.x + pt[0] + negativeWidth,
            element.y + pt[1] + negativeHeight, element.angle
        ))
        rc.curve(element.points.map(pt => [pt[0], pt[1]]), element)
    } else {
        rc.curve(element.points.map(pt => [
            element.x + pt[0] + negativeWidth,
            element.y + pt[1] + negativeHeight
        ]),
        element
    )}
}