const firebaseConfig = {
  apiKey: "AIzaSyC2xbt0mpcyKqlZXB5BY_wMvCLukdRS7eE",
  authDomain: "jyansou.firebaseapp.com",
  databaseURL: "https://jyansou-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jyansou"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

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

let lastResult = null;


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

  lastResult = [];

  // ✅ 計算
  players.forEach((p) => {
  const rank = sorted.find((s) => s.index === p.index).rank;

  const scoreAdjust = -(p.score / 1000) * rate;

  let umaAdjust = 0;
  if (useUma) {
    umaAdjust = -(uma[rank - 1] / 1000) * rate;
  }

  const payment = Math.round(base + scoreAdjust + umaAdjust);

  // ✅ ここ追加
  lastResult.push({
    name: p.name,
    score: p.score,
    rank: rank,
    payment: payment
  });

  // 表示はそのまま
  const className =
    rank === 1 ? "first" : p.score >= 0 ? "win" : "lose";

  const li = document.createElement("li");

  li.innerHTML = `
    <span class="${className}">
      ${p.name}（${p.score > 0 ? "+" : ""}${p.score}）
    </span>
    ▶ ${rank}位
    : ${payment} 円
  `;

  resultList.appendChild(li);
});
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

function saveResult() {
  if (!lastResult) {
    alert("先に計算して！");
    return;
  }

  const title = prompt("戦績タイトル入力");
  if (!title) return;

  const tableCost = Number(document.getElementById("tableCost").value);
  const rate = Number(document.getElementById("rate").value);

  const data = {
    title: title,
    date: new Date().toISOString(),
    tableCost: tableCost,
    rate: rate,
    playerCount: playerCount,
    useUma: useUma,
    uma: uma,
    players: lastResult
  };

  db.ref("mahjongResults").push(data)
    .then(() => alert("保存成功！"))
    .catch(() => alert("保存失敗"));
}

function loadHistory() {
  const historyList = document.getElementById("history");
  if (!historyList) return;
  historyList.innerHTML = "";

  db.ref("mahjongResults").once("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const stats = calcStats(data);
    showStats(stats);

    Object.values(data).reverse().forEach((item) => {
      const li = document.createElement("li");

      // ✅ タイトル部分
      const header = document.createElement("div");
      header.className = "history-header";
      header.textContent = `${item.title}（${new Date(item.date).toLocaleDateString()}）`;


      // ✅ 詳細部分
      const detail = document.createElement("div");
      detail.className = "history-detail";

      let html = `
        卓代: ${item.tableCost}円 /
        ${item.playerCount === 4 ? "四麻" : "三麻"} /
        レート: ${item.rate}円<br>
      `;

      if (item.useUma) {
        html += `ウマ: ${item.uma.join(", ")}<br>`;
      } else {
        html += "ウマ: 無<br>";
      }

      html += "<br>";

      item.players.forEach(p => {
        html += `
          ${p.name}
          (${p.score >= 0 ? "+" : ""}${p.score})
          ▶ ${p.rank}位
          : ${p.payment}円<br>
        `;
      });

      detail.innerHTML = html;

      // ✅ 最初は閉じる
      detail.style.display = "none";

      // ✅ クリックで開閉
      header.onclick = () => {
        detail.style.display =
          detail.style.display === "none" ? "block" : "none";
      };

      li.appendChild(header);
      li.appendChild(detail);
      historyList.appendChild(li);
    });
  });
}

function calcStats(data) {
  const stats = {};

  Object.values(data).forEach(game => {
    game.players.forEach(p => {
      if (!stats[p.name]) {
        stats[p.name] = {
          games: 0,
          wins: 0,
          totalRank: 0
        };
      }

      stats[p.name].games++;
      stats[p.name].totalRank += p.rank;

      if (p.rank === 1) {
        stats[p.name].wins++;
      }
    });
  });

  return stats;
}

function showStats(stats) {
  const container = document.getElementById("stats");
  if (!container) return;

  container.innerHTML = "<h2>成績</h2>";

  Object.entries(stats).forEach(([name, s]) => {
    const winRate = Math.round((s.wins / s.games) * 100);
    const avgRank = (s.totalRank / s.games).toFixed(2);

    const div = document.createElement("div");

    div.innerHTML = `
      <strong>${name}</strong><br>
      勝率: ${winRate}% (${s.wins}/${s.games})<br>
      平均順位: ${avgRank}
      <hr>
    `;

    container.appendChild(div);
  });
}

function loadStats() {
  const container = document.getElementById("stats");
  if (!container) return;

  container.innerHTML = "読み込み中...";

  db.ref("mahjongResults").once("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      container.innerHTML = "データなし";
      return;
    }

    const stats = {};

    Object.values(data).forEach(game => {
      game.players.forEach(p => {
        const name = p.name.trim();

        if (!stats[name]) {
          stats[name] = {
            games: 0,
            wins: 0,
            totalRank: 0,
            money: 0
          };
        }

        stats[name].games++;
        stats[name].totalRank += p.rank;
        stats[name].money += p.payment;

        if (p.rank === 1) stats[name].wins++;
      });
    });

    // ✅ 勝率順に並べる
    const sorted = Object.entries(stats).sort((a, b) => {
      const rateA = a[1].wins / a[1].games;
      const rateB = b[1].wins / b[1].games;
      return rateB - rateA;
    });

    container.innerHTML = "<h2>ランキング</h2>";

    sorted.forEach(([name, s]) => {
      const winRate = Math.round((s.wins / s.games) * 100);
      const avgRank = (s.totalRank / s.games).toFixed(2);

      const div = document.createElement("div");
      div.className = "stat-card";

      div.innerHTML = `
        <strong>${name}</strong><br>
        勝率: ${winRate}%（${s.wins}/${s.games}）<br>
        平均順位: ${avgRank}<br>
        支出: ${s.money}円
      `;

      container.appendChild(div);
    });
  });
}

function goStats() {
  location.href = "stats.html";
}


function goHome() {
  location.href = "index.html";
}


window.saveResult = saveResult;
