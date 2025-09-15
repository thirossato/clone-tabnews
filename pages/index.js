import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

// 🔹 Substitua com suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCa6dl0bo3pkC-671YFbS4i3ov57heF4DI",
  authDomain: "watermanagement-109be.firebaseapp.com",
  databaseURL: "https://watermanagement-109be-default-rtdb.firebaseio.com",
  projectId: "watermanagement-109be",
  storageBucket: "watermanagement-109be.firebasestorage.app",
  messagingSenderId: "749990652411",
  appId: "1:749990652411:web:8d1d1652781515d3bd835e",
  measurementId: "G-2EHZW4G2RL"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const TOTAL_TORRES = 3;
const ANDARES = 21; // 19 andares + térreo

// Função para exibir o rótulo do andar
function getAndarLabel(idx) {
  if (idx === 0) return "Térreo";
  return `${idx}º`;
}

function App() {
  const [torres, setTorres] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);

  // 🔹 Carrega dados do Firebase na inicialização
  useEffect(() => {
    const torresRef = ref(db, "status");
    onValue(torresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTorres(data.torres);
        setLastUpdate(data.lastUpdate);
      } else {
        // Inicializa vazio se não existir
        let initial = {};
        for (let t = 1; t <= TOTAL_TORRES; t++) {
          // 20 andares: 1º ao 19º + térreo
          initial[t] = Array(ANDARES).fill(true);
        }
        set(torresRef, { torres: initial, lastUpdate: null });
      }
    });
  }, []);

  // 🔹 Alterna status de um andar e grava no Firebase
  const toggleAndar = (torre, idx) => {
    const novo = { ...torres };
    novo[torre][idx] = !novo[torre][idx];
    const updated = {
      torres: novo,
      lastUpdate: new Date().toLocaleString("pt-BR"),
    };
    set(ref(db, "status"), updated);
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
              {[...torres[torre]].map((temAgua, idx) => (
                <tr key={idx}>
                  <td>{getAndarLabel(ANDARES - 1 - idx)}</td>
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

export default App;
