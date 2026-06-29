const playersDiv = document.getElementById("players");

// 符号
const signs = [1, 1, 1, 1];

// ✅ ウマ設定
let uma = [20000, 10000, -10000, -20000]; // 点数ベース
let useUma = true;

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
        placeholder="点 (例:50000)" 
        id="score${i}">
    </div>
  `;

  playersDiv.appendChild(div);
  setSign(i, 1);
}

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

  for (let i = 0; i < 4; i++) {
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

  const base = tableCost / 4;
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
      ▶ ${rank}位 : ${payment} 円
    `;

    resultList.appendChild(li);
    totalPayment += payment;
  });

  document.getElementById("total").textContent =
    `合計：${totalPayment} 円`;
}
