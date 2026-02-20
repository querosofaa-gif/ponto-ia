
import React, { useState } from 'react';
import { AuditEntry } from '../types';

interface AuditLogViewProps {
  logs: AuditEntry[];
}

const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.targetName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' ? true : log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      USER: 'bg-blue-100 text-blue-700',
      POINT: 'bg-amber-100 text-amber-700',
      VACATION: 'bg-emerald-100 text-emerald-700',
      HOLIDAY: 'bg-purple-100 text-purple-700',
      SYSTEM: 'bg-slate-100 text-slate-700'
    };
    return styles[category] || styles.SYSTEM;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Buscar por admin, ação ou alvo..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {['ALL', 'USER', 'POINT', 'VACATION', 'HOLIDAY'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === cat ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-xl font-bold text-slate-800">Histórico de Auditoria</h3>
          <span className="text-sm font-medium text-slate-400">{filteredLogs.length} registros encontrados</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-shrink-0 flex items-center space-x-4 md:w-48">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <i className="fas fa-user-shield"></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{log.adminName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${getCategoryBadge(log.category)}`}>
                      {log.category}
                    </span>
                    <span className="text-sm font-bold text-slate-800">{log.action}</span>
                  </div>
                  <p className="text-sm text-slate-500">{log.details}</p>
                </div>

                <div className="md:w-40 text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(log.timestamp).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-400">
              <i className="fas fa-shield-alt text-5xl mb-4 opacity-10"></i>
              <p>Nenhum log de auditoria registrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogView;
