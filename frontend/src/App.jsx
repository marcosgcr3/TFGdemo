import React, { useState } from 'react';
import './App.css';

import Personas from './components/Personas';
import ChatBot from './components/ChatBot';
import RelationGraph from './components/RelationGraph';


const App = () => {
  const [currentView, setCurrentView] = useState('personas'); // 'personas' o 'graph'

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Chatbot GRATUITO con IA (Ollama) */}
      <ChatBot />
      
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 py-8 px-6 text-center shadow-xl">
        <h1 className="text-6xl font-bold text-white mb-4 animate-fade-in">PICUVIMO</h1>
        
        <div className="flex gap-4 justify-center items-center flex-wrap">
          {/* Navegación */}
          <div className="flex gap-2 bg-gray-700/50 rounded-xl p-1">
            <button
              onClick={() => setCurrentView('personas')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                currentView === 'personas'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Lista de Personas
            </button>
            <button
              onClick={() => setCurrentView('graph')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                currentView === 'graph'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Grafo de Relaciones
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-fade-in">
          {currentView === 'personas' ? <Personas /> : <RelationGraph />}
        </div>
      </main>
    </div>
  );
};

export default App;