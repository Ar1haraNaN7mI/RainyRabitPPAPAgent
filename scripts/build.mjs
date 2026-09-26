import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build, loadEnv } from 'vite';

// Prefer an explicitly chosen domain; Vercel supplies its actual production
// domain (without a protocol) even when this build is a preview deployment.
const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env };
const productionDomain = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
const configuredUrl = env.VITE_SITE_URL?.trim() || (productionDomain ? `https://${productionDomain}` : undefined);
let siteUrl;

if (configuredUrl) {
  const url = new URL(configuredUrl);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('VITE_SITE_URL must be the public site origin, for example https://your-domain.example (without a path, credentials, query or fragment).');
  }
  siteUrl = url.href;
}

await build();

// Render the same React page once during the build. Vercel only receives static
// files; no runtime server or serverless function is needed.
const cacheDirectory = resolve('node_modules/.cache');
await mkdir(cacheDirectory, { recursive: true });
const serverDirectory = await mkdtemp(resolve(cacheDirectory, '.ssr-'));
let markup;

try {
  await build({
    ssr: { noExternal: ['gsap'] },
    build: {
      ssr: resolve('src/entry-server.tsx'),
      outDir: serverDirectory,
      emptyOutDir: true,
      copyPublicDir: false,
      minify: false,
      rollupOptions: { output: { entryFileNames: 'entry-server.mjs' } },
    },
  });
  const { render } = await import(pathToFileURL(resolve(serverDirectory, 'entry-server.mjs')).href);
  markup = render();
} finally {
  const resolvedDirectory = resolve(serverDirectory);
  assert.ok(resolvedDirectory.startsWith(cacheDirectory + sep) && basename(resolvedDirectory).startsWith('.ssr-'), 'Unexpected prerender cache directory.');
  await rm(resolvedDirectory, { recursive: true, force: true });
}

const heading = markup.match(/<h1\b[^>]*id="hero-title"[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]*>/g, '');
assert.ok(heading?.includes('PPAP') && heading.length > 10, 'Prerendered hero heading is missing.');
assert.ok(!markup.includes('\uFFFD'), 'Prerendered page contains invalid Unicode characters.');
for (const anchor of ['scenarios', 'delivery', 'method', 'boundary', 'contact']) {
  assert.ok(markup.includes(`id="${anchor}"`), `Prerendered page is missing #${anchor}.`);
}
assert.match(markup, /<main\b/, 'Prerendered main content is missing.');
assert.match(markup, /<footer\b/, 'Prerendered footer is missing.');

const indexPath = resolve('dist/index.html');
let html = await readFile(indexPath, 'utf8');
assert.ok(html.includes('<div id="root"></div>'), 'The HTML template must contain one empty React root.');
html = html.replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`)
  // The complete page now works as a static document without the old fallback.
  .replace(/\s*<noscript>[\s\S]*?<\/noscript>/, '');

if (siteUrl) {
  const attribute = siteUrl.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  const metadata = `<link rel="canonical" href="${attribute}" />\n    <meta property="og:url" content="${attribute}" />`;
  assert.ok(html.includes('<!-- SITE_METADATA -->'), 'The SEO metadata placeholder is missing.');
  html = html
    .replace('<!-- SITE_METADATA -->', metadata)
    .replace(/(<meta\s+(?:property|name)="(?:og:image|twitter:image)"\s+content=")(\/[^\"]*)(")/g,
      (_match, before, imagePath, after) => `${before}${new URL(imagePath, siteUrl).href}${after}`);
  await writeFile(resolve('dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${attribute}</loc></url></urlset>\n`, 'utf8');
  await writeFile(resolve('dist/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`, 'utf8');
  console.log('SEO metadata generated for the configured public site URL.');
} else {
  console.log('Build complete. Set VITE_SITE_URL or deploy on Vercel to add the confirmed canonical URL and sitemap.');
}

assert.match(html, /<title>[^<]+PPAP[^<]+<\/title>/, 'The page title must describe the PPAP product.');
assert.match(html, /<meta\s+name="description"\s+content="[^"]{40,}"/, 'The page description is missing or too short.');
assert.match(html, /<meta\s+property="og:title"/, 'The social sharing title is missing.');
if (siteUrl) {
  assert.ok(html.includes(`rel="canonical" href="${siteUrl}"`), 'The configured canonical URL is missing.');
  assert.ok(html.includes(`property="og:url" content="${siteUrl}"`), 'The configured sharing URL is missing.');
} else {
  assert.ok(!html.includes('rel="canonical"'), 'A canonical URL must not be guessed before a public domain is available.');
}
await writeFile(indexPath, html, 'utf8');
console.log('Static page verified: hero copy, section anchors, footer and SEO metadata are present in dist/index.html.');
