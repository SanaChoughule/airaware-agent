import React from 'react';
import {
  Activity,
  Calendar,
  Map as MapIcon,
  Home,
  Bot,
  Award,
  Layers,
  Info
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity, desc: 'Real-time AQI & Gauges' },
    { id: 'planner', label: 'Daily Planner', icon: Calendar, desc: 'Adaptive Routine Engine' },
    { id: 'map', label: 'Air Quality Map', icon: MapIcon, desc: 'Hotspots & Stations' },
    { id: 'indoor', label: 'Indoor Air', icon: Home, desc: 'Filtration & Clean Home' },
    { id: 'assistant', label: 'AI Assistant', icon: Bot, desc: 'Gemini Environmental Guide' },
    { id: 'impact', label: 'My Impact', icon: Award, desc: 'Sustainable Action Score' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#101510] border-r border-[#273128] min-h-[calc(100vh-65px)] p-4 justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-[#9BA69B] uppercase px-3">
            Navigation
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all group ${
                    isActive
                      ? 'bg-[#151B16] text-[#B7F56A] font-semibold border border-[#344A35] shadow-lg shadow-[#B7F56A]/5'
                      : 'text-[#9BA69B] hover:text-[#F2F5F1] hover:bg-[#151B16]/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#B7F56A]' : 'text-[#9BA69B]'
                    }`}
                  />
                  <div>
                    <div className="text-sm leading-none">{item.label}</div>
                    <div className="text-[10px] text-[#9BA69B] mt-1 font-normal opacity-80 leading-none">
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Semantic Quality Guide Box */}
        <div className="p-3.5 rounded-2xl bg-[#151B16] border border-[#273128]/80 text-xs">
          <div className="flex items-center gap-2 mb-2 font-semibold text-[#F2F5F1]">
            <Layers className="w-3.5 h-3.5 text-[#B7F56A]" /> AQI Scales (WHO)
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#65C46D]">
                <span className="w-2 h-2 rounded-full bg-[#65C46D]"></span> Good
              </span>
              <span className="font-mono text-[#9BA69B]">0 – 50</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#FACC15]">
                <span className="w-2 h-2 rounded-full bg-[#FACC15]"></span> Moderate
              </span>
              <span className="font-mono text-[#9BA69B]">51 – 100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#FB923C]">
                <span className="w-2 h-2 rounded-full bg-[#FB923C]"></span> Poor
              </span>
              <span className="font-mono text-[#9BA69B]">101 – 200</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#EF4444]">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span> Very Poor
              </span>
              <span className="font-mono text-[#9BA69B]">201 – 300</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#7F1D1D]">
                <span className="w-2 h-2 rounded-full bg-[#7F1D1D]"></span> Severe
              </span>
              <span className="font-mono text-[#9BA69B]">300+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[#273128] text-[11px] text-[#9BA69B]">
        <div className="flex items-center gap-1.5 text-[#F2F5F1] font-medium mb-1">
          <Info className="w-3.5 h-3.5 text-[#B7F56A]" /> Environmental Guard
        </div>
        <p className="text-[10px] leading-relaxed">
          Ground-level particulate sensors & Gemini conversational inference.
        </p>
      </div>
    </aside>
  );
};

export const MobileNav: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'overview', label: 'AQI', icon: Activity },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'indoor', label: 'Indoor', icon: Home },
    { id: 'assistant', label: 'AI', icon: Bot },
    { id: 'impact', label: 'Impact', icon: Award },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#101510]/95 backdrop-blur-lg border-t border-[#273128] px-2 py-2 z-50 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              isActive ? 'text-[#B7F56A]' : 'text-[#9BA69B]'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
