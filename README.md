# Integer to ASCII Conversion in WebAssembly Text

This simple WebAssembly Text program takes a 32-bit integer (signed or unsigned) and returns its value as an ASCII string

## Usage

It is assumed that you already have the [WebAssembly Binary Toolkit](https://github.com/WebAssembly/wabt) installed

Clone repo

```bash
git clone https://github.com/ChrisWhealy/wasm_itoa
```

Build

```bash
cd ./wasm_itoa
npm run build
```

Run tests

```bash
npm run tests
```

Run with a 32-bit value

```bash
node main.mjs 0x01020304
Unsigned 0x01020304 = 16909060

node main.mjs 0xFFFFFFFF
Unsigned 0xFFFFFFFF = 4294967295

node main.mjs 0xFFFFFFFF true
Signed 0xFFFFFFFF = -1
```
