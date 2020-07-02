import { rotate } from './shapeUtils'

const getCurvePathOps = shape => {
    for (const set of shape.sets) {
        if (set.type === "path")
            return set.ops
    }
    return shape.sets[0].ops
}

export const getArrowPoints = (element, shape) => {
    const ops = getCurvePathOps(shape[0])

    const data = ops[ops.length - 1].data
    const p3 = [data[4], data[5]]
    const p2 = [data[2], data[3]]
    const p1 = [data[0], data[1]]

    const prevOp = ops[ops.length - 2]
    let p0 = [0, 0];
    if (prevOp.op === "move") {
        p0 = prevOp.data;
    } else if (prevOp.op === "bcurveTo") {
        p0 = [prevOp.data[4], prevOp.data[5]]
    }

    const equation = (t, idx) =>
        Math.pow(1 - t, 3) * p3[idx] +
        3 * t * Math.pow(1 - t, 2) * p2[idx] +
        3 * Math.pow(t, 2) * (1 - t) * p1[idx] +
        p0[idx] * Math.pow(t, 3)

    const [x2, y2] = p3

    const [x1, y1] = [equation(0.3, 0), equation(0.3, 1)]

    const distance = Math.hypot(x2 - x1, y2 - y1)
    const nx = (x2 - x1) / distance
    const ny = (y2 - y1) / distance

    const size = 30
    const arrowLength = element.points.reduce((total, [cx, cy], idx, points) => {
        const [px, py] = idx > 0 ? points[idx - 1] : [0, 0]
        return total + Math.hypot(cx - px, cy - py)
    }, 0)

    const minSize = Math.min(size, arrowLength / 2)
    const xs = x2 - nx * minSize
    const ys = y2 - ny * minSize

    const angle = 20
    const [x3, y3] = rotate(x2, y2, xs, ys, (-angle * Math.PI) / 180)
    const [x4, y4] = rotate(x2, y2, xs, ys, (angle * Math.PI) / 180)
    return [x2, y2, x3, y3, x4, y4]
}

export const renderArrow = (element, rc, negativeWidth, negativeHeight) => {
    const generator = rc.generator
    const points = element.points.length ? element.points : [[0, 0]]
    const shape = [generator.curve(points, element)]
    const [x1, y1] = [element.x + negativeWidth, element.y + negativeHeight]
    const [x2, y2, x3, y3, x4, y4] = getArrowPoints(element, shape)
    rc.line(x1, y1, x1 + x2, y1 + y2, element)
    rc.line(x1 + x2, y1 + y2, x1 + x3, y1 + y3, element)
    rc.line(x1 + x2, y1 + y2, x1 + x4, y1 + y4, element)
}