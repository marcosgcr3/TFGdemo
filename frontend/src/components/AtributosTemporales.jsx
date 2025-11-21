import React, { useState, useEffect } from 'react';
import { fetchAtributos, createAtributo, updateAtributo, deleteAtributo } from '../api';
import PartialDateInput from './PartialDateInput';

/**
 * Componente para gestionar atributos temporales de una persona
 */
const AtributosTemporales = ({ personaId }) => {
  const [atributos, setAtributos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre_atributo: '',
    valor: '',
    fecha_inicio: '',
    fecha_fin: '',
    notas: ''
  });

  useEffect(() => {
    loadAtributos();
  }, [personaId]);

  const loadAtributos = async () => {
    try {
      setLoading(true);
      const data = await fetchAtributos(personaId);
      setAtributos(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar atributos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateAtributo(personaId, editingId, formData);
      } else {
        await createAtributo(personaId, formData);
      }
      
      resetForm();
      loadAtributos();
    } catch (err) {
      setError('Error al guardar atributo: ' + err.message);
    }
  };

  const handleDelete = async (atributoId) => {
    if (!confirm('¿Eliminar este atributo?')) return;
    
    try {
      await deleteAtributo(personaId, atributoId);
      loadAtributos();
    } catch (err) {
      setError('Error al eliminar atributo: ' + err.message);
    }
  };

  const handleEdit = (atributo) => {
    setEditingId(atributo.id);
    setFormData({
      nombre_atributo: atributo.nombre_atributo,
      valor: atributo.valor,
      fecha_inicio: atributo.fecha_inicio || '',
      fecha_fin: atributo.fecha_fin || '',
      notas: atributo.notas || ''
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      nombre_atributo: '',
      valor: '',
      fecha_inicio: '',
      fecha_fin: '',
      notas: ''
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const formatPartialDate = (dateStr) => {
    if (!dateStr) return '-';
    const [dia, mes, anio] = dateStr.split('-');
    
    if (dia === '00' && mes === '00') return anio; // Solo año
    if (dia === '00') return `${mes}/${anio}`; // Mes/Año
    return `${dia}/${mes}/${anio}`; // Fecha completa
  };

  // Agrupar atributos por nombre para ver historial
  const groupedAtributos = atributos.reduce((acc, attr) => {
    if (!acc[attr.nombre_atributo]) {
      acc[attr.nombre_atributo] = [];
    }
    acc[attr.nombre_atributo].push(attr);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Atributos Temporales</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          {showAddForm ? 'Cancelar' : '+ Añadir Atributo'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-white">
            {editingId ? 'Editar Atributo' : 'Nuevo Atributo'}
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nombre del Atributo *
              </label>
              <input
                type="text"
                value={formData.nombre_atributo}
                onChange={(e) => setFormData({ ...formData, nombre_atributo: e.target.value })}
                placeholder="ej: Ocupación, Residencia..."
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Valor *
              </label>
              <input
                type="text"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="ej: Médico, Madrid..."
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PartialDateInput
              label="Fecha de Inicio"
              value={formData.fecha_inicio}
              onChange={(val) => setFormData({ ...formData, fecha_inicio: val })}
              placeholder="00-00-YYYY (opcional)"
            />
            
            <PartialDateInput
              label="Fecha de Fin"
              value={formData.fecha_fin}
              onChange={(val) => setFormData({ ...formData, fecha_fin: val })}
              placeholder="00-00-YYYY (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Información adicional..."
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {atributos.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No hay atributos temporales registrados</p>
          <p className="text-sm mt-2">Los atributos temporales permiten registrar cambios a lo largo del tiempo</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedAtributos).map(([nombreAtributo, attrs]) => (
            <div key={nombreAtributo} className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-blue-400">📋</span>
                {nombreAtributo}
                <span className="text-xs text-gray-500">({attrs.length} registro{attrs.length > 1 ? 's' : ''})</span>
              </h4>
              
              <div className="space-y-2">
                {attrs.sort((a, b) => {
                  // Ordenar por fecha de inicio (más reciente primero)
                  if (!a.fecha_inicio) return 1;
                  if (!b.fecha_inicio) return -1;
                  return b.fecha_inicio.localeCompare(a.fecha_inicio);
                }).map((attr) => (
                  <div
                    key={attr.id}
                    className="bg-gray-700/50 rounded-lg p-3 flex items-start justify-between hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{attr.valor}</span>
                        {!attr.fecha_fin && (
                          <span className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded">
                            Actual
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-400">
                        {attr.fecha_inicio && (
                          <span>
                            🗓️ {formatPartialDate(attr.fecha_inicio)}
                            {attr.fecha_fin && ` → ${formatPartialDate(attr.fecha_fin)}`}
                          </span>
                        )}
                        {!attr.fecha_inicio && !attr.fecha_fin && (
                          <span className="text-gray-500">Sin fechas especificadas</span>
                        )}
                      </div>
                      
                      {attr.notas && (
                        <div className="text-sm text-gray-400 mt-1 italic">
                          💬 {attr.notas}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEdit(attr)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(attr.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AtributosTemporales;
