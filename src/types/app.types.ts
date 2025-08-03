export const tabIds = ['dashboard', 'expenses', 'investments', 'travel', 'emergency', 'car', 'allowance'] as const;
export type TabId = typeof tabIds[number];

export interface Tab {
  id: TabId;
  label: string;
  icon: string;
  component?: JSX.Element;
}
