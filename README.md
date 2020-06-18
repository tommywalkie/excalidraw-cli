# excalidraw-cli

Experimental Excalidraw CLI tool.

Parses Excalidraw JSON schemas (`*.excalidraw`) into PNGs (`*.excalidraw.png`).

This project is a follow-up to [excalidraw#1261](https://github.com/excalidraw/excalidraw/issues/1261) and strives to provide a framework-agnostic CLI for **[excalidraw](https://github.com/excalidraw/excalidraw)**.

![demo](https://raw.githubusercontent.com/tommywalkie/excalidraw-cli/master/.github/assets/demo.gif)

_Early concept preview ([test data source]("https://github.com/tommywalkie/excalidraw-cli/blob/master/.github/assets/test.excalidraw"))_ ⤴️

## Install

```bash
npm install -g @tommywalkie/excalidraw-cli
```

## Usage

```bash
$ excalidraw-cli -h
Parses Excalidraw JSON schemas into PNGs

USAGE
  $ excalidraw-cli INPUT [OUTPUT]

ARGUMENTS
  INPUT   Excalidraw file path / directory path
  OUTPUT  [default: ./] Output PNG file path / directory path

OPTIONS
  -h, --help     show CLI help
  -v, --version  show CLI version
```

## How it works ?

`excalidraw-cli` uses **[node-canvas](https://github.com/Automattic/node-canvas)** at its core, this allows to generate canvas without relying on the `window` context, and uses a home-made renderer which tries to _mimic_ Excalidraw's as much as possible, using [**Rough.js**](https://roughjs.com/) API primarily.

Hopefully, `excalidraw-cli` will directly use Excalidraw renderer methods (like [`drawElementOnCanvas()`](https://github.com/excalidraw/excalidraw/blob/046c0818c5b39b78c70646b5f9a1c28f31787694/src/renderer/renderElement.ts#L86-L153)) for consistent results, when they will be exported. 

See the related issue thread [excalidraw#1780](https://github.com/excalidraw/excalidraw/issues/1780).

## Roadmap

**Renderer implementation**

- [x] Display **rectangles**
  - [x] Ability to **rotate** rectangles
- [x] Display **ellipses**
  - [x] Ability to **rotate** ellipses
- [x] Display **lines**
- [x] Display **arrows**
- [x] Display **diamonds**
  - [x] Ability to **rotate** diamonds
- [x] Display **text**
  - [x] **Vigil** font support
  - [x] **Cascadia** font support
  - [ ] Font **ligatures** support
  - [x] Ability to **rotate** text
  - [x] **Multi-line** text support
    - [ ] Ability to **rotate** multi-line text
- [x] Display **drawings**
  - [x] Ability to **rotate** drawings
- [ ] Add **tests**
- [ ] (**_long-term_**) Use **Excalidraw renderer** directly

**CLI**

- [x] Set up initial **oclif** / **TypeScript** based CLI
- [x] Handle **directory** as input
- [x] Handle **single file** as input
- [x] Provide **demo**
- [x] Release as a **NPM** package
- [x] Provide **install** and **usage** guide

**Third-party integrations**
- [ ] Consider releasing a **plugin** for **Rollup**
  - [ ] Provide **install** and **usage** guide
- [ ] Consider releasing a custom **transformer** for **gatsby-remark-embedder**
  - [ ] Provide **install** and **usage** guide

## License

MIT