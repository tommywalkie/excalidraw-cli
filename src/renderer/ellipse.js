export const renderEllipse = (element, rc, ctx, negativeWidth, negativeHeight) => {
    element.fill = element.backgroundColor
    element.stroke = element.strokeColor
    if (element.angle && element.angle != 0) {
        ctx.translate(element.x + negativeWidth + element.width / 2, element.y + negativeHeight + element.height / 2)
        ctx.rotate(element.angle)
        rc.ellipse(0, 0, element.width + (element.roughness > 1 ? 30 : 10), element.height, element)
        ctx.rotate(-element.angle)
        ctx.translate(-element.x - negativeWidth - element.width / 2, -element.y - negativeHeight - element.height / 2)
    } else {
        rc.ellipse(
            element.x + element.width / 2 + negativeWidth,
            element.y + negativeHeight + element.height / 2,
            element.width + (element.roughness > 1 ? 30 : 10),
            element.height,
            element
        )
    }
}