// Sidebar.tsx
import React from 'react';
import Button from './Button'; // Path relative to src/components/
import { BookOpen, Edit, Mic, Share2, BarChart2, ShieldCheck, Home, Layers } from 'lucide-react'; // Lucide React icons

interface SidebarProps {
  onNavigate: (module: string) => void;
  activeModule: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeModule }) => {
  const navItems = [
    { name: 'Welcome', icon: Home, module: 'welcome' },
    { name: 'Knowledge Hub', icon: BookOpen, module: 'knowledge-hub' },
    { name: 'Writer\'s Room', icon: Edit, module: 'writer-room' },
    { name: 'Research Engine', icon: Layers, module: 'research-engine' },
    { name: 'Production Pipeline', icon: Mic, module: 'production-pipeline' },
    { name: 'Distribution Engine', icon: Share2, module: 'distribution-engine' },
    { name: 'Analytics Dashboard', icon: BarChart2, module: 'analytics-dashboard' },
    { name: 'Ethical Guardrails', icon: ShieldCheck, module: 'ethical-guardrails' },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white p-4 flex flex-col h-full shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-blue-300">Semina Verbi</h1>
        <p className="text-sm text-gray-400">Workspace</p>
      </div>
      <nav className="flex-grow space-y-2" aria-label="Main Sidebar Navigation">
        {navItems.map((item) => (
          <Button
            key={item.module}
            variant={activeModule === item.module ? 'primary' : 'ghost'}
            onClick={() => onNavigate(item.module)}
            className={`w-full justify-start text-left flex items-center ${activeModule === item.module ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            aria-current={activeModule === item.module ? 'page' : undefined}
            aria-label={`Go to ${item.name}`}
          >
            <item.icon size={20} className="mr-3" aria-hidden="true" />
            {item.name}
          </Button>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-700 text-sm text-gray-400 text-center">
        Version 1.0 MVF
      </div>
    </div>
  );
};

export default Sidebar;