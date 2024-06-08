import { getFiles, countFiles } from './utils/file.js'
import { generateTOC } from './utils/toc.js'
import { addFilesToPDF } from './utils/pdf.js'
import PDFDocument from 'pdfkit'
import progress from './utils/progress.js'
import fs from 'fs'

const generatePDF = (projectPath, outputPath) => {
  const fileTree = getFiles(projectPath)
  const totalCount = countFiles(fileTree)

  const doc = new PDFDocument()
  doc.pipe(fs.createWriteStream(outputPath))

  const currentCount = 0
  const startTime = Date.now()

  // Generate Table of Contents
  doc.fontSize(20).text('Table of Contents', { underline: true })
  generateTOC(doc, fileTree)

  doc.addPage()

  addFilesToPDF(doc, fileTree, projectPath, currentCount, totalCount, startTime)

  doc.end()

  // Mark progress as complete
  progress(null, totalCount, startTime, '')
}

export default generatePDF
