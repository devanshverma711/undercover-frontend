
// src/pages/Lobby.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

/**
 * Uses Vite env: VITE_BACKEND_URL (optional). Falls back to localhost.
 * In Vite set .env -> VITE_BACKEND_URL=https://your-backend.example
 */
const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";


export default function Lobby() {
  const { roomCode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { name, isHost } = state || {};

  const [socket, setSocket] = useState(null);
  const [game, setGame] = useState(null);
  const [votes, setVotes] = useState({});
  const [selected, setSelected] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [myWord, setMyWord] = useState(null);

  useEffect(() => {
    const s = io(BACKEND);
    setSocket(s);

    s.on("connect", () => s.emit("join-room", { room: roomCode, name }));

    s.on("state", (data) => {
      setGame(data);
      if (data.phase !== "voting") {
        setVotes({});
        setSelected(null);
      }
    });

    s.on("votes", (vc) => setVotes(vc || {}));

    s.on("role", ({ role, word }) => {
      setMyRole(role);
      setMyWord(word);
    });

    s.on("error", (m) => alert(m));

    return () => s.disconnect();
  }, [roomCode, name]);

  if (!game) return <div style={styles.fullCenter}><h2>Loading...</h2></div>;

  const scoreboard = [...game.players].sort((a, b) => (b.score || 0) - (a.score || 0));

  function canClickTarget(p) {
    return game.phase === "voting" && p.alive && p.name !== name && !selected;
  }

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={styles.logo}>Undercover</div>
          <div style={{ color: "#ddd", fontSize: 14 }}>Room: <strong>{roomCode}</strong></div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ color: "#ddd" }}>{name ? `You: ${name}` : ""}</div>
          <div style={styles.phaseBadge}>{game.phase.toUpperCase()}</div>
        </div>
      </div>

      <main style={styles.main}>
        {/* Left: game board */}
        <section style={styles.board}>
          {/* role box */}
          {myRole && game.phase !== "lobby" && (
            <div style={{ ...styles.roleBox, background: myRole === "undercover" ? "#7b1f1f" : "#185e36" }}>
              <div style={{ fontSize: 13, opacity: 0.9 }}>ROLE</div>
              <h3 style={{ margin: 6 }}>{myRole.toUpperCase()}</h3>
              <div style={{ fontSize: 20, marginTop: 4 }}>{myWord}</div>
            </div>
          )}

          {/* message */}
          {game.message && (
            <div style={styles.messageBox}>
              <strong>{game.message}</strong>
            </div>
          )}

          {/* players grid */}
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
                    socket.emit("vote", { room: roomCode, votedName: p.name });
                  }}
                  style={{
                    ...styles.playerCard,
                    background: !p.alive ? "#2f2f2f" : selected === p.name ? "#ff8a00" : "#111827",
                    cursor: clickable ? "pointer" : "default",
                    boxShadow: isYou ? "0 6px 18px rgba(59,130,246,0.12)" : undefined,
                    opacity: p.alive ? 1 : 0.5
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 700 }}>
                    {p.name}{isYou ? " (You)" : ""}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13 }}>Score: <strong>{p.score ?? 0}</strong></div>
                  {votes[p.name] && <div style={{ marginTop: 8, color: "#ffd866" }}>Votes: {votes[p.name]}</div>}
                </div>
              );
            })}
          </div>

          {/* host actions */}
          <div style={styles.actionsRow}>
            {isHost && game.phase === "lobby" && <button style={styles.btn} onClick={() => socket.emit("startGame")}>Start Game</button>}
            {isHost && game.phase === "playing" && <button style={styles.btn} onClick={() => socket.emit("start-voting", roomCode)}>Start Voting</button>}
            {isHost && game.phase === "ended" && <button style={styles.btnPrimary} onClick={() => socket.emit("play-again", roomCode)}>Play Again</button>}
            <button style={styles.btnGhost} onClick={() => { socket.emit("leaveRoom"); navigate("/"); }}>Leave</button>
          </div>
        </section>

        {/* Right: scoreboard */}
        <aside style={styles.sidebar}>
          <div style={styles.scoreHeader}>
            <h4 style={{ margin: 0 }}>Scoreboard</h4>
            <div style={{ color: "#999", fontSize: 12 }}>Tournament</div>
          </div>

          <ol style={styles.scoreList}>
            {scoreboard.map(p => (
              <li key={p.id} style={styles.scoreRow}>
                <div style={{ fontWeight: p.name === name ? 700 : 500 }}>{p.name}{p.name === name ? " (You)" : ""}</div>
                <div style={{ fontWeight: 700 }}>{p.score ?? 0}</div>
              </li>
            ))}
          </ol>

          <div style={{ marginTop: 18, color: "#aaa", fontSize: 13 }}>
            Tips: Use full-screen (F11) for best experience.
          </div>
        </aside>
      </main>

      <footer style={styles.footer}>
        <div style={{ color: "#999" }}>Built with ♥ · Local: <code style={{ color: "#ddd" }}>{BACKEND}</code></div>
      </footer>
    </div>
  );
}

/* ---------- Styles (inline for simplicity) ---------- */
const styles = {
  fullCenter: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  app: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#0f172a 0%, #071029 60%)",
    color: "#e6eef8",
    display: "flex",
    flexDirection: "column"
  },
  header: {
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    borderBottom: "1px solid rgba(255,255,255,0.03)"
  },
  logo: {
    fontWeight: 800,
    fontSize: 18,
    color: "#fff"
  },
  phaseBadge: {
    background: "rgba(255,255,255,0.04)",
    padding: "6px 10px",
    borderRadius: 8,
    fontSize: 12
  },
  main: {
    display: "flex",
    gap: 24,
    padding: 24,
    flex: 1
  },
  board: {
    flex: 1,
    minWidth: 360,
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  sidebar: {
    width: 300,
    borderRadius: 12,
    padding: 14,
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    alignSelf: "flex-start",
    height: "fit-content"
  },
  roleBox: {
    padding: 12,
    borderRadius: 10,
    color: "#fff",
    display: "inline-block",
    minWidth: 200
  },
  messageBox: {
    padding: 12,
    borderRadius: 8,
    background: "rgba(255,152,0,0.08)",
    border: "1px solid rgba(255,152,0,0.12)",
    color: "#ffd9a1"
  },
  playersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
    marginTop: 6
  },
  playerCard: {
    padding: 12,
    borderRadius: 10,
    background: "#111827",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: 84
  },
  actionsRow: { display: "flex", gap: 12, marginTop: 12, alignItems: "center" },
  btn: {
    padding: "8px 12px",
    borderRadius: 8,
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#fff"
  },
  btnPrimary: {
    padding: "8px 14px",
    borderRadius: 8,
    background: "#2563eb",
    border: "none",
    color: "#fff"
  },
  btnGhost: {
    padding: "8px 10px",
    borderRadius: 8,
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.03)",
    color: "#ddd",
    marginLeft: "auto"
  },
  scoreHeader: { marginBottom: 8 },
  scoreList: { margin: 0, paddingLeft: 18 },
  scoreRow: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
  footer: { padding: 12, borderTop: "1px solid rgba(255,255,255,0.02)", textAlign: "center" }
};
