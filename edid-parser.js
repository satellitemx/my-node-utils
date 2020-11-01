// Check if edid supplied in commandline
if (process.argv.length === 3) {
    EDID = Buffer.from(process.argv[2], "hex")
} else {
    console.log("Usage: node edid-parser.js <EDID>")
    process.exit(1)
}

// Validate EDID
const validateEDID = data => {
    const sum = EDID.reduce((cur, sum) => sum += cur, 0)
    if (sum % 256 !== 0) {
        console.log("Invalid EDID. ")
        process.exit(1)
    }
}
validateEDID()

const Information = {
    digital: null
}

// EDID 1.4 format from https://en.wikipedia.org/wiki/Extended_Display_Identification_Data

// Helper functions

const pad = num => String(num).padStart(8, "0") // https://stackoverflow.com/questions/2998784/how-to-output-numbers-with-leading-zeros-in-javascript

const getManDate = data => {
    return `Week ${data[0]}, ${1990 + data[1]}`
}

const getEDIDVersion = data => {
    switch (data) {
        case 1: return "1.3/1.4"
        default: return "Unknown"
    }
}

const getEDIDRevision = data => {
    switch (data) {
        case 3: return "1.3"
        case 4: return "1.4"
        default: return "Unknown"
    }
}

const getVideoInput = data => {
    const bits = pad(data.toString(2))
    if (bits[0] === 0) {
        Information.digital = false
        return "Analogue, detail not available yet. "
    }
    Information.digital = true
    const bitDepth = getBitDepth(bits.slice(1, 4))
    const input = getInputInterface(bits.slice(4, 8))

    return `${input}\nBit Depth\t\t${bitDepth}`
}

const getBitDepth = bits => {
    switch (bits) {
        case "000": return "Undefined"
        case "001": return "6-bit"
        case "010": return "8-bit"
        case "011": return "10-bit"
        case "100": return "12-bit"
        case "101": return "14-bit"
        case "110": return "16-bit"
        case "111": return "Reserved"
        default: return "Unknown"
    }
}

const getInputInterface = bits => {
    switch (bits) {
        case "0000": return "Undefined"
        case "0010": return "HDMIa"
        case "0011": return "HDMIb"
        case "0100": return "MDDI"
        case "0101": return "DisplayPort"
        default: return "Unknown"
    }
}

const calcGamma = data => {
    return (data + 100) / 100
}

const getSupportedFeatures = data => {
    const bits = pad(data.toString(2))

    return `
    DPMS Standby: \t${bits[0] === 1}
    DPMS Suspend: \t${bits[1] === 1}
    DPMS Active-off: \t${bits[2] === 1}
    Display Type: \t${getDisplayType(bits.slice(3, 5))}
    sRGB Colour Space: \t${bits[5] === 1}`
}

const getDisplayType = bits => {
    if (Information.digital) {
        switch (bits) {
            case "00": return "RGB 4:4:4"
            case "01": return "RGB 4:4:4 + YCrCb 4:4:4"
            case "10": return "RGB 4:4:4 + YCrCb 4:2:2"
            case "11": return "RGB 4:4:4 + YCrCb 4:4:4 + YCrCb 4:2:2"
        }
    } else {
        switch (bits) {
            case "00": return "monochrome or grayscale"
            case "01": return "RGB colour"
            case "10": return "non-RGB colour"
            case "11": return "Undefined"
        }
    }
}

const CommonTimings = ["720×400 @ 70 Hz (VGA)"
    , "720×400 @ 88 Hz (XGA)"
    , "640×480 @ 60 Hz (VGA)"
    , "640×480 @ 67 Hz (Apple Macintosh II)"
    , "640×480 @ 72 Hz"
    , "640×480 @ 75 Hz"
    , "800×600 @ 56 Hz"
    , "800×600 @ 60 Hz"
    , "800×600 @ 72 Hz"
    , "800×600 @ 75 Hz"
    , "832×624 @ 75 Hz (Apple Macintosh II)"
    , "1024×768 @ 87 Hz, interlaced (1024×768i)"
    , "1024×768 @ 60 Hz"
    , "1024×768 @ 70 Hz"
    , "1024×768 @ 75 Hz"
    , "1280×1024 @ 75 Hz"
    , "1152x870 @ 75 Hz (Apple Macintosh II)"
    , "Other manufacturer-specific display modes"]

const getCommonTimings = data => {
    const bits = data.reduce((sum, cur) => sum + pad(cur.toString(2)), "")
    const supportedTimings = []
    for (let i = 0; i < bits.length; i++) {
        if (bits[i] === "1") supportedTimings.push(CommonTimings[i])
    }
    return supportedTimings.length === 0 ? "\tNot found" : "\n" + supportedTimings.map(timing => `  - ${timing}`).join("\n")
}

console.log(`
Vendor ID: \t\t${EDID.slice(8, 10).toString("hex")}
Product ID: \t\t${EDID.slice(10, 12).reverse().toString("hex")}
Manufacture Date: \t${getManDate(EDID.slice(16, 18))}
EDID Version: \t\t${getEDIDVersion(EDID[18])}
EDID Revision: \t\t${getEDIDRevision(EDID[19])}
Video Interface: \t${getVideoInput(EDID[20])}
Screen Size: \t\t${EDID[21]}✕${EDID[22]} cm
Gamma (Computer): \t${calcGamma(EDID[23])}
Supported Features: ${getSupportedFeatures(EDID[24])}
Common Timings: ${getCommonTimings(EDID.slice(35, 38))}
`)