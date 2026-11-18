import React from 'react';
import { useRSA } from '../context/RSAContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useRSA();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border backdrop-blur-md shadow-lg flex items-start space-x-3 transition-all transform translate-y-0 ${
              isSuccess
                ? 'bg-lab-card/95 border-lab-emerald/40 text-lab-text'
                : isError
                ? 'bg-lab-card/95 border-red-500/40 text-lab-text'
                : 'bg-lab-card/95 border-lab-accent/40 text-lab-text'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-lab-emerald shrink-0 mt-0.5" />}
            {isError && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="w-5 h-5 text-lab-accent shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs">
              <h5 className="font-semibold text-lab-text">{toast.title}</h5>
              <p className="text-lab-muted mt-0.5 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-lab-muted hover:text-lab-text p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
