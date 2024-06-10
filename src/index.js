import generate from './generate.js'
import fs from 'fs'
import path from 'path'

/**
 * Main function to generate a PDF document for a project.
 */
const main = () => {
  const projectPath = '../../../../' // Path to the project

  // Default configuration values
  let gitignoreFileName = '.gitignore'
  let outputPath = 'dist/doc.pdf'

  // Check if docpdf.config.js exists
  const configPath = path.join(projectPath, 'docpdf.config.js')
  if (fs.existsSync(configPath)) {
    const config = require(configPath)
    gitignoreFileName = config.gitignoreFileName || gitignoreFileName
    outputPath = config.outputPath || outputPath
  }

  generate(projectPath, outputPath, gitignoreFileName)
}

main()
