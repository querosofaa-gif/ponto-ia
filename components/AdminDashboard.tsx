
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Announcement } from '../types';
import { COMPANY_CONFIG } from '../constants';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
  announcements?: Announcement[];
  // Fix: Omit 'author' from the announcement object because it is injected by the parent component (App.tsx)
  onAddAnnouncement: (ann: Omit<Announcement, 'id' | 'date' | 'author'>) => void;
}

const data = [
  { name: 'Seg', horas: 42, faltas: 1 },
  { name: 'Ter', horas: 45, faltas: 0 },
  { name: 'Qua', horas: 41, faltas: 2 },
  { name: 'Qui', horas: 44, faltas: 0 },
  { name: 'Sex', horas: 43, faltas: 1 },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, announcements = [], onAddAnnouncement }) => {
  const [showModal, setShowModal] = useState(false);
  const [showQRTerminal, setShowQRTerminal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [terminalToken, setTerminalToken] = useState(Math.random().toString(36).substr(2, 9));
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GERAL' as Announcement['category']
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const tokenTimer = setInterval(() => {
      setTerminalToken(Math.random().toString(36).substr(2, 9));
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(tokenTimer);
    };
  }, []);

  const handlePost = () => {
    if (!formData.title || !formData.content) return;
    // Fix: Pass the formData to onAddAnnouncement. TypeScript error resolved by updating AdminDashboardProps.
    onAddAnnouncement(formData);
    setFormData({ title: '', content: '', category: 'GERAL' });
    setShowModal(false);
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      window.print();
    }, 1200);
  };

  const qrData = `COMPANY:${COMPANY_CONFIG.name}|UNIT:SEDE_SP|TOKEN:${terminalToken}|LAT:-23.5505|LNG:-46.6333`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}&color=0f172a&bgcolor=ffffff`;

  const stats = [
    { label: 'Total de Colaboradores', value: '42', icon: 'fa-users', color: 'bg-blue-500', target: 'users' },
    { label: 'Presentes Hoje', value: '38', icon: 'fa-user-check', color: 'bg-emerald-500', target: 'points' },
    { label: 'Atrasos Detectados', value: '3', icon: 'fa-clock', color: 'bg-amber-500', target: 'points' },
    { label: 'Projeção Folha (Mês)', value: 'R$ 142.500', icon: 'fa-wallet', color: 'bg-indigo-500', target: 'payroll' },
  ];

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #qr-terminal-print, #qr-terminal-print * { visibility: visible; }
          #qr-terminal-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex !important;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: white !important;
            color: black !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-800">
        {stats.map((stat, i) => (
          <button 
            key={i} 
            onClick={() => onNavigate(stat.target)}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-4 transition-all hover:shadow-xl hover:scale-[1.02] hover:border-emerald-500/50 text-left"
          >
            <div className={`${stat.color} text-white p-4 rounded-2xl shadow-lg`}>
              <i className={`fas ${stat.icon} text-xl`}></i>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold dark:text-white">{stat.value}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between border border-white/10 shadow-2xl relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                           <i className="fas fa-qrcode text-lg"></i>
                        </div>
                        <h3 className="text-lg font-bold">Terminal de Ponto</h3>
                     </div>
                     <button 
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-emerald-400 no-print"
                        title="Baixar PDF do QR Code"
                     >
                        {isDownloading ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-file-pdf"></i>}
                     </button>
                  </div>
                  <p className="text-slate-400 text-xs mb-8">Exiba este código em um tablet na recepção ou baixe o PDF para imprimir e fixar na unidade.</p>
                  
                  <div className="flex items-center space-x-6 mb-8">
                     <div className="bg-white p-2 rounded-2xl w-24 h-24 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <img src={qrUrl} alt="QR Mini" className="w-full h-full" />
                     </div>
                     <div>
                        <p className="text-2xl font-black text-emerald-400">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unidade Sede SP</p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3 z-10 no-print">
                  <button 
                    onClick={() => setShowQRTerminal(true)}
                    className="py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all border border-white/10 text-xs"
                  >
                    ABRIR TERMINAL
                  </button>
                  <button 
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg text-xs flex items-center justify-center space-x-2"
                  >
                    <i className="fas fa-file-pdf"></i>
                    <span>{isDownloading ? 'GERANDO...' : 'BAIXAR PDF'}</span>
                  </button>
               </div>
               
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center justify-between">
                <span>Horas Trabalhadas</span>
                <span className="text-xs font-normal text-slate-400">Equipe Total</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="horas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold dark:text-white">Atividade Recente</h3>
                <button 
                  onClick={() => onNavigate('points')}
                  className="text-emerald-600 font-bold text-sm hover:text-emerald-700 transition-all"
                >
                  Ver tudo
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Colaborador</th>
                            <th className="px-6 py-4">Evento</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                            { name: 'Ana Silva', event: 'Entrada 08:02', status: 'Verificado' },
                            { name: 'Carlos Oliveira', event: 'Entrada 08:55', status: 'Atrasado' },
                            { name: 'Bruno Santos', event: 'Saída 12:00', status: 'Verificado' },
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-sm">{row.name}</td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{row.event}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        row.status === 'Verificado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center">
               <i className="fas fa-bullhorn text-emerald-500 mr-2"></i>
               Mural de Avisos
            </h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {announcements.length > 0 ? [...announcements].reverse().map((ann) => (
                <div key={ann.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-emerald-500 transition-all cursor-pointer animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      ann.category === 'RH' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' :
                      ann.category === 'EVENTO' ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10' :
                      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                    }`}>
                      {ann.category}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold">{new Date(ann.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-emerald-500 transition-colors">{ann.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{ann.content}</p>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">Nenhum comunicado no mural.</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="w-full mt-6 py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
               <i className="fas fa-plus"></i>
               <span>Postar Comunicado</span>
            </button>
          </div>
        </div>
      </div>

      {showQRTerminal && (
        <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[300] flex flex-col items-center justify-center animate-in fade-in duration-500">
           <div className="absolute top-8 right-8 flex space-x-4 no-print">
              <button 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="w-14 h-14 bg-emerald-600 text-white rounded-2xl shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center"
              >
                {isDownloading ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-file-pdf text-xl"></i>}
              </button>
              <button onClick={() => setShowQRTerminal(false)} className="w-14 h-14 bg-slate-100 dark:bg-slate-900 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center">
                 <i className="fas fa-times text-2xl"></i>
              </button>
           </div>

           <div id="qr-terminal-print" className="text-center space-y-12 max-w-xl flex flex-col items-center">
              <div className="space-y-4">
                 <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{COMPANY_CONFIG.name}</h2>
                 <p className="text-xl text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Unidade Sede São Paulo - Terminal de Ponto</p>
              </div>

              <div className="relative">
                 <div className="bg-white p-12 rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border-4 border-slate-50 dark:border-slate-900 group">
                    <img src={qrUrl} alt="Terminal QR" className="w-80 h-80 md:w-96 md:h-96" />
                    <div className="absolute inset-0 border-[12px] border-emerald-500/10 rounded-[4rem] pointer-events-none group-hover:border-emerald-500/20 transition-all"></div>
                 </div>
                 <div className="absolute -top-6 -right-6 bg-emerald-500 text-white w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce no-print">
                    <i className="fas fa-fingerprint text-3xl"></i>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="text-6xl font-black text-slate-900 dark:text-white tabular-nums">
                    {currentTime.toLocaleTimeString('pt-BR')}
                 </div>
                 <p className="text-slate-400 font-bold uppercase tracking-widest">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <div className="flex items-center justify-center space-x-3 text-emerald-600 dark:text-emerald-400 no-print">
                 <i className="fas fa-shield-check text-2xl animate-pulse"></i>
                 <span className="font-black text-xs uppercase tracking-widest">Código Dinâmico Anti-Fraude Ativo</span>
              </div>
           </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Novo Comunicado</h2>
                <p className="text-slate-400 text-sm">Publique avisos para todos os colaboradores</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors">
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Título do Aviso</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white" 
                  placeholder="Ex: Atualização de Benefícios"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Categoria</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white appearance-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                >
                  <option value="GERAL">📢 Geral</option>
                  <option value="RH">🏢 Recursos Humanos</option>
                  <option value="EVENTO">🎉 Evento / Social</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Conteúdo</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white min-h-[120px] resize-none" 
                  placeholder="Descreva o comunicado em detalhes..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                />
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex space-x-4">
              <button 
                onClick={() => setShowModal(false)} 
                className="flex-1 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handlePost}
                disabled={!formData.title || !formData.content}
                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50 active:scale-95"
              >
                Publicar Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
