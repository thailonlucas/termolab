import React, { useState, useEffect } from 'react';
import { BRAND } from './constants';
import { saveHandling, loadHandlings } from './persistence';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { NewBox } from './components/NewBox';
import { Briefing } from './components/Briefing';
import { Wizard } from './components/Wizard';
import { Done } from './components/Done';
import { History } from './components/History';
import { HistoryDetail } from './components/History/HistoryDetail';
import { Profile } from './components/Profile';
import type { Session, HistoryEntry, LocalMovement, User, Route } from './types';

type AppRoute = Exclude<Route, 'login'>;

export function App() {
  const { user, profile, loading } = useAuth();

  const [route, setRoute]                   = useState<AppRoute>('home');
  const [session, setSession]               = useState<Session | null>(null);
  const [history, setHistory]               = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedId, setSelectedId]         = useState<string | null>(null);
  const [lastMovements, setLastMovements]   = useState<LocalMovement[]>([]);

  const go = (r: AppRoute) => setRoute(r);

  useEffect(() => {
    if (!user) { setHistory([]); return; }
    setHistoryLoading(true);
    loadHandlings(user.id)
      .then(setHistory)
      .catch(err => console.error('[TermoLab] Failed to load history:', err))
      .finally(() => setHistoryLoading(false));
  }, [user?.id]);

  const appUser: User = {
    name: profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email ?? 'Usuário',
    role: profile?.role ?? 'user',
  };

  const finishSession = async (movements: LocalMovement[]) => {
    if (!session || !user) return;
    const fullSession: Session = { ...session, movements };

    try {
      const entry = await saveHandling(fullSession, user.id);
      setLastMovements(movements);
      setHistory(h => {
        // If the handling already exists in history (box reuse), replace it; otherwise prepend.
        const idx = h.findIndex(x => x.id === entry.id);
        if (idx >= 0) {
          const updated = [...h];
          updated[idx] = entry;
          return updated;
        }
        return [entry, ...h];
      });
      setSession(null);
      setSelectedId(entry.id);
      go('handlingDone');
    } catch (err) {
      console.error('[TermoLab] Failed to save handling:', err);
      const now = new Date();
      const fallback: HistoryEntry = {
        id: 'local-' + Date.now(),
        boxId: fullSession.boxId,
        medication: fullSession.medication,
        lot: fullSession.lot,
        origem: fullSession.origem,
        destino: fullSession.destino,
        remetente: fullSession.remetente,
        chaveNF: fullSession.chaveNF,
        docMinuta: fullSession.docMinuta,
        startedAt: fullSession.startedAt,
        completedAt: now,
        operator: fullSession.operator,
        handlingStatus: 'completed',
        sessionCount: 1,
        latestSessionStatus: 'submitted',
      };
      setLastMovements(movements);
      setHistory(h => [fallback, ...h]);
      setSession(null);
      setSelectedId(fallback.id);
      go('handlingDone');
    }
  };

  const selectedEntry = history.find(h => h.id === selectedId);

  if (loading) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: BRAND.bg,
      }}>
        <div style={{ fontSize: 13, color: BRAND.ink3 }}>Carregando…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: BRAND.bg, color: BRAND.ink }}>
        <Login />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: BRAND.bg, color: BRAND.ink }}>
      {route === 'home' && (
        <Home
          user={appUser}
          history={history}
          loading={historyLoading}
          onStart={() => go('newBox')}
          onHistory={() => go('history')}
          onProfile={() => go('profile')}
          onOpen={id => { setSelectedId(id); go('historyDetail'); }}
        />
      )}
      {route === 'newBox' && (
        <NewBox onBack={() => go('home')}
          onStart={d => { setSession({ ...d, movements: [], startedAt: new Date() }); go('briefing'); }} />
      )}
      {route === 'briefing' && session && (
        <Briefing session={session} onBack={() => go('newBox')}
          onStart={() => go('wizard')} />
      )}
      {route === 'wizard' && session && (
        <Wizard session={session}
          onCancel={() => go('home')} onFinish={finishSession}
          userName={appUser.name} />
      )}
      {route === 'handlingDone' && selectedEntry && (
        <Done
          entry={selectedEntry}
          movements={lastMovements}
          onClose={() => go('home')}
          onView={() => go('historyDetail')}
        />
      )}
      {route === 'history' && (
        <History
          history={history}
          loading={historyLoading}
          onBack={() => go('home')}
          onOpen={id => { setSelectedId(id); go('historyDetail'); }}
        />
      )}
      {route === 'historyDetail' && (
        <HistoryDetail
          entry={selectedEntry}
          onBack={() => go('history')}
        />
      )}
      {route === 'profile' && (
        <Profile user={appUser} onBack={() => go('home')} />
      )}
    </div>
  );
}
