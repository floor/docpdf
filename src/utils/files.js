import fs from 'fs'
import path from 'path'
import ignore from 'ignore'
import { getGitignorePatterns } from './pattern.js'

/**
 * Recursively retrieves files and directories while respecting .gitignore patterns.
 * @param {string} dir - Directory to process.
 * @param {Object} fileTree - Object to store file structure.
 * @param {string} rootDir - Root directory for relative paths.
 * @param {string} gitignoreFileName - The name of the .gitignore file to use.
 * @param {Array} ignoreStack - Stack to maintain ignore instances for directory levels.
 * @param {Set} processedDirs - Set to track processed directories.
 * @returns {Object} - Object representing the file structure.
 */
const getFiles = (dir, fileTree = {}, rootDir = dir, gitignoreFileName = '.gitignore', ignoreStack = [], processedDirs = new Set()) => {
  if (ignoreStack.length === 0) {
    // Initialize the ignore stack with patterns from the root directory
    const rootGitignorePatterns = getGitignorePatterns(rootDir, gitignoreFileName)
    ignoreStack.push(ignore().add(rootGitignorePatterns).add('.*')) // Ignore dot files and folders
  }

  if (processedDirs.has(dir)) {
    return fileTree
  }
  processedDirs.add(dir)

  const currentIgnore = ignoreStack[ignoreStack.length - 1]

  // Load .gitignore patterns from the current directory and add them to the current ignore instance
  const gitignorePatterns = getGitignorePatterns(dir, gitignoreFileName)
  if (gitignorePatterns.length > 0) {
    const newIgnore = ignore().add(currentIgnore._rules).add(gitignorePatterns)
    ignoreStack.push(newIgnore)
  } else {
    ignoreStack.push(currentIgnore)
  }

  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const relativePath = path.relative(rootDir, filePath)

    if (currentIgnore.ignores(relativePath)) {
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

  ignoreStack.pop()

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

/**
 * Recursively counts files and sizes by type in the given file structure.
 * @param {Object} fileTree - Object representing the file structure.
 * @returns {Object} - An object containing file counts, file sizes, and total size.
 */
const countFilesByType = (fileTree) => {
  const fileCounts = {}
  const fileSizes = {}
  let totalSize = 0

  const countFiles = (fileTree) => {
    Object.keys(fileTree).forEach(key => {
      if (typeof fileTree[key].path === 'string') {
        const ext = path.extname(fileTree[key].path)
        const size = parseFloat(fileTree[key].size)

        if (!fileCounts[ext]) {
          fileCounts[ext] = 0
          fileSizes[ext] = 0
        }

        fileCounts[ext] += 1
        fileSizes[ext] += size
        totalSize += size
      } else {
        countFiles(fileTree[key])
      }
    })
  }

  countFiles(fileTree)
  return { fileCounts, fileSizes, totalSize }
}

/**
 * Collects all files with their sizes from the given file structure.
 * @param {Object} fileTree - Object representing the file structure.
 * @returns {Array} - An array of objects containing file paths and sizes.
 */
const collectFiles = (fileTree) => {
  const allFiles = []
  const collect = (fileTree) => {
    Object.keys(fileTree).forEach(key => {
      if (typeof fileTree[key].path === 'string') {
        allFiles.push({
          path: fileTree[key].path,
          size: parseFloat(fileTree[key].size)
        })
      } else {
        collect(fileTree[key])
      }
    })
  }
  collect(fileTree)
  return allFiles
}

export { getFiles, countFiles, countFilesByType, collectFiles }
