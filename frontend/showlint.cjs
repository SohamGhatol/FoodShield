const fs = require('fs');
let raw = fs.readFileSync('lint.json', 'utf16le');
if(raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1); // strip BOM
let data = JSON.parse(raw);
data.forEach(x => {
    if(x.errorCount > 0) {
        x.messages.forEach(m => console.log(`${x.filePath}:${m.line} -> ${m.message}`));
    }
});
