let pyodidePromise: Promise<any> | null = null;

export async function getSharedPyodide() {
  if (typeof window === "undefined") return null;

  if (pyodidePromise) return pyodidePromise;

  const loadPyodide = (window as any).loadPyodide;
  if (!loadPyodide) {
    throw new Error("Pyodide script não encontrado no Window.");
  }

  pyodidePromise = loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
  });

  return pyodidePromise;
}
