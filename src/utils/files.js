import fs from 'fs'
import path from 'path'
import ignore from 'ignore'

/**
 * Checks if a file or directory should be ignored based on the ignore rules.
 * @param {string} filePath - The path of the file or directory to check.
 * @param {Object[]} ignoreRules - The ignore rules to apply.
 * @param {Object} ignoreRules[].ignore - The Ignore instance containing the ignore patterns.
 * @param {string} ignoreRules[].gitignorePath - The path of the corresponding .gitignore file.
 * @returns {boolean} - Returns true if the file or directory should be ignored, false otherwise.
 */
const shouldIgnore = (filePath, ignoreRules) => {
  for (const { ignore, gitignorePath } of ignoreRules) {
    const relativeToGitignore = path.relative(path.dirname(gitignorePath), filePath)
    if (ignore.ignores(relativeToGitignore)) {
      return true
    }
  }
  return false
}

/**
 * Recursively processes a directory and builds the file tree.
 * @param {string} dir - The directory to process.
 * @param {Object} fileTree - The object representing the file tree.
 * @param {string} rootDir - The root directory of the project.
 * @param {string} gitignoreFileName - The name of the .gitignore file.
 * @param {Object[]} ignoreRules - The ignore rules to apply.
 * @param {Set} processedDirs - The set of already processed directories.
 * @returns {void}
 */
const processDirectory = (dir, fileTree, rootDir, gitignoreFileName, ignoreRules, processedDirs) => {
  if (processedDirs.has(dir)) {
    return
  }
  processedDirs.add(dir)

  const gitignorePath = path.join(dir, gitignoreFileName)
  if (fs.existsSync(gitignorePath)) {
    const gitignorePatterns = fs.readFileSync(gitignorePath, 'utf8').split('\n').filter(Boolean)
    const currentIgnoreRule = { ignore: ignore().add(gitignorePatterns), gitignorePath }
    ignoreRules = [...ignoreRules, currentIgnoreRule]
  }

  const files = fs.readdirSync(dir)
  files.forEach(file => {
    const filePath = path.join(dir, file)

    if (shouldIgnore(filePath, ignoreRules)) {
      return
    }

    if (fs.statSync(filePath).isDirectory()) {
      fileTree[file] = {}
      processDirectory(filePath, fileTree[file], rootDir, gitignoreFileName, ignoreRules, processedDirs)
      if (Object.keys(fileTree[file]).length === 0) {
        delete fileTree[file]
      }
    } else if (file !== gitignoreFileName) {
      const relativePath = path.relative(rootDir, filePath)
      const fileSizeInBytes = fs.statSync(filePath).size
      const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2)
      fileTree[file] = { path: relativePath, size: fileSizeInKB }
    }
  })
}

/**
 * Builds the file tree by excluding files and directories specified in the .gitignore files.
 * @param {string} dir - The directory from which to build the file tree.
 * @param {Object} [fileTree={}] - The object representing the file tree.
 * @param {string} [rootDir=dir] - The root directory of the project.
 * @param {string} [gitignoreFileName='.gitignore'] - The name of the .gitignore file.
 * @param {Object[]} [ignoreRules=[]] - The ignore rules to apply.
 * @param {Set} [processedDirs=new Set()] - The set of already processed directories.
 * @returns {Object} - The file tree object.
 */
const getFiles = (dir, fileTree = {}, rootDir = dir, gitignoreFileName = '.gitignore', ignoreRules = [], processedDirs = new Set()) => {
  processDirectory(dir, fileTree, rootDir, gitignoreFileName, ignoreRules, processedDirs)
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
