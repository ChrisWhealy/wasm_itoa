import { startWasmModule, validateArgs } from "./utils.mjs"

const wasmFilePath = "./bin/itoa.wasm"

let { hexValue, isSigned } = validateArgs(process.argv)

startWasmModule(wasmFilePath)
  .then(({ exports }) => {
    let td = new TextDecoder()
    let [offset, len] = exports.itoa(+hexValue, isSigned)
    let asciiVal = td.decode(exports.memory.buffer.slice(offset, offset + len))

    console.log(`${isSigned ? 'S' : 'Uns'}igned ${hexValue} = ${asciiVal}`)
  })
