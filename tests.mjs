import { startWasmModule } from "./utils.mjs"

const wasmFilePath = "./bin/itoa.wasm"
const td = new TextDecoder()

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const hostEnv = {
  "console": {
    "log": (msgId, val) => {
      let msg = `Unknown message id '${msgId}' with value '${val}'`

      switch (msgId) {
        case 0: msg = `is_twos_comp arg = ${!!val}`
          break

        case 1: msg = `senior bit switched on? ${!!val}`
          break

        case 2: msg = `int value after converting out of twos complement ${val}`
          break

        case 3: msg = `minus sign at offset ${val}`
          break

        default:
      }

      console.log(`WASM: ${msg}`)
    }
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const testData = [
  0x00000000, 0x00000001, 0x00000010, 0x00000100,
  0x00001000, 0x00010000, 0x00100000, 0x01000000,
  0x10000000, 0x7FFFFFFF,
  0x80000000, 0x80000001, 0x80000010, 0x80000100,
  0x80001000, 0x80010000, 0x80100000, 0x81000000,
  0x9FFFFFFF, 0xFFFFFFFF,
]
const testDataSigned = new Int32Array(testData)
const testDataUnsigned = new Uint32Array(testData)

const testHandlerFor = (exports, isSigned) => {
  let testType = isSigned ? "Signed" : "Unsigned"

  return (testValue, idx) => {
    let [offset, len] = exports.itoa(testValue, isSigned)
    let asciiVal = td.decode(exports.memory.buffer.slice(offset, offset + len))

    if (asciiVal === `${testValue}`) {
      console.log(`✅ ${testType} test ${idx} passed`)
    } else {
      console.error(`❌ ${testType} test ${idx} failed: Expected ${testValue}, got ${asciiVal}`)
    }
  }
}

startWasmModule(wasmFilePath, hostEnv)
  .then(({ exports }) => {
    let signedTestHandler = testHandlerFor(exports, true)
    let unsignedTestHandler = testHandlerFor(exports, false)

    testDataSigned.map(signedTestHandler)
    testDataUnsigned.map(unsignedTestHandler)
  })
