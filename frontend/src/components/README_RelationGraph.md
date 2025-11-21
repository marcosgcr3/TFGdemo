# RelationGraph.jsx

Este componente permite visualizar los **grafos de relaciones familiares** de manera interactiva usando React Flow. Puedes ver el grafo de una persona concreta o el grafo completo de todas las relaciones del sistema.

---

## ¿Qué hace?
- Muestra nodos para cada persona.
- Muestra aristas (flechas) para cada relación (padre, madre, hijo, etc).
- Permite seleccionar una persona y ver sus relaciones en círculo.
- Permite ver el grafo completo de todas las personas y relaciones.
- Colorea las aristas según el tipo de relación (leyenda incluida).
- Permite limpiar el grafo y volver a empezar.

---

## Estructura del código

- **Hooks principales:**
  - `useState` para personas, nodos, aristas, loading, etc.
  - `useEffect` para cargar datos desde el backend.
  - `useNodesState`, `useEdgesState` de React Flow para gestionar el grafo.

- **Funciones clave:**
  - `buildPersonGraph(personaId)`: Construye el grafo de una persona concreta, colocando sus relaciones en círculo alrededor.
  - `buildCompleteGraph()`: Construye el grafo completo de todas las personas y relaciones, en cuadrícula.
  - `getColorByRelationType(tipo)`: Devuelve el color para cada tipo de relación.
  - `handlePersonaSelect`, `handleShowAll`, `handleClear`: Gestionan la interacción del usuario.

- **Renderizado:**
  - Selector de persona (dropdown)
  - Botón para ver todas las relaciones
  - Botón para limpiar
  - Leyenda de colores
  - Canvas de React Flow con nodos y aristas

---

## Ejemplo de uso

```jsx
import RelationGraph from './components/RelationGraph';

function App() {
  return (
    <div>
      <RelationGraph />
    </div>
  );
}
```

---

## Personalización
- Puedes cambiar los colores en la función `getColorByRelationType`.
- Puedes modificar el layout de los nodos cambiando la lógica de posición.
- Puedes añadir más tipos de relaciones y colores en la leyenda.

---

## Dependencias
- [reactflow](https://reactflow.dev/) (ya incluida en package.json)

---

## Backend necesario
- El backend debe exponer los endpoints:
  - `/personas/` (GET): lista de personas
  - `/personas/{id}/relaciones/` (GET): relaciones de una persona

---

## ¿Cómo funciona internamente?
- Al seleccionar una persona, se consulta el backend y se dibuja el grafo con esa persona en el centro y sus relaciones alrededor.
- Al pulsar "Ver Todas las Relaciones", se consulta el backend para todas las personas y se dibujan todos los nodos y aristas.
- Los colores y flechas ayudan a distinguir el tipo de relación.
- El grafo es interactivo: puedes mover nodos, hacer zoom, ver el minimapa, etc.

---

## Autor
- Código original por el usuario
- Integración y documentación por GitHub Copilot
