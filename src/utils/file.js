import fs from 'fs'
import path from 'path'
import ignore from 'ignore'

let refPath = ''
let mainIg = null

const getGitignorePatterns = (dir) => {
  const gitignorePath = path.join(dir, '.gitignore')
  if (!fs.existsSync(gitignorePath)) {
    return []
  }

  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
  return gitignoreContent.split('\n').filter(pattern => pattern.trim() !== '' && !pattern.startsWith('#'))
}

const getFiles = (dir, fileTree = {}, rootDir = dir, ig = ignore(), level = 0) => {
  // Read .gitignore patterns for the current directory
  const gitignorePatterns = getGitignorePatterns(dir)

  if (gitignorePatterns.length > 1) {
    // if there is a .gitignore define the refPath
    // console.log(gitignorePatterns)
    refPath = path.relative(rootDir, dir)
    ig = ignore()
    ig.add(gitignorePatterns)
    ig.add('.*') // Ignore dot files and folders

    if (!mainIg) mainIg = ig
  }

  // Debugging: Log patterns being added
  // console.log(`Applying .gitignore patterns from ${dir}:`, gitignorePatterns)

  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const relativePath = path.relative(rootDir, filePath)

    let pattern = path.relative(refPath, relativePath)

    if (pattern.startsWith('../')) {
      ig = mainIg
      refPath = ''
      pattern = relativePath
    }

    // if (level < 2) { console.log('pattern', pattern) }

    // Check if the pattern path should be ignored
    if (ig.ignores(pattern)) {
      // if (level < 2) { console.log('-- ignore', pattern) }
      return
    }

    if (fs.statSync(filePath).isDirectory()) {
      fileTree[file] = getFiles(filePath, fileTree[file] || {}, rootDir, ig, level + 1)
    } else {
      const fileSizeInBytes = fs.statSync(filePath).size
      const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2)
      fileTree[file] = { path: relativePath, size: fileSizeInKB }
    }
  })

  return fileTree
}

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

export { getFiles, countFiles, getGitignorePatterns }
