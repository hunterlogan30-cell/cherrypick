import React, { useState, useEffect } from 'react';
import { HomePage } from './showcase/HomePage';
import { ShowcasePage } from './showcase/ShowcasePage';
import { PlaygroundApp } from './PlaygroundApp';

export const AppRoot: React.FC = () => {
  const getInitialView = (): 'home' | 'cherrypick' | 'playground' => {
    const hash = window.location.hash;
    if (hash === '#/cherrypick') return 'cherrypick';
    if (hash === '#/playground') return 'playground';
    return 'home';
  };

  const [currentView, setCurrentView] = useState<'home' | 'cherrypick' | 'playground'>(getInitialView);

  const navigateTo = (view: 'home' | 'cherrypick' | 'playground') => {
    setCurrentView(view);
    if (view === 'home') {
      window.location.hash = '';
    } else {
      window.location.hash = `#/${view}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/cherrypick') setCurrentView('cherrypick');
      else if (hash === '#/playground') setCurrentView('playground');
      else if (!hash || hash === '#/' || hash === '#') setCurrentView('home');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div>
      {currentView === 'home' && (
        <HomePage
          onOpenProject={() => navigateTo('cherrypick')}
          onOpenPlayground={() => navigateTo('playground')}
        />
      )}

      {currentView === 'cherrypick' && (
        <ShowcasePage
          onBackToIndex={() => navigateTo('home')}
          onOpenPlayground={() => navigateTo('playground')}
        />
      )}

      {currentView === 'playground' && <PlaygroundApp />}
    </div>
  );
};
