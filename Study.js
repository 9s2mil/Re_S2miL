// ===== DOM 참조 =====
const wrap = document.getElementById('topicWrap');
const placeholder = document.getElementById('placeholder');
const addBtn = document.getElementById('addBtn');
const delBtn = document.getElementById('delBtn');
const upBtn  = document.getElementById('upBtn');
const toast  = document.getElementById('toast');
const screen = document.getElementById('screen');

const makerBtn = document.getElementById('makerBtn');
const makerPopup = document.getElementById('makerPopup');
const makerTextarea = document.getElementById('makerTextarea');
const makerSaveBtn = document.getElementById('makerSaveBtn');
const makerCloseBtn = document.getElementById('makerCloseBtn');

const namingPopup = document.getElementById('namingPopup');
const namingInput = document.getElementById('namingInput');
const namingSave  = document.getElementById('namingSave');
const namingCancel= document.getElementById('namingCancel');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

const detailScreen = document.getElementById('detailScreen');
const detailTitle  = document.getElementById('detailTitle');
const homeBtn      = document.getElementById('homeBtn');

const detailFlipBtn = document.getElementById('detailFlipBtn');
const detailCurtBtn = document.getElementById('detailCurtBtn');
const detailMemoryBtn = document.getElementById('detailMemoryBtn');

const flipScreen = document.getElementById('flipScreen');
const flipTopicName = document.getElementById('flipTopicName');
const flipIndexLabel = document.getElementById('flipIndexLabel');
const flipHomeBtn = document.getElementById('flipHomeBtn');
const flipMoveBtn = document.getElementById('flipMoveBtn');
const flipPlusBtn = document.getElementById('flipPlusBtn');
const flipAutoBtn = document.getElementById('flipAutoBtn');
const flipHintBtn = document.getElementById('flipHintBtn');   // 후술
const flipEditBtn = document.getElementById('flipEditBtn');
const flipFontPlus = document.getElementById('flipFontPlus');
const flipFontMinus = document.getElementById('flipFontMinus');
const flipCard = document.getElementById('flipCard');
const flipPrev = document.getElementById('flipPrev');
const flipNext = document.getElementById('flipNext');
const flipStar = document.getElementById('flipStar');

// Curtain (휘장) screen DOM
const curtainScreen = document.getElementById('curtainScreen');
const curTopicName = document.getElementById('curTopicName');
const curIndexLabel = document.getElementById('curIndexLabel');
const curHomeBtn = document.getElementById('curHomeBtn');

const curTopText = document.getElementById('curTopText');
const curBottomText = document.getElementById('curBottomText');
const curCurtain = document.getElementById('curCurtain');

const curTopPlus = document.getElementById('curTopPlus');
const curTopMinus = document.getElementById('curTopMinus');
const curBottomPlus = document.getElementById('curBottomPlus');
const curBottomMinus = document.getElementById('curBottomMinus');

const curMoveBtn = document.getElementById('curMoveBtn');
const curPlusBtn = document.getElementById('curPlusBtn');
const curAutoBtn = document.getElementById('curAutoBtn');
const curHintBtn = document.getElementById('curHintBtn');
const curEditBtn = document.getElementById('curEditBtn');
const curOpacityBtn = document.getElementById('curOpacityBtn');

const curPrev = document.getElementById('curPrev');
const curNext = document.getElementById('curNext');
const curStar = document.getElementById('curStar');

const curTopArea = document.getElementById('curTopArea');
const curBottomArea = document.getElementById('curBottomArea');

// Memory screen DOM
const memoryScreen = document.getElementById('memoryScreen');
const memTopicName = document.getElementById('memTopicName');
const memIndexLabel = document.getElementById('memIndexLabel');
const memHomeBtn = document.getElementById('memHomeBtn');
const memMoveBtn = document.getElementById('memMoveBtn');
const memPlusBtn = document.getElementById('memPlusBtn');
const memAutoBtn = document.getElementById('memAutoBtn');
const memQuestion = document.getElementById('memQuestion');
const memOptions = document.getElementById('memOptions');
const memPrev = document.getElementById('memPrev');
const memNext = document.getElementById('memNext');
const memStar = document.getElementById('memStar');
const memCorrectCountEl = document.getElementById('memCorrectCount');

// Bookmark screen DOM
const starScreen = document.getElementById('starScreen');
const starTopicName = document.getElementById('starTopicName');
const starIndexLabel = document.getElementById('starIndexLabel');
const starHomeBtn = document.getElementById('starHomeBtn');
const starCard = document.getElementById('starCard');
const starPrev = document.getElementById('starPrev');
const starNext = document.getElementById('starNext');
const starStar = document.getElementById('starStar');
const starFontPlus = document.getElementById('starFontPlus');
const starFontMinus = document.getElementById('starFontMinus');

// movePopup DOM
const movePopup = document.getElementById('movePopup');
const moveInput = document.getElementById('moveInput');
const moveCancel = document.getElementById('moveCancel');
const moveOk = document.getElementById('moveOk');
const moveJump = document.getElementById('moveJump');
const moveSuperJump = document.getElementById('moveSuperJump');

// ===== 상태 변수 =====
let deleteMode = false;
let deleteTimeout = null;
let topics = []; // [{id, name}]
let seq = 0;
let editingId = null;
let currentTopicId = null;
let awaitingUploadTarget = false;
let pendingUploadCards = null;
let curtainIndex = 1;
let memoryIndex = 1;   
let memoryCorrect = 0; 
let starList = []; 
let starPos = 1;   
let starSide = 'f';
const LIGHTNING_KEY = 'hideRubyMode';
const PROGRESS_KEY = 'topicProgress';

// ===== 로컬스토리지 키 =====
const LS_TOPICS_KEY = 'qysm.topics';
const LS_SEQ_KEY    = 'qysm.seq';
// 카드 저장 키
const cardsKey = (topicId) => `qysm.cards.${topicId}`;
const fontKey = (topicId, i, side) => `qysm.font.${topicId}.${i}.${side}`; // side: 'f' | 'b'

function loadCards(topicId) {
  try {
    const raw = localStorage.getItem(cardsKey(topicId));
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function saveCards(topicId, arr) {
  localStorage.setItem(cardsKey(topicId), JSON.stringify(arr || []));
}
function loadFont(topicId, i, side) {
  const n = Number(localStorage.getItem(fontKey(topicId, i, side)));
  return Number.isFinite(n) && n > 0 ? n : null;
}
function saveFont(topicId, i, side, px) {
  localStorage.setItem(fontKey(topicId, i, side), String(px));
}
// 보기 폰트 저장/복원 키: 'a' 고정(정답/오답 모두 'a' 텍스트)
const memFontKey = (topicId, idx) => fontKey(topicId, idx, 'a'); // 재사용: qysm.font.<topic>.<idx>.a

function pickRandomInts(total, exclude, count) {
  const pool = [];
  for (let i = 1; i <= total; i++) if (i !== exclude) pool.push(i);
  // shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

function insertAtCursor(textarea, text) {
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;

  textarea.value =
    value.slice(0, start) +
    text +
    value.slice(end);

  const pos = start + text.length;
  textarea.setSelectionRange(pos, pos);
  textarea.focus();
}

// 텍스트 삽입 버튼들 ([ ] ( ) @ ;)
document.querySelectorAll('.insert-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    insertAtCursor(makerTextarea, btn.dataset.char);
  });
});

if (makerBtn) {
  makerBtn.addEventListener('click', () => {
    makerPopup.style.display = 'flex';
    document.body.classList.add('naming-open');
  });
}

if (makerCloseBtn) {
  makerCloseBtn.addEventListener('click', () => {
    makerPopup.style.display = 'none';
    document.body.classList.remove('naming-open');
  });
}

makerSaveBtn.addEventListener('click', () => {
  const text = makerTextarea.value || '';
  if (!text.trim()) {
    showToast('저장할 내용이 없습니다', 800);
    return;
  }

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'text.txt';
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('텍스트 파일로 저장되었습니다', 800);
});

function starOpen(startAtPos = 1) {
  starList = loadStarOrder(); // 눌린 순서대로
  if (!starList.length) { showToast('북마크된 항목이 없습니다', 1200); return; }

  starPos = Math.max(1, Math.min(startAtPos | 0, starList.length));
  starSide = 'f';
  renderStarCard();

  // 화면 전환
  document.getElementById('screen').style.display = 'none';
  if (detailScreen) detailScreen.style.display = 'none';
  if (flipScreen) flipScreen.style.display = 'none';
  if (curtainScreen) curtainScreen.style.display = 'none';
  if (memoryScreen) memoryScreen.style.display = 'none';
  document.querySelector('.bottom').style.display = 'none';
  if (cancelDeleteBtn) cancelDeleteBtn.style.display = 'none';
  starScreen.style.display = 'flex';
}

function renderStarCard() {
  if (!starList.length) { starCard.innerHTML = ''; starIndexLabel.textContent = '0'; return; }
  const { t, i } = starList[starPos - 1];
  const cards = loadCards(t);
  const c = cards[i - 1] || { f: '', b: '' };
  const text = (starSide === 'b') ? c.b : c.f;

  // 상단 라벨: (전체 중 위치)
  starTopicName.textContent = `북마크 (${starPos}/${starList.length})`;
  starIndexLabel.textContent = ``;

  // 폰트 복원: 현재 면 기준
  const px = loadFont(t, i, starSide);
  starCard.style.fontSize = px ? `${px}px` : '';

  const flow = starCard.querySelector('.flip-text-flow');
  flow.innerHTML = text || '';

  // 별 버튼 상태
  const on = isStarred(t, i);
  setStarAppearance(starStar, on);
}
// 메인 북마크 버튼 클릭 → 북마크 화면
if (typeof bookmarkBtn !== 'undefined' && bookmarkBtn) {
  bookmarkBtn.addEventListener('click', () => starOpen(1));
}

// 카드 토글
starCard.addEventListener('click', () => {
  starSide = (starSide === 'f' ? 'b' : 'f');
  renderStarCard();
});

// 폰트 ± (현재 면에 저장)
starFontPlus.addEventListener('click', () => {
  if (!starList.length) return;
  const { t, i } = starList[starPos - 1];
  const cur = parseFloat(getComputedStyle(starCard).fontSize);
  const next = Math.min((cur || 24) + 4, 96);
  starCard.style.fontSize = `${next}px`;
  saveFont(t, i, starSide, next);
});
starFontMinus.addEventListener('click', () => {
  if (!starList.length) return;
  const { t, i } = starList[starPos - 1];
  const cur = parseFloat(getComputedStyle(starCard).fontSize);
  const next = Math.max((cur || 24) - 4, 10);
  starCard.style.fontSize = `${next}px`;
  saveFont(t, i, starSide, next);
});

// 좌/우 네비 (항상 f로)
starPrev.addEventListener('click', () => {
  if (!starList.length) return;
  starPos = Math.max(1, starPos - 1);
  starSide = 'f';
  renderStarCard();
});
starNext.addEventListener('click', () => {
  if (!starList.length) return;
  starPos = Math.min(starList.length, starPos + 1);
  starSide = 'f';
  renderStarCard();
});

// 별 토글 (해제 시 즉시 목록/화면 반영)
starStar.addEventListener('click', () => {
  if (!starList.length) return;
  const { t, i } = starList[starPos - 1];
  const on = !isStarred(t, i);
  setStar(t, i, on);
  if (on) addToStarOrder(t, i);
  else removeFromStarOrder(t, i);

  // 목록 갱신
  starList = loadStarOrder();
  if (!starList.length) {
    showToast('모든 북마크가 해제되었습니다', 1200);
    // 자동 메인 복귀
    starScreen.style.display = 'none';
    document.getElementById('screen').style.display = 'block';
    document.querySelector('.bottom').style.display = 'grid';
    return;
  }
  // 현재 위치가 유효하도록 조정
  if (starPos > starList.length) starPos = starList.length;
  renderStarCard();
});

// Home → 메인
starHomeBtn.addEventListener('click', () => {
  starScreen.style.display = 'none';
  document.getElementById('screen').style.display = 'block';
  document.querySelector('.bottom').style.display = 'grid';
});

// ===== Star 공통 유틸 =====
function isStarred(topicId, idx) {
  return localStorage.getItem(`qysm.star.${topicId}.${idx}`) === '1';
}
function setStar(topicId, idx, on) {
  if (on) localStorage.setItem(`qysm.star.${topicId}.${idx}`, '1');
  else localStorage.removeItem(`qysm.star.${topicId}.${idx}`);
}

function loadStarOrder() {
  try {
    const raw = localStorage.getItem('qysm.starOrder');
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function saveStarOrder(arr) {
  localStorage.setItem('qysm.starOrder', JSON.stringify(arr || []));
}
function addToStarOrder(topicId, idx) {
  const arr = loadStarOrder();
  // 중복 방지
  if (!arr.some(e => e.t === topicId && e.i === idx)) {
    arr.push({ t: topicId, i: idx, ts: Date.now() });
    saveStarOrder(arr);
  }
}
function removeFromStarOrder(topicId, idx) {
  const arr = loadStarOrder().filter(e => !(e.t === topicId && e.i === idx));
  saveStarOrder(arr);
}
// ★ 버튼 외형 갱신(텍스트/색상)
function setStarAppearance(btn, on) {
  if (!btn) return;
  btn.textContent = on ? '★' : '☆';
  btn.style.color = on ? '#FFEB3B' : '';  // 켜짐=노란색, 꺼짐=기본색
}

function insertEmptyCardNext(topicId, currentIndex, mode) {
  const cards = loadCards(topicId);
  const insertAt = Math.min(cards.length, Math.max(0, currentIndex)); // index는 1-based
  cards.splice(insertAt, 0, { f: '', b: '' });
  saveCards(topicId, cards);

  const nextIndex = insertAt + 1;

  showToast('빈 페이지가 추가되었습니다', 800);

  if (mode === 'flip') {
    flipIndex = nextIndex;
    flipSide = 'f';
    flipIndexLabel.textContent = `${flipIndex} / ${cards.length}`;
    renderFlipCard();
  }

  if (mode === 'curtain') {
    curtainIndex = nextIndex;
    curIndexLabel.textContent = `${curtainIndex} / ${cards.length}`;
    renderCurtainCard();
    ensureCurtainVisible();
  }

  if (mode === 'memory') {
    memoryIndex = nextIndex;
    memIndexLabel.textContent = `${memoryIndex} / ${cards.length}`;
    renderMemoryCard();
  }
}

// ===== 유틸 =====
function showToast(msg, ms=2000){
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=> toast.classList.remove('show'), ms);
}

function ensurePlaceholder(){
  placeholder.style.display = topics.length ? 'none' : 'flex';
}

// ===== 로컬스토리지 =====
function loadState(){
  try{
    const t = JSON.parse(localStorage.getItem(LS_TOPICS_KEY) || '[]');
    const s = Number(localStorage.getItem(LS_SEQ_KEY) || '0');
    if (Array.isArray(t)) topics = t; else topics = [];
    seq = Number.isFinite(s) ? s : 0;
  }catch{ topics = []; seq = 0; }
}
function saveState(){
  localStorage.setItem(LS_TOPICS_KEY, JSON.stringify(topics));
  localStorage.setItem(LS_SEQ_KEY, String(seq));
}

// ===== 삭제 모드 =====
function enterDeleteMode(){
  deleteMode = true;
  document.body.classList.add('delete-mode');
  screen.classList.add('delete-hint');

  showToast('삭제할 주제를 선택하세요 — 5초 후 삭제 모드가 종료됩니다', 2000);
  clearTimeout(deleteTimeout);
  deleteTimeout = setTimeout(exitDeleteMode, 5000);

  if (cancelDeleteBtn) cancelDeleteBtn.style.display = 'block';
}

function exitDeleteMode(){
  deleteMode = false;
  document.body.classList.remove('delete-mode');
  screen.classList.remove('delete-hint');
  clearTimeout(deleteTimeout);

  if (cancelDeleteBtn) cancelDeleteBtn.style.display = 'none';
}

function requestDelete(id){
  const ok = confirm('정말 삭제하시겠습니까?');
  if (ok){
    topics = topics.filter(x=>x.id !== id);
    cleanupTopicStorage(id);
    saveState();
    render();
  }
  exitDeleteMode();
}
// ▼ 토픽 삭제 시 관련 로컬스토리지 정리
function cleanupTopicStorage(topicId) {
  const removePrefixes = [
    cardsKey(topicId),                  // qysm.cards.<topicId>
    `qysm.font.${topicId}.`,            // qysm.font.<topicId>.<i>.<side>
    `qysm.star.${topicId}.`,
    `qysm.hint.${topicId}.`,
    `qysm.curtain.${topicId}.`,
  ];
  const pruned = loadStarOrder().filter(e => e.t !== topicId);
  saveStarOrder(pruned);

  // localStorage는 prefix 삭제가 없으므로 전수 검사
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k === removePrefixes[0] || removePrefixes.some(p => p !== removePrefixes[0] && k.startsWith(p))) {
      localStorage.removeItem(k);
    }
  }
}

// ===== 이름 편집 팝업 =====
function openNamingPopup(id, currentName=''){
  editingId = id;
  namingInput.value = currentName || '';
  namingPopup.style.display = 'flex';
  document.body.classList.add('naming-open');
  setTimeout(()=> namingInput.focus(), 0);
}
function closeNamingPopup(){
  namingPopup.style.display = 'none';
  editingId = null;
  document.body.classList.remove('naming-open');
}

namingSave.addEventListener('click', ()=>{
  if (!editingId) return closeNamingPopup();
  const v = (namingInput.value || '').trim();
  const idx = topics.findIndex(t=>t.id === editingId);
  if (idx >= 0){
    topics[idx].name = v || '새 주제';
    saveState();
    render();
  }
  closeNamingPopup();
});
namingCancel.addEventListener('click', closeNamingPopup);
namingPopup.addEventListener('click', (e)=>{
  if (e.target === namingPopup) closeNamingPopup();
});
document.addEventListener('keydown', (e)=>{
  if (namingPopup.style.display !== 'none'){
    if (e.key === 'Escape') closeNamingPopup();
    if (e.key === 'Enter')  namingSave.click();
  }
});

// ===== 뷰 전환 =====
function openDetailView(topicId){
  if (deleteMode) exitDeleteMode();
  currentTopicId = topicId;
  const t = topics.find(x=>x.id === topicId);
  detailTitle.textContent = (t?.name || '새 주제');

  document.getElementById('screen').style.display = 'none';
  document.querySelector('.bottom').style.display = 'none';
  if (cancelDeleteBtn) cancelDeleteBtn.style.display = 'none';

  detailScreen.style.display = 'block';
}
function closeDetailView(){
  detailScreen.style.display = 'none';
  document.getElementById('screen').style.display = 'block';
  document.querySelector('.bottom').style.display = 'grid';
}
if (homeBtn){
  homeBtn.addEventListener('click', closeDetailView);
}
// 디테일 → 플립
if (detailFlipBtn) {
  detailFlipBtn.addEventListener('click', () => {
    if (!currentTopicId) return;
    const idx = getTopicIndex(currentTopicId) || 1;
    flipOpen(currentTopicId, idx, 'f');
  });
}

// 디테일 → 휘장
if (detailCurtBtn) {
  detailCurtBtn.addEventListener('click', () => {
    if (!currentTopicId) return;
    const idx = getTopicIndex(currentTopicId) || 1;
    curtainOpen(currentTopicId, idx);
  });
}

// 디테일 → 암기(자리만)
if (detailMemoryBtn) {
  detailMemoryBtn.addEventListener('click', () => {
    if (!currentTopicId) return;
    const idx = getTopicIndex(currentTopicId) || 1;
    memoryOpen(currentTopicId, idx);
  });
}

let flipIndex = 1; 
let flipSide = 'f';
// =====  플립 화면 열기 ===== 
function flipOpen(topicId, index = 1, side = 'f') {
  currentTopicId = topicId;
  flipIndex = Math.max(1, index | 0);
  flipSide = (side === 'b' ? 'b' : 'f');

  const cards = loadCards(topicId);           // (B)에서 만든 함수
  const count = cards.length;
  if (!count) {
    showToast('이 토픽에 업로드된 카드가 없습니다. up으로 업로드하세요.', 1800);
    return;
  }
  if (flipIndex > count) flipIndex = count;

  const t = topics.find(x => x.id === topicId);
  flipTopicName.textContent = t?.name || '새 주제';
  flipIndexLabel.textContent = `${flipIndex} / ${cards.length}`;  // “xpopup-1-f”의 1만 표시

  renderFlipCard();

  // 화면 전환
  document.getElementById('screen').style.display = 'none';
  detailScreen.style.display = 'none';
  document.querySelector('.bottom').style.display = 'none';
  if (cancelDeleteBtn) cancelDeleteBtn.style.display = 'none';
  flipScreen.style.display = 'flex';

  updateRandUI('flip', topicId);
  if (_rs('flip', topicId).on) showToast('랜덤 모드: ON', 700);
}

// 메인으로 돌아가기(Home 규칙)
function flipCloseToHome() {
  flipScreen.style.display = 'none';
  document.getElementById('screen').style.display = 'block';
  document.querySelector('.bottom').style.display = 'grid';
}

// 현재 카드 내용 그리기
function renderFlipCard() {
  const cards = loadCards(currentTopicId);
  const card = cards[flipIndex - 1];
  if (!card) { flipCard.textContent = ''; return; }

  const text = (flipSide === 'b') ? card.b : card.f;
  const flow = flipCard.querySelector('.flip-text-flow');
  flow.innerHTML = text || '';


  // 폰트 사이즈 복원
  const saved = loadFont(currentTopicId, flipIndex, flipSide);  // (B)의 함수
  flipCard.style.fontSize = saved ? `${saved}px` : '';
  updateFlipStarButton();

  const oldEdit = flipCard.querySelector('.edit-btn');
  if (oldEdit) oldEdit.remove();

  addEditButton(flipCard, card, flipSide, flipIndex);
  addLightningButton(flipCard);
}
// 카드 탭 → 앞/뒤 토글
flipCard.addEventListener('click', () => {
  flipSide = (flipSide === 'f' ? 'b' : 'f');
  renderFlipCard();
});
// 북마크 설정
function updateFlipStarButton() {
  if (!flipStar) return;
  const on = isStarred(currentTopicId, flipIndex);
  setStarAppearance(flipStar, on);
}
// 폰트 크기 +/-
flipFontPlus.addEventListener('click', () => {
  const cur = parseFloat(getComputedStyle(flipCard).fontSize);
  const next = Math.min((cur || 24) + 2, 96);
  flipCard.style.fontSize = `${next}px`;
  saveFont(currentTopicId, flipIndex, flipSide, next);  // (B)의 함수
});
flipFontMinus.addEventListener('click', () => {
  const cur = parseFloat(getComputedStyle(flipCard).fontSize);
  const next = Math.max((cur || 24) - 2, 10);
  flipCard.style.fontSize = `${next}px`;
  saveFont(currentTopicId, flipIndex, flipSide, next);
});

// 좌/우 네비(항상 f로 열기)
flipPrev.addEventListener('click', () => {
  const cards = loadCards(currentTopicId);
  if (!cards.length) return;
  flipIndex = Math.max(1, flipIndex - 1);
  flipSide = 'f';
  flipIndexLabel.textContent = `${flipIndex} / ${cards.length}`;
  renderFlipCard();
  saveTopicIndex(currentTopicId, flipIndex);
});
flipNext.addEventListener('click', () => {
  const cards = loadCards(currentTopicId);
  if (!cards.length) return;

  // 랜덤 상태가 ON이면 다음 인덱스를 랜덤으로, 아니면 +1
  const next = _rs('flip', currentTopicId).on
    ? randNextIndex('flip', currentTopicId, flipIndex)
    : Math.min(cards.length, flipIndex + 1);

  flipIndex = next;
  flipSide = 'f';
  flipIndexLabel.textContent = `${flipIndex} / ${cards.length}`;
  renderFlipCard();
  saveTopicIndex(currentTopicId, flipIndex);
});


// Home 버튼 → 메인 복귀
flipHomeBtn.addEventListener('click', flipCloseToHome);

// Move(m): “정수 입력 → 해당 번호의 f면으로 이동”
flipMoveBtn.addEventListener('click', () => {
  const cards = loadCards(currentTopicId);
  if (!cards.length) return;
  window._moveMode = 'flip';
  openMovePopup(cards.length);
});

flipPlusBtn.addEventListener('click', openPageMiniPopup);



flipStar.addEventListener('click', () => {
  const on = !isStarred(currentTopicId, flipIndex);
  setStar(currentTopicId, flipIndex, on);
  if (on) addToStarOrder(currentTopicId, flipIndex);
  else removeFromStarOrder(currentTopicId, flipIndex);
  updateFlipStarButton();
  showToast(on ? '북마크에 추가되었습니다' : '북마크에서 제거되었습니다', 600);
});

// ===== 휘장 모드  ===== 
function curtainOpen(topicId, index = 1) {
  currentTopicId = topicId;
  const cards = loadCards(topicId);
  if (!cards.length) {
    showToast('이 토픽에 업로드된 카드가 없습니다. up으로 업로드하세요.', 1800);
    return;
  }

  curtainIndex = Math.max(1, Math.min(index | 0, cards.length));

  const t = topics.find(x => x.id === topicId);
  curTopicName.textContent = t?.name || '새 주제';
  curIndexLabel.textContent = `${curtainIndex} / ${cards.length}`;

  renderCurtainCard();
  ensureCurtainVisible();

  // 화면 전환
  document.getElementById('screen').style.display = 'none';
  if (detailScreen) detailScreen.style.display = 'none';
  if (flipScreen) flipScreen.style.display = 'none';
  document.querySelector('.bottom').style.display = 'none';
  if (cancelDeleteBtn) cancelDeleteBtn.style.display = 'none';

  curtainScreen.style.display = 'flex';

  updateRandUI('curtain', topicId);
  if (_rs('curtain', topicId).on) showToast('랜덤 모드: ON', 700);
}

function curtainCloseToHome() {
  curtainScreen.style.display = 'none';
  document.getElementById('screen').style.display = 'block';
  document.querySelector('.bottom').style.display = 'grid';
}
function updateCurtainStarButton() {
  if (!curStar) return;
  const on = isStarred(currentTopicId, curtainIndex);
  setStarAppearance(curStar, on);
}
function renderCurtainCard() {
  const cards = loadCards(currentTopicId);
  const c = cards[curtainIndex - 1] || { f: '', b: '' };
  // 매핑: t → f(앞), b → b(뒤)
  curTopText.innerHTML = c.f || '';
  curBottomText.innerHTML = c.b || '';

  // 폰트 복원
  const topPx = loadFont(currentTopicId, curtainIndex, 't');
  const botPx = loadFont(currentTopicId, curtainIndex, 'b');
  curTopText.style.fontSize = topPx ? `${topPx}px` : '';
  curBottomText.style.fontSize = botPx ? `${botPx}px` : '';
  updateCurtainStarButton();
  addEditButton(curTopText, cards, 'f', curtainIndex);
  addLightningButton(curTopText);
  addEditButton(curBottomText, cards, 'b', curtainIndex);
}
function ensureCurtainVisible() {
  if (curCurtain) curCurtain.style.display = 'block';
}
// Home
curHomeBtn.addEventListener('click', curtainCloseToHome);

// Move(m): 번호로 점프(항상 t/b 둘 다 그 번호로)
curMoveBtn.addEventListener('click', () => {
  const cards = loadCards(currentTopicId);
  if (!cards.length) return;
  window._moveMode = 'curtain';
  openMovePopup(cards.length);
});

// 좌/우 네비 (항상 번호만 바꾸고 표시는 t/b 그대로)
curPrev.addEventListener('click', () => {
  const cards = loadCards(currentTopicId); if (!cards.length) return;
  curtainIndex = Math.max(1, curtainIndex - 1);
  curIndexLabel.textContent = `${curtainIndex} / ${cards.length}`;
  renderCurtainCard();
  ensureCurtainVisible();
  saveTopicIndex(currentTopicId, curtainIndex);
});
curNext.addEventListener('click', () => {
  const cards = loadCards(currentTopicId);
  if (!cards.length) return;

  const next = _rs('curtain', currentTopicId).on
    ? randNextIndex('curtain', currentTopicId, curtainIndex)
    : Math.min(cards.length, curtainIndex + 1);

  curtainIndex = next;
  curIndexLabel.textContent = `${curtainIndex} / ${cards.length}`;
  renderCurtainCard();
  ensureCurtainVisible(); // 전환 시 휘장 반드시 보이게
  saveTopicIndex(currentTopicId, curtainIndex);
});


// 폰트 ± (top=t, bottom=b 각각 저장)
curTopPlus.addEventListener('click', () => {
  const cur = parseFloat(getComputedStyle(curTopText).fontSize);
  const next = Math.min((cur || 22) + 2, 96);
  curTopText.style.fontSize = `${next}px`;
  saveFont(currentTopicId, curtainIndex, 't', next);
});
curTopMinus.addEventListener('click', () => {
  const cur = parseFloat(getComputedStyle(curTopText).fontSize);
  const next = Math.max((cur || 22) - 2, 10);
  curTopText.style.fontSize = `${next}px`;
  saveFont(currentTopicId, curtainIndex, 't', next);
});
curBottomPlus.addEventListener('click', (e) => {
  e.stopPropagation();   // 🔥 커튼 토글 차단
  const cur = parseFloat(getComputedStyle(curBottomText).fontSize);
  const next = Math.min((cur || 22) + 2, 96);
  curBottomText.style.fontSize = `${next}px`;
  saveFont(currentTopicId, curtainIndex, 'b', next);
});

curBottomMinus.addEventListener('click', (e) => {
  e.stopPropagation();   // 🔥 커튼 토글 차단
  const cur = parseFloat(getComputedStyle(curBottomText).fontSize);
  const next = Math.max((cur || 22) - 2, 10);
  curBottomText.style.fontSize = `${next}px`;
  saveFont(currentTopicId, curtainIndex, 'b', next);
});

// 언더 영역 클릭 → 휘장 show/hide (display 토글)
curBottomArea.addEventListener('click', () => {
  const isHidden = curCurtain.style.display === 'none';
  curCurtain.style.display = isHidden ? 'block' : 'none';
});

// 빙 버튼 → 휘장 배경 투명 토글(알파 0)
curOpacityBtn.addEventListener('click', () => {
  curCurtain.classList.toggle('transparent');
});

// 자리만: s/a/hint/연필/☆는 후술
curPlusBtn.addEventListener('click', openPageMiniPopup);

curStar.addEventListener('click', () => {
  const on = !isStarred(currentTopicId, curtainIndex);
  setStar(currentTopicId, curtainIndex, on);
  if (on) addToStarOrder(currentTopicId, curtainIndex);
  else removeFromStarOrder(currentTopicId, curtainIndex);
  updateCurtainStarButton();
  showToast(on ? '북마크에 추가되었습니다' : '북마크에서 제거되었습니다', 600);
});

// ===== 암기 모드 =====  
function memoryOpen(topicId, index = 1) {
  currentTopicId = topicId;
  const cards = loadCards(topicId);
  if (!cards.length) { showToast('이 토픽에 업로드된 카드가 없습니다.', 1600); return; }

  memoryIndex = Math.max(1, Math.min(index | 0, cards.length));
  const t = topics.find(x => x.id === topicId);
  memTopicName.textContent = t?.name || '새 주제';
  memIndexLabel.textContent = `${memoryIndex} / ${cards.length}`;
  renderMemoryCard();

  // 화면 전환
  document.getElementById('screen').style.display = 'none';
  if (detailScreen) detailScreen.style.display = 'none';
  if (flipScreen) flipScreen.style.display = 'none';
  if (curtainScreen) curtainScreen.style.display = 'none';
  document.querySelector('.bottom').style.display = 'none';
  if (cancelDeleteBtn) cancelDeleteBtn.style.display = 'none';
  memoryScreen.style.display = 'flex';

  updateRandUI('memory', topicId);
  if (_rs('memory', topicId).on) showToast('랜덤 모드: ON', 700);
}
function updateMemoryStarButton() {
  if (!memStar) return;
  const on = isStarred(currentTopicId, memoryIndex);
  setStarAppearance(memStar, on);
}
function renderMemoryCard() {
  const cards = loadCards(currentTopicId);
  const total = cards.length;
  const qCard = cards[memoryIndex - 1] || { f: '', b: '' };

  const flow = memQuestion.querySelector('.mem-text-flow');
  if (flow) {
    flow.innerHTML = qCard.f || '';
  }
  
  // === 질문 폰트 조절 버튼 세트 추가 ===
  let qFontControls = document.getElementById('memQFontControls');
  if (!qFontControls) {
    qFontControls = document.createElement('div');
    qFontControls.id = 'memQFontControls';
    qFontControls.style.position = 'absolute';
    qFontControls.style.right = '16px';
    qFontControls.style.top = '10px';
    qFontControls.style.display = 'flex';
    qFontControls.style.flexDirection = 'column';
    qFontControls.style.gap = '6px';

    const qPlus = document.createElement('button');
    qPlus.textContent = '➕';
    qPlus.className = 'chip fontBt';
    const qMinus = document.createElement('button');
    qMinus.textContent = '➖';
    qMinus.className = 'chip fontBt';

    qFontControls.appendChild(qPlus);
    qFontControls.appendChild(qMinus);
    memQuestion.style.position = 'relative';
    memQuestion.appendChild(qFontControls);

    // 폰트 조절 기능
    qPlus.addEventListener('click', (e) => {
      e.stopPropagation();

      const cur = parseFloat(getComputedStyle(flow).fontSize);
      const next = Math.min((cur || 22) + 2, 96);

      flow.style.fontSize = `${next}px`;
      saveFont(currentTopicId, memoryIndex, 'q', next);
    });

    qMinus.addEventListener('click', (e) => {
      e.stopPropagation();

      const cur = parseFloat(getComputedStyle(flow).fontSize);
      const next = Math.max((cur || 22) - 2, 10);

      flow.style.fontSize = `${next}px`;
      saveFont(currentTopicId, memoryIndex, 'q', next);
    });

  }

  // 저장된 폰트 크기 복원
  const qPx = loadFont(currentTopicId, memoryIndex, 'q');
  if (flow) {
    flow.style.fontSize = qPx ? `${qPx}px` : '';
  }

  // ✏️ 수정 / ⚡ 버튼
  addEditButton(memQuestion, qCard, 'f', memoryIndex);
  addLightningButton(memQuestion);

  // 보기 데이터 구성
  const correctIdx = memoryIndex; // 정답의 원본 인덱스
  const distractorIdxs = pickRandomInts(
    total,
    correctIdx,
    Math.min(3, Math.max(0, total - 1))
  );
  const optionIdxs = [correctIdx, ...distractorIdxs];

  // 랜덤 섞기
  for (let i = optionIdxs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionIdxs[i], optionIdxs[j]] = [optionIdxs[j], optionIdxs[i]];
  }

  // 보기 영역 초기화
  memOptions.innerHTML = '';

  // 보기 구성
  optionIdxs.forEach((idx) => {
    const opt = document.createElement('div');
    opt.className = 'mem-opt';
    opt.dataset.idx = String(idx);

    // 보기 텍스트
    const text = document.createElement('div');
    text.className = 'mem-opt__text';
    // ✅ 루비 태그가 HTML로 렌더링되도록 변경
    text.innerHTML = cards[idx - 1]?.b || '';

    // 저장된 폰트 크기 복원
    const savedPx = loadFont(currentTopicId, idx, 'a');
    if (savedPx) text.style.fontSize = `${savedPx}px`;

    // ✏️ 각 보기에도 수정 버튼 부여 (선택 사항)
    addEditButton(text, cards[idx - 1], 'b', idx);

    // 폰트 크기 조절 버튼 영역
    const col = document.createElement('div');
    col.className = 'mem-opt__control';
    const plus = document.createElement('button');
    plus.className = 'mem-opt__btn';
    plus.textContent = '+';
    const minus = document.createElement('button');
    minus.className = 'mem-opt__btn';
    minus.textContent = '-';

    // + 버튼 이벤트
    plus.addEventListener('click', (e) => {
      e.stopPropagation();
      const cur = parseFloat(getComputedStyle(text).fontSize);
      const next = Math.min((cur || 18) + 2, 96);
      text.style.fontSize = `${next}px`;
      saveFont(currentTopicId, idx, 'a', next);
    });

    // - 버튼 이벤트
    minus.addEventListener('click', (e) => {
      e.stopPropagation();
      const cur = parseFloat(getComputedStyle(text).fontSize);
      const next = Math.max((cur || 18) - 2, 10);
      text.style.fontSize = `${next}px`;
      saveFont(currentTopicId, idx, 'a', next);
    });

    col.appendChild(plus);
    col.appendChild(minus);

    // 클릭 → 정답 판정
    opt.addEventListener('click', () => {
      const chosenIdx = parseInt(opt.dataset.idx, 10);
      if (chosenIdx === correctIdx) {
        memoryCorrect += 1;
        memCorrectCountEl.textContent = String(memoryCorrect);
        opt.classList.add('correct');
        showToast('정답!', 800);
      } else {
        opt.classList.add('wrong');
        showToast('오답', 800);
      }
    });

    // 요소 배치
    opt.appendChild(text);
    opt.appendChild(col);
    memOptions.appendChild(opt);
  });

  updateMemoryStarButton();
}

memHomeBtn.addEventListener('click', () => {
  memoryScreen.style.display = 'none';
  document.getElementById('screen').style.display = 'block';
  document.querySelector('.bottom').style.display = 'grid';
});

memPrev.addEventListener('click', () => {
  const cards = loadCards(currentTopicId); if (!cards.length) return;
  memoryIndex = Math.max(1, memoryIndex - 1);
  memIndexLabel.textContent = `${memoryIndex} / ${cards.length}`;
  renderMemoryCard();
  saveTopicIndex(currentTopicId, memoryIndex);

});
memNext.addEventListener('click', () => {
  const cards = loadCards(currentTopicId);
  if (!cards.length) return;

  const next = _rs('memory', currentTopicId).on
    ? randNextIndex('memory', currentTopicId, memoryIndex)
    : Math.min(cards.length, memoryIndex + 1);

  memoryIndex = next;
  memIndexLabel.textContent = `${memoryIndex} / ${cards.length}`;
  renderMemoryCard();
  saveTopicIndex(currentTopicId, memoryIndex);
});

// Move(m): 번호로 점프 (암기 모드)
memMoveBtn.addEventListener('click', () => {
  const cards = loadCards(currentTopicId);
  if (!cards.length) return;
  window._moveMode = 'memory';
  openMovePopup(cards.length);
});

// 자리만
memPlusBtn.addEventListener('click', openPageMiniPopup);


memStar.addEventListener('click', () => {
  const on = !isStarred(currentTopicId, memoryIndex);
  setStar(currentTopicId, memoryIndex, on);
  if (on) addToStarOrder(currentTopicId, memoryIndex);
  else removeFromStarOrder(currentTopicId, memoryIndex);
  updateMemoryStarButton();
  showToast(on ? '북마크에 추가되었습니다' : '북마크에서 제거되었습니다', 600);
});

function handleLightningAction() {
  document.body.classList.toggle('hide-ruby');

  const hidden = document.body.classList.contains('hide-ruby');

  // ✅ 로컬 저장
  localStorage.setItem(LIGHTNING_KEY, hidden ? '1' : '0');

  showToast(
    hidden ? '주석 숨김' : '주석 표시',
    600
  );
}
function restoreLightningState() {
  const saved = localStorage.getItem(LIGHTNING_KEY);
  if (saved === '1') {
    document.body.classList.add('hide-ruby');
  }
}


// ===== 렌더링 =====
function clearWrap() {
  wrap.querySelectorAll('.topic-row').forEach(row => row.remove());
}

function render() {
  clearWrap();
  topics.forEach((t, index) => {
    const el = document.createElement('div');
    el.className = 'topic';
    el.dataset.id = t.id;

    const nameSpan = document.createElement('div');
    nameSpan.className = 'topic__name';
    nameSpan.textContent = (t.name || '새 주제');

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'topic__edit';
    editBtn.title = '이름 편집';
    editBtn.setAttribute('aria-label', '이름 편집');
    editBtn.textContent = '✏️';

    // ✅ 본체 클릭: 업로드 타깃 처리 → (아니면) 삭제모드/플립 진입
    el.addEventListener('click', () => {
      // 업로드 타깃 선택 모드
      if (awaitingUploadTarget && pendingUploadCards) {
        const topicId = t.id;
        const oldCards = loadCards(topicId);          // 기존 카드 불러오기
        const newCards = pendingUploadCards || [];    // 방금 업로드한 카드
        const merged = oldCards.concat(newCards);     // 기존 + 새거 합치기
        saveCards(topicId, merged);    
        showToast(`업로드 완료: ${pendingUploadCards.length}개`, 1500);
        awaitingUploadTarget = false;
        pendingUploadCards = null;
         //flipOpen(topicId, 1, 'f'); 업로드 후 해당 디테일 뷰 열기로 바꾸기
        return;
      }

      // 일반 동작
      if (deleteMode) {
        requestDelete(t.id);
      } else {
        openDetailView(t.id);
      }
    });

    // ✏️ 연필 클릭: 버블링 방지 + 이름 편집
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (deleteMode) {
        requestDelete(t.id);
      } else {
        openNamingPopup(t.id, t.name);
      }
    });

    el.appendChild(nameSpan);
    el.appendChild(editBtn);
    // 🔹 row 생성
    const row = document.createElement('div');
    row.className = 'topic-row';

    // 🔹 ▲ 버튼
    const upBtn = document.createElement('button');
    upBtn.className = 'topic-move up';
    upBtn.textContent = '▲';
    upBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      moveTopic(index, -1);
    });

    // 🔹 ▼ 버튼
    const downBtn = document.createElement('button');
    downBtn.className = 'topic-move down';
    downBtn.textContent = '▼';
    downBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      moveTopic(index, +1);
    });

    // 🔹 기존 el을 row 안으로
    row.appendChild(upBtn);
    row.appendChild(el);
    row.appendChild(downBtn);

    // 🔹 row를 wrap에 추가
    wrap.appendChild(row);

  });
  ensurePlaceholder();
}

function moveTopic(index, delta) {
  const target = index + delta;

  // 🔒 범위 보호
  if (target < 0 || target >= topics.length) return;

  // 🔄 배열 swap
  const temp = topics[index];
  topics[index] = topics[target];
  topics[target] = temp;

  // 💾 저장
  saveState();

  // 🔁 전체 재렌더
  render();
}

// ===== 버튼 동작 =====
function createTopic(){
  if (deleteMode) return;
  seq += 1;
  topics.push({ id: `t${seq}`, name: `새 주제` });
  saveState();
  render();
  const last = wrap.querySelector('.topic:last-child');
  if (last) last.scrollIntoView({block:'nearest', behavior:'smooth'});
}

addBtn.addEventListener('click', createTopic);
delBtn.addEventListener('click', enterDeleteMode);
upBtn.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt,text/plain';

  input.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1) 텍스트 읽기 + 개행/ BOM 정리
    const raw = await file.text();
    const text = raw.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

    // 2) @ → \n 로 바꾸는 정규화 함수
    const normalizeField = (s = '') => {
      if (!s) return s;

      // @. → 줄바꿈 + 투명 점
      // @  → 일반 줄바꿈
      return s
        .replace(/@\./g, '\n<span class="transparent-dot">.</span>\n')
        .split('@')
        .map(p => p.trim())
        .join('\n');
    };

    // === 루비 간이 표기 변환기 ===
    function convertRubySyntax(text) {
      if (!text) return text;

      // 1) {본문|루비내용} 패턴 ({base|ruby1^ruby2})
      text = text.replace(/\{([^|{}]+)\|([^{}]+)\}/g, (m, base, rubySpec) => {
        const rubies = rubySpec.split('^').filter(Boolean)
          .map(r => `<rt>${r}</rt>`).join('');
        return `<ruby>${base}${rubies}</ruby>`;
      });

      // 2) 단독 ^ 표기 (주^술)
      text = text.replace(/([\uAC00-\uD7A3\w]+(\^[\uAC00-\uD7A3\w]+)+)/g, (match) => {
        const parts = match.split('^').filter(Boolean);
        if (parts.length < 2) return match;
        const base = parts[0];
        const rubies = parts.slice(1).map(rt => `<rt>${rt}</rt>`).join('');
        return `<ruby>${base}${rubies}</ruby>`;
      });

      // 3) 괄호 → <small> 변환
      text = text.replace(/\(([^()]+)\)/g, '<small>$1</small>');
      
      // 4) 대괄호 → <span class="mini">
      text = text.replace(/\[([^\[\]]+)\]/g, '<span class="mini">$1</span><br>');

      return text;
    }

    // 3) 줄 파싱 (세미콜론은 첫 1회만 분리)
    const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
    const cards = [];
    for (const line of lines) {
      const [leftRaw = '', rightRaw = ''] = line.split(';', 2);
      // 필드 정규화
      const L = normalizeField(leftRaw);
      const R = normalizeField(rightRaw);

      // 루비 자동 변환
      let L2 = convertRubySyntax(L);
      let R2 = convertRubySyntax(R);

      // ✅ 자동 중앙 보정용 투명 줄 추가
      L2 = autoAddTransparentDot(L2);
      R2 = autoAddTransparentDot(R2);

      cards.push({ f: L2, b: R2 });


    }

    if (!cards.length) {
      showToast('유효한 줄이 없습니다.', 2000);
      return;
    }

    // 4) 업로드 타깃 선택 대기
    pendingUploadCards = cards;
    awaitingUploadTarget = true;

    if (typeof exitDeleteMode === 'function') exitDeleteMode();
    const main = document.getElementById('screen');
    const bottom = document.querySelector('.bottom');
    if (document.getElementById('detailScreen')) document.getElementById('detailScreen').style.display = 'none';
    if (document.getElementById('flipScreen')) document.getElementById('flipScreen').style.display = 'none';
    main.style.display = 'block';
    bottom.style.display = 'grid';

    showToast('업로드할 주제를 선택하세요', 2200);
  };

  input.click();
});

function autoAddTransparentDot(html) {
  if (!html) return html;

  // mini 또는 ruby가 포함되어 있으면
  const hasMini = /class=["']mini["']/.test(html);
  const hasRuby = /<ruby[\s>]/.test(html);

  if (!hasMini && !hasRuby) return html;

  // 이미 transparent-dot이 있으면 중복 방지
  if (/transparent-dot/.test(html)) return html;

  // 마지막에 줄 + 투명 점 추가
  return html + '<br><span class="transparent-dot">.</span>';
}

if (cancelDeleteBtn){
  cancelDeleteBtn.addEventListener('click', () => {
    exitDeleteMode();
    showToast('삭제 모드를 취소하였습니다', 1200);
  });
}

// ESC로 삭제 모드 해제
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape' && deleteMode) exitDeleteMode();
});

const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    if (confirm("정말 모든 데이터를 초기화하시겠습니까?")) {
      localStorage.clear();
      location.reload();
    }
  });
}

// s(서치) 버튼 위임 리스너 — 화면이 바뀌어도 1회 등록으로 동작
document.addEventListener('click', (e)=>{
  const t = e.target;
  if (!t) return;

  if (t.id === 'flipSearch')      { openSearchPrompt('flip');    }
  else if (t.id === 'curSearch')  { openSearchPrompt('curtain'); }
  else if (t.id === 'memSearch')  { openSearchPrompt('memory');  }
});

/* ===== 검색 유틸 ===== */
const searchCtx = { mode:null, topicId:null, results:[], pos:0, query:'' };

function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, '').trim(); } // 공백 무시
function pulse(el){ if(!el) return; el.classList.remove('qysm-pulse'); void el.offsetWidth; el.classList.add('qysm-pulse'); }

/* 카드 배열에서 모드별 매칭 리스트 만들기 */
function searchCards(topicId, mode, qRaw) {
  const q = norm(qRaw);
  if (!q) return [];
  const cards = loadCards(topicId) || [];
  const out = [];
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i] || {};
    const f = norm(c.f), b = norm(c.b);
    if (mode === 'memory') {                     // 암기: q(=f)만 검색
      if (f && f.includes(q)) out.push({ idx: i + 1, side: 'q' });
    } else {                                    // 플립/휘장: f,b 모두 검색
      if (f && f.includes(q)) out.push({ idx: i + 1, side: 'f' });
      if (b && b.includes(q)) out.push({ idx: i + 1, side: 'b' });
    }
  }
  return out;
}

// HTML 안전 이스케이프
function escHTML(s) { return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

// 공백 무시 부분검색 정규식 빌더 
function buildLooseRe(q) {
  const raw = String(q || '').replace(/\s+/g, '');                          // 공백 제거
  const esc = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');                 // 정규식 이스케이프
  return new RegExp(esc.split('').join('\\s*'), 'gi');                    // 문자 사이 공백 허용
}

// 원문에 하이라이트 적용(공백 무시 매칭)
function highlightLoose(src, q) {
  if (!src) return '';
  const re = buildLooseRe(q);
  return escHTML(src).replace(re, m => `<mark class="hl">${escHTML(m)}</mark>`);
}

/* ===== 검색 입력 팝업 ===== */
let _searchPopup, _searchInput;

moveSearchGo.addEventListener('click', () => {
  runSearchDirect(window._moveMode, moveSearchInput.value);
  closeMovePopup();
});

function runSearchDirect(mode, query) {
  searchCtx.mode = mode;
  searchCtx.topicId = currentTopicId;
  const res = searchCards(searchCtx.topicId, mode, query);
  if (!res.length) { showToast('검색 결과가 없습니다', 1200); return; }
  if (res.length === 1) { goToSearchResult(res[0]); return; }
  showToast(`중복 결과 ${res.length}건 — 이전/다음으로 선택`, 1200);
  openDupPopup(query, res);
}

function openSearchPrompt(mode){
  searchCtx.mode = mode;
  searchCtx.topicId = currentTopicId;

  if (!_searchPopup){
    _searchPopup = document.createElement('div');
    _searchPopup.className = 'namingPopup';
    _searchPopup.innerHTML = `
      <div class="namingPopup__panel" role="dialog" aria-label="검색">
        <div class="namingPopup__title">텍스트 검색</div>
        <input class="namingPopup__input" id="qysmSearchInput" placeholder="검색어(띄어쓰기 무시)" />
        <div class="namingPopup__actions">
          <button class="btn" id="qysmSearchCancel">취소</button>
          <button class="btn btn-primary" id="qysmSearchOk">검색</button>
        </div>
      </div>`;
    document.body.appendChild(_searchPopup);
    _searchInput = _searchPopup.querySelector('#qysmSearchInput');
    _searchPopup.addEventListener('click', (e)=>{ if(e.target===_searchPopup) closeSearchPrompt(); });
    _searchPopup.querySelector('#qysmSearchCancel').addEventListener('click', closeSearchPrompt);
    _searchPopup.querySelector('#qysmSearchOk').addEventListener('click', runSearchFromPrompt);
  }
  _searchInput.value = '';
  _searchPopup.style.display = 'flex';
  document.body.classList.add('naming-open');
  setTimeout(()=>_searchInput.focus(), 0);
}
function closeSearchPrompt(){
  if (_searchPopup) _searchPopup.style.display='none';
  document.body.classList.remove('naming-open');
}
async function runSearchFromPrompt(){
  const q = _searchInput.value;
  const res = searchCards(searchCtx.topicId, searchCtx.mode, q);
  closeSearchPrompt();
  if (!res.length){ showToast('검색 결과가 없습니다', 1200); return; }
  if (res.length===1){ goToSearchResult(res[0]); return; }
  showToast(`중복 결과 ${res.length}건 — 이전/다음으로 선택`, 1200);
  openDupPopup(q, res); // 중복 팝업
}

/* ===== 중복(여러 개) 네비 팝업 ===== */
let _dupPopup, _dupLabel;
function openDupPopup(q, results){
  searchCtx.results = results;
  searchCtx.pos = 0;
  searchCtx.query = q; 
  if (!_dupPopup){
    _dupPopup = document.createElement('div');
    _dupPopup.className = 'namingPopup';
    _dupPopup.innerHTML = `
    <div class="namingPopup__panel" role="dialog" aria-label="중복 검색 결과">
      <div class="namingPopup__title">중복 결과</div>
      <div id="qysmDupStatus" style="margin-bottom:8px; font-size:12px; color:var(--muted); text-align:right;"></div>
      <div id="qysmDupPreview" style="border:1px solid var(--line); color:var(--text); white-space:pre-wrap; background:var(--surface-2); border-radius:10px; padding:16px; min-height:120px; font-size:20px; line-height:1.5; text-align:center; margin-bottom:12px;"></div>
      <div class="namingPopup__actions" style="justify-content:space-between; gap:12px;">
        <button class="btn" id="qysmDupPrev">이전</button>
        <button class="btn btn-primary" id="qysmDupConfirm">확인</button>
        <button class="btn" id="qysmDupNext">다음</button>
      </div>
    </div>`;

    document.body.appendChild(_dupPopup);
    _dupLabel = _dupPopup.querySelector('#qysmDupLabel');
    _dupPopup.addEventListener('click', (e)=>{ if(e.target===_dupPopup) closeDupPopup(); });
    _dupPopup.querySelector('#qysmDupPrev').addEventListener('click', ()=>{ moveDup(-1); });
    _dupPopup.querySelector('#qysmDupNext').addEventListener('click', ()=>{ moveDup(+1); });
    _dupPopup.querySelector('#qysmDupConfirm').addEventListener('click', () => { const cur = searchCtx.results[searchCtx.pos]; closeDupPopup(); closeMovePopup(); goToSearchResult(cur); });
  }
  _dupPopup.style.display = 'flex';
  _dupPopup.style.zIndex = '2000';
  document.body.classList.add('naming-open');
  renderDupView();
}
function closeDupPopup(){ if (_dupPopup) _dupPopup.style.display='none'; document.body.classList.remove('naming-open'); }
function moveDup(delta){
  const n = searchCtx.results.length;
  searchCtx.pos = ( (searchCtx.pos + delta) % n + n ) % n; // 순환
  renderDupView();
}
function renderDupView() {
  const { results, pos, topicId, query } = searchCtx;
  const item = results[pos]; if (!item) return;

  // 1) 상단 상태: 1/n 만 표시 (앞/뒤/질문 표기 제거)
  const statusEl = _dupPopup.querySelector('#qysmDupStatus');
  if (statusEl) statusEl.textContent = `${pos + 1}/${results.length}`;

  // 2) 본문: 해당 팝업(해당 면)의 내용 자체를 크게 표시
  const cards = loadCards(topicId) || [];
  const c = cards[item.idx - 1] || {};
  const src = (item.side === 'b') ? c.b : c.f;              // 면 표시는 쓰지 않되, 내용은 맞는 면을 사용
  const html = highlightLoose(src || '', query || '');      // 공백 무시 부분검색 하이라이트 유지

  const box = _dupPopup.querySelector('#qysmDupPreview');
  if (box) box.innerHTML = html || '<span style="color:var(--muted)">내용 없음</span>';
}

/* ===== 결과로 이동 ===== */
function goToSearchResult(item){
  const { mode, topicId } = searchCtx;
  if (!item) return;

  if (mode==='flip'){
    // 맞은 면으로 열기
    flipOpen(topicId, item.idx, (item.side==='b'?'b':'f'));
    // 시각 강조
    const el = document.querySelector('#flipScreen .flip-card');
    pulse(el);
  }
  else if (mode==='curtain'){
    curtainOpen(topicId, item.idx);
    // 맞은 면(top/bottom) 강조
    const tgt = (item.side==='b' ? document.querySelector('#curtainScreen .cur-bottom .cur-text')
                                 : document.querySelector('#curtainScreen .cur-top .cur-text'));
    pulse(tgt);
  }
  else if (mode==='memory'){
    memoryOpen(topicId, item.idx);
    const el = document.querySelector('#memoryScreen .mem-q');
    pulse(el);
  }
  showToast(`#${item.idx}로 이동`, 900);
}

/* ====== AUTO (a) ====== */
const autoCtx = { running: false, paused: false, mode: null, topicId: null, i: 1, mainMs: 3000, revealMs: 1000, tm: null, startAt: 0, remain: 0, cb: null, ui: null };

/* 현재 모드의 루트(#flipScreen/#curtainScreen/#memoryScreen)와 인덱스 읽기 */
function getModeRoot(mode) {
  return document.getElementById(mode === 'flip' ? 'flipScreen' : mode === 'curtain' ? 'curtainScreen' : 'memoryScreen');
}
function getAutoStartIndex(mode) {
  if (mode === 'flip') { const el = document.getElementById('flipIndexLabel'); return parseInt(el?.textContent || '1', 10) || 1; }
  if (mode === 'curtain') { const el = document.getElementById('curIndexLabel'); return parseInt(el?.textContent || '1', 10) || 1; }
  const el = document.getElementById('memIndexLabel'); return parseInt(el?.textContent || '1', 10) || 1;
}

/* 카드 총 개수 */
function getCardCount(topicId) { const arr = (loadCards && loadCards(topicId)) || []; return arr.length; }

/* 오토 제어 오버레이 */
function showAutoControls(mode) {
  const root = getModeRoot(mode);
  if (!root) return;

  // 🔥 이미 있으면 현재 root로 이동
  if (autoCtx.ui) {
    autoCtx.ui.remove();
  }

  const wrap = document.createElement('div');
  wrap.className = 'auto-ctrls';
  wrap.innerHTML = `
    <button id="autoPauseBtn" class="btn">⏸ 중지</button>
    <button id="autoStopBtn" class="btn">⏹ 정지</button>
  `;

  root.appendChild(wrap);
  autoCtx.ui = wrap;

  wrap.querySelector('#autoPauseBtn').addEventListener('click', autoPauseResume);
  wrap.querySelector('#autoStopBtn').addEventListener('click', () => autoStop('user'));

  updateAutoControls();
  autoCtx.ui.style.display = 'grid';
}

function hideAutoControls() { if (autoCtx.ui) autoCtx.ui.style.display = 'none'; }
function updateAutoControls() {
  const btn = autoCtx.ui?.querySelector('#autoPauseBtn');
  if (btn) btn.textContent = autoCtx.paused ? '▶ 재실행' : '⏸ 중지';
}

/* 타이머 (일시정지/재개 지원) */
function runTimer(ms, cb) {
  clearTimeout(autoCtx.tm);
  autoCtx.cb = cb; autoCtx.remain = ms; autoCtx.startAt = Date.now();
  autoCtx.tm = setTimeout(fireTimer, ms);
}
function fireTimer() { autoCtx.tm = null; const fn = autoCtx.cb; autoCtx.cb = null; if (fn) fn(); }
function autoPauseResume() {
  if (!autoCtx.running) return;
  if (!autoCtx.paused) {
    autoCtx.paused = true;
    if (autoCtx.tm) { clearTimeout(autoCtx.tm); autoCtx.tm = null; autoCtx.remain = Math.max(0, autoCtx.remain - (Date.now() - autoCtx.startAt)); }
  } else {
    autoCtx.paused = false;
    autoCtx.startAt = Date.now();
    autoCtx.tm = setTimeout(fireTimer, autoCtx.remain);
  }
  updateAutoControls();
}
function autoStop(reason) {
  if (!autoCtx.running) return;

  showAutoStopButton(autoCtx.mode, false); 

  clearTimeout(autoCtx.tm);
  autoCtx.tm = null;
  autoCtx.cb = null;

  autoCtx.running = false;
  autoCtx.paused = false;

  hideAutoControls();

  if (reason === 'home') showToast('오토 모드를 종료했습니다', 900);
}


/* 커튼 표시/해제 */
function setCurtainVisible(visible) {
  const el = document.querySelector('#curtainScreen .cur-bottom .cur-curtain');
  if (!el) return;
  el.style.display = visible ? '' : 'none';
}

/* 암기: 정답 선택(정답 요소에 data-correct="1"이 있으면 클릭, 없으면 텍스트 매칭) */
function clickMemoryCorrect(topicId, idx) {
  const opts = document.querySelectorAll('#memoryScreen .mem-opt');
  let target = null;
  for (const o of opts) { if (o.dataset && o.dataset.correct === '1') { target = o; break; } }
  if (!target) {
    const cards = (loadCards && loadCards(topicId)) || [];
    const c = cards[idx - 1] || {};
    const correct = (c && c.a) ? String(c.a).trim() : '';
    for (const o of opts) {
      const t = o.querySelector('.mem-opt__text'); if (t && t.textContent.trim() === correct) { target = o; break; }
    }
  }
  if (target) { target.click(); }
}

/* ===== 오토 실행 루프 ===== */
function autoCycle() {
  const { mode, topicId } = autoCtx;
  const total = getCardCount(topicId);
  if (autoCtx.i > total) { autoStop('end'); showToast('마지막 카드까지 자동 진행 완료', 1200); return; }

  if (mode === 'flip') {
    flipOpen(topicId, autoCtx.i, 'f');
    saveTopicIndex(topicId, autoCtx.i);
    runTimer(autoCtx.mainMs, () => {
      flipOpen(topicId, autoCtx.i, 'b');
      runTimer(1000, () => { autoCtx.i++; autoCycle(); });
    });
  }
  else if (mode === 'curtain') {
    curtainOpen(topicId, autoCtx.i);
    saveTopicIndex(topicId, autoCtx.i);
    setCurtainVisible(true);                        // u 가리기
    runTimer(autoCtx.mainMs, () => {
      setCurtainVisible(false);                     // 1초 노출
      runTimer(1000, () => { autoCtx.i++; setCurtainVisible(true); autoCycle(); });
    });
  }
  else if (mode === 'memory') {
    memoryOpen(topicId, autoCtx.i);
    saveTopicIndex(topicId, autoCtx.i);
    runTimer(autoCtx.mainMs, () => {
      clickMemoryCorrect(topicId, autoCtx.i);       // 정답 자동 선택
      runTimer(1000, () => { autoCtx.i++; autoCycle(); });
    });
  }
}

/* ===== 오토 입력 팝업 ===== */
const _autoPopup = document.getElementById('autoPopup');
const _autoInput = document.getElementById('qysmAutoSecs');

let _autoMode = null; // 🔥 현재 모드 보관

function openAutoPrompt(mode) {
  _autoMode = mode; 
  _autoPopup.style.display = 'flex';
  document.body.classList.add('naming-open');

  setTimeout(() => _autoInput.focus(), 0); //시작시 바로 키보드

  // 배경 클릭 닫기
  _autoPopup.onclick = (e) => {
    if (e.target === _autoPopup) closeAutoPrompt();
  };

  document.getElementById('qysmAutoCancel').onclick = closeAutoPrompt;

  document.getElementById('qysmAutoOk').onclick = () => {
    const n = parseInt(_autoInput.value, 10);
    if (!Number.isFinite(n) || n <= 0) {
      showToast('양의 정수를 입력하세요', 1200);
      return;
    }
    closeAutoPrompt();
    startAuto(mode, n);
  };
}

function closeAutoPrompt() {
  _autoPopup.style.display = 'none';
  document.body.classList.remove('naming-open');
}

function showAutoStopButton(mode, on) {
  if (mode === 'flip') {
    flipAutoBtn.style.display = on ? 'inline-flex' : '';
  }
  else if (mode === 'curtain') {
    curAutoBtn.style.display = on ? 'inline-flex' : '';
  }
  else if (mode === 'memory') {
    memAutoBtn.style.display = on ? 'inline-flex' : '';
  }
}

function startAuto(mode, seconds) {
  showAutoStopButton(mode, true);
  autoStop(); // 기존 오토 중지

  autoCtx.running = true;
  autoCtx.paused = false;
  autoCtx.mode = mode;
  autoCtx.topicId = currentTopicId ?? null;

  autoCtx.i =
    mode === 'flip' ? flipIndex :
      mode === 'curtain' ? curtainIndex :
        mode === 'memory' ? memoryIndex :
          1;

  autoCtx.mainMs = seconds * 1000;
  autoCtx.revealMs = 1000;

  showAutoControls(mode);
  autoCycle();
}


/* 홈 버튼시 모든 모드 종료 */
document.addEventListener('click', (e) => {
  const id = e.target && e.target.id;
  if (!id) return;

  // 어떤 홈 버튼이든…
  if (id === 'flipHomeBtn' || id === 'curHomeBtn' || id === 'memHomeBtn' || id === 'detailHomeBtn' || id === 'homeBtn') {
    const topicId = (typeof currentTopicId !== 'undefined') ? currentTopicId : null;
    turnOffAllRandomForTopic(topicId);   // ← 랜덤 끄기
    autoStop('home');                    // (이미 있으시면 유지)
  }
});


// a(오토) 버튼 전역 연결: flip/curtain/memory 모두 인식
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#flipAutoBtn, #flipAuto, #curAutoBtn, #curAuto, #memAutoBtn, #memAuto');
  if (!btn) return;

  const id = btn.id;
  const mode = id.startsWith('flip') ? 'flip'
    : id.startsWith('cur') ? 'curtain'
      : 'memory';

  openAutoPrompt(mode);
});

const autoTwo = document.getElementById('autoTwo');
const autoThree = document.getElementById('autoThree');
const autoFive = document.getElementById('autoFive');

function startAutoPreset(n) {
  closeAutoPrompt();          // 팝업 닫고
  startAuto(_autoMode, n);    // 🔥 즉시 실행
}

autoTwo?.addEventListener('click', () => startAutoPreset(2));
autoThree?.addEventListener('click', () => startAutoPreset(3));
autoFive?.addEventListener('click', () => startAutoPreset(5));

/* ===== Random (R) ===== */
const randState = { flip: {}, curtain: {}, memory: {} };

function getCardCount(topicId) { const arr = (loadCards && loadCards(topicId)) || []; return arr.length; }

function _rs(mode, topicId) {
  const M = randState[mode];
  if (!M[topicId]) {
    const key = `rand:${mode}:${topicId}`;
    const on = localStorage.getItem(key) === '1';
    M[topicId] = { on, queue: [] };
  }
  return M[topicId];
}
function _saveRand(mode, topicId) {
  localStorage.setItem(`rand:${mode}:${topicId}`, _rs(mode, topicId).on ? '1' : '0');
}

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1) | 0);[a[i], a[j]] = [a[j], a[i]]; } return a; }

function updateRandUI(mode, topicId) {
  const id = mode === 'flip' ? 'flipRandBtn' : mode === 'curtain' ? 'curRandBtn' : 'memRandBtn';
  const btn = document.getElementById(id);
  const on = _rs(mode, topicId).on;
  if (btn) {
    btn.textContent = on ? '🔀*' : '🔀';   // 켜짐 표시
    btn.classList.toggle('chip-on', on); // (선택) 스타일 훅
  }
}

function toggleRandom(mode) {
  const topicId = (typeof currentTopicId !== 'undefined') ? currentTopicId : null;
  if (!topicId) return;
  const st = _rs(mode, topicId);
  st.on = !st.on; st.queue = [];
  _saveRand(mode, topicId);
  updateRandUI(mode, topicId);
  showToast(st.on ? '랜덤 모드: ON' : '랜덤 모드: OFF', 900);
}

function randNextIndex(mode, topicId, currentIdx) {
  const st = _rs(mode, topicId);
  if (!st.on) return currentIdx + 1;               // 평소 로직
  const total = getCardCount(topicId);
  if (!st.queue || st.queue.length === 0) {
    const arr = Array.from({ length: total }, (_, i) => i + 1).filter(n => n !== currentIdx); // 현재는 제외
    shuffle(arr);
    st.queue = arr;
  }
  const n = st.queue.shift();
  return n ?? currentIdx;
}

document.addEventListener('click', (e) => {
  const b = e.target && e.target.closest('#flipRandBtn,#curRandBtn,#memRandBtn');
  if (b) {
    const id = b.id;
    const mode = id === 'flipRandBtn' ? 'flip' : id === 'curRandBtn' ? 'curtain' : 'memory';
    toggleRandom(mode);
  }
});

// 모든 모드의 랜덤을 OFF로(해당 토픽 기준)
function turnOffAllRandomForTopic(topicId) {
  if (!topicId) return;
  ['flip', 'curtain', 'memory'].forEach(mode => {
    const st = _rs(mode, topicId);     // 상태 객체 확보
    st.on = false;                     // 끄기
    st.queue = [];                     // 큐 비우기
    _saveRand(mode, topicId);          // 로컬스토리지 반영
    updateRandUI(mode, topicId);       // 화면에 R/R* 갱신(해당 모드 화면이 열려있을 때)
  });
}

/* ===== Hint(공유 메모): 카드별 힌트 저장 ===== */
// 카드별 고유 힌트 키 (index 기준)
function hintKeyForCard(topicId, index) {
  return `hint:${topicId}:${index}`;
}

// ✅ 기존 방식(텍스트 기반)도 병행 지원 — 이전 데이터 호환용
function hintKeyForText(s) {
  const norm = String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  return 'hint:' + encodeURIComponent(norm);
}

// 힌트 불러오기 (카드 인덱스 우선, 없으면 텍스트 기반)
function getHint(topicId, index, text) {
  try {
    const byCard = localStorage.getItem(hintKeyForCard(topicId, index));
    if (byCard !== null) return byCard;
    const byText = localStorage.getItem(hintKeyForText(text));
    return byText || '';
  } catch (_) { return ''; }
}

// 힌트 저장 (카드 인덱스 기반)
function setHint(topicId, index, text, value) {
  try {
    localStorage.setItem(hintKeyForCard(topicId, index), String(value || ''));
  } catch (_) { }
}

// 현재 화면에서 "보이는 텍스트" 추출 (모드별)
function getVisibleTextFor(mode) {
  if (mode === 'flip') {
    const el = document.querySelector('#flipScreen .flip-card');
    return el ? el.textContent : '';
  }
  if (mode === 'curtain') {
    const cur = document.querySelector('#curtainScreen .cur-bottom .cur-curtain');
    const on = cur && cur.style.display !== 'none';
    const top = document.querySelector('#curtainScreen .cur-top .cur-text');
    const bot = document.querySelector('#curtainScreen .cur-bottom .cur-text');
    return on ? (top?.textContent || '') : (bot?.textContent || '');
  }
  const q = document.querySelector('#memoryScreen .mem-q');
  return q ? q.textContent : '';
}

/* ===== Hint Popup (모드 공통) ===== */
let _hintWrap, _hintEditBtn, _hintCloseBtn, _hintContent, _hintTextarea;
let _hintCurText = '', _hintMode = null, _hintIndex = null;

function ensureHintPopup() {
  if (_hintWrap) return;

  _hintWrap = document.getElementById('hintPopup');
  _hintEditBtn = _hintWrap.querySelector('.hintPopup__edit');
  _hintCloseBtn = _hintWrap.querySelector('.hintPopup__close');
  _hintContent = _hintWrap.querySelector('#hintContent');
  _hintTextarea = _hintWrap.querySelector('#hintTextarea');

  _hintWrap.addEventListener('click', (e) => {
    if (e.target === _hintWrap) closeHintPopup();
  });
  _hintCloseBtn.addEventListener('click', closeHintPopup);

  let saveTimer = null;
  function saveNow() {
    setHint(currentTopicId, _hintIndex, _hintCurText, _hintTextarea.value);
  }
  function debouncedSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 300);
  }

  _hintEditBtn.addEventListener('click', () => {
    const editing = _hintTextarea.style.display !== 'none';
    if (!editing) {
      _hintTextarea.style.display = 'block';
      _hintContent.style.display = 'none';
      _hintTextarea.focus();
      _hintTextarea.selectionStart = _hintTextarea.value.length;
    } else {
      _hintTextarea.style.display = 'none';
      _hintContent.style.display = 'block';
      saveNow();
      _hintContent.textContent = _hintTextarea.value || '(힌트 없음)';
    }
  });

  _hintTextarea.addEventListener('input', debouncedSave);
}

function openHintPopupFor(mode) {
  ensureHintPopup();
  _hintMode = mode;
  _hintCurText = getVisibleTextFor(mode) || '';

  // 현재 인덱스 추출 (모드별 전역 인덱스 변수)
  if (mode === 'flip') _hintIndex = flipIndex - 1;
  else if (mode === 'curtain') _hintIndex = curtainIndex - 1;
  else if (mode === 'memory') _hintIndex = memoryIndex - 1;

  const val = getHint(currentTopicId, _hintIndex, _hintCurText);

  _hintContent.textContent = val || '(힌트 없음)';
  _hintTextarea.value = val || '';
  _hintTextarea.style.display = 'none';
  _hintContent.style.display = 'block';

  _hintWrap.style.display = 'flex';
  document.body.classList.add('naming-open');
}

function closeHintPopup() {
  if (!_hintWrap) return;
  _hintWrap.style.display = 'none';
  document.body.classList.remove('naming-open');
}

// === 힌트 버튼 연결 (모드별 공통) ===
document.addEventListener('click', (e) => {
  const btn = e.target && e.target.closest('#flipHint,#curHint,#memHint');
  if (!btn) return;
  const id = btn.id;
  const mode = id === 'flipHint' ? 'flip' : id === 'curHint' ? 'curtain' : 'memory';
  openHintPopupFor(mode);
});

// swipe-nav.js (또는 기존 JS 하단)
(function () {
  const THRESHOLD = 40;      // 최소 가로 이동(px)
  const MAX_OFF_AXIS = 60;   // 세로 허용치(px)
  const MAX_DURATION = 800;  // 길게 끄는 제스처 무시(ms)
  const COOLDOWN = 250;      // 연속 트리거 방지(ms)

  function isInteractive(el) {
    return el.closest('button, a, input, textarea, select, label, [contenteditable], .no-swipe');
  }

  function attachSwipe(el, onPrev, onNext) {
    if (!el) return;
    let startX = 0, startY = 0, t0 = 0, tracking = false, locked = false;

    // 수직 스크롤을 허용하고 수평 제스처만 잡기 위함
    el.style.touchAction = 'pan-y';

    function onDown(e) {
      if (locked) return;
      if (isInteractive(e.target)) return; // 클릭 요소에서 시작하면 패스
      const p = e.touches ? e.touches[0] : e;
      startX = p.clientX;
      startY = p.clientY;
      t0 = Date.now();
      tracking = true;
    }

    function onMove(e) {
      // 필요 시 진행중 시각효과를 넣을 수 있으나, 기본은 무시
    }

    function onUp(e) {
      if (!tracking || locked) return;
      const p = e.changedTouches ? e.changedTouches[0] : e;
      const dx = p.clientX - startX;
      const dy = p.clientY - startY;
      const dt = Date.now() - t0;
      tracking = false;

      // 오프축(세로)로 많이 움직였거나, 너무 느리거나, 짧으면 무시
      if (Math.abs(dy) > MAX_OFF_AXIS) return;
      if (dt > MAX_DURATION) return;
      if (Math.abs(dx) < THRESHOLD) return;

      locked = true;
      if (dx > 0) { onPrev && onPrev(); } else { onNext && onNext(); }
      setTimeout(() => (locked = false), COOLDOWN);
    }

    // Pointer Events(권장) — 환경에 따라 터치/마우스도 함께 커버
    el.addEventListener('pointerdown', onDown, { passive: true });
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerup', onUp, { passive: true });
    el.addEventListener('pointercancel', () => (tracking = false), { passive: true });

    // (구형 브라우저 대비) 터치 이벤트 백업 — 필요 없으면 생략 가능
    el.addEventListener('touchstart', onDown, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: true });
    el.addEventListener('touchend', onUp, { passive: true });
    el.addEventListener('mousedown', onDown);
    el.addEventListener('mouseup', onUp);
  }

  // 전역 노출
  window.attachSwipeNav = attachSwipe;
})();

// 스와이프
attachSwipeNav(flipCard, () => flipPrev.click(), () => flipNext.click());
attachSwipeNav(memoryScreen, () => memPrev.click(), () => memNext.click());
attachSwipeNav(
  document.getElementById('starCard'),     // 카드 영역
  () => starPrev && starPrev.click(),      // 이전
  () => starNext && starNext.click()       // 다음
);

// === 휘장: Top 영역에서만 스와이프 ===
attachSwipeNav(
  document.getElementById('curTopArea'),
  () => curPrev && curPrev.click(),
  () => curNext && curNext.click()
);

// === 휘장: Under(아래) 영역에서도 스와이프 ===
attachSwipeNav(
  document.getElementById('curBottomArea'),
  () => curPrev && curPrev.click(),
  () => curNext && curNext.click()
);

document.getElementById("invertButton").addEventListener("click", () => {
  document.body.classList.toggle("inverted-mode");
});


// === 수정 팝업 ===
let editingIndex = null;
let editingSide = null;

// 팝업 열기
function openEditPopup(index, side) {
  const cards = loadCards(currentTopicId);
  if (!cards || !cards[index]) return;

  editingIndex = index;
  editingSide = side;

  const card = cards[index];
  const content = card[side] || '';
  document.getElementById('editInput').value = content;
  document.getElementById('editPopup').style.display = 'flex';
  document.body.classList.add('naming-open');
}

// 팝업 닫기
function closeEditPopup() {
  document.getElementById('editPopup').style.display = 'none';
  document.body.classList.remove('naming-open');
  editingIndex = null;
  editingSide = null;
}

// 취소 버튼
document.getElementById('editCancelBtn').onclick = closeEditPopup;

// 저장 버튼
document.getElementById('editSaveBtn').onclick = () => {
  const cards = loadCards(currentTopicId);
  if (editingIndex == null || editingSide == null || !cards[editingIndex]) return;

  const newText = document.getElementById('editInput').value.trim();
  cards[editingIndex][editingSide] = newText;

  saveCards(currentTopicId, cards);
  closeEditPopup();
  showToast('수정 완료', 1500);

  // 현재 모드 재렌더
  if (document.getElementById('flipScreen').style.display !== 'none') renderFlipCard();
  if (document.getElementById('curtainScreen').style.display !== 'none') renderCurtainCard();
  if (document.getElementById('memoryScreen').style.display !== 'none') renderMemoryCard();
};

// ESC / ENTER 키 지원
document.addEventListener('keydown', (e) => {
  const popup = document.getElementById('editPopup');
  if (popup.style.display !== 'none') {
    if (e.key === 'Escape') closeEditPopup();
    if (e.key === 'Enter') document.getElementById('editSaveBtn').click();
  }
});

// 팝업 바깥 클릭 → 닫기
document.getElementById('editPopup').addEventListener('click', (e) => {
  if (e.target === document.getElementById('editPopup')) closeEditPopup();
});

// 💎 버튼 추가 함수
function addEditButton(container, card, side, index) {
  // 중복 방지
  const existing = container.querySelector('.edit-btn');
  if (existing) return;

  const btn = document.createElement('button');
  btn.textContent = '💎';
  btn.className = 'edit-btn';
  btn.style.position = 'absolute';
  btn.style.left = '8px';
  btn.style.top = '8px';
  btn.style.zIndex = '10';
  btn.style.background = 'transparent';
  btn.style.border = 'none';
  btn.style.cursor = 'pointer';

  btn.addEventListener('click', (e) => {
    e.stopPropagation();

    const currentIndex =
      container === flipCard ? flipIndex :
        container === curTopText || container === curBottomText ? curtainIndex :
          memoryIndex;

    openEditPopup(currentIndex - 1, side);
  });

  container.style.position = 'relative';
  container.appendChild(btn);
}

// ⚡ 버튼 추가 함수 (공통 동작)
function addLightningButton(container) {
  // 중복 방지
  if (container.querySelector('.lightning-btn')) return;

  const btn = document.createElement('button');
  btn.textContent = '⚡';
  btn.className = 'lightning-btn';
  btn.style.position = 'absolute';
  btn.style.left = '40px'; // 💎 바로 옆
  btn.style.top = '8px';
  btn.style.zIndex = '10';
  btn.style.background = 'transparent';
  btn.style.border = 'none';
  btn.style.cursor = 'pointer';

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleLightningAction();
  });

  container.appendChild(btn);
}

// ⚙️ 설정 팝업 토글
const profileBtn = document.querySelector(".fab");
const settingsPopup = document.getElementById("settingsPopup");

profileBtn.addEventListener("click", () => {
  settingsPopup.classList.toggle("active");
});

// 팝업 바깥 클릭 시 닫기
document.addEventListener("click", (e) => {
  if (!settingsPopup.contains(e.target) && !profileBtn.contains(e.target)) {
    settingsPopup.classList.remove("active");
  }
});

// 도움말 팝업 열기
const popupGuideBtn = document.getElementById("popupGuideBtn");
const guidePopup = document.getElementById("guidePopup");

popupGuideBtn.addEventListener("click", () => {
  guidePopup.classList.toggle("active");
});

document.addEventListener("click", (e) => {
  if (!guidePopup.contains(e.target) && !popupGuideBtn.contains(e.target)) {
    guidePopup.classList.remove("active");
  }
});

// 🔄 리셋 버튼
document.getElementById("popupResetBtn").addEventListener("click", () => {
  if (confirm("정말 모든 데이터를 초기화할까요?")) {
    localStorage.clear();
    alert("로컬 데이터가 모두 삭제되었습니다.");
    location.reload();
  }
});

// ☯ 반전 버튼 (토글 + 저장)
document.getElementById("popupInvertBtn").addEventListener("click", () => {
  document.body.classList.toggle("inverted-mode");
  const state = document.body.classList.contains("inverted-mode");
  localStorage.setItem("invertedMode", state);
  settingsPopup.classList.remove("active");
});

// 💾 로컬 사용량 확인 버튼
document.getElementById("popupStorageBtn").addEventListener("click", () => {
  const used = new Blob(Object.values(localStorage)).size;
  const limit = 5 * 1024 * 1024; // 약 5MB
  const percent = ((used / limit) * 100).toFixed(2);
  const remaining = (limit - used).toLocaleString();

  const msg = `📦 사용량: ${(used / 1024).toFixed(1)}KB (${percent}%)\n남은 용량: ${remaining} bytes`;
  showToast(msg);
});

// 💬 간단한 토스트 함수
function showTransientToast(message, ms = 2000) {
  if (typeof window.showToast === 'function' && window.showToast !== showTransientToast) {
    try { window.showToast(message, ms); return; } catch (e) { /* 위임 실패: 계속 진행 */ }
  }
  let t = document.createElement('div');
  t.textContent = message;
  t.style.position = 'fixed';
  t.style.bottom = '20px';
  t.style.left = '50%';
  t.style.transform = 'translateX(-50%)';
  t.style.background = 'rgba(0,0,0,0.8)';
  t.style.color = '#fff';
  t.style.padding = '10px 18px';
  t.style.borderRadius = '8px';
  t.style.fontSize = '14px';
  t.style.zIndex = '3000';
  t.style.width = '80vw';
  t.style.whiteSpace = 'pre-line';
  t.style.pointerEvents = 'none';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

// === 백업(토픽 선택 → txt 생성) 기능 추가 ===
// 상태 변수
let awaitingBackupSelection = false;
let _backupTimer = null;

// 유틸: 파일 다운로드
function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// === (교체할) 백업 텍스트 생성: 간략형 b;f, 줄바꿈 -> @, 헤더 없음 ===

// 안전한 파일명(토픽명만 사용). 특수문자 제거, 공백 -> _
function safeFileName(s) {
  return String(s || 'topic').replace(/[\\/:*?"<>|]+/g, '_').trim().replace(/\s+/g, '_');
}

// 한 필드(예: b 또는 f)의 내부 줄바꿈을 '@'로 바꿔주는 유틸
function normalizeFieldText(raw) {
  if (raw == null) return '';
  // CRLF, CR, LF 모두 처리
  let t = String(raw);
  // 줄바꿈 연속은 한 개의 @ 로 대체 (연속 줄바꿈을 유지할 필요 없으므로)
  t = t.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  // 줄바꿈을 '@'로 변환
  t = t.split('\n').map(s => s.trim()).filter(s => s.length > 0).join('@');
  return t;
}

// 토픽의 카드 데이터를 간단한 "b;f" 리스트로 만듦
function makeBackupTextForTopic(topicId) {
  const t = topics.find(x => x.id === topicId);
  const cards = loadCards(topicId) || [];
  let lines = [];

  cards.forEach((c) => {
    // 업로드/내부 구조에 따라 플립(front/back)의 키명을 확인.
    // 기존 프로젝트에서 'f'가 front(앞면), 'b'가 back(뒷면)이라 가정함.
    // 사용자 요청대로 "프론트(f)"를 앞쪽에, "백(b)"을 뒤쪽에 둔다.
    const frontRaw = c.f != null ? c.f : (c.front != null ? c.front : '');
    const backRaw = c.b != null ? c.b : (c.back != null ? c.back : '');

    const front = normalizeFieldText(frontRaw);
    const back = normalizeFieldText(backRaw);

    // 둘 다 비어있으면 해당 카드는 건너뜀
    if (!back && !front) return;

    // F;B 형식 (둘 중 하나만 있으면 빈칸 대신 빈 문자열)
    lines.push(`${front};${back}`);
  });

  // 각 카드 라인 사이에는 줄바꿈 하나만 넣음
  return lines.join('\n');
}

// 백업 모드 시작: 5초 동안 메인 화면에서 토픽 선택 허용
function startBackupSelectionWindow(timeoutMs = 5000) {
  // 이미 대기 중이면 재시작(타이머 리셋)
  awaitingBackupSelection = true;
  // 닫기: 설정 팝업 닫아주기
  settingsPopup.classList.remove('active');

  showToast('백업할 주제를 선택하세요', 3000);

  clearTimeout(_backupTimer);
  _backupTimer = setTimeout(() => {
    // 타임아웃: 대기 상태 해제하고 설정 팝업 다시 열기
    awaitingBackupSelection = false;
    settingsPopup.classList.add('active');
    showToast('백업 선택 시간이 만료되어 설정을 다시 엽니다', 1500);
  }, timeoutMs);
}

// 백업 취소(선택 완료 또는 강제 취소)
function cancelBackupSelection() {
  awaitingBackupSelection = false;
  clearTimeout(_backupTimer);
  _backupTimer = null;
}

// ===============================
// 백업 버튼 클릭 → 백업 선택 모드 진입
// ===============================
const popupBackupBtn = document.getElementById('popupBackupBtn');
if (popupBackupBtn) {
  popupBackupBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startBackupSelectionWindow(5000); // 5초간 백업 선택 모드
  });
}

// ===============================
// 메인 화면(토픽 리스트) 클릭 가로채기
// - 백업 모드일 때는 기존 토픽 클릭 동작을 완전히 차단
// - 반드시 capture 단계(true)에서 처리
// ===============================
const topicWrapEl = document.getElementById('topicWrap');
if (topicWrapEl) {
  topicWrapEl.addEventListener('click', (e) => {
    // 백업 선택 모드가 아니면 아무 것도 하지 않음
    if (!awaitingBackupSelection) return;

    // 🔥 기존 토픽 클릭 동작 완전 차단
    e.preventDefault();
    e.stopPropagation();

    // 실제 토픽 버튼 탐색
    const topicEl = e.target.closest('.topic');
    if (!topicEl) return;

    // -------------------------------
    // 토픽 ID 식별
    // -------------------------------
    let selectedTopicId = null;

    const tidAttr = topicEl.dataset?.id;
    if (tidAttr != null) {
      selectedTopicId = isNaN(tidAttr) ? tidAttr : Number(tidAttr);
    }

    // dataset.id가 없을 경우 이름으로 보조 탐색
    if (selectedTopicId == null) {
      const nameNode = topicEl.querySelector('.topic__name') || topicEl;
      const name = nameNode?.textContent?.trim();
      if (name) {
        const found = topics.find(t => (t.name || '').trim() === name);
        if (found) selectedTopicId = found.id;
      }
    }

    if (selectedTopicId == null) {
      showToast('선택된 주제를 식별할 수 없습니다', 1500);
      return;
    }

    // -------------------------------
    // 백업 수행
    // -------------------------------
    cancelBackupSelection(); // 백업 선택 모드 종료

    const topic = topics.find(t => t.id === selectedTopicId);
    const text = makeBackupTextForTopic(selectedTopicId);
    const topicName = topic ? (topic.name || 'topic') : String(selectedTopicId);
    const fname = `${safeFileName(topicName)}.txt`;

    downloadText(fname, text);
    showToast('백업 파일을 생성하였습니다', 1600);

  }, true); // 🔥 반드시 capture = true
}


// ===== 키보드 네비게이션 (좌/우/위 화살표) =====
document.addEventListener('keydown', (e) => {
  const isVisible = (el) => el && el.style.display !== 'none';

  // ◀ 이전 카드
  if (e.key === 'ArrowLeft') {
    if (isVisible(starScreen)) starPrev.click();
    else if (isVisible(flipScreen)) flipPrev.click();
    else if (isVisible(curtainScreen)) curPrev.click();
    else if (isVisible(memoryScreen)) memPrev.click();
  }

  // ▶ 다음 카드
  if (e.key === 'ArrowRight') {
    if (isVisible(starScreen)) starNext.click();
    else if (isVisible(flipScreen)) flipNext.click();
    else if (isVisible(curtainScreen)) curNext.click();
    else if (isVisible(memoryScreen)) memNext.click();
  }

  // ▲ 특수 토글
  if (e.key === 'ArrowUp') {
    if (isVisible(starScreen)) {
      // 북마크: 카드 앞/뒤 토글
      starCard.click();
    }
    else if (isVisible(flipScreen)) {
      // 플립: 카드 앞/뒤 토글
      flipCard.click();
    }
    else if (isVisible(curtainScreen)) {
      // 휘장: 보이기/가리기
      const isHidden = curCurtain.style.display === 'none';
      curCurtain.style.display = isHidden ? 'block' : 'none';
    }
    else if (isVisible(memoryScreen)) {
      // 퀴즈: 정답 1회 클릭
      const firstOpt = memOptions.querySelector('.mem-opt');
      if (firstOpt && !firstOpt.classList.contains('correct') && !firstOpt.classList.contains('wrong')) {
        firstOpt.click();
      }
    }
  }
});

function openMovePopup(max) {
  // 입력값 초기화
  moveInput.value = '';

  // ★ placeholder에 프롬프트 문구 자동 반영
  moveInput.placeholder = `이동할 번호(1~${max})를 입력하세요`;

  // 팝업 표시
  movePopup.style.display = 'flex';

  // 모바일 키보드 자동 오픈 
  setTimeout(() => { moveInput.focus(); }, 50);

  // 버튼에서 최대값 활용
  moveOk.dataset.max = max;
  moveJump.dataset.max = max;
  moveSuperJump.dataset.max = max;
}

function closeMovePopup() {
  movePopup.style.display = 'none';
}
moveCancel.addEventListener('click', closeMovePopup);

if (movePopup) {
  movePopup.addEventListener('click', (e) => {
    if (e.target === movePopup) {
      closeMovePopup();
    }
  });
}

moveOk.addEventListener('click', () => {
  const max = Number(moveOk.dataset.max);
  let n = Number(moveInput.value) || 1;
  n = Math.max(1, Math.min(max, n));

  applyMove(n);
  closeMovePopup();
});

moveJump.addEventListener('click', () => {
  const max = Number(moveJump.dataset.max);

  let current = getCurrentIndex();
  let n = Math.max(1, current - 10);

  applyMove(n);
  closeMovePopup();
});

moveSuperJump.addEventListener('click', () => {
  const max = Number(moveSuperJump.dataset.max);

  let current = getCurrentIndex();
  let n = Math.max(1, current - 20);

  applyMove(n);
  closeMovePopup();
});

function getCurrentIndex() {
  if (window._moveMode === 'flip') return flipIndex;
  if (window._moveMode === 'memory') return memoryIndex;
  if (window._moveMode === 'curtain') return curtainIndex;
  return 1;
}

function applyMove(n) {
  const cards = loadCards(currentTopicId);
  if (!cards.length) return;

  if (window._moveMode === 'flip') {
    flipIndex = n;
    flipSide = 'f';
    flipIndexLabel.textContent = `${flipIndex} / ${cards.length}`;
    renderFlipCard();
  }
  else if (window._moveMode === 'memory') {
    memoryIndex = n;
    memIndexLabel.textContent = `${memoryIndex} / ${cards.length}`;
    renderMemoryCard();
  }
  else if (window._moveMode === 'curtain') {
    curtainIndex = n;
    curIndexLabel.textContent = `${curtainIndex} / ${cards.length}`;
    renderCurtainCard();
    ensureCurtainVisible();
  }
  saveTopicIndex(currentTopicId, n);
}

function loadTopicProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
  } catch {
    return {};
  }
}

function getTopicIndex(topicId) {
  const progress = loadTopicProgress();
  return progress[topicId] ?? 0;
}

function saveTopicIndex(topicId, index) {
  const progress = loadTopicProgress();
  progress[topicId] = index;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

let pageMiniPopup = null;

function ensurePageMiniPopup() {
  if (pageMiniPopup) return;

  pageMiniPopup = document.createElement('div');
  pageMiniPopup.id = 'pageMiniPopup';
  pageMiniPopup.innerHTML = `
    <div class="page-mini-panel">
      <button class="page-mini-btn add">➕ 페이지 추가</button>
      <button class="page-mini-btn del">➖ 페이지 삭제</button>
    </div>
  `;

  document.body.appendChild(pageMiniPopup);

  // 바깥 클릭 → 닫기
  pageMiniPopup.addEventListener('click', (e) => {
    if (e.target === pageMiniPopup) closePageMiniPopup();
  });

  // 버튼 연결
  pageMiniPopup.querySelector('.add').addEventListener('click', () => {
    closePageMiniPopup();
    runInsertCurrentPage();
  });

  pageMiniPopup.querySelector('.del').addEventListener('click', () => {
    closePageMiniPopup();
    runDeleteCurrentPage();
  });
}

function openPageMiniPopup() {
  ensurePageMiniPopup();
  pageMiniPopup.style.display = 'flex';
  document.body.classList.add('naming-open');
}

function closePageMiniPopup() {
  if (!pageMiniPopup) return;
  pageMiniPopup.style.display = 'none';
  document.body.classList.remove('naming-open');
}

function runInsertCurrentPage() {
  if (!currentTopicId) return;

  if (flipScreen.style.display !== 'none') {
    insertEmptyCardNext(currentTopicId, flipIndex, 'flip');
  }
  else if (curtainScreen.style.display !== 'none') {
    insertEmptyCardNext(currentTopicId, curtainIndex, 'curtain');
  }
  else if (memoryScreen.style.display !== 'none') {
    insertEmptyCardNext(currentTopicId, memoryIndex, 'memory');
  }
}

function runDeleteCurrentPage() {
  if (!currentTopicId) return;

  const cards = loadCards(currentTopicId);
  if (!cards.length) return;

  let idx, mode;

  if (flipScreen.style.display !== 'none') {
    idx = flipIndex; mode = 'flip';
  }
  else if (curtainScreen.style.display !== 'none') {
    idx = curtainIndex; mode = 'curtain';
  }
  else if (memoryScreen.style.display !== 'none') {
    idx = memoryIndex; mode = 'memory';
  } else return;

  // 1-based → 0-based
  cards.splice(idx - 1, 1);

  if (!cards.length) {
    saveCards(currentTopicId, []);
    saveTopicIndex(currentTopicId, 0);
    showToast('마지막 페이지가 삭제되었습니다', 1200);
    return;
  }

  const nextIndex = Math.min(idx, cards.length);
  saveCards(currentTopicId, cards);
  saveTopicIndex(currentTopicId, nextIndex);

  // 모드별 반영
  if (mode === 'flip') {
    flipIndex = nextIndex;
    flipIndexLabel.textContent = `${flipIndex} / ${cards.length}`;
    renderFlipCard();
  }
  else if (mode === 'curtain') {
    curtainIndex = nextIndex;
    curIndexLabel.textContent = `${curtainIndex} / ${cards.length}`;
    renderCurtainCard();
    ensureCurtainVisible();
  }
  else if (mode === 'memory') {
    memoryIndex = nextIndex;
    memIndexLabel.textContent = `${memoryIndex} / ${cards.length}`;
    renderMemoryCard();
  }

  showToast('현재 페이지가 삭제되었습니다', 900);
}
// ===============================
// 사용자 폰트 전체 처리 (단일 코드)
// ===============================

// ---- IndexedDB 설정 ----
const FONT_DB_NAME = 'user-font-db';
const FONT_STORE_NAME = 'fonts';
const FONT_STORE_KEY = 'custom-font';

// ---- DB 열기 ----
function openFontDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(FONT_DB_NAME, 1);

    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(FONT_STORE_NAME)) {
        req.result.createObjectStore(FONT_STORE_NAME);
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---- DB 저장 ----
async function saveFontToDB(buffer, type) {
  const db = await openFontDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FONT_STORE_NAME, 'readwrite');
    tx.objectStore(FONT_STORE_NAME).put({ buffer, type }, FONT_STORE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---- DB 불러오기 ----
async function loadFontFromDB() {
  try {
    const db = await openFontDB();
    return new Promise((resolve) => {
      const tx = db.transaction(FONT_STORE_NAME, 'readonly');
      const req = tx.objectStore(FONT_STORE_NAME).get(FONT_STORE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// ---- 실제 폰트 적용 ----
function applyUserFont(blob) {
  const url = URL.createObjectURL(blob);

  const oldStyle = document.getElementById('userFontStyle');
  if (oldStyle) oldStyle.remove();

  const style = document.createElement('style');
  style.id = 'userFontStyle';
  style.textContent = `
    @font-face {
      font-family: 'UserCustomFont';
      src: url('${url}');
      font-display: swap;
    }
    :root {
      --app-font: 'UserCustomFont', "Pretendard", "Noto Sans KR", system-ui, sans-serif;
    }
  `;
  document.head.appendChild(style);
}

// ---- 설정 팝업: 폰트 선택 버튼 ----
const popupFontBtn = document.getElementById('popupFontBtn');

if (popupFontBtn) {
  popupFontBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ttf,.otf';

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const buffer = await file.arrayBuffer();
      const blob = new Blob([buffer], { type: file.type });

      // 즉시 적용
      applyUserFont(blob);

      // 저장
      await saveFontToDB(buffer, file.type);
      localStorage.setItem('userFontEnabled', '1');

      if (typeof showToast === 'function') {
        showToast('사용자 폰트가 적용되었습니다', 1200);
      }
    };

    input.click();
  });
}

// ---- 앱 시작 시 자동 복원 ----
(async function restoreUserFontOnStart() {
  if (localStorage.getItem('userFontEnabled') !== '1') return;

  const saved = await loadFontFromDB();
  if (!saved) return;

  const blob = new Blob([saved.buffer], { type: saved.type });
  applyUserFont(blob);
})();

// ===== 초기화 =====
loadState();
render();
document.getElementById('curTopText')?.classList.add('cur-text');
document.getElementById('curBottomText')?.classList.add('cur-text');
window.addEventListener("DOMContentLoaded", () => {
  const savedState = localStorage.getItem("invertedMode") === "true";
  if (savedState) document.body.classList.add("inverted-mode");
  restoreLightningState();
});
