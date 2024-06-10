import { getFiles, countFiles } from '../src/utils/files.js'
import { getGitignorePatterns } from '../src/utils/pattern.js'
import path from 'path'
import fs from 'fs'

// Mock the filesystem module
jest.mock('fs')

describe('getFiles', () => {
  it('should correctly read and process files', () => {
    // Setup mock filesystem
    fs.readdirSync.mockImplementation((dir) => {
      if (dir === '/test') {
        return ['file1.js', 'file2.txt', 'dir1']
      } else if (dir === '/test/dir1') {
        return ['file3.js']
      }
      return []
    })

    fs.statSync.mockImplementation((filePath) => ({
      isDirectory: () => filePath.endsWith('dir1'),
      size: 1024
    }))

    const files = getFiles('/test')
    expect(files).toEqual({
      'file1.js': { path: 'file1.js', size: '1.00' },
      'file2.txt': { path: 'file2.txt', size: '1.00' },
      dir1: {
        'file3.js': { path: 'dir1/file3.js', size: '1.00' }
      }
    })
  })
})

describe('countFiles', () => {
  it('should correctly count JavaScript files', () => {
    const fileTree = {
      'file1.js': { path: 'file1.js', size: '1.00' },
      'file2.txt': { path: 'file2.txt', size: '1.00' },
      dir1: {
        'file3.js': { path: 'dir1/file3.js', size: '1.00' }
      }
    }

    const count = countFiles(fileTree)
    expect(count).toBe(2)
  })
})

describe('getGitignorePatterns', () => {
  it('should correctly read .gitignore patterns', () => {
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue('node_modules\n*.log\n')

    const patterns = getGitignorePatterns('/test')
    expect(patterns).toEqual(['node_modules', '*.log'])
  })
})
