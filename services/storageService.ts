import { HistoryItem } from '../types';

const HISTORY_KEY = 'medicinal_ai_history';

export const saveScanResult = (item: HistoryItem) => {
  try {
    const currentHistory = getScanHistory();
    // Add new item to the beginning
    const updatedHistory = [item, ...currentHistory];
    
    // Limit to last 20 items to prevent LocalStorage quota issues
    if (updatedHistory.length > 20) {
      updatedHistory.pop();
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save history:", error);
  }
};

export const getScanHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};