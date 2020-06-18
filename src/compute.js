import * as fs from 'fs-extra'
import { convertExcalidrawToCanvas } from './renderer'

const getStatsFromPath = async path => {
    try {
        return await fs.lstat(path)
    } catch (error) {
        console.error('Path <' + path + '> doesn\'t exist. Cannot process request.')
        console.error(error)
    }
}

const saveCanvasAsPng = async (canvas, path, inputFile) => {
    try {
        const stream = canvas.createPNGStream()
        if (path) {
            try {
                const outputLstat = await fs.lstat(path)
                if (outputLstat && outputLstat.isFile()) {
                    console.log(`Saving successfully generated canvas as <${path + '.png'}>...`)
                    let out = fs.createWriteStream(path + '.png')
                    stream.pipe(out)
                }
                if (outputLstat && outputLstat.isDirectory()) {
                    console.log(`Saving successfully generated canvas as <${(path == './' ? '.' : path) + '/' + inputFile.split('\\').pop().split('/').pop() + '.png'}>...`)
                    let out = fs.createWriteStream((path == './' ? '.' : path) + '/' + inputFile.split('\\').pop().split('/').pop() + '.png')
                    stream.pipe(out)
                }
            } catch (error) {
                console.log(`Saving successfully generated canvas as <${(path == './' ? '.' : path) + '.png'}>...`)
                let out = fs.createWriteStream((path == './' ? '.' : path) + '.png')
                stream.pipe(out)
            }
        }
        else {
            console.log(`No output file / directory defined.`)
            console.log(`Saving successfully generated canvas as <${inputFile.split('\\').pop().split('/').pop() + '.png'}> in working directory...`)
            let out = fs.createWriteStream('.' + inputFile.split('\\').pop().split('/').pop() + '.png')
            stream.pipe(out)
        }
        
    } catch (error) {
        console.error('Some error occured when trying to save newly generated canvas as PNG.')
        console.error(error)
    }
}

const generateCanvasAndSaveAsPng = async (inputArg, outputArg) => {
    console.log(`Now processing data from <${inputArg}> file...`)
    const inputData = await retrieveDataFromExcalidraw(inputArg)
    if (inputData) {
        console.log(`Generating canvas, using retrieved data from <${inputArg}> file...`)
        const generatedCanvas = await convertExcalidrawToCanvas(inputData)
        if (generatedCanvas)
            saveCanvasAsPng(generatedCanvas, outputArg, inputArg)
    }
}

export const retrieveDataFromExcalidraw = async path => {
    try {
        const data = await fs.readFile(path, 'utf8')
        if (data) return JSON.parse(data)
    } catch (error) {
        console.error('Some error occured when retrieving data in <' + path + '> file. Cannot process request.')
        console.error(error)
    }
}

export const retrieveExcalidrawFilesFromDirectory = async path => {
    try {
        const files = await fs.readdir(path)
        if (files) {
            const res = await Promise.all(
                files.map(async file => {
                    if (file.match(/\.excalidraw$/) !== null) {
                        return file
                    }
                })
            )
            if (res) return res
        }
    } catch (error) {
        console.error('Some error occured when trying to analyze <' + path + '> directory. Cannot process request.')
        console.error(error)
    }
}

export const computeUserInputs = async ({ args, flags }) => {
    if (args.input) {
        const inputLstat = await getStatsFromPath(args.input)
        if (inputLstat && inputLstat.isFile())
            await generateCanvasAndSaveAsPng(args.input, args.output)
        if (inputLstat && inputLstat.isDirectory()) {
            const excalidrawFiles = await retrieveExcalidrawFilesFromDirectory(args.input)
            if (excalidrawFiles) {
                excalidrawFiles.forEach(async file => {
                    generateCanvasAndSaveAsPng(args.input + '/' + file, args.output)
                })
            }
        }
    }
}