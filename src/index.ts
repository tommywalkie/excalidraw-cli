import { Command, flags } from '@oclif/command'
import { computeExcalidrawDiagrams } from './excalidraw'

class ExcalidrawCli extends Command {
    static description = 'Parses Excalidraw JSON schemas into PNGs'

    static flags = {
        // add --version flag to show CLI version
        version: flags.version({char: 'v'}),
        help: flags.help({char: 'h'}),
        // flag with a value (-n, --name=VALUE)
        name: flags.string({char: 'n', description: 'name to print'}),
        // flag with no value (-f, --force)
        force: flags.boolean({char: 'f'}),
    }

    static args = [{name: 'inputdir'},{name: 'outputdir'}]

    async run() {
        const {args, flags} = this.parse(ExcalidrawCli)

        const name = flags.name || 'world'
        this.log(`hello ${name} from .\\src\\index.ts !`)
        console.log(args);

        if (args.inputdir && args.outputdir) {
            computeExcalidrawDiagrams(args.inputdir, args.outputdir)
        }
    }
}

export = ExcalidrawCli
