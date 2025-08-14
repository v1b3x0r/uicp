import React from 'react';
import DrawerDemo from './components/DrawerDemo';

function App() {
  return (
    <div className="container">
      <h1>UIKit React Example</h1>
      <DrawerDemo />
      
      <div className="demo-content">
        <h2>Scrollable Content</h2>
        <p>Try opening a drawer and notice that the body scroll is locked.</p>
        <p>The drawer can be closed by:</p>
        <ul>
          <li>Clicking the close button</li>
          <li>Pressing ESC key</li>
          <li>Clicking the overlay</li>
          <li>Dragging/swiping (on touch devices)</li>
        </ul>
        <br />
        <p>This is a longer content area to demonstrate scroll locking behavior...</p>
      </div>
    </div>
  );
}

export default App;