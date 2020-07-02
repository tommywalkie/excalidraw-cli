import { getArrowPoints } from './arrow'

export const renderLine = (element, rc, negativeWidth, negativeHeight) => {
    const generator = rc.generator
    const points = element.points.length ? element.points : [[0, 0]]
    const shape = [generator.curve(points, element)]
    const [x1, y1] = [element.x + negativeWidth, element.y + negativeHeight]
    const [x2, y2, _x3, _y3, _x4, _y4] = getArrowPoints(element, shape)
    rc.line(x1, y1, x1 + x2, y1 + y2, element)
}