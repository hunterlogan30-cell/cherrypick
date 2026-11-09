import React, { useEffect, useState } from 'react';
import {
  AppStateSnapshot,
  getInitialSnapshot,
  loadState,
  saveState,
  subscribeToState,
} from '../services/storageService';
import {
  buildContextualAlertForGame,
  detectSmartAlerts,
  enrichGameWithSummary,
  fetchLiveNbaGames,
  tickLiveGamesOneSecond,
} from '../services/espnNbaService';
import { OnboardingFlow } from '../components/OnboardingFlow';
import { PopupDashboard } from '../components/PopupDashboard';
import { FloatingGameCard } from '../components/FloatingGameCard';
import { SmartAlertToast } from '../components/SmartAlertToast';
import { NotificationPrefs } from '../types/nba';

interface PopupAppProps {
  isNativePopupWindow?: boolean;
}

export const PopupApp: React.FC<PopupAppProps> = ({
  isNativePopupWindow = false,
}) => {
  const [snapshot, setSnapshot] = useState<AppStateSnapshot>(
    getInitialSnapshot()
  );
  const [viewMode, setViewMode] = useState<
    'dashboard' | 'onboarding' | 'detail'
  >('dashboard');
  const [detailExpanded, setDetailExpanded] = useState<boolean>(false);
  const [onboardingStartStep, setOnboardingStartStep] = useState<number>(0);
  const [isSettingsFlow, setIsSettingsFlow] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    loadState().then((initial) => {
      if (!mounted) return;
      setSnapshot(initial);
      if (!initial.settings.onboardingComplete) {
        setIsSettingsFlow(false);
        setOnboardingStartStep(0);
        setViewMode('onboarding');
      }
    });

    const unsub = subscribeToState((next) => {
      if (mounted) setSnapshot(next);
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  // Poll live NBA data if in live_api mode
  useEffect(() => {
    if (snapshot.settings.dataSourceMode !== 'live_api') return;
    let cancelled = false;

    async function refreshLive() {
      // Trigger background worker poll if in extension context
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime
          .sendMessage({ type: 'POLL_NBA_NOW', force: true })
          .catch(() => {});
      }

      const currentState = await loadState();
      const { games, isFallback } = await fetchLiveNbaGames();
      if (cancelled) return;
      const fav = currentState.settings.favoriteTeam || 'PHI';

      let updatedGames = games;
      if (!isFallback) {
        const idsToEnrich = new Set<string>();
        games.forEach((g) => {
          if (
            g.phase === 'LIVE' ||
            g.phase === 'CLUTCH' ||
            g.phase === 'OVERTIME' ||
            g.phase === 'FINAL' ||
            g.id === currentState.settings.pinnedGameId ||
            g.awayTeam === fav ||
            g.homeTeam === fav
          ) {
            idsToEnrich.add(g.id);
          }
        });
        if (idsToEnrich.size === 0 && games[0]) {
          idsToEnrich.add(games[0].id);
        }

        updatedGames = await Promise.all(
          games.map((g) =>
            idsToEnrich.has(g.id) ? enrichGameWithSummary(g) : Promise.resolve(g)
          )
        );
      }

      if (cancelled) return;
      const newAlerts = detectSmartAlerts(
        currentState.games,
        updatedGames,
        currentState.settings
      );
      const nextAlert =
        newAlerts.length > 0
          ? newAlerts[newAlerts.length - 1]
          : currentState.activeAlert;

      await saveState({
        games: updatedGames,
        activeAlert: nextAlert,
        isLiveApiFallback: isFallback,
      });
    }

    refreshLive();
    const timer = setInterval(refreshLive, 8000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [
    snapshot.settings.dataSourceMode,
    snapshot.settings.favoriteTeam,
    snapshot.settings.pinnedGameId,
  ]);

  // Auto-dismiss active callout notification after 6 seconds
  useEffect(() => {
    if (!snapshot.activeAlert) return;
    const timer = setTimeout(() => {
      saveState({ activeAlert: null });
    }, 6000);
    return () => clearTimeout(timer);
  }, [snapshot.activeAlert?.id]);

  // Real-time 1-second game clock countdown for live games in Popup
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setSnapshot((prev) => {
        const hasLive = prev.games.some(
          (g) =>
            g.phase === 'LIVE' ||
            g.phase === 'CLUTCH' ||
            g.phase === 'OVERTIME'
        );
        if (!hasLive) return prev;
        return {
          ...prev,
          games: tickLiveGamesOneSecond(prev.games),
        };
      });
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const handleCompleteOnboarding = async (
    team: string,
    notifications: NotificationPrefs
  ) => {
    const teamGame =
      snapshot.games.find(
        (g) =>
          (g.awayTeam === team || g.homeTeam === team) &&
          g.dayLabel !== 'TOMORROW'
      ) ||
      snapshot.games.find((g) => g.awayTeam === team || g.homeTeam === team) ||
      snapshot.games[0];

    const nextSettings = {
      ...snapshot.settings,
      onboardingComplete: true,
      favoriteTeam: team,
      notifications,
      pinnedGameId: teamGame?.id || snapshot.settings.pinnedGameId,
    };

    const contextualAlert = teamGame
      ? buildContextualAlertForGame(teamGame, nextSettings)
      : null;

    await saveState({
      settings: nextSettings,
      activeAlert: contextualAlert || snapshot.activeAlert,
    });
    setIsSettingsFlow(false);
    setViewMode('dashboard');
  };

  const handleSelectGame = async (gameId: string) => {
    setDetailExpanded(false);
    setViewMode('detail');
    const targetGame = snapshot.games.find((g) => g.id === gameId);
    const nextSettings = {
      ...snapshot.settings,
      pinnedGameId: gameId,
      overlayVisible: true,
      overlayExpanded: false,
    };
    const contextualAlert = targetGame
      ? buildContextualAlertForGame(targetGame, nextSettings)
      : null;
    await saveState({
      settings: nextSettings,
      activeAlert: contextualAlert || snapshot.activeAlert,
    });

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      try {
        const [activeTab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (activeTab?.id) {
          try {
            await chrome.tabs.sendMessage(activeTab.id, {
              type: 'SHOW_FLOATING_WIDGET',
            });
          } catch {
            if (chrome.scripting && chrome.scripting.executeScript) {
              await chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ['contentScript.js'],
              });
              await new Promise((r) => setTimeout(r, 60));
              await chrome.tabs
                .sendMessage(activeTab.id, { type: 'SHOW_FLOATING_WIDGET' })
                .catch(() => {});
            }
          }
        }
      } catch {
        // Ignore
      }
    }
  };

  const handleToggleDetailExpand = async () => {
    const nextExpanded = !detailExpanded;
    setDetailExpanded(nextExpanded);
    await saveState({
      settings: {
        ...snapshot.settings,
        overlayExpanded: nextExpanded,
      },
    });
  };

  const selectedGame =
    snapshot.games.find((g) => g.id === snapshot.settings.pinnedGameId) ||
    snapshot.games[0];

  return (
    <div
      className={`cp-root ${
        isNativePopupWindow ? 'cp-native-popup-root' : ''
      }`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        width: 394,
        borderRadius: 24,
      }}
    >
      {snapshot.activeAlert && viewMode !== 'onboarding' && (
        <SmartAlertToast
          alert={snapshot.activeAlert}
          onDismiss={() => saveState({ activeAlert: null })}
        />
      )}

      {viewMode === 'onboarding' ? (
        <OnboardingFlow
          initialStep={onboardingStartStep}
          isSettingsMode={isSettingsFlow}
          favoriteTeam={snapshot.settings.favoriteTeam}
          notifications={snapshot.settings.notifications}
          games={snapshot.games}
          onComplete={handleCompleteOnboarding}
          onBack={
            isSettingsFlow
              ? () => {
                  setIsSettingsFlow(false);
                  setViewMode('dashboard');
                }
              : undefined
          }
        />
      ) : viewMode === 'detail' && selectedGame ? (
        <FloatingGameCard
          game={selectedGame}
          expanded={detailExpanded}
          onToggleExpand={handleToggleDetailExpand}
          onBack={() => setViewMode('dashboard')}
        />
      ) : (
        <PopupDashboard
          games={snapshot.games}
          settings={snapshot.settings}
          onSelectGame={handleSelectGame}
          onOpenSettings={() => {
            setIsSettingsFlow(true);
            setOnboardingStartStep(1);
            setViewMode('onboarding');
          }}
        />
      )}
    </div>
  );
};

