import React, { useState, useEffect } from 'react';
import { HomePage } from './showcase/HomePage';
import { ShowcasePage } from './showcase/ShowcasePage';

export const AppRoot: React.FC = () => {
  const getInitialView = (): 'cherrypick' | 'home' => {
    const hash = window.location.hash;
    if (hash === '#/home' || hash === '#/index') return 'home';
    return 'cherrypick';
  };

  const [currentView, setCurrentView] = useState<'cherrypick' | 'home'>(getInitialView);

  const navigateTo = (view: 'cherrypick' | 'home') => {
    setCurrentView(view);
    if (view === 'cherrypick') {
      window.location.hash = '';
    } else {
      window.location.hash = `#/${view}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/home' || hash === '#/index') setCurrentView('home');
      else setCurrentView('cherrypick');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div>
      {currentView === 'home' ? (
        <HomePage
          onOpenProject={() => navigateTo('cherrypick')}
          onOpenPlayground={() => { }}
        />
      ) : (
        <ShowcasePage
          onBackToIndex={() => navigateTo('home')}
        />
      )}
    </div>
  );
};
