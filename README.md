# @zumerbox/doc-extractor

DocExtractor is a Node.js script designed to extract comments from CSS, SCSS, and JavaScript files and generate Markdown documentation files. It provides a command-line interface (CLI) for easy usage.

Refer to the [ZumerBox bundle](https://github.com/zumerlab/zumerbox) for more information and tools.

## Installation

```bash
npm install @zumerbox/doc-extractor --save-dev
```

## Usage

To use DocExtractor, run it from the command line with the following syntax:

```bash
npx doc-extractor [entryPath] [options]
```

### Options:

- `[entryPath]`: Path to the entry file, multiple files, or a folder containing the files to extract comments from.

- `-folder [outputFolder]`: Specify the output folder for the generated Markdown files. (Default: 'output')

- `-multiple`: Generate one Markdown file per input file. By default, a consolidated Markdown file named 'docs.md' will be created.

- `-scss-imports`: Include this flag to process SCSS files with `@import` statements. It will extract comments from imported files as well.

### Example:

Extract comments from a single file:

```bash
npx doc-extractor index.js
```

Extract comments from multiple files:

```bash
npx doc-extractor src -multiple
```

Generate documentation for SCSS files with imports:

```bash
npx doc-extractor styles/main.scss -scss-imports
```
