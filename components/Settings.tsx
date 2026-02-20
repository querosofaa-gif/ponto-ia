
import React, { useState, useEffect } from 'react';
import { DEFAULT_WORK_SCHEDULE } from '../constants';
import { WorkSchedule } from '../types';

interface SettingsProps {
  onSave: (config: any) => Promise<void>;
  currentConfig: any;
}

const Settings: React.FC<SettingsProps> = ({ onSave, currentConfig }) => {
  const [config, setConfig] = useState(currentConfig);
  const [schedule, setSchedule] = useState<WorkSchedule>(currentConfig.defaultSchedule || DEFAULT_WORK_SCHEDULE);
  const [isSaving, setIsSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });

  useEffect(() => {
    setConfig(currentConfig);
    setSchedule(currentConfig.defaultSchedule || DEFAULT_WORK_SCHEDULE);
  }, [currentConfig]);

  const daysOfWeek = [
    { id: 0, label: 'D' }, { id: 1, label: 'S' }, { id: 2, label: 'T' }, 
    { id: 3, label: 'Q' }, { id: 4, label: 'Q' }, { id: 5, label: 'S' }, { id: 6, label: 'S' },
  ];

  const toggleDay = (dayId: number) => {
    setSchedule(prev => ({
      ...prev,
      workDays: prev.workDays.includes(dayId) 
        ? prev.workDays.filter(d => d !== dayId) 
        : [...prev.workDays, dayId]
    }));
  };

  const calculateDailyHours = () => {
    try {
      const [eH, eM] = schedule.entry.split(':').map(Number);
      const [bSH, bSM] = schedule.breakStart.split(':').map(Number);
      const [bEH, bEM] = schedule.breakEnd.split(':').map(Number);
      const [xH, xM] = schedule.exit.split(':').map(Number);
      const morningMin = (bSH * 60 + bSM) - (eH * 60 + eM);
      const afternoonMin = (xH * 60 + xM) - (bEH * 60 + bEM);
      const totalMin = morningMin + afternoonMin;
      return `${Math.floor(totalMin / 60)}h ${totalMin % 60 > 0 ? (totalMin % 60) + 'm' : ''}`;
    } catch (e) { return '--h'; }
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      await onSave({ ...config, defaultSchedule: schedule });
      setToast({ show: true, msg: 'Salvo com sucesso.', type: 'success' });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
    } catch (error: any) {
      setToast({ show: true, msg: 'Erro ao salvar.', type: 'error' });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 6000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Dados Corporativos</h3>
          <p className="text-sm text-slate-500 mt-2 font-medium">Informações básicas da unidade.</p>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Empresa</label>
              <input type="text" value={config.name} onChange={(e) => setConfig({...config, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-bold border border-transparent focus:border-emerald-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ</label>
              <input type="text" placeholder="00.000.000/0000-00" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-bold border border-transparent focus:border-emerald-500/50" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Segurança e Acesso</h3>
          <p className="text-sm text-slate-500 mt-2 font-medium">Configure as senhas mestras do sistema.</p>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chave Mestra</label>
              <div className="relative">
                <input 
                  type={showPass ? "text" : "password"} 
                  value={config.masterKey} 
                  onChange={(e) => setConfig({...config, masterKey: e.target.value})} 
                  className="w-full pl-5 pr-12 py-4 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 rounded-2xl outline-none text-slate-900 dark:text-white font-black tracking-widest"
                />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500">
                  <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Padrão Novo Colaborador</label>
              <input 
                type="text" 
                value={config.defaultUserPassword} 
                onChange={(e) => setConfig({...config, defaultUserPassword: e.target.value})} 
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end pointer-events-none">
        {toast.show && (
          <div className={`mb-4 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white px-8 py-4 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-8 duration-300 pointer-events-auto`}>
             <p className="text-[10px] font-black uppercase tracking-widest">{toast.msg}</p>
          </div>
        )}
        <button 
          onClick={handleSaveClick} 
          disabled={isSaving} 
          className="bg-emerald-600 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center min-w-[280px] justify-center pointer-events-auto"
        >
          {isSaving ? <i className="fas fa-circle-notch animate-spin mr-3"></i> : 'Confirmar Tudo'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
