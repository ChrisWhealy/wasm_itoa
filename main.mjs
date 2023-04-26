import { readFileSync } from "fs"

const wasmFilePath = "./bin/itoa.wasm"

const u8AsChar = u8 => u8 > 31 ? String.fromCharCode(u8) : "⚬"

const binToHexStr = len => val => val.toString(16).padStart(len >>> 2, "0")
const i32AsHexStr = binToHexStr(32)

const hostEnv = {
  "console": {
    "log": (msgId, val) => {
      let msg = `Unknown message id with value '${val}'`

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

      console.log(`WASM Log: ${msg}`)
    }
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const startWasmModule =
  async pathToWasmFile => {
    // Fetch the WASM module and instantiate
    let wasmObj = await WebAssembly.instantiate(readFileSync(pathToWasmFile), hostEnv)
    return wasmObj.instance
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

startWasmModule(wasmFilePath)
  .then(({ exports }) => {
    let td = new TextDecoder()
    let testNum = 0

    // Test signed values
    testDataSigned.map(signedValue => {
      let [offset, len] = exports.itoa(signedValue, true)
      let asciiVal = td.decode(exports.memory.buffer.slice(offset, offset + len))

      if (asciiVal === `${signedValue}`) {
        console.log(`✅ Test ${testNum} passed`)
      } else {
        console.error(`❌ Test ${testNum} failed: Expected signed value ${signedValue}, got ${asciiVal}`)
      }

      testNum++
    })

    // Test unsigned values
    testDataUnsigned.map(unsignedValue => {
      let [offset, len] = exports.itoa(unsignedValue, false)
      let asciiVal = td.decode(exports.memory.buffer.slice(offset, offset + len))

      if (asciiVal === `${unsignedValue}`) {
        console.log(`✅ Test ${testNum} passed`)
      } else {
        console.error(`❌ Test ${testNum} failed: Expected unsigned value ${unsignedValue}, got ${asciiVal}`)
      }

      testNum++
    })
  })
