    if(rows.some(r=>!Number.isFinite(r.coins)||r.coins<0)){setSaving(false);setError("Enter a valid non-negative coin balance for every active player.");return;}
    const {error}=await supabase.from("daily_scores").upsert(rows,{onConflict:"player_id,score_date"});
    setSaving(false);
    if(error){setError(error.message);return;}
    setDraft({}); await loadData(); notify("Daily results saved successfully.");
    setAdminTab("results");
  }

  async function addPlayer(e) {
    e.preventDefault(); const name=newPlayer.trim(); if(!name)return;
    const {error}=await supabase.from("players").insert({display_name:name});
    if(error){setError(error.message);return;}
    setNewPlayer(""); await loadData(); notify("Player added.");
  }

  async function renamePlayer(id,name) {
    const {error}=await supabase.from("players").update({display_name:name}).eq("id",id);
    if(error){setError(error.message);return;}
    await loadData(); notify("Player name updated.");
  }

  async function archivePlayer(id) {
    if(!confirm("Remove this player from the active player list? Their historical results will remain saved."))return;
    const {error}=await supabase.from("players").update({active:false}).eq("id",id);
    if(error){setError(error.message);return;}
    await loadData(); notify("Player archived.");
  }

  async function signOut(){await supabase.auth.signOut();setPage("home");}

  if(!isConfigured)return <ConfigNotice/>;
  if(!authReady)return <div className="loading-screen"><Logo/><span className="spinner"/></div>;

  const activePlayer=players.find(p=>p.id===selectedPlayer);
  const playerScores=selectedPlayer?scores.filter(s=>s.player_id===selectedPlayer).sort((a,b)=>a.score_date.localeCompare(b.score_date)):[];
  const cutoff=new Date(); cutoff.setDate(cutoff.getDate()-(period==="7"?6:29)); cutoff.setHours(0,0,0,0);
  const visiblePlayerScores=period==="all"?playerScores:playerScores.filter(s=>new Date(`${s.score_date}T00:00:00`)>=cutoff);
  const playerBest=Math.max(0,...playerScores.map(s=>Number(s.coins)));
  const avg=playerScores.length?Math.round(playerScores.reduce((sum,s)=>sum+Number(s.coins),0)/playerScores.length):0;
  const rank=allTimeRanking.findIndex(p=>p.id===selectedPlayer)+1;
  const playerWins=allTimeRanking.find(p=>p.id===selectedPlayer)?.wins||0;

  return <div className="app-shell">
    <header className="topbar">
      <button className="icon-btn back-btn" onClick={()=>{setPage("home");setSelectedPlayer(null);}} aria-label="Home"><ArrowLeft/></button>
      <button className="brand-button" onClick={()=>{setPage("home");setSelectedPlayer(null);}}><Logo/></button>
      <div className="top-actions">
        {session ? <button className="icon-btn" title="Sign out" onClick={signOut}><LogOut/></button> : <button className="admin-link" onClick={()=>setPage("login")}><ShieldCheck size={16}/> Admin</button>}
        <button className="icon-btn mobile-toggle" onClick={()=>setMobileMenu(!mobileMenu)}><Menu/></button>
      </div>
    </header>

    {mobileMenu&&<div className="mobile-menu"><button onClick={()=>{setPage("home");setMobileMenu(false)}}>Home</button><button onClick={()=>{setPage("leaderboard");setMobileMenu(false)}}>Leaderboard</button>{session&&<button onClick={()=>{setPage("admin");setMobileMenu(false)}}>Admin dashboard</button>}</div>}

    {page==="login" && !session && <Login onLoggedIn={()=>setPage("admin")}/>}


    {page==="home" && <main className="content">
      <section className="hero">
        <div><div className="eyebrow">THE POKER CLUB</div><h1>Play sharp.<br/><span>Track everything.</span></h1><p>Your club's daily poker performance, all in one place.</p></div>
        <div className="hero-chip">♠</div>
      </section>
      <section className="section-head"><div><div className="eyebrow">LIVE CLUB STANDINGS</div><h2>Today's leaderboard</h2></div><button className="text-link" onClick={()=>setPage("leaderboard")}>View all <ChevronRight size={16}/></button></section>
      <div className="date-strip"><CalendarDays size={16}/><span>{dateLabel(today())}</span><span className="live-dot"/> <small>Daily rankings</small></div>
      {loading?<div className="panel loading-panel"><span className="spinner"/></div>:dayRanking.length? <div className="leaderboard-card">
        <div className="table-head"><span>RANK</span><span>PLAYER</span><span>COINS</span></div>
        {dayRanking.slice(0,10).map((s,i)=><button className={`rank-row ${i===0?"winner-row":""}`} key={s.id} onClick={()=>{setSelectedPlayer(s.player_id);setPage("profile")}}>
          <span className={`rank-num rank-${i+1}`}>{i===0?"♛":`#${i+1}`}</span><span className="player-cell"><span className="avatar">{(players.find(p=>p.id===s.player_id)?.display_name||"?").slice(0,1).toUpperCase()}</span><strong>{players.find(p=>p.id===s.player_id)?.display_name||"Player"}</strong>{i===0&&<span className="winner-tag">WINNER</span>}</span><strong className="coin-value">{fmt(s.coins)}</strong>
        </button>)}
      </div>:<div className="empty-state"><Trophy size={30}/><h3>No results published today</h3><p>Today's leaderboard will appear once the admin saves the final coin balances.</p></div>}
      <section className="section-head"><div><div className="eyebrow">CLUB OVERVIEW</div><h2>All-time standings</h2></div><button className="text-link" onClick={()=>setPage("leaderboard")}>Full rankings <ChevronRight size={16}/></button></section>
      <div className="mini-grid"><Stat label="Active players" value={players.length}/><Stat label="Days recorded" value={recordedDates.length}/><Stat label="Total entries" value={scores.length}/></div>
      <section className="section-head"><div><div className="eyebrow">PLAYER DIRECTORY</div><h2>Players</h2></div></section>
      <div className="player-grid">{players.map(p=><button key={p.id} className="player-tile" onClick={()=>{setSelectedPlayer(p.id);setPage("profile")}}><span className="avatar large">{p.display_name.slice(0,1).toUpperCase()}</span><strong>{p.display_name}</strong><small>View profile <ChevronRight size={13}/></small></button>)}</div>
      {session&&<button className="btn btn-primary admin-cta" onClick={()=>setPage("admin")}><LayoutDashboard size={17}/> Open Admin Dashboard</button>}
    </main>}

    {page==="leaderboard" && <main className="content">
      <div className="page-title"><div className="eyebrow">LIVINGROOM POKER RANKINGS</div><h1><Trophy className="title-icon"/> Leaderboards</h1><p>Daily results and all-time player standings.</p></div>
      <div className="panel">
        <div className="panel-heading"><h2>Daily leaderboard</h2><select value={selectedDate} onChange={e=>setSelectedDate(e.target.value)}>{recordedDates.map(d=><option key={d} value={d}>{dateLabel(d)}</option>)}</select></div>
        {dayRanking.length?dayRanking.map((s,i)=><div className="simple-rank" key={s.id}><span className={`rank-num rank-${i+1}`}>{i+1}</span><strong>{players.find(p=>p.id===s.player_id)?.display_name||"Player"}</strong><b>{fmt(s.coins)} <small>coins</small></b></div>):<p className="muted">No results recorded for this date.</p>}
      </div>
      <div className="panel"><div className="panel-heading"><h2>All-time performance</h2><span className="eyebrow">RANKED BY TOTAL COINS</span></div>
        {allTimeRanking.map((p,i)=><div className="simple-rank" key={p.id}><span className={`rank-num rank-${i+1}`}>{i+1}</span><strong>{p.display_name}</strong><b>{fmt(p.totalCoins)} <small>coins</small></b></div>)}
        <p className="footnote">Total coins are calculated by adding each player's recorded daily coin balances. Daily wins remain available separately on player profiles.</p>
      </div>
    </main>}

    {page==="profile" && activePlayer && <main className="content">
      <div className="profile-hero panel"><div className="avatar profile-avatar">{activePlayer.display_name.slice(0,1).toUpperCase()}</div><div className="profile-name"><div className="eyebrow">PLAYER PROFILE</div><h1>{activePlayer.display_name}</h1><p>Livingroom Poker club member</p></div></div>
      <div className="period-tabs">{[["7","7 days"],["30","30 days"],["all","All time"]].map(([v,l])=><button key={v} className={period===v?"active":""} onClick={()=>setPeriod(v)}>{l}</button>)}</div>
      <div className="stats-grid"><Stat label="Recorded days" value={visiblePlayerScores.length}/><Stat label="Total coins" value={fmt(allTimeRanking.find(p=>p.id===selectedPlayer)?.totalCoins||0)}/><Stat label="Highest balance" value={fmt(playerBest)}/><Stat label="Average balance" value={fmt(avg)}/><Stat label="Daily wins" value={playerWins}/><Stat label="All-time rank" value={rank?`#${rank}`:"—"}/></div>
      <div className="panel"><div className="panel-heading"><h2>Coin performance</h2><span className="eyebrow">{period==="all"?"ALL TIME":`${period} DAYS`}</span></div><LineChart data={visiblePlayerScores}/></div>
      <div className="panel"><h2>Daily results</h2>{[...visiblePlayerScores].reverse().map(s=><div className="simple-rank" key={s.id}><span className="date-mini">{new Date(`${s.score_date}T12:00:00`).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</span><strong>{dateLabel(s.score_date)}</strong><b>{fmt(s.coins)} <small>coins</small></b></div>)}</div>
    </main>}

    {page==="admin" && <main className="content admin-content">
      {!session?<div className="empty-state"><ShieldCheck size={32}/><h2>Admin access required</h2><p>Sign in with your Livingroom Poker administrator account to manage the club.</p><button className="btn btn-primary" onClick={()=>setPage("login")}>Admin sign in</button></div>:<>
        <div className="page-title"><div className="eyebrow">CONTROL ROOM</div><h1><LayoutDashboard className="title-icon"/> Admin Dashboard</h1><p>Manage your players and publish daily coin results.</p></div>
        <div className="admin-stats"><Stat label="Players" value={players.length}/><Stat label="Days saved" value={recordedDates.length}/><Stat label="Entries" value={scores.length}/></div>
        <div className="admin-tabs"><button className={adminTab==="entry"?"selected":""} onClick={()=>setAdminTab("entry")}><Save size={16}/> Enter coins</button><button className={adminTab==="results"?"selected":""} onClick={()=>setAdminTab("results")}><Trophy size={16}/> Results</button><button className={adminTab==="players"?"selected":""} onClick={()=>setAdminTab("players")}><Users size={16}/> Players</button></div>
        {error&&<div className="error-banner">{error}<button onClick={()=>setError("")}><X size={15}/></button></div>}
        {adminTab==="entry"&&<form className="panel form-panel" onSubmit={saveDay}>
          <div className="panel-heading"><div><div className="eyebrow">DAILY ENTRY</div><h2>Final coin balances</h2></div><span className="secure-label"><ShieldCheck size={14}/> Admin only</span></div>
          <label className="date-label">Game date<input type="date" value={selectedDate} onChange={e=>{setSelectedDate(e.target.value);setDraft({});}} required/></label>
          {players.length===0?<p className="muted">Add players first in the Players tab.</p>:players.map((p,i)=>{
            const existing=selectedDayScores.find(s=>s.player_id===p.id);
            return <label className="coin-entry" key={p.id}><span className="avatar">{p.display_name.slice(0,1).toUpperCase()}</span><span className="entry-name"><strong>{p.display_name}</strong><small>Player {i+1}</small></span><input type="number" min="0" step="1" placeholder="0" value={draft[p.id]??(existing?String(existing.coins):"")} onChange={e=>setDraft(d=>({...d,[p.id]:e.target.value}))} required/></label>;
          })}
          <div className="form-footer"><p>Enter the final coins each player has at the end of this day. Saving again updates that date's results.</p><button className="btn btn-primary" disabled={saving||players.length===0}>{saving?<RefreshCw className="spin" size={17}/>:<Save size={17}/>} {saving?"Saving…":"Save daily results"}</button></div>
        </form>}
        {adminTab==="results"&&<div className="panel"><div className="panel-heading"><h2>Saved daily results</h2><select value={selectedDate} onChange={e=>setSelectedDate(e.target.value)}>{recordedDates.map(d=><option key={d} value={d}>{dateLabel(d)}</option>)}</select></div>
          {!selectedDayScores.length?<div className="empty-inline">No results saved for this date.</div>:<><div className="winner-banner"><Crown/><div><small>DAILY WINNER</small><strong>{players.find(p=>p.id===dayRanking[0]?.player_id)?.display_name}</strong></div><b>{fmt(dayRanking[0]?.coins)} coins</b></div>{dayRanking.map((s,i)=><div className="simple-rank" key={s.id}><span className={`rank-num rank-${i+1}`}>{i+1}</span><strong>{players.find(p=>p.id===s.player_id)?.display_name}</strong><b>{fmt(s.coins)} <small>coins</small></b></div>)}</>}
        </div>}
        {adminTab==="players"&&<div className="panel"><div className="panel-heading"><h2>Manage players</h2><span className="eyebrow">{players.length} ACTIVE</span></div>
          <form className="add-player-form" onSubmit={addPlayer}><input value={newPlayer} onChange={e=>setNewPlayer(e.target.value)} placeholder="New player name" maxLength="40" required/><button className="btn btn-primary"><UserPlus size={16}/> Add player</button></form>
          {players.map(p=><div className="manage-player" key={p.id}><span className="avatar">{p.display_name.slice(0,1).toUpperCase()}</span><input defaultValue={p.display_name} key={`${p.id}-${p.display_name}`} onBlur={e=>{if(e.target.value.trim()&&e.target.value.trim()!==p.display_name)renamePlayer(p.id,e.target.value.trim())}}/><button className="icon-btn danger-icon" title="Archive player" onClick={()=>archivePlayer(p.id)}><X size={17}/></button></div>)}
          <p className="footnote">Archiving hides a player from new daily entries but preserves their historical scores.</p>
        </div>}
      </>}
    </main>}

    <footer className="bottom-nav">
      <button className={page==="home"?"nav-active":""} onClick={()=>{setPage("home");setSelectedPlayer(null)}}><LayoutDashboard/><span>Home</span></button>
      <button className={page==="leaderboard"?"nav-active":""} onClick={()=>setPage("leaderboard")}><Trophy/><span>Rankings</span></button>
      <button className={page==="admin"?"nav-active":""} onClick={()=>setPage(session?"admin":"login")}><ShieldCheck/><span>Admin</span></button>
    </footer>
