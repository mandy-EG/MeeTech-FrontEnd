import { toast } from 'sonner';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Función genérica para mostrar una alerta de confirmación premium usando Sonner.
 * Implementa un diseño Glassmorphism y mantiene la firma de promesas.
 * 
 * @param {string} title - El título principal de la alerta.
 * @param {string} text - El texto descriptivo o de advertencia.
 * @param {string} confirmText - El texto del botón de confirmación.
 * @returns {Promise<boolean>} Retorna true si el usuario confirmó, false si canceló.
 */
export const confirmAlert = (
  title = '¿Estás seguro?',
  text = 'Esta acción no se puede deshacer.',
  confirmText = 'Sí, continuar'
) => {
  return new Promise((resolve) => {
    // Usamos un ID único para poder cerrarla programáticamente
    const toastId = toast.custom((t) => (
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-2xl border border-white/60 p-5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] w-full max-w-sm flex flex-col gap-4 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Decoración de fondo */}
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>

        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center border border-red-100 shadow-inner">
            <AlertTriangle className="text-red-500" size={24} strokeWidth={2.5} />
          </div>
          <div className="flex-1 pt-1">
            <h1 className="font-bold text-gray-900 text-base">{title}</h1>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{text}</p>
          </div>
          <button 
            onClick={() => {
              toast.dismiss(t);
              resolve(false);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="flex justify-end gap-2 mt-2 relative z-10">
          <button 
            className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold transition-all active:scale-95"
            onClick={() => {
              toast.dismiss(t);
              resolve(false);
            }}
          >
            Cancelar
          </button>
          <button 
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-sm font-bold shadow-md shadow-red-500/20 transition-all active:scale-95 border border-red-500"
            onClick={() => {
              toast.dismiss(t);
              resolve(true);
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    ), {
      duration: Infinity, // No se cierra sola
      position: 'top-center', // Aparece centrada arriba
      id: 'custom-confirm-toast', // Previene que se abran múltiples iguales
    });
  });
};
