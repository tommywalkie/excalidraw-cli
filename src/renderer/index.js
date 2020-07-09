import { createCanvas, registerFont } from 'canvas'
import * as rough from 'roughjs'

import { renderLine } from './line'
import { renderArrow } from './arrow'
import { renderDraw } from './draw'
import { renderRectangle } from './rectangle'
import { renderEllipse } from './ellipse'
import { renderText } from './text'
import { renderDiamond } from './diamond'

import { getCentroidFromRegularShape, rotate } from './shapeUtils'

const getDimensionsFromExcalidraw = json => {
    const defaultMargin = 10
    let maxWidth = 100
    let maxHeight = 100
    let negativeWidth = 0
    let negativeHeight = 0
    let minX, minY
    if (json && json.elements) {
        json.elements.forEach((el, index) => {
            const [cx, cy] = getCentroidFromRegularShape(el, negativeHeight, negativeWidth)
            const [topXr, topYr] = rotate(cx, cy, el.x + negativeWidth, el.y + negativeHeight, el.angle)
            const [rightXr, rightYr] = rotate(cx, cy, el.x + el.width + negativeWidth, el.y + negativeHeight, el.angle)
            const [bottomXr, bottomYr] = rotate(cx, cy, el.x + el.width + negativeWidth, el.y + el.height + negativeHeight, el.angle)
            const [leftXr, leftYr] = rotate(cx, cy, el.x + negativeWidth, el.y + el.height + negativeHeight, el.angle)
            const [finalX, finalY] = [
                Math.min(topXr, rightXr, bottomXr, leftXr),
                Math.min(topYr, rightYr, bottomYr, leftYr)
            ]
            if (index == 0) {
                minX = finalX
                minY = finalY
            }
            else {
                if (finalX < negativeWidth)
                    negativeWidth = finalX
                if (finalY < negativeHeight)
                    negativeHeight = finalY
                if (finalX < minX)
                    minX = finalX
                if (finalY < minY)
                    minY = finalY
            }
        })
        if (negativeWidth >= 0)
            negativeWidth = minX
        if (negativeHeight >= 0)
            negativeHeight = minY
        negativeWidth = negativeWidth - defaultMargin
        negativeHeight = negativeHeight - defaultMargin
        json.elements.forEach(el => {
            const [cx, cy] = getCentroidFromRegularShape(el, negativeHeight, negativeWidth)
            const [topXr, topYr] = rotate(cx, cy, el.x + negativeWidth, el.y + negativeHeight, el.angle)
            const [rightXr, rightYr] = rotate(cx, cy, el.x + el.width + negativeWidth, el.y + negativeHeight, el.angle)
            const [bottomXr, bottomYr] = rotate(cx, cy, el.x + el.width + negativeWidth, el.y + el.height + negativeHeight, el.angle)
            const [leftXr, leftYr] = rotate(cx, cy, el.x + negativeWidth, el.y + el.height + negativeHeight, el.angle)
            const [maxX, maxY] = [
                Math.max(topXr, rightXr, bottomXr, leftXr),
                Math.max(topYr, rightYr, bottomYr, leftYr)
            ]
            if (maxX + (0 - negativeWidth) > maxWidth)
                maxWidth = Number(maxX + (0 - negativeWidth))
            if (maxY + (0 - negativeHeight) > maxHeight)
                maxHeight = Number(maxY + (0 - negativeHeight))
        })
        maxWidth = maxWidth + defaultMargin
        maxHeight = maxHeight + defaultMargin
    }
    return {
        maxDimensions: [maxWidth-negativeWidth, maxHeight-negativeHeight],
        negativeDimensions: [negativeWidth, negativeHeight]
    }
}

export const convertExcalidrawToCanvas = async json => {
    registerFont(__dirname + '/../fonts/FG_Virgil.ttf', { family: 'Virgil' })
    registerFont(__dirname + '/../fonts/Cascadia.ttf', { family: 'Cascadia' })
    const { maxDimensions, negativeDimensions } = getDimensionsFromExcalidraw(json)
    const negativeWidth = -negativeDimensions[0]
    const negativeHeight = -negativeDimensions[1]
    const canvas = createCanvas(maxDimensions[0], maxDimensions[1])
    const rc = rough.canvas(canvas)
    const ctx = canvas.getContext("2d")
    rc.rectangle( 0, 0, maxDimensions[0], maxDimensions[1], { 
        fill: json.appState.viewBackgroundColor,
        fillStyle: 'solid',
        stroke: json.appState.viewBackgroundColor,
        roughness: 0
    })
    if (json && json.elements) {
        let elements = json.elements
        elements.forEach(el => {
            ctx.setLineDash([])
            ctx.textBaseline = 'middle'
            el.fill = el.backgroundColor
            el.stroke = el.strokeColor
            if (el.strokeStyle == 'dashed')
                ctx.setLineDash([12, 8])
            if (el.strokeStyle == 'dotted')
                ctx.setLineDash([3, 6])
            if (el.type == 'line')
                renderLine(el, rc, ctx)
            if (el.type == 'draw')
                renderDraw(el, rc, ctx, negativeWidth, negativeHeight)
            if (el.type == 'arrow')
                renderArrow(el, rc, negativeWidth, negativeHeight)
            if (el.type == 'rectangle')
                renderRectangle(el, rc, ctx, negativeWidth, negativeHeight)
            if (el.type == 'ellipse')
                renderEllipse(el, rc, ctx, negativeWidth, negativeHeight)
            if (el.type == 'diamond')
                renderDiamond(el, rc, negativeWidth, negativeHeight)
            if (el.type == 'text')
                renderText(el, ctx, negativeWidth, negativeHeight)
        })
    }

    return canvas
}