import React from 'react';

const CustomAttribute = ({ 
  attr, 
  index, 
  allPersonas,
  suggestions,
  showSuggestions,
  onNameChange,
  onTypeChange,
  onValueChange,
  onRemove,
  onFocus,
  onBlur,
  onSelectSuggestion,
  onRelacionChange
}) => {
  return (
    <div className="bg-gray-700/50 p-4 rounded-xl border-2 border-gray-600 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Campo de nombre con sugerencias */}
        <div className="relative">
          <input
            type="text"
            value={attr.name || ''}
            onChange={(e) => onNameChange(index, e.target.value)}
            onFocus={() => onFocus(index, attr.name || '')}
            onBlur={() => onBlur(index)}
            placeholder="Nombre del atributo"
            className="w-full px-4 py-2 rounded-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-200"
          />
          
          {/* Dropdown de sugerencias */}
          {showSuggestions && suggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-xl max-h-40 overflow-y-auto z-50">
              {suggestions.map((suggestion, suggestionIndex) => (
                <div
                  key={suggestionIndex}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onSelectSuggestion(index, suggestion);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer transition-colors duration-150 border-b border-gray-700 last:border-b-0"
                >
                  <span className="font-semibold text-purple-400">
                    {suggestion.substring(0, attr.name?.length || 0)}
                  </span>
                  <span className="text-gray-300">
                    {suggestion.substring(attr.name?.length || 0)}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">(existente)</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Selector de tipo */}
        <select
          value={attr.type}
          onChange={(e) => onTypeChange(index, e.target.value)}
          className="px-4 py-2 rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-200"
        >
          <option value="TEXT">Texto</option>
          <option value="INTEGER">Número</option>
          <option value="REAL">Decimal</option>
          <option value="DATE">Fecha</option>
          <option value="RELACION">Relación</option>
        </select>
      </div>
      
      {/* Campo de valor según el tipo */}
      {attr.type === 'DATE' ? (
        <input
          type="date"
          value={attr.value}
          onChange={(e) => onValueChange(index, 'value', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-200"
        />
      ) : attr.type === 'RELACION' ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Categoría de relación:</label>
            <select
              value={attr.categoria || 'familiar'}
              onChange={(e) => onRelacionChange(index, 'categoria', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-200"
            >
              <option value="familiar">Familiar</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Persona existente:</label>
            <select
              value={attr.personaRelacionadaId || ''}
              onChange={(e) => onRelacionChange(index, 'personaRelacionadaId', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-200"
            >
              <option value="">-- Seleccionar persona --</option>
              {allPersonas.map(persona => (
                <option key={persona.id} value={persona.id}>
                  {persona.Nombre} {persona.Primer_apellido} (ID: {persona.id})
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-center text-sm font-medium text-gray-400">O crear nueva persona</div>
          
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nombre"
              value={attr.nombreNuevo || ''}
              onChange={(e) => onRelacionChange(index, 'nombreNuevo', e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-200"
            />
            <input
              type="text"
              placeholder="Apellido"
              value={attr.apellidoNuevo || ''}
              onChange={(e) => onRelacionChange(index, 'apellidoNuevo', e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-200"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Valor principal */}
          <div className="flex gap-2">
            <input
              type={attr.type === 'INTEGER' || attr.type === 'REAL' ? 'number' : 'text'}
              step={attr.type === 'REAL' ? '0.01' : '1'}
              value={attr.value}
              onChange={(e) => onValueChange(index, 'value', e.target.value)}
              placeholder={`Valor ${attr.type === 'INTEGER' ? 'numérico' : attr.type === 'REAL' ? 'decimal' : 'del atributo'}`}
              className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              ✕
            </button>
          </div>

          {/* Fechas opcionales */}
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
            <div className="text-xs font-medium text-gray-400 mb-2">📅 Fechas (opcional) - Formato: DD-MM-YYYY</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Inicio</label>
                <input
                  type="text"
                  value={attr.fecha_inicio || ''}
                  onChange={(e) => onValueChange(index, 'fecha_inicio', e.target.value)}
                  placeholder="00-00-2005"
                  className="w-full px-3 py-1.5 text-sm rounded border border-gray-600 bg-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Fin</label>
                <input
                  type="text"
                  value={attr.fecha_fin || ''}
                  onChange={(e) => onValueChange(index, 'fecha_fin', e.target.value)}
                  placeholder="00-00-2010"
                  className="w-full px-3 py-1.5 text-sm rounded border border-gray-600 bg-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none"
                />
              </div>
            </div>
            <div className="text-xs text-gray-500 italic">
              💡 Usa 00 para fechas parciales: 00-00-2005 (solo año), 00-03-2005 (mes/año)
            </div>
          </div>

          {/* Notas opcionales */}
          <div>
            <textarea
              value={attr.notas || ''}
              onChange={(e) => onValueChange(index, 'notas', e.target.value)}
              placeholder="Notas adicionales (opcional)"
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none resize-none"
            />
          </div>
        </div>
      )}
      
      {attr.type === 'RELACION' && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          ✕ Eliminar Relación
        </button>
      )}
    </div>
  );
};

export default CustomAttribute;
