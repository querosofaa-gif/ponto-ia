
import React, { useRef, useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { User } from '../types';
import { isSecureContext } from '../lib/utils';

interface ClockInModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (type: 'IN' | 'OUT' | 'BREAK_START' | 'BREAK_END', imageData: string, location: { lat: number, lng: number }, manualReason?: string) => void;
}

const ClockInModal: React.FC<ClockInModalProps> = ({ user, onClose, onSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isSearchingGPS, setIsSearchingGPS] = useState(true);
  const [cameraState, setCameraState] = useState<'IDLE' | 'LOADING' | 'ACTIVE' | 'ERROR'>('IDLE');

  useEffect(() => {
    startGPS();
    startCamera();
    return () => stopCamera();
  }, []);

  const startGPS = () => {
    if (!navigator.geolocation) {
      setIsSearchingGPS(false);
      return;
    }

    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 };
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsSearchingGPS(false);
      },
      (err) => {
        console.warn("GPS Indisponível:", err);
        setIsSearchingGPS(false);
        // Não bloqueia o ponto por falta de GPS, apenas loga
      },
      options
    );
  };

  const startCamera = async () => {
    if (!isSecureContext()) {
      setError("ERRO: Site sem HTTPS. O navegador bloqueou a câmera.");
      setCameraState('ERROR');
      return;
    }

    setCameraState('LOADING');
    try {
      const constraints = {
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
            setCameraState('ACTIVE');
          } catch (e) {
            setCameraState('ERROR');
            setError("Clique no vídeo para iniciar a câmera.");
          }
        };
      }
    } catch (err) {
      setCameraState('ERROR');
      setError("Acesso à câmera negado. Verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleCapture = async (type: 'IN' | 'OUT' | 'BREAK_START' | 'BREAK_END') => {
    if (isVerifying) return;
    
    // Fallback caso a câmera não funcione: permite bater o ponto com erro avisado
    if (cameraState === 'ERROR') {
       if (confirm("Câmera falhou. Deseja bater o ponto sem foto? (Será auditado pelo RH)")) {
          onSuccess(type, '', coords || { lat: 0, lng: 0 }, "FALHA_CAMERA_MOBILE");
       }
       return;
    }

    setIsVerifying(true);
    setError(null);

    const context = canvasRef.current?.getContext('2d');
    if (context && videoRef.current) {
      canvasRef.current!.width = 480;
      canvasRef.current!.height = 480;
      context.translate(480, 0);
      context.scale(-1, 1);
      context.drawImage(videoRef.current, 0, 0, 480, 480);
      const imageData = canvasRef.current!.toDataURL('image/jpeg', 0.6);

      try {
        const result = await geminiService.verifyFace(imageData, user.faceReference, user.name);
        if (result.verified) {
          setIsDone(true);
          setTimeout(() => {
            onSuccess(type, imageData, coords || { lat: 0, lng: 0 }, coords ? undefined : "GPS_AUSENTE");
          }, 1000);
        } else {
          setError(result.message || "Face não identificada.");
          setIsVerifying(false);
        }
      } catch (err) {
        setIsVerifying(false);
        // Fallback IA: permite bater ponto se a IA falhar
        setIsDone(true);
        setTimeout(() => onSuccess(type, imageData, coords || { lat: 0, lng: 0 }, "ERRO_IA_MOBILE"), 1000);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-[250] p-4 touch-none">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden relative border border-white/10">
        
        {isDone && (
          <div className="absolute inset-0 bg-emerald-600 z-[300] flex flex-col items-center justify-center text-white text-center p-6">
            <i className="fas fa-check-circle text-7xl animate-bounce mb-4"></i>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Ponto Registrado!</h2>
            <p className="text-[10px] uppercase font-bold tracking-widest mt-2 opacity-80">Sincronizando dados...</p>
          </div>
        )}

        <div className="p-4 flex justify-between items-center border-b dark:border-slate-800">
          <p className="font-black text-[10px] uppercase tracking-widest dark:text-white">Autenticação Biométrica</p>
          <button onClick={onClose} className="w-8 h-8 text-slate-400"><i className="fas fa-times"></i></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative aspect-square bg-slate-950 rounded-[2rem] overflow-hidden shadow-inner flex items-center justify-center">
            {cameraState === 'ACTIVE' ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]" 
                onClick={() => videoRef.current?.play()}
              />
            ) : (
              <div className="flex flex-col items-center text-slate-600 space-y-3 p-8 text-center">
                 <i className={`fas ${cameraState === 'LOADING' ? 'fa-circle-notch animate-spin' : 'fa-camera-slash'} text-3xl`}></i>
                 <p className="text-[9px] font-bold uppercase tracking-widest">
                    {cameraState === 'LOADING' ? 'Ligando Câmera...' : 'Problema com a Câmera'}
                 </p>
              </div>
            )}
            
            <div className="absolute inset-0 border-[25px] border-slate-950/40 pointer-events-none flex items-center justify-center">
               <div className="w-44 h-44 border border-white/20 border-dashed rounded-full"></div>
            </div>

            <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full flex items-center space-x-2 backdrop-blur-md ${coords ? 'bg-emerald-500/80' : 'bg-amber-500/80'}`}>
               <i className={`fas ${coords ? 'fa-location-dot' : 'fa-satellite-dish'} text-white text-[8px]`}></i>
               <span className="text-white font-black uppercase tracking-widest text-[7px]">
                 {coords ? 'Localização OK' : 'GPS Offline'}
               </span>
            </div>

            {isVerifying && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-[8px] font-black uppercase tracking-widest">Validando Face...</p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[9px] font-black uppercase text-center leading-tight">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button 
              disabled={isVerifying || isDone}
              onClick={() => handleCapture('IN')}
              className="py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] shadow-lg active:scale-95 transition-all"
            >
              Entrada
            </button>
            <button 
              disabled={isVerifying || isDone}
              onClick={() => handleCapture('OUT')}
              className="py-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-[11px] shadow-lg active:scale-95 transition-all"
            >
              Saída
            </button>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ClockInModal;
