import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const navigate = useNavigate();

  function createRoom() {
    if (!name) return alert("Enter your name");
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    navigate(`/lobby/${code}`, { state: { name, isHost: true } });
  }

  function joinRoom() {
    if (!name || !room) return alert("Enter name & room code");
    navigate(`/lobby/${room.toUpperCase()}`, { state: { name, isHost: false } });
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎭 Undercover</h1>
        <p style={styles.subtitle}>A social deduction party game</p>

        <input
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <button style={styles.primaryBtn} onClick={createRoom}>
          Create Room
        </button>

        <div style={styles.divider}>OR</div>

        <input
          style={styles.input}
          placeholder="Enter room code"
          value={room}
          onChange={e => setRoom(e.target.value)}
        />

        <button style={styles.primaryBtn} onClick={joinRoom} >
          Join Room
          
        </button>

        {/* How to Play */}
        <div style={styles.howToPlay}>
          {!showHowToPlay ? (
            <button
              style={styles.linkBtn}
              onClick={() => setShowHowToPlay(true)}
            >
              📘 How to Play
            </button>
          ) : (
            <div style={styles.howToContent}>
              <h3>How to Play</h3>
              <ul>
                <li>One player creates a room</li>
                <li>Others join using the room code</li>
                <li>Each player gets a secret word</li>
                <li>One player is the Undercover 😈</li>
                <li>Discuss & vote to find the Undercover</li>
              </ul>

              <button
                style={styles.minimizeBtn}
                onClick={() => setShowHowToPlay(false)}
              >
                Minimize ▲
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    padding: 20
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 30,
    width: "100%",
    maxWidth: 380,
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    textAlign: "center"
  },
  title: {
    marginBottom: 5,
    color: "#1f2937"
  },
  subtitle: {
    marginBottom: 25,
    color: "#666"
  },
  input: {
    width: "100%",
    padding:  "0 12px",
    height: 48,  
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16
  },
  primaryBtn: {
    width: "100%",
    padding: 12,
    height: 48,  
    background: "#667eea",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    cursor: "pointer"
  },
  secondaryBtn: {
    width: "100%",
    padding: 12,
    background: "#eee",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    cursor: "pointer"
  },
  divider: {
    margin: "15px 0",
    fontWeight: "bold",
    color: "#888"
  },
  howToPlay: {
    marginTop: 20
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#667eea",
    cursor: "pointer",
    fontSize: 14
  },
  howToContent: {
    textAlign: "left",
    marginTop: 10,
    fontSize: 14,
    color: "#333"
  },
  minimizeBtn: {
    marginTop: 10,
    background: "none",
    border: "none",
    color: "#667eea",
    cursor: "pointer",
    fontSize: 14
  }
};

