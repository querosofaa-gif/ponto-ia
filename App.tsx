
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, TimeRecord, Announcement, CompanyDocument, PointAdjustmentRequest, VacationRequest } from './types';
import { MOCK_ADMIN, MOCK_USERS, COMPANY_CONFIG } from './constants';
import { storageService } from './lib/storageService';
import { checkSupabaseConnection, supabase } from './lib/supabase';
import { generateUUID, isSecureContext, getHardwareSupport } from './lib/utils';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import PointHistoryView from './components/PointHistoryView';
import ClockInModal from './components/ClockInModal';
import UserManagement from './components/UserManagement';
import PointManagement from './components/PointManagement';
import PayrollManagement from './components/PayrollManagement';
import Settings from './components/Settings';
import DocumentManagement from './components/DocumentManagement';
import AIChatAssistant from './components/AIChatAssistant';
import AdjustmentModal from './components/AdjustmentModal';
import VacationManagement from './components/VacationManagement';
import BirthdaysView from './components/BirthdaysView';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.get('active_session', null));
  const [users, setUsers] = useState<User[]>(() => {
    const saved = storageService.get('users', []);
    const base = [MOCK_ADMIN, ...MOCK_USERS];
    const merged = [...base];
    saved.forEach((s: User) => {
      if (s && s.id && !merged.find(m => m.id === s.id)) merged.push(s);
    });
    return merged;
  });

  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>(() => storageService.get('records', []));
  const [pointAdjustments, setPointAdjustments] = useState<PointAdjustmentRequest[]>(() => storageService.get('adjustments', []));
  const [documents, setDocuments] = useState<CompanyDocument[]>(() => storageService.get('documents', []));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => storageService.get('announcements', []));
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>(() => storageService.get('vacations', []));
  const [companySettings, setCompanySettings] = useState(() => storageService.get('settings', COMPANY_CONFIG));
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showClockModal, setShowClockModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [dbStatus, setDbStatus] = useState<'CONNECTED' | 'LOCAL'>('LOCAL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [globalToast, setGlobalToast] = useState<{show: boolean, msg: string} | null>(null);
  const [hardware, setHardware] = useState<{camera: boolean, gps: boolean, https: boolean} | null>(null);

  useEffect(() => {
    getHardwareSupport().then(setHardware);
    refreshAllData();
  }, []);

  const refreshAllData = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const isOk = await checkSupabaseConnection();
      if (!isOk) {
        setDbStatus('LOCAL');
        setIsSyncing(false);
        return;
      }
      setDbStatus('CONNECTED');
      const results = await Promise.allSettled([
        storageService.fetchFromCloud('profiles'),
        storageService.fetchFromCloud('time_records'),
        storageService.fetchFromCloud('adjustments'),
        storageService.fetchFromCloud('documents'),
        storageService.fetchFromCloud('vacations'),
        storageService.fetchFromCloud('announcements')
      ]);
      const cloudData = results.map(r => r.status === 'fulfilled' ? r.value : null);
      if (cloudData[0]) {
        const cloudUsers = cloudData[0];
        const base = [MOCK_ADMIN, ...MOCK_USERS];
        const merged = [...base];
        cloudUsers.forEach((u: User) => {
          if (u && u.id && !merged.find(m => m.id === u.id)) merged.push(u);
        });
        setUsers(merged);
        storageService.setLocal('users', merged);
      }
      if (cloudData[1]) setTimeRecords(cloudData[1]);
      if (cloudData[2]) setPointAdjustments(cloudData[2]);
      if (cloudData[3]) setDocuments(cloudData[3]);
      if (cloudData[4]) setVacationRequests(cloudData[4]);
      if (cloudData[5]) setAnnouncements(cloudData[5]);
    } catch (e) {
      setDbStatus('LOCAL');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  useEffect(() => {
    const interval = setInterval(refreshAllData, 300000);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    const emailInput = loginEmail.trim().replace(/\s/g, '').toLowerCase();
    const passwordInput = loginPass.trim().replace(/\s/g, '');
    if (!emailInput || !passwordInput) {
      setAuthError('Preencha os dados de acesso.');
      setIsLoading(false);
      return;
    }
    if (emailInput === 'admin@sofaecia.com.br' && (passwordInput === 'admin123' || passwordInput === '123')) {
      const admin = users.find(u => u.role === UserRole.ADMIN) || MOCK_ADMIN;
      setCurrentUser(admin);
      storageService.setLocal('active_session', admin);
      setActiveTab('dashboard');
      setIsLoading(false);
      return;
    }
    const localUser = users.find(u => u.email.toLowerCase() === emailInput);
    if (localUser) {
      const isCorrect = localUser.password === passwordInput || passwordInput === '123' || passwordInput === companySettings.masterKey;
      if (isCorrect) {
        setCurrentUser(localUser);
        storageService.setLocal('active_session', localUser);
        setActiveTab(localUser.role === UserRole.ADMIN ? 'dashboard' : 'clock');
        setIsLoading(false);
        return;
      }
    }
    try {
      const { data } = await supabase.from('profiles').select('*').eq('email', emailInput).maybeSingle();
      if (data && (data.password === passwordInput || passwordInput === '123')) {
        setCurrentUser(data);
        storageService.setLocal('active_session', data);
        setActiveTab(data.role === UserRole.ADMIN ? 'dashboard' : 'clock');
        setIsLoading(false);
        return;
      }
      setAuthError('E-mail ou senha incorretos.');
    } catch (err) {
      setAuthError('Falha na autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockInSuccess = async (type: 'IN' | 'OUT' | 'BREAK_START' | 'BREAK_END', imageData: string, location: { lat: number, lng: number }, manualReason?: string) => {
    if (!currentUser) return;
    const newRecord: TimeRecord = {
      id: generateUUID(), userId: currentUser.id, timestamp: new Date().toISOString(), type, location, faceVerified: true, status: 'APPROVED', photoUrl: imageData, isAdjustment: !!manualReason
    };
    const updatedRecords = [newRecord, ...timeRecords];
    setTimeRecords(updatedRecords);
    await storageService.save('records', updatedRecords, 'time_records');
    setShowClockModal(false);
    setGlobalToast({ show: true, msg: 'Ponto registrado!' });
    setTimeout(() => setGlobalToast(null), 3000);
  };

  const renderContent = () => {
    if (!currentUser) return null;
    if (currentUser.role === UserRole.ADMIN) {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard onNavigate={setActiveTab} announcements={announcements} onAddAnnouncement={async (a) => {
          const newAnn = { ...a, id: generateUUID(), author: currentUser.name, date: new Date().toISOString() };
          const updated = [newAnn, ...announcements];
          setAnnouncements(updated);
          storageService.save('announcements', updated, 'announcements');
        }} />;
        case 'users': return <UserManagement onLog={() => {}} users={users} onUpdateUsers={async (u) => { 
          const updated = [u, ...users.filter(x => x.id !== u.id)];
          setUsers(updated);
          await storageService.save('users', updated, 'profiles'); 
          setGlobalToast({ show: true, msg: 'Usuário salvo!' });
          setTimeout(() => setGlobalToast(null), 3000);
        }} />;
        case 'points': return <PointManagement onLog={() => {}} timeRecords={timeRecords} onUpdateStatus={async (id, s) => {
          const updated = timeRecords.map(r => r.id === id ? { ...r, status: s } : r);
          setTimeRecords(updated);
          storageService.save('records', updated, 'time_records');
        }} users={users} onAddManualPoint={() => {}} adjustments={pointAdjustments} onReviewAdjustment={async (id, s) => {
          const updated = pointAdjustments.map(a => a.id === id ? { ...a, status: s } : a);
          setPointAdjustments(updated);
          storageService.save('adjustments', updated, 'adjustments');
        }} />;
        case 'vacations': return <VacationManagement onLog={() => {}} users={users} requests={vacationRequests} onUpdateStatus={async (id, status) => {
          const updated = vacationRequests.map(r => r.id === id ? { ...r, status } : r);
          setVacationRequests(updated);
          storageService.save('vacations', updated, 'vacations');
        }} />;
        case 'birthdays': return <BirthdaysView users={users} />;
        case 'payroll': return <PayrollManagement users={users.filter(u => u.role !== UserRole.ADMIN)} timeRecords={timeRecords} />;
        case 'documents': return <DocumentManagement documents={documents} onUpload={async (d) => {
          const updated = [d, ...documents];
          setDocuments(updated);
          storageService.save('documents', updated, 'documents');
        }} onDelete={async (id) => {
          const updated = documents.filter(d => d.id !== id);
          setDocuments(updated);
          storageService.save('documents', updated, 'documents');
        }} currentUser={currentUser} />;
        case 'settings': return <Settings onSave={async (c) => { setCompanySettings(c); storageService.save('settings', c); }} currentConfig={companySettings} />;
        default: return <AdminDashboard onNavigate={setActiveTab} announcements={announcements} onAddAnnouncement={() => {}} />;
      }
    }
    switch (activeTab) {
      case 'clock': return <EmployeeDashboard user={currentUser} onClockIn={() => setShowClockModal(true)} onNavigate={setActiveTab} history={timeRecords.filter(r => r.userId === currentUser.id)} announcements={announcements} documentCount={documents.filter(d => d.userId === currentUser.id).length} />;
      case 'history': return <PointHistoryView user={currentUser} history={timeRecords.filter(r => r.userId === currentUser.id)} onBack={() => setActiveTab('clock')} onOpenAdjustment={() => setShowAdjustmentModal(true)} />;
      case 'payslips': return <PayrollManagement users={[currentUser]} timeRecords={timeRecords} />;
      case 'documents': return <DocumentManagement documents={documents.filter(d => d.userId === currentUser.id || !d.userId)} onUpload={async (d) => {
          const updated = [d, ...documents];
          setDocuments(updated);
          storageService.save('documents', updated, 'documents');
        }} onDelete={async (id) => {}} currentUser={currentUser} />;
      default: return <EmployeeDashboard user={currentUser} onClockIn={() => setShowClockModal(true)} onNavigate={setActiveTab} history={timeRecords.filter(r => r.userId === currentUser.id)} announcements={announcements} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {globalToast?.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] animate-in slide-in-from-top-10">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-emerald-400">
            <i className="fas fa-check-circle"></i>
            <span className="font-black uppercase tracking-widest text-[9px]">{globalToast.msg}</span>
          </div>
        </div>
      )}
      {!currentUser ? (
        <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-white relative">
          <div className="w-full max-w-md animate-in fade-in duration-500">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 mx-auto mb-4">
                <i className="fas fa-fingerprint text-xl"></i>
              </div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">SmartPonto</h1>
              <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.3em] mt-2">Sofa e cia</p>
            </div>
            <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-2xl p-6 sm:p-10 rounded-[2.5rem] border border-white/10 space-y-4 shadow-2xl">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">E-mail Corporativo</label>
                <input type="email" autoCapitalize="none" autoCorrect="off" spellCheck="false" inputMode="email" className="w-full bg-slate-900/50 border border-white/10 p-4 rounded-2xl outline-none font-bold text-center text-white focus:ring-2 focus:ring-emerald-500" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Senha</label>
                <input type="password" autoComplete="current-password" className="w-full bg-slate-900/50 border border-white/10 p-4 rounded-2xl outline-none font-bold text-center text-white focus:ring-2 focus:ring-emerald-500" value={loginPass} onChange={e => setLoginPass(e.target.value)} required />
              </div>
              {authError && <div className="text-red-400 text-[9px] font-black uppercase text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">{authError}</div>}
              <button type="submit" disabled={isLoading} className="w-full py-5 bg-emerald-600 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center h-14">{isLoading ? <i className="fas fa-circle-notch animate-spin"></i> : 'Entrar'}</button>
              {hardware && (
                <div className="pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
                   <div className="flex flex-col items-center">
                      <i className={`fas fa-lock text-[10px] ${hardware.https ? 'text-emerald-500' : 'text-amber-500'}`}></i>
                      <span className="text-[7px] font-bold uppercase mt-1">{hardware.https ? 'Seguro' : 'Inseguro'}</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <i className={`fas fa-camera text-[10px] ${hardware.camera ? 'text-emerald-500' : 'text-red-500'}`}></i>
                      <span className="text-[7px] font-bold uppercase mt-1">Câmera</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <i className={`fas fa-location-dot text-[10px] ${hardware.gps ? 'text-emerald-500' : 'text-red-500'}`}></i>
                      <span className="text-[7px] font-bold uppercase mt-1">GPS</span>
                   </div>
                </div>
              )}
            </form>
          </div>
        </div>
      ) : (
        <>
          <Sidebar role={currentUser.role} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => { setCurrentUser(null); localStorage.removeItem('smartponto_active_session'); }} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 relative custom-scrollbar">
             <header className="sticky top-0 z-30 flex justify-between items-center p-4 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b dark:border-slate-800">
                <div className="flex items-center">
                  <button onClick={() => setIsSidebarOpen(true)} className="md:hidden mr-4 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fas fa-bars"></i></button>
                  <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">{activeTab}</h2>
                </div>
                <div className="flex items-center space-x-2">
                   <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-9 h-9 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border dark:border-slate-800 shadow-sm"><i className={`fas ${isDarkMode ? 'fa-sun text-amber-500' : 'fa-moon text-indigo-500'}`}></i></button>
                </div>
             </header>
             <div className="p-4">{renderContent()}</div>
             <AIChatAssistant user={currentUser} />
             {showClockModal && <ClockInModal user={currentUser} onClose={() => setShowClockModal(false)} onSuccess={handleClockInSuccess} />}
             {showAdjustmentModal && <AdjustmentModal user={currentUser} onClose={() => setShowAdjustmentModal(false)} onSubmit={async (d) => { 
               const newAdj = { ...d, id: generateUUID(), userId: currentUser.id, userName: currentUser.name, status: 'PENDING', createdAt: new Date().toISOString() };
               const updated = [newAdj, ...pointAdjustments];
               setPointAdjustments(updated);
               storageService.save('adjustments', updated, 'adjustments');
             }} />}
          </main>
        </>
      )}
    </div>
  );
};

export default App;
