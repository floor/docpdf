import fs from 'fs'
import path from 'path'

export const getFiles = (dir, fileTree = {}) => {
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const relativePath = path.relative(dir, filePath)

    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git' && file !== '.gitlab' && file !== 'config' && file !== 'log' && file !== '.DS_Store') {
        fileTree[file] = getFiles(filePath, fileTree[file] || {})
      }
    } else {
      const fileSizeInBytes = fs.statSync(filePath).size
      const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2)
      fileTree[file] = { path: relativePath, size: fileSizeInKB }
    }
  })

  return fileTree
}

export const countFiles = (fileTree) => {
  let count = 0
  Object.keys(fileTree).forEach(key => {
    if (typeof fileTree[key].path === 'string') {
      if (fileTree[key].path.endsWith('.js')) {
        count += 1
      }
    } else {
      count += countFiles(fileTree[key])
    }
  })
  return count
}
