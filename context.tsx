import React, { createContext, useContext, useState, useEffect } from 'react';
import { Memory, AnniversaryEvent } from './types';
import { MEMORIES as INITIAL_MEMORIES, EVENTS as INITIAL_EVENTS } from './constants';

interface AppContextType {
  memories: Memory[];
  addMemory: (memory: Omit<Memory, 'id' | 'rotation'>) => void;
  updateMemory: (id: string, updates: Partial<Omit<Memory, 'id'>>) => void;
  deleteMemory: (id: string) => void;
  events: AnniversaryEvent[];
  addEvent: (event: Omit<AnniversaryEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<Omit<AnniversaryEvent, 'id'>>) => void;
  deleteEvent: (id: string) => void;
  togetherDate: string;
  updateTogetherDate: (date: string) => void;
  isConnected: boolean;
  inviteCode: string | null;
  connect: (code: string) => boolean;
  disconnect: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MEMORIES: 'gifts_memories',
  EVENTS: 'gifts_events',
  CONNECTION: 'gifts_connection',
  TOGETHER_DATE: 'gifts_together_date',
};

// Helper to safely parse JSON from localStorage
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return fallback;
  }
};

// Helper to safely save to localStorage
const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load data from localStorage on mount, fallback to initial data
  const [memories, setMemories] = useState<Memory[]>(() =>
    loadFromStorage(STORAGE_KEYS.MEMORIES, INITIAL_MEMORIES)
  );

  const [events, setEvents] = useState<AnniversaryEvent[]>(() =>
    loadFromStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS.map(e => ({
      id: e.id,
      title: e.title,
      subtitle: e.subtitle,
      date: e.date,
      type: e.type,
      image: e.image
    })))
  );

  // Save memories to localStorage whenever they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MEMORIES, memories);
  }, [memories]);

  // Save events to localStorage whenever they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EVENTS, events);
  }, [events]);

  const addMemory = (newMemory: Omit<Memory, 'id' | 'rotation'>) => {
    const memory: Memory = {
      ...newMemory,
      id: Date.now().toString(),
      rotation: Math.random() > 0.5 ? 'rotate-1' : '-rotate-1',
    };
    setMemories([memory, ...memories]);
  };

  const addEvent = (newEvent: Omit<AnniversaryEvent, 'id'>) => {
    const event: AnniversaryEvent = {
      ...newEvent,
      id: Date.now().toString(),
    };
    setEvents([event, ...events]);
  };

  const updateMemory = (id: string, updates: Partial<Omit<Memory, 'id'>>) => {
    setMemories(memories.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMemory = (id: string) => {
    setMemories(memories.filter(m => m.id !== id));
  };

  const updateEvent = (id: string, updates: Partial<Omit<AnniversaryEvent, 'id'>>) => {
    setEvents(events.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  // Connection & Settings state
  const [connectionState, setConnectionState] = useState<{
    isConnected: boolean;
    inviteCode: string | null;
    togetherDate: string;
  }>(() =>
    loadFromStorage(STORAGE_KEYS.CONNECTION, {
      isConnected: false,
      inviteCode: null,
      togetherDate: '2021-10-12' // Default fallback
    })
  );

  // Save connection state to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CONNECTION, connectionState);
  }, [connectionState]);

  const connect = (code: string): boolean => {
    // Simple validation - you can customize this logic
    const trimmedCode = code.trim();
    if (trimmedCode.length >= 6) {
      setConnectionState(prev => ({ ...prev, isConnected: true, inviteCode: trimmedCode }));
      return true;
    }
    return false;
  };

  const disconnect = () => {
    setConnectionState(prev => ({ ...prev, isConnected: false, inviteCode: null }));
  };

  return (
    <AppContext.Provider value={{
      memories,
      addMemory,
      updateMemory,
      deleteMemory,
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      togetherDate: connectionState.togetherDate,
      updateTogetherDate: (date) => setConnectionState(prev => ({ ...prev, togetherDate: date })),
      isConnected: connectionState.isConnected,
      inviteCode: connectionState.inviteCode,
      connect,
      disconnect
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// ============== Date Utilities (using day.js) ==============
import dayjs from 'dayjs';

// Calculate Days Left (Future) or Days Ago (Past)
// Returns negative for past, positive for future
export const calculateRelativeDays = (targetDate: string) => {
  const now = dayjs().startOf('day');
  const target = dayjs(targetDate).startOf('day');

  // If the target date's YEAR is in the future, use it directly (e.g., 2029-12-01)
  if (target.year() > now.year()) {
    return target.diff(now, 'day');
  }

  // For recurring events (Birthday, Anniversary with past or current year),
  // we calculate based on this year's occurrence
  const currentYearTarget = target.year(now.year());
  const diffDays = currentYearTarget.diff(now, 'day');

  // Logic:
  // If diffDays is between -30 and 0, we show "X days ago" (Past)
  // If diffDays < -30, we assume the user cares about the NEXT one (Future, next year)
  // If diffDays >= 0, it's Upcoming (Future, this year)

  if (diffDays < -30) {
    // Too far past this year, show next year
    const nextYearTarget = target.year(now.year() + 1);
    return nextYearTarget.diff(now, 'day');
  }

  return diffDays;
};

// Calculate number of days together from a start date
export const calculateDaysTogether = (startDate: string) => {
  const start = dayjs(startDate).startOf('day');
  const now = dayjs().startOf('day');
  return now.diff(start, 'day');
};

// Legacy calculateDateDiff - kept for compatibility, returns days until next occurrence
export const calculateDateDiff = (targetDate: string) => {
  const now = dayjs().startOf('day');
  const target = dayjs(targetDate).startOf('day');

  // Set to current year
  let currentYearTarget = target.year(now.year());

  let diffDays = currentYearTarget.diff(now, 'day');

  // If the date has passed this year, look at next year
  if (diffDays < 0) {
    const nextYearTarget = target.year(now.year() + 1);
    diffDays = nextYearTarget.diff(now, 'day');
  }

  return diffDays;
};