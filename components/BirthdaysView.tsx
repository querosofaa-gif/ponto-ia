
import React from 'react';
import { User } from '../types';

interface BirthdaysViewProps {
  users: User[];
}

const BirthdaysView: React.FC<BirthdaysViewProps> = ({ users }) => {
  const currentMonth = new Date().getMonth();
  const currentMonthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date());

  const birthdayCelebrants = users.filter(user => {
    if (!user.birthDate) return false;
    const birthMonth = new Date(user.birthDate).getMonth();
    return birthMonth === currentMonth;
  }).sort((a, b) => {
    const dayA = new Date(a.birthDate!).getDate();
    const dayB = new Date(b.birthDate!).getDate();
    return dayA - dayB;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">Aniversariantes</h2>
          <p className="text-indigo-100 font-bold uppercase tracking-widest mt-2 flex items-center">
            <i className="fas fa-calendar-star mr-2"></i>
            Mês de {currentMonthName}
          </p>
        </div>
        <i className="fas fa-cake-candles absolute -bottom-10 -right-10 text-white/10 text-[15rem] rotate-12"></i>
      </div>

      {birthdayCelebrants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {birthdayCelebrants.map((celebrant) => {
            const birthDate = new Date(celebrant.birthDate!);
            const day = birthDate.getDate().toString().padStart(2, '0');
            const isToday = birthDate.getDate() === new Date().getDate();

            return (
              <div 
                key={celebrant.id}
                className={`bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border ${isToday ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-100 dark:border-slate-800'} shadow-sm relative group hover:scale-[1.02] transition-all`}
              >
                {isToday && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest animate-bounce">
                    É HOJE! 🎉
                  </div>
                )}
                
                <div className="flex items-center space-x-5 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 text-2xl font-black shadow-inner overflow-hidden">
                     {celebrant.faceReference ? (
                       <img src={celebrant.faceReference} className="w-full h-full object-cover" />
                     ) : celebrant.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">{celebrant.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{celebrant.department}</p>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dia do Aniversário</p>
                    <p className="text-3xl font-black text-indigo-600 tabular-nums">{day}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contato</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{celebrant.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-20 text-center border dark:border-slate-800 space-y-4">
           <i className="fas fa-gift text-6xl text-slate-200 dark:text-slate-800"></i>
           <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Nenhum aniversariante neste mês.</p>
        </div>
      )}
    </div>
  );
};

export default BirthdaysView;
