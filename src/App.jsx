import React from 'react';
import PythonRunner from './components/PythonRunner';
import LuaRunner from './components/LuaRunner';

//python
//import sys
//print("Olá do Python Isolado!")
//print("Versão do Python:", sys.version)

function App() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Playground de Linguagens Isoladas</h1>
      <p>Ambos os componentes abaixo rodam em Web Workers separados e dentro de iframes com sandbox.</p>

      <PythonRunner>
{`import warnings
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
print(df.head())`}
      </PythonRunner>

      <LuaRunner>
{`local msg = "Olá do Lua Isolado!"
print(msg)
print("Resultado matemático:", 10 * 6)`}
      </LuaRunner>
    </div>
  );
}

export default App;