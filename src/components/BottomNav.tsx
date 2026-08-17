import React from 'react';
import { 
  BookOpen, 
  BookMarked,
  Flame,
  Headphones, 
  Sun, 
  HeartHandshake, 
  Compass, 
  Sparkles 
} from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'reading' as ActiveTab, label: 'المصحف', icon: BookMarked },
    { id: 'khatmah' as ActiveTab, label: 'الورد والختمة', icon: Flame },
    { id: 'quran' as ActiveTab, label: 'السور والآيات', icon: BookOpen },
    { id: 'prayers' as ActiveTab, label: 'المواقيت', icon: Compass },
    { id: 'adhkar' as ActiveTab, label: 'الأذكار', icon: Sun },
    { id: 'duas' as ActiveTab, label: 'الأدعية', icon: HeartHandshake },
    { id: 'reciters' as ActiveTab, label: 'التلاوات', icon: Headphones },
    { id: 'tasbih' as ActiveTab, label: 'المسبحة', icon: Sparkles }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#1B3022]/95 dark:bg-[#101F14]/95 border-t border-[#2D4536] backdrop-blur-lg pb-safe shadow-2xl">
      <div className="max-w-4xl mx-auto px-1 flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              id={`tab-button-${tab.id}`}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 transition-all relative ${
                isActive
                  ? 'text-[#E9B161] font-bold'
                  : 'text-[#A8BCAD] hover:text-white'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[#2D4536] text-[#E9B161] scale-105 shadow-sm' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight truncate max-w-[48px] sm:max-w-[65px] text-center font-medium">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#E9B161]"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};


