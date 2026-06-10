import React, { useState, useEffect, useRef } from 'react';

const LANGUAGE_OPTIONS = [
  { value: 'lua', label: 'Lua', icon: '🌙' },
  { value: 'python', label: 'Python', icon: '🐍' },
];

function getInitialLanguage(language) {
  return LANGUAGE_OPTIONS.some((option) => option.value === language)
    ? language
    : LANGUAGE_OPTIONS[0].value;
}

function getInitialCode(children) {
  return typeof children === 'string' ? children.trim() : '';
}

export default function CodeRunner({ children, language = 'lua' }) {
  const [code, setCode] = useState(getInitialCode(children));
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('Carregando...');
  const [selectedLanguage, setSelectedLanguage] = useState(getInitialLanguage(language));
  const iframeRef = useRef(null);

  useEffect(() => {
    if (typeof children === 'string') {
      setCode(children.trim());
    }
  }, [children]);

  useEffect(() => {
    setSelectedLanguage(getInitialLanguage(language));
  }, [language]);

  useEffect(() => {
    const handleMessage = (event) => {
      const data = event.data || {};

      if (data.lang && data.lang !== selectedLanguage) return;

      if (data.type === 'READY') {
        setStatus('Pronto');
      } else if (data.type === 'RESULT') {
        setOutput(data.output);
        setStatus('Pronto');
      } else if (data.type === 'ERROR') {
        setOutput(`Erro: ${data.error}`);
        setStatus('Pronto');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedLanguage]);

  const handleInit = () => {
    setStatus('Carregando...');
    setOutput('');

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'INIT', lang: selectedLanguage }, '*');
    }
  };

  const handleExecute = () => {
    setStatus('Rodando...');

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'RUN', code, lang: selectedLanguage }, '*');
    }
  };

  const selectedOption = LANGUAGE_OPTIONS.find((option) => option.value === selectedLanguage) || LANGUAGE_OPTIONS[0];

  return (
    <div style={{ border: '1px solid #ab47bc', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <strong>{selectedOption.icon} Code Runner Sandbox</strong>
        <span>Status: <b>{status}</b></span>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label htmlFor="code-runner-language" style={{ fontSize: '0.9rem' }}>Linguagem:</label>
        <select
          id="code-runner-language"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          style={{ border: '1px solid #ab47bc', borderRadius: '4px', padding: '5px 8px', backgroundColor: 'white' }}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        id="code-runner-code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={5}
        style={{ width: '100%', fontFamily: 'monospace' }}
      />

      <div style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
        <button
          onClick={handleExecute}
          disabled={status !== 'Pronto'}
          style={{ backgroundColor: '#ab47bc', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
        >
          Rodar Código
        </button>
        <button
          onClick={handleInit}
          style={{ backgroundColor: '#ffc107', border: 'none', padding: '4px 8px', borderRadius: '4px' }}
        >
          Reiniciar VM (Stop)
        </button>
      </div>

      <pre style={{ backgroundColor: '#1e1e1e', color: '#fff', padding: '10px', marginTop: '10px', borderRadius: '4px' }}>
        {output || '# Sem saídas'}
      </pre>

      <iframe
        ref={iframeRef}
        key={selectedLanguage}
        src="/sandbox-code.html"
        style={{ display: 'none' }}
        onLoad={handleInit}
        title="code-runner-sandbox"
      />
    </div>
  );
}