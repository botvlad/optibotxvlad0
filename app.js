
// --- Реальное движение графика ---
let liveCandles = [];
function initCandles(pairName){
  let seed = 0;
  for(let i=0;i<pairName.length;i++) seed += pairName.charCodeAt(i);
  function rnd(){ seed = (seed * 9301 + 49297) % 233280; return seed/233280; }

  liveCandles = [];
  let prev = 100 + rnd()*40;
  for(let i=0;i<25;i++){
    const open = prev + (rnd()-0.5)*10;
    const close = open + (rnd()-0.5)*16;
    const high = Math.max(open,close) + rnd()*6;
    const low  = Math.min(open,close) - rnd()*6;
    liveCandles.push({open,close,high,low});
    prev = close;
  }
}
initCandles("EUR/USD");

function updateLiveCandles(){
  const last = liveCandles[liveCandles.length-1];
  const close = last.close + (Math.random()-0.5)*4;
  const high = Math.max(last.high, close + Math.random()*2);
  const low  = Math.min(last.low,  close - Math.random()*2);
  last.close = close;
  last.high = high;
  last.low = low;

  if(Math.random() < 0.1){
    const prev = last.close;
    const open = prev + (Math.random()-0.5)*8;
    const close2 = open + (Math.random()-0.5)*12;
    const high2 = Math.max(open,close2) + Math.random()*6;
    const low2  = Math.min(open,close2) - Math.random()*6;
    liveCandles.push({open,close:close2,high:high2,low:low2});
    if(liveCandles.length > 25) liveCandles.shift();
  }
}

function drawLiveChart(){
  const canvas = document.getElementById('simpleChart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const DPR = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * DPR;
  canvas.height = 320 * DPR;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  const w = canvas.clientWidth;
  const h = 320;

  ctx.fillStyle = '#0d1529';
  ctx.fillRect(0,0,w,h);

  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  for(let i=1;i<=4;i++){
    ctx.beginPath(); ctx.moveTo(0,i*h/5); ctx.lineTo(w,i*h/5); ctx.stroke();
  }

  const candles = liveCandles;
  const maxP = Math.max(...candles.map(x=>x.high));
  const minP = Math.min(...candles.map(x=>x.low));
  const scale = v => h - ((v - minP)/(maxP-minP)*h);
  const cw = w / candles.length;

  candles.forEach((c,i)=>{
    const x = i*cw + cw*0.12;
    const cx = x + cw*0.35;
    const yHigh=scale(c.high), yLow=scale(c.low), yOpen=scale(c.open), yClose=scale(c.close);
    const isBull = c.close >= c.open;
    ctx.beginPath(); ctx.moveTo(cx,yHigh); ctx.lineTo(cx,yLow);
    ctx.strokeStyle = isBull?'#00e676':'#ff5252'; ctx.lineWidth=2; ctx.stroke();
    const top=Math.min(yOpen,yClose), hBody=Math.max(2,Math.abs(yClose-yOpen));
    ctx.fillStyle=isBull?'rgba(0,230,118,0.95)':'rgba(255,82,82,0.95)';
    ctx.fillRect(x,top,cw*0.72,hBody);
    ctx.strokeRect(x,top,cw*0.72,hBody);
  });
}
setInterval(()=>{ updateLiveCandles(); drawLiveChart(); }, 300);

// update on pair change (ensure element exists)
const pairSelect = document.getElementById('pairSelect');
if (pairSelect) {
  initCandles(pairSelect.value || 'EUR/USD');
  drawLiveChart();
  pairSelect.addEventListener('change', ()=>{
    initCandles(pairSelect.value);
    drawLiveChart();
  });
} else {
  initCandles('EUR/USD');
  drawLiveChart();
}


// time buttons
const timeButtons = document.querySelectorAll('.time-btn');
let selectedTime = '1m';
if(timeButtons) timeButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    timeButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    selectedTime = btn.textContent.trim();
    drawLiveChart();
  });
});

// analysis
const analyzeBtn = document.getElementById('analyzeBtn');
const statusBlock = document.getElementById('statusBlock');
if(analyzeBtn) analyzeBtn.addEventListener('click', ()=>{
  statusBlock.textContent = '🔵 Анализирую '+selectedTime+'...';
  statusBlock.classList.remove('buy-signal','sell-signal');
  setTimeout(()=>{
    const pair = pairSelect ? pairSelect.value : 'EUR/USD';
    const isBuy = Math.random()<0.5;
    const power = Math.floor(Math.random()*30)+65;
    statusBlock.classList.add(isBuy? 'buy-signal':'sell-signal');
    statusBlock.textContent = `${pair} — ${isBuy? 'BUY':'SELL'} (${power}%)`;
  },800);
});

// insert calculator (restores previous behavior)
(function insertCalculator(){
  const container = document.getElementById('app');
  const calcHtml = `
  <div style="width:390px; margin:30px auto 80px;">
    <div class="calc">
      <label>Калькулятор:</label>
      <div class="calc-row">
        <input id="calcInput" type="number" placeholder="Введите число..." />
        <button class="sum-btn" id="sumBtn">= Сумма</button>
      </div>
      <button class="divide-btn" id="divideBtn" style="margin-top:12px; width:100%; padding:14px; border-radius:14px; background:linear-gradient(90deg,#3e38ff,#9c26ff); border:none; color:white; font-size:16px; cursor:pointer; font-weight:500;">Разделить</button>
      <div class="result" id="calcResult">= 0.0000</div>
    </div>
  </div>`;
  container.insertAdjacentHTML('beforeend', calcHtml);
  const sumBtn = document.getElementById('sumBtn');
  const divideBtn = document.getElementById('divideBtn');
  const calcInput = document.getElementById('calcInput');
  const calcResult = document.getElementById('calcResult');
  if (sumBtn) sumBtn.addEventListener('click', ()=>{ const v=parseFloat(calcInput.value); if(isNaN(v)){ calcResult.textContent='= 0.0000'; return;} calcResult.textContent='= '+v.toFixed(4); });
  if (divideBtn) divideBtn.addEventListener('click', ()=>{ const v=parseFloat(calcInput.value); if(isNaN(v)){ calcResult.textContent='= 0.0000'; return;} calcResult.textContent='= '+(v/11).toFixed(4); });
})();
// --- Language switch ---
const langBtn = document.getElementById('langSwitch');
let lang = 'ru';

const dict = {
  ru: {
    pairLabel: 'Выбери валютную пару',
    analyze: 'Анализировать',
    waiting: '🔵 Ожидание...',
    analyzing: '🔵 Анализирую ',
    calcLabel: 'Калькулятор:',
    sum: '= Сумма',
    divide: 'Разделить',
    placeholder: 'Введите число...'
  },
  en: {
    pairLabel: 'Select currency pair',
    analyze: 'Analyze',
    waiting: '🔵 Waiting...',
    analyzing: '🔵 Analyzing ',
    calcLabel: 'Calculator:',
    sum: '= Sum',
    divide: 'Divide',
    placeholder: 'Enter number...'
  }
};

function applyLang(){
  const t = dict[lang];
  document.querySelector("label[for='pairSelect']").textContent = t.pairLabel;
  document.getElementById('analyzeBtn').textContent = t.analyze;
  document.getElementById('statusBlock').textContent = t.waiting;
  const calcLabel = document.querySelector('.calc label'); if(calcLabel) calcLabel.textContent = t.calcLabel;
  const inp = document.getElementById('calcInput'); if(inp) inp.placeholder = t.placeholder;
  const sumBtn2 = document.getElementById('sumBtn'); if(sumBtn2) sumBtn2.textContent = t.sum;
  const divBtn2 = document.getElementById('divideBtn'); if(divBtn2) divBtn2.textContent = t.divide;
  langBtn.textContent = lang.toUpperCase();
}

langBtn.addEventListener('click', ()=>{
  lang = lang === 'ru' ? 'en' : 'ru';
  applyLang();
});

applyLang();

// service worker register
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(()=>{console.log('SW register failed')});
}
