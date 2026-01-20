import { create } from 'zustand';
import { ChatMessage } from '@/src/types';

// Minimal client-side store - only for UI state that can't be on server
interface UIStore {
  // Processing state for optimistic UI
  isProcessing: boolean;
  processingMessage: string | null;
  
  // Temporary messages before server confirmation
  pendingMessages: ChatMessage[];
  
  // UI state
  isSidebarOpen: boolean;
  
  // Actions
  setProcessing: (isProcessing: boolean, message?: string) => void;
  addPendingMessage: (message: ChatMessage) => void;
  clearPendingMessages: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isProcessing: false,
  processingMessage: null,
  pendingMessages: [],
  isSidebarOpen: true,

  setProcessing: (isProcessing, message) => 
    set({ isProcessing, processingMessage: message || null }),
  
  addPendingMessage: (message) =>
    set((state) => ({ pendingMessages: [...state.pendingMessages, message] })),
  
  clearPendingMessages: () => 
    set({ pendingMessages: [] }),
  
  toggleSidebar: () => 
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
