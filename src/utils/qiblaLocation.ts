// Accurate Qibla & Location calculation utilities with comprehensive city database

export interface CityOption {
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: number; // UTC offset in hours
  method: number; // 5: Egypt, 4: Umm Al-Qura (Saudi/Gulf), 3: MWL/Jordan/Palestine, 2: ISNA (US/CA), 1: Karachi, 13: Diyanet (Turkey)
  region?: string;
}

// Holy Kaaba Exact Coordinates (Great Circle / Haversine Standard as used by Google Qibla Finder)
export const KAABA_LAT = 21.4224779;
export const KAABA_LNG = 39.8251832;

/**
 * Great-Circle Forward Azimuth Bearing to the Holy Kaaba using Spherical Trigonometry
 * (طريقة مسار الدائرة الكبرى ومعادلة هافيرسين لحساب أقصر مسار مباشر لموقع الكعبة المشرفة)
 */
export function calculateQiblaBearing(lat: number, lng: number): number {
  const phiK = (KAABA_LAT * Math.PI) / 180;
  const lambdaK = (KAABA_LNG * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const lambda = (lng * Math.PI) / 180;

  const y = Math.sin(lambdaK - lambda) * Math.cos(phiK);
  const x = Math.cos(phi) * Math.sin(phiK) - Math.sin(phi) * Math.cos(phiK) * Math.cos(lambdaK - lambda);
  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  return (qibla + 360) % 360;
}

/**
 * Haversine formula for exact distance to Kaaba in kilometers
 */
export function calculateDistanceToKaabaKm(lat: number, lng: number): number {
  const R = 6371; // Earth mean radius in km
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
  const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((KAABA_LAT * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Approximate Magnetic Declination (WMM / IGRF) in degrees
 * Positive = East (+), Negative = West (-)
 * In Egypt and Middle East, magnetic north is ~+4.5° to +5.5° East of True North.
 */
export function getMagneticDeclination(lat: number, lng: number): number {
  // Egypt & Levant Region (Lat: 21-34, Lng: 24-37)
  if (lat >= 21 && lat <= 34 && lng >= 24 && lng <= 37) {
    // Highly accurate interpolation for Egypt/Levant (Cairo ~ +5.0°, Alex ~ +5.2°, Aswan ~ +4.2°)
    return Number((5.0 + (lat - 30) * 0.12 - (lng - 31) * 0.08).toFixed(1));
  }
  
  // Arabian Peninsula (Saudi Arabia, UAE, Kuwait, Qatar, Oman)
  if (lat >= 12 && lat <= 32 && lng > 37 && lng <= 60) {
    return Number((3.8 + (lat - 24) * 0.08 - (lng - 45) * 0.05).toFixed(1));
  }

  // North Africa (Libya, Tunisia, Algeria, Morocco)
  if (lat >= 18 && lat <= 38 && lng >= -18 && lng < 24) {
    return Number((2.0 + (lng - 10) * 0.15).toFixed(1));
  }

  // Turkey & Balkans
  if (lat >= 35 && lat <= 44 && lng >= 20 && lng <= 45) {
    return Number((5.5 + (lng - 30) * 0.1).toFixed(1));
  }

  // General global approximation
  return Number((5.0 * Math.sin((lng * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180)).toFixed(1));
}

/**
 * Converts degree bearing into precise Arabic cardinal direction and human description
 */
export function getCardinalDirectionArabic(bearing: number): {
  code: string;
  name: string;
  simpleGuide: string;
} {
  const normalized = (bearing + 360) % 360;
  
  if (normalized >= 348.75 || normalized < 11.25) {
    return { code: 'N', name: 'شمال تماماً (North)', simpleGuide: 'باتجاه الشمال مباشرة' };
  } else if (normalized >= 11.25 && normalized < 33.75) {
    return { code: 'NNE', name: 'شمال شمال شرق (NNE)', simpleGuide: 'باتجاه الشمال مائلاً قليلاً نحو الشرق' };
  } else if (normalized >= 33.75 && normalized < 56.25) {
    return { code: 'NE', name: 'شمال شرق (North-East)', simpleGuide: 'بين الشمال والشرق مباشرة (نصف المسافة)' };
  } else if (normalized >= 56.25 && normalized < 78.75) {
    return { code: 'ENE', name: 'شرق شمال شرق (ENE)', simpleGuide: 'باتجاه الشرق مائلاً نحو الشمال' };
  } else if (normalized >= 78.75 && normalized < 101.25) {
    return { code: 'E', name: 'شرق تماماً (East)', simpleGuide: 'باتجاه شروق الشمس (الشرق تماماً)' };
  } else if (normalized >= 101.25 && normalized < 123.75) {
    return { code: 'ESE', name: 'شرق جنوب شرق (ESE)', simpleGuide: 'باتجاه الشرق مائلاً قليلاً نحو الجنوب' };
  } else if (normalized >= 123.75 && normalized < 146.25) {
    return { code: 'SE', name: 'جنوب شرق (South-East)', simpleGuide: 'بين الشرق والجنوب (الاتجاه المعتمد لمعظم محافظات مصر وبلاد الشام)' };
  } else if (normalized >= 146.25 && normalized < 168.75) {
    return { code: 'SSE', name: 'جنوب جنوب شرق (SSE)', simpleGuide: 'باتجاه الجنوب مائلاً قليلاً نحو الشرق' };
  } else if (normalized >= 168.75 && normalized < 191.25) {
    return { code: 'S', name: 'جنوب تماماً (South)', simpleGuide: 'باتجاه الجنوب مباشرة (جهة الظل عند الزوال في نصف الكرة الشمالي)' };
  } else if (normalized >= 191.25 && normalized < 213.75) {
    return { code: 'SSW', name: 'جنوب جنوب غرب (SSW)', simpleGuide: 'باتجاه الجنوب مائلاً قليلاً نحو الغرب' };
  } else if (normalized >= 213.75 && normalized < 236.25) {
    return { code: 'SW', name: 'جنوب غرب (South-West)', simpleGuide: 'بين الجنوب والغرب' };
  } else if (normalized >= 236.25 && normalized < 258.75) {
    return { code: 'WSW', name: 'غرب جنوب غرب (WSW)', simpleGuide: 'باتجاه الغرب مائلاً نحو الجنوب (الاتجاه لشرق ووسط السعودية والخليج)' };
  } else if (normalized >= 258.75 && normalized < 281.25) {
    return { code: 'W', name: 'غرب تماماً (West)', simpleGuide: 'باتجاه غروب الشمس (الغرب تماماً)' };
  } else if (normalized >= 281.25 && normalized < 303.75) {
    return { code: 'WNW', name: 'غرب شمال غرب (WNW)', simpleGuide: 'باتجاه الغرب مائلاً نحو الشمال' };
  } else if (normalized >= 303.75 && normalized < 326.25) {
    return { code: 'NW', name: 'شمال غرب (North-West)', simpleGuide: 'بين الغرب والشمال' };
  } else {
    return { code: 'NNW', name: 'شمال شمال غرب (NNW)', simpleGuide: 'باتجاه الشمال مائلاً قليلاً نحو الغرب' };
  }
}

/**
 * Reverse geocoding with high-accuracy fallbacks
 */
export async function reverseGeocodeLocation(
  lat: number,
  lng: number
): Promise<{ cityName: string; countryName: string; fullLabel: string }> {
  // 1. Try BigDataCloud Free Reverse Geocode Client (supports Arabic Locality directly)
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || '';
      const country = data.countryName || '';
      if (city || country) {
        const cityName = city || 'موقعي الدقيق';
        const countryName = country || 'الموقع الجغرافي المباشر';
        return {
          cityName,
          countryName,
          fullLabel: `${cityName} (${countryName})`
        };
      }
    }
  } catch (e) {
    // try fallback
  }

  // 2. Try OpenStreetMap Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.state || addr.county || '';
      const country = addr.country || '';
      if (city || country) {
        const cityName = city || 'موقعي الدقيق';
        const countryName = country || 'الموقع الجغرافي المباشر';
        return {
          cityName,
          countryName,
          fullLabel: `${cityName} (${countryName})`
        };
      }
    }
  } catch (e) {
    // fallback
  }

  // 3. Fallback: Find closest city from built-in database
  const nearest = findNearestCity(lat, lng);
  return {
    cityName: nearest.name,
    countryName: nearest.country,
    fullLabel: `${nearest.name} (${nearest.country})`
  };
}

/**
 * Find closest city in the pre-configured database
 */
export function findNearestCity(lat: number, lng: number): CityOption {
  let closest = ALL_CITIES[0];
  let minDistance = Number.MAX_VALUE;

  for (const c of ALL_CITIES) {
    const dLat = ((c.lat - lat) * Math.PI) / 180;
    const dLng = ((c.lng - lng) * Math.PI) / 180;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDistance) {
      minDistance = distSq;
      closest = c;
    }
  }

  return closest;
}

/**
 * Comprehensive database of Arab, Islamic, and World cities
 */
export const ALL_CITIES: CityOption[] = [
  // --- جمهورية مصر العربية (كل المحافظات والمدن الكبرى مع الهيئة المصرية للمساحة) ---
  { name: 'مدينة السنطة (الغربية)', country: 'مصر', lat: 30.7516, lng: 31.1347, timezone: 3, method: 5, region: 'مصر' },
  { name: 'طنطا (الغربية)', country: 'مصر', lat: 30.7865, lng: 31.0004, timezone: 3, method: 5, region: 'مصر' },
  { name: 'المحلة الكبرى (الغربية)', country: 'مصر', lat: 30.9706, lng: 31.1669, timezone: 3, method: 5, region: 'مصر' },
  { name: 'زفتى (الغربية)', country: 'مصر', lat: 30.7136, lng: 31.2464, timezone: 3, method: 5, region: 'مصر' },
  { name: 'كفر الزيات (الغربية)', country: 'مصر', lat: 30.8247, lng: 30.8172, timezone: 3, method: 5, region: 'مصر' },
  { name: 'سمنود (الغربية)', country: 'مصر', lat: 30.9606, lng: 31.2411, timezone: 3, method: 5, region: 'مصر' },
  { name: 'قطور (الغربية)', country: 'مصر', lat: 30.9739, lng: 30.9575, timezone: 3, method: 5, region: 'مصر' },
  { name: 'بسيون (الغربية)', country: 'مصر', lat: 30.9389, lng: 30.8139, timezone: 3, method: 5, region: 'مصر' },
  { name: 'القاهرة', country: 'مصر', lat: 30.0444, lng: 31.2357, timezone: 3, method: 5, region: 'مصر' },
  { name: 'الجيزة', country: 'مصر', lat: 30.0131, lng: 31.2089, timezone: 3, method: 5, region: 'مصر' },
  { name: 'الإسكندرية', country: 'مصر', lat: 31.2001, lng: 29.9187, timezone: 3, method: 5, region: 'مصر' },
  { name: 'المنصورة (الدقهلية)', country: 'مصر', lat: 31.0409, lng: 31.3785, timezone: 3, method: 5, region: 'مصر' },
  { name: 'ميت غمر (الدقهلية)', country: 'مصر', lat: 30.7194, lng: 31.2589, timezone: 3, method: 5, region: 'مصر' },
  { name: 'السنبلاوين (الدقهلية)', country: 'مصر', lat: 30.8753, lng: 31.4708, timezone: 3, method: 5, region: 'مصر' },
  { name: 'الزقازيق (الشرقية)', country: 'مصر', lat: 30.5877, lng: 31.5020, timezone: 3, method: 5, region: 'مصر' },
  { name: 'بلبيس (الشرقية)', country: 'مصر', lat: 30.4194, lng: 31.5628, timezone: 3, method: 5, region: 'مصر' },
  { name: 'شبين الكوم (المنوفية)', country: 'مصر', lat: 30.5526, lng: 31.0084, timezone: 3, method: 5, region: 'مصر' },
  { name: 'قويسنا (المنوفية)', country: 'مصر', lat: 30.5572, lng: 31.1444, timezone: 3, method: 5, region: 'مصر' },
  { name: 'بركة السبع (المنوفية)', country: 'مصر', lat: 30.6389, lng: 31.0861, timezone: 3, method: 5, region: 'مصر' },
  { name: 'بنها (القليوبية)', country: 'مصر', lat: 30.4660, lng: 31.1853, timezone: 3, method: 5, region: 'مصر' },
  { name: 'طوخ (القليوبية)', country: 'مصر', lat: 30.3547, lng: 31.1992, timezone: 3, method: 5, region: 'مصر' },
  { name: 'دمنهور (البحيرة)', country: 'مصر', lat: 31.0379, lng: 30.4685, timezone: 3, method: 5, region: 'مصر' },
  { name: 'إيتاي البارود (البحيرة)', country: 'مصر', lat: 30.8872, lng: 30.6586, timezone: 3, method: 5, region: 'مصر' },
  { name: 'كفر الدوار (البحيرة)', country: 'مصر', lat: 31.1342, lng: 30.1294, timezone: 3, method: 5, region: 'مصر' },
  { name: 'كفر الشيخ', country: 'مصر', lat: 31.1107, lng: 30.9388, timezone: 3, method: 5, region: 'مصر' },
  { name: 'دسوق (كفر الشيخ)', country: 'مصر', lat: 31.1311, lng: 30.6475, timezone: 3, method: 5, region: 'مصر' },
  { name: 'دمياط', country: 'مصر', lat: 31.4175, lng: 31.8144, timezone: 3, method: 5, region: 'مصر' },
  { name: 'بورسعيد', country: 'مصر', lat: 31.2653, lng: 32.3019, timezone: 3, method: 5, region: 'مصر' },
  { name: 'الإسماعيلية', country: 'مصر', lat: 30.5965, lng: 32.2715, timezone: 3, method: 5, region: 'مصر' },
  { name: 'السويس', country: 'مصر', lat: 29.9668, lng: 32.5498, timezone: 3, method: 5, region: 'مصر' },
  { name: 'الفيوم', country: 'مصر', lat: 29.3084, lng: 30.8428, timezone: 3, method: 5, region: 'مصر' },
  { name: 'بني سويف', country: 'مصر', lat: 29.0661, lng: 31.0994, timezone: 3, method: 5, region: 'مصر' },
  { name: 'المنيا', country: 'مصر', lat: 28.1099, lng: 30.7503, timezone: 3, method: 5, region: 'مصر' },
  { name: 'أسيوط', country: 'مصر', lat: 27.1809, lng: 31.1837, timezone: 3, method: 5, region: 'مصر' },
  { name: 'سوهاج', country: 'مصر', lat: 26.5569, lng: 31.6948, timezone: 3, method: 5, region: 'مصر' },
  { name: 'قنا', country: 'مصر', lat: 26.1551, lng: 32.7160, timezone: 3, method: 5, region: 'مصر' },
  { name: 'الأقصر', country: 'مصر', lat: 25.6872, lng: 32.6396, timezone: 3, method: 5, region: 'مصر' },
  { name: 'أسوان', country: 'مصر', lat: 24.0889, lng: 32.8998, timezone: 3, method: 5, region: 'مصر' },
  { name: 'الغردقة (البحر الأحمر)', country: 'مصر', lat: 27.2579, lng: 33.8116, timezone: 3, method: 5, region: 'مصر' },
  { name: 'شرم الشيخ (جنوب سيناء)', country: 'مصر', lat: 27.9158, lng: 34.3299, timezone: 3, method: 5, region: 'مصر' },
  { name: 'العريش (شمال سيناء)', country: 'مصر', lat: 31.1316, lng: 33.7984, timezone: 3, method: 5, region: 'مصر' },
  { name: 'مرسى مطروح', country: 'مصر', lat: 31.3543, lng: 27.2373, timezone: 3, method: 5, region: 'مصر' },
  { name: 'الخارجة (الوادي الجديد)', country: 'مصر', lat: 25.4514, lng: 30.5472, timezone: 3, method: 5, region: 'مصر' },
  { name: 'مدينة 6 أكتوبر', country: 'مصر', lat: 29.9723, lng: 30.9328, timezone: 3, method: 5, region: 'مصر' },
  { name: 'القاهرة الجديدة (التجمع)', country: 'مصر', lat: 30.0074, lng: 31.4913, timezone: 3, method: 5, region: 'مصر' },
  { name: 'العاشر من رمضان', country: 'مصر', lat: 30.2974, lng: 31.7423, timezone: 3, method: 5, region: 'مصر' },
  { name: 'العاصمة الإدارية الجديدة', country: 'مصر', lat: 30.0150, lng: 31.7450, timezone: 3, method: 5, region: 'مصر' },

  // --- المملكة العربية السعودية (تقويم أم القرى) ---
  { name: 'مكة المكرمة', country: 'السعودية', lat: 21.4225, lng: 39.8262, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'المدينة المنورة', country: 'السعودية', lat: 24.4672, lng: 39.6111, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'الرياض', country: 'السعودية', lat: 24.7136, lng: 46.6753, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'جدة', country: 'السعودية', lat: 21.5433, lng: 39.1728, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'الدمام', country: 'السعودية', lat: 26.4207, lng: 50.0888, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'الخبر', country: 'السعودية', lat: 26.2172, lng: 50.1971, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'الطائف', country: 'السعودية', lat: 21.2854, lng: 40.4222, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'تبوك', country: 'السعودية', lat: 28.3835, lng: 36.5662, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'بريدة (القصيم)', country: 'السعودية', lat: 26.3592, lng: 43.9818, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'أبها (عسير)', country: 'السعودية', lat: 18.2164, lng: 42.5053, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'خميس مشيط', country: 'السعودية', lat: 18.3000, lng: 42.7333, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'حائل', country: 'السعودية', lat: 27.5114, lng: 41.7208, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'نجران', country: 'السعودية', lat: 17.4924, lng: 44.1277, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'جازان', country: 'السعودية', lat: 16.8892, lng: 42.5706, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'الهفوف (الأحساء)', country: 'السعودية', lat: 25.3647, lng: 49.5855, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'الجبيل', country: 'السعودية', lat: 27.0046, lng: 49.6591, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'ينبع', country: 'السعودية', lat: 24.0895, lng: 38.0618, timezone: 3, method: 4, region: 'الخليج' },

  // --- فلسطين والأردن وبلاد الشام ---
  { name: 'القدس الشريف', country: 'فلسطين', lat: 31.7683, lng: 35.2137, timezone: 3, method: 3, region: 'الشام' },
  { name: 'غزة', country: 'فلسطين', lat: 31.5017, lng: 34.4668, timezone: 3, method: 3, region: 'الشام' },
  { name: 'رام الله', country: 'فلسطين', lat: 31.9038, lng: 35.2034, timezone: 3, method: 3, region: 'الشام' },
  { name: 'الخليل', country: 'فلسطين', lat: 31.5326, lng: 35.0998, timezone: 3, method: 3, region: 'الشام' },
  { name: 'نابلس', country: 'فلسطين', lat: 32.2211, lng: 35.2544, timezone: 3, method: 3, region: 'الشام' },
  { name: 'عمان', country: 'الأردن', lat: 31.9454, lng: 35.9284, timezone: 3, method: 3, region: 'الشام' },
  { name: 'الزرقاء', country: 'الأردن', lat: 32.0608, lng: 36.0942, timezone: 3, method: 3, region: 'الشام' },
  { name: 'إربد', country: 'الأردن', lat: 32.5568, lng: 35.8469, timezone: 3, method: 3, region: 'الشام' },
  { name: 'العقبة', country: 'الأردن', lat: 29.5321, lng: 35.0063, timezone: 3, method: 3, region: 'الشام' },
  { name: 'دمشق', country: 'سوريا', lat: 33.5138, lng: 36.2765, timezone: 3, method: 3, region: 'الشام' },
  { name: 'حلب', country: 'سوريا', lat: 36.2021, lng: 37.1343, timezone: 3, method: 3, region: 'الشام' },
  { name: 'حمص', country: 'سوريا', lat: 34.7324, lng: 36.7137, timezone: 3, method: 3, region: 'الشام' },
  { name: 'بيروت', country: 'لبنان', lat: 33.8938, lng: 35.5018, timezone: 3, method: 3, region: 'الشام' },
  { name: 'طرابلس (لبنان)', country: 'لبنان', lat: 34.4367, lng: 35.8497, timezone: 3, method: 3, region: 'الشام' },

  // --- الإمارات والخليج العربي ---
  { name: 'دبي', country: 'الإمارات', lat: 25.2048, lng: 55.2708, timezone: 4, method: 4, region: 'الخليج' },
  { name: 'أبو ظبي', country: 'الإمارات', lat: 24.4539, lng: 54.3773, timezone: 4, method: 4, region: 'الخليج' },
  { name: 'الشارقة', country: 'الإمارات', lat: 25.3463, lng: 55.4209, timezone: 4, method: 4, region: 'الخليج' },
  { name: 'العين', country: 'الإمارات', lat: 24.2075, lng: 55.7447, timezone: 4, method: 4, region: 'الخليج' },
  { name: 'الكويت (العاصمة)', country: 'الكويت', lat: 29.3759, lng: 47.9774, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'الدوحة', country: 'قطر', lat: 25.2854, lng: 51.5310, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'المنامة', country: 'البحرين', lat: 26.2285, lng: 50.5860, timezone: 3, method: 4, region: 'الخليج' },
  { name: 'مسقط', country: 'عمان', lat: 23.5880, lng: 58.3829, timezone: 4, method: 4, region: 'الخليج' },
  { name: 'صلالة', country: 'عمان', lat: 17.0151, lng: 54.0924, timezone: 4, method: 4, region: 'الخليج' },

  // --- العراق واليمن ---
  { name: 'بغداد', country: 'العراق', lat: 33.3152, lng: 44.3661, timezone: 3, method: 3, region: 'العراق' },
  { name: 'البصرة', country: 'العراق', lat: 30.5081, lng: 47.7835, timezone: 3, method: 3, region: 'العراق' },
  { name: 'أربيل', country: 'العراق', lat: 36.1901, lng: 44.0091, timezone: 3, method: 3, region: 'العراق' },
  { name: 'الموصل', country: 'العراق', lat: 36.3400, lng: 43.1300, timezone: 3, method: 3, region: 'العراق' },
  { name: 'النجف الأشرف', country: 'العراق', lat: 31.9961, lng: 44.3314, timezone: 3, method: 3, region: 'العراق' },
  { name: 'كربلاء المقدسة', country: 'العراق', lat: 32.6160, lng: 44.0249, timezone: 3, method: 3, region: 'العراق' },
  { name: 'صنعاء', country: 'اليمن', lat: 15.3694, lng: 44.1910, timezone: 3, method: 4, region: 'اليمن' },
  { name: 'عدن', country: 'اليمن', lat: 12.7855, lng: 45.0187, timezone: 3, method: 4, region: 'اليمن' },
  { name: 'تعز', country: 'اليمن', lat: 13.5789, lng: 44.0178, timezone: 3, method: 4, region: 'اليمن' },

  // --- المغرب العربي وشمال أفريقيا والسودان ---
  { name: 'الخرطوم', country: 'السودان', lat: 15.5007, lng: 32.5599, timezone: 2, method: 5, region: 'شمال أفريقيا' },
  { name: 'بورتسودان', country: 'السودان', lat: 19.6175, lng: 37.2164, timezone: 2, method: 5, region: 'شمال أفريقيا' },
  { name: 'طرابلس (ليبيا)', country: 'ليبيا', lat: 32.8872, lng: 13.1913, timezone: 2, method: 3, region: 'شمال أفريقيا' },
  { name: 'بنغازي', country: 'ليبيا', lat: 32.1167, lng: 20.0667, timezone: 2, method: 3, region: 'شمال أفريقيا' },
  { name: 'تونس (العاصمة)', country: 'تونس', lat: 36.8065, lng: 10.1815, timezone: 1, method: 3, region: 'شمال أفريقيا' },
  { name: 'صفاقس', country: 'تونس', lat: 34.7406, lng: 10.7603, timezone: 1, method: 3, region: 'شمال أفريقيا' },
  { name: 'سوسة', country: 'تونس', lat: 35.8256, lng: 10.6369, timezone: 1, method: 3, region: 'شمال أفريقيا' },
  { name: 'الجزائر (العاصمة)', country: 'الجزائر', lat: 36.7538, lng: 3.0588, timezone: 1, method: 3, region: 'شمال أفريقيا' },
  { name: 'وهران', country: 'الجزائر', lat: 35.6987, lng: -0.6349, timezone: 1, method: 3, region: 'شمال أفريقيا' },
  { name: 'قسنطينة', country: 'الجزائر', lat: 36.3650, lng: 6.6147, timezone: 1, method: 3, region: 'شمال أفريقيا' },
  { name: 'الرباط', country: 'المغرب', lat: 34.0209, lng: -6.8416, timezone: 1, method: 3, region: 'المغرب' },
  { name: 'الدار البيضاء', country: 'المغرب', lat: 33.5731, lng: -7.5898, timezone: 1, method: 3, region: 'المغرب' },
  { name: 'مراكش', country: 'المغرب', lat: 31.6295, lng: -7.9811, timezone: 1, method: 3, region: 'المغرب' },
  { name: 'فاس', country: 'المغرب', lat: 34.0331, lng: -5.0003, timezone: 1, method: 3, region: 'المغرب' },
  { name: 'طنجة', country: 'المغرب', lat: 35.7595, lng: -5.8340, timezone: 1, method: 3, region: 'المغرب' },
  { name: 'أكادير', country: 'المغرب', lat: 30.4278, lng: -9.5981, timezone: 1, method: 3, region: 'المغرب' },
  { name: 'نواكشوط', country: 'موريتانيا', lat: 18.0735, lng: -15.9582, timezone: 0, method: 3, region: 'شمال أفريقيا' },
  { name: 'مقديشو', country: 'الصومال', lat: 2.0469, lng: 45.3182, timezone: 3, method: 3, region: 'أفريقيا' },
  { name: 'جيبوتي (العاصمة)', country: 'جيبوتي', lat: 11.8251, lng: 42.5903, timezone: 3, method: 3, region: 'أفريقيا' },

  // --- تركيا والعالم الإسلامي والعواصم العالمية ---
  { name: 'إسطنبول', country: 'تركيا', lat: 41.0082, lng: 28.9784, timezone: 3, method: 13, region: 'تركيا' },
  { name: 'أنقرة', country: 'تركيا', lat: 39.9334, lng: 32.8597, timezone: 3, method: 13, region: 'تركيا' },
  { name: 'كوالالمبور', country: 'ماليزيا', lat: 3.1390, lng: 101.6869, timezone: 8, method: 3, region: 'آسيا' },
  { name: 'جاكرتا', country: 'إندونيسيا', lat: -6.2088, lng: 106.8456, timezone: 7, method: 3, region: 'آسيا' },
  { name: 'إسلام آباد', country: 'باكستان', lat: 33.6844, lng: 73.0479, timezone: 5, method: 1, region: 'آسيا' },
  { name: 'كراتشي', country: 'باكستان', lat: 24.8607, lng: 67.0011, timezone: 5, method: 1, region: 'آسيا' },
  { name: 'دكا', country: 'بنغلاديش', lat: 23.8103, lng: 90.4125, timezone: 6, method: 1, region: 'آسيا' },
  { name: 'لندن', country: 'المملكة المتحدة', lat: 51.5074, lng: -0.1278, timezone: 1, method: 3, region: 'أوروبا' },
  { name: 'باريس', country: 'فرنسا', lat: 48.8566, lng: 2.3522, timezone: 2, method: 3, region: 'أوروبا' },
  { name: 'برلين', country: 'ألمانيا', lat: 52.5200, lng: 13.4050, timezone: 2, method: 3, region: 'أوروبا' },
  { name: 'نيويورك', country: 'الولايات المتحدة', lat: 40.7128, lng: -74.0060, timezone: -4, method: 2, region: 'أمريكا' },
  { name: 'شيكاغو', country: 'الولايات المتحدة', lat: 41.8781, lng: -87.6298, timezone: -5, method: 2, region: 'أمريكا' },
  { name: 'لوس أنجلوس', country: 'الولايات المتحدة', lat: 34.0522, lng: -118.2437, timezone: -7, method: 2, region: 'أمريكا' },
  { name: 'تورونتو', country: 'كندا', lat: 43.6532, lng: -79.3832, timezone: -4, method: 2, region: 'أمريكا' },
  { name: 'سيدني', country: 'أستراليا', lat: -33.8688, lng: 151.2093, timezone: 10, method: 3, region: 'أستراليا' }
];

/**
 * Calculates the exact Sun Position (Azimuth and Altitude) for a given date, latitude, and longitude.
 * Used for the authentic Sun & Shadow Qibla determination method.
 */
export function calculateSunPosition(date: Date, lat: number, lng: number): {
  azimuth: number; // 0° = North, 90° = East, 180° = South, 270° = West
  altitude: number; // in degrees, > 0 means sun is above horizon
  isDaytime: boolean;
  shadowBearing: number; // Direction the shadow points to on the ground
} {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  // Day of year
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Fractional year in radians
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (date.getUTCHours() - 12) / 24);

  // Equation of time in minutes
  const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));

  // Solar declination angle in radians
  const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);

  // Time offset in minutes
  const timeOffset = eqtime + 4 * lng;

  // True solar time in minutes from midnight UTC
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  let tst = utcMinutes + timeOffset;
  while (tst < 0) tst += 1440;
  while (tst >= 1440) tst -= 1440;

  // Solar hour angle in degrees
  let ha = tst / 4 - 180;
  if (ha < -180) ha += 360;

  const latRad = lat * rad;
  const haRad = ha * rad;

  // Solar Zenith Angle & Altitude
  const csz = Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(haRad);
  const zenithRad = Math.acos(Math.max(-1, Math.min(1, csz)));
  const altitude = 90 - zenithRad * deg;

  // Solar Azimuth Angle (clockwise from North)
  let azimuthRad = 0;
  const sinZenith = Math.sin(zenithRad);
  if (sinZenith > 0.0001) {
    const cosAz = (Math.sin(decl) - Math.sin(latRad) * Math.cos(zenithRad)) / (Math.cos(latRad) * sinZenith);
    azimuthRad = Math.acos(Math.max(-1, Math.min(1, cosAz)));
    if (ha > 0) {
      azimuthRad = 2 * Math.PI - azimuthRad;
    }
  }

  let azimuth = (azimuthRad * deg + 180) % 360; // Convert to standard 0°=North, 90°=East
  // Shadow points in exact opposite direction of sun azimuth
  const shadowBearing = (azimuth + 180) % 360;

  return {
    azimuth: Math.round(azimuth * 10) / 10,
    altitude: Math.round(altitude * 10) / 10,
    isDaytime: altitude > -0.833, // Standard atmospheric refraction threshold
    shadowBearing: Math.round(shadowBearing * 10) / 10,
  };
}

