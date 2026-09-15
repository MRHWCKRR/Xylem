const GEMINI_ENDPOINT='/api/gemini';
let geminiHistory=[];

function xylemPlantContext(){
  const rows=[...document.querySelectorAll('.plant-row')].map(row=>row.innerText.replace(/\n+/g,' · '));
  const cards=[...document.querySelectorAll('.plant-card')].map(card=>card.innerText.replace(/\n+/g,' · '));
  return rows.length?rows.join('\n'):cards.join('\n');
}

function xylemSensorContext(){
  const stats=[...document.querySelectorAll('.stat')].map(x=>x.innerText.replace(/\n+/g,' · '));
  return stats.join('\n');
}

function buildChat(){
  if(document.querySelector('#geminiChat'))return;
  const wrap=document.createElement('div');
  wrap.id='geminiChat';
  wrap.innerHTML=`
    <button class="gemini-fab" id="geminiOpen" aria-label="Open Xylem AI">✦</button>
    <section class="gemini-panel" id="geminiPanel" aria-label="Chat with Gemini">
      <div class="gemini-head"><div><strong>✦ Xylem AI</strong><small>Ask Gemini about your plants</small></div><button id="geminiClose">×</button></div>
      <div class="gemini-messages" id="geminiMessages"><div class="gemini-msg ai">Hi! I can help with your plants, moisture, temperature, light, watering and sensor readings. What would you like to know?</div></div>
      <div class="gemini-suggestions"><button data-q="Which plant needs attention right now?">Plant health</button><button data-q="Which plant should I water next?">Watering</button><button data-q="Are the current temperature and light levels good?">Conditions</button></div>
      <form class="gemini-form" id="geminiForm"><input id="geminiInput" autocomplete="off" placeholder="Ask about your garden…"><button type="submit">Send</button></form>
      <div class="gemini-key-note">Secure mode · Gemini requests stay behind the Xylem server.</div>
    </section>`;
  document.body.appendChild(wrap);
  const panel=document.querySelector('#geminiPanel');
  document.querySelector('#geminiOpen').onclick=()=>panel.classList.add('open');
  document.querySelector('#geminiClose').onclick=()=>panel.classList.remove('open');
  document.querySelectorAll('.gemini-suggestions button').forEach(b=>b.onclick=()=>{document.querySelector('#geminiInput').value=b.dataset.q;document.querySelector('#geminiForm').requestSubmit()});
  document.querySelector('#geminiForm').onsubmit=sendGemini;
}

function addGeminiMessage(text,type){
  const box=document.querySelector('#geminiMessages');
  const msg=document.createElement('div');msg.className='gemini-msg '+type;msg.textContent=text;box.appendChild(msg);box.scrollTop=box.scrollHeight;return msg;
}

async function sendGemini(event){
  event.preventDefault();
  const input=document.querySelector('#geminiInput');
  const question=input.value.trim();
  if(!question)return;
  input.value='';
  addGeminiMessage(question,'user');
  const reply=addGeminiMessage('Thinking…','ai');
  const messages=[...geminiHistory,{role:'user',content:question}];
  try{
    const res=await fetch(GEMINI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages,plantContext:xylemPlantContext(),sensorContext:xylemSensorContext()})});
    const data=await res.json();
    if(!res.ok)throw new Error(data?.error||'Gemini API request failed.');
    const text=data?.text?.trim();
    if(!text)throw new Error('Gemini returned an empty response.');
    reply.textContent=text;
    geminiHistory.push({role:'user',content:question},{role:'assistant',content:text});
  }catch(err){
    reply.textContent=`Gemini could not respond: ${err.message}`;
  }
  document.querySelector('#geminiMessages').scrollTop=document.querySelector('#geminiMessages').scrollHeight;
}

buildChat();
