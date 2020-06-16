# excalidraw-cli
Unofficial experimental Excalidraw CLI tool.

Parses Excalidraw JSON schemas (`*.excalidraw`) into PNG images (`*.excalidraw.png`).

This project is a follow-up to [excalidraw#1261](https://github.com/excalidraw/excalidraw/issues/1261) and strives to provide a framework-agnostic CLI for **[excalidraw](https://github.com/excalidraw/excalidraw)**.

## Install

> **Note**: `excalidraw-cli` is still _work-in-progress_. Install process and usage will be improved.

```bash
# Clone the repo
git clone https://github.com/tommywalkie/excalidraw-cli.git
cd excalidraw-cli

# Install dependencies
npm install

# Compile TypeScript source
npm run prepack

# Use the CLI
./bin/run
```

## Usage

```bash
$ ./bin/run -h
Parses Excalidraw JSON schemas into PNGs

USAGE
  $ excalidraw-cli [INPUTDIR] [OUTPUTDIR]
ARGUMENTS
  INPUTDIR   input directory with *.excalidraw files
  OUTPUTDIR  output directory for PNG images

OPTIONS
  -h, --help     show CLI help
  -v, --version  show CLI version
```

## Roadmap

Excalidraw is based on [**Rough.js**](https://roughjs.com/), and internally uses **TypeScript** and **React** to render diagrams.

Currently, `excalidraw-cli` uses **[oclif](https://github.com/oclif/oclif)** at its core, generates some canvas objects (via **[node-canvas](https://github.com/Automattic/node-canvas)**) from Excalidraw JSON schemas (`*.excalidraw`) and uses a home-made framework-agnostic renderer which tries to _mimic_ Excalidraw's as much as possible without the overhead, using [**Rough.js**](https://roughjs.com/) API primarily, and then export as PNG images (`*.excalidraw.png`).

Hopefully, `excalidraw-cli` will use Excalidraw renderer methods and constants once they are provided by Excalidraw itself.

**Renderer implementation**

- [x] Display **rectangles**
- [x] Display **ellipses**
- [x] Display **lines**
- [x] Display **arrows**
- [x] Display **diamonds**
- [x] **Rotate** shapes (rectangles, diamonds, etc.)
- [x] Display **text**
  - [x] **Vigil** font support
  - [ ] **Cascadia** font support
  - [ ] **Rotate** text
- [x] Display **drawings**
  - [ ] Display **curved** drawings
- [ ] Add **tests**
- [ ] (**_long-term_**) Use Excalidraw renderer **methods** and **constants** directly

**CLI**

- [x] Set up initial **oclif** / **TypeScript** based CLI
- [ ] Setup **Github Actions** for CI/CD
- [ ] Provide **demo** on the README
- [ ] Provide better **install** guide
- [ ] Provide better **usage** guide
- [ ] Provide other **options** / **flags** ?

## License

MIT