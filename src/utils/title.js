const addTitlePage = (doc, projectName, projectDescription) => {
  doc.fontSize(48).text(projectName, {
    align: 'center',
    valign: 'center'
  })

  doc.moveDown() // Move down to separate the title and the description
  doc.fontSize(24).text(projectDescription, {
    align: 'center',
    valign: 'center'
  })

  doc.addPage()
}

export { addTitlePage }
