import React, { useState } from 'react';
import DrawerDemo from './components/DrawerDemo';
import AdvancedDrawerDemo from './components/AdvancedDrawerDemo';
import './App.css';

function App() {
  const [activeDemo, setActiveDemo] = useState('basic');

  return (
    <div className="app">
      <div className="demo-switcher">
        <button 
          className={activeDemo === 'basic' ? 'active' : ''}
          onClick={() => setActiveDemo('basic')}
        >
          Basic Demo
        </button>
        <button 
          className={activeDemo === 'advanced' ? 'active' : ''}
          onClick={() => setActiveDemo('advanced')}
        >
          Advanced Demo
        </button>
      </div>
      
      {activeDemo === 'basic' ? <DrawerDemo /> : <AdvancedDrawerDemo />}
    </div>
  );
}

export default App;