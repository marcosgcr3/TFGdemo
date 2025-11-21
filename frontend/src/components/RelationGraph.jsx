import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import api from '../api';

const RelationGraph = () => {
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [showAllRelations, setShowAllRelations] = useState(false);
  const [relationFilter, setRelationFilter] = useState('all'); // 'all', 'familiar', 'other'
  const [showExtendedNetwork, setShowExtendedNetwork] = useState(false); // mostrar red completa o solo adyacentes
  const [isExpanded, setIsExpanded] = useState(false); // controlar el tamaño del grafo
  const [showPathFinder, setShowPathFinder] = useState(false); // mostrar buscador de caminos
  const [pathStart, setPathStart] = useState(null); // persona inicio del camino
  const [pathEnd, setPathEnd] = useState(null); // persona fin del camino
  const [foundPath, setFoundPath] = useState(null); // camino encontrado

  // Cargar todas las personas
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await api.get('/personas/');
        setPersonas(res.data);
      } catch (error) {
        console.error('Error cargando personas:', error);
      }
    };
    fetchPersonas();
  }, []);

  // Generar color dinámicamente basado en el nombre de la relación
  const getColorByRelationType = (tipo) => {
    // Función hash simple para convertir un string en un número
    const hashString = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir a entero de 32 bits
      }
      return Math.abs(hash);
    };

    // Generar un color HSL basado en el hash del tipo de relación
    const hash = hashString(tipo);
    const hue = hash % 360; // Tono entre 0-360
    const saturation = 65 + (hash % 20); // Saturación entre 65-85%
    const lightness = 50 + (hash % 15); // Luminosidad entre 50-65%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Encontrar camino entre dos personas usando BFS
  const findPath = async (startId, endId) => {
    if (!startId || !endId || startId === endId) {
      return null;
    }

    setLoading(true);
    try {
      // Construir un grafo de adyacencia
      const adjacencyMap = new Map();
      const personaDetails = new Map();
      
      // Obtener todas las personas primero
      const allPersonas = await api.get('/personas/');
      allPersonas.data.forEach(p => {
        personaDetails.set(p.id, p);
        adjacencyMap.set(p.id, []);
      });

      // Obtener todas las relaciones
      for (const persona of allPersonas.data) {
        try {
          const res = await api.get(`/personas/${persona.id}/relaciones/`);
          const relaciones = res.data;
          
          relaciones.forEach(rel => {
            const relacionadaId = rel.persona_relacionada.id;
            adjacencyMap.get(persona.id).push({
              id: relacionadaId,
              tipo: rel.tipo_relacion,
              categoria: rel.categoria
            });
          });
        } catch (error) {
          console.error(`Error cargando relaciones de ${persona.id}:`, error);
        }
      }

      // BFS para encontrar el camino más corto
      const queue = [[startId]];
      const visited = new Set([startId]);

      while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];

        if (current === endId) {
          // Camino encontrado, construir el grafo visual
          const pathNodes = [];
          const pathEdges = [];

          path.forEach((personaId, index) => {
            const persona = personaDetails.get(personaId);
            const isStart = index === 0;
            const isEnd = index === path.length - 1;

            pathNodes.push({
              id: `${personaId}`,
              data: { 
                label: `${persona.Nombre} ${persona.Primer_apellido}`,
              },
              position: { x: 200 + (index * 300), y: 300 },
              style: {
                background: isStart || isEnd ? '#10b981' : '#334155',
                color: '#fff',
                border: isStart || isEnd ? '3px solid #059669' : '2px solid #64748b',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
              },
            });

            if (index < path.length - 1) {
              const nextPersonaId = path[index + 1];
              // Encontrar el tipo de relación
              const relation = adjacencyMap.get(personaId).find(r => r.id === nextPersonaId);
              
              pathEdges.push({
                id: `e${personaId}-${nextPersonaId}`,
                source: `${personaId}`,
                target: `${nextPersonaId}`,
                label: relation ? relation.tipo : 'Relacionado',
                categoria: relation ? relation.categoria : 'familiar',
                animated: true,
                style: { 
                  stroke: '#10b981',
                  strokeWidth: 3,
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#10b981',
                },
                labelStyle: {
                  fill: '#10b981',
                  fontWeight: 700,
                  fontSize: 14,
                },
              });
            }
          });

          setFoundPath({ nodes: pathNodes, edges: pathEdges, path });
          setNodes(pathNodes);
          setEdges(pathEdges);
          setLoading(false);
          return path;
        }

        const neighbors = adjacencyMap.get(current) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor.id)) {
            visited.add(neighbor.id);
            queue.push([...path, neighbor.id]);
          }
        }
      }

      setLoading(false);
      setFoundPath(null);
      alert('No se encontró conexión entre estas dos personas');
      return null;
    } catch (error) {
      console.error('Error buscando camino:', error);
      setLoading(false);
      return null;
    }
  };

  // Filtrar edges y nodos según el tipo de relación seleccionado
  const filterGraphByType = (nodes, edges) => {
    // Si no hay filtro, devolver todo
    if (relationFilter === 'all') return { filteredNodes: nodes, filteredEdges: edges };
    
    // Filtrar edges según la categoría
    let filteredEdges = edges;
    if (relationFilter === 'familiar') {
      filteredEdges = edges.filter(edge => edge.categoria === 'familiar');
    } else if (relationFilter === 'other') {
      filteredEdges = edges.filter(edge => edge.categoria !== 'familiar');
    }
    
    // Obtener los IDs de nodos que están conectados en los edges filtrados
    const connectedNodeIds = new Set();
    filteredEdges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    
    // Filtrar nodos para mostrar solo los que están conectados
    const filteredNodes = nodes.filter(node => connectedNodeIds.has(node.id));
    
    return { filteredNodes, filteredEdges };
  };

  // Construir grafo de una persona específica
  const buildPersonGraph = async (personaId) => {
    setLoading(true);
    try {
      // Nodo central (persona seleccionada)
      const persona = personas.find(p => p.id === personaId);
      const newNodes = [{
        id: `${personaId}`,
        data: { 
          label: `${persona.Nombre} ${persona.Primer_apellido}`,
        },
        position: { x: 400, y: 300 },
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '14px',
          fontWeight: 'bold',
        },
      }];

      const newEdges = [];
      const processedPersonas = new Set([personaId]);
      const nodesToProcess = [{ id: personaId, level: 0 }];
      const nodesByLevel = {}; // Para contar nodos por nivel

      // Si showExtendedNetwork es true, procesamos múltiples niveles
      const maxLevels = showExtendedNetwork ? 10 : 1; // 10 niveles o hasta que no haya más
      let currentLevel = 0;

      while (nodesToProcess.length > 0 && currentLevel < maxLevels) {
        const { id: currentPersonaId, level } = nodesToProcess.shift();
        currentLevel = level;
        
        try {
          const res = await api.get(`/personas/${currentPersonaId}/relaciones/`);
          const relaciones = res.data;

          relaciones.forEach((rel, relIndex) => {
            const relacionadaId = rel.persona_relacionada.id;
            
            // Agregar el nodo si no existe
            if (!processedPersonas.has(relacionadaId)) {
              processedPersonas.add(relacionadaId);
              
              // Inicializar contador de nodos por nivel
              const nextLevel = level + 1;
              if (!nodesByLevel[nextLevel]) {
                nodesByLevel[nextLevel] = 0;
              }
              
              // Posición en círculos concéntricos con crecimiento logarítmico
              // Esto hace que los niveles más alejados no crezcan tan rápido
              const baseRadius = 180;
              const radius = baseRadius + (Math.log(nextLevel + 1) * 120); // Crecimiento logarítmico
              
              // Distribuir los nodos uniformemente en el círculo
              const nodesInLevel = nodesByLevel[nextLevel];
              const angle = (2 * Math.PI * nodesInLevel) / Math.max(relaciones.length, 1) + (nextLevel * 0.3);
              
              const x = 400 + radius * Math.cos(angle);
              const y = 300 + radius * Math.sin(angle);
              
              nodesByLevel[nextLevel]++;

              newNodes.push({
                id: `${relacionadaId}`,
                data: { 
                  label: `${rel.persona_relacionada.Nombre} ${rel.persona_relacionada.Primer_apellido}`,
                },
                position: { x, y },
                style: {
                  background: nextLevel === 1 ? '#334155' : '#475569',
                  color: '#fff',
                  border: '1px solid #64748b',
                  borderRadius: '8px',
                  padding: '8px',
                  fontSize: nextLevel === 1 ? '12px' : '10px',
                },
              });

              // Si estamos en modo extendido, agregar a la cola para procesar sus relaciones
              if (showExtendedNetwork) {
                nodesToProcess.push({ id: relacionadaId, level: nextLevel });
              }
            }

            // Agregar edge si no existe
            const edgeId = `e${currentPersonaId}-${relacionadaId}`;
            const reverseEdgeId = `e${relacionadaId}-${currentPersonaId}`;
            
            if (!newEdges.find(e => e.id === edgeId || e.id === reverseEdgeId)) {
              newEdges.push({
                id: edgeId,
                source: `${currentPersonaId}`,
                target: `${relacionadaId}`,
                label: rel.tipo_relacion,
                categoria: rel.categoria,
                animated: level === 0,
                style: { 
                  stroke: getColorByRelationType(rel.tipo_relacion),
                  strokeWidth: level === 0 ? 2 : 1.5,
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: getColorByRelationType(rel.tipo_relacion),
                },
                labelStyle: {
                  fill: getColorByRelationType(rel.tipo_relacion),
                  fontWeight: level === 0 ? 600 : 400,
                  fontSize: level === 0 ? 12 : 10,
                },
              });
            }
          });
        } catch (error) {
          console.error(`Error cargando relaciones de ${currentPersonaId}:`, error);
        }
        
        // Si no estamos en modo extendido, solo procesamos el primer nivel
        if (!showExtendedNetwork && level === 0) break;
      }

      const { filteredNodes, filteredEdges } = filterGraphByType(newNodes, newEdges);
      setNodes(filteredNodes);
      setEdges(filteredEdges);
    } catch (error) {
      console.error('Error construyendo grafo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Construir grafo completo de todas las relaciones
  const buildCompleteGraph = async () => {
    setLoading(true);
    try {
      const res = await api.get('/personas/');
      const allPersonas = res.data;

      const newNodes = [];
      const newEdges = [];
      const processedRelations = new Set();

      // Crear nodos para todas las personas
      allPersonas.forEach((persona, index) => {
        // Disposición en cuadrícula
        const cols = Math.ceil(Math.sqrt(allPersonas.length));
        const x = (index % cols) * 250 + 100;
        const y = Math.floor(index / cols) * 150 + 100;

        newNodes.push({
          id: `${persona.id}`,
          data: { 
            label: `${persona.Nombre} ${persona.Primer_apellido}`,
          },
          position: { x, y },
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #475569',
            borderRadius: '8px',
            padding: '8px',
            fontSize: '11px',
          },
        });
      });

      // Obtener todas las relaciones
      for (const persona of allPersonas) {
        try {
          const res = await api.get(`/personas/${persona.id}/relaciones/`);
          const relaciones = res.data;

          relaciones.forEach(rel => {
            const edgeId = `e${persona.id}-${rel.persona_relacionada.id}`;
            const reverseEdgeId = `e${rel.persona_relacionada.id}-${persona.id}`;

            // Evitar relaciones duplicadas
            if (!processedRelations.has(edgeId) && !processedRelations.has(reverseEdgeId)) {
              newEdges.push({
                id: edgeId,
                source: `${persona.id}`,
                target: `${rel.persona_relacionada.id}`,
                label: rel.tipo_relacion,
                categoria: rel.categoria,
                style: { 
                  stroke: getColorByRelationType(rel.tipo_relacion),
                  strokeWidth: 1.5,
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: getColorByRelationType(rel.tipo_relacion),
                },
                labelStyle: {
                  fill: getColorByRelationType(rel.tipo_relacion),
                  fontSize: 10,
                },
              });
              processedRelations.add(edgeId);
            }
          });
        } catch (error) {
          console.error(`Error cargando relaciones de ${persona.id}:`, error);
        }
      }

      const { filteredNodes, filteredEdges } = filterGraphByType(newNodes, newEdges);
      setNodes(filteredNodes);
      setEdges(filteredEdges);
    } catch (error) {
      console.error('Error construyendo grafo completo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaSelect = (e) => {
    const personaId = parseInt(e.target.value);
    setSelectedPersona(personaId);
    if (personaId) {
      buildPersonGraph(personaId);
    }
  };

  const handleShowAll = () => {
    setShowAllRelations(true);
    setSelectedPersona(null);
    buildCompleteGraph();
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setSelectedPersona(null);
    setShowAllRelations(false);
    setFoundPath(null);
    setPathStart(null);
    setPathEnd(null);
  };

  const handleFindPath = () => {
    if (pathStart && pathEnd) {
      findPath(pathStart, pathEnd);
    }
  };

  const handleShowPathFinder = () => {
    setShowPathFinder(true);
    setSelectedPersona(null);
    setShowAllRelations(false);
    setNodes([]);
    setEdges([]);
    setFoundPath(null);
  };

  // Efecto para recargar el grafo cuando cambie el filtro o el modo de visualización
  useEffect(() => {
    if (selectedPersona) {
      buildPersonGraph(selectedPersona);
    } else if (showAllRelations) {
      buildCompleteGraph();
    }
  }, [relationFilter, showExtendedNetwork]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-4">Grafo de Relaciones</h2>
        
        <div className="flex gap-4 mb-4 flex-wrap">
          {/* Selector de persona */}
          <select
            value={selectedPersona || ''}
            onChange={handlePersonaSelect}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
          >
            <option value="">Selecciona una persona...</option>
            {personas.map(p => (
              <option key={p.id} value={p.id}>
                {p.Nombre} {p.Primer_apellido}
              </option>
            ))}
          </select>

          {/* Botón ver todas las relaciones */}
          <button
            onClick={handleShowAll}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Ver Todas las Relaciones
          </button>

          {/* Botón limpiar */}
          <button
            onClick={handleClear}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Limpiar
          </button>

          {/* Botón buscador de caminos */}
          <button
            onClick={handleShowPathFinder}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Buscar Conexión
          </button>

          {/* Botón expandir/contraer */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            {isExpanded ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Contraer
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Expandir
              </>
            )}
          </button>
        </div>

        {/* Buscador de caminos entre personas */}
        {showPathFinder && (
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-4">
            <h3 className="text-white font-semibold mb-3">Buscar conexión entre dos personas:</h3>
            <div className="flex gap-4 flex-wrap items-end">
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Persona inicial:</label>
                <select
                  value={pathStart || ''}
                  onChange={(e) => setPathStart(parseInt(e.target.value))}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Selecciona...</option>
                  {personas.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.Nombre} {p.Primer_apellido}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Persona final:</label>
                <select
                  value={pathEnd || ''}
                  onChange={(e) => setPathEnd(parseInt(e.target.value))}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Selecciona...</option>
                  {personas.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.Nombre} {p.Primer_apellido}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleFindPath}
                disabled={!pathStart || !pathEnd}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  pathStart && pathEnd
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-slate-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Buscar Camino
              </button>
            </div>
            
            {foundPath && (
              <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                <p className="text-green-300 font-semibold">
                  ✓ Camino encontrado: {foundPath.path.length} persona(s) en el camino
                </p>
                <p className="text-green-200 text-sm mt-1">
                  {foundPath.path.map((id, idx) => {
                    const persona = personas.find(p => p.id === id);
                    return persona ? `${persona.Nombre} ${persona.Primer_apellido}` : id;
                  }).join(' → ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modo de visualización (solo visible cuando hay una persona seleccionada) */}
        {selectedPersona && (
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-4">
            <h3 className="text-white font-semibold mb-3">Modo de visualización:</h3>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowExtendedNetwork(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !showExtendedNetwork
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Solo Adyacentes
              </button>
              <button
                onClick={() => setShowExtendedNetwork(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showExtendedNetwork
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Red Completa
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {!showExtendedNetwork 
                ? 'Mostrando solo las relaciones directas de la persona seleccionada' 
                : 'Mostrando toda la red de relaciones (parientes de parientes)'}
            </p>
          </div>
        )}

        {/* Filtro de tipo de relación */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-4">
          <h3 className="text-white font-semibold mb-3">Filtrar por tipo:</h3>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setRelationFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                relationFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Todas las relaciones
            </button>
            <button
              onClick={() => setRelationFilter('familiar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                relationFilter === 'familiar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Solo Familiares
            </button>
            <button
              onClick={() => setRelationFilter('other')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                relationFilter === 'other'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Solo Otras
            </button>
          </div>
        </div>

        {/* Leyenda */}
        {edges.length > 0 && (
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h3 className="text-white font-semibold mb-2">Tipos de relaciones visibles:</h3>
            <div className="flex gap-4 flex-wrap text-sm">
              {[...new Set(edges.map(edge => edge.label))].sort().map(tipo => (
                <div key={tipo} className="flex items-center gap-2">
                  <div className="w-4 h-1" style={{ background: getColorByRelationType(tipo) }}></div>
                  <span className="text-gray-300">{tipo}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Canvas del grafo */}
      <div 
        className={`bg-slate-900 rounded-lg border border-slate-700 transition-all duration-300 relative ${
          isExpanded ? 'fixed inset-4 z-50' : ''
        }`} 
        style={{ height: isExpanded ? 'calc(100vh - 2rem)' : '600px' }}
      >
        {/* Botón de cerrar en modo expandido */}
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors shadow-lg"
            title="Cerrar vista expandida"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-lg">Cargando grafo...</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-lg">Selecciona una persona o muestra todas las relaciones</p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#334155" gap={16} />
            <Controls />
            <MiniMap 
              nodeColor="#475569"
              maskColor="rgba(0, 0, 0, 0.6)"
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
};

export default RelationGraph;
