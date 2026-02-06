import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { BottomNav } from './components/BottomNav';
import { LandingPage } from './pages/Landing';
import { ConnectionPage } from './pages/Connection';
import { TimelinePage } from './pages/Timeline';
import { FocusPage } from './pages/Focus';
import { AnniversaryPage } from './pages/Anniversary';
import { ProfilePage } from './pages/Profile';
import { AuthPage } from './pages/Auth';
import { EditProfilePage } from './pages/EditProfile';
import { View } from './types';
import { AppProvider, useApp } from './context';
import { AuthProvider } from './authContext';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  const { isConnected } = useApp();
  const [currentView, setCurrentView] = useState<View>(View.LANDING);

  // Simple router logic
  const renderView = () => {
    // Always show landing page first
    if (currentView === View.LANDING) {
      return <LandingPage onEnter={() => setCurrentView(View.CONNECTION)} />;
    }


    // Account Security page (can be accessed from Profile or Connection)
    if (currentView === View.ACCOUNT_SECURITY) {
      return <AuthPage onBack={() => setCurrentView(isConnected ? View.PROFILE : View.CONNECTION)} />;
    }

    // Edit Profile page
    if (currentView === View.EDIT_PROFILE) {
      return <EditProfilePage onBack={() => setCurrentView(View.PROFILE)} />;
    }

    // If not connected, force Connection page
    if (!isConnected) {
      return <ConnectionPage
        onComplete={() => setCurrentView(View.TIMELINE)}
        onLogin={() => setCurrentView(View.ACCOUNT_SECURITY)}
      />;
    }

    // Show requested view only if connected
    switch (currentView) {
      case View.CONNECTION:
        return <ConnectionPage
          onComplete={() => setCurrentView(View.TIMELINE)}
          onLogin={() => setCurrentView(View.ACCOUNT_SECURITY)}
        />;
      case View.TIMELINE:
        return <TimelinePage />;
      case View.FOCUS:
        return <FocusPage />;
      case View.ANNIVERSARY:
        return <AnniversaryPage />;
      case View.PROFILE:
        return <ProfilePage
          onNavigateToAuth={() => setCurrentView(View.ACCOUNT_SECURITY)}
          onEditProfile={() => setCurrentView(View.EDIT_PROFILE)}
        />;
      case View.ACCOUNT_SECURITY:
        return <AuthPage onBack={() => setCurrentView(View.PROFILE)} />;
      case View.EDIT_PROFILE:
        return <EditProfilePage onBack={() => setCurrentView(View.PROFILE)} />;
      default:
        return <TimelinePage />;
    }
  };

  // Only hide nav on Landing, Connection, Auth and EditProfile pages
  const showNav = currentView !== View.LANDING && currentView !== View.CONNECTION && currentView !== View.ACCOUNT_SECURITY && currentView !== View.EDIT_PROFILE && isConnected;

  return (
    <Layout fullScreen={!showNav}>
      {renderView()}
      {showNav && (
        <BottomNav
          currentView={currentView}
          onChangeView={setCurrentView}
        />
      )}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;