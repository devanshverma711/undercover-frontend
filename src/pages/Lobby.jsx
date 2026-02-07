// src/pages/Lobby.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function Lobby() {
  const { roomCode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [mySocketId, setMySocketId] = useState(null);
  const { name, isHost } = state || {};
  const phaseText = {
    lobby: "Waiting for players",
    playing: "Discuss the word",
    voting: "Vote the Undercover",
    ended: "Round finished",
  };


  const socketRef = useRef(null);

  const [game, setGame] = useState(null);
  const [votes, setVotes] = useState({});
  const [selected, setSelected] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [myWord, setMyWord] = useState(null);
  const [copied, setCopied] = useState(false);
  const aliveCount = game.players.filter(p => p.alive).length;


  // 🔌 SOCKET SETUP (runs once)
  useEffect(() => {
    if (!name || !roomCode) {
      navigate("/");
      return;
    }

    const socket = io(BACKEND, {
  transports: ["polling"],
});

    socketRef.current = socket;

    socket.on("connect", () => {
      setMySocketId(socket.id);
      socket.emit("join-room", { room: roomCode, name });
    });

    socket.on("state", (data) => {
      setGame(data);
       if (data.phase === "lobby") {
        setMyRole(null);
        setMyWord(null);
      }

      if (data.phase !== "voting") {
        setVotes({});
        setSelected(null);
      }
    });

    socket.on("votes", (vc) => setVotes(vc || {}));

    socket.on("role", ({ role, word }) => {
      setMyRole(role);
      setMyWord(word);
    });

    socket.on("error", (m) => alert(m));

    return () => {
      socket.disconnect();
    };
  }, [roomCode, name, navigate]);

  if (!game) {
    return (
      <div style={styles.fullCenter}>
        <h2>Loading...</h2>
      </div>
    );
  }

  const socket = socketRef.current;
  const isHostNow = game.hostId === mySocketId;
  const scoreboard = [...game.players].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  function canClickTarget(p) {
    return (
      game.phase === "voting" &&
      aliveCount > 2 &&
      p.alive &&
      p.name !== name &&
      !selected
    );
  }
  

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={styles.logo}>Undercover</div>
          <div style={{ color: "#ddd", fontSize: 14 }}>
            Room: <strong>{roomCode}</strong>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center",flexWrap: "wrap",justifyContent: "flex-end" }}>
          <div style={{ color: "#ddd" }}>You: {name}</div>
          <div style={styles.phaseBadge}>{phaseText[game.phase]}</div>

        </div>
      </div>

      <main style={styles.main}>
        <section style={styles.board}>
          {myRole && game.phase !== "lobby" && (
            <div
              style={{
                ...styles.roleBox,
                background:
                  myRole === "undercover" ? "#7b1f1f" : "#185e36",
              }}
            >
        
              <div style={{ fontSize: 12, opacity: 0.8, letterSpacing: 1 }}>
                {myRole.toUpperCase()}
              </div>
              
              
              <div style={{ 
                fontSize: 28, 
                fontWeight: 700, 
                marginTop: 6 
              }}>{myWord}</div>
            </div>
            
          )}

          {game.message && (
            <div style={styles.messageBox}>
              <strong>
                {game.phase === "ended" && myRole === "undercover"
                  ? "💀 You were caught by the civilians!"
                  : game.message}
              </strong>
            </div>
          )}


          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
            navigator.clipboard.writeText(roomCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          

          >
            Room: <strong>{roomCode}</strong> 📋
          </div>
          {copied && (
            <span style={{ marginLeft: 6, fontSize: 12 }}>Copied!</span>
          )}


          <div style={styles.playersGrid}>
            {game.players.map((p) => {
              const isYou = p.name === name;
              const clickable = canClickTarget(p);
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (!clickable) return;
                    setSelected(p.name);
                    socket.emit("vote", {
                      room: roomCode,
                      votedName: p.name,
                    });
                  }}
                  style={{
                    ...styles.playerCard,
                    background: !p.alive
                      ? "#2f2f2f"
                      : selected === p.name
                      ? "#ff8a00"
                      : "#111827",
                    cursor: clickable ? "pointer" : "default",
                    opacity: p.alive ? 1 : 0.5,
                  }}
                >
                  <strong>
                    {p.name}
                    {isYou ? " (You)" : ""}
                    {p.id === game.hostId ? " 👑" : ""}
                  </strong>
                  <div>Score: {p.score ?? 0}</div>
                  {votes[p.name] && (
                    <div>Votes: {votes[p.name]}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={styles.actionsRow}>
            {isHostNow  && game.phase === "lobby" && (
              <button onClick={() => socket.emit("startGame")}>
                Start Game
              </button>
            )}
            {isHostNow  && game.phase === "playing" && (
              <button
                onClick={() =>{
                  if (!isHostNow) return;
                  socket.emit("start-voting", roomCode)
                }}
              >
                Start Voting
              </button>
            )}
            {isHostNow  && game.phase === "ended" && (
              <button
                onClick={() =>
                  socket.emit("play-again", roomCode)
                }
              >
                Play Again
              </button>
            )}
            <button
              onClick={() => {
                socket.emit("leaveRoom");
                navigate("/");
              }}
            >
              Leave
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---------- Styles ---------- */
const styles = {
  fullCenter: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  app: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "#fff",
  },
  header: {
    height: "auto",
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 16px",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  logo: { fontSize: 18, fontWeight: 700 },
  phaseBadge: {
    background: "#1e293b",
    padding: "6px 10px",
    borderRadius: 6,
  },
  main: { padding: 24 },
  board: { display: "flex", flexDirection: "column", gap: 16 },
  roleBox: { padding: 12, borderRadius: 8 },
  messageBox: {
    padding: 10,
    background: "#1e293b",
    borderRadius: 6,
  },
  playersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
    gap: 12,
  },
  playerCard: {
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
    border: "1px solid #1e293b",
  },
  actionsRow: { 
    display: "flex", 
    gap: 10, 
    marginTop: 12,
    flexWrap: "wrap" },
};
