/**
 * Adds a title page to a PDF document with the project name, description, generation date, and file counts.
 *
 * @param {object} doc - The PDF document instance to add the title page to.
 * @param {string} projectName - The name of the project.
 * @param {string} projectDescription - A brief description of the project.
 * @param {Date} generationDate - The date when the PDF was generated.
 * @param {object} fileCounts - An object containing counts of files by type.
 * @param {object} fileSizes - An object containing sizes of files by type.
 * @param {number} totalSize - The total size of all files.
 * @param {Array} heaviestFiles - An array of the 10 heaviest files with their paths and sizes.
 */
const addTitlePage = (doc, projectName, projectDescription, generationDate, fileCounts, fileSizes, totalSize, heaviestFiles) => {
  doc.fontSize(48).text(projectName, {
    align: 'center'
  })

  doc.moveDown(1) // Small space between the title and the description
  doc.fontSize(24).text(projectDescription, {
    align: 'center'
  })

  doc.moveDown(1.5) // Small space before the additional info
  doc.fontSize(10).text(`Generated on: ${generationDate.toDateString()}`, {
    align: 'center'
  })

  doc.moveDown(1.5) // Small space before the file counts

  // Create an array of file types sorted by number of files
  const sortedFileTypes = Object.keys(fileCounts).sort((a, b) => fileCounts[b] - fileCounts[a])

  // Add file counts and sizes with the desired format
  doc.fontSize(10) // Reduce font size
  sortedFileTypes.forEach(type => {
    const fileCount = fileCounts[type]
    const fileSize = fileSizes[type]
    const filePercentage = ((fileCount / Object.values(fileCounts).reduce((a, b) => a + b, 0)) * 100).toFixed(2)
    const sizePercentage = ((fileSize / totalSize) * 100).toFixed(2)
    const sizeInKB = Math.round(fileSize).toLocaleString('en-US')

    doc.text(`${fileCount} ${type} files (${filePercentage}%), size: ${sizeInKB} kb (${sizePercentage}%)`, {
      align: 'left'
    })
    doc.moveDown(0.3) // Reduce space between lines
  })

  doc.moveDown(1.5) // Add space before the heaviest files section

  // Add the 10 heaviest files with their paths and sizes
  doc.fontSize(12).text('Top 10 Heaviest Files:', { underline: true })
  doc.moveDown(1)
  doc.fontSize(10) // Set font size for the heaviest files list
  heaviestFiles.forEach(file => {
    const sizeInKB = Math.round(file.size).toLocaleString('en-US')
    doc.text(`${file.path}: ${sizeInKB} kb`, {
      align: 'left'
    })
    doc.moveDown(0.3) // Reduce space between lines
  })

  doc.addPage()
}

export { addTitlePage }
