import { 
    getParamsFromExcalidrawUrl,
    isExcalidrawUrl,
    getApiDataFromInputUrl,
    regexExcalidrawUrl
} from './fromUrl'

describe("Validating Excalidraw URLs", () => {
    const someCorrectUrl: string = 'https://excalidraw.com/#json=5643478117646336,ppN9Km32ASfiz890-Ifwlg'
    const someIncorrectUrl: string = 'https://excalidraw.com/#json=,dopgkdfigopgkrk'
    const anotherIncorrectUrl: string = 'https://excalidraw.com/#json=14182629843651,'
    const yetAnotherIncorrectUrl: string = 'https://json.excalidraw.com/api/v2/14182629843651'
    
    test('Should detect correct Excalidraw URLs', async () => {
        expect(isExcalidrawUrl(someCorrectUrl)).toBeTruthy()
        expect(isExcalidrawUrl(someIncorrectUrl)).toBeFalsy()
        expect(isExcalidrawUrl(anotherIncorrectUrl)).toBeFalsy()
        expect(isExcalidrawUrl(yetAnotherIncorrectUrl)).toBeFalsy()
    })

    test('Should be able to retrieve matches', async () => {
        const matches = getParamsFromExcalidrawUrl(someCorrectUrl)
        const diagramId: string = matches[0]
        const key: string = matches[1]
        expect(diagramId).toBe('5643478117646336')
        expect(key).toBe('ppN9Km32ASfiz890-Ifwlg')
    })

    test('Should be able to retrieve bytes from url', async () => {
        const bytes = await getApiDataFromInputUrl(someCorrectUrl)
        expect(bytes).toBeTruthy()
    })

})