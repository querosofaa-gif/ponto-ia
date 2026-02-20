
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { User } from '../types';

interface AIChatAssistantProps {
  user: User;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: `Olá ${user.name}! Sou seu assistente de RH inteligente. Como posso te ajudar hoje? (Dúvidas sobre férias, ponto, benefícios ou CLT)` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const context = `Usuário: ${user.name}, Cargo: ${user.role}, Depto: ${user.department}, Contrato: ${user.contractType}, Salário: R$ ${user.baseSalary}.`;
    const response = await geminiService.askHR(userMsg, context);

    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="w-80 md:w-96 h-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-8 duration-300">
          <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
                <i className="fas fa-robot"></i>
              </div>
              <div>
                <p className="font-bold text-sm">SmartPonto AI</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">RH Digital Ativo</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/10' 
                    : 'bg-white border border-slate-200 text-slate-700 shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Pergunte algo..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center disabled:opacity-50"
              >
                <i className="fas fa-paper-plane text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white text-2xl shadow-2xl transition-all transform hover:scale-110 ${isOpen ? 'bg-slate-900 rotate-90' : 'bg-emerald-600'}`}
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-comment-dots animate-pulse'}`}></i>
      </button>
    </div>
  );
};

export default AIChatAssistant;
