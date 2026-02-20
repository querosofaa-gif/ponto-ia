
import { supabase } from './supabase';

export const storageService = {
  setLocal: (key: string, data: any) => {
    try {
      localStorage.setItem(`smartponto_${key}`, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) {
      console.error("Storage Error:", e);
    }
  },

  save: async (key: string, data: any, table?: string) => {
    // 1. SEMPRE salva localmente primeiro para garantir a experiência do usuário
    storageService.setLocal(key, data);
    
    // 2. Tenta sincronizar com o Supabase de forma silenciosa
    if (table && table !== 'settings') {
      try {
        const toSync = Array.isArray(data) ? data : [data];
        const cleanToSync = toSync.map(({ created_at, ...rest }) => rest);
        
        // Timeout para não travar o processo
        const syncPromise = supabase.from(table).upsert(cleanToSync, { onConflict: 'id' });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000));
        
        await Promise.race([syncPromise, timeoutPromise]);
        return true;
      } catch (e) {
        console.warn(`Sync pendente para ${table}, dados mantidos localmente.`);
        return false;
      }
    }
    return true;
  },

  get: (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(`smartponto_${key}`);
      if (!saved) return defaultValue;
      const parsed = JSON.parse(saved);
      const data = parsed.data;
      
      if (Array.isArray(data) && data.length === 0 && Array.isArray(defaultValue) && defaultValue.length > 0) {
        return defaultValue;
      }
      return data || defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  fetchFromCloud: async (table: string) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('id', { ascending: false })
        .limit(1000);
        
      if (error) return null;
      return data;
    } catch (e) {
      return null;
    }
  }
};
