import React, { useEffect, useMemo, useRef, useState } from 'react';

const starter = {
  goal: 'Crack a ₹6 LPA fresher IT/software job',
  targetLpa: 6,
  dailyHours: 4,
  startDate: new Date().toISOString().slice(0,10),
  topics: [
    {id:'java-1',area:'Java + DSA',title:'Java variables, types, input/output',done:false},
    {id:'java-2',area:'Java + DSA',title:'Conditions and loops',done:false},
    {id:'java-3',area:'Java + DSA',title:'Methods and arrays',done:false},
    {id:'java-4',area:'Java + DSA',title:'Strings and number problems',done:false},
    {id:'sql-1',area:'SQL + DBMS',title:'SELECT, WHERE, ORDER BY',done:false},
    {id:'sql-2',area:'SQL + DBMS',title:'GROUP BY, aggregates, HAVING',done:false},
    {id:'sql-3',area:'SQL + DBMS',title:'Joins and subqueries',done:false},
    {id:'cs-1',area:'CS Fundamentals',title:'OOP: encapsulation, inheritance, polymorphism',done:false},
    {id:'cs-2',area:'CS Fundamentals',title:'Operating systems basics',done:false},
    {id:'cs-3',area:'CS Fundamentals',title:'Computer networks basics',done:false},
    {id:'apt-1',area:'Aptitude',title:'Percentages, ratios, averages',done:false},
    {id:'apt-2',area:'Aptitude',title:'Logical reasoning and timed practice',done:false},
    {id:'proj-1',area:'Projects',title:'Explain one project: problem, stack, features, challenges',done:false},
    {id:'mock-1',area:'Mock Interviews',title:'Self-introduction + technical mock',done:false}
  ],
  notes: [],
  sessions: [],
  updatedAt: new Date().toISOString()
};

function loadState() {
  try {
    const saved = localStorage.getItem('placementos-state');
    return saved ? {...starter, ...JSON.parse(saved)} : starter;
  } catch { return starter; }
}

export default function App() {
  const [data,setData] = useState(loadState);
  const [note,setNote] = useState('');
  const [area,setArea] = useState('All');
  const [tab,setTab] = useState('dashboard');
  const [question,setQuestion] = useState('');
  const [answer,setAnswer] = useState('');
  const [aiBusy,setAiBusy] = useState(false);
  const [aiError,setAiError] = useState('');
  const [chat,setChat] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    const next = {...data, updatedAt:new Date().toISOString()};
    localStorage.setItem('placementos-state', JSON.stringify(next));
  }, [data]);

  const completed = data.topics.filter(t=>t.done).length;
  const percent = Math.round(completed / Math.max(data.topics.length,1) * 100);
  const areas = ['All', ...new Set(data.topics.map(t=>t.area))];
  const visibleTopics = area === 'All' ? data.topics : data.topics.filter(t=>t.area===area);
  const today = new Date().toISOString().slice(0,10);
  const todaySessions = data.sessions.filter(s=>s.date===today).length;

  function toggleTopic(id) {
    setData(d=>({...d,topics:d.topics.map(t=>t.id===id?{...t,done:!t.done}:t)}));
  }
  function addNote(e) {
    e.preventDefault();
    if(!note.trim()) return;
    setData(d=>({...d,notes:[{id:crypto.randomUUID(),date:today,text:note.trim()},...d.notes]}));
    setNote('');
  }
  function exportProgress() {
    const payload = {...data, exportedAt:new Date().toISOString(), exportInstructions:'Upload or paste this JSON into your ChatGPT conversation and ask it to review my PlacementOS progress and continue my plan.'};
    const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='placementos-progress.json'; a.click();
    URL.revokeObjectURL(url);
  }
  function importProgress(e) {
    const file=e.target.files?.[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{try { const imported=JSON.parse(reader.result); if(!Array.isArray(imported.topics)) throw new Error('Invalid progress file'); setData({...starter,...imported}); alert('Progress imported.'); } catch { alert('Could not import this JSON file.'); }};
    reader.readAsText(file); e.target.value='';
  }
  async function askAI(e) {
    e.preventDefault();
    if(!question.trim()) return;
    const q=question.trim(); setQuestion(''); setAiBusy(true); setAiError('');
    setChat(c=>[...c,{role:'user',content:q}]);
    try {
      const res=await fetch('http://localhost:8787/api/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,progress:{goal:data.goal,completed,total:data.topics.length,topics:data.topics,notes:data.notes.slice(0,8)}})});
      const body=await res.json();
      if(!res.ok) throw new Error(body.error||'AI tutor request failed');
      setChat(c=>[...c,{role:'assistant',content:body.answer}]);
    } catch(err) {
      setAiError(err.message+' — Is the backend running? Check server/.env and server terminal.');
    } finally { setAiBusy(false); }
  }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">P</div><div><b>PlacementOS</b><small>YOUR CAREER COMMAND CENTER</small></div></div>
      <div className="goal-card"><span className="eyebrow">YOUR TARGET</span><strong>₹6 LPA</strong><span>Software / IT fresher role</span><div className="goal-line"><i/></div><small>{percent}% learning checklist complete</small></div>
      <nav>
        {[['dashboard','▦','Dashboard'],['learning','✓','Learning plan'],['notes','▤','Learning notes'],['tutor','✳','AI tutor']].map(([id,icon,label])=><button key={id} className={tab===id?'nav-item active':'nav-item'} onClick={()=>setTab(id)}><span>{icon}</span>{label}</button>)}
      </nav>
      <div className="sidebar-bottom"><span className="status-dot"/> Progress saved in this browser</div>
    </aside>
    <main className="main">
      <header className="topbar"><div><div className="eyebrow">YOUR PERSONAL PLACEMENT COACH</div><h1>{tab==='dashboard'?'Dashboard':tab==='learning'?'Learning plan':tab==='notes'?'Learning notes':'AI placement tutor'}</h1></div><div className="top-actions"><button className="btn ghost" onClick={()=>fileRef.current?.click()}>Import progress</button><input ref={fileRef} hidden type="file" accept="application/json" onChange={importProgress}/><button className="btn primary" onClick={exportProgress}>Export progress ↗</button></div></header>
      {tab==='dashboard' && <>
        <section className="welcome"><div><span className="pill">● YOUR NEXT CHAPTER</span><h2>Small steps. Strong skills.<br/><em>Your ₹6 LPA goal.</em></h2><p>Build consistency in Java, DSA, SQL and interview practice. Your progress stays saved as you learn.</p><button className="btn light" onClick={()=>setTab('learning')}>Continue learning →</button></div><div className="welcome-art"><div className="orbit orbit1"/><div className="orbit orbit2"/><div className="code-card"><span>JAVA · DSA</span><code>while (learning) {'{'}<br/>&nbsp; skills++;<br/>&nbsp; confidence++;<br/>{'}'}</code><div className="code-foot">BUILDING MOMENTUM <b>↗</b></div></div></div></section>
        <section className="stats">
          <div className="stat"><span>LEARNING PROGRESS</span><strong>{percent}%</strong><div className="progress"><i style={{width:percent+'%'}}/></div><small>{completed} of {data.topics.length} topics completed</small></div>
          <div className="stat"><span>DAILY STUDY TARGET</span><strong>{data.dailyHours} <small>hrs/day</small></strong><div className="mini-bars"><i/><i/><i/><i/><i/><i/><i/></div><small>Keep your routine consistent</small></div>
          <div className="stat"><span>SESSIONS TODAY</span><strong>{todaySessions}</strong><small>Record sessions in your notes</small><button className="text-btn" onClick={()=>setTab('notes')}>Add learning log →</button></div>
        </section>
        <section className="section-head"><div><h2>Learning roadmap</h2><p>Your core placement preparation areas</p></div><button className="text-btn" onClick={()=>setTab('learning')}>View full plan →</button></section>
        <section className="area-grid">{['Java + DSA','SQL + DBMS','Aptitude','CS Fundamentals','Projects','Mock Interviews'].map((name,i)=>{const list=data.topics.filter(t=>t.area===name);const done=list.filter(t=>t.done).length;return <button className="area-card" key={name} onClick={()=>{setArea(name);setTab('learning')}}><div className={'area-icon c'+i}>{['⌘','▤','◈','◉','⌁','◎'][i]}</div><div className="area-title">{name}</div><div className="area-meta">{done}/{list.length} completed</div><div className="progress"><i style={{width:(list.length?done/list.length*100:0)+'%'}}/></div></button>})}</section>
        <section className="section-head"><div><h2>Quick learning log</h2><p>Write down what you practiced today</p></div></section>
        <form className="note-form" onSubmit={addNote}><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Example: Practiced Java loops and solved 3 problems..." /><button className="btn primary">Save note</button></form>
        <div className="integration"><div className="integration-icon">↗</div><div><b>Two ways to learn with AI</b><p>Use the in-app OpenAI tutor, and export your progress to share it in this ChatGPT conversation for ongoing coaching.</p></div><button className="btn ghost" onClick={()=>setTab('tutor')}>Open AI tutor</button></div>
      </>}
      {tab==='learning' && <><div className="filter-row">{areas.map(a=><button key={a} className={area===a?'filter active':'filter'} onClick={()=>setArea(a)}>{a}</button>)}</div><div className="topic-list">{visibleTopics.map(t=><label className={'topic '+(t.done?'done':'')} key={t.id}><input type="checkbox" checked={t.done} onChange={()=>toggleTopic(t.id)}/><span className="checkmark">{t.done?'✓':''}</span><div><small>{t.area}</small><b>{t.title}</b></div><span className="topic-state">{t.done?'Completed':'To do'}</span></label>)}</div><p className="tip">Tip: mark a topic complete only after you can explain it and solve a practice question without copying.</p></>}
      {tab==='notes' && <><form className="note-form notes-page" onSubmit={addNote}><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="What did you learn? What was difficult? What will you revise next?" rows="4"/><button className="btn primary">Save learning log</button></form><div className="notes-list">{data.notes.length===0?<div className="empty">No learning logs yet. Add your first note above.</div>:data.notes.map(n=><article className="note-card" key={n.id}><small>{n.date}</small><p>{n.text}</p><button className="text-btn" onClick={()=>setData(d=>({...d,notes:d.notes.filter(x=>x.id!==n.id)}))}>Delete</button></article>)}</div></>}
      {tab==='tutor' && <><div className="tutor-intro"><div className="tutor-symbol">✳</div><div><h2>Your AI placement tutor</h2><p>Ask about Java, DSA, SQL, interviews, or your next study session. Your current progress summary is sent with each question.</p></div></div><div className="chat-window">{chat.length===0?<div className="empty"><b>What are we learning today?</b><p>Try: “Teach me Java loops like a beginner” or “Give me 3 array practice problems.”</p></div>:chat.map((m,i)=><div key={i} className={'chat-msg '+m.role}><small>{m.role==='user'?'YOU':'AI TUTOR'}</small><p>{m.content}</p></div>)}{aiBusy&&<div className="chat-msg assistant"><small>AI TUTOR</small><p>Thinking through your question…</p></div>}</div><form className="ask-form" onSubmit={askAI}><textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask your placement tutor..." rows="2"/><button className="btn primary" disabled={aiBusy||!question.trim()}>{aiBusy?'Thinking…':'Ask AI ↗'}</button></form>{aiError&&<div className="error">{aiError}</div>}<p className="tip">Requires the backend to be running and a valid API key in server/.env. API usage may cost money.</p></>}
      <footer>PLACEMENTOS · YOUR PROGRESS, YOUR PACE <span>Last saved {new Date(data.updatedAt).toLocaleString()}</span></footer>
    </main>
  </div>;
}
