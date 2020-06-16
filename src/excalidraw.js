import { createCanvas, registerFont } from 'canvas'
import * as fs from 'fs'
import * as rough from 'roughjs'

const getCentroid = arr => {
    var x = arr.map(xy => xy[0]);
    var y = arr.map(xy => xy[1]);
    var cx = (Math.min(...x) + Math.max(...x)) / 2;
    var cy = (Math.min(...y) + Math.max(...y)) / 2;
    return [cx, cy];
}

const rotate = (x1, y1, x2, y2, angle) =>
    // 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃−(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
    // 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
    // https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
    [
        (x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2,
        (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2,
    ]

const rotatePolygonPoints = (originX, originY, pointX, pointY, angle) => {
    angle = angle * Math.PI / 180.0;
    return [
        Math.cos(angle) * (pointX - originX) - Math.sin(angle) * (pointY - originY) + originX,
        Math.sin(angle) * (pointX - originX) + Math.cos(angle) * (pointY - originY) + originY
    ]
}

const getCurvePathOps = shape => {
    for (const set of shape.sets) {
        if (set.type === "path") {
            return set.ops;
        }
    }
    return shape.sets[0].ops;
}

const getArrowPoints = (element, shape) => {
    const ops = getCurvePathOps(shape[0]);

    const data = ops[ops.length - 1].data;
    const p3 = [data[4], data[5]];
    const p2 = [data[2], data[3]];
    const p1 = [data[0], data[1]];

    // we need to find p0 of the bezier curve
    // it is typically the last point of the previous
    // curve; it can also be the position of moveTo operation
    const prevOp = ops[ops.length - 2];
    let p0 = [0, 0];
    if (prevOp.op === "move") {
        p0 = prevOp.data;
    } else if (prevOp.op === "bcurveTo") {
        p0 = [prevOp.data[4], prevOp.data[5]];
    }

    // B(t) = p0 * (1-t)^3 + 3p1 * t * (1-t)^2 + 3p2 * t^2 * (1-t) + p3 * t^3
    const equation = (t, idx) =>
        Math.pow(1 - t, 3) * p3[idx] +
        3 * t * Math.pow(1 - t, 2) * p2[idx] +
        3 * Math.pow(t, 2) * (1 - t) * p1[idx] +
        p0[idx] * Math.pow(t, 3);

    // we know the last point of the arrow
    const [x2, y2] = p3;

    // by using cubic bezier equation (B(t)) and the given parameters,
    // we calculate a point that is closer to the last point
    // The value 0.3 is chosen arbitrarily and it works best for all
    // the tested cases
    const [x1, y1] = [equation(0.3, 0), equation(0.3, 1)];

    // find the normalized direction vector based on the
    // previously calculated points
    const distance = Math.hypot(x2 - x1, y2 - y1);
    const nx = (x2 - x1) / distance;
    const ny = (y2 - y1) / distance;

    const size = 30; // pixels
    const arrowLength = element.points.reduce((total, [cx, cy], idx, points) => {
        const [px, py] = idx > 0 ? points[idx - 1] : [0, 0];
        return total + Math.hypot(cx - px, cy - py);
    }, 0);

    // Scale down the arrow until we hit a certain size so that it doesn't look weird
    // This value is selected by minizing a minmum size with the whole length of the arrow
    // intead of last segment of the arrow
    const minSize = Math.min(size, arrowLength / 2);
    const xs = x2 - nx * minSize;
    const ys = y2 - ny * minSize;

    const angle = 20; // degrees
    const [x3, y3] = rotate(xs, ys, x2, y2, (-angle * Math.PI) / 180);
    const [x4, y4] = rotate(xs, ys, x2, y2, (angle * Math.PI) / 180);

    return [x2, y2, x3, y3, x4, y4];
}

const getDiamondPoints = element => {
    // Here we add +1 to avoid these numbers to be 0
    // otherwise rough.js will throw an error complaining about it
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

const convertExcalidrawToCanvas = async (json) => {
    registerFont(__dirname + '/fonts/FG_Virgil.ttf', { family: 'Virgil' })
    const { maxDimensions, negativeDimensions } = getDimensionsFromExcalidraw(json)
    const negativeWidth = -negativeDimensions[0]
    const negativeHeight = -negativeDimensions[1]
    const canvas = createCanvas(maxDimensions[0], maxDimensions[1])
    const rc = rough.canvas(canvas)
    const generator = rc.generator
    const ctx = canvas.getContext("2d")
    if (json && json.elements) {
        let elements = json.elements
        elements.forEach(el => {
            ctx.setLineDash([])
            el.fill = el.backgroundColor
            el.stroke = el.strokeColor
            if (el.strokeStyle == 'dashed') {
                ctx.setLineDash([12, 8])
            }
            if (el.strokeStyle == 'dotted') {
                ctx.setLineDash([3, 6])
            }
            if (el.type == 'line') rc.line(el.x + negativeWidth, el.y + negativeHeight, el.x + el.width, el.y + negativeHeight + el.height,
                el)
            if (el.type == 'draw') {
                el.points.forEach((pt, index) => {
                    if (index < el.points.length - 1) {
                        rc.line(el.x + pt[0] + negativeWidth, el.y + pt[1] + negativeHeight, el.x + el.points[index + 1][
                            0], el.y + el.points[index + 1][1] + negativeHeight, el)
                    }
                })
            }
            if (el.type == 'arrow') {
                const points = el.points.length ? el.points : [
                    [0, 0]
                ]
                const shape = [generator.curve(points, el)]
                const [x1, y1] = [el.x + negativeWidth, el.y + negativeHeight]
                const [x2, y2, x3, y3, x4, y4] = getArrowPoints(el, shape)
                rc.line(x1, y1, x1 + x2, y1 + y2, el)
                rc.line(x1 + x2, y1 + y2, x1 + x3, y1 + y3, el)
                rc.line(x1 + x2, y1 + y2, x1 + x4, y1 + y4, el)
            }
            if (el.type == 'rectangle') {
                if (el.angle) {
                    const [cx, cy] = getCentroid([
                        [el.x + negativeWidth, el.y + negativeHeight],
                        [el.x + el.width + negativeWidth, el.y + negativeHeight],
                        [el.x + el.width + negativeWidth, el.y + negativeHeight + el.height],
                        [el.x + negativeWidth, el.y + negativeHeight + el.height],
                    ])
                    const [topXr, topYr] = rotatePolygonPoints(cx, cy, el.x + negativeWidth, el.y + negativeHeight, (180 * el.angle) / Math.PI)
                    const [rightXr, rightYr] = rotatePolygonPoints(cx, cy, el.x + el.width + negativeWidth, el.y + negativeHeight, (180 * el.angle) / Math.PI)
                    const [bottomXr, bottomYr] = rotatePolygonPoints(cx, cy, el.x + el.width + negativeWidth, el.y + el.height + negativeHeight, (180 * el.angle) / Math.PI)
                    const [leftXr, leftYr] = rotatePolygonPoints(cx, cy, el.x + negativeWidth, el.y + el.height + negativeHeight, (180 * el.angle) / Math.PI)
                    rc.polygon([
                        [topXr, topYr],
                        [rightXr, rightYr],
                        [bottomXr, bottomYr],
                        [leftXr, leftYr],
                    ], el)
                } else {
                    el.fill = 'transparent'
                    rc.rectangle(el.x + negativeWidth, el.y + negativeHeight, el.width, el.height, el)
                    el.fill = el.backgroundColor
                    el.stroke = 'transparent'
                    ctx.setLineDash([])
                    rc.rectangle(el.x + negativeWidth, el.y + negativeHeight, el.width, el.height, el)
                }
            }
            if (el.type == 'ellipse') {
                el.fill = el.backgroundColor
                el.stroke = el.strokeColor
                rc.ellipse(el.x + el.width / 2 + negativeWidth, el.y + negativeHeight + el.height / 2, el.width + (el.roughness >
                    1 ? 30 : 10), el.height, el)
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
                if (el.angle) {
                    const [cx, cy] = getCentroid([
                        [el.x + topX + negativeWidth, el.y + negativeHeight + topY],
                        [el.x + rightX + negativeWidth, el.y + negativeHeight + rightY],
                        [el.x + bottomX + negativeWidth, el.y + negativeHeight + bottomY],
                        [el.x + leftX + negativeWidth, el.y + negativeHeight + leftY],
                    ])
                    const [topXr, topYr] = rotatePolygonPoints(cx, cy, el.x + topX + negativeWidth, el.y + topY + negativeHeight, (180 * el.angle) / Math.PI)
                    const [rightXr, rightYr] = rotatePolygonPoints(cx, cy, el.x + rightX + negativeWidth, el.y + rightY + negativeHeight, (180 * el.angle) / Math.PI)
                    const [bottomXr, bottomYr] = rotatePolygonPoints(cx, cy, el.x + bottomX + negativeWidth, el.y + bottomY + negativeHeight, (180 * el.angle) / Math.PI)
                    const [leftXr, leftYr] = rotatePolygonPoints(cx, cy, el.x + leftX + negativeWidth, el.y + leftY + negativeHeight, (180 * el.angle) / Math.PI)

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
                let totalHeight = el.fontSize * exploded.length + 10 * exploded.length
                ctx.font = el.fontSize + 'px ' + (el.fontFamily == 1 ? 'Virgil' : el.fontFamily == 2 ? 'Arial' : 'Cascadia')
                ctx.fillStyle = el.strokeColor
                exploded.forEach((str, index) => {
                    ctx.fillText(str, el.x + negativeWidth, el.y + el.height / 2 + negativeHeight - totalHeight / 2 + index * (el.fontSize + 10) + 20)
                })
            }
        })
    }

    return canvas
}

export const computeExcalidrawDiagrams = async (inputDir, outputDir) => {
    fs.readdirSync(inputDir).forEach(async function(file) {
        if (file.match(/\.excalidraw$/) !== null) {
            let json = JSON.parse(fs.readFileSync(inputDir + '/' + file, 'utf8'))
            let canvas = await convertExcalidrawToCanvas(json)
            let stream = canvas.createPNGStream()
            let out = fs.createWriteStream(outputDir + '/' + file + '.png')
            stream.pipe(out)
        }
    })
}

