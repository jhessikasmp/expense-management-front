import React from 'react';
import { Investment } from '@shared/types/core.types';
import { User } from '@shared/types/user.types';
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
