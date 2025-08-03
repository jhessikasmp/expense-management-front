import React from 'react';
import { User, Investment } from '../types';
import { InvestmentForm } from './InvestmentForm';
import { InvestmentPanel } from './InvestmentPanel';

interface InvestmentContainerProps {
  currentUser: User;
  onInvestmentCreated: (investment: Investment) => void;
}

export const InvestmentContainer: React.FC<InvestmentContainerProps> = ({ currentUser, onInvestmentCreated }) => {
  return (
    <div>
      <InvestmentForm currentUser={currentUser} onInvestmentCreated={onInvestmentCreated} />
      <InvestmentPanel currentUser={currentUser} />
    </div>
  );
};
