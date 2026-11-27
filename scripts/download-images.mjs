import fs from 'fs';
import path from 'path';
import https from 'https';

const IMAGES = [
  {
    name: 'hero-emerald-dark.jpg',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=85',
  },
  {
    name: 'mesh-emerald-flow.jpg',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1920&q=85',
  },
  {
    name: 'card-emerald-ambient.jpg',
    url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1600&q=85',
  },
  {
    name: 'card-light-texture.jpg',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'charter-banner.jpg',
    url: 'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?auto=format&fit=crop&w=1920&q=85',
  },
];

const targetDir = path.resolve('public', 'images', 'abstract');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(download(res.headers.location, dest));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status code ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
      file.on('error', (err) => {
        fs.unlinkSync(dest);
        reject(err);
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Downloading abstract images from Unsplash...');
  for (const img of IMAGES) {
    const dest = path.join(targetDir, img.name);
    console.log(`Downloading ${img.name}...`);
    try {
      await download(img.url, dest);
      const stat = fs.statSync(dest);
      console.log(`✓ Saved ${img.name} (${Math.round(stat.size / 1024)} KB)`);
    } catch (err) {
      console.error(`✗ Error downloading ${img.name}:`, err.message);
    }
  }
  console.log('Done downloading images.');
}

run();
