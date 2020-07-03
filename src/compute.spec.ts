import { retrieveDataFromExcalidraw, readdirRecursive } from './compute'
import * as path from 'path'

describe("Detecting Excalidraw files", () => {
    test('should be able to retrieve 8 Excalidraw files inside test/', async () => {
        const files = readdirRecursive('./test/')
        const excalidrawFiles = files.filter((el: string) => path.extname(el) === '.excalidraw')
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