import { getFiles, countFiles, countFilesByType, collectFiles } from './utils/files.js'
import { generateTOC } from './utils/toc.js'
import { addFilesToPDF } from './utils/pdf.js'
import { addTitlePage } from './utils/title.js'
import PDFDocument from 'pdfkit'
import progress from './utils/progress.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Generates a PDF document for a project, including a title page, table of contents, and file contents.
 *
 * @param {string} projectPath - The path to the project directory.
 * @param {string} outputPath - The path where the generated PDF will be saved.
 * @param {string} gitignoreFileName - The name of the .gitignore file to use.
 */
const generate = (projectPath, outputPath, gitignoreFileName = '.gitignore') => {
  const packageJsonPath = path.join(projectPath, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const projectName = packageJson.name
  const projectDescription = packageJson.description

  const fileTree = getFiles(projectPath, {}, projectPath, gitignoreFileName)
  const totalCount = countFiles(fileTree)

  const doc = new PDFDocument()
  doc.pipe(fs.createWriteStream(outputPath))

  // Register the custom font
  doc.registerFont('Courier', path.join(__dirname, 'fonts', 'DejaVuSans.ttf'))

  const startTime = Date.now()
  let currentCount = 0

  // Calculate file counts and sizes by type
  const { fileCounts, fileSizes, totalSize } = countFilesByType(fileTree)

  // Collect all files with their sizes
  const allFiles = collectFiles(fileTree)

  // Sort all files by size and get the top 10 heaviest
  const heaviestFiles = allFiles.sort((a, b) => b.size - a.size).slice(0, 10)

  // Add title page
  addTitlePage(doc, projectName, projectDescription, new Date(startTime), fileCounts, fileSizes, totalSize, heaviestFiles)

  // Generate Table of Contents
  doc.fontSize(20).text('Table of Contents', { underline: true })
  generateTOC(doc, fileTree)

  doc.addPage()

  // Add files to PDF with custom font
  currentCount = addFilesToPDF(doc, fileTree, projectPath, currentCount, totalCount, startTime, 'Courier')

  doc.end()

  // Mark progress as complete
  progress(null, totalCount, startTime, '')
}

export default generate
