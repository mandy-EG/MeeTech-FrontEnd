import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const TemporizadorPedido = ({ createdAt, tiempoEstimadoMin }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Actualiza el reloj cada 1000ms (1 segundo)
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!createdAt) return <span className="text-gray-400">—</span>;

  // SOLUCIÓN: Normalización de zona horaria
  // Supabase/PostgreSQL está enviando la hora sumándole 5 horas y agregando la letra 'Z'.
  // Al reemplazar 'Z' por '+05:00', obligamos al navegador a restarle esas 5 horas,
  // logrando que concuerde exactamente con la hora local real.
  let fechaSegura = createdAt;
  if (typeof fechaSegura === 'string') {
    if (fechaSegura.endsWith('Z')) {
      fechaSegura = fechaSegura.slice(0, -1) + '+05:00';
    } else if (!fechaSegura.includes('+') && !fechaSegura.includes('-05')) {
      fechaSegura = fechaSegura.replace(' ', 'T') + '+05:00';
    }
  }

  // Cálculos en milisegundos y segundos
  const creadoMs = new Date(fechaSegura).getTime();
  const metaMs = creadoMs + (tiempoEstimadoMin * 60 * 1000);
  const diffSegundos = Math.floor((metaMs - now) / 1000);

  const esRetrasado = diffSegundos < 0;
  const absSegundos = Math.abs(diffSegundos);

  // Formateo estricto MM:SS
  const m = Math.floor(absSegundos / 60).toString().padStart(2, '0');
  const s = (absSegundos % 60).toString().padStart(2, '0');
  const tiempoFormateado = `${esRetrasado ? '-' : ''}${m}:${s}`;

  // Estilos visuales usando Tailwind CSS
  let containerClases = "bg-blue-50 border-blue-200";
  let textClases = "text-[#0066FF] font-medium";

  if (esRetrasado) {
    containerClases = "bg-red-50 border-red-200 animate-pulse";
    textClases = "text-red-600 font-bold";
  }

  return (
    <div className={`flex flex-col items-end text-right`}>
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border shadow-sm transition-colors ${containerClases}`}>
        <Clock size={14} className={textClases} />
        <span className={`text-[14px] font-mono tracking-wider ${textClases}`}>
          {tiempoFormateado}
        </span>
      </div>
      <span className="text-[10px] text-gray-400 mt-1 font-medium uppercase tracking-wider">
        Meta: {tiempoEstimadoMin}m
      </span>
    </div>
  );
};

export default TemporizadorPedido;