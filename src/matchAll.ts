export const regexExcalidrawUrl = /https:\/\/excalidraw\.com\/#json=(.{1,})\,(.{1,})/g

export const matchAll = (text: String) => {
    const it: IterableIterator<RegExpMatchArray> = text.matchAll(/https:\/\/excalidraw\.com\/#json=(.{1,})\,(.{1,})/g)
    const ar = Array.from(it)
    return [ar[0][1], ar[0][2]]
}