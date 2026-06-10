import React, { useState, useEffect, useRef } from 'react';

export default function LuaRunner({ children }) {
  const [code, setCode] = useState(typeof children === 'string' ? children.trim() : '');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('Carregando...');
  const iframeRef = useRef(null);

  // Dentro de LuaRunner.jsx
useEffect(() => {
  const handleMessage = (event) => {
    if (event.data.lang && event.data.lang !== 'lua') return;

    if (event.data.type === 'READY') {
      setStatus('Pronto');
    } else if (event.data.type === 'RESULT') {
      setOutput(event.data.output);
      setStatus('Pronto'); // <--- ISSO DESTRAVA O BOTÃO APÓS SUCESSO
    } else if (event.data.type === 'ERROR') {
      setOutput(`Erro: ${event.data.error}`);
      setStatus('Pronto'); // <--- ISSO DESTRAVA O BOTÃO APÓS UM ERRO
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);

  const handleInit = () => {
    setStatus('Carregando...');
    setOutput('');
    iframeRef.current.contentWindow.postMessage({ type: 'INIT' }, '*');
  };

  const handleExecute = () => {
    setStatus('Rodando...');
    iframeRef.current.contentWindow.postMessage({ type: 'RUN', code }, '*');
  };

  return (
    <div style={{ border: '1px solid #ab47bc', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <strong>🌙 Lua Sandbox (Worker + iframe)</strong>
        <span>Status: <b>{status}</b></span>
      </div>
      <textarea id="lua-code" value={code} onChange={(e) => setCode(e.target.value)} rows={5} style={{ width: '100%', fontFamily: 'monospace' }} />
      <div style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
        <button onClick={handleExecute} disabled={status !== 'Pronto'} style={{ backgroundColor: '#ab47bc', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Rodar Código</button>
        <button onClick={handleInit} style={{ backgroundColor: '#ffc107', border: 'none', padding: '4px 8px', borderRadius: '4px' }}>Reiniciar VM (Stop)</button>
      </div>
      <pre style={{ backgroundColor: '#1e1e1e', color: '#fff', padding: '10px', marginTop: '10px', borderRadius: '4px' }}>{output || '# Sem saídas'}</pre>
      
      <iframe ref={iframeRef} src="/sandbox-lua.html" style={{ display: 'none' }} onLoad={handleInit} />
    </div>
  );
}