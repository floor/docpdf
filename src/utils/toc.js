const generateTOC = (doc, fileTree, depth = 0, numbering = '') => {
  const indent = '  '.repeat(depth)
  let index = 1
  Object.keys(fileTree).forEach(key => {
    if (typeof fileTree[key] === 'object' && !fileTree[key].path) { // It's a directory
      const currentNumbering = numbering ? `${numbering}.${index}` : `${index}`
      doc.fontSize(14).text(`${indent}${currentNumbering} ${key}/`, { destination: `${currentNumbering} ${key}/` })
      generateTOC(doc, fileTree[key], depth + 1, currentNumbering)
      index++
    } else if (fileTree[key].path) { // It's a file
      doc.fontSize(12).text(`${indent}- ${key}`, { continued: true })
      doc.text(` (${fileTree[key].size} KB)`, { align: 'right', destination: `${key}` })
    }
  })
}

export { generateTOC }
