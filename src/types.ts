export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum IncomeSource {
  SALARY = 'salary',
  PARENTAL = 'parental',
  DESIGN = 'design',
  MONTAGE = 'montage',
  COMPETITION = 'competition',
  FREELANCE = 'freelance',
  GIFT = 'gift',
  OTHER = 'other',
}

export enum ExpenseCategory {
  FOOD = 'food',
  TRANSPORT = 'transport',
  INTERNET = 'internet',
  EQUIPMENT = 'equipment',
  SOFTWARE = 'software',
  CLOTHING = 'clothing',
  STUDY = 'study',
  ENTERTAINMENT = 'entertainment',
  CHARITY = 'charity',
  PERSONAL = 'personal',
}

export enum ProjectStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum TransactionStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
}

export enum DebtType {
  OWED_TO_ME = 'owed_to_me', // You are the lender
  I_OWE = 'i_owe',         // You are the borrower
}

export enum DebtStatus {
  ACTIVE = 'active',
  PAID = 'paid',
}

export interface Debt {
  id: string;
  userId: string;
  personName: string;
  amount: number;
  type: DebtType;
  status: DebtStatus;
  dueDate?: string;
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Transaction {
  id: string;
  amount: number;
  date: Date;
  type: TransactionType;
  category: IncomeSource | ExpenseCategory;
  notes?: string;
  proofImage?: string;
  status?: TransactionStatus;
}

export interface Project {
  id: string;
  clientName: string;
  type: string; // design, montage, etc.
  amount: number;
  status: ProjectStatus;
  deliveryDate: Date;
  createdAt: Date;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  limit: number;
  spent: number;
}
