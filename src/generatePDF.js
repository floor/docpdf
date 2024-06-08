import fs from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'
import progress from './utils/progress.js'
import { getFiles, countFiles } from './utils/file.js'

const generateTOC = (doc, fileTree, depth = 0, numbering = '') => {
  const indent = '  '.repeat(depth)
  let index = 1
  Object.keys(fileTree).forEach(key => {
    const currentNumbering = numbering ? `${numbering}.${index}` : `${index}`
    if (typeof fileTree[key].path === 'string') {
      doc.fontSize(12).text(`${indent}- ${key}`, { continued: true })
      doc.text(` (${fileTree[key].size} KB)`, { align: 'right', destination: `${key}` })
    } else {
      doc.fontSize(14).text(`${indent}${currentNumbering} ${key}/`, { destination: `${currentNumbering} ${key}/` })
      generateTOC(doc, fileTree[key], depth + 1, currentNumbering)
    }
    index++
  })
}

const generatePDF = (projectPath, outputPath) => {
  const fileTree = getFiles(projectPath)
  const totalCount = countFiles(fileTree)

  const doc = new PDFDocument()
  doc.pipe(fs.createWriteStream(outputPath))

  let currentCount = 0

  // Generate Table of Contents
  doc.fontSize(20).text('Table of Contents', { underline: true })
  generateTOC(doc, fileTree)

  doc.addPage()

  const addFilesToPDF = (fileTree, numbering = '') => {
    let index = 1
    Object.keys(fileTree).forEach(key => {
      const currentNumbering = numbering ? `${numbering}.${index}` : `${index}`
      if (typeof fileTree[key].path === 'string') {
        const file = path.join(projectPath, fileTree[key].path)
        if (file.endsWith('.js')) {
          doc.addPage()
          doc.fontSize(16).text(fileTree[key].path, { destination: fileTree[key].path })

          try {
            const fileContent = fs.readFileSync(file, 'utf-8')
            doc.fontSize(10).text(fileContent)
          } catch (err) {
            console.error(`Error reading file ${file}:`, err)
          }

          // Update progress
          progress(++currentCount, totalCount)
        }
      } else {
        doc.fontSize(14).text(`${currentNumbering} ${key}/`, { destination: `${currentNumbering} ${key}/` })
        addFilesToPDF(fileTree[key], currentNumbering)
      }
      index++
    })
  }

  addFilesToPDF(fileTree)

  doc.end()

  // Mark progress as complete
  progress(null)
}

export default generatePDF
