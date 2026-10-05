import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://sainiwalaa-deals-27762.web.app';
const fallbackDataPath = path.resolve(__dirname, '../src/services/fallbackData.ts');
const publicDir = path.resolve(__dirname, '../public');

/**
 * Normalizes and decodes any pre-encoded percent sequences completely to raw characters,
 * ensuring subsequent encodeURIComponent calls encode EXACTLY ONCE without double encoding (%25).
 */
function toRawString(str) {
  let raw = String(str || '').trim();
  try {
    while (raw.includes('%')) {
      const decoded = decodeURIComponent(raw);
      if (decoded === raw) break;
      raw = decoded;
    }
  } catch {
    // If malformed percent sequence, keep raw
  }
  return raw;
}

try {
  const content = fs.readFileSync(fallbackDataPath, 'utf8');
  const jsonMatch = content.match(/export\s+const\s+FALLBACK_API_DATA\s*=\s*(\{[\s\S]*?\})\s*as\s+const;/);

  if (!jsonMatch) {
    console.error('Could not parse FALLBACK_API_DATA from fallbackData.ts');
    process.exit(1);
  }

  const data = JSON.parse(jsonMatch[1]);
  const rawProducts = data.products || [];

  // Filter ONLY genuinely valid, shown products with real names
  const activeProducts = rawProducts.filter(p => {
    const isShown = String(p.SHOW || 'YES').trim().toUpperCase() !== 'NO';
    const hasName = Boolean(p.NAME && String(p.NAME).trim());
    return isShown && hasName;
  });

  // Extract ONLY real categories that have at least 1 active product
  const categoryMap = new Map(); // normalized lowercase -> canonical name
  activeProducts.forEach(p => {
    const rawCat = p.CATEGORY ? String(p.CATEGORY).trim() : '';
    if (rawCat && rawCat !== 'All' && rawCat !== 'All Deals') {
      const key = rawCat.toLowerCase();
      if (!categoryMap.has(key)) {
        categoryMap.set(key, rawCat);
      }
    }
  });

  const categories = Array.from(categoryMap.values()).sort();

  const today = new Date().toISOString().split('T')[0];
  const urlEntries = [];
  const seenUrls = new Set();

  function addUrl(loc, changefreq, priority) {
    if (!seenUrls.has(loc)) {
      seenUrls.add(loc);
      urlEntries.push({ loc, lastmod: today, changefreq, priority });
    }
  }

  // 1. Homepage
  addUrl(`${BASE_URL}/`, 'daily', '1.0');

  // 2. Real Supported Categories (Only categories with active products)
  categories.forEach(cat => {
    const cleanCat = toRawString(cat);
    const loc = `${BASE_URL}/?category=${encodeURIComponent(cleanCat)}`;
    addUrl(loc, 'daily', '0.8');
  });

  // 3. Real Indexable Products (Encoded strictly once, no double encoding)
  activeProducts.forEach((p, idx) => {
    const row = p._ROW || idx + 1;
    const rawName = toRawString(p.NAME).slice(0, 20).trim();
    // Canonical raw ID before URL encoding
    const rawId = `deal_${row}_${rawName}`;
    const loc = `${BASE_URL}/?product=${encodeURIComponent(rawId)}`;
    addUrl(loc, 'weekly', '0.7');
  });

  // Generate XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  urlEntries.forEach(entry => {
    xml += `  <url>\n`;
    xml += `    <loc>${entry.loc}</loc>\n`;
    xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf8');

  console.log(`[Sitemap] Generated ${urlEntries.length} total URLs:`);
  console.log(`- Homepage: 1`);
  console.log(`- Categories: ${categories.length} (${categories.join(', ')})`);
  console.log(`- Products: ${activeProducts.length}`);
} catch (err) {
  console.error('[Sitemap] Error generating sitemap:', err);
  process.exit(1);
}
