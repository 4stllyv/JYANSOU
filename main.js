const playersDiv = document.getElementById("players");

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
  const tableCostInput = document.getElementById("tableCost").value;
  const tableCost = Number(tableCostInput);
  const rate = Number(document.getElementById("rate").value);

  let players = [];

  // ✅ 卓代チェック（空欄対応）
  if (tableCostInput === "") {
    alert("卓代を入力して");
    return;
  }

  // ✅ プレイヤー入力チェック＋取得
  for (let i = 0; i < playerCount; i++) {
    const name = document.getElementById(`name${i}`).value.trim();
    const scoreInput = document.getElementById(`score${i}`).value;

    // 名前チェック
    if (!name) {
      alert(`${i + 1}人目の名前を入力して`);
      return;
    }

    // 点数チェック（空欄）
    if (scoreInput === "") {
      alert(`${i + 1}人目の点数を入力して`);
      return;
    }

    const inputScore = Number(scoreInput);
    const score = inputScore * signs[i];

    players.push({ name, score, index: i });
  }

  // ✅ 合計チェック
  const totalScore = players.reduce((sum, p) => sum + p.score, 0);

  const resultList = document.getElementById("results");
  resultList.innerHTML = "";

  if (totalScore !== 0) {
    document.getElementById("total").textContent =
      "⚠ 点数の合計が0じゃない！";
    return;
  }

  // ✅ ウマ取得（1回だけ）
  if (useUma) {
    uma = [];

    for (let i = 0; i < playerCount; i++) {
      const value = Number(document.getElementById(`uma${i}`).value);

      if (isNaN(value)) {
        alert("ウマを入力して");
        return;
      }

      uma.push(value);
    }
  }

  // ✅ 順位決定
  const sorted = [...players].sort((a, b) => b.score - a.score);
  sorted.forEach((p, i) => {
    p.rank = i + 1;
  });

  const base = tableCost / playerCount;
  let totalPayment = 0;

  // ✅ 計算
  players.forEach((p) => {
    const rank = sorted.find((s) => s.index === p.index).rank;

    const scoreAdjust = -(p.score / 1000) * rate;

    let umaAdjust = 0;
    if (useUma) {
      umaAdjust = -(uma[rank - 1] / 1000) * rate;
    }

    const payment = Math.round(base + scoreAdjust + umaAdjust);

    const className =
      rank === 1 ? "first" : p.score >= 0 ? "win" : "lose";

    const li = document.createElement("li");

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

  // ✅ ウマ全部0
  uma = Array(playerCount).fill("");

  for (let i = 0; i < 4; i++) {
    const input = document.getElementById(`uma${i}`);

    if (!input) continue;

    if (i < playerCount) {
      input.style.display = "block";
      input.value = uma[i];
    } else {
      input.style.display = "none";
    }
  }

  createPlayers();
}


setMode(4);
toggleUma();
