import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://sainiwalaa-deals-27762.web.app';
const fallbackDataPath = path.resolve(__dirname, '../src/services/fallbackData.ts');
const publicDir = path.resolve(__dirname, '../public');

try {
  const content = fs.readFileSync(fallbackDataPath, 'utf8');
  // Match JSON object in FALLBACK_API_DATA = { ... }
  const jsonMatch = content.match(/export\s+const\s+FALLBACK_API_DATA\s*=\s*(\{[\s\S]*?\})\s*as\s+const;/);

  if (!jsonMatch) {
    console.error('Could not parse FALLBACK_API_DATA from fallbackData.ts');
    process.exit(1);
  }

  const data = JSON.parse(jsonMatch[1]);
  const products = data.products || [];
  const header = data.header || [];

  const categories = new Set();
  header.forEach(h => {
    if (h.CATEGORY && h.CATEGORY.trim() && h.SHOW !== 'NO') {
      categories.add(h.CATEGORY.trim());
    }
  });
  products.forEach(p => {
    if (p.CATEGORY && p.CATEGORY.trim()) {
      categories.add(p.CATEGORY.trim());
    }
  });

  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Homepage
  xml += `  <url>\n`;
  xml += `    <loc>${BASE_URL}/</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // 2. Real Categories
  Array.from(categories).sort().forEach(cat => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/?category=${encodeURIComponent(cat)}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  // 3. Real Indexable Products (Only active shown products)
  products
    .filter(p => p.SHOW !== 'NO' && p.NAME && p.NAME.trim())
    .forEach((p, idx) => {
      const row = p._ROW || idx + 1;
      const cleanName = (p.NAME || '').trim().slice(0, 20);
      const id = `deal_${row}_${encodeURIComponent(cleanName)}`;
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/?product=${encodeURIComponent(id)}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

  xml += `</urlset>\n`;

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf8');

  console.log(`Generated sitemap.xml with 1 homepage, ${categories.size} categories, and ${products.length} products.`);
} catch (err) {
  console.error('Error generating sitemap:', err);
  process.exit(1);
}
