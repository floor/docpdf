/**
 * Generates a Table of Contents (TOC) for the given file structure.
 * @param {object} doc - The PDF document instance.
 * @param {object} fileTree - The file structure object.
 * @param {number} depth - The current depth in the directory structure (used for indentation).
 * @param {string} numbering - The current numbering prefix.
 */
const generateTOC = (doc, fileTree, depth = 0, numbering = '') => {
  const indent = '  '.repeat(depth)
  const files = []
  const folders = []
  let folderIndex = 1

  // Separate files and folders
  Object.keys(fileTree).forEach(key => {
    if (typeof fileTree[key].path === 'string') {
      files.push(key)
    } else {
      folders.push(key)
    }
  })

  // Prepare file entries for a single line display
  const fileEntries = files.map(key => `${key} (${fileTree[key].size} KB)`).join(', ')

  // Display files first without numbering, on a single line
  if (fileEntries) {
    doc.fontSize(9).text(`${indent} ${fileEntries}`)
  }

  // Display folders with numbering
  folders.forEach(key => {
    const currentNumbering = numbering ? `${numbering}.${folderIndex}` : `${folderIndex}`
    doc.fontSize(14).text(`${indent}${currentNumbering} ${key}/`, { destination: `${currentNumbering} ${key}/` })
    generateTOC(doc, fileTree[key], depth + 1, currentNumbering)
    folderIndex++
  })
}

export { generateTOC }
