
import React, { useState } from 'react';
import { User } from '../types';

interface AdjustmentModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const AdjustmentModal: React.FC<AdjustmentModalProps> = ({ user, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    type: 'IN',
    reason: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason) return;
    
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[300] p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/10">
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Solicitar Ajuste</h2>
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Correção de Ponto Esquecido</p>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-all">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none dark:text-white font-bold border border-slate-100 dark:border-slate-700"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
              <input 
                type="time" 
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none dark:text-white font-bold border border-slate-100 dark:border-slate-700"
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Batida</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none dark:text-white font-bold border border-slate-100 dark:border-slate-700"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option value="IN">Entrada (Início)</option>
              <option value="BREAK_START">Início Pausa</option>
              <option value="BREAK_END">Retorno Pausa</option>
              <option value="OUT">Saída (Fim)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Justificativa</label>
            <textarea 
              required
              placeholder="Descreva o motivo da correção..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none dark:text-white font-medium border border-slate-100 dark:border-slate-700 min-h-[100px] resize-none"
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px]"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
            >
              {isSubmitting ? <i className="fas fa-spinner animate-spin"></i> : 'Enviar para Aprovação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustmentModal;
