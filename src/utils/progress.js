import output from './output.js'

// Hide and show terminal cursor using ANSI escape codes
const hideCursor = () => process.stdout.write('\x1B[?25l')
const showCursor = () => process.stdout.write('\x1B[?25h')

let init = false

/**
 * Updates and displays a progress bar in the terminal, estimating remaining time.
 *
 * @param {number|null} count - The current count of processed items, or null to reset.
 * @param {number} total - The total number of items to be processed.
 * @param {number} startTime - The timestamp when the processing started.
 * @param {string} item - A description of the current item being processed.
 */
const progress = (count, total, startTime, item) => {
  if (count === null) {
    // Clear the line and reset cursor visibility and initialization flag
    output('\r' + ' '.repeat(100)) // Clear the line
    console.log('') // Move to a new line
    showCursor()
    init = false // Reset init flag
    return
  }

  if (!init) {
    hideCursor() // Hide cursor when initializing
    init = true
  }

  const currentTime = Date.now()
  const elapsedTime = (currentTime - startTime) / 1000 // Elapsed time in seconds
  const estimatedTime = (total / count) * elapsedTime - elapsedTime // Estimate remaining time in seconds
  const estimatedMinutes = Math.floor(estimatedTime / 60) // Convert remaining time to minutes
  const estimatedSeconds = Math.floor(estimatedTime % 60).toString().padStart(2, '0') // Convert remaining seconds and pad with leading zero

  const progressBarLength = 30
  const progress = Math.floor((count / total) * progressBarLength) // Calculate progress bar length
  const progressBar = '[' + '\x1b[92m' + '▮'.repeat(progress) + '\x1b[0m' + ' '.repeat(progressBarLength - progress) + ']' // Create progress bar

  const percent = (count / total * 100).toFixed(2) // Calculate percentage completed

  const pad = (num) => num.toLocaleString('en-US').padStart(10, ' ') // Function to pad numbers for alignment

  const text = `${pad(count.toLocaleString('en-US'))} / ${total.toLocaleString('en-US')} | ETA: ${estimatedMinutes}m${estimatedSeconds}s | ${percent}% ${progressBar} < ${item}`

  output(text) // Use the output module to update the line with progress information
}

export default progress
