import Listr from 'listr'
import { Observable } from 'rxjs'
import { generateCanvasAndSaveAsPng } from './compute'

const generateTaskFromFile = (file, inputPath, outputPath) => {
    return {
        title: file,
        task: (_, task) => new Observable(observer => {
            observer.next('Processing data...')
            const _ = generateCanvasAndSaveAsPng((inputPath ? inputPath + '/' : '') + file, inputPath, outputPath, observer, task)
        })
    }
}

export const generateTaskListFromFiles = (files, inputPath, outputPath, quiet) => {
    const tasks = files.map(file => generateTaskFromFile(file, inputPath, outputPath))
    return new Listr(tasks, { renderer: quiet ? 'silent' : 'default' })
}

export const generateTaskListFromFile = (file, outputPath, quiet) => {
    const tasks = generateTaskFromFile(file, null, outputPath)
    return new Listr([tasks], { renderer: quiet ? 'silent' : 'default' })
}