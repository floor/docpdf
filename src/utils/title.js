/**
 * Adds a title page to a PDF document with the project name and description.
 *
 * @param {object} doc - The PDF document instance to add the title page to.
 * @param {string} projectName - The name of the project.
 * @param {string} projectDescription - A brief description of the project.
 */
const addTitlePage = (doc, projectName, projectDescription) => {
  doc.fontSize(48).text(projectName, {
    align: 'center', // Center the project name horizontally
    valign: 'center' // Center the project name vertically (requires PDFKit v0.11.0+)
  })

  doc.moveDown() // Move down to separate the title and the description
  doc.fontSize(24).text(projectDescription, {
    align: 'center', // Center the project description horizontally
    valign: 'center' // Center the project description vertically (requires PDFKit v0.11.0+)
  })

  doc.addPage() // Add a new page after the title page
}

export { addTitlePage }
