import React from 'react';

export interface GridMenuTab {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}

interface GridMenuProps {
  tabs: GridMenuTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function GridMenu({ tabs, activeTab, onTabChange }: GridMenuProps) {
  if (tabs.length === 0) return null;
  
  return (
    <div className="grid grid-cols-4 gap-2 px-1">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
              isActive 
                ? `${tab.bg} ${tab.border} shadow-sm scale-105` 
                : 'bg-white border-gray-100 hover:bg-gray-50'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-white shadow-sm' : tab.bg}`}>
              <Icon className={`w-4 h-4 ${tab.color}`} />
            </div>
            <span className={`text-[10px] sm:text-[11px] font-bold text-center leading-tight ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
