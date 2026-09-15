// Demo-only Gemini configuration. Replace this value with your Gemini API key.
// WARNING: A client-side API key is visible to anyone who can inspect this demo.
const GEMINI_API_KEY=window.XYLEM_GEMINI_API_KEY || '';
const GEMINI_MODEL='gemini-3.8-flash';
const GEMINI_ENDPOINT='https://generativelanguage.googleapis.com/v1beta/models/'+GEMINI_MODEL+':generateContent';

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
      <div class="gemini-key-note">Demo mode · Gemini is connected directly from this page.</div>
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
  if(!GEMINI_API_KEY||GEMINI_API_KEY==='PASTE_YOUR_GEMINI_API_KEY_HERE'){
    addGeminiMessage('Gemini is not configured yet. Add your API key in js/gemini.js.','ai');
    return;
  }
  const reply=addGeminiMessage('Thinking…','ai');
  const systemContext=`You are Xylem AI, a practical smart-farming assistant. Help the grower understand plant health and make sensible care decisions. Be concise, friendly and specific. Use the current Xylem readings when answering. Never pretend simulated readings are real hardware data. If a reading is uncertain, say so.\n\nCURRENT XYLEM DATA:\nPlants:\n${xylemPlantContext()||'Plant data is not currently visible.'}\nDashboard sensor summary:\n${xylemSensorContext()||'No dashboard summary visible.'}`;
  geminiHistory.push({role:'user',parts:[{text:`${systemContext}\n\nUSER QUESTION:\n${question}`}]});
  try{
    const res=await fetch(GEMINI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':GEMINI_API_KEY},body:JSON.stringify({contents:geminiHistory,generationConfig:{temperature:0.5,maxOutputTokens:500}})});
    const data=await res.json();
    if(!res.ok)throw new Error(data?.error?.message||'Gemini API request failed.');
    const text=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('').trim();
    if(!text)throw new Error('Gemini returned an empty response.');
    reply.textContent=text;
    geminiHistory.push({role:'model',parts:[{text}]});
  }catch(err){
    geminiHistory.pop();
    reply.textContent=`Gemini could not respond: ${err.message}`;
  }
  document.querySelector('#geminiMessages').scrollTop=document.querySelector('#geminiMessages').scrollHeight;
}

buildChat();
