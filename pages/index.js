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

  // 🔹 Adicionar mensagem no mural
  const addMuralMessage = () => {
    if (muralInput.trim() === "") return;
    const novaMensagem = {
      texto: muralInput,
      data: new Date().toLocaleString("pt-BR"),
      timestamp: Date.now(),
    };
    push(ref(db, "mural"), novaMensagem);
    setMuralInput("");
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px", textAlign: "center" }}>
      <h1>Monitor de Água - Condomínio</h1>
      <p>
        Última atualização geral:{" "}
        <strong>{lastUpdate || "nenhuma alteração ainda"}</strong>
      </p>
      <p>Clique em Com àgua / Sem água do respectivo andar para alterar a informação</p>

      {/* 🔹 Mural de mensagens */}
      <div
        style={{
          margin: "20px auto",
          maxWidth: "800px",
          background: "#f9f9f9",
          padding: "15px",
          borderRadius: "10px",
          border: "1px solid #ccc",
        }}
      >
        <h2>Mural de Atualizações</h2>
        <textarea
          value={muralInput}
          onChange={(e) => setMuralInput(e.target.value)}
          placeholder="Escreva uma atualização..."
          style={{
            width: "100%",
            height: "80px",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
        <br />
        <button
          onClick={addMuralMessage}
          style={{
            padding: "8px 15px",
            border: "none",
            borderRadius: "6px",
            background: "#4caf50",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Publicar
        </button>

        {/* Lista de mensagens */}
        <div style={{ marginTop: "20px", textAlign: "left" }}>
          {muralList.map((msg, idx) => (
            <div
              key={idx}
              style={{
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "6px",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <p style={{ margin: "0 0 5px 0" }}>{msg.texto}</p>
              <small style={{ color: "#666" }}>{msg.data}</small>
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 Torres responsivas */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap", // quebra no celular
          justifyContent: "center",
          gap: "20px",
        }}
      >
        {Object.keys(torres).map((torre) => (
          <div
            key={torre}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "10px",
              width: "250px",
              background: "#fafafa",
              flex: "1 1 250px",
            }}
          >
            <h2>Torre {torre}</h2>
            <table
              border="1"
              cellPadding="5"
              style={{ borderCollapse: "collapse", width: "100%" }}
            >
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
    </div>
  );
}


export default App;
