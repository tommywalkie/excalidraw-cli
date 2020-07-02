import { getCentroid, rotate } from './shapeUtils'

const getDiamondPoints = element => {
    const topX = Math.floor(element.width / 2) + 1
    const topY = 0
    const rightX = element.width
    const rightY = Math.floor(element.height / 2) + 1
    const bottomX = topX
    const bottomY = element.height
    const leftX = topY
    const leftY = rightY
    return [topX, topY, rightX, rightY, bottomX, bottomY, leftX, leftY]
}

export const renderDiamond = (element, rc, negativeWidth, negativeHeight) => {
    element.fill = element.backgroundColor
    element.stroke = element.strokeColor
    const [
        topX,
        topY,
        rightX,
        rightY,
        bottomX,
        bottomY,
        leftX,
        leftY,
    ] = getDiamondPoints(element)
    if (element.angle && element.angle != 0) {
        const [cx, cy] = getCentroid([
            [element.x + topX + negativeWidth, element.y + negativeHeight + topY],
            [element.x + rightX + negativeWidth, element.y + negativeHeight + rightY],
            [element.x + bottomX + negativeWidth, element.y + negativeHeight + bottomY],
            [element.x + leftX + negativeWidth, element.y + negativeHeight + leftY],
        ])
        const [topXr, topYr] = rotate(cx, cy, element.x + topX + negativeWidth, element.y + topY + negativeHeight, element.angle)
        const [rightXr, rightYr] = rotate(cx, cy, element.x + rightX + negativeWidth, element.y + rightY + negativeHeight, element.angle)
        const [bottomXr, bottomYr] = rotate(cx, cy, element.x + bottomX + negativeWidth, element.y + bottomY + negativeHeight, element.angle)
        const [leftXr, leftYr] = rotate(cx, cy, element.x + leftX + negativeWidth, element.y + leftY + negativeHeight, element.angle)
        rc.polygon([
            [topXr, topYr],
            [rightXr, rightYr],
            [bottomXr, bottomYr],
            [leftXr, leftYr],
        ], element)
    } else {
        rc.polygon([
            [element.x + topX + negativeWidth, element.y + negativeHeight + topY],
            [element.x + rightX + negativeWidth, element.y + negativeHeight + rightY],
            [element.x + bottomX + negativeWidth, element.y + negativeHeight + bottomY],
            [element.x + leftX + negativeWidth, element.y + negativeHeight + leftY],
        ], element)
    }
}