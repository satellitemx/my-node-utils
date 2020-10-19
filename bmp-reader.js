const fs = require("fs")

// Helper functions

const checkFileHeader = fd => { // BITMAPFILEHEADER
    fs.read(fd, new Buffer.alloc(14), 0, 14, 0, (err, bytes, buffer) => {
        if (err) throw err
        if (Buffer.from("BM").compare(buffer.slice(0, 2)) !== 0) printUsageAndExit("Invalid BMP file.")

        const rasterDataOffset = buffer.slice(10)
        console.log(`Raster data starts at offset 0x${rasterDataOffset.reverse().toString("hex")}`)
    })
}

const checkInfoHeader = fd => { // BITMAPINFOHEADER
    fs.read(fd, new Buffer.alloc(14 + 40), 0, 14 + 40, 0, (err, bytes, buffer) => {
        if (err) throw err
        buffer = buffer.slice(14)
        const width = buffer.slice(4, 8).readUIntLE(0, 4)
        const height = buffer.slice(8, 12).readUIntLE(0, 4)
        const bitDepth = buffer.slice(14, 16).readUIntLE(0, 2)
        let compression = buffer.slice(16, 20).readUIntLE(0, 4)

        switch (compression) {
            case 0: compression = "No compression"; break
            case 1: compression = "8-bit RLE encoding"; break
            case 2: compression = "4-bit RLE encoding"; break
            default: compression = "Unknown compression"
        }

        console.log(`\nBMP Info\nResolution:\t${width}x${height}\nBit Depth:\t${bitDepth}\nCompression:\t${compression}`)
    })
}

const printUsageAndExit = (optMsg) => {
    if (optMsg) console.log(optMsg)
    console.log("Usage: node bmp-reader.js <file.bmp>")
    process.exit(1)
}

// Check input validity

if (process.argv.length < 3) { // No BMP file supplied
    printUsageAndExit("No BMP file supplied. ")
}

// Read file

const fileName = process.argv[2]
const fileDescriptor = fs.openSync(fileName)

checkFileHeader(fileDescriptor)
checkInfoHeader(fileDescriptor)