
import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, onLogout, isOpen = false, onClose }) => {
  const menuItems = role === UserRole.ADMIN 
    ? [
        { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
        { id: 'users', icon: 'fa-users', label: 'Colaboradores' },
        { id: 'points', icon: 'fa-clock', label: 'Gestão de Pontos' },
        { id: 'vacations', icon: 'fa-umbrella-beach', label: 'Gestão de Férias' },
        { id: 'birthdays', icon: 'fa-cake-candles', label: 'Aniversariantes' }, // Nova aba
        { id: 'payroll', icon: 'fa-file-invoice-dollar', label: 'Folha Pagto' },
        { id: 'documents', icon: 'fa-folder-open', label: 'Documentos' },
        { id: 'settings', icon: 'fa-cog', label: 'Configurações' },
      ]
    : [
        { id: 'clock', icon: 'fa-camera', label: 'Bater Ponto' },
        { id: 'history', icon: 'fa-calendar-alt', label: 'Meu Histórico' },
        { id: 'payslips', icon: 'fa-receipt', label: 'Holerites' },
        { id: 'documents', icon: 'fa-folder-open', label: 'Meus Documentos' },
      ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 flex flex-col text-slate-300 transition-transform duration-300 ease-in-out shrink-0
      md:relative md:translate-x-0 md:flex
      ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
    `}>
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
            <i className="fas fa-fingerprint text-white text-xl"></i>
          </div>
          <span className="text-xl font-bold text-white tracking-tight uppercase italic">SmartPonto</span>
        </div>
        <button onClick={onClose} className="md:hidden w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white"><i className="fas fa-times"></i></button>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl transition-all ${
              activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-800'
            }`}
          >
            <i className={`fas ${item.icon} w-6 text-center text-lg`}></i>
            <span className="font-bold text-sm uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button onClick={onLogout} className="w-full flex items-center space-x-4 px-4 py-4 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-slate-500">
          <i className="fas fa-sign-out-alt w-6 text-center text-lg"></i>
          <span className="font-black uppercase tracking-widest text-[11px]">Sair da Conta</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
