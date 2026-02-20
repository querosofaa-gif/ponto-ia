
import React, { useState, useMemo } from 'react';
import { VacationRequest, VacationStatus, Holiday, AuditEntry, User, ContractType } from '../types';
import { MOCK_HOLIDAYS } from '../constants';

interface VacationManagementProps {
  onLog: (category: AuditEntry['category'], action: string, targetId: string, targetName: string, details: string) => void;
  users?: User[];
  requests?: VacationRequest[];
  onUpdateStatus: (id: string, status: VacationStatus) => void;
}

const VacationManagement: React.FC<VacationManagementProps> = ({ onLog, users = [], requests = [], onUpdateStatus }) => {
  const [holidays, setHolidays] = useState<Holiday[]>(MOCK_HOLIDAYS);
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [filter, setFilter] = useState<VacationStatus | 'ALL'>('ALL');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRequest, setSelectedRequest] = useState<VacationRequest | null>(null);

  const getRequestUser = (userId: string): User | undefined => {
    return users.find(u => u.id === userId);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesStatus = filter === 'ALL' ? true : req.status === filter;
      const matchesEmployee = selectedEmployeeId === 'ALL' ? true : req.userId === selectedEmployeeId;
      return matchesStatus && matchesEmployee;
    });
  }, [requests, filter, selectedEmployeeId]);

  const stats = {
    pending: requests.filter(r => r.status === VacationStatus.PENDING).length,
    approved: requests.filter(r => r.status === VacationStatus.APPROVED).length,
    rejected: requests.filter(r => r.status === VacationStatus.REJECTED).length,
  };

  const formatDate = (dateStr: string | Date) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Pendentes</p>
          <p className="text-3xl font-black dark:text-white">{stats.pending}</p>
        </div>
        <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-xl shadow-emerald-500/20">
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Aprovadas</p>
          <p className="text-3xl font-black">{stats.approved}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Recusadas</p>
          <p className="text-3xl font-black dark:text-white">{stats.rejected}</p>
        </div>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
        <button onClick={() => setViewMode('LIST')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'LIST' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500'}`}>Lista</button>
        <button onClick={() => setViewMode('CALENDAR')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'CALENDAR' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500'}`}>Calendário</button>
      </div>

      {viewMode === 'LIST' ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-8 py-6">Colaborador</th>
                <th className="px-8 py-6">Período</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                <tr key={req.id} onClick={() => setSelectedRequest(req)} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-bold text-sm dark:text-white">{req.userName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{req.department}</p>
                  </td>
                  <td className="px-8 py-6 text-xs font-medium dark:text-slate-400">{formatDate(req.startDate)} - {formatDate(req.endDate)}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      req.status === VacationStatus.APPROVED ? 'bg-emerald-500/10 text-emerald-600' : 
                      req.status === VacationStatus.PENDING ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'
                    }`}>{req.status}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <i className="fas fa-chevron-right text-slate-300"></i>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 uppercase font-black text-xs tracking-widest opacity-50">Nenhuma solicitação encontrada</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border dark:border-slate-800">
           <p className="text-center text-slate-400 uppercase font-black text-xs">Modo Calendário em Desenvolvimento</p>
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[250] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-white/10">
             <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                     <i className="fas fa-umbrella-beach text-xl"></i>
                   </div>
                   <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter">{selectedRequest.userName}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedRequest.department}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><i className="fas fa-times"></i></button>
             </div>

             <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo de Férias</p>
                      <p className="text-3xl font-black text-emerald-600 leading-none">
                        {getRequestUser(selectedRequest.userId)?.vacationBalance ?? 0}
                        <span className="text-xs ml-1">dias</span>
                      </p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Período Solicitado</p>
                      <p className="font-bold text-slate-800 dark:text-white">{formatDate(selectedRequest.startDate)} a {formatDate(selectedRequest.endDate)}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Contrato</p>
                      <div className="flex items-center space-x-2 mt-1">
                         <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                           {getRequestUser(selectedRequest.userId)?.contractType || 'N/A'}
                         </span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Departamento / Setor</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                      <i className="fas fa-building mr-2 text-slate-400"></i>
                      {getRequestUser(selectedRequest.userId)?.department || selectedRequest.department}
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data de Solicitação</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      <i className="fas fa-calendar-check mr-2 text-slate-400"></i>
                      {formatDate(selectedRequest.requestDate)}
                    </p>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border dark:border-slate-800">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Observações do Colaborador</p>
                   <p className="text-sm font-medium dark:text-slate-300 italic leading-relaxed">
                     {selectedRequest.comment ? `"${selectedRequest.comment}"` : 'Nenhuma observação enviada pelo colaborador.'}
                   </p>
                </div>
             </div>

             <div className="p-8 bg-slate-50 dark:bg-slate-800/80 border-t dark:border-slate-700 flex space-x-4">
                {selectedRequest.status === VacationStatus.PENDING ? (
                  <>
                    <button 
                      onClick={() => { onUpdateStatus(selectedRequest.id, VacationStatus.REJECTED); setSelectedRequest(null); }} 
                      className="flex-1 py-5 bg-white dark:bg-slate-900 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-red-100 dark:border-red-900/30 hover:bg-red-50 transition-all active:scale-95"
                    >
                      Reprovar
                    </button>
                    <button 
                      onClick={() => { onUpdateStatus(selectedRequest.id, VacationStatus.APPROVED); setSelectedRequest(null); }} 
                      className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all active:scale-95"
                    >
                      Aprovar Férias
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setSelectedRequest(null)} 
                    className="w-full py-5 bg-slate-900 dark:bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:bg-slate-800"
                  >
                    Fechar Detalhes
                  </button>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacationManagement;
