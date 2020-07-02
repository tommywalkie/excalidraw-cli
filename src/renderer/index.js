import { createCanvas, registerFont } from 'canvas'
import * as rough from 'roughjs'

import { renderLine } from './line'
import { renderArrow } from './arrow'
import { renderDraw } from './draw'
import { renderRectangle } from './rectangle'
import { renderEllipse } from './ellipse'
import { renderText } from './text'
import { renderDiamond } from './diamond'

const getDimensionsFromExcalidraw = json => {
    let maxWidth = 200
    let maxHeight = 200
    let negativeWidth = 0
    let negativeHeight = 0
    let minX, minY
    if (json && json.elements) {
        json.elements.forEach((el, index) => {
            if (index == 0) {
                minX = el.x
                minY = el.y
            }
            if (el.x < negativeWidth)
                negativeWidth = el.x
            if (el.y < negativeHeight)
                negativeHeight = el.y
            if (el.x < minX)
                minX = el.x
            if (el.y < minY)
                minY = el.y
        })
        if (negativeWidth >= 0)
            negativeWidth = minX
        if (negativeHeight >= 0)
            negativeHeight = minY
        negativeWidth = negativeWidth - 50
        negativeHeight = negativeHeight - 50
        json.elements.forEach(el => {
            if (el.x + el.width + (0 - negativeWidth) > maxWidth)
                maxWidth = Number(el.x + el.width + (0 - negativeWidth))
            if (el.y + el.height + (0 - negativeHeight) > maxHeight)
                maxHeight = Number(el.y + el.height + (0 - negativeHeight))
        })
        maxWidth = maxWidth + 50
        maxHeight = maxHeight + 50
    }
    return {
        maxDimensions: [maxWidth, maxHeight],
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