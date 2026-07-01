const fs = require('fs');
const filePath = 'components/views/TechniciansTab.tsx';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Find the line that starts with "      } catch {"
const catchLineIdx = lines.findIndex(l => l.includes('      } catch {'));

if (catchLineIdx !== -1) {
    // The next line is the broken toast.error
    // We will replace it with the correct closing blocks
    lines[catchLineIdx + 1] = '        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล", { id: toastId });';
    
    // Insert the missing closing braces
    lines.splice(catchLineIdx + 2, 0, '        setIsPrinting(false);', '      }', '    };', '', '    return (');
    
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log("Fixed!");
} else {
    console.log("Could not find catch block");
}
