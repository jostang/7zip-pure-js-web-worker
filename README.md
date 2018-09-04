# 7zip-pure-js-web-worker
Pure js p7zip port for browser web worker usage created by emscripten project.

Supports only decompressing of files. Encrypted archives (ZipCrypto and AES) are supported.

## Usage
SevenZip.decompress(file: File, password?: string): Promise<File[]>