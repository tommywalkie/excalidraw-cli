import { retrieveDataFromExcalidraw, retrieveExcalidrawFilesFrom } from './compute'

describe("Detecting Excalidraw files", () => {
    test('should be able to retrieve 8 Excalidraw files inside test/', async () => {
        const excalidrawFiles = await retrieveExcalidrawFilesFrom('test')
        if (excalidrawFiles)
            expect(excalidrawFiles.length).toBe(8)
    })
})

describe("Parsing Excalidraw files", () => {
    test('should be able to retrieve data from existing file', async () => {
        const data = await retrieveDataFromExcalidraw('./test/foo/circle.excalidraw')
        expect(data).toBeTruthy()
        expect(data.type).toBe("excalidraw")
    })
})