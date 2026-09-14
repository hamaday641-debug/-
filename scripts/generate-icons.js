import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generate() {
  const publicDir = path.resolve('public');
  const svgPath = path.join(publicDir, 'icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  console.log('Generating 192x192 PNG...');
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  console.log('Generating 512x512 PNG...');
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  console.log('Generating maskable 512x512 PNG...');
  // Maskable icon with 10% inner padding for safe area
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 27, g: 48, b: 34, alpha: 1 } // #1B3022
    })
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-512.png'));

  console.log('Generating Store Screenshots...');
  // Mobile screenshot placeholder preview
  const mobileSvg = `
  <svg width="720" height="1280" xmlns="http://www.w3.org/2000/svg">
    <rect width="720" height="1280" fill="#142419"/>
    <rect x="40" y="60" width="640" height="220" rx="32" fill="#1B3022" stroke="#2D4536" stroke-width="4"/>
    <text x="360" y="160" font-size="44" font-family="sans-serif" font-weight="bold" fill="#E9B161" text-anchor="middle">طريق الهدى</text>
    <text x="360" y="220" font-size="24" font-family="sans-serif" fill="#E0E7E1" text-anchor="middle">القرآن الكريم والأذكار ومواقيت الصلاة</text>
    
    <rect x="40" y="310" width="640" height="180" rx="24" fill="#1B3022" stroke="#2D4536" stroke-width="2"/>
    <text x="360" y="380" font-size="28" font-family="sans-serif" font-weight="bold" fill="#E9B161" text-anchor="middle">مواقيت الصلاة الدقيقة والأذان</text>
    <text x="360" y="430" font-size="22" font-family="sans-serif" fill="#A8BCAD" text-anchor="middle">الفجر • الشروق • الظهر • العصر • المغرب • العشاء</text>

    <rect x="40" y="520" width="640" height="680" rx="24" fill="#1B3022" stroke="#2D4536" stroke-width="2"/>
    <text x="360" y="620" font-size="34" font-family="sans-serif" font-weight="bold" fill="#FFFFFF" text-anchor="middle">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</text>
    <text x="360" y="700" font-size="26" font-family="sans-serif" fill="#E9B161" text-anchor="middle">المصحف الشريف المرتل والمجود</text>
    <text x="360" y="760" font-size="22" font-family="sans-serif" fill="#E0E7E1" text-anchor="middle">أصوات كبار قراء العالم الإسلامي</text>
    <text x="360" y="820" font-size="20" font-family="sans-serif" fill="#A8BCAD" text-anchor="middle">استماع وتصفح سلس بدون إنترنت</text>
  </svg>`;

  await sharp(Buffer.from(mobileSvg))
    .png()
    .toFile(path.join(publicDir, 'screenshot-mobile.png'));

  const desktopSvg = `
  <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
    <rect width="1280" height="720" fill="#142419"/>
    <rect x="60" y="50" width="1160" height="150" rx="24" fill="#1B3022" stroke="#2D4536" stroke-width="3"/>
    <text x="640" y="125" font-size="44" font-family="sans-serif" font-weight="bold" fill="#E9B161" text-anchor="middle">تطبيق طريق الهدى - المنصة القرآنية والإسلامية الشاملة</text>
    <text x="640" y="165" font-size="22" font-family="sans-serif" fill="#A8BCAD" text-anchor="middle">المصحف الشريف • مواقيت الصلاة • أذكار المسلم • البث المباشر</text>
    
    <rect x="60" y="230" width="360" height="430" rx="20" fill="#1B3022" stroke="#2D4536" stroke-width="2"/>
    <text x="240" y="320" font-size="28" font-family="sans-serif" font-weight="bold" fill="#E9B161" text-anchor="middle">القرآن الكريم</text>
    <text x="240" y="380" font-size="18" font-family="sans-serif" fill="#E0E7E1" text-anchor="middle">تلاوات عذبة لكبار القراء</text>

    <rect x="460" y="230" width="360" height="430" rx="20" fill="#1B3022" stroke="#2D4536" stroke-width="2"/>
    <text x="640" y="320" font-size="28" font-family="sans-serif" font-weight="bold" fill="#E9B161" text-anchor="middle">مواقيت الصلاة</text>
    <text x="640" y="380" font-size="18" font-family="sans-serif" fill="#E0E7E1" text-anchor="middle">تنبيهات الأذان والقبلة</text>

    <rect x="860" y="230" width="360" height="430" rx="20" fill="#1B3022" stroke="#2D4536" stroke-width="2"/>
    <text x="1040" y="320" font-size="28" font-family="sans-serif" font-weight="bold" fill="#E9B161" text-anchor="middle">الأذكار والسبحة</text>
    <text x="1040" y="380" font-size="18" font-family="sans-serif" fill="#E0E7E1" text-anchor="middle">حصن المسلم اليومي</text>
  </svg>`;

  await sharp(Buffer.from(desktopSvg))
    .png()
    .toFile(path.join(publicDir, 'screenshot-desktop.png'));

  console.log('All icons and screenshots generated successfully in /public!');
}

generate().catch(console.error);
