
import React, { useState } from 'react';
import { TimeRecord, User } from '../types';

interface PointHistoryViewProps {
  user: User;
  history: TimeRecord[];
  onBack: () => void;
  onOpenAdjustment: () => void;
}

const PointHistoryView: React.FC<PointHistoryViewProps> = ({ user, history, onBack, onOpenAdjustment }) => {
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());

  const typeLabels: Record<string, { label: string, color: string, icon: string }> = {
    IN: { label: 'Entrada', color: 'bg-emerald-500', icon: 'fa-sign-in-alt' },
    OUT: { label: 'Saída', color: 'bg-slate-700', icon: 'fa-sign-out-alt' },
    BREAK_START: { label: 'Início Pausa', color: 'bg-amber-500', icon: 'fa-mug-hot' },
    BREAK_END: { label: 'Fim Pausa', color: 'bg-sky-500', icon: 'fa-redo' },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 hover:text-emerald-600 transition-colors font-bold uppercase text-[10px] tracking-widest"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Voltar ao Dashboard</span>
        </button>
        <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <select 
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <option value={4}>Maio 2024</option>
            <option value={3}>Abril 2024</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Histórico Completo</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Registros de Ponto Digital</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo do Mês</p>
            <p className="text-xl font-black text-emerald-500">+12:45h</p>
          </div>
        </div>

        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {history.length > 0 ? (
            history.map((record) => (
              <div key={record.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group">
                <div className="flex items-center space-x-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${typeLabels[record.type].color} group-hover:scale-110 transition-transform`}>
                    <i className={`fas ${typeLabels[record.type].icon} text-lg`}></i>
                  </div>
                  <div>
                    <p className="font-black text-slate-800 dark:text-white uppercase tracking-tight">
                      {typeLabels[record.type].label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      {new Date(record.timestamp).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Localização</p>
                    <div className="flex items-center justify-end text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      <i className="fas fa-location-dot mr-1 text-red-400"></i>
                      Sede SP
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                      {new Date(record.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest ${
                      record.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {record.status === 'APPROVED' ? 'Validado' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
              <i className="fas fa-calendar-times text-5xl text-slate-200 dark:text-slate-800"></i>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum registro encontrado neste período</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-indigo-600 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl shadow-indigo-500/20">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <i className="fas fa-circle-info text-xl"></i>
          </div>
          <div>
            <p className="font-black uppercase tracking-tighter">Inconsistência no Ponto?</p>
            <p className="text-xs text-indigo-200">Caso esqueça de bater o ponto, abra uma solicitação de ajuste.</p>
          </div>
        </div>
        <button 
          onClick={onOpenAdjustment}
          className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all"
        >
          Solicitar Ajuste
        </button>
      </div>
    </div>
  );
};

export default PointHistoryView;
