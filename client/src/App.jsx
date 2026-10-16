import React, { useEffect, useState } from 'react';

const starter = {
  goal: 'Crack a ₹6 LPA fresher IT/software job', dailyHours: 4,
  topics: [
    {id:'java-1',area:'Java + DSA',title:'Java variables, types, input/output',done:false},
    {id:'java-2',area:'Java + DSA',title:'Conditions and loops',done:false},
    {id:'java-3',area:'Java + DSA',title:'Methods and arrays',done:false},
    {id:'java-4',area:'Java + DSA',title:'Strings and number problems',done:false},
    {id:'sql-1',area:'SQL + DBMS',title:'SELECT, WHERE, ORDER BY',done:false},
    {id:'sql-2',area:'SQL + DBMS',title:'GROUP BY, aggregates, HAVING',done:false},
    {id:'sql-3',area:'SQL + DBMS',title:'Joins and subqueries',done:false},
    {id:'cs-1',area:'CS Fundamentals',title:'OOP concepts',done:false},
    {id:'cs-2',area:'CS Fundamentals',title:'Operating systems basics',done:false},
    {id:'cs-3',area:'CS Fundamentals',title:'Computer networks basics',done:false},
    {id:'apt-1',area:'Aptitude',title:'Percentages, ratios, averages',done:false},
    {id:'apt-2',area:'Aptitude',title:'Logical reasoning and timed practice',done:false},
    {id:'proj-1',area:'Projects',title:'Explain one project: problem, stack, features, challenges',done:false},
    {id:'mock-1',area:'Mock Interviews',title:'Self-introduction + technical mock',done:false}
  ],
  customTopics: [], notes: [], sessions: [],
  questions: [
    {id:'q1',title:'Sum from 1 to N',area:'Java + DSA',difficulty:'Easy',prompt:'Given n = 5, calculate the sum 1 + 2 + ... + n.',answer:'15',explanation:'Add each integer from 1 through 5: 1 + 2 + 3 + 4 + 5 = 15.',done:false},
    {id:'q2',title:'Even or odd',area:'Java + DSA',difficulty:'Easy',prompt:'Write a Java condition to check whether n = 12 is even or odd.',answer:'if (n % 2 == 0) prints Even; otherwise prints Odd.',explanation:'The remainder operator % gives 0 when an integer is divisible by 2.',done:false},
    {id:'q3',title:'Largest of two numbers',area:'Java + DSA',difficulty:'Easy',prompt:'Given a = 15 and b = 9, print the larger number.',answer:'15',explanation:'Compare a > b. Since 15 > 9, print a.',done:false},
    {id:'q4',title:'SQL filtering',area:'SQL + DBMS',difficulty:'Easy',prompt:'Write a query to select all rows from Employees where salary is greater than 30000.',answer:'SELECT * FROM Employees WHERE salary > 30000;',explanation:'WHERE filters rows before they are returned.',done:false}
  ], plannerTasks: [], studyLogs: [], updatedAt: new Date().toISOString()
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('placementos-state') || 'null');
    return saved ? {...starter, ...saved, customTopics:saved.customTopics||[], questions:saved.questions||starter.questions, plannerTasks:saved.plannerTasks||[], studyLogs:saved.studyLogs||[]} : starter;
  } catch { return starter; }
}
const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
const todayString = () => new Date().toISOString().slice(0,10);

export default function App() {
  const [data,setData] = useState(loadState);
  const [tab,setTab] = useState('dashboard');
  const [topicTitle,setTopicTitle] = useState('');
  const [topicArea,setTopicArea] = useState('Java + DSA');
  const [note,setNote] = useState('');
  const [questionForm,setQuestionForm] = useState({title:'',area:'Java + DSA',difficulty:'Easy',prompt:'',answer:'',explanation:''});
  const [showAnswers,setShowAnswers] = useState({});
  const [taskForm,setTaskForm] = useState({date:todayString(),time:'',title:'',area:'Java + DSA',minutes:45});
  const [logForm,setLogForm] = useState({date:todayString(),hours:'1',topic:'',reflection:''});
  const [filter,setFilter] = useState('All');
  const [aiQuestion,setAiQuestion] = useState('');
  const [aiAnswer,setAiAnswer] = useState('');
  const [aiBusy,setAiBusy] = useState(false);
  const [aiError,setAiError] = useState('');

  useEffect(() => {
    const next = {...data, updatedAt:new Date().toISOString()};
    localStorage.setItem('placementos-state', JSON.stringify(next));
  }, [data]);

  const allTopics = [...data.topics, ...data.customTopics];
  const completed = allTopics.filter(t=>t.done).length;
  const percent = Math.round(completed / Math.max(allTopics.length,1) * 100);
  const today = todayString();
  const todayTasks = data.plannerTasks.filter(t=>t.date===today);
  const todayMinutes = data.studyLogs.filter(l=>l.date===today).reduce((sum,l)=>sum+Number(l.hours||0)*60,0);
  const totalHours = data.studyLogs.reduce((sum,l)=>sum+Number(l.hours||0),0);

  function toggleTopic(id) {
    setData(d=>({...d,topics:d.topics.map(t=>t.id===id?{...t,done:!t.done}:t),customTopics:d.customTopics.map(t=>t.id===id?{...t,done:!t.done}:t)}));
  }
  function addTopic(e) {
    e.preventDefault(); if(!topicTitle.trim()) return;
    setData(d=>({...d,customTopics:[...d.customTopics,{id:uid(),title:topicTitle.trim(),area:topicArea,done:false,custom:true}]})); setTopicTitle('');
  }
  function addNote(e) {
    e.preventDefault(); if(!note.trim()) return;
    setData(d=>({...d,notes:[{id:uid(),date:today,text:note.trim()},...d.notes]})); setNote('');
  }
  function addQuestion(e) {
    e.preventDefault(); if(!questionForm.title.trim()||!questionForm.prompt.trim()) return;
    setData(d=>({...d,questions:[{...questionForm,id:uid(),done:false},...d.questions]}));
    setQuestionForm({title:'',area:'Java + DSA',difficulty:'Easy',prompt:'',answer:'',explanation:''});
  }
  function toggleQuestion(id) { setData(d=>({...d,questions:d.questions.map(q=>q.id===id?{...q,done:!q.done}:q)})); }
  function addTask(e) {
    e.preventDefault(); if(!taskForm.title.trim()) return;
    setData(d=>({...d,plannerTasks:[...d.plannerTasks,{...taskForm,id:uid(),done:false,minutes:Number(taskForm.minutes)}]}));
    setTaskForm(t=>({...t,title:'',time:''}));
  }
  function toggleTask(id) { setData(d=>({...d,plannerTasks:d.plannerTasks.map(t=>t.id===id?{...t,done:!t.done}:t)})); }
  function addStudyLog(e) {
    e.preventDefault(); if(!logForm.topic.trim()) return;
    setData(d=>({...d,studyLogs:[{...logForm,id:uid(),hours:Number(logForm.hours)},...d.studyLogs]}));
    setLogForm(l=>({...l,topic:'',reflection:''}));
  }
  function exportProgress() {
    const blob = new Blob([JSON.stringify({...data,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='placementos-progress.json'; a.click(); URL.revokeObjectURL(url);
  }
  function importProgress(e) {
    const file=e.target.files?.[0]; if(!file)return;
    const reader=new FileReader(); reader.onload=()=>{try{const parsed=JSON.parse(reader.result);if(!Array.isArray(parsed.topics))throw Error();setData({...starter,...parsed,customTopics:parsed.customTopics||[],questions:parsed.questions||starter.questions,plannerTasks:parsed.plannerTasks||[],studyLogs:parsed.studyLogs||[]});alert('Progress imported successfully.');}catch{alert('Invalid PlacementOS progress JSON.');}}; reader.readAsText(file); e.target.value='';
  }
  async function askAI(e) {
    e.preventDefault(); if(!aiQuestion.trim())return; setAiBusy(true);setAiError('');setAiAnswer('');
    try { const res=await fetch('http://localhost:8787/api/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:aiQuestion,progress:{goal:data.goal,completed,total:allTopics.length,topics:allTopics,studyLogs:data.studyLogs.slice(0,10)}})}); const body=await res.json(); if(!res.ok)throw Error(body.error||'AI request failed');setAiAnswer(body.answer); }
    catch(err){setAiError(err.message+' — Check that the backend is running and server/.env has a valid API key.');}
    finally{setAiBusy(false);}
  }
  const nav = [['dashboard','▦','Dashboard'],['learning','✓','Learning plan'],['questions','⌘','Question bank'],['planner','◷','Study planner'],['notes','▤','Learning notes'],['tutor','✳','AI tutor']];
  const areaOptions=['Java + DSA','SQL + DBMS','Aptitude','CS Fundamentals','Projects','Mock Interviews','Other'];

  return <div className="shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">P</div><div><b>PlacementOS</b><small>YOUR CAREER COMMAND CENTER</small></div></div>
      <div className="goal-card"><span className="eyebrow">YOUR TARGET</span><strong>₹6 LPA</strong><span>Software / IT fresher role</span><div className="goal-line"><i style={{width:percent+'%'}}/></div><small>{percent}% learning checklist complete</small></div>
      <nav>{nav.map(([id,icon,label])=><button key={id} className={tab===id?'nav-item active':'nav-item'} onClick={()=>setTab(id)}><span>{icon}</span>{label}</button>)}</nav>
      <div className="sidebar-bottom"><span className="status-dot"/> Progress saved in this browser</div>
    </aside>
    <main className="main">
      <header className="topbar"><div><div className="eyebrow">YOUR PERSONAL PLACEMENT COACH</div><h1>{nav.find(n=>n[0]===tab)?.[2]||'Dashboard'}</h1></div><div className="top-actions"><label className="btn ghost import-label">Import progress<input hidden type="file" accept="application/json" onChange={importProgress}/></label><button className="btn primary" onClick={exportProgress}>Export progress ↗</button></div></header>

      {tab==='dashboard' && <>
        <section className="welcome"><div><span className="pill">● YOUR NEXT CHAPTER</span><h2>Small steps. Strong skills.<br/><em>Your ₹6 LPA goal.</em></h2><p>Build consistency in Java, DSA, SQL and interview practice. Your progress stays saved as you learn.</p><button className="btn light" onClick={()=>setTab('learning')}>Continue learning →</button></div><div className="welcome-art"><div className="orbit orbit1"/><div className="orbit orbit2"/><div className="code-card"><span>JAVA · DSA</span><code>while (learning) {'{'}<br/>&nbsp; skills++;<br/>&nbsp; confidence++;<br/>{'}'}</code><div className="code-foot">BUILDING MOMENTUM <b>↗</b></div></div></div></section>
        <section className="stats"><div className="stat"><span>LEARNING PROGRESS</span><strong>{percent}%</strong><div className="progress"><i style={{width:percent+'%'}}/></div><small>{completed} of {allTopics.length} topics completed</small></div><div className="stat"><span>STUDY HOURS LOGGED</span><strong>{totalHours.toFixed(1)} <small>hrs</small></strong><small>{todayMinutes/60} hours logged today</small><button className="text-btn" onClick={()=>setTab('planner')}>Track study time →</button></div><div className="stat"><span>TODAY'S PLANNER</span><strong>{todayTasks.filter(t=>t.done).length}/{todayTasks.length}</strong><small>tasks completed today</small><button className="text-btn" onClick={()=>setTab('planner')}>Open planner →</button></div></section>
        <section className="section-head"><div><h2>Learning roadmap</h2><p>Your core placement preparation areas</p></div><button className="text-btn" onClick={()=>setTab('learning')}>View full plan →</button></section>
        <section className="area-grid">{areaOptions.slice(0,6).map((name,i)=>{const list=allTopics.filter(t=>t.area===name);const done=list.filter(t=>t.done).length;return <button className="area-card" key={name} onClick={()=>{setFilter(name);setTab('learning')}}><div className={'area-icon c'+i}>{['⌘','▤','◈','◉','⌁','◎'][i]}</div><div className="area-title">{name}</div><div className="area-meta">{done}/{list.length} completed</div><div className="progress"><i style={{width:(list.length?done/list.length*100:0)+'%'}}/></div></button>})}</section>
        <section className="section-head"><div><h2>Quick learning log</h2><p>Write down what you practiced today</p></div></section><form className="note-form" onSubmit={addNote}><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Example: Practiced Java loops and solved 3 problems..."/><button className="btn primary">Save note</button></form>
      </>}

      {tab==='learning' && <><form className="add-form" onSubmit={addTopic}><h3>Add your own topic</h3><div className="form-grid"><input required value={topicTitle} onChange={e=>setTopicTitle(e.target.value)} placeholder="Topic or task name"/><select value={topicArea} onChange={e=>setTopicArea(e.target.value)}>{areaOptions.map(a=><option key={a}>{a}</option>)}</select><button className="btn primary">+ Add topic</button></div></form><div className="filter-row"><button className={filter==='All'?'filter active':'filter'} onClick={()=>setFilter('All')}>All</button>{areaOptions.map(a=><button key={a} className={filter===a?'filter active':'filter'} onClick={()=>setFilter(a)}>{a}</button>)}</div><div className="topic-list">{allTopics.filter(t=>filter==='All'||t.area===filter).map(t=><label className={'topic '+(t.done?'done':'')} key={t.id}><input type="checkbox" checked={t.done} onChange={()=>toggleTopic(t.id)}/><span className="checkmark">{t.done?'✓':''}</span><div><small>{t.area}{t.custom?' · CUSTOM':''}</small><b>{t.title}</b></div><span className="topic-state">{t.done?'Completed':'To do'}</span></label>)}</div><p className="tip">Mark a topic complete only after you can explain it and solve a practice question without copying.</p></>}

      {tab==='questions' && <><form className="add-form" onSubmit={addQuestion}><h3>Add a coding or interview question</h3><div className="form-grid"><input required value={questionForm.title} onChange={e=>setQuestionForm({...questionForm,title:e.target.value})} placeholder="Question title"/><select value={questionForm.area} onChange={e=>setQuestionForm({...questionForm,area:e.target.value})}>{areaOptions.map(a=><option key={a}>{a}</option>)}</select><select value={questionForm.difficulty} onChange={e=>setQuestionForm({...questionForm,difficulty:e.target.value})}><option>Easy</option><option>Medium</option><option>Hard</option></select></div><textarea required value={questionForm.prompt} onChange={e=>setQuestionForm({...questionForm,prompt:e.target.value})} placeholder="Question / problem statement" rows="3"/><textarea value={questionForm.answer} onChange={e=>setQuestionForm({...questionForm,answer:e.target.value})} placeholder="Answer or solution (optional)" rows="3"/><textarea value={questionForm.explanation} onChange={e=>setQuestionForm({...questionForm,explanation:e.target.value})} placeholder="Explanation / key concept (optional)" rows="2"/><button className="btn primary">+ Save question</button></form><div className="section-head"><div><h2>Your question bank</h2><p>{data.questions.filter(q=>q.done).length} of {data.questions.length} practiced</p></div></div><div className="question-list">{data.questions.map(q=><article className="question-card" key={q.id}><div className="question-top"><span className="pill small-pill">{q.area}</span><span className="difficulty">{q.difficulty}</span><label className="practiced"><input type="checkbox" checked={q.done} onChange={()=>toggleQuestion(q.id)}/> Practiced</label></div><h3>{q.title}</h3><p className="question-prompt">{q.prompt}</p><button className="text-btn" onClick={()=>setShowAnswers(s=>({...s,[q.id]:!s[q.id]}))}>{showAnswers[q.id]?'Hide answer & explanation':'Reveal answer & explanation ↓'}</button>{showAnswers[q.id]&&<div className="answer-box"><b>Answer / solution</b><p>{q.answer||'No answer added yet.'}</p><b>Explanation</b><p>{q.explanation||'No explanation added yet.'}</p></div>}</article>)}</div></>}

      {tab==='planner' && <><section className="stats"><div className="stat"><span>TODAY'S STUDY TIME</span><strong>{(todayMinutes/60).toFixed(1)} <small>hrs</small></strong><small>Target: {data.dailyHours} hours</small><div className="progress"><i style={{width:Math.min(todayMinutes/(data.dailyHours*60)*100,100)+'%'}}/></div></div><div className="stat"><span>ALL-TIME STUDY</span><strong>{totalHours.toFixed(1)} <small>hrs</small></strong><small>Based on your study logs</small></div><div className="stat"><span>TODAY'S TASKS</span><strong>{todayTasks.filter(t=>t.done).length}/{todayTasks.length}</strong><small>Mark tasks complete as you go</small></div></section><form className="add-form" onSubmit={addTask}><h3>Plan a study task</h3><div className="form-grid"><input type="date" required value={taskForm.date} onChange={e=>setTaskForm({...taskForm,date:e.target.value})}/><input type="time" value={taskForm.time} onChange={e=>setTaskForm({...taskForm,time:e.target.value})}/><select value={taskForm.area} onChange={e=>setTaskForm({...taskForm,area:e.target.value})}>{areaOptions.map(a=><option key={a}>{a}</option>)}</select><input required value={taskForm.title} onChange={e=>setTaskForm({...taskForm,title:e.target.value})} placeholder="Task e.g. Solve 3 array problems"/><input type="number" min="5" step="5" value={taskForm.minutes} onChange={e=>setTaskForm({...taskForm,minutes:e.target.value})} aria-label="Estimated minutes"/><button className="btn primary">+ Add to planner</button></div></form><div className="section-head"><div><h2>Scheduled tasks</h2><p>All planned study sessions</p></div></div><div className="topic-list">{[...data.plannerTasks].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).map(t=><label className={'topic '+(t.done?'done':'')} key={t.id}><input type="checkbox" checked={t.done} onChange={()=>toggleTask(t.id)}/><span className="checkmark">{t.done?'✓':''}</span><div><small>{t.date} {t.time||'Time not set'} · {t.area} · {t.minutes} min</small><b>{t.title}</b></div><span className="topic-state">{t.done?'Done':'Planned'}</span></label>)}{data.plannerTasks.length===0&&<div className="empty">No planned tasks yet. Add your first task above.</div>}</div><form className="add-form log-form" onSubmit={addStudyLog}><h3>Log actual study time</h3><div className="form-grid"><input type="date" value={logForm.date} onChange={e=>setLogForm({...logForm,date:e.target.value})}/><select value={logForm.hours} onChange={e=>setLogForm({...logForm,hours:e.target.value})}><option value="0.25">15 minutes</option><option value="0.5">30 minutes</option><option value="0.75">45 minutes</option><option value="1">1 hour</option><option value="1.5">1.5 hours</option><option value="2">2 hours</option><option value="3">3 hours</option><option value="4">4 hours</option></select><input required value={logForm.topic} onChange={e=>setLogForm({...logForm,topic:e.target.value})} placeholder="What did you study?"/></div><textarea value={logForm.reflection} onChange={e=>setLogForm({...logForm,reflection:e.target.value})} placeholder="Optional: what went well or needs revision?" rows="2"/><button className="btn primary">Save study log</button></form><div className="notes-list">{data.studyLogs.map(l=><article className="note-card" key={l.id}><small>{l.date} · {l.hours} hours</small><p><b>{l.topic}</b></p>{l.reflection&&<p>{l.reflection}</p>}</article>)}</div></>}

      {tab==='notes' && <><form className="note-form notes-page" onSubmit={addNote}><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="What did you learn? What was difficult? What will you revise next?" rows="4"/><button className="btn primary">Save learning log</button></form><div className="notes-list">{data.notes.length===0?<div className="empty">No learning logs yet. Add your first note above.</div>:data.notes.map(n=><article className="note-card" key={n.id}><small>{n.date}</small><p>{n.text}</p><button className="text-btn" onClick={()=>setData(d=>({...d,notes:d.notes.filter(x=>x.id!==n.id)}))}>Delete</button></article>)}</div></>}

      {tab==='tutor' && <><div className="tutor-intro"><div className="tutor-symbol">✳</div><div><h2>Your AI placement tutor</h2><p>Ask about Java, DSA, SQL, interviews or your next study session. Your current progress snapshot is sent with each question.</p></div></div><form className="ask-form" onSubmit={askAI}><textarea value={aiQuestion} onChange={e=>setAiQuestion(e.target.value)} placeholder="Ask your placement tutor... e.g. Teach me Java loops" rows="3"/><button className="btn primary" disabled={aiBusy||!aiQuestion.trim()}>{aiBusy?'Thinking…':'Ask AI ↗'}</button></form>{aiError&&<div className="error">{aiError}</div>}{aiAnswer&&<div className="chat-window"><div className="chat-msg assistant"><small>AI TUTOR</small><p>{aiAnswer}</p></div></div>}<p className="tip">Requires the backend to be running and a valid API key in server/.env. API usage may cost money.</p></>}
      <footer>PLACEMENTOS · YOUR PROGRESS, YOUR PACE <span>Last saved {new Date(data.updatedAt).toLocaleString()}</span></footer>
    </main>
  </div>;
}
