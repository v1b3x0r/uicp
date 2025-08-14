import { useDrawerRefs } from '@uikit/react';

function DrawerDemo() {
  const leftDrawer = useDrawerRefs();
  const rightDrawer = useDrawerRefs();
  
  return (
    <div>
      <div className="demo-section">
        <h2>React Drawer Demo - Modern Lean Version</h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button className="btn" onClick={leftDrawer.drawer.open}>
            Open Left Drawer
          </button>
          <button className="btn" onClick={rightDrawer.drawer.open}>
            Open Right Drawer  
          </button>
        </div>
      </div>
      
      <LeftDrawer {...leftDrawer} />
      <RightDrawer {...rightDrawer} />
      
      <div className="demo-section">
        <h2>Features</h2>
        <ul>
          <li>✅ Modern React patterns (hooks, refs)</li>
          <li>✅ Keyboard navigation & focus trap</li> 
          <li>✅ Touch/mouse drag with velocity detection</li>
          <li>✅ ARIA accessibility</li>
          <li>✅ Body scroll lock</li>
          <li>✅ Smooth animations with CSS</li>
        </ul>
      </div>
    </div>
  );
}

const LeftDrawer = ({ drawer, contentRef }) => (
  <>
    <div 
      ref={contentRef}
      className={`drawer drawer--left ${drawer.isOpen ? 'drawer--open' : ''}`}
      aria-hidden={!drawer.isOpen}
    >
      <div className="drawer-header">
        <h2>Left Drawer</h2>
        <button className="drawer-close" onClick={drawer.close} aria-label="Close">×</button>
      </div>
      <div className="drawer-body">
        <p>Modern lean React drawer with gesture support!</p>
        <p>Try dragging to close or use ESC key.</p>
        <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
          <button className="btn btn--secondary">Button 1</button>
          <button className="btn btn--secondary">Button 2</button>
        </div>
        <input 
          type="text" 
          placeholder="Test focus trap" 
          style={{ 
            padding: '0.5rem', 
            width: '100%',
            border: '1px solid #ddd',
            borderRadius: '0.25rem'
          }} 
        />
      </div>
    </div>
    {drawer.isOpen && <div className="drawer-overlay" onClick={drawer.close} />}
  </>
);

const RightDrawer = ({ drawer, contentRef }) => (
  <>
    <div 
      ref={contentRef}
      className={`drawer drawer--right ${drawer.isOpen ? 'drawer--open' : ''}`}
      aria-hidden={!drawer.isOpen}
    >
      <div className="drawer-header">
        <h2>Right Drawer</h2>
        <button className="drawer-close" onClick={drawer.close} aria-label="Close">×</button>
      </div>
      <div className="drawer-body">
        <p>Right-side drawer with modern patterns.</p>
        <p><strong>State:</strong> {drawer.isOpen ? 'Open' : 'Closed'}</p>
        <button className="btn" onClick={drawer.toggle}>Toggle State</button>
      </div>
    </div>
    {drawer.isOpen && <div className="drawer-overlay" onClick={drawer.close} />}
  </>
);

export default DrawerDemo;