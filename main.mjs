import {
  startWasmModule,
  validateArgs,
} from "./utils.mjs"

const td = new TextDecoder()
const wasmFilePath = "./bin/itoa.wasm"

const printResult = (hexValue, isSigned, buff) =>
  console.log(`${isSigned ? 'S' : 'Uns'}igned ${hexValue} = ${td.decode(buff)}`)

let { hexValue, isSigned } = validateArgs(process.argv)

startWasmModule(wasmFilePath)
  .then(
    ({ exports }) => {
      let [offset, len] = exports.itoa(+hexValue, isSigned)
      printResult(hexValue, isSigned, exports.memory.buffer.slice(offset, offset + len))
    }
  )
