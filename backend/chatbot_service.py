"""
Servicio de Chatbot GRATUITO con IA para PICUVIMO usando Ollama
Permite consultas en lenguaje natural sobre la base de datos

"""
import sqlite3
import json
from typing import Dict, List, Any, Optional
import ollama
from pathlib import Path

class ChatbotService:
    def __init__(self, db_path: str, model_name: str = "llama3.2"):
        """
        Inicializa el servicio de chatbot con Ollama (GRATUITO)
        
        Args:
            db_path: Ruta a la base de datos SQLite
            model_name: Modelo de Ollama a usar 
        """
        self.db_path = db_path
        self.model_name = model_name
        self.schema = self._get_database_schema()
        
        # Verificar que Ollama está disponible
        try:
            ollama.list()
        except Exception as e:
            raise Exception(
                f"Ollama no esta disponible"
                f"Por favor instala Ollama desde: https://ollama.com\n"
                f"Luego ejecuta: ollama pull {model_name}\n"
                f"Error: {str(e)}"
            )
    
    def _get_database_schema(self) -> str:
        """Obtiene el esquema de la base de datos para contexto del modelo"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener todas las tablas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        schema_info = []
        for (table_name,) in tables:
            # Obtener estructura de cada tabla
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            
            column_info = []
            for col in columns:
                col_id, col_name, col_type, not_null, default_val, pk = col
                column_info.append(f"  - {col_name} ({col_type})")
            
            schema_info.append(f"Tabla: {table_name}\n" + "\n".join(column_info))
        
        conn.close()
        return "\n\n".join(schema_info)
    
    def _execute_query(self, query: str) -> List[Dict[str, Any]]:
        """
        Ejecuta una consulta SQL y devuelve los resultados
        
        Args:
            query: Consulta SQL a ejecutar
            
        Returns:
            Lista de diccionarios con los resultados
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            cursor.execute(query)
            results = [dict(row) for row in cursor.fetchall()]
            conn.close()
            return results
        except Exception as e:
            conn.close()
            raise Exception(f"Error ejecutando consulta: {str(e)}")
    
    def _generate_sql_query(self, user_question: str) -> str:
        """
        Usa Ollama para generar una consulta SQL
        
        Args:
            user_question: Pregunta del usuario en lenguaje natural
            
        Returns:
            Consulta SQL generada
        """
        prompt = f"""Eres un experto en SQL para una base de datos genealógica llamada PICUVIMO.

ESQUEMA DE LA BASE DE DATOS:
{self.schema}

REGLAS IMPORTANTES:
1. Solo genera consultas SELECT (lectura). NUNCA INSERT, UPDATE, DELETE, DROP, etc.
2. La consulta debe ser válida para SQLite
3. IMPORTANTE: Los nombres de columnas son con mayúsculas: Nombre, Primer_apellido
4. Usa LIKE con '%' para búsquedas parciales (case-insensitive en SQLite)
5. Para buscar nombres completos: WHERE Nombre || ' ' || Primer_apellido LIKE '%búsqueda%'
6. La tabla RelacionPersona tiene: persona_id, persona_relacionada_id, tipo_relacion
7. Para contar personas: SELECT COUNT(*) as total FROM Persona
8. Para relaciones: JOIN RelacionPersona ON Persona.id = RelacionPersona.persona_id
9. Devuelve SOLO la consulta SQL, sin explicaciones, sin markdown, sin ```sql

EJEMPLOS:
Pregunta: "¿Cuántas personas hay?"
SQL: SELECT COUNT(*) as total FROM Persona

Pregunta: "¿Cuántos Marcos hay?"
SQL: SELECT COUNT(*) as total FROM Persona WHERE Nombre LIKE '%Marcos%'

Pregunta: "Lista todas las personas"
SQL: SELECT Nombre, Primer_apellido FROM Persona LIMIT 50

Pregunta: "¿Qué relaciones tiene Juan García?"
SQL: SELECT p2.Nombre, p2.Primer_apellido, r.tipo_relacion FROM Persona p1 JOIN RelacionPersona r ON p1.id = r.persona_id JOIN Persona p2 ON p2.id = r.persona_relacionada_id WHERE p1.Nombre LIKE '%Juan%' AND p1.Primer_apellido LIKE '%García%'

PREGUNTA DEL USUARIO: {user_question}

SQL:"""

        try:
            response = ollama.generate(
                model=self.model_name,
                prompt=prompt,
                options={
                    "temperature": 0.1,  # Más determinista para SQL
                    "num_predict": 200   # Limitar longitud
                }
            )
            
            sql_query = response['response'].strip()
            
            # Limpio posibles marcadores de código
            sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
            
            # Tomar solo la primera línea si hay múltiples
            if '\n' in sql_query:
                sql_query = sql_query.split('\n')[0].strip()
            
            return sql_query
        except Exception as e:
            raise Exception(f"Error generando SQL con Ollama: {str(e)}")
    
    def _format_response(self, user_question: str, sql_query: str, results: List[Dict[str, Any]]) -> str:
        """
        Usa Ollama para generar una respuesta en lenguaje natural
        
        Args:
            user_question: Pregunta original del usuario
            sql_query: Consulta SQL ejecutada
            results: Resultados de la consulta
            
        Returns:
            Respuesta formateada en lenguaje natural
        """
        results_text = json.dumps(results[:10], ensure_ascii=False, indent=2)  # Primeros 10
        
        prompt = f"""Eres un asistente amigable para una base de datos llamada PICUVIMO.

Tu trabajo es explicar los resultados SQL de forma clara y natural.

REGLAS IMPORTANTES:
1. Si el resultado tiene "total" con un número, di claramente: "Hay X personas" o "Encontré X resultados"
2. NO digas cosas como "no proporciona un valor específico" si hay un número
3. Si hay una lista de nombres, muéstralos de forma ordenada
4. Usa emojis apropiados: 👤 para personas, 👨‍👩‍👧‍👦 para familias, 🔗 para relaciones
5. Sé directo y específico con los números

EJEMPLOS:
Pregunta: "¿Cuántas personas hay?"
Resultados: [{{"total": 45}}]
Respuesta: Hay 45 personas en la base de datos 👤

Pregunta: "¿Cuántos Marcos hay?"
Resultados: [{{"total": 2}}]
Respuesta: Hay 2 personas llamadas Marcos 👤

Pregunta: "Lista todas las personas"
Resultados: [{{"Nombre": "Juan", "Primer_apellido": "García"}}, {{"Nombre": "María", "Primer_apellido": "López"}}]
Respuesta: Aquí están las personas:
• Juan García
• María López

AHORA TU TURNO:
Pregunta: {user_question}

Resultados de la consulta SQL:
{results_text}

Tu respuesta (clara, directa, con el número específico):"""

        try:
            response = ollama.generate(
                model=self.model_name,
                prompt=prompt,
                options={
                    "temperature": 0.7,
                    "num_predict": 500
                }
            )
            
            return response['response'].strip()
        except Exception as e:
            # Si falla, devolver respuesta simple
            if not results:
                return "No encontré información sobre eso en la base de datos."
            elif len(results) == 1 and 'total' in results[0]:
                return f"Encontré {results[0]['total']} resultados."
            else:
                return f"Encontré {len(results)} resultados."
    
    def process_query(self, user_question: str) -> Dict[str, Any]:
        """
        Procesa una pregunta del usuario y devuelve la respuesta
        
        Args:
            user_question: Pregunta en lenguaje natural
            
        Returns:
            Diccionario con la respuesta y metadatos
        """
        try:
            # Paso 1: Generar consulta SQL
            sql_query = self._generate_sql_query(user_question)
            
            # Validar que sea SELECT (seguridad)
            if not sql_query.strip().upper().startswith('SELECT'):
                return {
                    "success": False,
                    "error": "Solo se permiten consultas de lectura (SELECT)",
                    "response": "⚠️ Por seguridad, solo puedo responder consultas de lectura sobre la base de datos."
                }
            
            # Paso 2: Ejecutar consulta
            results = self._execute_query(sql_query)
            
            # Paso 3: Formatear respuesta
            response = self._format_response(user_question, sql_query, results)
            
            return {
                "success": True,
                "response": response,
                "sql_query": sql_query,
                "results_count": len(results),
                "raw_results": results[:10]  # Primeros 10 para debug
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "response": f"❌ Lo siento, ocurrió un error al procesar tu consulta: {str(e)}"
            }


# Singleton para reutilizar la instancia
_chatbot_instance = None

def get_chatbot_service(db_path: str = "../data/PICUVIMO.db", model_name: str = "llama3.2") -> ChatbotService:
    """
    Obtiene la instancia singleton del servicio de chatbot
    
    Args:
        db_path: Ruta a la base de datos
        model_name: Modelo de Ollama a usar
        
    Returns:
        Instancia de ChatbotService
    """
    global _chatbot_instance
    if _chatbot_instance is None:
        _chatbot_instance = ChatbotService(db_path, model_name)
    return _chatbot_instance
