window.API_1484_11 = new Scorm2004API();

window.API = new Scorm12API()

window.API_1484_11.on('Initialize', () => {
  console.log('SCORM Package was initialized')
})

window.API_1484_11.on('GetValue.cmi.completion_status', (content) => {
  console.log('Scorm package requesting value for ' + content)
  return 'completed'
})

window.API_1484_11.on('SetValue.cmi.completion_status', (content, value) => {
  console.log('Scorm package setting value for ' + content + ' as ' + value)
  // return 'completed'
})