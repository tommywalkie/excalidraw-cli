import { createCanvas, registerFont } from 'canvas'
import * as rough from 'roughjs'

const getCentroid = arr => {
    var x = arr.map(xy => xy[0])
    var y = arr.map(xy => xy[1])
    var cx = (Math.min(...x) + Math.max(...x)) / 2
    var cy = (Math.min(...y) + Math.max(...y)) / 2
    return [cx, cy]
}

const rotate = (originX, originY, pointX, pointY, angle) => {
    return [
        Math.cos(angle) * (pointX - originX) - Math.sin(angle) * (pointY - originY) + originX,
        Math.sin(angle) * (pointX - originX) + Math.cos(angle) * (pointY - originY) + originY
    ]
}

const getCurvePathOps = shape => {
    for (const set of shape.sets) {
        if (set.type === "path") {
            return set.ops
        }
    }
    return shape.sets[0].ops
}

const getArrowPoints = (element, shape) => {
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

const getDiamondPoints = element => {
    const topX = Math.floor(element.width / 2) + 1;
    const topY = 0;
    const rightX = element.width;
    const rightY = Math.floor(element.height / 2) + 1;
    const bottomX = topX;
    const bottomY = element.height;
    const leftX = topY;
    const leftY = rightY;
    return [topX, topY, rightX, rightY, bottomX, bottomY, leftX, leftY];
}

const getDimensionsFromExcalidraw = json => {
    let maxWidth = 200
    let maxHeight = 200
    let negativeWidth = 0
    let negativeHeight = 0
    if (json && json.elements) {
        json.elements.forEach(el => {
            if (el.x < negativeWidth) {
                negativeWidth = el.x
            }
            if (el.y < negativeHeight) {
                negativeHeight = el.y
            }
        })
        json.elements.forEach(el => {
            if (el.x + el.width + (0 - negativeWidth) > maxWidth) {
                maxWidth = Number(el.x + el.width + (0 - negativeWidth))
            }
            if (el.y + el.height + (0 - negativeHeight) > maxHeight) {
                maxHeight = Number(el.y + el.height + (0 - negativeHeight))
            }
        })
    }
    return {
        maxDimensions: [maxWidth, maxHeight],
        negativeDimensions: [negativeWidth, negativeHeight]
    }
}

const getFontFamilyFromId = id => id == 1 ? 'Virgil' : id == 2 ? 'Arial' : 'Cascadia'

export const convertExcalidrawToCanvas = async json => {
    registerFont(__dirname + '/fonts/FG_Virgil.ttf', { family: 'Virgil' })
    registerFont(__dirname + '/fonts/Cascadia.ttf', { family: 'Cascadia' })
    const { maxDimensions, negativeDimensions } = getDimensionsFromExcalidraw(json)
    const negativeWidth = -negativeDimensions[0]
    const negativeHeight = -negativeDimensions[1]
    const canvas = createCanvas(maxDimensions[0], maxDimensions[1])
    const rc = rough.canvas(canvas)
    const generator = rc.generator
    const ctx = canvas.getContext("2d")
    // Generate diagram background 
    rc.rectangle(
        0,
        0,
        maxDimensions[0],
        maxDimensions[1],
        { fill: json.appState.viewBackgroundColor, fillStyle: 'solid' }
    )
    if (json && json.elements) {
        let elements = json.elements
        elements.forEach(el => {
            ctx.setLineDash([])
            ctx.textBaseline = 'middle'
            el.fill = el.backgroundColor
            el.stroke = el.strokeColor
            if (el.strokeStyle == 'dashed') ctx.setLineDash([12, 8])
            if (el.strokeStyle == 'dotted') ctx.setLineDash([3, 6])
            if (el.type == 'line') {
                const points = el.points.length ? el.points : [[0, 0]]
                const shape = [generator.curve(points, el)]
                const [x1, y1] = [el.x + negativeWidth, el.y + negativeHeight]
                const [x2, y2, _x3, _y3, _x4, _y4] = getArrowPoints(el, shape)
                rc.line(x1, y1, x1 + x2, y1 + y2, el)
            }
            if (el.type == 'draw') {
                el.fill = 'transparent'
                if (el.angle && el.angle != 0) {
                    const [cx, cy] = getCentroid([
                        [el.x + negativeWidth, el.y + negativeHeight],
                        [el.x + el.width + negativeWidth, el.y + negativeHeight],
                        [el.x + el.width + negativeWidth, el.y + negativeHeight + el.height],
                        [el.x + negativeWidth, el.y + negativeHeight + el.height],
                    ])
                    el.points = el.points.map(pt => rotate(cx, cy, el.x + pt[0], el.y + pt[1], el.angle))
                    rc.curve(el.points.map(pt => [pt[0], pt[1]]), el)
                } else {
                    rc.curve(el.points.map(pt => [el.x + pt[0], el.y + pt[1]]), el)
                }
            }
            if (el.type == 'arrow') {
                const points = el.points.length ? el.points : [[0, 0]]
                const shape = [generator.curve(points, el)]
                const [x1, y1] = [el.x + negativeWidth, el.y + negativeHeight]
                const [x2, y2, x3, y3, x4, y4] = getArrowPoints(el, shape)
                rc.line(x1, y1, x1 + x2, y1 + y2, el)
                rc.line(x1 + x2, y1 + y2, x1 + x3, y1 + y3, el)
                rc.line(x1 + x2, y1 + y2, x1 + x4, y1 + y4, el)
            }
            if (el.type == 'rectangle') {
                if (el.angle && el.angle != 0) {
                    const [cx, cy] = getCentroid([
                        [el.x + negativeWidth, el.y + negativeHeight],
                        [el.x + el.width + negativeWidth, el.y + negativeHeight],
                        [el.x + el.width + negativeWidth, el.y + negativeHeight + el.height],
                        [el.x + negativeWidth, el.y + negativeHeight + el.height],
                    ])
                    const [topXr, topYr] = rotate(cx, cy, el.x + negativeWidth, el.y + negativeHeight, el.angle)
                    const [rightXr, rightYr] = rotate(cx, cy, el.x + el.width + negativeWidth, el.y + negativeHeight, el.angle)
                    const [bottomXr, bottomYr] = rotate(cx, cy, el.x + el.width + negativeWidth, el.y + el.height + negativeHeight, el.angle)
                    const [leftXr, leftYr] = rotate(cx, cy, el.x + negativeWidth, el.y + el.height + negativeHeight, el.angle)
                    rc.polygon([
                        [topXr, topYr],
                        [rightXr, rightYr],
                        [bottomXr, bottomYr],
                        [leftXr, leftYr],
                    ], el)
                } else {
                    let initialStroke = el.stroke
                    ctx.setLineDash([])
                    el.stroke = 'transparent'
                    rc.rectangle(el.x + negativeWidth, el.y + negativeHeight, el.width, el.height, el)
                    el.stroke = initialStroke
                    el.fill = 'transparent'
                    if (el.strokeStyle == 'dashed') {
                        ctx.setLineDash([12, 8])
                    }
                    if (el.strokeStyle == 'dotted') {
                        ctx.setLineDash([3, 6])
                    }
                    rc.rectangle(el.x + negativeWidth, el.y + negativeHeight, el.width, el.height, el)
                }
            }
            if (el.type == 'ellipse') {
                el.fill = el.backgroundColor
                el.stroke = el.strokeColor
                if (el.angle && el.angle != 0) {
                    ctx.translate(el.x + negativeWidth + el.width / 2, el.y + negativeHeight + el.height / 2)
                    ctx.rotate(el.angle)
                    rc.ellipse(0, 0, el.width + (el.roughness > 1 ? 30 : 10), el.height, el)
                    ctx.rotate(-el.angle)
                    ctx.translate(-el.x - negativeWidth - el.width / 2, -el.y - negativeHeight - el.height / 2)
                } else {
                    rc.ellipse(
                        el.x + el.width / 2 + negativeWidth,
                        el.y + negativeHeight + el.height / 2,
                        el.width + (el.roughness > 1 ? 30 : 10),
                        el.height,
                        el
                    )
                }
            }
            if (el.type == 'diamond') {
                el.fill = el.backgroundColor
                el.stroke = el.strokeColor
                let [
                    topX,
                    topY,
                    rightX,
                    rightY,
                    bottomX,
                    bottomY,
                    leftX,
                    leftY,
                ] = getDiamondPoints(el)
                if (el.angle && el.angle != 0) {
                    const [cx, cy] = getCentroid([
                        [el.x + topX + negativeWidth, el.y + negativeHeight + topY],
                        [el.x + rightX + negativeWidth, el.y + negativeHeight + rightY],
                        [el.x + bottomX + negativeWidth, el.y + negativeHeight + bottomY],
                        [el.x + leftX + negativeWidth, el.y + negativeHeight + leftY],
                    ])
                    const [topXr, topYr] = rotate(
                        cx,
                        cy,
                        el.x + topX + negativeWidth,
                        el.y + topY + negativeHeight,
                        el.angle
                    )
                    const [rightXr, rightYr] = rotate(
                        cx,
                        cy,
                        el.x + rightX + negativeWidth,
                        el.y + rightY + negativeHeight,
                        el.angle
                    )
                    const [bottomXr, bottomYr] = rotate(
                        cx,
                        cy,
                        el.x + bottomX + negativeWidth,
                        el.y + bottomY + negativeHeight,
                        el.angle
                    )
                    const [leftXr, leftYr] = rotate(
                        cx,
                        cy,
                        el.x + leftX + negativeWidth,
                        el.y + leftY + negativeHeight,
                        el.angle
                    )
                    rc.polygon([
                        [topXr, topYr],
                        [rightXr, rightYr],
                        [bottomXr, bottomYr],
                        [leftXr, leftYr],
                    ], el)
                } else {
                    rc.polygon([
                        [el.x + topX + negativeWidth, el.y + negativeHeight + topY],
                        [el.x + rightX + negativeWidth, el.y + negativeHeight + rightY],
                        [el.x + bottomX + negativeWidth, el.y + negativeHeight + bottomY],
                        [el.x + leftX + negativeWidth, el.y + negativeHeight + leftY],
                    ], el)
                }
            }
            if (el.type == 'text') {
                let exploded = el.text.split('\n')
                let totalHeight = el.fontSize * exploded.length + el.fontSize * .5 * exploded.length
                ctx.font = el.fontSize + 'px ' + getFontFamilyFromId(el.fontFamily)
                ctx.fillStyle = el.strokeColor
                if (el.angle && el.angle != 0) {
                    ctx.translate(el.x + negativeWidth + el.width / 2, el.y + negativeHeight + el.height / 2)
                    ctx.rotate(el.angle)
                    exploded.forEach((str, index) => {
                        ctx.fillText(
                            str,
                            -el.width/2,
                            0 - totalHeight / 2 + index * (el.fontSize + el.fontSize * 0.6) + el.fontSize * 0.2 + el.fontSize * 0.5
                        )
                    })
                    ctx.rotate(-el.angle)
                    ctx.translate(
                        -el.x - negativeWidth - el.width / 2,
                        -el.y - negativeHeight - el.height / 2
                    )
                }
                else {
                    exploded.forEach((str, index) => {
                        ctx.fillText(
                            str,
                            el.x + negativeWidth,
                            el.y + el.height / 2 + negativeHeight - totalHeight / 2 + index * (el.fontSize + el.fontSize * 0.6) + el.fontSize * 0.2 + el.fontSize * 0.5)
                    })
                }
            }
        })
    }

    return canvas
}