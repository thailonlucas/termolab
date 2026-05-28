import React, { useState, useEffect } from 'react';
import { BRAND } from './constants';
import { formatTs } from './utils';
import { loadHistory, saveHistory } from './persistence';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { NewBox } from './components/NewBox';
import { Briefing } from './components/Briefing';
import { Wizard } from './components/Wizard';
import { Done } from './components/Done';
import { History } from './components/History';
import { HistoryDetail } from './components/History/HistoryDetail';
import { Profile } from './components/Profile';
import type { Session, HistoryEntry, User, Route } from './types';

export function App() {
  const [route, setRoute]           = useState<Route>('login');
  const [user]                      = useState<User>({ name: 'Ana Coutinho', role: 'Operadora Vestra · SP' });
  const [session, setSession]       = useState<Session | null>(null);
  const [history, setHistory]       = useState<HistoryEntry[]>(loadHistory);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stepIdx, setStepIdx]       = useState(0);

  const go = (r: Route) => setRoute(r);

  useEffect(() => { saveHistory(history); }, [history]);

  const captureStep = (stepId: string, value?: string, dataUrl?: string) => {
    const ts = formatTs(new Date());
    setSession(s => s ? ({
      ...s,
      photos: { ...s.photos, [stepId]: { taken: true, ts, dataUrl: dataUrl ?? null } },
      temps: value !== undefined ? { ...s.temps, [stepId]: value } : s.temps,
    }) : s);
  };

  const finishSession = () => {
    const entry: HistoryEntry = {
      id: 'H-' + Math.floor(Math.random() * 9000 + 1000),
      ...(session as Session),
      completedAt: new Date(),
      status: 'ok',
    };
    setHistory(h => [entry, ...h]);
    setSession(null);
    setSelectedId(entry.id);
    go('handlingDone');
  };

  const selectedEntry = history.find(h => h.id === selectedId);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: BRAND.bg, color: BRAND.ink }}>
      {route === 'login' && (
        <Login onSubmit={() => go('home')} />
      )}
      {route === 'home' && (
        <Home user={user} history={history}
          onStart={() => go('newBox')}
          onHistory={() => go('history')}
          onProfile={() => go('profile')}
          onOpen={id => { setSelectedId(id); go('historyDetail'); }} />
      )}
      {route === 'newBox' && (
        <NewBox onBack={() => go('home')}
          onStart={d => { setSession({ ...d, photos: {}, temps: {}, startedAt: new Date() }); go('briefing'); }} />
      )}
      {route === 'briefing' && session && (
        <Briefing session={session} onBack={() => go('newBox')}
          onStart={() => { setStepIdx(0); go('wizard'); }} />
      )}
      {route === 'wizard' && session && (
        <Wizard session={session} stepIdx={stepIdx} setStepIdx={setStepIdx}
          onCancel={() => go('home')} onCapture={captureStep} onFinish={finishSession}
          userName={user.name} />
      )}
      {route === 'handlingDone' && history[0] && (
        <Done entry={history[0]}
          onClose={() => go('home')}
          onView={() => { setSelectedId(history[0].id); go('historyDetail'); }} />
      )}
      {route === 'history' && (
        <History history={history} onBack={() => go('home')}
          onOpen={id => { setSelectedId(id); go('historyDetail'); }} />
      )}
      {route === 'historyDetail' && (
        <HistoryDetail entry={selectedEntry} onBack={() => go('history')} />
      )}
      {route === 'profile' && (
        <Profile user={user} onBack={() => go('home')} onLogout={() => go('login')} />
      )}
    </div>
  );
}
