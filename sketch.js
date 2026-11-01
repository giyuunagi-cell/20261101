// 宣告十題中華職棒題庫，每局會從中隨機抽出六題。
const questionBank = [
  // 設定第一題的圖示、答案文字與提示說明。
  { iconType: 0, answer: "中華職棒元年是 1990 年", hint: "中華職棒在 1990 年正式開打。" },
  // 設定第二題的棒球場圖示、答案文字與提示說明。
  { iconType: 1, answer: "比賽每隊先發九人", hint: "棒球每隊同時有九位球員在場上守備。" },
  // 設定第三題的圖示、答案文字與提示說明。
  { iconType: 2, answer: "統一獅主場在臺南", hint: "統一獅是臺南的重要職業球隊。" },
  // 設定第四題的猴子圖示、答案文字與提示說明。
  { iconType: 3, answer: "樂天桃猿主場在桃園", hint: "樂天桃猿的主場是樂天桃園棒球場。" },
  // 設定第五題的圖示、答案文字與提示說明。
  { iconType: 4, answer: "味全龍主場在天母", hint: "味全龍經常在臺北市天母棒球場出賽。" },
  // 設定第六題的圖示、答案文字與提示說明。
  { iconType: 5, answer: "臺鋼雄鷹主場在澄清湖", hint: "臺鋼雄鷹的主場是高雄澄清湖棒球場。" },
  // 設定第七題的球隊徽章圖示、答案文字與提示說明。
  { iconType: 6, answer: "中華職棒目前有六支一軍球隊", hint: "目前中華職棒一軍共有六支球隊競逐賽季。" },
  // 設定第八題的記分板圖示、答案文字與提示說明。
  { iconType: 7, answer: "棒球比賽由九局組成", hint: "正式棒球比賽通常進行九局。" },
  // 設定第九題的球帽圖示、答案文字與提示說明。
  { iconType: 8, answer: "統一獅成立於 1990 年", hint: "統一獅是中華職棒元年成立的球隊之一。" },
  // 設定第十題的外野手圖示、答案文字與提示說明。
  { iconType: 9, answer: "外野手負責守備外野區域", hint: "外野手主要負責防守左外野、中外野或右外野。" }
];

// 宣告本局實際抽出的六題。
let questions = [];
// 宣告拖曳中的選項、放置結果與介面狀態。
let cards = [];
// 宣告六個上方的固定答案位置。
let targets = [];
// 宣告目前正在拖曳的文字卡片。
let draggingCard = null;
// 宣告拖曳前卡片所在的題目位置，放置失敗時可恢復原位。
let dragOriginTargetIndex = null;
// 宣告滑鼠或手指相對於卡片左上角的偏移量。
let dragOffsetX = 0;
// 宣告滑鼠或手指相對於卡片左上角的偏移量。
let dragOffsetY = 0;
// 宣告遊戲是否已經交卷。
let submitted = false;
// 宣告成績視窗是否正在顯示。
let showResult = false;
// 宣告彩帶粒子陣列。
let confetti = [];
// 宣告畫布縮放時使用的版面尺寸。
let layout = {};
// 宣告按鈕的互動區域。
let submitButton = {};
// 宣告重新開始按鈕的互動區域。
let resetButton = {};
// 宣告目前使用的中文語音，避免每次點擊都重新搜尋語音。
let chineseVoice = null;
// 宣告是否已經按下開始作答按鈕。
let gameStarted = false;
// 宣告開始作答按鈕的互動區域。
let startButton = {};
// 記錄上一局文字選項的順序，避免重新遊玩時完全相同。
let previousCardOrder = null;
// 記錄上一局抽出的題目組合，避免重玩時六題完全相同。
let previousQuestionSet = null;
// 宣告由 p5.js 預先載入的完整繁體中文字型。
let notoSansTCFont;
// 宣告由 p5.js 預先載入的展示英數字型。
let rocknRollFont;

// 在建立畫布前預先載入 Noto Sans TC，避免繁體中文缺字。
function preload() {
  // 載入專案內的完整繁體中文字型檔。
  notoSansTCFont = loadFont("fonts/NotoSansTC-Regular.ttf");
  // 載入專案內的 RocknRoll One 字型檔。
  rocknRollFont = loadFont("fonts/RocknRollOne.ttf");
}

// 建立全螢幕畫布並初始化遊戲。
function setup() {
  // 建立符合瀏覽器視窗大小的畫布。
  createCanvas(windowWidth, windowHeight);
  // 將 p5.js 文字設定為已完成載入的 Noto Sans TC。
  textFont(notoSansTCFont);
  // 載入瀏覽器可用的中文語音。
  loadChineseVoice();
  // 部分瀏覽器會延遲提供語音清單，因此在清單更新後再次載入。
  if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = loadChineseVoice;
  // 初始化所有卡片的位置與狀態。
  resetGame();
  // 初次載入時先顯示開始作答畫面。
  gameStarted = false;
}

// 每一幀重新計算版面並繪製遊戲畫面。
function draw() {
  // 根據視窗大小計算響應式版面。
  calculateLayout();
  // 繪製深色漸層感背景與裝飾。
  drawBackground();
  // 尚未開始時只顯示開始畫面，不顯示題目內容。
  if (!gameStarted) {
    drawStartScreen();
    return;
  }
  // 繪製標題、說明與目前進度。
  drawHeader();
  // 繪製上方固定的六個動畫圖示。
  drawTargets();
  // 繪製下方可拖曳的六個文字選項。
  drawCards();
  // 繪製交卷或結果按鈕。
  drawButtons();
  // 在高分時持續繪製彩帶動畫。
  drawConfetti();
  // 在交卷後顯示成績結果視窗。
  drawResultModal();
}

// 根據目前畫布大小建立桌面與手機共用的版面座標。
function calculateLayout() {
  // 取出畫布較短的一邊，讓手機版元件不會超出畫面。
  const shortSide = min(width, height);
  // 計算左右邊界，手機至少保留十二像素的安全距離。
  const margin = max(12, min(48, width * 0.045));
  // 計算六欄在目前畫面可以使用的寬度。
  const gap = width < 650 ? 8 : 14;
  // 計算每個卡片的寬度。
  const cardWidth = (width - margin * 2 - gap * 5) / 6;
  // 在手機上將六個選項改成兩欄排列。
  const columns = width < 650 ? 2 : 6;
  // 計算手機版的卡片寬度。
  const mobileCardWidth = (width - margin * 2 - gap) / 2;
  // 依照手機高度縮放圖示區，避免小螢幕上下區塊重疊。
  const mobileTargetHeight = constrain(height * 0.105, 58, 82);
  // 設定手機版題目圖示的起始位置，避開上方標題與進度文字。
  const targetTop = width < 650 ? 105 : (height < 620 ? 112 : 145);
  // 計算手機版文字卡片可使用的高度，確保底部按鈕仍有空間。
  const mobileCardsTop = targetTop + mobileTargetHeight * 3 + gap * 2 + 16;
  const mobileCardHeight = constrain((height - mobileCardsTop - 78 - gap * 2) / 3, 42, 58);
  // 計算卡片高度並限制在可讀的範圍內。
  const cardHeight = width < 650 ? mobileCardHeight : constrain(height * 0.09, 62, 84);
  // 設定標題區與上方圖示區的位置。
  layout = {
    margin: margin,
    gap: gap,
    columns: columns,
    targetTop: targetTop
    targetHeight: width < 650 ? mobileTargetHeight : 118,
    cardWidth: width < 650 ? mobileCardWidth : cardWidth,
    cardHeight: cardHeight,
    // 將文字選項放在三排題目圖示下方，並保留清楚間距。
    cardsTop: width < 620 ? mobileCardsTop : height * 0.64
  };

  // 計算交卷按鈕的互動範圍。
  submitButton = { x: width - margin - 148, y: height - 58, w: 148, h: 42 };
  // 計算重新開始按鈕的互動範圍。
  resetButton = { x: margin, y: height - 58, w: 120, h: 42 };
  // 計算開始作答按鈕的互動範圍。
  startButton = {
    x: (width - min(width - 40, 260)) / 2,
    y: height / 2 + 38,
    w: min(width - 40, 260),
    h: 54
  };
}

// 繪製作答前的開始畫面。
function drawStartScreen() {
  // 繪製深色半透明遮罩，讓開始畫面更加集中。
  fill(202, 240, 248, 245);
  rect(0, 0, width, height);
  // 設定文字置中。
  textAlign(CENTER, CENTER);
  // 繪製棒球裝飾圖示。
  textSize(width < 650 ? 56 : 76);
  text("⚾", width / 2, height / 2 - 135 + sin(frameCount * 0.05) * 8);
  // 繪製開始畫面主標題。
  fill("#000000");
  textStyle(BOLD);
  textSize(width < 650 ? 27 : 38);
  // 使用 RocknRoll One 顯示英文字母，營造醒目標題層次。
  textFont(rocknRollFont);
  const displayTitle = "CPBL";
  const displayTitleWidth = textWidth(displayTitle);
  // 使用 Noto Sans TC 顯示繁體中文，避免中文缺字。
  textFont(notoSansTCFont);
  const chineseTitle = " 棒球知識挑戰";
  const chineseTitleWidth = textWidth(chineseTitle);
  const titleStartX = (width - displayTitleWidth - chineseTitleWidth) / 2;
  textAlign(LEFT, CENTER);
  textFont(rocknRollFont);
  text(displayTitle, titleStartX, height / 2 - 62);
  textFont(notoSansTCFont);
  text(chineseTitle, titleStartX + displayTitleWidth, height / 2 - 62);
  textAlign(CENTER, CENTER);
  // 繪製開始畫面說明。
  fill("#000000");
  textStyle(NORMAL);
  textSize(width < 650 ? 14 : 17);
  text("準備好測試你的中華職棒知識了嗎？", width / 2, height / 2 - 18);
  text("把六張知識卡拖到正確的圖示下方吧！", width / 2, height / 2 + 8);
  // 繪製開始作答按鈕。
  fill("#ffb07c");
  stroke("#ffc15b");
  strokeWeight(2);
  rect(startButton.x, startButton.y, startButton.w, startButton.h, 14);
  // 繪製按鈕文字。
  noStroke();
  fill("#000000");
  textStyle(BOLD);
  textSize(width < 650 ? 18 : 20);
  text("開始作答", width / 2, startButton.y + startButton.h / 2);
  // 恢復一般文字樣式。
  textStyle(NORMAL);
}

// 初始化或重新初始化所有遊戲資料。
function resetGame() {
  // 清空原本的拖曳卡片。
  cards = [];
  // 清空原本的答案位置。
  targets = [];
  // 從十題題庫中抽出六題，並避免與上一局完全相同。
  questions = chooseQuestionsForRound();
  // 將遊戲狀態恢復為尚未交卷。
  submitted = false;
  // 關閉成績視窗。
  showResult = false;
  // 清除彩帶粒子。
  confetti = [];
  // 依照本局六題建立固定答案位置。
  for (let i = 0; i < questions.length; i += 1) {
    // 建立一個尚未配對的答案位置。
    targets.push({ index: i, cardId: null, pulse: 0 });
    // 建立一張可拖曳文字卡片，並先打亂其題目編號。
    cards.push({ id: i, questionIndex: i, targetIndex: null, x: 0, y: 0, homeX: 0, homeY: 0, placed: false });
  }
  // 以 Fisher-Yates 方法打亂文字選項的順序。
  shuffleCards();
}

// 從十題題庫隨機抽取六題，並避免連續兩局題目組合完全相同。
function chooseQuestionsForRound() {
  // 宣告本次抽題結果。
  let selectedQuestions = [];
  // 最多嘗試二十次，避免與上一局題目組合相同。
  for (let attempt = 0; attempt < 20; attempt += 1) {
    // 複製題庫索引，避免改動原始題庫。
    const availableIndexes = questionBank.map((question, index) => index);
    // 建立本次抽出的題目陣列。
    selectedQuestions = [];
    // 隨機抽取六個不同題目。
    for (let i = 0; i < 6; i += 1) {
      // 從剩餘索引中隨機取出一題。
      const randomPosition = floor(random(availableIndexes.length));
      const bankIndex = availableIndexes.splice(randomPosition, 1)[0];
      // 複製題目並記錄它在題庫中的索引。
      selectedQuestions.push({ ...questionBank[bankIndex], bankIndex: bankIndex });
    }
    // 依照題庫索引排序後比較題目組合，不受抽取順序影響。
    const currentSet = selectedQuestions
      .map((question) => question.bankIndex)
      .sort((a, b) => a - b);
    // 第一次遊玩沒有上一局，或本次組合不同時即可採用。
    const sameSet = previousQuestionSet !== null
      && currentSet.every((bankIndex, index) => bankIndex === previousQuestionSet[index]);
    if (!sameSet) {
      // 記錄本局題目組合。
      previousQuestionSet = currentSet;
      return selectedQuestions;
    }
  }
  // 若隨機嘗試仍相同，強制替換一題，確保本局組合一定不同。
  const replacementIndex = questionBank.findIndex(
    (question, index) => !previousQuestionSet.includes(index)
  );
  if (replacementIndex >= 0) {
    selectedQuestions[0] = { ...questionBank[replacementIndex], bankIndex: replacementIndex };
  }
  // 記錄替換後的新題目組合。
  previousQuestionSet = selectedQuestions
    .map((question) => question.bankIndex)
    .sort((a, b) => a - b);
  return selectedQuestions;
}

// 將六張文字卡片隨機排列，避免每次答案都在固定位置。
function shuffleCards() {
  // 最多重新洗牌多次，直到新順序和上一局不同。
  let attempts = 0;
  let sameAsPrevious = true;
  while (sameAsPrevious && attempts < 20) {
    // 從最後一張卡片向前交換。
    for (let i = cards.length - 1; i > 0; i -= 1) {
      // 取得目前範圍內的隨機索引。
      const j = floor(random(i + 1));
      // 交換兩張卡片。
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    // 取得本次洗牌後的題目編號順序。
    const currentOrder = cards.map((card) => card.questionIndex);
    // 第一次遊玩沒有上一局，因此可以直接採用。
    sameAsPrevious = previousCardOrder !== null
      && currentOrder.every((questionIndex, index) => questionIndex === previousCardOrder[index]);
    // 記錄洗牌嘗試次數。
    attempts += 1;
  }
  // 保存本局順序，供下一次重新作答比較。
  previousCardOrder = cards.map((card) => card.questionIndex);
}

// 繪製背景色、網格與裝飾圓點。
function drawBackground() {
  // 使用指定的淺藍色作為測驗主背景。
  background("#caf0f8");
  // 設定適合淺色背景的淡藍色網格線條。
  stroke(32, 96, 128, 22);
  // 繪製垂直裝飾線。
  for (let x = 0; x < width; x += 42) line(x, 0, x, height);
  // 繪製水平裝飾線。
  for (let y = 0; y < height; y += 42) line(0, y, width, y);
  // 關閉線條以準備繪製裝飾圓點。
  noStroke();
  // 繪製右上角的淡橘色光暈。
  fill(255, 123, 61, 35);
  circle(width - 30, 30, 180 + sin(frameCount * 0.02) * 20);
}

// 繪製標題、操作說明與完成進度。
function drawHeader() {
  // 設定標題文字的置中對齊。
  textAlign(CENTER, CENTER);
  // 設定標題大小與粗體效果。
  textSize(width < 650 ? 23 : 32);
  textStyle(BOLD);
  // 使用白色繪製主標題。
  fill("#000000");
  // 使用 RocknRoll One 顯示 CPBL，使用 Noto Sans TC 顯示中文標題。
  textFont(rocknRollFont);
  const cpblTitle = "CPBL";
  const cpblTitleWidth = textWidth(cpblTitle);
  textFont(notoSansTCFont);
  const chineseHeader = " 棒球知識拖曳挑戰";
  const chineseHeaderWidth = textWidth(chineseHeader);
  const headerStartX = (width - cpblTitleWidth - chineseHeaderWidth) / 2;
  textAlign(LEFT, CENTER);
  textFont(rocknRollFont);
  text(cpblTitle, headerStartX, 35);
  textFont(notoSansTCFont);
  text(chineseHeader, headerStartX + cpblTitleWidth, 35);
  textAlign(CENTER, CENTER);
  // 設定副標題的大小。
  textSize(width < 650 ? 12 : 15);
  textStyle(NORMAL);
  // 繪製操作說明。
  fill("#000000");
  text("把下方的知識卡，拖曳到上方正確的 GIF 風格圖示下方", width / 2, 69);
  // 計算已經放置的卡片數量。
  const placedCount = cards.filter((card) => card.placed).length;
  // 顯示目前完成進度。
  fill("#000000");
  text(`已完成 ${placedCount} / 6 題`, width / 2, 96);
}

// 繪製上方六個固定的動畫式圖示位置。
function drawTargets() {
  // 計算每個答案位置的欄數。
  for (let i = 0; i < targets.length; i += 1) {
    // 取得目前答案位置。
    const target = targets[i];
    // 計算在手機或桌面版的欄列位置。
    const col = layout.columns === 2 ? i % 2 : i;
    const row = layout.columns === 2 ? floor(i / 2) : 0;
    // 計算答案位置的左上角座標。
    const x = layout.margin + col * (layout.cardWidth + layout.gap);
    const y = layout.targetTop + row * (layout.targetHeight + 12);
    // 儲存答案位置，供拖曳判定使用。
    target.x = x;
    target.y = y;
    target.w = layout.cardWidth;
    target.h = layout.targetHeight;
    // 畫出半透明的答案框。
    // 交卷後將錯誤放置的位置標示為紅色，正確位置維持綠色。
    const placedCard = cards.find((card) => card.id === target.cardId);
    // 作答中答錯時使用黃色提醒，交卷後再改用紅色表示錯誤。
    const targetIsWrong = placedCard && placedCard.targetIndex !== placedCard.questionIndex;
    const targetWrongFill = submitted ? "#633b45" : "#fff3a3";
    const targetWrongStroke = submitted ? "#ff7b7b" : "#e0a800";
    fill(target.cardId === null ? "#d9f3f8" : (targetIsWrong ? targetWrongFill : "#b8eadb"));
    stroke(target.cardId === null ? "#2d6798" : (targetIsWrong ? targetWrongStroke : "#53d6ad"));
    strokeWeight(2);
    rect(x, y, target.w, target.h, 14);
    // 繪製會隨時間變化的圖示光圈。
    noStroke();
    fill(255, 196, 74, 30);
    circle(x + target.w / 2, y + target.h * 0.43, 47 + sin(frameCount * 0.08 + i) * 7);
    // 依照不同題目設定不同的動畫節奏，讓六個圖示各有特色。
    const animationTime = frameCount * (0.045 + i * 0.006) + i * 1.7;
    const iconX = x + target.w / 2 + sin(animationTime) * (i % 2 === 0 ? 3 : 6);
    const iconY = y + target.h * 0.39 + cos(animationTime * 1.35) * (5 + (i % 3) * 2);
    const iconAngle = i % 3 === 0 ? sin(animationTime) * 0.12 : (i % 3 === 1 ? sin(animationTime) * 0.22 : 0);
    const iconScale = 1 + sin(animationTime * 1.6) * 0.08;
    // 使用獨立繪圖狀態，避免圖示動畫影響其他介面元件。
    push();
    // 將座標移到圖示中心。
    translate(iconX, iconY);
    // 讓部分圖示左右搖擺或旋轉。
    rotate(iconAngle);
    // 讓圖示產生輕微的呼吸放大效果。
    scale(iconScale);
    // 繪製不依賴字型的向量圖示，避免 emoji 缺字造成圖片消失。
    drawTargetIcon(questions[i].iconType, width < 650 ? 29 : 38);
    // 還原圖示專用的繪圖狀態。
    pop();
    // 顯示題目編號，協助使用者辨認位置。
    textSize(11);
    fill("#000000");
    text(`第 ${i + 1} 題`, x + target.w / 2, y + target.h - 14);
  }
}

// 使用 p5.js 圖形繪製六個固定可顯示的題目圖示。
function drawTargetIcon(iconIndex, iconSize) {
  // 將圖示大小標準化，讓不同螢幕的圖示比例一致。
  const unit = iconSize / 38;
  // 使用獨立繪圖狀態，避免圖示樣式影響其他畫面。
  push();
  // 將圖示依照標準尺寸縮放。
  scale(unit);
  // 讓線條圓滑並設定共同線條寬度。
  strokeCap(ROUND);
  strokeJoin(ROUND);
  strokeWeight(3);
  // 依照題目編號繪製不同的棒球主題圖示。
  if (iconIndex === 0) {
    // 繪製清楚的中華職棒元年成立紀念徽章。
    fill("#fff4c2");
    stroke("#9a6511");
    strokeWeight(2.5);
    circle(0, 0, 34);
    // 繪製徽章中央的獎盃。
    fill("#ffd166");
    stroke("#9a6511");
    rect(-7, -11, 14, 11, 2);
    line(-7, -8, -13, -8);
    line(-13, -8, -13, -1);
    line(7, -8, 13, -8);
    line(13, -8, 13, -1);
    line(-5, 3, 5, 3);
    line(0, 0, 0, 8);
    rect(-7, 8, 14, 3, 1);
    // 顯示 CPBL 與成立年份，直接對應題目答案。
    fill("#8c3d2b");
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(6);
    text("CPBL", 0, -16);
    text("1990", 0, 15);
  } else if (iconIndex === 1) {
    // 繪製清楚的九人守備陣容圖，直接呼應每隊先發九人。
    fill("#3a9d5d");
    stroke("#1d5c3a");
    strokeWeight(2.5);
    // 繪製棒球場外框。
    ellipse(0, 1, 34, 28);
    // 繪製棕色內野菱形。
    fill("#b97845");
    stroke("#754522");
    beginShape();
    vertex(0, -10);
    vertex(11, 1);
    vertex(0, 12);
    vertex(-11, 1);
    endShape(CLOSE);
    // 繪製九個代表先發球員的白色圓點。
    fill("#ffffff");
    stroke("#203040");
    strokeWeight(1);
    const playerPositions = [
      [-12, -9], [0, -13], [12, -9],
      [-14, 1], [-7, 3], [0, 1], [7, 3], [14, 1],
      [0, 12]
    ];
    for (let playerIndex = 0; playerIndex < playerPositions.length; playerIndex += 1) {
      // 繪製每一位先發球員的頭像。
      circle(playerPositions[playerIndex][0], playerPositions[playerIndex][1], 5);
    }
    // 以黃色標出投手位置。
    fill("#ffd166");
    circle(0, 1, 5);
    // 繪製本題的數量標示。
    fill("#203040");
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(7);
    text("9 PLAYERS", 0, 18);
  } else if (iconIndex === 2) {
    // 繪製帶有鬃毛、耳朵與鬍鬚的獅子。
    fill("#d9822b");
    stroke("#7a431d");
    strokeWeight(2.5);
    // 使用尖角鬃毛輪廓呈現獅子特徵。
    beginShape();
    for (let angle = -HALF_PI; angle < TWO_PI - HALF_PI; angle += PI / 6) {
      const radius = angle % (PI / 3) === 0 ? 18 : 14;
      vertex(cos(angle) * radius, sin(angle) * radius);
    }
    endShape(CLOSE);
    // 繪製獅子臉部。
    fill("#f6c77b");
    ellipse(0, 1, 23, 24);
    // 繪製耳朵。
    fill("#d9822b");
    circle(-9, -10, 8);
    circle(9, -10, 8);
    // 繪製眼睛、鼻子與嘴巴。
    fill("#263238");
    circle(-5, -3, 3.5);
    circle(5, -3, 3.5);
    fill("#5c3424");
    triangle(0, 2, -3, 5, 3, 5);
    noFill();
    line(0, 5, 0, 8);
    arc(-3, 7, 6, 5, 0, HALF_PI);
    arc(3, 7, 6, 5, HALF_PI, PI);
    // 繪製兩側鬍鬚。
    line(-7, 5, -15, 3);
    line(-7, 8, -15, 9);
    line(7, 5, 15, 3);
    line(7, 8, 15, 9);
  } else if (iconIndex === 3) {
    // 繪製清楚的猴子臉部與圓耳朵。
    fill("#8d5a3b");
    stroke("#4d3025");
    circle(0, 0, 29);
    // 繪製猴子的雙耳。
    fill("#b87955");
    circle(-15, -3, 12);
    circle(15, -3, 12);
    // 繪製猴子的臉部與嘴巴區域。
    fill("#e8b58c");
    ellipse(0, 3, 21, 20);
    // 繪製猴子的眼睛。
    fill("#263238");
    circle(-5, -4, 3.5);
    circle(5, -4, 3.5);
    // 繪製猴子的鼻子與微笑嘴型。
    fill("#5b3528");
    ellipse(0, 2, 5, 4);
    noFill();
    arc(0, 5, 10, 7, 0, PI);
  } else if (iconIndex === 4) {
    // 繪製具有角、鬍鬚與尖牙的東方龍頭。
    fill("#43aa8b");
    stroke("#1d6657");
    strokeWeight(2.5);
    ellipse(0, 2, 29, 24);
    // 繪製龍角。
    fill("#f4d35e");
    stroke("#9c7520");
    triangle(-10, -9, -14, -19, -4, -12);
    triangle(10, -9, 14, -19, 4, -12);
    // 繪製龍眉與眼睛。
    fill("#f4d35e");
    stroke("#9c7520");
    arc(-6, -5, 9, 5, PI, TWO_PI);
    arc(6, -5, 9, 5, PI, TWO_PI);
    fill("#ffffff");
    stroke("#1d6657");
    circle(-6, -3, 8);
    circle(6, -3, 8);
    fill("#263238");
    noStroke();
    circle(-6, -3, 3);
    circle(6, -3, 3);
    // 繪製龍鼻、鬍鬚與張開的嘴巴。
    fill("#ef6f6c");
    ellipse(0, 4, 8, 5);
    stroke("#1d6657");
    line(-4, 8, -13, 13);
    line(4, 8, 13, 13);
    fill("#ffffff");
    triangle(-7, 8, -3, 8, -5, 14);
    triangle(7, 8, 3, 8, 5, 14);
  } else if (iconIndex === 5) {
    // 繪製具有銳利喙部與展開翅膀的老鷹。
    fill("#6c757d");
    stroke("#263238");
    strokeWeight(2.5);
    // 繪製老鷹頭部。
    ellipse(0, -2, 22, 27);
    // 繪製左右展開的翅膀。
    fill("#495057");
    beginShape();
    vertex(-8, 6);
    vertex(-22, -9);
    vertex(-13, -7);
    vertex(-18, -17);
    vertex(-5, -9);
    vertex(0, 2);
    endShape(CLOSE);
    beginShape();
    vertex(8, 6);
    vertex(22, -9);
    vertex(13, -7);
    vertex(18, -17);
    vertex(5, -9);
    vertex(0, 2);
    endShape(CLOSE);
    // 繪製白色頭部、眼睛與黃色喙。
    fill("#f1f3f5");
    noStroke();
    ellipse(0, -4, 16, 19);
    fill("#263238");
    circle(-4, -7, 3);
    circle(4, -7, 3);
    fill("#f4a261");
    stroke("#9c5425");
    triangle(0, -1, -8, 3, 8, 3);
  } else if (iconIndex === 6) {
    // 繪製六支球隊並列的徽章圖示，直接呼應六支一軍球隊。
    const teamColors = ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#9b5de5", "#f3722c"];
    // 以兩排三個徽章呈現六支球隊。
    for (let teamIndex = 0; teamIndex < 6; teamIndex += 1) {
      // 計算每個球隊徽章的位置。
      const teamX = -11 + (teamIndex % 3) * 11;
      const teamY = -8 + floor(teamIndex / 3) * 14;
      // 繪製徽章外框與不同球隊顏色。
      fill(teamColors[teamIndex]);
      stroke("#263238");
      strokeWeight(1.5);
      circle(teamX, teamY, 10);
      // 繪製每個徽章內的白色球棒標記。
      fill("#ffffff");
      noStroke();
      rect(teamX - 3, teamY - 1, 6, 2, 1);
      rect(teamX - 1, teamY - 3, 2, 6, 1);
    }
    // 在下方加入清楚的隊伍數量文字。
    fill("#24527a");
    textAlign(CENTER, CENTER);
    textSize(7);
    text("6 TEAMS", 0, 14);
  } else if (iconIndex === 7) {
    // 繪製顯示九局比賽的記分板。
    fill("#263238");
    stroke("#111820");
    rect(-18, -14, 36, 28, 4);
    fill("#ffca3a");
    noStroke();
    rect(-13, -9, 26, 5, 1);
    fill("#ffffff");
    textAlign(CENTER, CENTER);
    textSize(13);
    text("9", 0, 4);
    fill("#8ecae6");
    rect(-12, 12, 8, 2);
    rect(4, 12, 8, 2);
  } else if (iconIndex === 8) {
    // 繪製代表成立年份的獅隊紀念牌。
    fill("#f7f3e3");
    stroke("#8c3d2b");
    strokeWeight(2.5);
    rect(-18, -17, 36, 34, 4);
    // 繪製紀念牌上方的紅色標題列。
    fill("#ef8354");
    noStroke();
    rect(-18, -17, 36, 9, 4);
    // 繪製簡化獅子臉，讓球隊識別更清楚。
    fill("#d9822b");
    stroke("#7a431d");
    strokeWeight(1.5);
    circle(0, -4, 13);
    // 繪製獅子的雙耳。
    circle(-5, -10, 4);
    circle(5, -10, 4);
    // 繪製獅子的眼睛與鼻子。
    fill("#263238");
    noStroke();
    circle(-2.5, -5, 1.8);
    circle(2.5, -5, 1.8);
    fill("#5c3424");
    triangle(0, -2, -2, 0, 2, 0);
    // 顯示成立年份 1990，直接強化題目提示。
    fill("#8c3d2b");
    textAlign(CENTER, CENTER);
    textSize(8);
    text("1990", 0, 10);
  } else {
    // 繪製站在外野草地上的外野手。
    fill("#3a9d5d");
    stroke("#1d5c3a");
    arc(0, 12, 38, 18, PI, TWO_PI);
    fill("#f1c27d");
    stroke("#7a4d2a");
    circle(0, -8, 12);
    fill("#2d4059");
    stroke("#172536");
    arc(0, -11, 15, 10, PI, TWO_PI);
    rect(-8, 1, 16, 16, 4);
    fill("#ffd166");
    circle(14, 3, 7);
  }
  // 還原圖示的繪圖狀態。
  pop();
}

// 繪製下方六個可拖曳的文字卡片。
function drawCards() {
  // 逐一繪製所有文字卡片。
  for (let i = 0; i < cards.length; i += 1) {
    // 取得目前卡片。
    const card = cards[i];
    // 計算卡片在手機或桌面版的欄列位置。
    const col = layout.columns === 2 ? i % 2 : i;
    const row = layout.columns === 2 ? floor(i / 2) : 0;
    // 設定卡片預設位置。
    const homeX = layout.margin + col * (layout.cardWidth + layout.gap);
    const homeY = layout.cardsTop + row * (layout.cardHeight + 12);
    // 首次繪製時記錄卡片的原始位置。
    if (!card.placed && card !== draggingCard) {
      card.homeX = homeX;
      card.homeY = homeY;
      card.x = homeX;
      card.y = homeY;
    }
    // 正在拖曳時使用目前座標，否則使用原始座標或答案位置。
    const x = card.x;
    const y = card.y;
    // 交卷後將答錯卡片標示為紅色，正確卡片標示為綠色。
    // 作答中答錯的卡片使用黃色，交卷後改用紅色強調錯誤。
    const cardIsWrong = card.placed && card.targetIndex !== card.questionIndex;
    const cardWrongFill = submitted ? "#633b45" : "#fff3a3";
    const cardWrongStroke = submitted ? "#ff7b7b" : "#e0a800";
    fill(card.placed ? (cardIsWrong ? cardWrongFill : "#b8eadb") : "#ffd0a8");
    stroke(card.placed ? (cardIsWrong ? cardWrongStroke : "#61e3bb") : "#ffc15b");
    strokeWeight(card === draggingCard ? 3 : 1);
    rect(x, y, layout.cardWidth, layout.cardHeight, 12);
    // 設定文字樣式與換行顯示。
    noStroke();
    fill("#000000");
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(width < 650 ? 12 : 14);
    text(questions[card.questionIndex].answer, x + 8, y + 5, layout.cardWidth - 16, layout.cardHeight - 10);
    // 恢復一般文字樣式。
    textStyle(NORMAL);
  }
}

// 繪製交卷按鈕與重新開始按鈕。
function drawButtons() {
  // 設定按鈕文字的對齊方式。
  textAlign(CENTER, CENTER);
  // 繪製重新開始按鈕。
  fill("#b8ddec");
  stroke("#4f78a3");
  strokeWeight(1);
  rect(resetButton.x, resetButton.y, resetButton.w, resetButton.h, 10);
  // 繪製重新開始文字。
  noStroke();
  fill("#000000");
  textSize(14);
  text("重新作答", resetButton.x + resetButton.w / 2, resetButton.y + resetButton.h / 2);
  // 根據是否完成六題決定交卷按鈕顏色。
  fill(cards.every((card) => card.placed) && !submitted ? "#ffb07c" : "#b8ddec");
  rect(submitButton.x, submitButton.y, submitButton.w, submitButton.h, 10);
  // 顯示交卷按鈕文字。
  fill("#000000");
  textStyle(BOLD);
  text(submitted ? "已完成交卷" : "交卷看成績", submitButton.x + submitButton.w / 2, submitButton.y + submitButton.h / 2);
  // 恢復一般文字樣式。
  textStyle(NORMAL);
}

// 讓卡片在被拖曳時跟隨滑鼠或手指。
function mouseDragged() {
  // 沒有正在拖曳的卡片時不進行任何動作。
  if (!draggingCard || submitted) return false;
  // 更新卡片位置並限制在畫布範圍內。
  draggingCard.x = constrain(mouseX - dragOffsetX, 4, width - layout.cardWidth - 4);
  draggingCard.y = constrain(mouseY - dragOffsetY, 105, height - 72);
  // 阻止瀏覽器處理預設拖曳行為。
  return false;
}

// 在滑鼠按下時尋找最上層的文字卡片。
function mousePressed() {
  // 尚未開始時只處理開始作答按鈕。
  if (!gameStarted) {
    // 點擊開始按鈕後顯示題目並重新設定題目順序。
    if (isInside(mouseX, mouseY, startButton)) {
      gameStarted = true;
      resetGame();
    }
    // 開始畫面不允許其他互動。
    return false;
  }
  // 點擊重新作答按鈕時重設整個遊戲。
  if (isInside(mouseX, mouseY, resetButton)) {
    resetGame();
    return false;
  }
  // 點擊上方圖片時播放該題的親切語音說明。
  for (let i = 0; i < targets.length; i += 1) {
    // 取得目前圖片的互動區域。
    const target = targets[i];
    // 判斷滑鼠是否按在目前圖片區域內。
    if (isInside(mouseX, mouseY, target)) {
      // 播放目前題目的語音提示。
      speakQuestion(i);
      // 點擊圖片只播放語音，不啟動文字卡片拖曳。
      return false;
    }
  }
  // 只有六題全部放置後才能點擊交卷。
  if (isInside(mouseX, mouseY, submitButton) && cards.every((card) => card.placed) && !submitted) {
    submitGame();
    return false;
  }

  // 交卷後不再允許拖曳卡片。
  if (submitted) return false;
  // 從後往前檢查，確保重疊時優先抓到上層卡片。
  for (let i = cards.length - 1; i >= 0; i -= 1) {
    // 取得目前檢查的卡片。
    const card = cards[i];
    // 判斷滑鼠是否位於卡片內。
    if (isInside(mouseX, mouseY, { x: card.x, y: card.y, w: layout.cardWidth, h: layout.cardHeight })) {
      // 設定目前拖曳中的卡片。
      draggingCard = card;
      // 記錄拖曳前的題目位置。
      dragOriginTargetIndex = card.placed ? card.targetIndex : null;
      // 若卡片原本已放置，先釋放原本的題目位置。
      if (card.placed) {
        const originTarget = targets.find((target) => target.index === card.targetIndex);
        if (originTarget) originTarget.cardId = null;
        card.placed = false;
        card.targetIndex = null;
      }
      // 記錄點擊位置和卡片左上角的距離。
      dragOffsetX = mouseX - card.x;
      dragOffsetY = mouseY - card.y;
      // 將被抓取的卡片移到陣列最後，讓它視覺上位於最上層。
      cards.splice(i, 1);
      cards.push(card);
      return false;
    }
  }
  // 告知 p5.js 這次互動已經處理完畢。
  return false;
}

// 取得瀏覽器支援的繁體中文語音。
function loadChineseVoice() {
  // 瀏覽器不支援語音功能時直接略過語音設定。
  if (!("speechSynthesis" in window)) return;
  // 取得瀏覽器目前提供的全部語音。
  const voices = window.speechSynthesis.getVoices();
  // 優先選擇臺灣中文，其次選擇其他中文語音。
  chineseVoice = voices.find((voice) => voice.lang.toLowerCase() === "zh-tw")
    || voices.find((voice) => voice.lang.toLowerCase().startsWith("zh"));
}

// 用親切、有趣的語調唸出指定題目的說明。
function speakQuestion(questionIndex) {
  // 瀏覽器不支援語音功能時不執行任何動作。
  if (!("speechSynthesis" in window)) return;
  // 確保語音清單已經載入。
  if (!chineseVoice) loadChineseVoice();
  // 先停止前一句，避免快速連點時語音重疊。
  window.speechSynthesis.cancel();
  // 組合適合朗讀的親切題目提示。
  const question = questions[questionIndex];
  const message = `嘿！來挑戰第 ${questionIndex + 1} 題吧！${question.hint} 把正確的知識卡拖到我這裡，看看你是不是 CPBL 小達人！`;
  // 建立瀏覽器語音朗讀物件。
  const utterance = new SpeechSynthesisUtterance(message);
  // 指定繁體中文語系。
  utterance.lang = "zh-TW";
  // 優先使用已找到的中文語音。
  utterance.voice = chineseVoice;
  // 放慢語速，讓題目內容清楚易懂。
  utterance.rate = 0.9;
  // 提高音高，營造親切活潑的語氣。
  utterance.pitch = 1.2;
  // 將音量設為最大，確保題目容易聽見。
  utterance.volume = 1;
  // 開始播放題目語音。
  window.speechSynthesis.speak(utterance);
}

// 用鼓勵式語氣回應作答結果，避免答錯時讓測驗者感到挫折。
function speakPlacementFeedback(isCorrect) {
  // 瀏覽器不支援語音功能時直接略過語音回饋。
  if (!("speechSynthesis" in window)) return;
  // 確保語音清單已經載入。
  if (!chineseVoice) loadChineseVoice();
  // 停止前一段語音，讓回饋內容清楚播放。
  window.speechSynthesis.cancel();
  // 答錯時給予提示，答對時給予正向鼓勵。
  const message = isCorrect
    ? "答對了！很棒喔！"
    : "要不要再想想看呢？沒關係，先記住這個位置，最後交卷再看看成績喔！";
  // 建立語音朗讀物件。
  const utterance = new SpeechSynthesisUtterance(message);
  // 指定繁體中文語系。
  utterance.lang = "zh-TW";
  // 優先使用已找到的中文語音。
  utterance.voice = chineseVoice;
  // 使用稍慢的速度，讓鼓勵內容容易聽清楚。
  utterance.rate = 0.9;
  // 提高音高，營造親切活潑的語氣。
  utterance.pitch = 1.2;
  // 將音量設為最大。
  utterance.volume = 1;
  // 開始播放作答回饋。
  window.speechSynthesis.speak(utterance);
}

// 在滑鼠放開時判斷卡片是否放進正確答案位置。
function mouseReleased() {
  // 沒有拖曳中的卡片時直接結束。
  if (!draggingCard) return false;
  // 尋找卡片目前重疊的答案位置。
  let matchedTarget = null;
  for (let i = 0; i < targets.length; i += 1) {
    // 取得目前答案位置。
    const target = targets[i];
    // 空白位置可以放入新卡片，已放置卡片也可以拖曳來交換答案。
    if (overlaps(draggingCard, target) && (target.cardId === null || dragOriginTargetIndex !== null)) {
      matchedTarget = target;
      break;
    }
  }
  // 只要放入空白答案位置，就將卡片固定在該位置。
  if (matchedTarget) {
    // 在固定卡片前記錄這次放置是否為正確答案。
    const isCorrectPlacement = matchedTarget.index === draggingCard.questionIndex;
    // 取得新位置原本的卡片，供兩張已放置卡片交換位置。
    const displacedCard = matchedTarget.cardId === null
      ? null
      : cards.find((card) => card.id === matchedTarget.cardId);
    // 若新位置原本有卡片，將它移回拖曳卡片的原位置。
    if (displacedCard && dragOriginTargetIndex !== null) {
      const originTarget = targets.find((target) => target.index === dragOriginTargetIndex);
      if (originTarget) {
        displacedCard.x = originTarget.x + 5;
        displacedCard.y = originTarget.y + originTarget.h + 6;
        displacedCard.placed = true;
        displacedCard.targetIndex = originTarget.index;
        originTarget.cardId = displacedCard.id;
      }
    }
    // 將卡片吸附到答案位置下方。
    draggingCard.x = matchedTarget.x + 5;
    draggingCard.y = matchedTarget.y + matchedTarget.h + 6;
    // 將卡片標記為已放置，正誤留到交卷時才判定。
    draggingCard.placed = true;
    // 記錄卡片目前放入的答案位置。
    draggingCard.targetIndex = matchedTarget.index;
    // 記錄答案位置已經被哪張卡片占用。
    matchedTarget.cardId = draggingCard.id;
    // 觸發答案位置的短暫脈動效果。
    matchedTarget.pulse = frameCount;
    // 放置完成後立即播放鼓勵或提示語音。
    speakPlacementFeedback(isCorrectPlacement);
  } else {
    // 沒有放到新位置時，優先恢復到拖曳前的題目位置。
    if (dragOriginTargetIndex !== null) {
      const originTarget = targets.find((target) => target.index === dragOriginTargetIndex);
      if (originTarget) {
        draggingCard.x = originTarget.x + 5;
        draggingCard.y = originTarget.y + originTarget.h + 6;
        draggingCard.placed = true;
        draggingCard.targetIndex = dragOriginTargetIndex;
        originTarget.cardId = draggingCard.id;
      }
    } else {
      // 尚未放置過的卡片則回到原本的文字選項列。
      draggingCard.x = draggingCard.homeX;
      draggingCard.y = draggingCard.homeY;
    }
  }
  // 清除拖曳中的卡片。
  draggingCard = null;
  // 清除本次拖曳的來源位置記錄。
  dragOriginTargetIndex = null;
  // 結束本次滑鼠事件。
  return false;
}

// 將觸控事件轉換成與滑鼠相同的拖曳流程。
function touchStarted() {
  // 使用 p5.js 的滑鼠座標處理觸控起點。
  return mousePressed();
}

// 將觸控移動事件轉換成拖曳事件。
function touchMoved() {
  // 使用 p5.js 的滑鼠座標處理觸控移動。
  return mouseDragged();
}

// 將觸控結束事件轉換成放開事件。
function touchEnded() {
  // 使用 p5.js 的滑鼠座標處理觸控結束。
  return mouseReleased();
}

// 判斷一個點是否位於指定矩形中。
function isInside(px, py, box) {
  // 回傳點是否落在矩形邊界內。
  return px >= box.x && px <= box.x + box.w && py >= box.y && py <= box.y + box.h;
}

// 判斷拖曳中的卡片是否與答案區域重疊。
function overlaps(card, target) {
  // 使用卡片中心點判斷是否拖進答案區域。
  const centerX = card.x + layout.cardWidth / 2;
  const centerY = card.y + layout.cardHeight / 2;
  // 回傳卡片中心是否位於答案區域內。
  return isInside(centerX, centerY, target);
}

// 計算成績並顯示結果視窗。
function submitGame() {
  // 設定遊戲為已交卷狀態。
  submitted = true;
  // 開啟結果視窗。
  showResult = true;
  // 計算六題答對比例。
  // 只有卡片所在位置與題目編號相同才算答對。
  const correctCount = cards.filter((card) => card.placed && card.targetIndex === card.questionIndex).length;
  // 超過八成時建立彩帶粒子。
  if (correctCount / questions.length > 0.8) createConfetti();
}

// 建立高分慶祝用的彩帶粒子。
function createConfetti() {
  // 建立 150 個不同顏色與速度的彩帶。
  for (let i = 0; i < 150; i += 1) {
    // 將彩帶放在畫面上方。
    confetti.push({
      x: random(width),
      y: random(-height, 0),
      speed: random(2, 6),
      size: random(5, 11),
      angle: random(TWO_PI),
      spin: random(-0.15, 0.15),
      color: random(["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#c77dff"])
    });
  }
}

// 更新並繪製彩帶粒子。
function drawConfetti() {
  // 逐一更新每一片彩帶。
  for (let i = confetti.length - 1; i >= 0; i -= 1) {
    // 取得目前彩帶。
    const piece = confetti[i];
    // 讓彩帶向下落下並旋轉。
    piece.y += piece.speed;
    piece.angle += piece.spin;
    // 移除掉出畫面下方的彩帶。
    if (piece.y > height + 20) {
      confetti.splice(i, 1);
      continue;
    }
    // 套用彩帶顏色與旋轉角度。
    push();
    translate(piece.x, piece.y);
    rotate(piece.angle);
    noStroke();
    fill(piece.color);
    rectMode(CENTER);
    rect(0, 0, piece.size, piece.size * 1.8, 2);
    pop();
  }
}

// 繪製交卷後的成績結果視窗。
function drawResultModal() {
  // 尚未交卷時不顯示結果視窗。
  if (!showResult) return;
  // 計算答對題數與百分比。
  // 交卷後依照卡片實際放置的位置計算答對題數。
  const correctCount = cards.filter((card) => card.placed && card.targetIndex === card.questionIndex).length;
  const score = round((correctCount / questions.length) * 100);
  // 繪製半透明遮罩。
  fill(202, 240, 248, 220);
  rect(0, 0, width, height);
  // 計算結果卡片尺寸。
  const modalW = min(width - 30, 430);
  // 預留錯誤題目清單的顯示空間。
  const wrongCards = cards.filter((card) => card.targetIndex !== card.questionIndex);
  const modalH = min(height - 24, wrongCards.length > 0 ? 390 : 270);
  const modalX = (width - modalW) / 2;
  const modalY = (height - modalH) / 2;
  // 繪製結果卡片。
  fill("#e8f9fc");
  stroke("#4d8ac2");
  strokeWeight(2);
  rect(modalX, modalY, modalW, modalH, 20);
  // 繪製結果標題。
  noStroke();
  textAlign(CENTER, CENTER);
  fill("#000000");
  textStyle(BOLD);
  textSize(25);
  // 移除依賴字型的 emoji，改用純文字標題避免顯示空白或方框。
  text(score > 80 ? "太棒了！挑戰成功！" : "完成挑戰！", width / 2, modalY + 45);
  // 高分時在標題兩側繪製彩色星星，取代無法穩定顯示的慶祝 emoji。
  if (score > 80) {
    // 繪製左側慶祝星星。
    fill("#ffb703");
    drawResultStar(modalX + 28, modalY + 45, 10);
    // 繪製右側慶祝星星。
    fill("#fb8500");
    drawResultStar(modalX + modalW - 28, modalY + 45, 10);
  }
  // 繪製分數。
  fill("#000000");
  textSize(48);
  // 使用 RocknRoll One 顯示分數，讓數字更具設計感。
  textFont(rocknRollFont);
  text(`${score}%`, width / 2, modalY + 105);
  // 恢復繁體中文字型，避免後續結果說明缺字。
  textFont(notoSansTCFont);
  // 繪製答題數量與提示。
  textStyle(NORMAL);
  textSize(15);
  fill("#000000");
  text(`答對 ${correctCount} / ${questions.length} 題`, width / 2, modalY + 155);
  text(score > 80 ? "彩帶為你的好表現喝采！" : "再試一次，挑戰 80% 以上的彩帶吧！", width / 2, modalY + 185);
  // 交卷後列出答錯題目與正確應放置的題號。
  if (wrongCards.length > 0) {
    textSize(13);
    fill("#000000");
    text("答錯提醒：", width / 2, modalY + 215);
    for (let i = 0; i < min(wrongCards.length, 4); i += 1) {
      // 取得答錯卡片與它實際放置的位置。
      const wrongCard = wrongCards[i];
      text(
        `第 ${wrongCard.questionIndex + 1} 題 → 應放第 ${wrongCard.questionIndex + 1} 題圖示`,
        width / 2,
        modalY + 238 + i * 18
      );
    }
  }
  // 繪製關閉結果視窗提示。
  fill("#000000");
  textSize(13);
  text("點擊「重新作答」可以再挑戰一次", width / 2, modalY + (wrongCards.length > 0 ? 350 : 225));
}

// 繪製不依賴字型的結果慶祝星星。
function drawResultStar(centerX, centerY, radius) {
  // 計算十個星星頂點，交錯形成五角星。
  beginShape();
  for (let i = 0; i < 10; i += 1) {
    // 外圈與內圈交替，建立星星輪廓。
    const currentRadius = i % 2 === 0 ? radius : radius * 0.45;
    const angle = -HALF_PI + i * PI / 5;
    vertex(centerX + cos(angle) * currentRadius, centerY + sin(angle) * currentRadius);
  }
  // 完成星星圖形。
  endShape(CLOSE);
}

// 在瀏覽器尺寸改變時重新設定 p5.js 畫布。
function windowResized() {
  // 將畫布調整成新的全螢幕尺寸。
  resizeCanvas(windowWidth, windowHeight);
  // 重新計算所有未配對卡片的位置。
  for (let i = 0; i < cards.length; i += 1) {
    // 取得目前卡片的欄列位置。
    const col = layout.columns === 2 ? i % 2 : i;
    const row = layout.columns === 2 ? floor(i / 2) : 0;
    // 先更新版面資料，再由下一幀重新定位卡片。
    cards[i].homeX = layout.margin + col * (layout.cardWidth + layout.gap);
    cards[i].homeY = layout.cardsTop + row * (layout.cardHeight + 12);
    if (!cards[i].placed) {
      cards[i].x = cards[i].homeX;
      cards[i].y = cards[i].homeY;
    }
  }
}
