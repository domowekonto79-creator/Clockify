
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ClockifyService } from './services/clockifyService';
import { summarizeWorkActivities } from './services/geminiService';
import { generateWordReport } from './services/wordExportService';
import { ClockifyUser, ProcessedEntry, ReportSummary } from './types';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('clockify_api_key') || '';
  });
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<ClockifyUser | null>(null);
  const [entries, setEntries] = useState<ProcessedEntry[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const currentMonthName = useMemo(() => {
    return new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(new Date());
  }, []);

  const handleFetchData = useCallback(async (isAuto = false) => {
    if (!apiKey) {
      if (!isAuto) setError("Proszę podać klucz API Clockify.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const clockify = new ClockifyService(apiKey);
      const userData = await clockify.getUser();
      setUser(userData);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const rawEntries = await clockify.getTimeEntries(
        userData.activeWorkspace,
        userData.id,
        startOfMonth,
        endOfMonth
      );

      const processed = rawEntries.map(e => {
        const start = new Date(e.timeInterval.start);
        const end = new Date(e.timeInterval.end);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        return {
          date: start.toLocaleDateString('pl-PL'),
          description: e.description || '(Brak opisu)',
          durationHours: Math.max(0, durationHours),
          project: e.projectName || 'Ogólne',
        };
      }).sort((a, b) => {
          const [dayA, monthA, yearA] = a.date.split('.');
          const [dayB, monthB, yearB] = b.date.split('.');
          const dateA = new Date(`${yearA}-${monthA}-${dayA}`).getTime();
          const dateB = new Date(`${yearB}-${monthB}-${dayB}`).getTime();
          return dateA - dateB;
      });

      setEntries(processed);
    } catch (err: any) {
      if (!isAuto) {
        setError("Błąd połączenia. Sprawdź czy klucz API jest poprawny.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    const savedKey = localStorage.getItem('clockify_api_key');
    if (savedKey) {
      handleFetchData(true);
    }
  }, [handleFetchData]);

  const saveKeyToStorage = () => {
    if (apiKey) {
      localStorage.setItem('clockify_api_key', apiKey);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleSummarize = async () => {
    if (entries.length === 0) return;
    setIsSummarizing(true);
    try {
      const aiSummary = await summarizeWorkActivities(entries);
      setSummary(aiSummary);
    } catch (err) {
      setError("Błąd AI. Sprawdź czy opisy zadań nie są puste.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleExport = async () => {
    if (!user || entries.length === 0) return;
    await generateWordReport(user.name, currentMonthName, entries);
  };

  const clearKey = () => {
    setApiKey('');
    setUser(null);
    setEntries([]);
    setSummary(null);
    localStorage.removeItem('clockify_api_key');
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-10 text-center">
        <div className="inline-block p-4 bg-orange-50 rounded-2xl mb-4 shadow-sm">
          <i className="fas fa-file-invoice text-4xl text-orange-500"></i>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
          Raporty Orange PTE
        </h1>
        <p className="text-slate-500 font-medium italic">Zestawienie czynności B2B</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center text-slate-800">
              <i className="fas fa-shield-alt text-orange-500 mr-2 text-sm"></i>
              Autoryzacja Clockify
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Twój Klucz API</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Wklej klucz..."
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none bg-slate-50 text-sm font-mono"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600"
                    >
                      <i className={`fas ${showKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <button
                    onClick={saveKeyToStorage}
                    disabled={!apiKey}
                    title="Zapamiętaj klucz w tej przeglądarce"
                    className={`px-4 rounded-xl border transition-all flex items-center justify-center ${
                      saveStatus === 'saved' 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-500'
                    }`}
                  >
                    <i className={`fas ${saveStatus === 'saved' ? 'fa-check' : 'fa-save'}`}></i>
                  </button>
                </div>
                
                {localStorage.getItem('clockify_api_key') && (
                  <div className="flex justify-between items-center mt-3 px-1">
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center uppercase tracking-tighter">
                      <i className="fas fa-lock mr-1"></i> Klucz zapisany bezpiecznie
                    </span>
                    <button 
                      onClick={clearKey}
                      className="text-[10px] text-red-400 hover:text-red-600 font-bold uppercase"
                    >
                      Usuń
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleFetchData(false)}
                disabled={isLoading}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center text-sm"
              >
                {isLoading ? <i className="fas fa-circle-notch fa-spin mr-2"></i> : <i className="fas fa-sync-alt mr-2 text-xs"></i>}
                Pobierz dane z Clockify
              </button>
            </div>
          </section>

          {user && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-left-2 duration-500">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Zalogowany jako</h2>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-orange-100">
                  {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-800 text-base truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{currentMonthName}</p>
                </div>
              </div>
            </section>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-start animate-in zoom-in-95">
              <i className="fas fa-exclamation-circle mt-1 mr-3 text-sm"></i>
              <span className="text-xs font-bold leading-tight">{error}</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {entries.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Suma godzin</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">
                    {entries.reduce((sum, e) => sum + e.durationHours, 0).toFixed(1)}h
                  </p>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Dni pracy</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">
                    {new Set(entries.map(e => e.date)).size}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Eksport i Narzędzia</h3>
                 <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleExport}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center text-sm active:scale-[0.98]"
                    >
                      <i className="fas fa-file-word mr-2 text-lg"></i>
                      Pobierz Word
                    </button>

                    <button
                      onClick={handleSummarize}
                      disabled={isSummarizing}
                      className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center text-sm disabled:opacity-50 active:scale-[0.98]"
                    >
                      {isSummarizing ? (
                        <i className="fas fa-sparkles fa-spin mr-2"></i>
                      ) : (
                        <i className="fas fa-wand-magic-sparkles mr-2"></i>
                      )}
                      Analiza AI
                    </button>
                 </div>
              </div>

              {summary && (
                <section className="bg-orange-500 rounded-2xl shadow-xl p-6 text-white animate-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-70 flex items-center">
                    <i className="fas fa-brain mr-2 text-xs"></i>
                    Podsumowanie AI
                  </h3>
                  <p className="text-lg leading-relaxed font-medium italic">
                    "{summary.professionalSummary}"
                  </p>
                </section>
              )}

              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-sm">Wpisy z tego miesiąca</h3>
                  <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-md uppercase">
                    {entries.length} pozycji
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <th className="px-6 py-4 border-b border-slate-100">Data</th>
                        <th className="px-6 py-4 border-b border-slate-100">Zadanie</th>
                        <th className="px-6 py-4 border-b border-slate-100 text-right">Czas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {entries.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-xs font-bold text-slate-400 whitespace-nowrap">{entry.date}</td>
                          <td className="px-6 py-4">
                            <p className="text-[10px] font-black text-orange-500 uppercase mb-0.5">{entry.project}</p>
                            <p className="text-sm text-slate-700 font-medium">{entry.description}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900 font-mono font-black text-right">{entry.durationHours.toFixed(2)}h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-inner">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 text-orange-200">
                <i className="fas fa-cloud-download-alt text-3xl"></i>
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Wczytaj dane</h3>
              <p className="text-slate-400 max-w-xs mt-2 text-sm font-medium">Połącz się z kontem Clockify, aby wygenerować raport za bieżący miesiąc.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
