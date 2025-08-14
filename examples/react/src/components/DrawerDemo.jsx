import { useState, useEffect } from 'react';
import { useDrawerRefs } from '@uip/adapter-react';
import { createGesturePlugin } from '@uip/plugin-gesture';

function DrawerDemo() {
  // State สำหรับ drag close tracking เหมือน Svelte5
  const [dragCount, setDragCount] = useState(0);
  
  // Create gesture plugin เหมือน Svelte5
  const gesturePlugin = createGesturePlugin({ axis: 'x', threshold: 0.25 });
  
  // ใช้ useDrawerRefs ที่ handle ทุกอย่าง automatically
  const { isOpen, open, close, toggle, contentRef, drawer } = useDrawerRefs({}, [gesturePlugin]);
  
  // Listen to close events to count drag closes
  useEffect(() => {
    if (drawer) {
      const cleanup = drawer.onCloseStart(() => {
        // Count drag closes (assume all closes via gesture for now)
        setDragCount(prev => prev + 1);
      });
      return cleanup;
    }
  }, [drawer]);

  return (
    <div className="runes-demo">
      <h2>Pure React Demo</h2>
      
      {/* Controls เหมือน Svelte5 */}
      <div className="controls">
        <button className="btn" onClick={open}>Open Drawer</button>
        <button className="btn" onClick={toggle}>Toggle</button>
        <button className="btn-outline" onClick={() => setDragCount(0)}>Reset Count</button>
      </div>
      
      {/* Live state เหมือน Svelte5 */}
      <div className="state-panel">
        <p>Status: <span className={`status ${isOpen ? 'open' : ''}`}>
          {isOpen ? 'Open' : 'Closed'}
        </span></p>
        <p>Drag closes: <span className="count">{dragCount}</span></p>
        <p className="note">✨ Universal reactivity - works everywhere!</p>
      </div>

      {/* Drawer Element */}
      <div 
        ref={contentRef}
        className={`drawer ${isOpen ? 'drawer-open' : ''}`}
        aria-hidden={!isOpen}
      >
        <div className="drawer-header">
          <h3>Pure React Drawer</h3>
          <button className="drawer-close" onClick={close}>×</button>
        </div>
        <div className="drawer-body">
          <p><strong>This drawer uses React hooks!</strong></p>
          <ul>
            <li>✅ Universal reactivity (useState, useEffect)</li>
            <li>✅ Works with React patterns</li>
            <li>✅ Lean and powerful</li>
            <li>✅ Gesture + focus trap</li>
          </ul>
          <p>Try dragging from the edge to close!</p>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="drawer-overlay" 
          onClick={close}
          aria-label="Close drawer"
        />
      )}
    </div>
  );
}

export default DrawerDemo;