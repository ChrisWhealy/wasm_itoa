import { readFileSync } from "fs"

const abortWithErrMsg = errMsg => {
  console.error(errMsg)
  process.exit(1)
}

const abortWithUsage = () => abortWithErrMsg("Usage: node main.js 0x<32-bit value> <isSigned?: Boolean = false>")
const abortWithInvalidArg2 = badArg => abortWithErrMsg(`Error: Bad value '${badArg}'. Please specify a value in 32-bit hexadecimal notation 0x00000000`)
const abortWithInvalidArg3 = badArg => abortWithErrMsg(`Error: Bad value '${badArg}'. If specified, the 3rd argument must be either 'true' or 'false'`)

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export const startWasmModule =
  async (pathToWasmFile, hostEnv) => {
    // Fetch the WASM module and instantiate
    let wasmObj = await WebAssembly.instantiate(readFileSync(pathToWasmFile), hostEnv)
    return wasmObj.instance
  }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export const validateArgs = args => {
  if (args.length < 3) {
    abortWithUsage()
  }

  // Does the 2nd argument represent a valid hex number?
  let hexValue = args[2]

  if (hexValue.length === 10 && hexValue.startsWith('0x') && !isNaN(+hexValue)) {
  } else {
    abortWithInvalidArg2(hexValue)
  }

  // If a 3rd argument is present, it must be a Boolean
  let isSigned = false

  if (args.length > 3 && args[3] !== 'true' && args[3] !== 'false') {
    abortWithInvalidArg3(args[3])
  } else {
    isSigned = args[3] === 'true'
  }

  return {
    hexValue,
    isSigned
  }
}
