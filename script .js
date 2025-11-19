// --- LOGICA DI GIOCO ---

let apiKey = "";
let currentTarget = "nobili";
let turn = 1;

let rpg = {
    hp: 100, gold: 1000, guards: 50, terror: 10,
    factions: {
        nobili: { rel: 50, status: "Neutrale" },
        clero: { rel: 50, status: "Neutrale" },
        popolo: { rel: 40, status: "Inquieto" },
        spie: { rel: 100, status: "Fedele" }
    }
};

const personas = {
    nobili: "Duca (Arrogante)",
    clero: "Cardinale (Solenne)",
    popolo: "Rivoluzionario (Arrabbiato)",
    spie: "Capo Spia (Segreto)"
};

// --- FUNZIONI INTERFACCIA ---

function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-view').forEach(el => el.classList.remove('active-tab'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active-tab');
    if(btn) btn.classList.add('active');
}

function selectFaction(key) {
    currentTarget = key;
    document.querySelectorAll('.faction-card').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    addMsg("intrigue", `Ora stai parlando con: ${key.toUpperCase()}`);
    
    if(window.innerWidth <= 768) {
        setTimeout(() => {
            const chatBtn = document.querySelectorAll('.nav-btn')[1];
            switchTab('tab-chat', chatBtn);
        }, 600);
    }
}

function startGame() {
    const k = document.getElementById('api-key').value;
    if(k.length > 5) {
        apiKey = k;
        // Nascondi elementi del login
        document.querySelectorAll('#overlay > :not(#death-msg)').forEach(el => el.style.display = 'none');
        document.getElementById('overlay').style.display = 'none';
        updateUI();
    } else {
        alert("Inserisci una chiave API valida");
    }
}

function addMsg(type, text) {
    const log = document.getElementById('chat-log');
    const div = document.createElement('div');
    div.className = `msg msg-${type}`;
    div.innerHTML = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}

function updateUI() {
    // Stats
    document.getElementById('hp-text').innerText = rpg.hp + "%";
    document.getElementById('hp-bar').style.width = rpg.hp + "%";
    document.getElementById('val-gold').innerText = rpg.gold;
    document.getElementById('val-guards').innerText = rpg.guards;
    document.getElementById('val-terror').innerText = rpg.terror + "%";
    document.getElementById('val-turn').innerText = turn;

    // Fazioni
    ['nobili', 'clero', 'popolo', 'spie'].forEach(key => {
        const f = rpg.factions[key];
        const bar = document.getElementById(`bar-${key}`);
        const txt = document.getElementById(`rel-${key}-txt`);
        
        txt.innerText = f.rel + "%";
        bar.style.width = f.rel + "%";

        let color = "#d4af37";
        if(f.rel < 30) color = "#ff4444";
        else if(f.rel > 70) color = "#44ff44";
        
        bar.style.backgroundColor = color;
        txt.style.color = color;

        if(document.getElementById(`stat-${key}`)) {
            document.getElementById(`stat-${key}`).innerText = f.status;
        }
    });
}

async function send() {
    const inp = document.getElementById('u-input');
    const txt = inp.value.trim();
    if(!txt) return;

    addMsg("user", txt);
    inp.value = "";
    document.getElementById('btn-send').disabled = true;

    await callGroq(txt);

    document.getElementById('btn-send').disabled = false;
    document.getElementById('u-input').focus();
}

// --- FUNZIONI API GROQ ---

async function callGroq(userText) {
    const sysPrompt = `
        RPG TESTUALE. Ruolo: ${personas[currentTarget]}.
        Status: HP=${rpg.hp}, Oro=${rpg.gold}, Relazione=${rpg.factions[currentTarget].rel}.
        
        REGOLE:
        1. Se Relazione < 25: Tentativo omicidio (damage_taken > 0).
        2. Se HP <= 0: is_dead = true.
        3. Intrigue_alert: Gossip utile.
        
        Rispondi SOLO JSON:
        {
            "narrative": "Risposta breve (max 20 parole)",
            "intrigue_alert": "Gossip (opzionale)",
            "damage_taken": 0,
            "is_dead": false,
            "death_desc": "...",
            "stats": { "gold": 0, "guards": 0, "rel_nobili": 0, "rel_clero": 0, "rel_popolo": 0 }
        }
    `;

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [{ role: "system", content: sysPrompt }, { role: "user", content: userText }],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        const json = await res.json();
        const data = JSON.parse(json.choices[0].message.content);

        addMsg("ai", data.narrative);
        if(data.intrigue_alert) addMsg("intrigue", "👁️ " + data.intrigue_alert);

        if(data.damage_taken > 0) {
            rpg.hp -= data.damage_taken;
            addMsg("intrigue", `🩸 -${data.damage_taken} HP!`);
            if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }

        if(data.stats) {
            rpg.gold += (data.stats.gold || 0);
            rpg.guards += (data.stats.guards || 0);
            ['nobili','clero','popolo'].forEach(k => {
                if(data.stats[`rel_${k}`]) rpg.factions[k].rel += data.stats[`rel_${k}`];
                rpg.factions[k].rel = Math.max(0, Math.min(100, rpg.factions[k].rel));
                
                if(rpg.factions[k].rel < 30) rpg.factions[k].status = "OSTILE";
                else if(rpg.factions[k].rel > 70) rpg.factions[k].status = "Alleato";
                else rpg.factions[k].status = "Neutrale";
            });
        }

        turn++;
        updateUI();

        if(rpg.hp <= 0 || data.is_dead) {
            const overlay = document.getElementById('overlay');
            const deathMsg = document.getElementById('death-msg');
            const deathDetail = document.getElementById('death-detail');

            // Resetta overlay per mostrare la morte
            overlay.style.display = 'flex';
            document.getElementById('api-key').style.display = 'none';
            document.querySelector('.btn-main').style.display = 'none';
            document.querySelector('.title-gold').style.display = 'none';
            
            deathMsg.style.display = 'block';
            deathDetail.innerText = data.death_desc || "Il vostro regno è finito nel sangue.";
        }

    } catch(e) {
        addMsg("intrigue", "Errore connessione. Riprova.");
        console.error(e);
        document.getElementById('btn-send').disabled = false;
    }
}
