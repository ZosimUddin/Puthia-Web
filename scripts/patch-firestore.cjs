const fs = require('fs');
const path = require('path');

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    if (content.includes('3241') || content.includes('0x0ca9')) {
      content = content
        .replace(
          /this\.ve\s*-=\s*1\s*,\s*__PRIVATE_hardAssert\([^)]*3241[^)]*\{[^\}]*ve:\s*this\.ve[^\}]*\}\);/g,
          'this.ve = Math.max(0, this.ve - 1);'
        )
        .replace(
          /this\.ve\s*-=\s*1\s*,\s*__PRIVATE_hardAssert\(this\.ve\s*>=\s*0,\s*3241,\s*\{/g,
          'this.ve = Math.max(0, this.ve - 1), (this.ve >= 0 ? void 0 : void 0), ({'
        )
        .replace(
          /hardAssert\(this\.pendingResponses\s*>=\s*0,\s*0x0ca9,\s*\{[^\}]*\}\);/g,
          'this.pendingResponses = Math.max(0, this.pendingResponses);'
        );

      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[patch-firestore] Successfully patched: ${filePath}`);
      }
    }
  } catch (err) {
    console.warn(`[patch-firestore] Failed to patch ${filePath}:`, err.message);
  }
}

const targetDirs = [
  path.join(__dirname, '..', 'node_modules', '@firebase', 'firestore', 'dist'),
  path.join(__dirname, '..', 'node_modules', '.vite', 'deps')
];

targetDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    if (file.endsWith('.js') && (file.includes('firestore') || file.includes('index'))) {
      patchFile(path.join(dir, file));
    }
  });
});
