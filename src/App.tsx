import React, { useState, useEffect } from 'react';
import { Dashboard } from './features/dashboard/Dashboard';
import { Login } from './features/auth/Login';
import { ExpensePanel } from './features/expenses/ExpensePanel';
import { InvestmentContainer } from './features/investments/InvestmentContainer';
import { AnnualChart } from './components/AnnualChart';
import { TravelFundForm } from './features/funds/TravelFundForm';
import { EmergencyFund } from './features/funds/EmergencyFund';
import { CarReserve } from './features/funds/CarReserve';
import { Allowance } from './components/Allowance';
import { ThemeProvider, useTheme } from './shared/components/ThemeProvider';
import { useUserState } from './shared/hooks/useUserState';
import type { Tab, TabId, TabStyle, MenuItemStyle } from '@shared/types/navigation.types';

interface AppContentProps {}

const AppContent: React.FC<AppContentProps> = () => {
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, isLoading, error, login, logout } = useUserState();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInvestmentCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600 text-lg">
          Erro ao carregar usuário: {error.message}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Show login screen if no user
  if (!currentUser) {
    return <Login onLogin={login} />;
  }

  const tabStyle = (tab: TabId): TabStyle => ({
    padding: '10px 20px',
    backgroundColor: activeTab === tab ? '#007bff' : (isDark ? '#3d3d3d' : '#f8f9fa'),
    color: activeTab === tab ? 'white' : (isDark ? '#fff' : '#000'),
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px 4px 0 0'
  });

  const menuItemStyle = (tab: TabId): MenuItemStyle => ({
    display: 'block',
    width: '100%',
    padding: '15px 20px',
    backgroundColor: activeTab === tab ? '#007bff' : 'transparent',
    color: activeTab === tab ? 'white' : (isDark ? '#fff' : '#000'),
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '16px',
    borderBottom: `1px solid ${isDark ? '#555' : '#eee'}`,
    transition: 'background-color 0.2s ease',
    borderRadius: '0'
  });

  const tabs: Tab[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'expenses', label: 'Despesas', icon: '💰' },
    { id: 'investments', label: 'Investimentos', icon: '📈' },
    { id: 'travel', label: 'Fundo de Viagem', icon: '✈️' },
    { id: 'emergency', label: 'Fundo de Emergência', icon: '🏥' },
    { id: 'car', label: 'Reserva do Carro', icon: '🚗' },
    { id: 'allowance', label: 'Mesada', icon: '💵' }
  ];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', backgroundColor: isDark ? '#1f1f1f' : '#fff', color: isDark ? '#fff' : '#000', minHeight: '100vh' }}>
      <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isDark ? '#121212' : '#007bff', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Gestão Financeira</h1>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={toggleTheme} 
            style={{
              marginRight: '15px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          
          <div style={{ marginRight: '15px', fontSize: '14px', fontStyle: 'italic' }}>
            {currentUser.name}
          </div>
          
          <button 
            onClick={logout}
            style={{
              padding: '8px 12px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sair
          </button>
          
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: isMobile ? 'block' : 'none',
              marginLeft: '15px',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            ☰
          </button>
        </div>
      </header>
      
      {menuOpen && (
        <div style={{ position: 'relative', zIndex: 1000, display: isMobile ? 'block' : 'none' }}>
          <div style={{ 
            position: 'absolute', 
            top: '0', 
            left: '0', 
            width: '100%', 
            backgroundColor: isDark ? '#2d2d2d' : 'white',
            border: `1px solid ${isDark ? '#555' : '#ddd'}`,
            borderRadius: '0 0 8px 8px',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            {tabs.map(tab => (
              <button 
                key={tab.id} 
                style={menuItemStyle(tab.id)} 
                onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ 
        padding: '20px', 
        borderRadius: '8px',
        backgroundColor: isDark ? '#2d2d2d' : 'white',
        boxShadow: isDark ? 'none' : '0 4px 6px rgba(0,0,0,0.1)',
        marginTop: '20px',
        position: 'relative'
      }}>
        <div style={{ display: isMobile ? 'none' : 'flex', marginBottom: '20px', borderBottom: `1px solid ${isDark ? '#555' : '#ddd'}` }}>
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              style={tabStyle(tab.id)} 
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        
        <div style={{ padding: '20px 0' }}>
          {activeTab === 'dashboard' && <Dashboard key={refreshKey} currentUser={currentUser} />}
          {activeTab === 'expenses' && (
            <ExpensePanel 
              currentUser={currentUser}
              onExpenseCreated={() => setRefreshKey(prev => prev + 1)}
              onExpenseUpdated={() => setRefreshKey(prev => prev + 1)}
            />
          )}
          {activeTab === 'investments' && 
            <InvestmentContainer 
              key={refreshKey} 
              currentUser={currentUser} 
              onInvestmentCreated={handleInvestmentCreated} 
            />
          }
          {activeTab === 'travel' && 
            <TravelFundForm 
              key={refreshKey} 
              currentUser={currentUser} 
              onTravelFundCreated={() => setRefreshKey(prev => prev + 1)} 
            />
          }
          {activeTab === 'emergency' && 
            <EmergencyFund 
              key={refreshKey} 
              currentUser={currentUser} 
            />
          }
          {activeTab === 'car' && 
            <CarReserve 
              key={refreshKey} 
              currentUser={currentUser} 
            />
          }
          {activeTab === 'allowance' && 
            <Allowance 
              key={refreshKey} 
              currentUser={currentUser} 
            />
          }
          {activeTab === 'annual-chart' && 
            <AnnualChart 
              key={refreshKey} 
            />
          }
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
