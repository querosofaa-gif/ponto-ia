
import React from 'react';
import { User, TimeRecord, Announcement } from '../types';

interface EmployeeDashboardProps {
  user: User;
  onClockIn: () => void;
  onNavigate: (tab: string) => void;
  history: TimeRecord[];
  announcements?: Announcement[];
  documentCount?: number;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ 
  user, 
  onClockIn, 
  onNavigate, 
  history, 
  announcements = [],
  documentCount = 0
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <img 
                src={`https://ui-avatars.com/api/?name=${user.name}&background=10b981&color=fff&size=128`} 
                alt="Profile" 
                className="w-20 h-20 rounded-[2rem] border-4 border-white/10 shadow-2xl"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                <i className="fas fa-check text-[8px]"></i>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1 tracking-tight">Olá, {user.name}! 👋</h1>
              <p className="text-slate-400 flex items-center font-medium text-sm">
                <i className="fas fa-id-badge mr-2 text-emerald-400"></i>
                Matrícula: #{user.id.slice(0, 6).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onClockIn}
              className="group bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-black transition-all transform hover:scale-105 shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-3 active:scale-95"
            >
              <i className="fas fa-fingerprint text-2xl group-hover:animate-pulse"></i>
              <span>BATER PONTO</span>
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => onNavigate('history')}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center group hover:border-emerald-500 transition-all cursor-pointer hover:shadow-xl hover:scale-[1.02]"
        >
            <div className="bg-emerald-100 dark:bg-emerald-500/10 p-4 rounded-2xl text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-hourglass-half text-2xl"></i>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Ponto Digital</p>
            <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">Banco de Horas</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">+12:15</p>
        </button>
        <button 
          onClick={() => onNavigate('payslips')}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center group hover:border-blue-500 transition-all cursor-pointer hover:shadow-xl hover:scale-[1.02]"
        >
            <div className="bg-blue-100 dark:bg-blue-500/10 p-4 rounded-2xl text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-dollar-sign text-2xl"></i>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Financeiro</p>
            <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">Salário Estimado</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">R$ 4.250</p>
        </button>
        <button 
          onClick={() => onNavigate('documents')}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center group hover:border-indigo-500 transition-all cursor-pointer hover:shadow-xl hover:scale-[1.02]"
        >
            <div className="bg-indigo-100 dark:bg-indigo-500/10 p-4 rounded-2xl text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-folder-open text-2xl"></i>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Repositório</p>
            <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">Meus Documentos</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{documentCount} Arquivos</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Mural de Avisos</h3>
          </div>
          <div className="p-6 space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">{ann.category}</span>
                  <span className="text-[9px] text-slate-400 font-bold">{new Date(ann.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{ann.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Histórico Recente</h3>
              <button 
                onClick={() => onNavigate('history')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase"
              >
                Ver tudo
              </button>
          </div>
          <div className="p-6">
              {history.length > 0 ? (
                  <div className="space-y-3">
                      {history.map((record) => (
                          <div key={record.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                              <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm ${
                                      record.type === 'IN' ? 'bg-emerald-500' : 'bg-slate-700'
                                  }`}>
                                      <i className={`fas ${record.type === 'IN' ? 'fa-sign-in-alt' : 'fa-sign-out-alt'}`}></i>
                                  </div>
                                  <div>
                                      <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                          {record.type === 'IN' ? 'Entrada' : 'Saída'}
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-bold">
                                          {new Date(record.timestamp).toLocaleString('pt-BR')}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-12 text-slate-400">
                      <p className="text-sm">Sem registros hoje.</p>
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
