/**
 * High-Resolution Client-Side Widget Image & Offline HTML Generator
 * Generates pristine, retina-ready prayer times widgets for phone home screens
 * without relying on any external websites, apps, or third-party services.
 */

export type WidgetStyle = 'gold' | 'emerald' | 'obsidian' | 'glass';
export type WidgetAspect = 'wide' | 'square';

export interface WidgetData {
  cityName: string;
  hijriDate: string;
  gregorianDate: string;
  nextPrayerName: string;
  nextPrayerTime: string;
  timeToNext: string;
  prayers: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
}

/**
 * Renders the chosen widget style onto an HTML5 Canvas and returns a Blob / Data URL.
 */
export async function generateWidgetImageBlob(
  data: WidgetData,
  style: WidgetStyle = 'gold',
  aspect: WidgetAspect = 'wide'
): Promise<Blob> {
  const isWide = aspect === 'wide';
  const width = isWide ? 1200 : 800;
  const height = isWide ? 600 : 800;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not supported');
  }

  // Define color palette based on selected style
  let bgGradientStart = '#142419';
  let bgGradientEnd = '#0D1811';
  let accentColor = '#E9B161';
  let accentSecondary = '#F3C178';
  let cardBg = 'rgba(20, 36, 25, 0.75)';
  let borderColor = 'rgba(233, 177, 97, 0.4)';
  let textColor = '#FFFFFF';
  let mutedColor = '#A8BCAD';

  if (style === 'emerald') {
    bgGradientStart = '#0F2E1E';
    bgGradientEnd = '#071A10';
    accentColor = '#50C878';
    accentSecondary = '#7FE0A0';
    cardBg = 'rgba(15, 46, 30, 0.85)';
    borderColor = 'rgba(80, 200, 120, 0.45)';
    textColor = '#FFFFFF';
    mutedColor = '#A3D9B5';
  } else if (style === 'obsidian') {
    bgGradientStart = '#0A0A0A';
    bgGradientEnd = '#000000';
    accentColor = '#F5B041';
    accentSecondary = '#FAD7A0';
    cardBg = 'rgba(20, 20, 20, 0.9)';
    borderColor = 'rgba(245, 176, 65, 0.5)';
    textColor = '#FFFFFF';
    mutedColor = '#B0B0B0';
  } else if (style === 'glass') {
    bgGradientStart = '#1A2332';
    bgGradientEnd = '#0E131C';
    accentColor = '#64B5F6';
    accentSecondary = '#90CAF9';
    cardBg = 'rgba(30, 42, 60, 0.8)';
    borderColor = 'rgba(100, 181, 246, 0.4)';
    textColor = '#FFFFFF';
    mutedColor = '#B0BEC5';
  }

  // 1. Draw rounded container background
  const radius = 40;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(width - radius, 0);
  ctx.quadraticCurveTo(width, 0, width, radius);
  ctx.lineTo(width, height - radius);
  ctx.quadraticCurveTo(width, height, width - radius, height);
  ctx.lineTo(radius, height);
  ctx.quadraticCurveTo(0, height, 0, height - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.clip();

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, bgGradientStart);
  bgGrad.addColorStop(1, bgGradientEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft Ambient Glow
  const glow = ctx.createRadialGradient(width * 0.7, height * 0.3, 20, width * 0.7, height * 0.3, width * 0.6);
  glow.addColorStop(0, borderColor);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Subtle decorative borders
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Inner border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Set RTL text alignment for Arabic
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';

  if (isWide) {
    // ==========================================
    // WIDE WIDGET LAYOUT (1200 x 600)
    // ==========================================

    // Header: App Name & City & Hijri Date
    ctx.font = 'bold 36px "Traditional Arabic", "Scheherazade New", "Amiri", "Segoe UI", sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText('🕌 طريق الهدى • مواقيت الصلاة', width - 60, 80);

    ctx.font = '24px "Segoe UI", Tahoma, sans-serif';
    ctx.fillStyle = mutedColor;
    ctx.fillText(`${data.cityName} • ${data.hijriDate}`, width - 60, 120);

    // Gregorian Date on the left
    ctx.textAlign = 'left';
    ctx.font = '22px "Segoe UI", Tahoma, sans-serif';
    ctx.fillStyle = mutedColor;
    ctx.fillText(data.gregorianDate, 60, 80);

    // Next Prayer Hero Card (Right side)
    ctx.textAlign = 'right';
    const heroCardX = 60;
    const heroCardY = 160;
    const heroCardW = width - 120;
    const heroCardH = 210;

    // Card background
    ctx.fillStyle = cardBg;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, heroCardX, heroCardY, heroCardW, heroCardH, 24);
    ctx.fill();
    ctx.stroke();

    // Next Prayer Label
    ctx.font = 'bold 24px "Segoe UI", Tahoma, sans-serif';
    ctx.fillStyle = mutedColor;
    ctx.fillText('الصلاة القادمة:', width - 100, heroCardY + 50);

    // Next Prayer Name & Time
    ctx.font = 'bold 56px "Traditional Arabic", "Scheherazade New", "Amiri", sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText(`صلاة ${data.nextPrayerName}`, width - 100, heroCardY + 120);

    ctx.font = 'bold 44px "Segoe UI", Tahoma, sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText(`الساعة ${data.nextPrayerTime}`, width - 100, heroCardY + 175);

    // Countdown Badge on the left
    ctx.textAlign = 'center';
    const badgeW = 280;
    const badgeH = 120;
    const badgeX = heroCardX + 40;
    const badgeY = heroCardY + 45;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 18);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 20px "Segoe UI", Tahoma, sans-serif';
    ctx.fillStyle = mutedColor;
    ctx.fillText('الوقت المتبقي', badgeX + badgeW / 2, badgeY + 40);

    ctx.font = 'bold 48px "Segoe UI", monospace, sans-serif';
    ctx.fillStyle = accentSecondary;
    ctx.fillText(data.timeToNext, badgeX + badgeW / 2, badgeY + 95);

    // Five Prayers Bottom Grid (Fajr, Dhuhr, Asr, Maghrib, Isha)
    const prayersList = [
      { name: 'الفجر', time: data.prayers.fajr },
      { name: 'الظهر', time: data.prayers.dhuhr },
      { name: 'العصر', time: data.prayers.asr },
      { name: 'المغرب', time: data.prayers.maghrib },
      { name: 'العشاء', time: data.prayers.isha },
    ];

    const gridY = 400;
    const gridW = width - 120;
    const itemGap = 16;
    const itemW = (gridW - itemGap * 4) / 5;
    const itemH = 110;

    prayersList.forEach((p, index) => {
      // RTL: index 0 is on the far right
      const itemX = width - 60 - (index + 1) * itemW - index * itemGap;
      const isNext = p.name === data.nextPrayerName;

      ctx.fillStyle = isNext ? accentColor : 'rgba(0, 0, 0, 0.35)';
      ctx.strokeStyle = isNext ? accentSecondary : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = isNext ? 3 : 1;

      drawRoundedRect(ctx, itemX, gridY, itemW, itemH, 16);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = `bold 24px "Traditional Arabic", "Amiri", sans-serif`;
      ctx.fillStyle = isNext ? '#142419' : textColor;
      ctx.fillText(p.name, itemX + itemW / 2, gridY + 42);

      ctx.font = 'bold 24px "Segoe UI", monospace, sans-serif';
      ctx.fillStyle = isNext ? '#142419' : accentColor;
      ctx.fillText(p.time, itemX + itemW / 2, gridY + 84);
    });

    // Footer Ayah
    ctx.textAlign = 'center';
    ctx.font = 'italic 19px "Traditional Arabic", "Amiri", "Scheherazade New", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fillText('﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾', width / 2, height - 30);

  } else {
    // ==========================================
    // SQUARE WIDGET LAYOUT (800 x 800)
    // ==========================================

    // Header
    ctx.font = 'bold 34px "Traditional Arabic", "Scheherazade New", "Amiri", sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText('🕌 طريق الهدى', width - 60, 75);

    ctx.font = '20px "Segoe UI", Tahoma, sans-serif';
    ctx.fillStyle = mutedColor;
    ctx.fillText(`${data.cityName} • ${data.hijriDate}`, width - 60, 115);

    // Hero Next Prayer Center Card
    const heroY = 150;
    const heroH = 260;
    const heroW = width - 120;
    const heroX = 60;

    ctx.fillStyle = cardBg;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, heroX, heroY, heroW, heroH, 24);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '22px "Segoe UI", Tahoma, sans-serif';
    ctx.fillStyle = mutedColor;
    ctx.fillText('الصلاة القادمة', width / 2, heroY + 45);

    ctx.font = 'bold 58px "Traditional Arabic", "Scheherazade New", "Amiri", sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText(`صلاة ${data.nextPrayerName}`, width / 2, heroY + 115);

    ctx.font = 'bold 44px "Segoe UI", monospace, sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText(data.nextPrayerTime, width / 2, heroY + 175);

    // Countdown pill
    const pillW = 260;
    const pillH = 46;
    const pillX = (width - pillW) / 2;
    const pillY = heroY + 195;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 23);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 20px "Segoe UI", Tahoma, sans-serif';
    ctx.fillStyle = accentSecondary;
    ctx.fillText(`متبقي: ${data.timeToNext}`, width / 2, pillY + 31);

    // Five prayers grid in 2 rows
    const prayersList = [
      { name: 'فجر', time: data.prayers.fajr },
      { name: 'ظهر', time: data.prayers.dhuhr },
      { name: 'عصر', time: data.prayers.asr },
      { name: 'مغرب', time: data.prayers.maghrib },
      { name: 'عشاء', time: data.prayers.isha },
    ];

    const gridY = 440;
    const gridW = width - 120;
    const itemGap = 12;
    const itemW = (gridW - itemGap * 4) / 5;
    const itemH = 120;

    prayersList.forEach((p, index) => {
      const itemX = width - 60 - (index + 1) * itemW - index * itemGap;
      const isNext = p.name === data.nextPrayerName || data.nextPrayerName.includes(p.name);

      ctx.fillStyle = isNext ? accentColor : 'rgba(0, 0, 0, 0.35)';
      ctx.strokeStyle = isNext ? accentSecondary : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = isNext ? 2.5 : 1;

      drawRoundedRect(ctx, itemX, gridY, itemW, itemH, 16);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = 'bold 22px "Traditional Arabic", sans-serif';
      ctx.fillStyle = isNext ? '#142419' : textColor;
      ctx.fillText(p.name, itemX + itemW / 2, gridY + 45);

      ctx.font = 'bold 20px "Segoe UI", monospace, sans-serif';
      ctx.fillStyle = isNext ? '#142419' : accentColor;
      ctx.fillText(p.time, itemX + itemW / 2, gridY + 90);
    });

    // Quran Ayah Footer
    ctx.textAlign = 'center';
    ctx.font = 'italic 20px "Traditional Arabic", "Amiri", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fillText('﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾', width / 2, height - 70);

    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillStyle = mutedColor;
    ctx.fillText(data.gregorianDate, width / 2, height - 35);
  }

  ctx.restore();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate image blob'));
    }, 'image/png');
  });
}

/**
 * Helper to draw smooth rounded rectangles on Canvas
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Converts the generated widget image into a base64 Data URL for direct display and long-press saving.
 */
export async function generateWidgetImageDataUrl(
  data: WidgetData,
  style: WidgetStyle = 'gold',
  aspect: WidgetAspect = 'wide'
): Promise<string> {
  const blob = await generateWidgetImageBlob(data, style, aspect);
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to create data URL'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Triggers native system share dialog (allows direct "Save to Gallery / Photos" on Android and iOS).
 */
export async function shareOrSaveWidgetImage(
  data: WidgetData,
  style: WidgetStyle = 'gold',
  aspect: WidgetAspect = 'wide'
): Promise<boolean> {
  try {
    const blob = await generateWidgetImageBlob(data, style, aspect);
    const file = new File([blob], `prayer-widget-${style}-${aspect}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'ودجت مواقيت الصلاة - طريق الهدى',
        text: 'ودجت مواقيت الصلاة لشاشة الهاتف الرئيسية'
      });
      return true;
    }
  } catch (err) {
    console.warn('Share not completed or cancelled:', err);
  }
  return false;
}

/**
 * Triggers direct browser download of the generated widget image with fallback for Android WebViews.
 */
export async function downloadWidgetImage(
  data: WidgetData,
  style: WidgetStyle = 'gold',
  aspect: WidgetAspect = 'wide'
): Promise<void> {
  const blob = await generateWidgetImageBlob(data, style, aspect);
  const fileName = `tareeq-al-huda-prayer-widget-${style}-${aspect}.png`;

  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch {
    // Fallback using Data URL for WebViews
    const reader = new FileReader();
    reader.onloadend = () => {
      const a = document.createElement('a');
      a.href = reader.result as string;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    reader.readAsDataURL(blob);
  }
}

/**
 * Creates an offline standalone interactive HTML widget file and triggers download.
 * Allows the user to keep an interactive, zero-dependency widget on their device.
 */
export function downloadOfflineHtmlWidget(data: WidgetData, style: WidgetStyle = 'gold'): void {
  const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ودجت مواقيت الصلاة - طريق الهدى</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    body { background: #0A120D; color: #FFFFFF; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
    .widget-card { background: linear-gradient(135deg, #162B1D 0%, #0E1A12 100%); border: 2px solid #E9B161; border-radius: 28px; width: 100%; max-width: 480px; padding: 22px; box-shadow: 0 16px 40px rgba(0,0,0,0.6); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(233,177,97,0.25); padding-bottom: 14px; margin-bottom: 16px; }
    .title { font-size: 18px; font-weight: bold; color: #E9B161; }
    .city-hijri { font-size: 12px; color: #A8BCAD; text-align: left; }
    .hero { background: rgba(0,0,0,0.3); border: 1px solid rgba(233,177,97,0.3); border-radius: 20px; padding: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .hero-label { font-size: 12px; color: #A8BCAD; }
    .hero-prayer { font-size: 24px; font-weight: bold; color: #FFFFFF; margin: 4px 0; }
    .hero-time { font-size: 18px; color: #E9B161; font-weight: bold; }
    .countdown-box { text-align: left; background: rgba(233,177,97,0.15); border: 1px solid #E9B161; border-radius: 14px; padding: 8px 14px; }
    .countdown-label { font-size: 10px; color: #E9B161; }
    .countdown-val { font-size: 20px; font-weight: bold; font-family: monospace; color: #FFFFFF; }
    .prayers-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 16px; }
    .prayer-pill { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 4px; text-align: center; }
    .prayer-pill.active { background: #E9B161; color: #142419; border-color: #F3C178; font-weight: bold; }
    .prayer-pill .p-name { font-size: 13px; margin-bottom: 4px; }
    .prayer-pill .p-time { font-size: 11px; font-family: monospace; }
    .footer { text-align: center; font-size: 12px; color: #A8BCAD; font-style: italic; }
  </style>
</head>
<body>
  <div class="widget-card">
    <div class="header">
      <div class="title">🕌 طريق الهدى</div>
      <div class="city-hijri">
        <div>${data.cityName}</div>
        <div>${data.hijriDate}</div>
      </div>
    </div>
    <div class="hero">
      <div>
        <div class="hero-label">الصلاة القادمة:</div>
        <div class="hero-prayer">صلاة ${data.nextPrayerName}</div>
        <div class="hero-time">${data.nextPrayerTime}</div>
      </div>
      <div class="countdown-box">
        <div class="countdown-label">المتبقي</div>
        <div class="countdown-val">${data.timeToNext}</div>
      </div>
    </div>
    <div class="prayers-grid">
      <div class="prayer-pill ${data.nextPrayerName === 'الفجر' ? 'active' : ''}">
        <div class="p-name">فجر</div>
        <div class="p-time">${data.prayers.fajr}</div>
      </div>
      <div class="prayer-pill ${data.nextPrayerName === 'الظهر' ? 'active' : ''}">
        <div class="p-name">ظهر</div>
        <div class="p-time">${data.prayers.dhuhr}</div>
      </div>
      <div class="prayer-pill ${data.nextPrayerName === 'العصر' ? 'active' : ''}">
        <div class="p-name">عصر</div>
        <div class="p-time">${data.prayers.asr}</div>
      </div>
      <div class="prayer-pill ${data.nextPrayerName === 'المغرب' ? 'active' : ''}">
        <div class="p-name">مغرب</div>
        <div class="p-time">${data.prayers.maghrib}</div>
      </div>
      <div class="prayer-pill ${data.nextPrayerName === 'العشاء' ? 'active' : ''}">
        <div class="p-name">عشاء</div>
        <div class="p-time">${data.prayers.isha}</div>
      </div>
    </div>
    <div class="footer">
      ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tareeq-al-huda-widget-${data.cityName}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
