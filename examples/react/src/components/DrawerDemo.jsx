import React, { useRef, useCallback } from 'react';
import { useDrawer, useDrawerTrigger, useDrawerContent, useDrawerDrag } from '@uikit/react';

function DrawerDemo() {
  const leftDrawer = useDrawer();
  const rightDrawer = useDrawer();
  
  return (
    <div>
      <div className="demo-section">
        <h2>Basic Drawers</h2>
        <div style={{ marginBottom: '1rem' }}>
          <LeftDrawer drawer={leftDrawer} />
          <RightDrawer drawer={rightDrawer} />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" onClick={leftDrawer.open}>
            Open Left Drawer
          </button>
          <button className="btn" onClick={rightDrawer.open}>
            Open Right Drawer
          </button>
        </div>
      </div>
      
      <div className="demo-section">
        <h2>Features</h2>
        <ul>
          <li>✅ React hooks integration</li>
          <li>✅ Keyboard navigation (Tab, Shift+Tab, ESC)</li>
          <li>✅ Focus trap when open</li>
          <li>✅ Body scroll lock</li>
          <li>✅ Touch/mouse drag support</li>
          <li>✅ ARIA attributes</li>
          <li>✅ Smooth animations</li>
          <li>✅ State management</li>
        </ul>
      </div>
    </div>
  );
}

function LeftDrawer({ drawer }) {
  const triggerRef = useDrawerTrigger(drawer);
  const contentRef = useDrawerContent(drawer);
  const dragRef = useDrawerDrag(drawer, { axis: 'x', threshold: 0.3 });
  
  const setRefs = useCallback((el) => {
    contentRef.current = el;
    dragRef.current = el;
  }, [contentRef, dragRef]);
  
  return (
    <>
      <div 
        ref={setRefs}
        className={`drawer drawer--left ${drawer.isOpen ? 'drawer--open' : ''}`}
        aria-hidden={!drawer.isOpen}
      >
        <div className="drawer-header">
          <h2>Left Drawer</h2>
          <button 
            className="drawer-close" 
            onClick={drawer.close}
            aria-label="Close drawer"
          >
            ×
          </button>
        </div>
        <div className="drawer-body">
          <p>This is a React drawer component with gesture support!</p>
          <p>Try dragging it to close.</p>
          <br />
          <button className="btn btn--secondary">Focusable Button 1</button>
          <button className="btn btn--secondary">Focusable Button 2</button>
          <br /><br />
          <input 
            type="text" 
            placeholder="Test input" 
            style={{ 
              padding: '0.5rem', 
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem'
            }} 
          />
        </div>
      </div>
      
      {drawer.isOpen && (
        <div className="drawer-overlay" onClick={drawer.close} />
      )}
    </>
  );
}

function RightDrawer({ drawer }) {
  const triggerRef = useDrawerTrigger(drawer);
  const contentRef = useDrawerContent(drawer);
  const dragRef = useDrawerDrag(drawer, { axis: 'x', threshold: 0.3 });
  
  const setRefs = useCallback((el) => {
    contentRef.current = el;
    dragRef.current = el;
  }, [contentRef, dragRef]);
  
  return (
    <>
      <div 
        ref={setRefs}
        className={`drawer drawer--right ${drawer.isOpen ? 'drawer--open' : ''}`}
        aria-hidden={!drawer.isOpen}
      >
        <div className="drawer-header">
          <h2>Right Drawer</h2>
          <button 
            className="drawer-close" 
            onClick={drawer.close}
            aria-label="Close drawer"
          >
            ×
          </button>
        </div>
        <div className="drawer-body">
          <p>This is a right-side drawer.</p>
          <p>It also supports all the same features!</p>
          <br />
          <div>
            <p><strong>Current state:</strong> {drawer.isOpen ? 'Open' : 'Closed'}</p>
          </div>
        </div>
      </div>
      
      {drawer.isOpen && (
        <div className="drawer-overlay" onClick={drawer.close} />
      )}
    </>
  );
}

export default DrawerDemo;