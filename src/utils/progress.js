import output from './output.js'

// Hide and show terminal cursor
const hideCursor = () => process.stdout.write('\x1B[?25l')
const showCursor = () => process.stdout.write('\x1B[?25h')

let init = false

// Estimate remaining time for the script
const progress = (count, total, startTime, item) => {
  if (count === null) {
    output('\r' + ' '.repeat(100)) // Clear the line
    console.log('')
    showCursor()
    init = false // Reset init flag
    return
  }

  if (!init) {
    hideCursor()
    init = true
  }

  const currentTime = Date.now()
  const elapsedTime = (currentTime - startTime) / 1000
  const estimatedTime = (total / count) * elapsedTime - elapsedTime
  const estimatedMinutes = Math.floor(estimatedTime / 60)
  const estimatedSeconds = Math.floor(estimatedTime % 60).toString().padStart(2, '0')

  const progressBarLength = 30
  const progress = Math.floor((count / total) * progressBarLength)
  const progressBar = '[' + '\x1b[92m' + '▮'.repeat(progress) + '\x1b[0m' + ' '.repeat(progressBarLength - progress) + ']'

  const percent = (count / total * 100).toFixed(2)

  const pad = (num) => num.toLocaleString('en-US').padStart(10, ' ')

  const text = `${pad(count.toLocaleString('en-US'))} / ${total.toLocaleString('en-US')} | ETA: ${estimatedMinutes}m${estimatedSeconds}s | ${percent}% ${progressBar} < ${item}`

  output(text) // Use the output module to update the line
}

export default progress
