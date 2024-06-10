import fs from 'fs'
import path from 'path'
import ignore from 'ignore'
import { getGitignorePatterns } from './pattern.js'

/**
 * Recursively retrieves files and directories while respecting .gitignore patterns.
 * @param {string} dir - Directory to process.
 * @param {Object} fileTree - Object to store file structure.
 * @param {string} rootDir - Root directory for relative paths.
 * @param {Array} ignoreStack - Stack to maintain ignore instances for directory levels.
 * @param {Set} processedDirs - Set to track processed directories.
 * @param {string} gitignoreFileName - The name of the .gitignore file to use.
 * @returns {Object} - Object representing the file structure.
 */
const getFiles = (dir, fileTree = {}, rootDir = dir, gitignoreFileName = '.gitignore', ignoreStack = [ignore()], processedDirs = new Set()) => {
  // console.log(`Processing directory: ${dir}`)

  if (processedDirs.has(dir)) {
    // console.log(`Already processed directory: ${dir}`)
    return fileTree
  }
  processedDirs.add(dir)

  const gitignorePatterns = getGitignorePatterns(dir, gitignoreFileName)
  if (gitignorePatterns.length > 0) {
    const newIgnore = ignore().add(gitignorePatterns).add('.*')
    ignoreStack.push(newIgnore)
  }

  const currentIgnore = ignoreStack[ignoreStack.length - 1]
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const relativePath = path.relative(rootDir, filePath)

    if (currentIgnore.ignores(relativePath)) {
      // console.log(`Ignoring file: ${relativePath}`)
      return
    }

    if (fs.statSync(filePath).isDirectory()) {
      fileTree[file] = {}
      getFiles(filePath, fileTree[file], rootDir, gitignoreFileName, ignoreStack, processedDirs)
    } else {
      const fileSizeInBytes = fs.statSync(filePath).size
      const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2)
      fileTree[file] = { path: relativePath, size: fileSizeInKB }
    }
  })

  if (gitignorePatterns.length > 0) {
    ignoreStack.pop()
  }

  return fileTree
}

/**
 * Recursively counts JavaScript files in the given file structure.
 * @param {Object} fileTree - Object representing the file structure.
 * @returns {number} - Count of JavaScript files.
 */
const countFiles = (fileTree) => {
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

export { getFiles, countFiles }
