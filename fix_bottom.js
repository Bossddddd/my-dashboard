const fs = require('fs');
const filePath = 'components/views/TechniciansTab.tsx';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

const badLineIdx = lines.findIndex(l => l.startsWith('}-4 sm:py-4'));

if (badLineIdx !== -1) {
    // Truncate the array right before the bad line
    lines.splice(badLineIdx);
    // Add the closing brace on a new line
    lines.push('}');
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log("Truncated bad lines at end of file!");
} else {
    console.log("Could not find bad line");
}
