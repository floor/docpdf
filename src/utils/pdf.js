import fs from 'fs'
import path from 'path'
import progress from './progress.js'

/**
 * Adds files to the PDF document, showing the content of each file.
 * @param {object} doc - The PDF document instance.
 * @param {object} fileTree - The file structure object.
 * @param {string} projectPath - The root path of the project.
 * @param {number} currentCount - The current count of processed files.
 * @param {number} totalCount - The total count of files.
 * @param {number} startTime - The start time of the process.
 * @param {string} font - The font to use for the file content.
 * @param {string} numbering - The current numbering prefix.
 * @returns {number} - The updated count of processed files.
 */
const addFilesToPDF = (doc, fileTree, projectPath, currentCount, totalCount, startTime, font = 'Helvetica', numbering = '') => {
  let index = 1
  Object.keys(fileTree).forEach(key => {
    if (typeof fileTree[key] === 'object' && !fileTree[key].path) { // It's a directory
      const currentNumbering = numbering ? `${numbering}.${index}` : `${index}`
      doc.fontSize(14).text(`${currentNumbering} ${key}/`, { destination: `${currentNumbering} ${key}/` })
      currentCount = addFilesToPDF(doc, fileTree[key], projectPath, currentCount, totalCount, startTime, font, currentNumbering)
      index++
    } else if (fileTree[key].path) { // It's a file
      const file = path.join(projectPath, fileTree[key].path)
      if (fs.existsSync(file)) { // Check if file exists
        if (file.endsWith('.js')) {
          doc.addPage()
          doc.fontSize(16).text(fileTree[key].path, { destination: fileTree[key].path })

          try {
            const fileContent = fs.readFileSync(file, 'utf-8')
            doc.font(font).fontSize(10).text(fileContent)
          } catch (err) {
            console.error(`Error reading file ${file}:`, err)
          }

          // Update progress
          progress(++currentCount, totalCount, startTime, fileTree[key].path)
        }
      } else {
        console.error(`File does not exist: ${file}`)
      }
    }
  })
  return currentCount
}

export { addFilesToPDF }
