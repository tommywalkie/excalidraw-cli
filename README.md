# excalidraw-cli
Unofficial experimental Excalidraw CLI tool.

Parses Excalidraw JSON schemas (`*.excalidraw`) into PNG images (`*.excalidraw.png`).

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
  $ excalidraw-cli [INPUT] [OUTPUT]

ARGUMENTS
  INPUT   Excalidraw file path / directory path
  OUTPUT  Output PNG file path / directory path

OPTIONS
  -h, --help     show CLI help
  -v, --version  show CLI version
```

## How it works ?

Excalidraw is based on [**Rough.js**](https://roughjs.com/), and internally uses **TypeScript** and **React** to render diagrams. Most of its renderer methods and constants are not exported _yet_ (like [`drawElementOnCanvas()`](https://github.com/excalidraw/excalidraw/blob/046c0818c5b39b78c70646b5f9a1c28f31787694/src/renderer/renderElement.ts#L86-L153)) and rely on the `window` context, which is not usable outside a browser.

To tackle this issue temporarily, `excalidraw-cli` uses **[node-canvas](https://github.com/Automattic/node-canvas)** at its core to generate canvas from Excalidraw JSON schemas (`*.excalidraw`), using a home-made renderer which tries to _mimic_ Excalidraw's as much as possible, using [**Rough.js**](https://roughjs.com/) API primarily, and finally export as PNG images (`*.excalidraw.png`).

Hopefully, `excalidraw-cli` will use Excalidraw renderer methods and constants directly once they are exported by Excalidraw and be able to bring node-canvas' `canvas` context.

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
  - [x] Ability to **rotate** text around itself
- [x] Display **drawings**
  - [x] Ability to **rotate** drawings
- [ ] Add **tests**
- [ ] (**_long-term_**) Use Excalidraw renderer **methods** and **constants** directly

**CLI**

- [x] Set up initial **oclif** / **TypeScript** based CLI
- [x] Handle **directory** as input
- [x] Handle **single file** as input
- [x] Provide **demo**
- [x] Release as a **NPM** package
- [x] Provide better **install** guide
- [ ] Provide better **usage** guide

## License

MIT