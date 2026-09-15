const GEMINI_MODEL='gemini-3.8-flash';
const GEMINI_ENDPOINT='https://generativelanguage.googleapis.com/v1beta/models/'+GEMINI_MODEL+':generateContent';

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
      <div class="gemini-key-note">Uses the Gemini API key saved in Xylem Settings. Your key stays in this browser.</div>
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
  const key=localStorage.getItem('xylem-gemini-key');
  if(!key){addGeminiMessage('Add your Gemini API key in Settings → Gemini API key, then try again.','ai');return;}
  const reply=addGeminiMessage('Thinking…','ai');
  const context=`You are Xylem AI, a practical smart-farming assistant. Help the grower understand plant health and make sensible care decisions. Be concise, friendly and specific. Never pretend simulated readings are real hardware data.\n\nCURRENT XYLEM DATA:\nPlants:\n${xylemPlantContext()||'Plant data is not currently visible.'}\nDashboard sensor summary:\n${xylemSensorContext()||'No dashboard summary visible.'}\n\nUSER QUESTION:\n${question}`;
  try{
    const res=await fetch(GEMINI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{role:'user',parts:[{text:context}]}],generationConfig:{temperature:0.5,maxOutputTokens:500}})});
    const data=await res.json();
    if(!res.ok)throw new Error(data?.error?.message||'Gemini API request failed.');
    const text=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('').trim();
    reply.textContent=text||'I could not get a response from Gemini. Try again.';
  }catch(err){reply.textContent=`Gemini could not respond: ${err.message}`;}
  document.querySelector('#geminiMessages').scrollTop=document.querySelector('#geminiMessages').scrollHeight;
}

buildChat();
