import { retrieveDataFromExcalidraw } from './compute'

describe("Parsing Excalidraw files", () => {
    test('should be able to retrieve data from existing file', async () => {
        const data = await retrieveDataFromExcalidraw('./test/foo/circle.excalidraw')
        expect(data).toBeTruthy()
        expect(data.type).toBe("excalidraw")
    })
})