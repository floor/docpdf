import generate from './generate.js'

const main = () => {
  const projectPath = '../../../../' // Path to the project
  const outputPath = 'dist/doc.pdf' // Output path for the generated PDF
  generate(projectPath, outputPath)
}

main()
