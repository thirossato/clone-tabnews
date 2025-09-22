import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set } from "firebase/database";


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
  const [muralInput, setMuralInput] = useState("");
  const [muralList, setMuralList] = useState([]);

  // 🔹 Carregar dados iniciais
  useEffect(() => {
    const torresRef = ref(db, "status");
    onValue(torresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTorres(data.torres || {});
        setLastUpdate(data.lastUpdate || null);
      } else {
        let initial = {};
        for (let t = 1; t <= TOTAL_TORRES; t++) {
          initial[t] = Array(ANDARES).fill(true);
        }
        set(torresRef, { torres: initial, lastUpdate: null });
      }
    });

    const muralRef = ref(db, "mural");
    onValue(muralRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.values(data);
        setMuralList(lista.sort((a, b) => b.timestamp - a.timestamp));
      }
    });
  }, []);

  // 🔹 Alternar status andar
  const toggleAndar = (torre, idx) => {
    const novo = { ...torres };
    novo[torre][idx] = !novo[torre][idx];
    const updated = {
      torres: novo,
      lastUpdate: new Date().toLocaleString("pt-BR"),
    };
    set(ref(db, "status"), updated);
  };

  function contemStatusAgua(novaMensagem) {
    const regex = /\b(?:com|sem)\s+(?:água|agua|àgua)\b/i;
    return regex.test(novaMensagem);
  }

  

  return (
    <div className="container" style={{ fontFamily: "Arial", padding: "20px", textAlign: "center" }}>
      <h1>Monitor de Água - Vila Capri</h1>
      <p>
        Última atualização geral:{" "}
        <strong>{lastUpdate || "nenhuma alteração ainda"}</strong>
      </p>
      <h3>Clique em Com àgua / Sem água do respectivo andar para alterar a informação</h3>

      {/* 🔹 Torres responsivas */}
      <div
        className="torres-wrapper"
      >
        {Object.keys(torres).map((torre) => (
          <div
            key={torre}
            className="torre-card"
          >
            <h2>Torre {torre}</h2>
            <table>
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
                        className={temAgua ? "btn btn-ok" : "btn btn-nok"}
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
     

    </div>
  );
}


export default App;
