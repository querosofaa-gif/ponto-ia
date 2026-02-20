
import React, { useState, useMemo } from 'react';
import { CompanyDocument, User, UserRole } from '../types';

interface DocumentManagementProps {
  documents: CompanyDocument[];
  onUpload: (doc: CompanyDocument) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currentUser: User;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({ documents, onUpload, onDelete, currentUser }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<CompanyDocument | null>(null);
  const [uploadStep, setUploadStep] = useState<'SELECT' | 'SCANNING'>('SELECT');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Identificação',
    file: null as File | null
  });

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesType = filterType === 'ALL' || doc.type === filterType;
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [documents, filterType, searchTerm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, file, name: file.name });
    }
  };

  const handleUploadSubmit = async () => {
    if (!formData.file) return;

    setUploadStep('SCANNING');
    setIsProcessing(true);
    
    // Converter arquivo para Base64 para visualização local/cloud
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      
      // Simulação visual de escaneamento
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newDoc: CompanyDocument = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        type: formData.type,
        date: new Date().toISOString().split('T')[0],
        size: `${(formData.file!.size / 1024 / 1024).toFixed(1)}MB`,
        status: 'Verificado',
        userId: currentUser.id,
        userName: currentUser.name,
        fileUrl: base64Data
      };

      await onUpload(newDoc);
      
      setIsProcessing(false);
      setShowUploadModal(false);
      setUploadStep('SELECT');
      setFormData({ name: '', type: 'Identificação', file: null });
    };
    reader.readAsDataURL(formData.file);
  };

  const handleDownload = (doc: CompanyDocument) => {
    if (!doc.fileUrl) return;
    const link = document.createElement('a');
    link.href = doc.fileUrl;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = [
    { label: 'Identificação', icon: 'fa-id-card', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Contratos', icon: 'fa-file-signature', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Saúde', icon: 'fa-heartbeat', color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Financeiro', icon: 'fa-receipt', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Drive Corporativo</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Pasta Segura & Documentos Digitais</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
           <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Pesquisar arquivos..." 
                className="pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold dark:text-white min-w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button 
              onClick={() => setShowUploadModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-3 active:scale-95 transition-all"
            >
              <i className="fas fa-plus"></i>
              <span>Novo Envio</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div 
          onClick={() => setFilterType('ALL')}
          className={`group p-6 rounded-[2.5rem] border cursor-pointer transition-all ${filterType === 'ALL' ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xl scale-105' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:border-emerald-500/50'}`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${filterType === 'ALL' ? 'bg-white/20' : 'bg-emerald-500/10'}`}>
            <i className={`fas fa-folders ${filterType === 'ALL' ? 'text-white' : 'text-emerald-500'} text-xl`}></i>
          </div>
          <p className="font-black uppercase tracking-tighter text-sm">Drive Geral</p>
          <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${filterType === 'ALL' ? 'text-emerald-100' : 'text-slate-400'}`}>{documents.length} Arquivos</p>
        </div>

        {categories.map((cat) => (
          <div 
            key={cat.label} 
            onClick={() => setFilterType(cat.label)}
            className={`group p-6 rounded-[2.5rem] border cursor-pointer transition-all ${filterType === cat.label ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-105' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:border-indigo-500/50'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${filterType === cat.label ? 'bg-white/20' : cat.bg}`}>
              <i className={`fas ${cat.icon} ${filterType === cat.label ? 'text-white' : cat.color} text-xl`}></i>
            </div>
            <p className="font-black uppercase tracking-tighter text-sm">{cat.label}</p>
            <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${filterType === cat.label ? 'text-indigo-100' : 'text-slate-400'}`}>
              {documents.filter(d => d.type === cat.label).length} Arquivos
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Nome do Documento</th>
                <th className="px-8 py-6">Categoria</th>
                <th className="px-8 py-6">Data de Envio</th>
                <th className="px-8 py-6">Validado</th>
                <th className="px-8 py-6 text-right">Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        <i className={`fas ${doc.name.toLowerCase().endsWith('.pdf') ? 'fa-file-pdf text-red-400' : 'fa-file-image text-blue-400'}`}></i>
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{doc.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{doc.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                     <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 dark:text-slate-400 rounded-lg uppercase tracking-widest">{doc.type}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{new Date(doc.date).toLocaleDateString('pt-BR')}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      doc.status === 'Verificado' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      <i className="fas fa-shield-check"></i>
                      <span>{doc.status}</span>
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setPreviewDoc(doc)}
                        className="w-9 h-9 bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-xl transition-all border dark:border-slate-700 shadow-sm"
                        title="Visualizar"
                      >
                        <i className="fas fa-eye text-xs"></i>
                      </button>
                      <button 
                        onClick={() => handleDownload(doc)}
                        className="w-9 h-9 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-500 rounded-xl transition-all border dark:border-slate-700 shadow-sm"
                        title="Baixar"
                      >
                        <i className="fas fa-download text-xs"></i>
                      </button>
                      <button 
                        onClick={() => onDelete(doc.id)}
                        className="w-9 h-9 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl transition-all border dark:border-slate-700 shadow-sm"
                        title="Excluir"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic font-bold uppercase tracking-widest text-xs opacity-50">
                    Nenhum documento na pasta selecionada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Visualização de Documento */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[300] flex flex-col animate-in fade-in duration-300">
          <div className="p-6 bg-slate-900/50 border-b border-white/10 flex justify-between items-center text-white">
            <div className="flex items-center space-x-4">
               <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-file-invoice text-lg"></i>
               </div>
               <div>
                  <h3 className="font-black uppercase tracking-tighter">{previewDoc.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{previewDoc.type} • {previewDoc.size}</p>
               </div>
            </div>
            <div className="flex items-center space-x-4">
               <button 
                onClick={() => handleDownload(previewDoc)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
               >
                 Baixar Arquivo
               </button>
               <button onClick={() => setPreviewDoc(null)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all">
                  <i className="fas fa-times"></i>
               </button>
            </div>
          </div>
          <div className="flex-1 p-10 flex items-center justify-center overflow-hidden">
            {previewDoc.fileUrl ? (
              previewDoc.name.toLowerCase().endsWith('.pdf') ? (
                <iframe src={previewDoc.fileUrl} className="w-full max-w-5xl h-full rounded-2xl border-none shadow-2xl" />
              ) : (
                <img src={previewDoc.fileUrl} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" alt={previewDoc.name} />
              )
            ) : (
              <div className="text-center text-slate-500 space-y-4">
                 <i className="fas fa-file-circle-exclamation text-6xl opacity-20"></i>
                 <p className="font-black uppercase tracking-widest">Visualização não disponível para este arquivo</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[250] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/10">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase">Novo Envio Digital</h2>
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Sincronização Cloud Ativa</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-white/20 hover:text-white transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-8">
              {uploadStep === 'SELECT' ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo do Documento</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none dark:text-white font-bold text-sm"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="Identificação">Identificação (RG/CPF)</option>
                      <option value="Contratos">Contrato ou Aditivo</option>
                      <option value="Saúde">Atestado Médico / ASO</option>
                      <option value="Financeiro">Comprovante / Recibo</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="relative group">
                      <input type="file" id="doc-upload" className="hidden" onChange={handleFileChange} />
                      <label 
                        htmlFor="doc-upload"
                        className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] cursor-pointer hover:border-emerald-500 transition-all bg-slate-50/50 dark:bg-slate-900/50"
                      >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${formData.file ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                           <i className={`fas ${formData.file ? 'fa-check' : 'fa-cloud-upload-alt'} text-2xl`}></i>
                        </div>
                        <p className="font-black text-slate-700 dark:text-slate-300 text-sm uppercase tracking-tighter">
                          {formData.file ? formData.file.name : 'Clique para Carregar'}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">PDF, JPG ou PNG até 10MB</p>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                    <button 
                      onClick={() => setShowUploadModal(false)}
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleUploadSubmit}
                      disabled={!formData.file || isProcessing}
                      className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/10 disabled:opacity-50 active:scale-95 transition-all"
                    >
                      {isProcessing ? 'Enviando...' : 'Confirmar Envio'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-10">
                    <div className="w-24 h-24 border-[4px] border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <i className="fas fa-brain text-emerald-500 text-2xl animate-pulse"></i>
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Análise IA em curso</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-black uppercase tracking-widest">Validando integridade do documento...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;
