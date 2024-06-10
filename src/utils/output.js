let lastText = ''

/**
 * Outputs text to the terminal, ensuring it fills the current line width and handles resizing.
 *
 * @param {string} text - The text to display on the terminal.
 */
const output = (text) => {
  const columns = process.stdout.columns || 100 // Get the terminal width or default to 100 columns
  const padding = ' '.repeat(Math.max(0, columns - text.length - 1)) // Calculate padding to fill the line
  process.stdout.write('\r\x1b[K') // Move to the beginning of the line and clear it
  process.stdout.write(text + padding) // Write the text with padding
  lastText = text // Save the text to handle terminal resizing
}

// Event listener to handle terminal resize events
process.stdout.on('resize', () => {
  output(lastText) // Re-output the last text to fit the new terminal size
})

export default output
