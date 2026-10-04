import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ message: '', visible: false });

  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`toast ${toast.visible ? 'show' : ''}`}>{toast.message}</div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
