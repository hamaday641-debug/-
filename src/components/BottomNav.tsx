import React from 'react';
import { 
  Home,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const handleSelectHome = () => {
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHomeActive = activeTab === 'home';

  return (
    <nav 
      id="main-bottom-nav" 
      aria-label="شريط التبويبات الرئيسي"
      className="fixed bottom-0 left-0 right-0 z-40 w-full bg-[#101D14]/95 backdrop-blur-xl border-t border-[#263D2D] shadow-[0_-4px_24px_rgba(0,0,0,0.5)] pt-2 pb-safe transition-all select-none touch-manipulation"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 0px)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 0px)',
      }}
    >
      <div className="w-full max-w-md mx-auto px-4 flex items-center justify-center">
        {/* الصفحة الرئيسية */}
        <button
          onClick={handleSelectHome}
          id="bottom-nav-tab-home"
          aria-label="الصفحة الرئيسية"
          className={`flex items-center justify-center gap-2.5 w-full py-2.5 px-6 rounded-2xl transition-all duration-200 shadow-md ${
            isHomeActive
              ? 'bg-gradient-to-r from-[#E9B161] to-[#D99A45] text-[#142E20] font-bold shadow-[#E9B161]/25 scale-[1.01]'
              : 'bg-[#18291F] hover:bg-[#203628] text-[#E0E7E1] hover:text-[#E9B161] border border-[#2D4536]'
          }`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isHomeActive ? 'bg-[#142E20] text-[#E9B161]' : 'bg-[#121F17] text-[#E9B161]'
          }`}>
            <Home className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold font-arabic leading-tight">
              الصفحة الرئيسية
            </span>
            <span className={`text-[10px] leading-tight ${isHomeActive ? 'text-[#142E20]/80 font-medium' : 'text-[#8FA797]'}`}>
              مركز جميع الأقسام والتطبيقات القرآنية
            </span>
          </div>
          <Sparkles className={`w-4 h-4 mr-auto ${isHomeActive ? 'text-[#142E20]' : 'text-[#E9B161]'}`} />
        </button>
      </div>
    </nav>
  );
};

