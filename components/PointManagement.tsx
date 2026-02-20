
import React, { useState, useMemo } from 'react';
import { TimeRecord, AuditEntry, UserRole, User, PointAdjustmentRequest } from '../types';

interface PointManagementProps {
  onLog: (category: AuditEntry['category'], action: string, targetId: string, targetName: string, details: string) => void;
  timeRecords: TimeRecord[];
  onUpdateStatus: (recordId: string, status: 'APPROVED' | 'REJECTED') => void;
  users: User[];
  onAddManualPoint: (record: Omit<TimeRecord, 'id' | 'faceVerified'> & { reason: string }) => void;
  adjustments?: PointAdjustmentRequest[];
  onReviewAdjustment?: (id: string, status: 'APPROVED' | 'REJECTED') => void;
}

const PointManagement: React.FC<PointManagementProps> = ({ 
  onLog, timeRecords, onUpdateStatus, users, onAddManualPoint, adjustments = [], onReviewAdjustment 
}) => {
  const [activeTab, setActiveTab] = useState<'RECORDS' | 'ADJUSTMENTS'>('RECORDS');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const getUserInfo = (userId: string) => {
    return users.find(u => u.id === userId) || { name: 'Colaborador', department: 'Geral' };
  };

  const filteredRecords = useMemo(() => {
    return timeRecords.filter(record => {
      const userInfo = getUserInfo(record.userId);
      const matchesSearch = userInfo.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || record.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [timeRecords, filterStatus, searchTerm, users]);

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(adj => {
      const userInfo = getUserInfo(adj.userId);
      const matchesSearch = userInfo.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || adj.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [adjustments, filterStatus, searchTerm, users]);

  const typeLabels: Record<string, { label: string, color: string }> = {
    IN: { label: 'Entrada', color: 'text-emerald-500 bg-emerald-500/10' },
    OUT: { label: 'Saída', color: 'text-slate-500 bg-slate-500/10' },
    BREAK_START: { label: 'Início Pausa', color: 'text-amber-500 bg-amber-500/10' },
    BREAK_END: { label: 'Fim Pausa', color: 'text-sky-500 bg-sky-500/10' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Gestão de Batidas</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Monitore fotos e localizações de cada registro.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button onClick={() => setActiveTab('RECORDS')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'RECORDS' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>Registros</button>
          <button onClick={() => setActiveTab('ADJUSTMENTS')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ADJUSTMENTS' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'}`}>Ajustes ({adjustments.filter(a => a.status === 'PENDING').length})</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'RECORDS' ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Colaborador</th>
                  <th className="px-8 py-6">Evidência</th>
                  <th className="px-8 py-6">Tipo & Horário</th>
                  <th className="px-8 py-6">Biometria</th>
                  <th className="px-8 py-6 text-right">Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.map((row) => {
                  const userInfo = getUserInfo(row.userId);
                  return (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <i className="fas fa-user text-slate-400"></i>
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{userInfo.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{(userInfo as any).department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {row.photoUrl ? (
                          <div onClick={() => setPreviewPhoto(row.photoUrl!)} className="w-12 h-12 rounded-xl overflow-hidden cursor-pointer border-2 border-white dark:border-slate-800 shadow-sm">
                             <img src={row.photoUrl} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                             <i className={`fas ${row.isAdjustment ? 'fa-wrench' : 'fa-camera-slash'} text-xs`}></i>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className={`px-2 py-1 rounded text-[9px] font-black uppercase w-fit mb-1 ${typeLabels[row.type].color}`}>{typeLabels[row.type].label}</span>
                          <span className="text-xs font-bold dark:text-white">{new Date(row.timestamp).toLocaleTimeString('pt-BR')}</span>
                          <span className="text-[10px] text-slate-400">{new Date(row.timestamp).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${row.faceVerified ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-500'}`}>
                          <i className={`fas ${row.faceVerified ? 'fa-check-circle' : 'fa-shield'}`}></i>
                          <span>{row.faceVerified ? 'Biométrico' : row.isAdjustment ? 'Ajustado' : 'Manual'}</span>
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          row.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                          row.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>{row.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Colaborador</th>
                  <th className="px-8 py-6">Horário Solicitado</th>
                  <th className="px-8 py-6">Justificativa</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Revisão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAdjustments.map((adj) => {
                  const userInfo = getUserInfo(adj.userId);
                  return (
                    <tr key={adj.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-6 font-bold text-slate-700 dark:text-slate-200 text-sm">{userInfo.name}</td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-black dark:text-white uppercase tracking-tighter">{typeLabels[adj.type].label} {adj.time}</p>
                        <p className="text-[10px] text-slate-400">{adj.date}</p>
                      </td>
                      <td className="px-8 py-6 max-w-xs">
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium italic line-clamp-2">"{adj.reason}"</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          adj.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                          adj.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>{adj.status}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {adj.status === 'PENDING' && onReviewAdjustment && (
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => onReviewAdjustment(adj.id, 'APPROVED')} className="w-10 h-10 bg-emerald-600 text-white rounded-xl shadow-lg hover:scale-110 transition-all"><i className="fas fa-check"></i></button>
                            <button onClick={() => onReviewAdjustment(adj.id, 'REJECTED')} className="w-10 h-10 bg-red-600 text-white rounded-xl shadow-lg hover:scale-110 transition-all"><i className="fas fa-times"></i></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {previewPhoto && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[300] flex items-center justify-center p-10" onClick={() => setPreviewPhoto(null)}>
           <div className="max-w-2xl w-full bg-slate-900 rounded-[3rem] overflow-hidden border-4 border-white/10 relative">
              <img src={previewPhoto} className="w-full h-auto" />
              <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md">
                 <i className="fas fa-times"></i>
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default PointManagement;
