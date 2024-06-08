#!/usr/bin/env node

import generatePDF from '../src/generatePDF.js'
import path from 'path'
import fs from 'fs'

// Définir le chemin du projet
const projectPath = process.cwd()
const outputPath = path.join(projectPath, 'dist/doc.pdf')

// Assurez-vous que le répertoire de sortie existe
if (!fs.existsSync(path.join(projectPath, 'dist'))) {
  fs.mkdirSync(path.join(projectPath, 'dist'))
}

generatePDF(projectPath, outputPath)
