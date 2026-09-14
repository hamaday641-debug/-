import React, { useState } from 'react';
import { Layers, MapPin, Navigation, ZoomIn, ZoomOut, ExternalLink, Compass, CheckCircle } from 'lucide-react';
import { KAABA_LAT, KAABA_LNG } from '../utils/qiblaLocation';

interface QiblaMapViewerProps {
  cityLat: number;
  cityLng: number;
  cityName: string;
  qiblaBearing: number;
  distanceKm: number;
}

export const QiblaMapViewer: React.FC<QiblaMapViewerProps> = ({
  cityLat,
  cityLng,
  cityName,
  qiblaBearing,
  distanceKm,
}) => {
  const [mapType, setMapType] = useState<'satellite' | 'street'>('satellite');
  const [zoomLevel, setZoomLevel] = useState<number>(17);

  // Generate OpenStreetMap / Esri Satellite embed URL centered on user location
  // For satellite, we use ArcGIS World Imagery / OSM with clean controls
  const bboxSize = 0.005 * Math.pow(2, 17 - zoomLevel);
  const bbox = `${cityLng - bboxSize},${cityLat - bboxSize},${cityLng + bboxSize},${cityLat + bboxSize}`;

  // Interactive OpenStreetMap / Google Maps embed URL
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${cityLat},${cityLng}`;
  const satelliteEmbedUrl = `https://maps.google.com/maps?q=${cityLat},${cityLng}&t=k&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-4 text-right">
      {/* Overview Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 space-y-2">
        <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <h4 className="text-sm sm:text-base font-arabic">
            تحديد القبلة بالخريطة الفضائية المباشرة (أدق طريقة عملية للمنازل والشوارع)
          </h4>
        </div>
        <p className="text-xs leading-relaxed text-stone-700 dark:text-emerald-100/90">
          انظر إلى الخريطة وأسماء الشوارع أدناه: الخط الأخضر والشعاع يشيران مباشرة من موقعك في <strong>{cityName}</strong> نحو <strong>الكعبة المشرفة بمكة المكرمة</strong> بزاوية <strong>{Math.round(qiblaBearing)}° (جنوب شرق)</strong>. يمكنك مطابقة الخط مع جدران غرفتك أو واجهة منزلك بسهولة دون الحاجة لحساس الهاتف.
        </p>
      </div>

      {/* Map Frame Container with Ray Overlay */}
      <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border-2 border-[#2D4536] shadow-xl bg-stone-900">
        <iframe
          title="خريطة مسار القبلة"
          src={mapType === 'satellite' ? satelliteEmbedUrl : osmEmbedUrl}
          className="w-full h-full border-0 pointer-events-auto"
          loading="lazy"
        />

        {/* Center Crosshair & Qibla Vector Ray Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Laser Qibla Line from Center */}
          <div
            className="absolute w-1 h-36 sm:h-44 origin-bottom flex flex-col items-center justify-start pointer-events-none transition-transform duration-300"
            style={{
              bottom: '50%',
              left: 'calc(50% - 2px)',
              transform: `rotate(${qiblaBearing}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            {/* Kaaba Badge at tip */}
            <div className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1 border border-white -mt-3 animate-bounce">
              <span>الكعبة 🕋</span>
            </div>
            {/* Pulsing Ray */}
            <div className="w-1 flex-1 bg-gradient-to-t from-emerald-500 via-emerald-400 to-yellow-300 shadow-[0_0_12px_#10B981]" />
          </div>

          {/* User Location Center Pin */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-red-600 border-2 border-white shadow-2xl flex items-center justify-center animate-pulse">
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </div>
            <span className="bg-black/80 text-white font-bold text-[9px] px-1.5 py-0.5 rounded mt-1">
              موقعك هنا
            </span>
          </div>

          {/* North Indicator Badge in Top Right */}
          <div className="absolute top-3 right-3 bg-black/85 text-white border border-white/20 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
            <Compass className="w-4 h-4 text-red-500 animate-spin-slow" />
            <span className="font-mono text-red-400">N (الشمال 0°)</span>
          </div>

          {/* Bearing Overlay Badge in Top Left */}
          <div className="absolute top-3 left-3 bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>القبلة: <strong className="text-white font-mono">{Math.round(qiblaBearing)}°</strong> جنوب شرق</span>
          </div>
        </div>

        {/* Map Control Floating Toolbar */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-20">
          <button
            type="button"
            onClick={() => setMapType(mapType === 'satellite' ? 'street' : 'satellite')}
            className="px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-bold flex items-center gap-1 border border-white/20 shadow-lg backdrop-blur-sm cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#E9B161]" />
            <span>{mapType === 'satellite' ? 'عرض الشوارع' : 'عرض القمر الصناعي'}</span>
          </button>

          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(19, z + 1))}
            className="w-8 h-8 rounded-xl bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-lg cursor-pointer"
            title="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(12, z - 1))}
            className="w-8 h-8 rounded-xl bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-lg cursor-pointer"
            title="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Links & External Fullscreen Map */}
      <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#2D4536] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-stone-700 dark:text-[#A8BCAD]">
          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>المسافة المستقيمة إلى الكعبة: <strong>{distanceKm.toLocaleString('ar-EG')} كم</strong></span>
        </div>

        <button
          type="button"
          onClick={() => {
            window.open(
              `https://www.google.com/maps/dir/${cityLat},${cityLng}/${KAABA_LAT},${KAABA_LNG}`,
              '_blank'
            );
          }}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>فتح المسار عالي الدقة في Google Maps</span>
        </button>
      </div>
    </div>
  );
};
