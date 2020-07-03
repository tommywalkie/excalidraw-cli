import chalk from 'chalk'
import * as fs from 'fs-extra'
import * as path from 'path'
import { convertExcalidrawToCanvas } from './renderer'
import { generateTaskListFromFiles, generateTaskListFromFile } from './worker'
import readdirRecursive from 'fs-readdir-recursive'

const formatPath = path => path.replace(/\\/g, '/')

const getStatsFromPathThatShouldExist = async path => {
    try {
        return await fs.lstat(path)
    } catch (error) {
        console.error(`  ${chalk.red('×')} Path ${chalk.grey('<')}${chalk.red(formatPath(path))}${chalk.grey('>')} doesn\'t exist.`)
    }
}

const saveCanvasAsPng = async (canvas, pathArg, inputPath, inputFile, observer, task) => {
    try {
        const stream = canvas.createPNGStream()
        const outputPathExt = path.extname(pathArg)
        const outputFileName = path.basename(pathArg, outputPathExt)
        if (outputPathExt.length > 0) {
            let outputFilePath = path.join(path.dirname(pathArg), outputFileName + '.png')
            let out = fs.createWriteStream(outputFilePath)
            stream.pipe(out)
            if (observer) observer.complete()
            if (task) task.title = `${task.title} ${chalk.grey('=>')} ${chalk.yellow(outputFilePath)}`
        } else {
            const inputFileExt = path.extname(inputFile);
            const outputFile = path.basename(inputFile,inputFileExt)
            const inputFileParentPath = path.dirname(inputFile)
            fs.mkdir(path.join(pathArg, inputFileParentPath.substring(inputPath.length)), { recursive: true }, (err) => {
                if (err) throw err;
                let outputFilePath = path.join(pathArg, inputFileParentPath.substring(inputPath.length), outputFile + '.png')
                let out = fs.createWriteStream(outputFilePath)
                stream.pipe(out)
                if (observer) observer.complete()
                if (task) task.title = `${task.title} ${chalk.grey('=>')} ${chalk.yellow(outputFilePath)}`
            })
        }
    } catch (error) {
        if (observer) observer.error(error)
    }
}

export const generateCanvasAndSaveAsPng = async (inputArg, inputPath, outputArg, observer, task) => {
    try {
        const inputData = await retrieveDataFromExcalidraw(inputArg)
        if (inputData) {
            const generatedCanvas = await convertExcalidrawToCanvas(inputData)
            if (generatedCanvas) {
                if (observer)
                    observer.next('Generated canvas, saving it as PNG...')
                saveCanvasAsPng(generatedCanvas, outputArg, inputPath, inputArg, observer, task)
            }
        }
    } catch (error) {
        if (observer) observer.error(error)
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

export const retrieveExcalidrawFilesFrom = async inputPath => {
    try {
        const files = await readdirRecursive(inputPath, _ => _)
        if (files)
            return files.filter(el => path.extname(el) === '.excalidraw')
    } catch (error) {
        console.error('Some error occured when trying to analyze <' + path + '> directory. Cannot process request.')
        console.error(error)
    }
}

export const computeUserInputs = async ({ args, flags }) => {
    args.input = args.input.replace(/\{cwd\}/g, process.cwd())
    args.output = args.output.replace(/\{cwd\}/g, process.cwd())
    const quiet = flags.quiet
    if (args.input) {
        const inputLstat = await getStatsFromPathThatShouldExist(args.input)
        if (inputLstat && inputLstat.isDirectory()) {
            const outputPathExt = path.extname(args.output)
            if (outputPathExt.length > 0)
                console.error(`Cannot process the request.\nYou passed a folder (${chalk.yellow(args.input)}) as input, and a single file (${chalk.yellow(args.output)}) as output.`)
            else {
                const excalidrawFiles = await retrieveExcalidrawFilesFrom(args.input)
                if (excalidrawFiles) {
                    if (excalidrawFiles.length == 0)
                        console.error(`Input directory <${chalk.yellow(args.input)}> has no '*.excalidraw' files.`)
                    const tasks = generateTaskListFromFiles(excalidrawFiles, args.input, args.output, quiet)
                    tasks.run().catch(err => {
                        console.error(err)
                    })
                }
            }
        }
        else if (inputLstat && inputLstat.isFile()) {
            const tasks = generateTaskListFromFile(args.input, args.output, quiet)
            tasks.run().catch(err => {
                console.error(err)
            })
        }
    }
    else {
        console.error('Please enter a valid path as input.')
    }
}

export { readdirRecursive }