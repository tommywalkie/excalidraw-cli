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
            name: 'inputdir',
            description: 'input directory with *.excalidraw files'
        },
        {
            name: 'outputdir',
            description: 'output directory for PNG images'
        }
    ]

    async run() {
        const {args, flags} = this.parse(ExcalidrawCli)

        if (args.inputdir && args.outputdir) {
            computeExcalidrawDiagrams(args.inputdir, args.outputdir)
        }
    }
}

export = ExcalidrawCli
