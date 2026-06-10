importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js");

let pyodideInstance = null;

self.onmessage = async (e) => {
  if (e.data.type === 'INIT') {
    try {
      if (!pyodideInstance) {
        pyodideInstance = await loadPyodide();
        
        await pyodideInstance.loadPackage('micropip');
        await pyodideInstance.runPythonAsync(`
          import micropip
          # APENAS pandas e fsspec aqui
          await micropip.install(['pandas', 'fsspec'])
        `);
      }
      self.postMessage({ type: 'READY', lang: 'python' });
    } catch (err) {
      self.postMessage({ type: 'ERROR', error: 'Erro ao iniciar Python: ' + err.message, lang: 'python' });
    }
  }

  if (e.data.type === 'RUN') {
    if (!pyodideInstance) {
      self.postMessage({ type: 'ERROR', error: 'O ambiente Python ainda não está pronto.', lang: 'python' });
      return;
    }

    let outputBuffer = [];
    pyodideInstance.setStdout({
      batched: (text) => { outputBuffer.push(text); }
    });

    try {
      await pyodideInstance.runPythonAsync(e.data.code);
      self.postMessage({ type: 'RESULT', output: outputBuffer.join('\n'), lang: 'python' });
    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message, lang: 'python' });
    }
  }
};