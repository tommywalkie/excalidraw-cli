export const getCircumferenceFromRectangle = el => 2 * (el.height + el.width)

export const getCentroid = arr => {
    var x = arr.map(xy => xy[0])
    var y = arr.map(xy => xy[1])
    var cx = (Math.min(...x) + Math.max(...x)) / 2
    var cy = (Math.min(...y) + Math.max(...y)) / 2
    return [cx, cy]
}

export const getCentroidFromRegularShape = (element, negativeHeight, negativeWidth) => {
    return getCentroid([
        [element.x + negativeWidth, element.y + negativeHeight],
        [element.x + element.width + negativeWidth, element.y + negativeHeight],
        [element.x + element.width + negativeWidth, element.y + negativeHeight + element.height],
        [element.x + negativeWidth, element.y + negativeHeight + element.height],
    ])
}

export const rotate = (originX, originY, pointX, pointY, angle) => {
    return [
        Math.cos(angle) * (pointX - originX) - Math.sin(angle) * (pointY - originY) + originX,
        Math.sin(angle) * (pointX - originX) + Math.cos(angle) * (pointY - originY) + originY
    ]
}