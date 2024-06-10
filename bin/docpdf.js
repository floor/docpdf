#!/usr/bin/env node

import path from 'path'
import fs from 'fs'
import generate from '../src/generate.js' // Import the generate function

/**
 * The path to the current working directory, which is assumed to be the project root.
 * @type {string}
 */
const projectPath = process.cwd()

/**
 * Default output path where the generated PDF will be saved.
 * @type {string}
 */
let outputPath = path.join(projectPath, 'docs/doc.pdf')

/**
 * Default gitignore file name.
 * @type {string}
 */
let gitignoreFileName = '.gitignore'

/**
 * Path to the configuration file.
 * @type {string}
 */
const configPath = path.join(projectPath, 'docpdf.config.js')

/**
 * Check if docpdf.config.js exists and use its settings if available.
 */
if (fs.existsSync(configPath)) {
  const config = require(configPath)
  if (config.outputPath) {
    outputPath = path.join(projectPath, config.outputPath)
  }
  if (config.gitignoreFileName) {
    gitignoreFileName = config.gitignoreFileName
  }
}

/**
 * Ensure the output directory exists. If it does not exist, create it.
 */
const outputDir = path.dirname(outputPath)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Generate the PDF document using the project path, output path, and gitignore file name.
generate(projectPath, outputPath, gitignoreFileName)
