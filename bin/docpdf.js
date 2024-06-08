#!/usr/bin/env node

import generate from '../src/generate.js'
import path from 'path'
import fs from 'fs'

// Définir le chemin du projet
const projectPath = process.cwd()
const outputPath = path.join(projectPath, 'dist/doc.pdf')

// Assurez-vous que le répertoire de sortie existe
if (!fs.existsSync(path.join(projectPath, 'dist'))) {
  fs.mkdirSync(path.join(projectPath, 'dist'))
}

generate(projectPath, outputPath)
