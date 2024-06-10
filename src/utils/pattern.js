import fs from 'fs'
import path from 'path'

/**
 * Reads and returns the patterns from a specified .gitignore file in the directory.
 *
 * @param {string} dir - The directory to look for the .gitignore file.
 * @param {string} gitignoreFileName - The name of the .gitignore file to use.
 * @returns {string[]} An array of patterns found in the .gitignore file.
 */
const getGitignorePatterns = (dir, gitignoreFileName) => {
  const gitignorePath = path.join(dir, gitignoreFileName)
  if (!fs.existsSync(gitignorePath)) {
    return []
  }

  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
  return gitignoreContent
    .split('\n')
    .filter(pattern => pattern.trim() !== '' && !pattern.startsWith('#'))
}

export { getGitignorePatterns }
