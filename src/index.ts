import { Command, flags } from '@oclif/command'
import { computeUserInputs } from './compute'

class ExcalidrawCli extends Command {
    static description = 'Parses Excalidraw JSON schemas into PNGs'

    static flags = {
        version: flags.version({char: 'v'}),
        help: flags.help({char: 'h'}),
        // transparent: flags.boolean({char: 't', description: 'set diagram background to transparent'}),
        // quiet: flags.boolean({ char: 'q', description: 'disable console outputs' })
    }

    static args = [
        { 
            name: 'input',
            description: 'Excalidraw file path / directory path',
            required: false,
            default: '{cwd}'
        },
        { 
            name: 'output',
            description: 'Output PNG file path / directory path',
            required: false,
            default: '{cwd}'
        }
    ]

    async run() {
        computeUserInputs(this.parse(ExcalidrawCli))
    }
}

export = ExcalidrawCli
