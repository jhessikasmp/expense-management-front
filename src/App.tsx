import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseHistory } from './components/ExpenseHistory';
import { InvestmentContainer } from './components/InvestmentContainer';
import { AnnualChart } from './components/AnnualChart';
import { TravelFundForm } from './components/TravelFundForm';
import { EmergencyFund } from './components/EmergencyFund';
import { CarReserve } from './components/CarReserve';
import { Allowance } from './components/Allowance';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { User, Investment } from './types';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isDark, toggleTheme } = useTheme();

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleInvestmentCreated = (investment: Investment) => {
    setRefreshKey(prev => prev + 1);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const tabStyle = (tab: string) => ({
    padding: '10px 20px',
    backgroundColor: activeTab === tab ? '#007bff' : (isDark ? '#3d3d3d' : '#f8f9fa'),
    color: activeTab === tab ? 'white' : (isDark ? '#fff' : '#000'),
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px 4px 0 0'
  });

  const menuItemStyle = (tab: string) => ({
    display: 'block',
    width: '100%',
    padding: '15px 20px',
    backgroundColor: activeTab === tab ? '#007bff' : 'transparent',
    color: activeTab === tab ? 'white' : (isDark ? '#fff' : '#000'),
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left' as const,
    fontSize: '16px',
    borderBottom: `1px solid ${isDark ? '#555' : '#eee'}`,
    transition: 'background-color 0.2s ease'
  });

  const tabs = [
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
            onClick={handleLogout}
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
              display: window.innerWidth <= 768 ? 'block' : 'none',
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
        <div style={{ position: 'relative', zIndex: 1000, display: window.innerWidth <= 768 ? 'block' : 'none' }}>
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
        <div style={{ display: window.innerWidth <= 768 ? 'none' : 'flex', marginBottom: '20px', borderBottom: `1px solid ${isDark ? '#555' : '#ddd'}` }}>
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
          {activeTab === 'expenses' && <ExpenseForm key={refreshKey} currentUser={currentUser} onExpenseCreated={() => setRefreshKey(prev => prev + 1)} />}
          {activeTab === 'investments' && <InvestmentContainer key={refreshKey} currentUser={currentUser} onInvestmentCreated={handleInvestmentCreated} />}
          {activeTab === 'travel' && <TravelFundForm key={refreshKey} currentUser={currentUser} onTravelFundCreated={() => setRefreshKey(prev => prev + 1)} />}
          {activeTab === 'emergency' && <EmergencyFund key={refreshKey} currentUser={currentUser} />}
          {activeTab === 'car' && <CarReserve key={refreshKey} currentUser={currentUser} />}
          {activeTab === 'allowance' && <Allowance key={refreshKey} currentUser={currentUser} />}
          {activeTab === 'annual-chart' && <AnnualChart key={refreshKey} />}
          {activeTab === 'expense-history' && <ExpenseHistory currentUser={currentUser} onExpenseUpdated={() => setRefreshKey(prev => prev + 1)} />}
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
