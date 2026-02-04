import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
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
    <div style={{ padding: 40 }}>
      <h1>🎭 Undercover</h1>

      <input
        placeholder="Your Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <br /><br />

      <button onClick={createRoom}>Create Room</button>

      <br /><br />

      <input
        placeholder="Room Code"
        value={room}
        onChange={e => setRoom(e.target.value)}
      />

      <br /><br />

      <button onClick={joinRoom}>Join Room</button>
    </div>
  );
}
