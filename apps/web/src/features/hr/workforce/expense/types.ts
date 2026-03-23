export type ExpenseStat = {
  id: string;
  label: string;
  value: string;
  icon: 'total' | 'pending' | 'unexpected' | 'month';
};

export type ExpenseBreakdownItem = {
  id: string;
  label: string;
  value: number;
  percent: string;
  color: string;
};

export type MonthlyExpensePoint = {
  month: string;
  amount: number;
};

export type ExpenseRequestPriority = 'high' | 'medium';

export type ExpenseRequestItem = {
  id: string;
  title: string;
  priority: ExpenseRequestPriority;
  department: string;
  amount: string;
  reason: string;
  budget: string;
  responsible: string;
  requested: string;
};

export type UnexpectedExpenseItem = {
  id: string;
  title: string;
  date: string;
  amount: string;
  coveredBy: string;
  approvedBy: string;
};

export type ExpenseCategoryBreakdown = {
  id: string;
  label: string;
  value: string;
};

export type ExpenseHistoryItem = {
  id: string;
  monthLabel: string;
  totalExpenses: string;
  categories: ExpenseCategoryBreakdown[];
};

export type RecentExpenseItem = {
  id: string;
  title: string;
  status: 'completed';
  amount: string;
  fromBudget: string;
  responsible: string;
  timeframe: string;
  date: string;
  note: string;
};
