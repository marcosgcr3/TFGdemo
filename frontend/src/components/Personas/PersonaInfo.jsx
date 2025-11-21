import React, { useEffect, useState } from 'react';
import api from "../../api.js";

const PersonaInfo = ({ persona, onClose }) => {
  const [imagenes, setImagenes] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [relaciones, setRelaciones] = useState([]);
  const [loadingRelaciones, setLoadingRelaciones] = useState(true);
  const [atributos, setAtributos] = useState([]);
  const [loadingAtributos, setLoadingAtributos] = useState(true);

  useEffect(() => {
    if (persona) {
      loadImagenes();
      loadRelaciones();
      loadAtributos();
    }
  }, [persona]);

  const loadImagenes = async () => {
    try {
      setLoadingImages(true);
      const response = await api.get(`/personas/${persona.id}/imagenes/`);
      setImagenes(response.data);
    } catch (error) {
      console.error("Error cargando imágenes:", error);
    } finally {
      setLoadingImages(false);
    }
  };

  const loadRelaciones = async () => {
    try {
      setLoadingRelaciones(true);
      const response = await api.get(`/personas/${persona.id}/relaciones/`);
      setRelaciones(response.data);
    } catch (error) {
      console.error("Error cargando relaciones:", error);
    } finally {
      setLoadingRelaciones(false);
    }
  };

  const loadAtributos = async () => {
    try {
      setLoadingAtributos(true);
      const response = await api.get(`/personas/${persona.id}/atributos/`);
      setAtributos(response.data);
    } catch (error) {
      console.error("Error cargando atributos:", error);
    } finally {
      setLoadingAtributos(false);
    }
  };

  if (!persona) {
    return null;
  }

  // Formatear fecha para mostrar
  const formatFecha = (fecha) => {
    if (!fecha) return null;
    const [dia, mes, anio] = fecha.split('-');
    
    if (dia === '00' && mes === '00') return anio;
    if (dia === '00') return `${mes}/${anio}`;
    return `${dia}/${mes}/${anio}`;
  };

  // Agrupar atributos por nombre
  const atributosAgrupados = atributos.reduce((acc, attr) => {
    if (!acc[attr.nombre_atributo]) {
      acc[attr.nombre_atributo] = [];
    }
    acc[attr.nombre_atributo].push(attr);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl border-b border-blue-500 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            {/* Icono de usuario */}
            <div className="bg-white/10 p-3 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">
                {persona.Nombre} {persona.Primer_apellido}
              </h2>
              <p className="text-blue-200 text-sm mt-1">ID: #{persona.id}</p>
            </div>
          </div>
          
          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all duration-200 group"
            title="Cerrar"
          >
            <svg className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Campos Base */}
          <section>
            <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Información Básica
            </h3>
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400 font-medium">Nombre:</span>
                <span className="text-white font-semibold">{persona.Nombre}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400 font-medium">Apellido:</span>
                <span className="text-white font-semibold">{persona.Primer_apellido}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">ID:</span>
                <span className="text-blue-400 font-mono font-bold">#{persona.id}</span>
              </div>
            </div>
          </section>

          {/* Atributos Temporales */}
          <section>
            <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Atributos Adicionales
            </h3>
            {loadingAtributos ? (
              <div className="bg-gray-800/50 rounded-xl p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                <span className="ml-3 text-gray-400">Cargando atributos...</span>
              </div>
            ) : Object.keys(atributosAgrupados).length > 0 ? (
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                {Object.entries(atributosAgrupados).map(([nombre, attrs]) => (
                  <div key={nombre} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <div className="text-purple-400 font-semibold mb-3 text-lg">{nombre}</div>
                    <div className="space-y-2">
                      {attrs.map((attr, idx) => (
                        <div key={attr.id} className="flex items-start justify-between py-2 border-b border-gray-700 last:border-b-0">
                          <div className="flex-1">
                            <div className="text-white font-medium mb-1">{attr.valor}</div>
                            {(attr.fecha_inicio || attr.fecha_fin) && (
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>
                                  {formatFecha(attr.fecha_inicio) || '?'} → {formatFecha(attr.fecha_fin) || 'Presente'}
                                </span>
                              </div>
                            )}
                            {attr.notas && (
                              <div className="text-sm text-gray-500 italic mt-1">
                                📝 {attr.notas}
                              </div>
                            )}
                          </div>
                          {attrs.length > 1 && (
                            <span className="text-xs text-gray-500 ml-2">
                              #{idx + 1}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-xl p-8 text-center">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400">No hay atributos adicionales</p>
              </div>
            )}
          </section>

          {/* Relaciones */}
          <section>
            <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Relaciones
            </h3>
            {loadingRelaciones ? (
              <div className="bg-gray-800/50 rounded-xl p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                <span className="ml-3 text-gray-400">Cargando relaciones...</span>
              </div>
            ) : relaciones.length > 0 ? (
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                {relaciones.map((relacion, index) => (
                  <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-green-500/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-600/20 p-2 rounded-lg mt-1">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-400 mb-2">
                          <span className="font-medium text-blue-300">{persona.Nombre} {persona.Primer_apellido}</span>
                          <span className="mx-2 text-green-400 font-semibold">{relacion.tipo_relacion}</span>
                          <span className="font-medium text-purple-300">
                            {relacion.persona_relacionada?.Nombre} {relacion.persona_relacionada?.Primer_apellido}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="bg-blue-600/20 px-2 py-1 rounded text-blue-400 font-mono">
                            ID #{persona.id}
                          </span>
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span className="bg-purple-600/20 px-2 py-1 rounded text-purple-400 font-mono">
                            ID #{relacion.persona_relacionada?.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-xl p-8 text-center">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-400">No hay relaciones registradas</p>
              </div>
            )}
          </section>

          {/* Imágenes */}
          <section>
            <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Imágenes ({imagenes.length})
            </h3>
            {loadingImages ? (
              <div className="bg-gray-800/50 rounded-xl p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                <span className="ml-3 text-gray-400">Cargando imágenes...</span>
              </div>
            ) : imagenes.length > 0 ? (
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagenes.map((imagen) => (
                    <div key={imagen.id} className="group relative">
                      <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700 hover:border-yellow-500 transition-all duration-200">
                        <img
                          src={`http://localhost:8000${imagen.url}`}
                          alt={imagen.nombre_imagen}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-sm text-gray-400 truncate" title={imagen.nombre_imagen}>
                          {imagen.nombre_imagen}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-xl p-8 text-center">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400">No hay imágenes disponibles</p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 p-4 rounded-b-2xl border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonaInfo;
