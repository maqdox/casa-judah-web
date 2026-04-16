const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src', 'app', '[lang]'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("lang: 'en' | 'es'")) {
    // Fix function signature
    content = content.replace(/params: Promise<\{\s*lang: 'en' \| 'es'\s*\}>/g, 'params: Promise<{ lang: string }>');
    // Fix extraction
    content = content.replace(/const \{ lang \} = await params;/g, "const { lang } = (await params) as { lang: 'en' | 'es' };");
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  }
}
