import { useState, useRef, useEffect } from 'react';
import { useDrawer } from '@uip/adapter-react';
import { createGesturePlugin } from '@uip/plugin-gesture';
import { createDirectionPlugin } from '@uip/plugin-direction';
import { createSnapPlugin } from '@uip/plugin-snap';

const DIRECTIONS = ['left', 'right', 'top', 'bottom'];
const SNAP_POINTS = ['25%', '50%', '75%', '100%'];

function AdvancedDrawerDemo() {
  // State
  const [direction, setDirection] = useState('right');
  const [snapPoint, setSnapPoint] = useState('50%');
  const [dragCount, setDragCount] = useState(0);
  
  // Create plugins
  const gesturePlugin = createGesturePlugin({ 
    axis: direction === 'left' || direction === 'right' ? 'x' : 'y', 
    threshold: 0.25 
  });
  
  const directionPlugin = createDirectionPlugin({ 
    direction, 
    size: snapPoint 
  });
  
  const snapPlugin = createSnapPlugin({ 
    points: SNAP_POINTS,
    axis: direction === 'left' || direction === 'right' ? 'x' : 'y',
    initialPoint: snapPoint
  });
  
  // Create drawer with all plugins
  const drawer = useDrawer({}, [gesturePlugin, directionPlugin, snapPlugin]);
  
  // Ref สำหรับ drawer content element
  const contentRef = useRef(null);
  
  // Register all plugins เมื่อ mount
  useEffect(() => {
    // Guard: ต้องมีทั้ง element และ drawer instance
    if (!contentRef.current || !drawer.drawer) {
      return;
    }
    
    const cleanups = [
      drawer.drawer.registerContent(contentRef.current),
      gesturePlugin.register(drawer.drawer, contentRef.current),
      directionPlugin.register(drawer.drawer, contentRef.current),
      snapPlugin.register(drawer.drawer, contentRef.current)
    ];
    
    return () => cleanups.forEach(cleanup => cleanup());
  }, [drawer.drawer, gesturePlugin, directionPlugin, snapPlugin]);
  
  // Listen to close events for drag tracking
  useEffect(() => {
    if (drawer.drawer) {
      const cleanup = drawer.drawer.onCloseStart(() => {
        setDragCount(prev => prev + 1);
      });
      return cleanup;
    }
  }, [drawer.drawer]);
  
  // Handle direction change
  const handleDirectionChange = (newDirection) => {
    if (drawer.isOpen) drawer.close();
    setDirection(newDirection);
  };
  
  // Handle snap point change
  const handleSnapChange = (point) => {
    setSnapPoint(point);
    if (drawer.drawer?.setSnapPoint) {
      drawer.drawer.setSnapPoint(point);
    }
  };

  return (
    <div className="advanced-demo">
      <h2>Advanced Plugin Composition Demo</h2>
      
      {/* Direction Controls */}
      <div className="controls-section">
        <h3>Direction</h3>
        <div className="direction-grid">
          {DIRECTIONS.map((dir) => (
            <button
              key={dir}
              className={`btn ${direction === dir ? 'btn-active' : 'btn-outline'}`}
              onClick={() => handleDirectionChange(dir)}
            >
              {dir.charAt(0).toUpperCase() + dir.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Snap Points */}
      <div className="controls-section">
        <h3>Snap Points</h3>
        <div className="snap-grid">
          {SNAP_POINTS.map((point) => (
            <button
              key={point}
              className={`btn-snap ${snapPoint === point ? 'btn-snap-active' : ''}`}
              onClick={() => handleSnapChange(point)}
            >
              {point}
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Controls */}
      <div className="controls">
        <button className="btn" onClick={drawer.open}>
          Open {direction} Drawer
        </button>
        <button className="btn" onClick={drawer.toggle}>Toggle</button>
        <button className="btn-outline" onClick={() => setDragCount(0)}>Reset Count</button>
      </div>
      
      {/* State Display */}
      <div className="state-panel">
        <p>Status: <span className={`status ${drawer.isOpen ? 'open' : ''}`}>
          {drawer.isOpen ? 'Open' : 'Closed'}
        </span></p>
        <p>Direction: <span className="count">{direction}</span></p>
        <p>Snap Point: <span className="count">{snapPoint}</span></p>
        <p>Drag closes: <span className="count">{dragCount}</span></p>
        <p className="note">🔌 Powered by plugin composition!</p>
      </div>

      {/* Drawer Element */}
      <div 
        ref={contentRef}
        className="drawer advanced-drawer"
        aria-hidden={!drawer.isOpen}
      >
        <div className="drawer-header">
          <h3>Advanced Drawer ({direction})</h3>
          <button className="drawer-close" onClick={drawer.close}>×</button>
        </div>
        <div className="drawer-body">
          <p><strong>Plugin Composition Demo</strong></p>
          <ul>
            <li>🎯 Direction Plugin: {direction}</li>
            <li>📏 Snap Plugin: {snapPoint}</li>
            <li>👆 Gesture Plugin: drag to close</li>
            <li>🎪 All working together!</li>
          </ul>
          
          <div className="plugin-info">
            <h4>Active Plugins:</h4>
            <code>@uip/plugin-direction</code><br/>
            <code>@uip/plugin-snap</code><br/>
            <code>@uip/plugin-gesture</code>
          </div>
          
          <p>Try dragging from the edge to close!</p>
        </div>
      </div>
    </div>
  );
}

export default AdvancedDrawerDemo;