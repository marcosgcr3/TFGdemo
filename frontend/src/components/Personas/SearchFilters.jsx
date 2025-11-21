import React from 'react';

const SearchFilters = ({ 
  searchTerm, 
  setSearchTerm,
  atributoFilters,
  setAtributoFilters,
  availableColumns,
  searching,
  clearFilters,
  searchPersonas
}) => {
  return (
    <div className="mb-6 p-6 bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700">
      <h3 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filtros de Búsqueda
      </h3>
      
      {/* Búsqueda por texto */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold text-gray-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Buscar por nombre o apellido:
        </label>
        <div className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Escribe nombre o apellido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Filtros por atributos temporales */}
      {availableColumns.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-200 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filtrar por atributos:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableColumns.map(atributo => (
              <div key={atributo}>
                <label className="text-xs text-gray-400 mb-1 block font-medium">
                  {atributo}:
                </label>
                <input
                  type="text"
                  placeholder={`Buscar por ${atributo}...`}
                  value={atributoFilters[atributo] || ''}
                  onChange={(e) => setAtributoFilters(prev => ({
                    ...prev,
                    [atributo]: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3 items-center flex-wrap">
        <button
          onClick={clearFilters}
          className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Limpiar Filtros
        </button>
        
        <button
          onClick={searchPersonas}
          disabled={searching}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-md ${
            searching 
              ? 'bg-gray-500 cursor-not-allowed text-gray-300' 
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105'
          }`}
        >
          {searching ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Buscando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar Ahora
            </>
          )}
        </button>

        {/* Indicador de filtros activos */}
        {(searchTerm || Object.keys(atributoFilters).some(key => atributoFilters[key])) && (
          <div className="ml-auto flex items-center gap-2 bg-blue-600/20 px-4 py-2 rounded-lg border border-blue-500/30">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-400 font-medium">
              Filtros activos
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
