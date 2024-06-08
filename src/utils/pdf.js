import fs from 'fs'
import path from 'path'
import progress from './progress.js'

const addFilesToPDF = (doc, fileTree, projectPath, currentCount, totalCount, startTime, numbering = '') => {
  let index = 1
  Object.keys(fileTree).forEach(key => {
    if (typeof fileTree[key] === 'object' && !fileTree[key].path) { // It's a directory
      const currentNumbering = numbering ? `${numbering}.${index}` : `${index}`
      doc.fontSize(14).text(`${currentNumbering} ${key}/`, { destination: `${currentNumbering} ${key}/` })
      currentCount = addFilesToPDF(doc, fileTree[key], projectPath, currentCount, totalCount, startTime, currentNumbering)
      index++
    } else if (fileTree[key].path) { // It's a file
      const file = path.join(projectPath, fileTree[key].path)
      if (fs.existsSync(file)) { // Check if file exists
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
