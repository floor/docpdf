let lastText = ''

const output = (text) => {
  const columns = process.stdout.columns || 100
  const padding = ' '.repeat(Math.max(0, columns - text.length - 1))
  process.stdout.write('\r\x1b[K') // Move to the beginning of the line and clear it
  process.stdout.write(text + padding)
  lastText = text
}

process.stdout.on('resize', () => {
  output(lastText)
})

export default output
