import assert from 'assert'

const originalPrepareStackTrace = Error.prepareStackTrace

function customPrepareStackTrace(e, stack){
  return stack
}

export default async function test (title, implementation) {

  let location = ''
  let lines = []
  let message = ''

  try {
    await implementation(assert.strict)
  } catch (e) {
    Error.prepareStackTrace = customPrepareStackTrace
    const stack = e.stack;
    location = `${/[^/]*$/.exec(stack[0].getFileName())[0]}:${stack[0].getLineNumber()}`
    Error.prepareStackTrace = originalPrepareStackTrace
    lines = e.toString().split('\n')

    if (lines[0].startsWith('AssertionError [ERR_ASSERTION]: Input A expected to ')) lines.splice(0, 3)

    message = lines.join('\n')
  }

  const didPass = lines.length === 0

  if (process.send) process.send({ didPass, title, location, message })

  return { didPass, title, location, message }
}
