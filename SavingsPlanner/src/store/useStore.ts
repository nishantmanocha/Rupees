import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Expense, Goal, InstrumentConfig } from '../types';
import { DEFAULT_INSTRUMENTS } from '../utils/defaultInstruments';

interface StoreState extends AppState {
  // Actions
  setIncome: (income: number) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  setPrimaryGoal: (goalId: string | undefined) => void;
  updateInstrument: (id: string, updates: Partial<InstrumentConfig>) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  completeOnboarding: () => void;
  resetData: () => void;
}

const initialState: AppState = {
  income: 0,
  expenses: [],
  goals: [],
  instruments: DEFAULT_INSTRUMENTS,
  theme: 'system',
  primaryGoalId: undefined,
  hasCompletedOnboarding: false,
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setIncome: (income: number) => set({ income }),

      addExpense: (expense: Expense) => 
        set(state => ({ expenses: [...state.expenses, expense] })),

      updateExpense: (id: string, updates: Partial<Expense>) =>
        set(state => ({
          expenses: state.expenses.map(expense =>
            expense.id === id ? { ...expense, ...updates } : expense
          )
        })),

      removeExpense: (id: string) =>
        set(state => ({
          expenses: state.expenses.filter(expense => expense.id !== id)
        })),

      addGoal: (goal: Goal) =>
        set(state => ({ goals: [...state.goals, goal] })),

      updateGoal: (id: string, updates: Partial<Goal>) =>
        set(state => ({
          goals: state.goals.map(goal =>
            goal.id === id ? { ...goal, ...updates } : goal
          )
        })),

      removeGoal: (id: string) =>
        set(state => ({
          goals: state.goals.filter(goal => goal.id !== id),
          primaryGoalId: state.primaryGoalId === id ? undefined : state.primaryGoalId
        })),

      setPrimaryGoal: (goalId: string | undefined) =>
        set({ primaryGoalId: goalId }),

      updateInstrument: (id: string, updates: Partial<InstrumentConfig>) =>
        set(state => ({
          instruments: state.instruments.map(instrument =>
            instrument.id === id ? { ...instrument, ...updates } : instrument
          )
        })),

      setTheme: (theme: 'light' | 'dark' | 'system') =>
        set({ theme }),

      completeOnboarding: () =>
        set({ hasCompletedOnboarding: true }),

      resetData: () => set(initialState),
    }),
    {
      name: 'savings-planner-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        income: state.income,
        expenses: state.expenses,
        goals: state.goals,
        instruments: state.instruments,
        theme: state.theme,
        primaryGoalId: state.primaryGoalId,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);