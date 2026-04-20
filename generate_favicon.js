import { renderToStaticMarkup } from 'react-dom/server';
import BrandLogo from './src/components/BrandLogo';
import fs from 'fs';

// This is a scratch script to generate a favicon from the SVG logo
// Since I can't easily generate an .ico, I'll generate a .svg favicon
const svgString = renderToStaticMarkup(<BrandLogo type="monogram" color="#5A4334" />);
fs.writeFileSync('./public/favicon.svg', `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  ${svgString}
</svg>`);
