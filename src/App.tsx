import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { UserForm } from './components/UserForm';
import { ExpenseForm } from './components/ExpenseForm';
import { InvestmentForm } from './components/InvestmentForm';
import { AnnualChart } from './components/AnnualChart';
import { InvestmentPanel } from './components/InvestmentPanel';
import { TravelFundForm } from './components/TravelFundForm';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { User, Expense, Investment } from './types';
import { userService } from './services/api';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userService.list();
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleUserCreated = (user: User) => {
    setUsers([...users, user]);
  };

  const handleExpenseCreated = (expense: Expense) => {
    console.log('Despesa criada:', expense);
  };

  const handleInvestmentCreated = (investment: Investment) => {
    console.log('Investimento criado:', investment);
  };

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
        <h1>Sistema de Gestão Financeira</h1>
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
              <button style={menuItemStyle('users')} onClick={() => { setActiveTab('users'); setMenuOpen(false); }}>
                👥 Usuários
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
          <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>
            Usuários
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
          <button style={tabStyle('annual')} onClick={() => setActiveTab('annual')}>
            Relatório Anual
          </button>
        </div>
      </nav>

      <main style={{ padding: '20px' }}>
        {activeTab === 'dashboard' && <Dashboard />}
        
        {activeTab === 'users' && (
          <div>
            <UserForm onUserCreated={handleUserCreated} />
            <div>
              <h3>Lista de Usuários</h3>
              {users.map(user => (
                <div key={user._id} style={{ padding: '10px', border: '1px solid #eee', margin: '5px 0' }}>
                  <strong style={{ fontSize: '18px', color: '#007bff' }}>{user.name}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'expenses' && (
          <div>
            <ExpenseForm users={users} onExpenseCreated={handleExpenseCreated} />
          </div>
        )}
        
        {activeTab === 'investments' && (
          <div>
            <InvestmentForm users={users} onInvestmentCreated={handleInvestmentCreated} />
            <InvestmentPanel />
          </div>
        )}
        
        {activeTab === 'travel-funds' && <TravelFundForm users={users} />}
        
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