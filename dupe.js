const fs = require("fs")
const crypto = require("crypto")

// A statistics helper class
class Stats {
    constructor() {
        this.hashes = [] // all unique hashes
        this.dupes = [] // all duplicates file paths
        this.pending = 0 // remaining file count added during DFS
        this.started = false // a flag indicating the hashing process has started
        this.dupesFile = fs.createWriteStream("dupe.txt", { encoding: "utf-8" }) // FD of dupe.txt

        // print stat in 30Hz
        setInterval(() => { this.stat() }, 1000 / 30)
    }

    // Receive a new hash
    push(path, hash) {
        if (this.hashes.indexOf(hash) == -1) {
            this.hashes.push(hash)
        } else {
            this.dupes.push(path)
            this.dupesFile.write(`${path}\n`)
        }
    }

    // Log statistics in console
    // Exit program when all works are done
    stat() {
        process.stdout.write(`Progress: ${Math.floor(100 * this.hashes.length / (this.hashes.length + this.pending))}% | Hashed: ${this.hashes.length} | Dupe: ${this.dupes.length} | Pending: ${this.pending}\r`)
        if (this.started && this.pending === 0) {
            console.log();
            process.exit(0)
        }
    }
}

// Walk directory in DFS way
const walkDirectory = path => {
    // console.log(`Walking ${path} ...`)
    fs.readdir(path, { withFileTypes: true }, (err, dirents) => {
        if (err) throw err
        dirents.map(direntChecker(path))
    })
}

// Deal with each dirent
const direntChecker = root => dirent => {
    if (dirent.name.startsWith(".")) return
    const path = `${root}/${dirent.name}`
    if (dirent.isDirectory()) {
        walkDirectory(path)
        return
    }

    // Okay, not a directory, let it be hashed!
    stat.pending += 1
    stat.started = true
    hasher(path)
}

// Hash each file
const hasher = path => {
    const hash = crypto.createHash("sha256")
    const stream = fs.createReadStream(path)

    stream.on("data", data => { hash.update(data) })
    stream.on("end", () => {
        stat.push(path, hash.digest("hex"))
        stat.pending -= 1
        stream.close()
    })
}

// Checking command line argumnets
if (process.argv.length < 3) {
    console.log("Usage: node dupe.js <directory>\n")
    process.exit(1)
}
const root = process.argv[2]

// Loop thru given directory
let stat = new Stats()
walkDirectory(root)