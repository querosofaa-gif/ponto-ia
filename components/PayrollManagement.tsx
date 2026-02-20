
import React, { useState, useMemo } from 'react';
import { geminiService } from '../services/geminiService';
import { User, TimeRecord, AuditEntry, Notification } from '../types';
import { COMPANY_CONFIG } from '../constants';

// Interface para resultados calculados
interface CalculatedSalary {
  grossSalary: number;
  netSalary: number;
  deductions: { name: string; amount: number }[];
  additions: { name: string; amount: number }[];
  hoursWorked: number;
  extra50: number;
  extra100: number;
}

interface PayrollManagementProps {
  users: User[];
  timeRecords: TimeRecord[];
  onLog?: (category: AuditEntry['category'], action: string, targetId: string, targetName: string, details: string) => void;
  onNotify?: (title: string, message: string, type: Notification['type']) => void;
}

const PayrollManagement: React.FC<PayrollManagementProps> = ({ users, timeRecords, onLog, onNotify }) => {
  const [calculatingId, setCalculatingId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, CalculatedSalary>>({});
  const [releasedIds, setReleasedIds] = useState<Set<string>>(new Set());
  const [showPreviewModal, setShowPreviewModal] = useState<User | null>(null);
  const [aiReport, setAiReport] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const calculateWorkedHours = (userId: string) => {
    const userRecords = timeRecords.filter(r => 
      r.userId === userId && 
      new Date(r.timestamp).getMonth() === selectedMonth &&
      r.status === 'APPROVED'
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let totalMinutes = 0;
    let extra50 = 0;
    let extra100 = 0;

    const recordsByDay: Record<string, TimeRecord[]> = {};
    userRecords.forEach(r => {
      const date = new Date(r.timestamp).toISOString().split('T')[0];
      if (!recordsByDay[date]) recordsByDay[date] = [];
      recordsByDay[date].push(r);
    });

    Object.keys(recordsByDay).forEach(date => {
      const dayRecords = recordsByDay[date];
      let dayMinutes = 0;
      
      for (let i = 0; i < dayRecords.length; i += 2) {
        if (dayRecords[i] && dayRecords[i+1]) {
          const diff = (new Date(dayRecords[i+1].timestamp).getTime() - new Date(dayRecords[i].timestamp).getTime()) / 60000;
          dayMinutes += diff;
        }
      }

      totalMinutes += dayMinutes;
      const dayOfWeek = new Date(date).getDay();
      const standardMinutes = 8 * 60;

      if (dayMinutes > standardMinutes) {
        const overtime = (dayMinutes - standardMinutes) / 60;
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          extra100 += overtime;
        } else {
          extra50 += overtime;
        }
      }
    });

    return {
      hoursWorked: Math.floor(totalMinutes / 60),
      extra50: Number(extra50.toFixed(1)),
      extra100: Number(extra100.toFixed(1))
    };
  };

  const handleCalculate = async (user: User) => {
    setCalculatingId(user.id);
    const { hoursWorked, extra50, extra100 } = calculateWorkedHours(user.id);
    
    try {
      const data = await geminiService.calculateSalary(
        user.baseSalary, 
        user.contractType, 
        hoursWorked, 
        extra50, 
        extra100
      );
      setResults(prev => ({ ...prev, [user.id]: { ...data, hoursWorked, extra50, extra100 } }));
    } catch (error) {
      console.error("Erro ao calcular folha:", error);
    } finally {
      setCalculatingId(null);
    }
  };

  const handleAnalyzeWithIA = async () => {
    if (Object.keys(results).length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const analysisData = Object.keys(results).map(id => {
        const user = users.find(u => u.id === id);
        return {
          employee: user?.name,
          department: user?.department,
          netSalary: results[id].netSalary,
          overtimeHours: results[id].extra50 + results[id].extra100,
          deductionsTotal: results[id].deductions.reduce((acc, d) => acc + d.amount, 0)
        };
      });

      const report = await geminiService.analyzePayrollExpenses(analysisData);
      setAiReport(report);
    } catch (error) {
      if (onNotify) onNotify('Erro na IA', 'Não foi possível gerar o relatório analítico.', 'ERROR');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRelease = (userId: string) => {
    setReleasedIds(prev => new Set(prev).add(userId));
    const user = users.find(u => u.id === userId);
    if (onNotify) onNotify('Sucesso', `Holerite de ${user?.name} liberado.`, 'SUCCESS');
    if (onLog) onLog('SYSTEM', 'Liberação de Holerite', userId, user?.name || '', 'Holerite mensal liberado para o colaborador.');
  };

  const handlePrint = () => {
    window.print();
  };

  const totalPayroll = useMemo(() => {
    return Object.values(results).reduce((acc: number, curr: CalculatedSalary) => acc + curr.netSalary, 0);
  }, [results]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <style>{`
        @media print {
          body * { visibility: hidden; background: white !important; color: black !important; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { 
            position: fixed; 
            left: 0; 
            top: 0; 
            width: 100vw; 
            height: 100vh; 
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            z-index: 9999;
          }
          .no-print { display: none !important; }
          button { display: none !important; }
          .shadow-2xl, .shadow-xl, .shadow-sm { box-shadow: none !important; border: 1px solid #eee !important; }
          .bg-slate-950, .bg-slate-900, .bg-indigo-600, .bg-emerald-600 { background: white !important; color: black !important; border: 1px solid #ddd !important; }
          .text-white, .text-emerald-100, .text-indigo-200 { color: black !important; }
          .rounded-[3rem], .rounded-3xl, .rounded-2xl { border-radius: 8px !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-1">Previsão de Saída Líquida</p>
            <p className="text-4xl font-black tabular-nums tracking-tighter">R$ {totalPayroll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <div className="mt-4 flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <p className="text-[9px] font-bold text-emerald-200 uppercase tracking-widest">Baseado em {Object.keys(results).length} cálculos</p>
            </div>
          </div>
          <i className="fas fa-wallet absolute -bottom-4 -right-4 text-white/10 text-9xl group-hover:scale-110 transition-transform"></i>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-500 mb-2">
              <i className="fas fa-microchip text-xs"></i>
              <span className="text-[10px] font-black uppercase tracking-widest">Auditoria Financeira IA</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">
              Analise inconsistências tributárias e projeções de FGTS e encargos sociais.
            </p>
          </div>
          <button 
            onClick={handleAnalyzeWithIA}
            disabled={isAnalyzing || Object.keys(results).length === 0}
            className="w-full mt-4 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center space-x-3"
          >
            {isAnalyzing ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-brain"></i>}
            <span>{isAnalyzing ? 'Analisando Dados...' : 'Gerar Relatório Analítico'}</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Mês de Referência</p>
          <div className="flex items-center space-x-4">
             <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent border-none text-2xl font-black text-slate-800 dark:text-white outline-none cursor-pointer uppercase tracking-tighter"
             >
               <option value={0}>Janeiro</option>
               <option value={1}>Fevereiro</option>
               <option value={2}>Março</option>
               <option value={3}>Abril</option>
               <option value={4}>Maio</option>
               <option value={5}>Junho</option>
             </select>
             <div className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Aberto</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden no-print">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Colaboradores no Período</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Clique em Calcular para processar pontos e impostos</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Colaborador</th>
                <th className="px-8 py-6">Contrato</th>
                <th className="px-8 py-6">Horas Reais</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((user) => {
                const isCalculated = !!results[user.id];
                const stats = calculateWorkedHours(user.id);

                return (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-6 font-black text-slate-700 dark:text-slate-200 text-sm uppercase tracking-tighter">{user.name}</td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.contractType}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black dark:text-white">{stats.hoursWorked}h totais</span>
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">+{stats.extra50}h extras</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        releasedIds.has(user.id) ? 'bg-emerald-500/10 text-emerald-600' : 
                        isCalculated ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {releasedIds.has(user.id) ? 'Liberado' : isCalculated ? 'Pendente Liberação' : 'Aguardando'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {!isCalculated ? (
                        <button 
                          onClick={() => handleCalculate(user)} 
                          disabled={calculatingId === user.id}
                          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/10"
                        >
                          {calculatingId === user.id ? <i className="fas fa-spinner animate-spin"></i> : 'Calcular'}
                        </button>
                      ) : (
                        <div className="flex justify-end space-x-2">
                           <button onClick={() => setShowPreviewModal(user)} className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all"><i className="fas fa-eye"></i></button>
                           {!releasedIds.has(user.id) && (
                             <button onClick={() => handleRelease(user.id)} className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><i className="fas fa-paper-plane"></i></button>
                           )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Relatório Analítico IA Modal */}
      {aiReport && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[400] flex items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-5xl h-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-white/10 print-container">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center shrink-0">
               <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                     <i className="fas fa-brain text-xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Relatório de Auditoria IA</h2>
                    <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Insights Estratégicos de RH</p>
                  </div>
               </div>
               <button onClick={() => setAiReport(null)} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all no-print">
                  <i className="fas fa-times"></i>
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Impacto de Horas Extras</p>
                    <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400">R$ {aiReport.overtimeImpact.toLocaleString('pt-BR')}</p>
                    <div className="mt-4 p-4 bg-indigo-500/10 rounded-2xl">
                       <p className="text-xs text-indigo-700 dark:text-indigo-300 font-bold leading-relaxed">
                         Este valor representa o custo adicional de sobrejornada processado no período atual.
                       </p>
                    </div>
                  </div>

                  <div className="p-8 bg-emerald-600 text-white rounded-3xl shadow-xl shadow-emerald-500/20">
                    <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-2">Custo Total de Operação</p>
                    <p className="text-4xl font-black">R$ {aiReport.totalCost.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-emerald-100 mt-4 font-bold">Consolidação de salários líquidos, encargos e tributos estimados.</p>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center space-x-3 text-slate-800 dark:text-white">
                     <i className="fas fa-lightbulb text-amber-500"></i>
                     <h3 className="font-black uppercase tracking-widest text-sm">Insights de Gestão</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {aiReport.insights.map((insight: string, idx: number) => (
                       <div key={idx} className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-start space-x-4">
                          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0 text-slate-500 font-black text-xs">{idx + 1}</div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{insight}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center space-x-3 text-slate-800 dark:text-white">
                     <i className="fas fa-rocket text-emerald-500"></i>
                     <h3 className="font-black uppercase tracking-widest text-sm">Sugestões de Otimização</h3>
                  </div>
                  <div className="space-y-3">
                     {aiReport.suggestions.map((sug: string, idx: number) => (
                       <div key={idx} className="p-6 bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-2xl">
                          <p className="text-sm text-slate-700 dark:text-slate-300 font-bold">{sug}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-end no-print">
               <button 
                  onClick={handlePrint} 
                  className="px-8 py-4 bg-slate-900 dark:bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all"
                >
                  Exportar Relatório PDF
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Holerite Preview */}
      {showPreviewModal && results[showPreviewModal.id] && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[300] flex items-center justify-center p-6 animate-in zoom-in duration-300">
           <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row print-container">
              <div className="w-full md:w-80 bg-slate-900 p-10 text-white flex flex-col justify-between no-print">
                <div>
                   <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                      <i className="fas fa-file-invoice-dollar text-2xl"></i>
                   </div>
                   <h2 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2">Comprovante de Rendimentos</h2>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{showPreviewModal.department}</p>
                </div>

                <div className="space-y-6">
                   <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Horas</p>
                      <p className="text-xl font-black text-emerald-400">{results[showPreviewModal.id].hoursWorked}h</p>
                   </div>
                   <button onClick={() => setShowPreviewModal(null)} className="w-full py-4 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Fechar</button>
                </div>
              </div>

              <div className="flex-1 p-10 bg-white space-y-8 overflow-y-auto max-h-[80vh] custom-scrollbar">
                 <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</p>
                       <p className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{showPreviewModal.name}</p>
                       <p className="text-sm font-bold text-slate-500">CPF: {showPreviewModal.cpf || '***.***.***-**'}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Referência</p>
                       <p className="text-xl font-black text-slate-900">05/2024</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-slate-900">
                       <i className="fas fa-list-ul text-xs"></i>
                       <h4 className="font-black uppercase text-xs tracking-widest">Detalhamento Financeiro</h4>
                    </div>
                    
                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                       <table className="w-full text-sm">
                          <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] font-black">
                             <tr>
                                <th className="px-6 py-3 text-left">Evento</th>
                                <th className="px-6 py-3 text-right">Vencimentos</th>
                                <th className="px-6 py-3 text-right">Descontos</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-slate-700 font-bold">
                             <tr>
                                <td className="px-6 py-4 uppercase">Salário Base ({showPreviewModal.contractType})</td>
                                <td className="px-6 py-4 text-right">R$ {showPreviewModal.baseSalary.toLocaleString('pt-BR')}</td>
                                <td className="px-6 py-4 text-right">-</td>
                             </tr>
                             {results[showPreviewModal.id].extra50 > 0 && (
                               <tr>
                                  <td className="px-6 py-4 uppercase">Hora Extra 50% ({results[showPreviewModal.id].extra50}h)</td>
                                  <td className="px-6 py-4 text-right text-emerald-600">R$ {((showPreviewModal.baseSalary/220) * 1.5 * results[showPreviewModal.id].extra50).toFixed(2)}</td>
                                  <td className="px-6 py-4 text-right">-</td>
                               </tr>
                             )}
                             {results[showPreviewModal.id].deductions.map((d: any, i: number) => (
                               <tr key={i}>
                                  <td className="px-6 py-4 uppercase">{d.name}</td>
                                  <td className="px-6 py-4 text-right">-</td>
                                  <td className="px-6 py-4 text-right text-red-500">R$ {d.amount.toLocaleString('pt-BR')}</td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-4">
                    <div className="p-6 bg-slate-50 rounded-3xl">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bruto Total</p>
                       <p className="text-xl font-black text-slate-900 tracking-tighter">R$ {results[showPreviewModal.id].grossSalary.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Descontos</p>
                       <p className="text-xl font-black text-red-500 tracking-tighter">R$ {results[showPreviewModal.id].deductions.reduce((a:any,b:any)=>a+b.amount,0).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="p-6 bg-emerald-600 rounded-3xl text-white shadow-xl shadow-emerald-500/20">
                       <p className="text-[9px] font-black text-emerald-200 uppercase tracking-widest mb-1">Líquido a Receber</p>
                       <p className="text-xl font-black tracking-tighter">R$ {results[showPreviewModal.id].netSalary.toLocaleString('pt-BR')}</p>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-slate-100 flex justify-between items-center no-print">
                    <div className="flex items-center space-x-2 text-slate-400">
                       <i className="fas fa-barcode text-2xl"></i>
                       <span className="text-[8px] font-black uppercase tracking-[0.3em]">VALIDADOR-SMARTPONTO-MAIO-2024</span>
                    </div>
                    <button 
                       onClick={handlePrint}
                       className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all"
                    >
                      Exportar PDF
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PayrollManagement;
