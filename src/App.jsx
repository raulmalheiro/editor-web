import React from 'react';
import CodeRunner from './components/CodeRunner';

function App() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Playground</h1>
      <p>O runner abaixo executa código em sandbox com Web Worker e iframe.</p>

      <CodeRunner language="python">
      </CodeRunner>
    </div>
  );
}

export default App;