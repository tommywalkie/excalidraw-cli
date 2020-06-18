import { Command, flags } from '@oclif/command'
import { computeUserInputs } from './compute'

class ExcalidrawCli extends Command {
    static description = 'Parses Excalidraw JSON schemas into PNGs'

    static flags = {
        version: flags.version({char: 'v'}),
        help: flags.help({char: 'h'}),
        // quiet: flags.boolean({ char: 'q', description: 'disable console outputs' })
    }

    static args = [
        { name: 'input', description: 'Excalidraw file path / directory path' },
        { name: 'output', description: 'Output PNG file path / directory path' }
    ]

    async run() {
        computeUserInputs(this.parse(ExcalidrawCli))
    }
}

export = ExcalidrawCli
