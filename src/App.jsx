
import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const [players, setPlayers] = useState([
    { id: 1, name: "Player 1", coins: 120, games: 8 },
    { id: 2, name: "Player 2", coins: 95, games: 7 },
    { id: 3, name: "Player 3", coins: 80, games: 6 },
  ]);

  const [newPlayer, setNewPlayer] = useState("");

  const [scores, setScores] = useState([
    { id: 1, player: "Player 1", score: 120, date: "Today" },
    { id: 2, player: "Player 2", score: 95, date: "Today" },
    { id: 3, player: "Player 3", score: 80, date: "Today" },
  ]);

  // Add a new player
  const addPlayer = () => {
    if (!newPlayer.trim()) return;

    const player = {
      id: Date.now(),
      name: newPlayer.trim(),
      coins: 0,
      games: 0,
    };

    setPlayers((previous) => [...previous, player]);
    setNewPlayer("");
  };

  // Remove a player
  const removePlayer = (id) => {
    setPlayers((previous) =>
      previous.filter((player) => player.id !== id)
    );
  };

  // Add coins to a player
  const updateScore = (id, value) => {
    const coins = Number(value);

    if (!Number.isFinite(coins) || coins <= 0) return;

    const player = players.find((p) => p.id === id);
    if (!player) return;

    setPlayers((previous) =>
      previous.map((p) =>
        p.id === id
          ? { ...p, coins: p.coins + coins }
          : p
      )
    );

    setScores((previous) => [
      {
        id: Date.now(),
        player: player.name,
        score: coins,
        date: new Date().toLocaleDateString(),
      },
      ...previous,
    ]);
  };

  // All-time ranking: highest accumulated coins first
  const allTimePlayers = [...players].sort(
    (a, b) => b.coins - a.coins
  );

  const totalCoins = players.reduce(
    (total, player) => total + player.coins,
    0
  );

  const tabs = [
    "Dashboard",
    "Players",
    "Daily Scores",
    "All-Time Performance",
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <span>♠</span> LIVINGROOM
          <small>POKER CLUB</small>
        </div>

        <p className="menu-label">MENU</p>

        <nav>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={
                activeTab === tab ? "nav-item active" : "nav-item"
              }
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Dashboard" && "▦"}
              {tab === "Players" && "♙"}
              {tab === "Daily Scores" && "◷"}
              {tab === "All-Time Performance" && "🏆"}
              <span>{tab}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span>♠</span>
          <div>
            <strong>Livingroom Poker</strong>
            <small>Admin Panel</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">LIVINGROOM POKER CLUB</p>
            <h2>{activeTab}</h2>
          </div>

          <div className="admin-profile">
            <div className="avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <small>Club Admin</small>
            </div>
          </div>
        </header>

        {/* DASHBOARD */}
        {activeTab === "Dashboard" && (
          <section>
            <div className="welcome">
              <div>
                <p>WELCOME BACK</p>
                <h1>Game on. ♠</h1>
                <span>
                  Here's what's happening at your poker club.
                </span>
              </div>
              <div className="welcome-icon">♠</div>
            </div>

            <div className="stats-grid">
              <StatCard
                title="Total Players"
                value={players.length}
                icon="♙"
              />

              <StatCard
                title="Total Coins"
                value={totalCoins}
                icon="★"
              />

              <StatCard
                title="Score Entries"
                value={scores.length}
                icon="◷"
              />

              <StatCard
                title="Top Player"
                value={allTimePlayers[0]?.name || "—"}
                icon="🏆"
              />
            </div>

            <div className="section-card">
              <div className="section-heading">
                <div>
                  <h3>Top Players</h3>
                  <p>Rankings based on total accumulated coins</p>
                </div>

                <button
                  onClick={() =>
                    setActiveTab("All-Time Performance")
                  }
                >
                  View performance →
                </button>
              </div>

              <PlayerTable players={allTimePlayers.slice(0, 5)} />
            </div>
          </section>
        )}

        {/* PLAYERS */}
        {activeTab === "Players" && (
          <section className="section-card">
            <div className="section-heading">
              <div>
                <h3>Player Management</h3>
                <p>Add and manage your club players.</p>
              </div>
            </div>

            <div className="add-player">
              <input
                type="text"
                placeholder="Enter player name"
                value={newPlayer}
                onChange={(e) => setNewPlayer(e.target.value)}
              />

              <button onClick={addPlayer}>
                + Add Player
              </button>
            </div>

            {players.map((player) => (
              <div className="player-row" key={player.id}>
                <div className="player-avatar">
                  {player.name.charAt(0).toUpperCase()}
                </div>

                <div className="player-info">
                  <strong>{player.name}</strong>
                  <small>{player.games} games played</small>
                </div>

                <strong>{player.coins} coins</strong>

                <button
                  className="delete-button"
                  onClick={() => removePlayer(player.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </section>
        )}

        {/* DAILY SCORES */}
        {activeTab === "Daily Scores" && (
          <section className="section-card">
            <div className="section-heading">
              <div>
                <h3>Daily Scores</h3>
                <p>Record player coins.</p>
              </div>
            </div>

            <div className="score-entry">
              {players.map((player) => (
                <div className="score-row" key={player.id}>
                  <div>
                    <strong>{player.name}</strong>
                    <small>
                      Total: {player.coins} coins
                    </small>
                  </div>

                  <input
                    type="number"
                    min="1"
                    placeholder="Coins"
                    id={`score-${player.id}`}
                  />

                  <button
                    onClick={() => {
                      const input = document.getElementById(
                        `score-${player.id}`
                      );

                      if (input.value.trim() === "") return;

                      updateScore(player.id, input.value);
                      input.value = "";
                    }}
                  >
                    Add Coins
                  </button>
                </div>
              ))}
            </div>

            <h3 className="history-title">Score History</h3>

            {scores.map((score) => (
              <div className="history-row" key={score.id}>
                <span>{score.player}</span>
                <span>{score.date}</span>
                <strong>+{score.score} coins</strong>
              </div>
            ))}
          </section>
        )}

        {/* ALL-TIME PERFORMANCE */}
        {activeTab === "All-Time Performance" && (
          <section className="section-card">
            <div className="section-heading">
              <div>
                <h3>All-Time Performance</h3>
                <p>
                  Player rankings based on total coins accumulated
                  across all recorded scores.
                </p>
              </div>
            </div>

            {allTimePlayers.map((player, index) => (
              <div className="leaderboard-row" key={player.id}>
                <div className="rank">
                  {index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `#${index + 1}`}
                </div>

                <div className="player-avatar">
                  {player.name.charAt(0).toUpperCase()}
                </div>

                <div className="player-info">
                  <strong>{player.name}</strong>
                  <small>{player.games} games</small>
                </div>

                <strong className="leader-points">
                  {player.coins} coins
                </strong>
              </div>
            ))}

            {players.length === 0 && (
              <p>No players added yet.</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

// STAT CARD
function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

// PLAYER TABLE
function PlayerTable({ players }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>RANK</th>
            <th>PLAYER</th>
            <th>GAMES</th>
            <th>TOTAL COINS</th>
          </tr>
        </thead>

        <tbody>
          {players.map((player, index) => (
            <tr key={player.id}>
              <td>#{index + 1}</td>
              <td>{player.name}</td>
              <td>{player.games}</td>
              <td>
                <strong>{player.coins}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
