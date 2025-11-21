import React, { useEffect, useState } from 'react';
import api from "../api.js";
import AddPersonaForm from './AddPersonaForm.jsx';
import SearchFilters from './Personas/SearchFilters.jsx';
import PersonaRow from './Personas/PersonaRow.jsx';
import DeleteModal from './Personas/DeleteModal.jsx';
import EditModal from './Personas/EditModal.jsx';
import PersonaInfo from './Personas/PersonaInfo.jsx';

const Personas = () => {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  
  // Estados para filtros avanzados
  const [searchTerm, setSearchTerm] = useState('');
  const [atributoFilters, setAtributoFilters] = useState({});
  const [searching, setSearching] = useState(false);
  
  // Estado para confirmar eliminación
  const [personaToDelete, setPersonaToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Estado para editar persona
  const [personaToEdit, setPersonaToEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    Nombre: '',
    Primer_apellido: '',
    extra_fields: {}
  });
  const [editRelaciones, setEditRelaciones] = useState([]); // Relaciones separadas
  const [originalRelaciones, setOriginalRelaciones] = useState([]); // Para rastrear eliminaciones
  
  // Estados para añadir nuevo campo en edición
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const [newFieldData, setNewFieldData] = useState({
    name: '',
    value: '',
    type: 'TEXT',
    personaRelacionadaId: null,
    nombreNuevo: '',
    apellidoNuevo: ''
  });
  const [allPersonas, setAllPersonas] = useState([]);
  const [fieldSuggestions, setFieldSuggestions] = useState([]);
  const [showFieldSuggestions, setShowFieldSuggestions] = useState(false);
  const [tiposRelaciones, setTiposRelaciones] = useState([]);
  
  // Estados para gestión de imágenes
  const [editImagenes, setEditImagenes] = useState([]); // Imágenes existentes
  const [newImagenes, setNewImagenes] = useState([]); // Nuevas imágenes a subir
  const [imagenesToDelete, setImagenesToDelete] = useState([]); // IDs de imágenes a eliminar

  // Estado para ver información de persona
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [showPersonaInfo, setShowPersonaInfo] = useState(false);

  const fetchPersonas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/personas/');
      setPersonas(response.data);
    } catch (error) {
      console.error("Error fetching personas", error);
      setError("Error al cargar las personas. Asegúrate de que el servidor esté ejecutándose.");
    } finally {
      setLoading(false);
    }
  };

  // Nueva función de búsqueda avanzada con filtros de atributos temporales
  const searchPersonas = async () => {
    try {
      setSearching(true);
      setError(null);
      
      // Construir objeto de filtros
      const filters = {
        search_text: searchTerm.trim() || null,
        atributo_filters: {}
      };
      
      // Añadir filtros de atributos que no estén vacíos
      Object.keys(atributoFilters).forEach(key => {
        const value = atributoFilters[key];
        if (value !== null && value !== '' && value !== undefined) {
          filters.atributo_filters[key] = value;
        }
      });
      
      const response = await api.post('/personas/search/', filters);
      setPersonas(response.data);
    } catch (error) {
      console.error("Error searching personas", error);
      setError("Error al buscar personas. Verifica los filtros e intenta nuevamente.");
    } finally {
      setSearching(false);
    }
  };

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm('');
    setAtributoFilters({});
    fetchPersonas(); // Cargar todas las personas
  };

  const fetchAvailableAtributos = async () => {
    try {
      const response = await api.get('/personas/atributos/nombres/');
      setAvailableColumns(response.data.atributos || []);
    } catch (error) {
      console.error("Error fetching atributos", error);
      setAvailableColumns([]);
    }
  };

  const fetchTiposRelaciones = async (categoria = null) => {
    try {
      const url = categoria ? `/relaciones/tipos/?categoria=${categoria}` : '/relaciones/tipos/';
      const response = await api.get(url);
      setTiposRelaciones(response.data.tipos_relaciones || []);
    } catch (error) {
      console.error("Error fetching tipos de relaciones", error);
    }
  };

  const addPersona = async (personaData) => {
    try {
      setAdding(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await api.post('/personas/', personaData);
      
      // Mostrar mensaje de éxito
      setSuccessMessage(`Persona "${response.data.Nombre} ${response.data.Primer_apellido}" añadida correctamente con ID: ${response.data.id}`);
      
      // Actualizar la lista y atributos disponibles
      await fetchPersonas();
      await fetchAvailableAtributos();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // IMPORTANTE: Devolver los datos de la persona creada
      return response.data;
      
    } catch (error) {
      console.error("Error adding persona", error);
      if (error.response && error.response.data && error.response.data.detail) {
        setError(`Error: ${error.response.data.detail}`);
      } else {
        setError("Error al agregar la persona. Verifica los datos e intenta nuevamente.");
      }
      throw error; // Re-lanzar el error para que AddPersonaForm lo pueda manejar
    } finally {
      setAdding(false);
    }
  };

  // Función para manejar eliminación de persona
  const handleDeleteClick = (persona) => {
    setPersonaToDelete(persona);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!personaToDelete) return;
    
    try {
      setLoading(true);
      await api.delete(`/personas/${personaToDelete.id}`);
      
      setSuccessMessage(`Persona "${personaToDelete.Nombre} ${personaToDelete.Primer_apellido}" eliminada correctamente`);
      
      // Actualizar la lista
      await fetchPersonas();
      await fetchAvailableAtributos();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error("Error deleting persona", error);
      if (error.response && error.response.data && error.response.data.detail) {
        setError(`Error: ${error.response.data.detail}`);
      } else {
        setError("Error al eliminar la persona.");
      }
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setPersonaToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPersonaToDelete(null);
  };

  // Funciones para ver información de persona
  const handleViewClick = (persona) => {
    setSelectedPersona(persona);
    setShowPersonaInfo(true);
  };

  const closePersonaInfo = () => {
    setShowPersonaInfo(false);
    setSelectedPersona(null);
  };

  // Funciones para editar persona
  const handleEditClick = async (persona) => {
    setPersonaToEdit(persona);
    
    // Filtrar solo campos que no son null, undefined o string vacío
    const filteredExtraFields = {};
    if (persona.extra_fields) {
      Object.entries(persona.extra_fields).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          filteredExtraFields[key] = value;
        }
      });
    }
    
    setEditFormData({
      Nombre: persona.Nombre,
      Primer_apellido: persona.Primer_apellido,
      extra_fields: filteredExtraFields
    });
    
    // Cargar todas las personas para el desplegable de relaciones
    await loadAllPersonasForEdit();
    
    // Cargar relaciones existentes
    await loadPersonaRelaciones(persona.id);
    
    // Cargar imágenes existentes
    await loadPersonaImagenes(persona.id);
    
    setShowEditModal(true);
  };

  // Función para cargar las relaciones de una persona
  const loadPersonaRelaciones = async (personaId) => {
    try {
      const response = await api.get(`/personas/${personaId}/relaciones/`);
      
      // Convertir las relaciones del backend al formato del frontend
      const relacionesMapeadas = response.data.map(rel => ({
        id: rel.id, // ID de la relación en la BD
        tipo_relacion: rel.tipo_relacion,
        persona_relacionada_id: rel.persona_relacionada.id,
        display_name: `${rel.persona_relacionada.Nombre} ${rel.persona_relacionada.Primer_apellido}`,
        isExisting: true // Marcar como existente para distinguir de nuevas
      }));
      
      setEditRelaciones(relacionesMapeadas);
      setOriginalRelaciones([...relacionesMapeadas]); // Copia para rastrear eliminaciones
    } catch (error) {
      console.error('Error cargando relaciones:', error);
      setEditRelaciones([]);
      setOriginalRelaciones([]);
    }
  };

  // Función para cargar las imágenes de una persona
  const loadPersonaImagenes = async (personaId) => {
    try {
      const response = await api.get(`/personas/${personaId}/imagenes/`);
      setEditImagenes(response.data);
      setNewImagenes([]);
      setImagenesToDelete([]);
    } catch (error) {
      console.error('Error cargando imágenes:', error);
      setEditImagenes([]);
      setNewImagenes([]);
      setImagenesToDelete([]);
    }
  };

  // Manejadores de imágenes
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setNewImagenes(prev => [...prev, { 
          nombre_imagen: '', 
          imagen_data: base64String,
          preview: base64String 
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateImageName = (index, name) => {
    const updatedImagenes = [...newImagenes];
    updatedImagenes[index].nombre_imagen = name;
    setNewImagenes(updatedImagenes);
  };

  const handleRemoveNewImage = (index) => {
    setNewImagenes(newImagenes.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = (imagenId) => {
    setImagenesToDelete(prev => [...prev, imagenId]);
    setEditImagenes(editImagenes.filter(img => img.id !== imagenId));
  };

  const handleEditFormChange = (field, value) => {
    if (field === 'Nombre' || field === 'Primer_apellido') {
      setEditFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      // Campo dinámico
      setEditFormData(prev => ({
        ...prev,
        extra_fields: {
          ...prev.extra_fields,
          [field]: value
        }
      }));
    }
  };

  const saveEdit = async () => {
    if (!personaToEdit) return;
    
    try {
      setLoading(true);
      
      // Preparar datos para enviar
      const dataToSend = {
        Nombre: editFormData.Nombre,
        Primer_apellido: editFormData.Primer_apellido,
        extra_fields: {}
      };
      
      // Procesar campos dinámicos
      const fieldsToCreate = [];
      
      // Añadir campos que tienen valor
      Object.entries(editFormData.extra_fields).forEach(([fieldName, fieldValue]) => {
        if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
          dataToSend.extra_fields[fieldName] = fieldValue;
          
          // Si es un campo nuevo (no existe en availableColumns), marcarlo para crear
          if (!availableColumns.includes(fieldName)) {
            fieldsToCreate.push({
              column_name: fieldName,
              column_type: 'TEXT' // Por defecto TEXT, se puede mejorar con detección automática
            });
          }
        }
      });
      
      // Añadir campos que se eliminaron (establecerlos como null)
      const originalFields = personaToEdit.extra_fields || {};
      Object.keys(originalFields).forEach(fieldName => {
        if (originalFields[fieldName] !== null && originalFields[fieldName] !== undefined && originalFields[fieldName] !== '') {
          // Si el campo existía con valor pero ya no está en el formulario de edición, ponerlo como null
          if (!editFormData.extra_fields.hasOwnProperty(fieldName)) {
            dataToSend.extra_fields[fieldName] = null;
          }
        }
      });
      
      // Crear nuevas columnas si es necesario
      for (const columnData of fieldsToCreate) {
        await api.post('/personas/add-column/', columnData);
      }
      
      // Actualizar la persona
      await api.put(`/personas/${personaToEdit.id}`, dataToSend);
      
      // Procesar solo relaciones nuevas (las existentes ya están en la BD)
      const relacionesNuevas = editRelaciones.filter(rel => !rel.isExisting);
      
      for (const relacion of relacionesNuevas) {
        try {
          let relacionData = {
            tipo_relacion: relacion.tipo_relacion,
            categoria: relacion.categoria || 'familiar'
          };
          
          // Si es una persona existente
          if (relacion.persona_relacionada_id) {
            relacionData.persona_relacionada_id = relacion.persona_relacionada_id;
          }
          // Si hay que crear una nueva persona
          else if (relacion.nueva_persona) {
            relacionData.nombre_nuevo = relacion.nueva_persona.Nombre;
            relacionData.apellido_nuevo = relacion.nueva_persona.Primer_apellido;
          }
          
          await api.post(`/personas/${personaToEdit.id}/relaciones/`, relacionData);
        } catch (error) {
          console.error('Error creando relación nueva:', error);
          throw new Error(`Error creando relación: ${error.message}`);
        }
      }
      
      // Detectar y eliminar relaciones que se han quitado
      const relacionesActualesIds = editRelaciones.filter(rel => rel.isExisting).map(rel => rel.id);
      const relacionesOriginalesIds = originalRelaciones.map(rel => rel.id);
      const relacionesEliminadas = originalRelaciones.filter(rel => !relacionesActualesIds.includes(rel.id));
      
      for (const relacionEliminada of relacionesEliminadas) {
        try {
          await api.delete(`/relaciones/${relacionEliminada.id}`);
        } catch (error) {
          console.error('Error eliminando relación:', error);
          throw new Error(`Error eliminando relación: ${error.message}`);
        }
      }
      
      // Eliminar imágenes marcadas para eliminar
      for (const imagenId of imagenesToDelete) {
        try {
          await api.delete(`/imagenes/${imagenId}`);
        } catch (error) {
          console.error('Error eliminando imagen:', error);
        }
      }
      
      // Subir nuevas imágenes
      for (const imagen of newImagenes) {
        if (imagen.nombre_imagen.trim()) {
          try {
            await api.post(`/personas/${personaToEdit.id}/imagenes/`, {
              nombre_imagen: imagen.nombre_imagen.trim(),
              imagen_data: imagen.imagen_data
            });
          } catch (error) {
            console.error('Error subiendo imagen:', error);
          }
        }
      }
      
      setSuccessMessage(`Persona "${editFormData.Nombre} ${editFormData.Primer_apellido}" actualizada correctamente`);
      
      // Actualizar la lista
      await fetchPersonas();
      await fetchAvailableAtributos();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error("Error updating persona", error);
      if (error.response && error.response.data && error.response.data.detail) {
        setError(`Error: ${error.response.data.detail}`);
      } else {
        setError("Error al actualizar la persona.");
      }
    } finally {
      setLoading(false);
      setShowEditModal(false);
      setPersonaToEdit(null);
      setEditImagenes([]);
      setNewImagenes([]);
      setImagenesToDelete([]);
    }
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setPersonaToEdit(null);
    setEditFormData({
      Nombre: '',
      Primer_apellido: '',
      extra_fields: {}
    });
    setEditRelaciones([]); // Limpiar relaciones
    setOriginalRelaciones([]); // Limpiar relaciones originales
  };

  const addNewField = () => {
    // Cargar personas para relaciones si es necesario
    loadAllPersonasForEdit();
    
    // Resetear el formulario de nuevo campo
    setNewFieldData({
      name: '',
      value: '',
      type: 'TEXT',
      personaRelacionadaId: null,
      nombreNuevo: '',
      apellidoNuevo: ''
    });
    
    setShowAddFieldForm(true);
  };

  // Cargar todas las personas para autocompletado de relaciones
  const loadAllPersonasForEdit = async () => {
    try {
      const response = await api.get('/personas/');
      setAllPersonas(response.data);
    } catch (error) {
      console.error('Error cargando personas:', error);
    }
  };

  // Función para obtener sugerencias de autocompletado en edición
  const getFieldSuggestions = (inputValue) => {
    if (!inputValue || inputValue.length < 1) {
      setFieldSuggestions([]);
      setShowFieldSuggestions(false);
      return;
    }
    
    const currentFields = Object.keys(editFormData.extra_fields);
    
    // Filtrar columnas disponibles
    const filteredColumns = availableColumns
      .filter(column => 
        column.toLowerCase().includes(inputValue.toLowerCase()) && 
        column.toLowerCase() !== inputValue.toLowerCase() &&
        !currentFields.includes(column)
      );
    
    // Filtrar tipos de relaciones
    const relacionesArray = Array.isArray(tiposRelaciones) ? tiposRelaciones : [];
    const filteredRelaciones = relacionesArray
      .filter(relacion => 
        relacion.toLowerCase().includes(inputValue.toLowerCase()) && 
        relacion.toLowerCase() !== inputValue.toLowerCase() &&
        !currentFields.includes(relacion)
      );
    
    // Combinar y limitar sugerencias
    const allSuggestions = [...filteredColumns, ...filteredRelaciones].slice(0, 5);
    
    setFieldSuggestions(allSuggestions);
    setShowFieldSuggestions(allSuggestions.length > 0);
  };

  // Función para sugerir tipo basado en el nombre del atributo
  const getSuggestedTypeForEdit = (attributeName) => {
    const name = attributeName.toLowerCase();
    
    // Verificar si es un tipo de relación existente
    const relacionesArray = Array.isArray(tiposRelaciones) ? tiposRelaciones : [];
    if (relacionesArray.some(tipo => tipo.toLowerCase() === name)) {
      return 'RELACION';
    }
    
    // Sugerencias para relaciones
    if (name.includes('hijo') || name.includes('hija') || name.includes('padre') || 
        name.includes('madre') || name.includes('esposo') || name.includes('esposa') ||
        name.includes('hermano') || name.includes('hermana') || name.includes('primo') ||
        name.includes('prima') || name.includes('tio') || name.includes('tia') ||
        name.includes('abuelo') || name.includes('abuela') || name.includes('nieto') ||
        name.includes('nieta') || name.includes('sobrino') || name.includes('sobrina') ||
        name.includes(' de') || name.includes('pareja') || name.includes('conyuge')) {
      return 'RELACION';
    }
    
    // Sugerencias para fechas
    if (name.includes('fecha') || name.includes('date') || 
        name.includes('nacimiento') || name.includes('ingreso') ||
        name.includes('creacion') || name.includes('actualizacion')) {
      return 'DATE';
    }
    
    // Sugerencias para números enteros
    if (name.includes('edad') || name.includes('ano') || name.includes('year') ||
        name.includes('cantidad') || name.includes('numero') || name.includes('id')) {
      return 'INTEGER';
    }
    
    // Sugerencias para decimales
    if (name.includes('precio') || name.includes('salario') || name.includes('peso') ||
        name.includes('altura') || name.includes('porcentaje') || name.includes('ratio')) {
      return 'REAL';
    }
    
    return 'TEXT';
  };

  // Función para manejar cambios en el nuevo campo
  const handleNewFieldChange = (field, value) => {
    setNewFieldData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Si cambia el nombre, obtener sugerencias y tipo
      if (field === 'name') {
        getFieldSuggestions(value);
        const suggestedType = getSuggestedTypeForEdit(value);
        updated.type = suggestedType;
        
        // Si cambia a relación, cargar personas
        if (suggestedType === 'RELACION') {
          loadAllPersonasForEdit();
        }
      }
      
      // Si cambia el tipo, resetear valores específicos
      if (field === 'type') {
        if (value === 'RELACION') {
          updated.value = '';
          loadAllPersonasForEdit();
        } else {
          updated.personaRelacionadaId = null;
          updated.nombreNuevo = '';
          updated.apellidoNuevo = '';
        }
      }
      
      // Si cambia la categoría, recargar tipos de relaciones
      if (field === 'categoria') {
        fetchTiposRelaciones(value);
      }
      
      return updated;
    });
  };

  // Función para seleccionar una sugerencia
  const selectFieldSuggestion = (suggestion) => {
    setNewFieldData(prev => ({
      ...prev,
      name: suggestion,
      type: getSuggestedTypeForEdit(suggestion)
    }));
    setShowFieldSuggestions(false);
    setFieldSuggestions([]);
  };

  // Función para confirmar la adición del nuevo campo
  const confirmAddField = () => {
    if (!newFieldData.name.trim()) {
      alert('El nombre del campo es requerido');
      return;
    }
    
    // Verificar si ya existe en campos normales o relaciones
    const nombreCampo = newFieldData.name.trim();
    if (editFormData.extra_fields.hasOwnProperty(nombreCampo) || 
        editRelaciones.some(rel => rel.tipo_relacion === nombreCampo)) {
      alert(`El campo "${nombreCampo}" ya está siendo editado.`);
      return;
    }
    
    if (newFieldData.type === 'RELACION') {
      // Manejar relaciones por separado
      let relacionData = {
        tipo_relacion: nombreCampo,
        categoria: newFieldData.categoria || 'familiar',
        persona_relacionada_id: null,
        nueva_persona: null
      };
      
      if (newFieldData.personaRelacionadaId) {
        relacionData.persona_relacionada_id = parseInt(newFieldData.personaRelacionadaId);
        const persona = allPersonas.find(p => p.id === parseInt(newFieldData.personaRelacionadaId));
        relacionData.display_name = persona ? `${persona.Nombre} ${persona.Primer_apellido}` : 'Persona seleccionada';
      } else if (newFieldData.nombreNuevo && newFieldData.apellidoNuevo) {
        relacionData.nueva_persona = {
          Nombre: newFieldData.nombreNuevo,
          Primer_apellido: newFieldData.apellidoNuevo
        };
        relacionData.display_name = `${newFieldData.nombreNuevo} ${newFieldData.apellidoNuevo} (nuevo)`;
      } else {
        alert('Para relaciones, debes seleccionar una persona existente o crear una nueva.');
        return;
      }
      
      // Añadir a las relaciones
      setEditRelaciones(prev => [...prev, relacionData]);
    } else {
      // Manejar campos normales
      setEditFormData(prev => ({
        ...prev,
        extra_fields: {
          ...prev.extra_fields,
          [nombreCampo]: newFieldData.value
        }
      }));
    }
    
    // Guardar datos de relación si es necesario
    if (newFieldData.type === 'RELACION') {
      setEditFormData(prev => ({
        ...prev,
        _relationData: {
          ...prev._relationData,
          [newFieldData.name.trim()]: {
            tipo_relacion: newFieldData.name.trim(),
            persona_relacionada_id: newFieldData.personaRelacionadaId,
            nombre_nuevo: newFieldData.nombreNuevo,
            apellido_nuevo: newFieldData.apellidoNuevo
          }
        }
      }));
    }
    
    // Cerrar formulario
    setShowAddFieldForm(false);
  };

  const cancelAddField = () => {
    setShowAddFieldForm(false);
    setNewFieldData({
      name: '',
      value: '',
      type: 'TEXT',
      personaRelacionadaId: null,
      nombreNuevo: '',
      apellidoNuevo: ''
    });
    setShowFieldSuggestions(false);
    setFieldSuggestions([]);
  };

  const removeField = (fieldName) => {
    setEditFormData(prev => {
      const newExtraFields = { ...prev.extra_fields };
      delete newExtraFields[fieldName];
      return {
        ...prev,
        extra_fields: newExtraFields
      };
    });
  };

  useEffect(() => {
    fetchPersonas();
    fetchAvailableAtributos();
    fetchTiposRelaciones();
  }, []);

  // Efecto para búsqueda automática cuando cambian los filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm || Object.keys(atributoFilters).some(key => atributoFilters[key])) {
        searchPersonas();
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timer);
  }, [searchTerm, atributoFilters]);

  if (loading) {
    return <div className="text-center p-12 text-gray-300 text-lg">⏳ Cargando personas...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-white mb-6">Lista de Personas</h2>
      
      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="bg-green-900/50 border border-green-600 text-green-200 p-4 rounded-xl mb-6 backdrop-blur-sm">
          ✅ {successMessage}
        </div>
      )}
      
      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-900/50 border border-red-600 text-red-200 p-4 rounded-xl mb-6 backdrop-blur-sm">
          ❌ {error}
        </div>
      )}

      {/* Sistema de filtros avanzados */}
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searching={searching}
        availableColumns={availableColumns}
        atributoFilters={atributoFilters}
        setAtributoFilters={setAtributoFilters}
        clearFilters={clearFilters}
        searchPersonas={searchPersonas}
      />

      <div style={{ marginBottom: '20px' }}>
        {personas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            {(searchTerm || Object.keys(atributoFilters).some(key => atributoFilters[key])) ? (
              <div>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔍</div>
                <p style={{ color: '#666', fontSize: '16px', marginBottom: '5px' }}>
                  No se encontraron personas con estos filtros
                </p>
                <p style={{ color: '#999', fontSize: '14px' }}>
                  Intenta ajustar los criterios de búsqueda
                </p>
              </div>
            ) : (
              <div>
                
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                  No hay personas registradas en la base de datos.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '15px', color: '#555' }}>
              {(searchTerm || Object.keys(atributoFilters).some(key => atributoFilters[key])) ? 
                `Resultados de búsqueda: ${personas.length} personas encontradas` : 
                `Total de personas: ${personas.length}`
              }
            </p>
            
            {/* Header de la tabla */}
            <div style={{
              display: 'flex',
              backgroundColor: '#f8f9fa',
              padding: '12px 15px',
              borderRadius: '8px 8px 0 0',
              border: '1px solid #dee2e6',
              fontWeight: 'bold',
              color: '#495057',
              marginBottom: '0'
            }}>
              <div style={{ flex: '0 0 60px', textAlign: 'center' }}>ID</div>
              <div style={{ flex: '1', paddingLeft: '15px' }}>Nombre</div>
              <div style={{ flex: '1', paddingLeft: '15px' }}>Apellido</div>
              <div style={{ flex: '0 0 140px', textAlign: 'center' }}>Acciones</div>
            </div>
            
            {/* Lista de personas */}
            <div style={{
              border: '1px solid #dee2e6',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              overflow: 'hidden'
            }}>
              {personas.map((persona, index) => (
                <PersonaRow
                  key={persona.id}
                  persona={persona}
                  index={index}
                  totalPersonas={personas.length}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onView={handleViewClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={() => {
          clearFilters();
          fetchPersonas();
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 mb-6 shadow-sm hover:shadow-md"
      >
        Recargar Lista Completa
      </button>

      <AddPersonaForm 
        addPersona={addPersona} 
        adding={adding} 
        availableColumns={availableColumns}
      />
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && personaToDelete && (
        <DeleteModal
          persona={personaToDelete}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}
      
      {/* Modal de edición de persona */}
      {showEditModal && personaToEdit && (
        <EditModal
          persona={personaToEdit}
          editFormData={editFormData}
          editRelaciones={editRelaciones}
          showAddFieldForm={showAddFieldForm}
          newFieldData={newFieldData}
          allPersonas={allPersonas}
          fieldSuggestions={fieldSuggestions}
          showFieldSuggestions={showFieldSuggestions}
          tiposRelaciones={tiposRelaciones}
          imagenes={editImagenes}
          newImagenes={newImagenes}
          onClose={cancelEdit}
          onSave={saveEdit}
          onFormChange={handleEditFormChange}
          onRemoveField={removeField}
          onRemoveRelacion={(index) => {
            setEditRelaciones(prev => prev.filter((_, i) => i !== index));
          }}
          onAddNewField={addNewField}
          onToggleAddField={() => setShowAddFieldForm(!showAddFieldForm)}
          onNewFieldChange={handleNewFieldChange}
          onSelectFieldSuggestion={selectFieldSuggestion}
          onConfirmAddField={confirmAddField}
          onCancelAddField={cancelAddField}
          onImageUpload={handleImageUpload}
          onUpdateImageName={handleUpdateImageName}
          onRemoveNewImage={handleRemoveNewImage}
          onDeleteExistingImage={handleDeleteExistingImage}
        />
      )}

      {/* Modal de información de persona */}
      {showPersonaInfo && selectedPersona && (
        <PersonaInfo
          persona={selectedPersona}
          onClose={closePersonaInfo}
        />
      )}
    </div>
  );
};

export default Personas;