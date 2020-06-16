import { Command, flags } from '@oclif/command'
import { computeExcalidrawDiagrams } from './excalidraw'

class ExcalidrawCli extends Command {
    static description = 'Parses Excalidraw JSON schemas into PNGs'

    static flags = {
        version: flags.version({char: 'v'}),
        help: flags.help({char: 'h'})
    }

    static args = [
        {
            name: 'input',
            description: 'input *.excalidraw file / directory'
        },
        {
            name: 'output',
            description: 'output file / directory for PNG images'
        }
    ]

    async run() {
        const {args, flags} = this.parse(ExcalidrawCli)

        if (args.input && args.output) {
            computeExcalidrawDiagrams(args.input, args.output)
        }
    }
}

export = ExcalidrawCli
