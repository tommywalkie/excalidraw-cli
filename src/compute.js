import * as chalk from 'chalk'
import * as fs from 'fs-extra'
import { convertExcalidrawToCanvas } from './renderer'
import { generateTaskListFromFiles, generateTaskListFromFile } from './worker'

const formatPath = path => path.replace(/\\/g, '/')

const getStatsFromPathThatShouldExist = async path => {
    try {
        return await fs.lstat(path)
    } catch (error) {
        console.error(`  ${chalk.red('×')} Path ${chalk.grey('<')}${chalk.red(formatPath(path))}${chalk.grey('>')} doesn\'t exist.`)
    }
}

const saveCanvasAsPng = async (canvas, path, inputFile, observer, task) => {
    try {
        const stream = canvas.createPNGStream()
        if (path) {
            try {
                const outputLstat = await fs.lstat(path)
                if (outputLstat && outputLstat.isFile()) {
                    let out = fs.createWriteStream(path.replace(/\.png$/g, '') + '.png')
                    stream.pipe(out)
                    if (observer) observer.complete()
                    if (task) task.title = `${task.title} ${chalk.grey('=>')} ${chalk.yellow(formatPath(path.replace(/\.png$/g, '')) + '.png')}`
                }
                if (outputLstat && outputLstat.isDirectory()) {
                    let out = fs.createWriteStream((path == './' ? '.' : path) + '/' + inputFile.split('\\').pop().split('/').pop() + '.png')
                    stream.pipe(out)
                    if (observer) observer.complete()
                    if (task) task.title = `${task.title} ${chalk.grey('=>')} ${chalk.yellow((path == './' ? '.' : formatPath(path)) + '/' + inputFile.split('\\').pop().split('/').pop() + '.png')}`
                }
            } catch (error) {
                let out = fs.createWriteStream(path.replace(/\.png$/g, '') + '.png')
                stream.pipe(out)
                if (observer) observer.complete()
                if (task) task.title = `${task.title} ${chalk.grey('=>')} ${chalk.yellow(formatPath(path.replace(/\.png$/g, '')) + '.png')}`
            }
        }
        else {
            let out = fs.createWriteStream('.' + inputFile.split('\\').pop().split('/').pop() + '.png')
            stream.pipe(out)
            if (observer) observer.complete()
            if (task) task.title = `${task.title} ${chalk.grey('=>')} ${chalk.yellow('.' + inputFile.split('\\').pop().split('/').pop() + '.png')}`
        }
    } catch (error) {
        if (observer) observer.error(error)
    }
}

export const generateCanvasAndSaveAsPng = async (inputArg, outputArg, observer, task) => {
    try {
        const inputData = await retrieveDataFromExcalidraw(inputArg)
        if (inputData) {
            const generatedCanvas = await convertExcalidrawToCanvas(inputData)
            if (generatedCanvas) {
                if (observer)
                    observer.next('Generated canvas, saving it as PNG...')
                saveCanvasAsPng(generatedCanvas, outputArg, inputArg, observer, task)
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

export const retrieveExcalidrawFilesFromDirectory = async path => {
    try {
        const files = await fs.readdir((path == process.cwd() ? __dirname : path))
        if (files)
            return files.filter(file => file.match(/\.excalidraw$/) !== null)
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
            const excalidrawFiles = await retrieveExcalidrawFilesFromDirectory(args.input)
            if (excalidrawFiles) {
                if (excalidrawFiles.length == 0)
                    console.error(`Input directory <${args.input}> has no '*.excalidraw' files.`)
                const tasks = generateTaskListFromFiles(excalidrawFiles, args.input, args.output, quiet)
                tasks.run().catch(err => {
                    console.error(err)
                })
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