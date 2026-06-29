const playersDiv = document.getElementById("players");

const signs = [1, 1, 1, 1];

// ✅ ウマ設定（デフォルト 10-20）
let uma = [20, 10, -10, -20];

// UI生成
for (let i = 0; i < 4; i++) {
  const div = document.createElement("div");
  div.className = "player";

  div.innerHTML = `
    <input type="text" placeholder="名前" id="name${i}">
    
    <div class="score-row">
      <button class="sign-btn" id="plus${i}" onclick="setSign(${i}, 1)">＋</button>
      <button class="sign-btn" id="minus${i}" onclick="setSign(${i}, -1)">−</button>
      <input 
        class="score-input" 
        type="number" 
        inputmode="numeric"
        placeholder="点 (例:50)" 
        id="score${i}">
    </div>
  `;

  playersDiv.appendChild(div);
  setSign(i, 1);
}

// ＋−色
function setSign(index, value) {
  signs[index] = value;

  const plusBtn = document.getElementById(`plus${index}`);
  const minusBtn = document.getElementById(`minus${index}`);

  plusBtn.style.background = "#ddd";
  minusBtn.style.background = "#ddd";
  plusBtn.style.color = "black";
  minusBtn.style.color = "black";

  if (value === 1) {
    plusBtn.style.background = "#4caf50";
    plusBtn.style.color = "white";
  } else {
    minusBtn.style.background = "#f44336";
    minusBtn.style.color = "white";
  }
}

// 計算
function calculate() {
  const tableCost = Number(document.getElementById("tableCost").value);
  const rate = Number(document.getElementById("rate").value);

  let players = [];

  for (let i = 0; i < 4; i++) {
    const name =
      document.getElementById(`name${i}`).value || `プレイヤー${i + 1}`;

    const inputScore = Number(document.getElementById(`score${i}`).value);

    if (isNaN(inputScore)) {
      alert("点数を入力して");
      return;
    }

    const score = inputScore * 1000 * signs[i];

    players.push({ name, score, index: i });
  }

  // ✅ 合計0チェック
  const totalScore = players.reduce((sum, p) => sum + p.score, 0);

  const resultList = document.getElementById("results");
  resultList.innerHTML = "";

  if (totalScore !== 0) {
    document.getElementById("total").textContent =
      "⚠ 点数の合計が0じゃない！";
    return;
  }

  // ✅ 順位
  const sorted = [...players].sort((a, b) => b.score - a.score);
  sorted.forEach((p, i) => {
    p.rank = i + 1;
  });

  const base = tableCost / 4;
  let totalPayment = 0;

  players.forEach((p) => {
    const rankData = sorted.find((s) => s.index === p.index);
    const rank = rankData.rank;

    const diff = p.score;
    const scoreAdjust = -(diff / 1000) * rate;

    // ✅ ウマ適用
    const umaAdjust = -(uma[rank - 1]) * rate;

    const payment = Math.round(base + scoreAdjust + umaAdjust);

    const displayScore = p.score / 1000;

    const color = p.score >= 0 ? "green" : "red";
    const crown = rank === 1 ? "👑" : "";

    const li = document.createElement("li");

    li.innerHTML = `
      <span style="color:${color}; font-weight:bold;">
        ${p.name}（${displayScore > 0 ? "+" : ""}${displayScore}）
      </span>
      ▶ ${crown} ${rank}位 
      （ウマ ${uma[rank - 1] > 0 ? "+" : ""}${uma[rank - 1]}）
      : ${payment} 円
    `;

    resultList.appendChild(li);
    totalPayment += payment;
  });

  document.getElementById("total").textContent =
    `合計：${totalPayment} 円`;
}
