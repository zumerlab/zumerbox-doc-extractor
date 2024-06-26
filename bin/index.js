#!/usr/bin/env node
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

// Function to ensure the output folder exists
function ensureOutputFolderExists(outputFolderPath) {
  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath, { recursive: true })
  }
}

// Function to extract comments from CSS, SCSS, and JS files
function extractComments(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const comments = []
  let regex
  if (filePath.endsWith('.css') || filePath.endsWith('.scss')) {
    regex = /\/\*!([\s\S]*?)\*\//gm // Comments in CSS and SCSS
  } else if (filePath.endsWith('.js')) {
    regex = /\/\*!([\s\S]*?)\*\//gm // Comments in JS
  } else {
    // Handle other file types here if needed
    console.log(
      chalk.yellow(
        `Ignoring file '${filePath}' as it's not a CSS, SCSS, or JS file.`
      )
    )
    return comments
  }
  let match
  while ((match = regex.exec(fileContent)) !== null) {
    comments.push(match[1])
  }
  if (comments.length === 0) {
    console.log(chalk.yellow(`'${filePath}' doesn't have comments to extract.`)) // Yellow color for no comments found
  }
  return comments
}

// Function to write comments to a Markdown file
function writeCommentsToMarkdown(comments, outputFilePath, sourcePath) {
  ensureOutputFolderExists(path.dirname(outputFilePath)) // Ensure output folder exists
  let markdownContent = ''
  let file = path.basename(sourcePath)
  comments.forEach((comment, index) => {
    markdownContent += `${comment}\n\n`
  })
  if (addSource && publicFolder)
    markdownContent += `**Source:** [${file}](${publicFolder}/${file})\n`
  fs.appendFileSync(outputFilePath, markdownContent, 'utf8')
  if (entrypointScss || consolidatedMd) {
    console.log(chalk.green(`'${file}' added to Markdown file successfully.`)) // Green color for successful file addition
  } else {
    console.log(
      chalk.green(
        `Markdown file '${path.basename(outputFilePath)}' processed successfully.`
      )
    ) // Green color for successful markdown file update
  }
}

// Function to process a single file
function processFile(filePath, outputFolder, consolidatedMd, entrypointScss) {
  const allComments = extractComments(filePath)
  if (allComments.length > 0) {
    const outputFilePath = path.join(
      outputFolder,
      consolidatedMd ?
        outputFilename + '.md'
      : path.basename(filePath, path.extname(filePath)) + '.md'
    )
    writeCommentsToMarkdown(allComments, outputFilePath, filePath)
  }
  // Check for special case: single SCSS file with @imports
  if (entrypointScss && filePath.endsWith('.scss')) {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const regex = /@import\s+(?:"([^"]+)"|'([^']+)');/g
    let match
    const importedFiles = []
    while ((match = regex.exec(fileContent)) !== null) {
      const importedFile = match[1] || match[2]
      const importedFilePath = path.resolve(
        path.dirname(filePath),
        importedFile
      )
      importedFiles.push(importedFilePath)
    }
    if (importedFiles.length > 0) {
      importedFiles.forEach((importedFilePath) => {
        processFile(importedFilePath, outputFolder, true)
      })
    }
  }
}

// Function to process a folder recursively
function processFolder(
  folderPath,
  outputFolder,
  consolidatedMd,
  entrypointScss
) {
  ensureOutputFolderExists(outputFolder) // Ensure output folder exists
  const stat = fs.statSync(folderPath)
  if (stat.isDirectory()) {
    fs.readdirSync(folderPath).forEach((file) => {
      const filePath = path.join(folderPath, file)
      if (fs.statSync(filePath).isDirectory()) {
        processFolder(filePath, outputFolder, consolidatedMd, entrypointScss) // Recursively process subfolders
      } else if (fs.statSync(filePath).isFile()) {
        processFile(filePath, outputFolder, consolidatedMd, entrypointScss)
      }
    })
  } else if (stat.isFile()) {
    processFile(folderPath, outputFolder, consolidatedMd, entrypointScss)
  }
}

// Function to clear the output folder
function clearOutputFolder(outputFolder) {
  if (fs.existsSync(outputFolder)) {
    fs.rmSync(outputFolder, { recursive: true })
  }
}

// Main function
function main(entryPath, outputFolder, consolidatedMd, entrypointScss) {
  if (entryPath === '.' || entryPath === './') {
    console.log(
      chalk.red(
        "Error: Cannot process the current directory ('.'). Please specify a valid entry path."
      )
    ) // Red color for error message
    return
  }
  clearOutputFolder(outputFolder)
  processFolder(entryPath, outputFolder, consolidatedMd, entrypointScss)
}

// Entry point
const args = process.argv.slice(2)
let entryPath
let outputFolder = 'output'
let publicFolder = ''
let outputFilename = 'docs'
let consolidatedMd = true
let entrypointScss = false
let addSource = true

if (args.length < 1) {
  console.log(chalk.red('Please provide an entry path.')) // Red color for error message
  process.exit(1)
}

entryPath = args[0]

// Process command line arguments
for (let i = 1; i < args.length; i++) {
  const arg = args[i]
  switch (arg) {
    case '-folder':
      outputFolder = args[i + 1]
      i++
      break
    case '-public-folder':
      publicFolder = args[i + 1]
      i++
      break
    case '-multiple':
      consolidatedMd = false
      break
    case '-scss-imports':
      entrypointScss = true
      break
    case '-remove-source':
      addSource = false
      break
    case '-output-file':
      outputFilename = args[i + 1]
      i++
      break
    default:
      console.log(chalk.yellow(`Unknown argument: ${arg}`)) // Yellow color for unknown argument
      process.exit(1)
  }
}

main(entryPath, outputFolder, consolidatedMd, entrypointScss)
