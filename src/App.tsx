import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseHistory } from './components/ExpenseHistory';
import { SalaryManager } from './components/SalaryManager';
import { InvestmentForm } from './components/InvestmentForm';
import { AnnualChart } from './components/AnnualChart';
import { InvestmentPanel } from './components/InvestmentPanel';
import { TravelFundForm } from './components/TravelFundForm';
import { EmergencyFund } from './components/EmergencyFund';
import { CarReserve } from './components/CarReserve';
import { Allowance } from './components/Allowance';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { User, Expense, Investment } from './types';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
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



  const handleExpenseCreated = (expense: Expense) => {
    console.log('Despesa criada:', expense);
  };

  const handleInvestmentCreated = (investment: Investment) => {
    console.log('Investimento criado:', investment);
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

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
      <header style={{ 
        backgroundColor: isDark ? '#2d2d2d' : '#343a40', 
        color: 'white', 
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1>JS FinceApp</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
            Bem-vindo, {currentUser.name}!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={toggleTheme}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sair
          </button>
        </div>
      </header>
      
      <nav style={{ 
        backgroundColor: isDark ? '#3d3d3d' : '#f8f9fa', 
        padding: '10px', 
        borderBottom: `1px solid ${isDark ? '#555' : '#dee2e6'}`,
        position: 'relative'
      }}>
        {/* Menu Hambúrguer - Mobile */}
        <div className="mobile-menu" style={{ display: 'none' }}>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              padding: '10px',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: isDark ? 'white' : 'black'
            }}
          >
            ☰ Menu
          </button>
          
          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              backgroundColor: isDark ? '#2d2d2d' : 'white',
              border: `1px solid ${isDark ? '#555' : '#ddd'}`,
              borderRadius: '0 0 8px 8px',
              zIndex: 1000,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <button style={menuItemStyle('dashboard')} onClick={() => { setActiveTab('dashboard'); setMenuOpen(false); }}>
                📊 Dashboard
              </button>

              <button style={menuItemStyle('expenses')} onClick={() => { setActiveTab('expenses'); setMenuOpen(false); }}>
                💸 Despesas
              </button>
              <button style={menuItemStyle('investments')} onClick={() => { setActiveTab('investments'); setMenuOpen(false); }}>
                💹 Investimentos
              </button>
              <button style={menuItemStyle('travel-funds')} onClick={() => { setActiveTab('travel-funds'); setMenuOpen(false); }}>
                ✈️ Fundos de Viagem
              </button>
              <button style={menuItemStyle('emergency-fund')} onClick={() => { setActiveTab('emergency-fund'); setMenuOpen(false); }}>
                🆘 Fundo de Emergência
              </button>
              <button style={menuItemStyle('car-reserve')} onClick={() => { setActiveTab('car-reserve'); setMenuOpen(false); }}>
                🚗 Reserva do Carro
              </button>
              <button style={menuItemStyle('allowance')} onClick={() => { setActiveTab('allowance'); setMenuOpen(false); }}>
                💰 Mesada
              </button>
              <button style={menuItemStyle('annual')} onClick={() => { setActiveTab('annual'); setMenuOpen(false); }}>
                📈 Relatório Anual
              </button>
            </div>
          )}
        </div>

        {/* Menu Desktop */}
        <div className="desktop-menu" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <button style={tabStyle('dashboard')} onClick={() => setActiveTab('dashboard')}>
            Dashboard
          </button>

          <button style={tabStyle('expenses')} onClick={() => setActiveTab('expenses')}>
            Despesas
          </button>
          <button style={tabStyle('investments')} onClick={() => setActiveTab('investments')}>
            Investimentos
          </button>
          <button style={tabStyle('travel-funds')} onClick={() => setActiveTab('travel-funds')}>
            Fundos de Viagem
          </button>
          <button style={tabStyle('emergency-fund')} onClick={() => setActiveTab('emergency-fund')}>
            Fundo de Emergência
          </button>
          <button style={tabStyle('car-reserve')} onClick={() => setActiveTab('car-reserve')}>
            Reserva do Carro
          </button>
          <button style={tabStyle('allowance')} onClick={() => setActiveTab('allowance')}>
            Mesada
          </button>
          <button style={tabStyle('annual')} onClick={() => setActiveTab('annual')}>
            Relatório Anual
          </button>
        </div>
      </nav>

      <main style={{ padding: '20px' }}>
        {activeTab === 'dashboard' && <Dashboard currentUser={currentUser} />}
        

        
        {activeTab === 'expenses' && (
          <div>
            <SalaryManager currentUser={currentUser} onSalaryUpdated={(user) => setCurrentUser(user)} />
            <ExpenseForm currentUser={currentUser} onExpenseCreated={handleExpenseCreated} />
            <ExpenseHistory currentUser={currentUser} onExpenseUpdated={() => {}} />
          </div>
        )}
        
        {activeTab === 'investments' && (
          <div>
            <InvestmentForm currentUser={currentUser} onInvestmentCreated={handleInvestmentCreated} />
            <InvestmentPanel />
          </div>
        )}
        
        {activeTab === 'travel-funds' && <TravelFundForm currentUser={currentUser} />}
        
        {activeTab === 'emergency-fund' && <EmergencyFund currentUser={currentUser} />}
        
        {activeTab === 'car-reserve' && <CarReserve currentUser={currentUser} />}
        
        {activeTab === 'allowance' && <Allowance currentUser={currentUser} />}
        
        {activeTab === 'annual' && <AnnualChart />}
      </main>
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