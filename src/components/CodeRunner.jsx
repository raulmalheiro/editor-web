import React, { useMemo, useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { python } from '@codemirror/lang-python';
import { lua } from '@codemirror/legacy-modes/mode/lua';

const DEFAULT_LANGUAGE_OPTIONS = [
  { value: 'lua', label: 'Lua', icon: '🌙', engine: 'lua' },
  { value: 'python', label: 'Python', icon: '🐍', engine: 'python' },
];

function getInitialLanguage(language, languages) {
  return languages.some((option) => option.value === language)
    ? language
    : languages[0]?.value || DEFAULT_LANGUAGE_OPTIONS[0].value;
}

function getInitialCode(children) {
  return typeof children === 'string' ? children.trim() : '';
}

export default function CodeRunner({ children, language = 'lua', languages = DEFAULT_LANGUAGE_OPTIONS }) {
  const [code, setCode] = useState(getInitialCode(children));
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('Carregando...');
  const [selectedLanguage, setSelectedLanguage] = useState(getInitialLanguage(language, languages));
  const iframeRef = useRef(null);

  const normalizedLanguages = languages.length > 0 ? languages : DEFAULT_LANGUAGE_OPTIONS;
  const selectedOption = normalizedLanguages.find((option) => option.value === selectedLanguage) || normalizedLanguages[0];
  const selectedEngine = selectedOption?.engine || 'lua';

  const editorExtensions = useMemo(() => {
    return selectedEngine === 'python'
      ? [python()]
      : [StreamLanguage.define(lua)];
  }, [selectedEngine]);

  useEffect(() => {
    if (typeof children === 'string') {
      setCode(children.trim());
    }
  }, [children]);

  useEffect(() => {
    setSelectedLanguage(getInitialLanguage(language, normalizedLanguages));
  }, [language, normalizedLanguages]);

  useEffect(() => {
    if (!normalizedLanguages.some((option) => option.value === selectedLanguage)) {
      setSelectedLanguage(normalizedLanguages[0]?.value || 'python');
    }
  }, [normalizedLanguages, selectedLanguage]);

  useEffect(() => {
    const handleMessage = (event) => {
      const data = event.data || {};

      if (data.lang && data.lang !== selectedEngine) return;

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
      iframeRef.current.contentWindow.postMessage({ type: 'INIT', lang: selectedEngine }, '*');
    }
  };

  const handleExecute = () => {
    setStatus('Rodando...');

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'RUN', code, lang: selectedEngine }, '*');
    }
  };

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
          {normalizedLanguages.map((option) => (
            <option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ border: '1px solid #ab47bc', borderRadius: '4px', overflow: 'hidden' }}>
        <CodeMirror
          value={code}
          height="140px"
          extensions={editorExtensions}
          onChange={(value) => setCode(value)}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
          }}
        />
      </div>

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