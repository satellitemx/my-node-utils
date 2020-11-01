# Miscellaneous Utilities 
Sort of like a NodeJS playground. Maybe you'll find something useful. Cheers.

## Duplicate Checker
A script which checks all content inside of given directory and generates sha256 hash for each file. 

### Usage
`node dupe.js <directory>`

### Output
A `dupe.txt` containing all duplicates will be generated in the same directory. 

## BMP Reader
A script which prints some header values of given BMP file.

### Usage
`node bmp-reader.js <input.bmp>`

## EDID Parser (WIP)

A script which parses supplied EDID. 

### Usage
`node edid-parser.js <EDID>`

### How to get EDID

#### Mac

Execute `ioreg -lw0 | grep IODisplayEDID` to get EDIDs for all connected monitors. 

#### Linux

Execute `sudo find /sys | grep -i edid` to get EDID files of all connected monitors. 

#### Windows

Please consult the utility softwares that come with your graphics card driver. 