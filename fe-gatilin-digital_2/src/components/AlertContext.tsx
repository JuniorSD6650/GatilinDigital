'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface Alert {
  id: string;
  type: AlertType;
  message: string;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

interface AlertContextType {
  showAlert: (type: AlertType, message: string) => void;
  showConfirm: (options: ConfirmOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmOptions | null>(null);

  const showAlert = useCallback((type: AlertType, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setAlerts((prev) => [...prev, { id, type, message }]);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 5000);
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    setConfirmDialog(options);
  }, []);

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const handleConfirm = () => {
    if (confirmDialog) {
      confirmDialog.onConfirm();
      setConfirmDialog(null);
    }
  };

  const handleCancel = () => {
    setConfirmDialog(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* Toast Notifications */}
      <div className="fixed top-20 inset-x-4 sm:left-auto sm:right-4 z-[200] space-y-2 sm:max-w-sm" aria-live="polite" role="status">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`
              relative overflow-hidden pl-5 pr-3 py-3.5 rounded-xl shadow-2xl border border-white/10 bg-[#1a1224]/95 text-white backdrop-blur-md animate-in
            `}
          >
            <span
              aria-hidden
              className={`absolute inset-y-0 left-0 w-1.5
                ${alert.type === 'success' ? 'bg-green-500' : ''}
                ${alert.type === 'error' ? 'bg-red-500' : ''}
                ${alert.type === 'warning' ? 'bg-yellow-400' : ''}
                ${alert.type === 'info' ? 'bg-blue-500' : ''}
              `}
            />
            <div className="flex items-start gap-3">
              <span
                className={`grid place-items-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0
                  ${alert.type === 'success' ? 'bg-green-500/20 text-green-400' : ''}
                  ${alert.type === 'error' ? 'bg-red-500/20 text-red-400' : ''}
                  ${alert.type === 'warning' ? 'bg-yellow-400/20 text-yellow-300' : ''}
                  ${alert.type === 'info' ? 'bg-blue-500/20 text-blue-400' : ''}
                `}
              >
                {alert.type === 'success' && '✓'}
                {alert.type === 'error' && '✕'}
                {alert.type === 'warning' && '!'}
                {alert.type === 'info' && 'i'}
              </span>
              <p className="flex-1 text-sm leading-snug text-white/90">{alert.message}</p>
              <button
                onClick={() => removeAlert(alert.id)}
                aria-label="Cerrar notificación"
                className="text-white/50 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
          <div className="bg-negrito-card border border-white/10 rounded-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-display font-bold text-white mb-2">
              {confirmDialog.title}
            </h3>
            <p className="text-gray-400 mb-6">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-neutral-900 border border-white/10 text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                {confirmDialog.cancelText || 'Cancelar'}
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                {confirmDialog.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
