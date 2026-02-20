
import React, { useState, useMemo, useRef } from 'react';
import { User, UserRole, ContractType } from '../types';
import { DEFAULT_WORK_SCHEDULE } from '../constants';
import { generateUUID } from '../lib/utils';

interface UserManagementProps {
  onLog: (category: any, action: string, targetId: string, targetName: string, details: string) => void;
  users: User[];
  onUpdateUsers: (user: User) => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onUpdateUsers }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    password: '123',
    phone: '',
    birthDate: '',
    role: UserRole.EMPLOYEE,
    contractType: ContractType.CLT,
    department: '',
    baseSalary: 0,
    admissionDate: new Date().toISOString().split('T')[0],
    faceReference: '',
    workSchedule: DEFAULT_WORK_SCHEDULE
  });

  const handleOpenModal = (user?: User) => {
    setCameraError(null);
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        name: '', email: '', password: '123', phone: '', birthDate: '',
        role: UserRole.EMPLOYEE, contractType: ContractType.CLT,
        department: '', baseSalary: 0, 
        admissionDate: new Date().toISOString().split('T')[0],
        faceReference: '', workSchedule: DEFAULT_WORK_SCHEDULE
      });
    }
    setShowModal(true);
  };

  const startCamera = async () => {
    setShowCamera(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setCameraError("Câmera não autorizada.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = 480;
      canvasRef.current.height = 480;
      const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
      const startX = (videoRef.current.videoWidth - size) / 2;
      const startY = (videoRef.current.videoHeight - size) / 2;
      context?.drawImage(videoRef.current, startX, startY, size, size, 0, 0, 480, 480);
      setFormData({ ...formData, faceReference: canvasRef.current.toDataURL('image/jpeg', 0.8) });
      stopCamera();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.faceReference && !editingUser) {
      alert("Capture a foto para biometria.");
      return;
    }
    setIsLoading(true);
    try {
      const userPayload: User = {
        ...(formData as User),
        id: editingUser?.id || generateUUID(),
        email: (formData.email || '').trim().toLowerCase(),
        password: (formData.password || '123').trim()
      };
      await onUpdateUsers(userPayload);
      setShowModal(false);
      stopCamera();
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" placeholder="Buscar colaborador..." 
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => handleOpenModal()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] shadow-xl transition-all flex items-center justify-center space-x-2">
          <i className="fas fa-plus"></i>
          <span>Novo Colaborador</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-8 py-6">Colaborador</th>
                <th className="px-8 py-6">Cargo / Depto</th>
                <th className="px-8 py-6">Admissão</th>
                <th className="px-8 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border dark:border-slate-700 overflow-hidden">
                        {user.faceReference ? <img src={user.faceReference} className="w-full h-full object-cover" /> : <span className="text-slate-400 font-black">{user.name.charAt(0)}</span>}
                      </div>
                      <div>
                        <p className="font-bold text-sm dark:text-white">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{user.department}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-500">{new Date(user.admissionDate).toLocaleDateString('pt-BR')}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => handleOpenModal(user)} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 border dark:border-slate-700">
                      <i className="fas fa-edit text-xs"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[250] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl shadow-2xl border border-white/10 flex flex-col h-full max-h-[90vh] overflow-hidden animate-in zoom-in">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center"><i className="fas fa-user-plus"></i></div>
                 <h2 className="text-2xl font-black uppercase tracking-tighter">{editingUser ? 'Editar Perfil' : 'Novo Colaborador'}</h2>
              </div>
              <button onClick={() => { stopCamera(); setShowModal(false); }} className="w-10 h-10 bg-white/10 rounded-xl"><i className="fas fa-times"></i></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              {/* Biometria */}
              <div className="space-y-4">
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Biometria Facial</p>
                 <div className="relative aspect-video bg-slate-100 dark:bg-slate-950 rounded-[2.5rem] overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    {showCamera ? (
                      <div className="relative w-full h-full">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                        <button type="button" onClick={capturePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-8 py-3 rounded-2xl font-black uppercase text-xs">Capturar Face</button>
                      </div>
                    ) : formData.faceReference ? (
                      <img src={formData.faceReference} className="w-full h-full object-cover" />
                    ) : (
                      <button type="button" onClick={startCamera} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px]">Ligar Câmera</button>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                 </div>
              </div>

              {/* Informações Pessoais */}
              <div className="space-y-6">
                <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest border-b pb-2">Informações Pessoais</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                    <input type="text" required className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold border dark:border-slate-700" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</label>
                    <input type="email" required className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold border dark:border-slate-700" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone</label>
                    <input type="tel" placeholder="(11) 99999-9999" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold border dark:border-slate-700" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data de Nascimento</label>
                    <input type="date" required className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold border dark:border-slate-700" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Informações Profissionais */}
              <div className="space-y-6">
                <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest border-b pb-2">Informações Profissionais</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Departamento</label>
                    <input type="text" required className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold border dark:border-slate-700" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data de Admissão</label>
                    <input type="date" required className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold border dark:border-slate-700" value={formData.admissionDate} onChange={e => setFormData({...formData, admissionDate: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha de Acesso</label>
                    <input type="text" required className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold border dark:border-slate-700" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salário Base</label>
                    <input type="number" required className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold border dark:border-slate-700" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
            </form>

            <div className="p-8 bg-slate-50 dark:bg-slate-800 border-t flex gap-4">
               <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 bg-white dark:bg-slate-900 rounded-2xl font-black uppercase text-[10px] border dark:border-slate-700">Cancelar</button>
               <button onClick={handleSubmit} disabled={isLoading} className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl">
                  {isLoading ? 'Salvando...' : 'Salvar Colaborador'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
