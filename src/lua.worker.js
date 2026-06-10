// src/lua.worker.js

// 1. Carrega todo o conteúdo do bundle do Fengari como texto puro
import fengariSource from 'fengari-web/dist/fengari-web.bundle.js?raw';

// 2. Cria os objetos globais simulados para impedir que o script quebre
self.module = { exports: {} };
self.exports = self.module.exports;

// 3. Executa o script do Fengari injetando-o no escopo
new Function(fengariSource)();

// 4. Resgata o motor do Fengari de onde ele foi exportado pelo bundle
const f = self.fengari || self.module.exports.fengari || self.module.exports;
const lua = f.lua;
const lauxlib = f.lauxlib;
const lualib = f.lualib;

if (!f || !lua || !lauxlib || !lualib) {
    throw new Error("Não foi possível mapear os submódulos do Fengari.");
}

// 5. CORREÇÃO DA FUNÇÃO: Usamos o lauxlib para criar o estado 'L' do Lua
const L = lauxlib.luaL_newstate();

// Usamos o lualib para abrir as bibliotecas internas do Lua (print, math, table, etc.)
lualib.luaL_openlibs(L);

// Buffer temporário para capturar as saídas do print do Lua
let outputBuffer = [];

// Função customizada para o 'print' do Lua capturar o texto na nossa caixinha do React
const customPrint = (L) => {
    const n = lua.lua_gettop(L);
    let args = [];
    for (let i = 1; i <= n; i++) {
        const str = lua.lua_tostring(L, i);
        args.push(str ? f.to_jsstring(str) : 'nil');
    }
    outputBuffer.push(args.join('\t'));
    return 0; 
};

// Registra a função no interpretador
lua.lua_register(L, f.to_luastring('print'), customPrint);

// Avisa o ambiente que o Lua local está pronto
self.postMessage({ type: 'READY' });

// No final do seu src/lua.worker.js, mude o self.onmessage para enviar 'lang':

self.onmessage = (e) => {
  if (e.data.type === 'RUN') {
    outputBuffer = [];

    try {
      const luaCode = f.to_luastring(e.data.code);
      const statusCode = lauxlib.luaL_dostring(L, luaCode);
      
      if (statusCode !== 0) {
        const errorMsg = lua.lua_tostring(L, -1);
        const errorText = errorMsg ? f.to_jsstring(errorMsg) : 'Erro de execução desconhecido.';
        // ADICIONADO: lang: 'lua'
        self.postMessage({ type: 'ERROR', error: errorText, lang: 'lua' });
      } else {
        // ADICIONADO: lang: 'lua'
        self.postMessage({ type: 'RESULT', output: outputBuffer.join('\n'), lang: 'lua' });
      }
    } catch (err) {
      // ADICIONADO: lang: 'lua'
      self.postMessage({ type: 'ERROR', error: err.message, lang: 'lua' });
    }
  }
};