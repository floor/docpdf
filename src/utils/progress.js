let lastText = ''

const output = (text) => {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  process.stdout.write(text)
  lastText = text
}

process.stdout.on('resize', () => {
  output(lastText)
})

const progress = (current, total) => {
  if (current === null) {
    process.stdout.write('\n')
    return
  }

  const percent = ((current / total) * 100).toFixed(2)
  output(`Progress: ${current}/${total} (${percent}%)`)
}

export default progress
