/**
 * Generates a Table of Contents (TOC) for a PDF document based on a file tree structure.
 *
 * @param {object} doc - The PDF document instance to add the TOC to.
 * @param {object} fileTree - The hierarchical structure representing files and directories.
 * @param {number} [depth=0] - The current depth in the file tree, used for indentation.
 * @param {string} [numbering=''] - The current numbering prefix for directory entries.
 */
const generateTOC = (doc, fileTree, depth = 0, numbering = '') => {
  const indent = '  '.repeat(depth) // Create an indentation string based on the current depth
  let index = 1

  Object.keys(fileTree).forEach(key => {
    if (typeof fileTree[key] === 'object' && !fileTree[key].path) {
      // It's a directory
      const currentNumbering = numbering ? `${numbering}.${index}` : `${index}`
      doc.fontSize(14).text(`${indent}${currentNumbering} ${key}/`, { destination: `${currentNumbering} ${key}/` })
      generateTOC(doc, fileTree[key], depth + 1, currentNumbering) // Recursive call for directory contents
      index++
    } else if (fileTree[key].path) {
      // It's a file
      doc.fontSize(12).text(`${indent}- ${key}`, { continued: true }) // Indent and add file name with a bullet point
      doc.text(` (${fileTree[key].size} KB)`, { align: 'right', destination: `${key}` }) // Add file size and link
    }
  })
}

export { generateTOC }
