import React, { useState, useEffect } from 'react';
import api from '../api';
import BasicFields from './AddPersonaForm/BasicFields';
import CustomAttribute from './AddPersonaForm/CustomAttribute';

const AddPersonaForm = ({ addPersona, adding = false, availableColumns = [] }) => {
  const [nombre, setNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [customAttributes, setCustomAttributes] = useState([]);
  const [allPersonas, setAllPersonas] = useState([]);
  const [tiposRelaciones, setTiposRelaciones] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [showSuggestions, setShowSuggestions] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [imagenes, setImagenes] = useState([]);

  const addCustomAttribute = () => {
    const newAttribute = { 
      name: '', 
      value: '', 
      type: 'TEXT', 
      input: 'text',
      fecha_inicio: '',
      fecha_fin: '',
      notas: ''
    };
    setCustomAttributes([...customAttributes, newAttribute]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagenes(prev => [...prev, { 
          nombre_imagen: '', 
          imagen_data: base64String,
          preview: base64String 
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const updateImageName = (index, name) => {
    const newImagenes = [...imagenes];
    newImagenes[index].nombre_imagen = name;
    setImagenes(newImagenes);
  };

  const removeImage = (index) => {
    setImagenes(imagenes.filter((_, i) => i !== index));
  };

  const loadAllPersonas = async () => {
    try {
      const response = await api.get('/personas/');
      setAllPersonas(response.data);
    } catch (error) {
      console.error('Error cargando personas:', error);
    }
  };

  const loadTiposRelaciones = async (categoria = null) => {
    try {
      const url = categoria ? `/relaciones/tipos/?categoria=${categoria}` : '/relaciones/tipos/';
      const response = await api.get(url);
      setTiposRelaciones(response.data.tipos_relaciones || []);
    } catch (error) {
      console.error('Error cargando tipos de relaciones:', error);
      setTiposRelaciones([]);
    }
  };

  const getSuggestions = (inputValue, index) => {
    if (!inputValue || inputValue.length < 1) {
      setSuggestions(prev => ({ ...prev, [index]: [] }));
      setShowSuggestions(prev => ({ ...prev, [index]: false }));
      return;
    }
    
    const filteredColumns = availableColumns.filter(column => 
      column.toLowerCase().startsWith(inputValue.toLowerCase())
    );
    
    const relacionesArray = Array.isArray(tiposRelaciones) ? tiposRelaciones : [];
    const filteredRelaciones = relacionesArray.filter(relacion => 
      relacion.toLowerCase().startsWith(inputValue.toLowerCase())
    );
    
    const allSuggestions = [...filteredColumns, ...filteredRelaciones];
    
    setSuggestions(prev => ({ ...prev, [index]: allSuggestions }));
    setShowSuggestions(prev => ({ ...prev, [index]: allSuggestions.length > 0 }));
  };

  const selectSuggestion = (index, suggestion) => {
    setShowSuggestions(prev => ({ ...prev, [index]: false }));
    setSuggestions(prev => ({ ...prev, [index]: [] }));
    
    const suggestedType = getSuggestedType(suggestion);
    
    const newAttributes = [...customAttributes];
    const attribute = {...newAttributes[index]};
    attribute.name = suggestion;
    if (suggestedType) {
      attribute.type = suggestedType;
      attribute.input = suggestedType === 'DATE' ? 'date' : 'text';
    }
    
    newAttributes[index] = attribute;
    setCustomAttributes(newAttributes);
  };

  const getSuggestedType = (attributeName) => {
    const name = attributeName.toLowerCase();
    
    const relacionesArray = Array.isArray(tiposRelaciones) ? tiposRelaciones : [];
    if (relacionesArray.some(tipo => tipo.toLowerCase() === name)) {
      return 'RELACION';
    }
    
    if (name.includes('hijo') || name.includes('hija') || name.includes('padre') || 
        name.includes('madre') || name.includes('esposo') || name.includes('esposa') ||
        name.includes('hermano') || name.includes('hermana') || name.includes('primo') ||
        name.includes('prima') || name.includes('tio') || name.includes('tia') ||
        name.includes('abuelo') || name.includes('abuela') || name.includes('nieto') ||
        name.includes('nieta') || name.includes('sobrino') || name.includes('sobrina') ||
        name.includes(' de') || name.includes('pareja') || name.includes('conyuge')) {
      return 'RELACION';
    }
    
    if (name.includes('fecha') || name.includes('date') || 
        name.includes('nacimiento') || name.includes('ingreso') ||
        name.includes('creacion') || name.includes('actualizacion')) {
      return 'DATE';
    }
    
    if (name.includes('edad') || name.includes('ano') || name.includes('year') ||
        name.includes('cantidad') || name.includes('numero') || name.includes('id')) {
      return 'INTEGER';
    }
    
    if (name.includes('precio') || name.includes('salario') || name.includes('peso') ||
        name.includes('altura') || name.includes('porcentaje') || name.includes('ratio')) {
      return 'REAL';
    }
    
    return 'TEXT';
  };

  useEffect(() => {
    loadTiposRelaciones();
    loadAllPersonas();
  }, []);

  const removeCustomAttribute = (index) => {
    const newAttributes = customAttributes.filter((_, i) => i !== index);
    setCustomAttributes(newAttributes);
  };

  const updateCustomAttribute = (index, field, value) => {
    const newAttributes = [...customAttributes];
    const attribute = {...newAttributes[index], [field]: value};
    
    if (field === 'type') {
      if (value === 'DATE') {
        attribute.input = 'date';
      } else if (value === 'RELACION') {
        attribute.input = 'relacion';
        loadAllPersonas();
        loadTiposRelaciones();
      } else {
        attribute.input = 'text';
      }
      attribute.value = '';
      attribute.personaRelacionadaId = null;
      attribute.nombreNuevo = '';
      attribute.apellidoNuevo = '';
    }
    
    if (field === 'name') {
      getSuggestions(value, index);
    }
    
    newAttributes[index] = attribute;
    setCustomAttributes(newAttributes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nombre.trim() && primerApellido.trim() && !adding) {
      const relaciones = [];
      const atributos = [];

      for (const attr of customAttributes) {
        if (attr.name.trim()) {
          const nombreAtributo = attr.name.trim();
          
          if (attr.type === 'RELACION') {
            if (attr.personaRelacionadaId) {
              relaciones.push({
                tipo_relacion: nombreAtributo,
                categoria: attr.categoria || 'familiar',
                persona_relacionada_id: attr.personaRelacionadaId
              });
            } else if (attr.nombreNuevo && attr.apellidoNuevo) {
              relaciones.push({
                tipo_relacion: nombreAtributo,
                categoria: attr.categoria || 'familiar',
                nombre_nuevo: attr.nombreNuevo,
                apellido_nuevo: attr.apellidoNuevo
              });
            }
          } else if (attr.value && attr.value.trim()) {
            // Usar atributos temporales en lugar de extra_fields
            atributos.push({
              nombre_atributo: nombreAtributo,
              valor: attr.value.trim(),
              fecha_inicio: attr.fecha_inicio || null,
              fecha_fin: attr.fecha_fin || null,
              notas: attr.notas || null
            });
          }
        }
      }

      try {
        // Crear persona solo con nombre y apellido
        const personaResponse = await addPersona({ 
          Nombre: nombre.trim(), 
          Primer_apellido: primerApellido.trim(),
          extra_fields: {} // Vacío, ya no usamos extra_fields
        });
        
        if (personaResponse && personaResponse.id) {
          // Agregar atributos temporales
          for (const atributo of atributos) {
            await api.post(`/personas/${personaResponse.id}/atributos/`, atributo);
          }
          
          // Agregar relaciones
          for (const relacion of relaciones) {
            await api.post(`/personas/${personaResponse.id}/relaciones/`, relacion);
          }
          
          // Subir imágenes
          for (const imagen of imagenes) {
            if (imagen.nombre_imagen.trim()) {
              await api.post(`/personas/${personaResponse.id}/imagenes/`, {
                nombre_imagen: imagen.nombre_imagen.trim(),
                imagen_data: imagen.imagen_data
              });
            }
          }
        }
        
        setNombre('');
        setPrimerApellido('');
        setCustomAttributes([]);
        setImagenes([]);
        setIsExpanded(false);
        
      } catch (error) {
        console.error('Error creating person with custom attributes:', error);
        alert('Error al crear persona: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700 transition-all duration-300">
      {/* Header expandible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-4 flex items-center justify-between transition-all duration-300"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Añadir Nueva Persona</h3>
        </div>
        <svg 
          className={`w-6 h-6 text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Formulario */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="p-6 space-y-6 animate-fade-in">
          {/* Campos básicos usando componente */}
          <BasicFields
            nombre={nombre}
            primerApellido={primerApellido}
            onNombreChange={setNombre}
            onApellidoChange={setPrimerApellido}
          />

          {/* Atributos personalizados */}
          {customAttributes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-200">Atributos Personalizados</h4>
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {customAttributes.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {customAttributes.map((attr, index) => (
                  <CustomAttribute
                    key={index}
                    attr={attr}
                    index={index}
                    allPersonas={allPersonas}
                    suggestions={suggestions[index]}
                    showSuggestions={showSuggestions[index]}
                    onNameChange={(idx, value) => updateCustomAttribute(idx, 'name', value)}
                    onTypeChange={(idx, value) => updateCustomAttribute(idx, 'type', value)}
                    onValueChange={(idx, field, value) => updateCustomAttribute(idx, field, value)}
                    onRemove={removeCustomAttribute}
                    onFocus={(idx, value) => getSuggestions(value, idx)}
                    onBlur={(idx) => setTimeout(() => setShowSuggestions(prev => ({ ...prev, [idx]: false })), 200)}
                    onSelectSuggestion={selectSuggestion}
                    onRelacionChange={(idx, field, value) => {
                      const newAttributes = [...customAttributes];
                      newAttributes[idx] = {
                        ...attr,
                        [field]: value,
                        ...(field === 'personaRelacionadaId' && value ? { nombreNuevo: '', apellidoNuevo: '' } : {}),
                        ...(field === 'nombreNuevo' || field === 'apellidoNuevo' ? { personaRelacionadaId: null } : {})
                      };
                      setCustomAttributes(newAttributes);
                      
                      // Recargar tipos de relaciones cuando cambie la categoría
                      if (field === 'categoria') {
                        loadTiposRelaciones(value);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sección de imágenes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-200">Imágenes</h4>
              {imagenes.length > 0 && (
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {imagenes.length}
                </span>
              )}
            </div>
            
            {/* Input para subir imágenes */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg cursor-pointer transition-colors border-2 border-dashed border-gray-600 hover:border-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Seleccionar Imágenes</span>
              </label>
            </div>

            {/* Vista previa de imágenes */}
            {imagenes.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {imagenes.map((img, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3 space-y-2">
                    <div className="relative aspect-video bg-gray-800 rounded overflow-hidden">
                      <img 
                        src={img.preview} 
                        alt={`Preview ${index}`}
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Nombre (ej: retrato, cuadro)"
                      value={img.nombre_imagen}
                      onChange={(e) => updateImageName(index, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 pt-4 border-t-2 border-gray-700">
            <button
              type="button"
              onClick={addCustomAttribute}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Añadir Atributo</span>
            </button>
            
            <button 
              type="submit"
              disabled={adding}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform shadow-lg ${
                adding 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
              }`}
            >
              {adding ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Agregando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Agregar Persona</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddPersonaForm;