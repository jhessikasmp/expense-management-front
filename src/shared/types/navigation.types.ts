export interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

export type TabId = 
  | 'dashboard'
  | 'expenses'
  | 'investments'
  | 'travel'
  | 'emergency'
  | 'car'
  | 'allowance'
  | 'annual-chart'
  | 'expense-history';

export interface TabStyle {
  padding: string;
  backgroundColor: string;
  color: string;
  border: string;
  cursor: string;
  borderRadius: string;
}

export interface MenuItemStyle extends TabStyle {
  display: string;
  width: string;
  textAlign: 'left';
  fontSize: string;
  borderBottom: string;
  transition: string;
}
