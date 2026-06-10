import React, { useState } from 'react';
import CodeRunner from './components/CodeRunner';

const INITIAL_LANGUAGES = [
  { value: 'python', label: 'Python', icon: '🐍', engine: 'python' },
  { value: 'lua', label: 'Lua', icon: '🌙', engine: 'lua' },
];

const ENGINE_OPTIONS = [
  { value: 'python', label: 'Python' },
  { value: 'lua', label: 'Lua' },
];

const INITIAL_PYTHON_CODE = `import warnings
warnings.simplefilter(action='ignore', category=DeprecationWarning)

import pandas as pd
# Importamos a ferramenta de rede oficial do Pyodide para navegadores
from pyodide.http import open_url

# 1. URL da planilha/CSV online
url = "https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv"

# 2. Em vez de passar a string da URL direto, passamos o open_url(url)
# Isso faz o Pyodide baixar o arquivo usando o navegador antes de entregar ao Pandas
df = pd.read_csv(open_url(url))

print("--- Pandas leu os dados com sucesso via HTTPS! ---")
print(df.head())`;

function createEmptyForm() {
  return {
    value: '',
    label: '',
    icon: '✨',
    engine: 'python',
  };
}

function App() {
  const [languages, setLanguages] = useState(INITIAL_LANGUAGES);
  const [runnerLanguage, setRunnerLanguage] = useState('python');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [form, setForm] = useState(createEmptyForm());
  const [formError, setFormError] = useState('');

  const openConfig = () => {
    setForm(createEmptyForm());
    setFormError('');
    setIsConfigOpen(true);
  };

  const closeConfig = () => {
    setIsConfigOpen(false);
    setFormError('');
  };

  const handleRemoveLanguage = (value) => {
    if (languages.length <= 1) {
      setFormError('Mantenha pelo menos uma linguagem na lista.');
      return;
    }

    const updatedLanguages = languages.filter((option) => option.value !== value);

    setLanguages(updatedLanguages);

    if (runnerLanguage === value) {
      setRunnerLanguage(updatedLanguages[0]?.value || 'python');
    }

    setFormError('');
  };

  const handleSubmitLanguage = (event) => {
    event.preventDefault();

    const value = form.value.trim().toLowerCase();
    const label = form.label.trim();
    const icon = form.icon.trim() || '✨';
    const engine = form.engine;

    if (!value || !label) {
      setFormError('Informe o identificador e o nome da linguagem.');
      return;
    }

    if (languages.some((option) => option.value === value)) {
      setFormError('Já existe uma linguagem com esse identificador.');
      return;
    }

    setLanguages((currentLanguages) => [...currentLanguages, { value, label, icon, engine }]);
    setRunnerLanguage(value);
    setIsConfigOpen(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1>Playground</h1>
          <p>O runner abaixo executa código em sandbox com Web Worker e iframe.</p>
        </div>
        <button
          type="button"
          onClick={openConfig}
          style={{ backgroundColor: '#1f6feb', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '6px', cursor: 'pointer' }}
        >
          Nova linguagem
        </button>
      </div>

      <CodeRunner language={runnerLanguage} languages={languages}>
{INITIAL_PYTHON_CODE}
      </CodeRunner>

      {isConfigOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="language-config-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000,
          }}
        >
          <form
            onSubmit={handleSubmitLanguage}
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <h2 id="language-config-title" style={{ margin: 0 }}>Nova linguagem</h2>
              <button
                type="button"
                onClick={closeConfig}
                style={{ border: 'none', background: 'transparent', fontSize: '1.2rem', cursor: 'pointer' }}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <p style={{ marginTop: '8px', color: '#555' }}>
              Cadastre uma nova linguagem visual e escolha qual motor existente ela vai usar para execução.
            </p>

            <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
              <label style={{ display: 'grid', gap: '6px' }}>
                Identificador
                <input
                  value={form.value}
                  onChange={(e) => setForm((current) => ({ ...current, value: e.target.value }))}
                  placeholder="ex: typescript"
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                Nome exibido
                <input
                  value={form.label}
                  onChange={(e) => setForm((current) => ({ ...current, label: e.target.value }))}
                  placeholder="ex: TypeScript"
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                Ícone / emoji
                <input
                  value={form.icon}
                  onChange={(e) => setForm((current) => ({ ...current, icon: e.target.value }))}
                  placeholder="ex: 🔷"
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                Motor de execução
                <select
                  value={form.engine}
                  onChange={(e) => setForm((current) => ({ ...current, engine: e.target.value }))}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: 'white' }}
                >
                  {ENGINE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ marginTop: '18px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>Linguagens cadastradas</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {languages.map((option) => (
                  <div
                    key={option.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.1rem' }}>{option.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{option.label}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{option.value} · motor {option.engine}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(option.value)}
                      disabled={languages.length <= 1}
                      style={{
                        border: '1px solid #d92d20',
                        backgroundColor: languages.length <= 1 ? '#fef3f2' : 'white',
                        color: '#d92d20',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        cursor: languages.length <= 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {formError ? (
              <div style={{ marginTop: '12px', color: '#b42318', backgroundColor: '#fef3f2', padding: '10px', borderRadius: '6px' }}>
                {formError}
              </div>
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button
                type="button"
                onClick={closeConfig}
                style={{ border: '1px solid #ccc', backgroundColor: 'white', padding: '10px 14px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ backgroundColor: '#1f6feb', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Adicionar linguagem
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;