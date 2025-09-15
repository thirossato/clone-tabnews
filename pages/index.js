import React, { useState, useEffect } from "react";

const TOTAL_TORRES = 3;
const ANDARES = 20;

function Home() {
  const [torres, setTorres] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);

  // Carrega dados do localStorage na inicialização
  useEffect(() => {
    const saved = localStorage.getItem("agua-condominio");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTorres(parsed.torres || {});
      setLastUpdate(parsed.lastUpdate || null);
    } else {
      // Inicializa vazio
      let initial = {};
      for (let t = 1; t <= TOTAL_TORRES; t++) {
        initial[t] = Array(ANDARES).fill(true); // true = tem água
      }
      setTorres(initial);
    }
  }, []);

  // Salva no localStorage sempre que torres mudar
  useEffect(() => {
    localStorage.setItem(
      "agua-condominio",
      JSON.stringify({ torres, lastUpdate })
    );
  }, [torres, lastUpdate]);

  const toggleAndar = (torre, andar) => {
    const novo = { ...torres };
    novo[torre][andar] = !novo[torre][andar];
    setTorres(novo);
    setLastUpdate(new Date().toLocaleString());
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <h1>Monitor de Água - Condomínio</h1>
      <p>
        Última atualização:{" "}
        <strong>{lastUpdate || "nenhuma alteração ainda"}</strong>
      </p>

      {Object.keys(torres).map((torre) => (
        <div key={torre} style={{ marginBottom: "20px" }}>
          <h2>Torre {torre}</h2>
          <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Andar</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {torres[torre].map((temAgua, idx) => (
                <tr key={idx}>
                  <td>{ANDARES - idx}º</td>
                  <td>
                    <button
                      onClick={() => toggleAndar(torre, idx)}
                      style={{
                        background: temAgua ? "lightgreen" : "salmon",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {temAgua ? "Com Água" : "Sem Água"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default Home;