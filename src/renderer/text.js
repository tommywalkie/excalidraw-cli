import {} from './shapeUtils'

const getFontSise = element => {
    const defaultFontSize = 20
    // If we have a fontSize in the element, use it.
    if (element.fontSize)
        return element.fontSize
    // Try to parse fontSize from the font
    if (element.font) {
        const value = element.font.split("px")[0]
        const parsed = parseInt(value, 10)
        if (!isNaN(parsed))
            return parsed
    }
    return defaultFontSize
}

export const getFontFamilyFromId = id => 
    id ? id == 1 ? 'Virgil' : id == 2 ? 'Arial' : 'Cascadia' : 'Virgil'

export const getFontFamilyFromElement = element => {
    if (element.fontFamily)
        return getFontFamilyFromId(element.fontFamily)
    if (element.font)
        return element.font.split("px")[1]
    return 'Virgil'
}
    

export const getFontFromElement = element => {
    let font = ''
    font += getFontSise(element) + 'px '
    font += getFontFamilyFromElement(element)
    return font
}

export const renderText = (element, ctx, negativeWidth, negativeHeight) => {
    let exploded = element.text.split('\n')
    let fontSize = getFontSise(element)
    let totalHeight = fontSize * exploded.length + fontSize * .5 * exploded.length
    ctx.font = getFontFromElement(element)
    ctx.fillStyle = element.strokeColor
    ctx.textAlign = 'center'
    if (element.angle && element.angle != 0) {
        ctx.translate(element.x + negativeWidth + element.width / 2, element.y + negativeHeight + element.height / 2)
        ctx.rotate(element.angle)
        exploded.forEach((str, index) => {
            ctx.fillText(
                str,
                0,
                0 - totalHeight / 2 + index * (fontSize + fontSize * 0.6) + fontSize * 0.2 + fontSize * 0.5
            )
        })
        ctx.rotate(-element.angle)
        ctx.translate(
            -element.x - negativeWidth - element.width / 2,
            -element.y - negativeHeight - element.height / 2
        )
    }
    else {
        exploded.forEach((str, index) => {
            ctx.fillText(
                str,
                element.x + negativeWidth + element.width/2,
                element.y + element.height / 2 + negativeHeight - totalHeight / 2 + index * (fontSize + fontSize * 0.6) + fontSize * 0.2 + fontSize * 0.5
            )
        })
    }
}