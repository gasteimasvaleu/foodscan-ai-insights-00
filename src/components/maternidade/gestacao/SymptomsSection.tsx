import { AlertTriangle } from 'lucide-react';
import pregnancy from '@/data/maternidade/pregnancy-pt.json';

export const SymptomsSection = () => {
  const data = pregnancy.symptoms;

  return (
    <div className="space-y-4">
      <div className="bg-[#FFD1E7] rounded-3xl p-4">
        <h3 className="text-base text-gray-800">{data.title}</h3>
        <p className="text-xs text-gray-600 mt-0.5">Entenda os sintomas comuns e como aliviá-los</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {data.items.map((s, i) => (
          <div key={i} className="bg-[#FFD1E7] rounded-3xl p-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-800">{s.name}</h4>
            <p className="text-xs text-gray-700">{s.description}</p>
            <div>
              <p className="text-[11px] font-medium text-emerald-600 mb-1.5">Como aliviar</p>
              <ul className="space-y-1.5">
                {s.tips.map((t, ti) => (
                  <li
                    key={ti}
                    className="text-xs text-gray-700 bg-white/60 backdrop-blur-md rounded-xl p-2 flex gap-2"
                  >
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-red-50 border border-red-200 rounded-3xl p-4">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700">Quando procurar ajuda médica</p>
            <ul className="mt-2 space-y-1 text-xs text-red-700">
              <li>• Sangramento vaginal</li>
              <li>• Dor abdominal intensa</li>
              <li>• Febre acima de 38°C</li>
              <li>• Perda de líquido</li>
              <li>• Diminuição dos movimentos do bebê</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
