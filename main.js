const playersDiv = document.getElementById("players");

// ✅ ウマ設定
let uma = [20000, 10000, -10000, -20000]; // 点数ベース
let useUma = true;

// ＋−ボタン
function setSign(index, value) {
  signs[index] = value;

  const plusBtn = document.getElementById(`plus${index}`);
  const minusBtn = document.getElementById(`minus${index}`);

  plusBtn.classList.remove("plus-active");
  minusBtn.classList.remove("minus-active");

  if (value === 1) {
    plusBtn.classList.add("plus-active");
  } else {
    minusBtn.classList.add("minus-active");
  }
}


// ✅ ウマ切替
function toggleUma() {
  useUma = document.getElementById("useUma").checked;
}

// 計算
function calculate() {
  const tableCost = Number(document.getElementById("tableCost").value);
  const rate = Number(document.getElementById("rate").value);

  let players = [];

  for (let i = 0; i < playerCount; i++) {
    const name =
      document.getElementById(`name${i}`).value || `プレイヤー${i + 1}`;

    const inputScore = Number(document.getElementById(`score${i}`).value);

    if (isNaN(inputScore)) {
      alert("点数を入力して");
      return;
    }

    // ✅ そのまま点数使用
    const score = inputScore * signs[i];

    players.push({ name, score, index: i });
  }

  // 合計チェック
  const totalScore = players.reduce((sum, p) => sum + p.score, 0);

  const resultList = document.getElementById("results");
  resultList.innerHTML = "";

  if (totalScore !== 0) {
    document.getElementById("total").textContent =
      "⚠ 点数の合計が0じゃない！";
    return;
  }

  // 順位
  const sorted = [...players].sort((a, b) => b.score - a.score);
  sorted.forEach((p, i) => {
    p.rank = i + 1;
  });

  const base = tableCost / playerCount;
  let totalPayment = 0;

  players.forEach((p) => {
    const rankData = sorted.find((s) => s.index === p.index);
    const rank = rankData.rank;

    const diff = p.score;

    // ✅ スコア調整
    const scoreAdjust = -(diff / 1000) * rate;

    // ✅ ウマ調整（ONのときだけ）
    let umaAdjust = 0;
    if (useUma) {
      umaAdjust = -(uma[rank - 1] / 1000) * rate;
    }

    const payment = Math.round(base + scoreAdjust + umaAdjust);

    const color = p.score >= 0 ? "green" : "red";
    const crown = rank === 1 ? "👑" : "";

    const li = document.createElement("li");

    const className =
      rank === 1 ? "first" :
      p.score >= 0 ? "win" : "lose";

    li.innerHTML = `
      <span class="${className}">
        ${p.name}（${p.score > 0 ? "+" : ""}${p.score}）
      </span>
      ▶ ${rank}位
      ${useUma ? `（ウマ ${uma[rank - 1] > 0 ? "+" : ""}${uma[rank - 1]}）` : ""}
      : ${payment} 円
    `;

    resultList.appendChild(li);
    totalPayment += payment;
  });

  document.getElementById("total").textContent =
    `合計：${totalPayment} 円`;
}

let playerCount = 4;
const signs = [];

function createPlayers() {
  const playersDiv = document.getElementById("players");
  playersDiv.innerHTML = "";

  signs.length = 0;

  for (let i = 0; i < playerCount; i++) {
    signs.push(1);

    const div = document.createElement("div");
    div.className = "player";

    div.innerHTML = `
      <input type="text" placeholder="名前" id="name${i}">
      
      <div class="score-row">
        <button class="sign-btn" id="plus${i}" onclick="setSign(${i}, 1)">＋</button>
        <button class="sign-btn" id="minus${i}" onclick="setSign(${i}, -1)">−</button>
        <input type="number" placeholder="点" id="score${i}">
      </div>
    `;

    playersDiv.appendChild(div);

    setSign(i, 1);
  }
}

function setMode(n) {
  playerCount = n;

  document.getElementById("btn4").classList.remove("active");
  document.getElementById("btn3").classList.remove("active");

  document.getElementById(n === 4 ? "btn4" : "btn3").classList.add("active");

  if (playerCount === 3) {
    uma = [20000, 0, -20000];
  } else {
    uma = [20000, 10000, -10000, -20000];
  }

  createPlayers();
}

setMode(4);
