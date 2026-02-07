import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

const clickSound = new Audio("/Welcome to the GAme.mp3");

const TAGLINES = [
  "Trust no one.",
  "Someone is lying.",
  "One of you is the Undercover.",
  "Speak carefully.",
  "Bluff. Guess. Survive.",
  "Blend in or blow your cover.",
  "Decode the lie.",
  "Outwit. Outlast. Out-talk.",
  "Your secret is their victory.",
  "One word can end it all.",
  "The traitor is listening.",
  "A wolf in word’s clothing.",
  "Spot the odd one out.",
  "Close the circle. Find the leak.",
  "Hiding in plain sight.",
  "Your words are your weapon.",
  "Every detail matters.",
  "Silence is safe. Speech is a risk.",
  "Truth is a luxury.",
  "Mind the gap in your story.",
  "Welcome to the snake pit.",
  "Eat or be eaten.",
  "The truth is a death sentence.",
  "Dirty hands. Clean words.",
  "Sell the lie. Buy your life.",
  "Betrayal is the only constant.",
  "Kill the lights. Find the liar.",
  "Sift through the wreckage.",
  "Stab them with a smile.",
  "Nobody leaves clean.",
  "Trust is for the dead.",
  "Everyone is a target.",
  "Bleed them dry with words.",
  "The walls have ears.",
  "Mercy is a mistake."
];

export default function Home() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setTaglineIndex(Math.floor(Math.random() * TAGLINES.length));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex(prev => {
        let next;
        do {
          next = Math.floor(Math.random() * TAGLINES.length);
        } while (next === prev);
        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

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
        <h1 style={styles.title} onClick={() => {
    clickSound.currentTime = 0;
    clickSound.play();
  }} >🎭 Undercover</h1>
        <p style={styles.tagline}>
  {TAGLINES[taglineIndex]}
</p>


        <input
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <button style={styles.primaryBtn} 
        onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
        onMouseUp={e => e.currentTarget.style.transform = "scale(1)"} 
        onClick={createRoom}>
          Create Room
        </button>

        <div style={styles.divider}>OR</div>

        <input
          style={styles.input}
          placeholder="Enter room code"
          value={room}
          onChange={e => setRoom(e.target.value)}
        />

        <button style={styles.primaryBtn}
        onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
        onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        onClick={joinRoom} >
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
                <li>Developed By Devansh🙂</li>
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
    color: "#1f2937",
    cursor: "pointer",
    userSelect: "none"
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
    boxSizing: "border-box",
    border: "1px solid #ccc",
    fontSize: 16
  },
  primaryBtn: {
    width: "100%",
    padding: "0 12",
    height: 48,  
    background: "#667eea",
    color: "#fff",
    border: "1px solid transparent",
    borderRadius: 8,
    boxSizing: "border-box" ,
    fontSize: 16,
    cursor: "pointer",
    transition: "transform 0.1s ease, box-shadow 0.1s ease"
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
  },
  tagline: {
  marginBottom: 25,
  color: "#6b7280",
  fontSize: 14,
  minHeight: "1.2em",
  transition: "opacity 0.3s ease"
}

};

