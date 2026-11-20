<div className="panel">
  <div className="panel-heading">
    <h2>All-time performance</h2>
    <span className="eyebrow">RANKED BY TOTAL COINS</span>
  </div>

  {allTimeRanking.map((p, i) => (
    <div className="simple-rank" key={p.id}>
      <span className={`rank-num rank-${i + 1}`}>
        {i + 1}
      </span>

      <strong>{p.display_name}</strong>

      <b>
        {fmt(p.totalCoins)}
        <small> coins</small>
      </b>
    </div>
  ))}

  <p className="footnote">
    Total coins are calculated by adding each player's recorded daily
    coin balances across all days. Rankings are sorted from highest
    to lowest total coins.
  </p>
</div>
