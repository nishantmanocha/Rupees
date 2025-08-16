import { InstrumentConfig } from '../types';

export const DEFAULT_INSTRUMENTS: InstrumentConfig[] = [
  {
    id: 'ppf',
    name: 'PPF (Public Provident Fund)',
    annualRate: 0.071,
    compoundingPerYear: 1, // PPF compounds annually
    enabled: true,
    description: 'Government-backed long-term savings scheme with tax benefits'
  },
  {
    id: 'nifty50',
    name: 'Nifty 50 Index Fund',
    annualRate: 0.12,
    compoundingPerYear: 12,
    enabled: true,
    description: 'Low-cost equity mutual fund tracking Nifty 50 index'
  },
  {
    id: 'gold-etf',
    name: 'Gold ETF',
    annualRate: 0.08,
    compoundingPerYear: 12,
    enabled: true,
    description: 'Exchange-traded fund backed by physical gold'
  },
  {
    id: 'sgb',
    name: 'Sovereign Gold Bond (SGB)',
    annualRate: 0.10, // 7.5% + 2.5% interest component
    compoundingPerYear: 2, // SGB pays interest semi-annually
    enabled: true,
    description: 'Government gold bonds with additional interest income'
  },
  {
    id: 'debt-mf',
    name: 'Debt Mutual Fund',
    annualRate: 0.065,
    compoundingPerYear: 12,
    enabled: true,
    description: 'Fixed income mutual funds with moderate risk'
  },
  {
    id: 'fd',
    name: 'Fixed Deposit (FD)',
    annualRate: 0.07,
    compoundingPerYear: 4, // Quarterly compounding typical for FDs
    enabled: true,
    description: 'Bank fixed deposits with guaranteed returns'
  },
  {
    id: 'rd',
    name: 'Recurring Deposit (RD)',
    annualRate: 0.068,
    compoundingPerYear: 4,
    enabled: true,
    description: 'Regular monthly deposits with compound interest'
  },
  {
    id: 'elss',
    name: 'ELSS (Tax Saving MF)',
    annualRate: 0.115,
    compoundingPerYear: 12,
    enabled: true,
    description: 'Equity-linked savings scheme with tax benefits under 80C'
  },
  {
    id: 'sukanya',
    name: 'Sukanya Samriddhi Yojana',
    annualRate: 0.08,
    compoundingPerYear: 1,
    enabled: true,
    description: 'Government scheme for girl child education with tax benefits'
  },
  {
    id: 'nps',
    name: 'NPS (National Pension System)',
    annualRate: 0.09,
    compoundingPerYear: 12,
    enabled: true,
    description: 'Pension scheme with mix of equity, debt, and government securities'
  }
];

export const getInstrumentById = (id: string): InstrumentConfig | undefined => {
  return DEFAULT_INSTRUMENTS.find(instrument => instrument.id === id);
};

export const getEnabledInstruments = (): InstrumentConfig[] => {
  return DEFAULT_INSTRUMENTS.filter(instrument => instrument.enabled);
};