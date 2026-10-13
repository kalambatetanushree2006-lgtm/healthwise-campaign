/*
  HealthWise campaign website
  DEMO MODE: works immediately using this browser's localStorage.
  SHARED MODE: add your Supabase project URL and anon/publishable key below,
  then run supabase.sql in your Supabase SQL Editor.
*/
const SUPABASE_URL = "https://eurryltgkmqvbocnehkx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9b0tdk1UG8_l4NjCo-08iw_E7Dmapo1";
const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase);

let db = null;
if (isSupabaseConfigured) {
  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const questions = [
  {q:"Which choice is a good way to build a balanced meal?",a:["Only eating one type of food","Including a variety of food groups","Skipping meals regularly","Avoiding all vegetables"],correct:1,why:"A varied diet helps provide the nutrients your body needs."},
  {q:"For routine handwashing, what should you use?",a:["Only dry tissue","Perfume and water","Soap and clean running water","Hand cream alone"],correct:2,why:"Soap and clean running water help remove dirt and many germs."},
  {q:"Which is a practical way to add movement to your day?",a:["Taking a short walk","Sitting for every break","Avoiding all outdoor activity","Sleeping less to stay busy"],correct:0,why:"Walking is an accessible way to add physical activity to daily life."},
  {q:"If stress is affecting your everyday life, what is a helpful step?",a:["Ignore it indefinitely","Never tell anyone","Use alcohol to cope","Talk to someone you trust or a qualified professional"],correct:3,why:"Support from trusted people and qualified professionals can help."},
  {q:"Where should you look for reliable health information?",a:["An anonymous rumour only","A trusted public health source or qualified professional","A viral post without checking it","A product advertisement alone"],correct:1,why:"Trusted public health organisations and qualified professionals are better sources for health guidance."}
];
let currentQuestion = 0;
let answers = Array(questions.length).fill(null);
let quizLocked = false;

const $ = (id) => document.getElementById(id);
const localRead = (key) => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
const localWrite = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const safeText = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const dateLabel = (value) => { const d = new Date(value); return Number.isNaN(d.getTime()) ? "Recently" : d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}); };

$("menuToggle").addEventListener("click", () => $("navLinks").classList.toggle("open"));
document.querySelectorAll("#navLinks a").forEach(a => a.addEventListener("click", () => $("navLinks").classList.remove("open")));

function renderQuestion() {
  const item = questions[currentQuestion];
  $("questionCounter").textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  $("quizProgress").style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
  $("questionArea").innerHTML = `<h3 class="question-title">${currentQuestion + 1}. ${safeText(item.q)}</h3><div class="answer-list">${item.a.map((answer,index)=>`<label class="answer-option"><input type="radio" name="answer" value="${index}" ${answers[currentQuestion] === index ? "checked" : ""}><span>${safeText(answer)}</span></label>`).join("")}</div>`;
  $("prevQuestion").disabled = currentQuestion === 0;
  $("nextQuestion").classList.toggle("hidden", currentQuestion === questions.length - 1);
  $("submitQuiz").classList.toggle("hidden", currentQuestion !== questions.length - 1);
}
function storeAnswer() {
  const chosen = document.querySelector('input[name="answer"]:checked');
  if (chosen) answers[currentQuestion] = Number(chosen.value);
}
$("prevQuestion").addEventListener("click", () => { storeAnswer(); if(currentQuestion > 0) currentQuestion--; renderQuestion(); });
$("nextQuestion").addEventListener("click", () => {
  storeAnswer();
  if (answers[currentQuestion] === null) { alert("Please choose an answer before continuing."); return; }
  if(currentQuestion < questions.length - 1) currentQuestion++;
  renderQuestion();
});
$("quizForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (quizLocked) return;
  storeAnswer();
  if (answers.some(a => a === null)) { alert("Please answer every question before submitting."); return; }
  quizLocked = true;
  const score = answers.reduce((total,answer,index)=>total+(answer===questions[index].correct?1:0),0);
  const result = {score, total:questions.length, answers:[...answers], created_at:new Date().toISOString()};
  try {
    if (db) {
      const { error } = await db.from("quiz_responses").insert({
  score: result.score,
  total_questions: result.total
});
      if (error) throw error;
    } else {
      const data = localRead("hw_quizzes"); data.push(result); localWrite("hw_quizzes",data);
    }
    $("questionArea").innerHTML = "";
    $("quizForm").querySelector(".quiz-controls").classList.add("hidden");
    $("quizResult").classList.remove("hidden");
    $("quizResult").innerHTML = `<strong>You scored ${score} / ${questions.length}</strong><p>${score===5?"Excellent! You have a strong foundation in these health basics.":score>=3?"Good effort! Review the explanations below to learn a little more.":"Thanks for taking part! Keep exploring the health tips above."}</p>${questions.map((q,i)=>`<p><b>${i+1}. ${answers[i]===q.correct?"✓":"↗"} ${safeText(q.why)}</b></p>`).join("")}<button type="button" class="button button-primary" id="restartQuiz">Try again</button>`;
    $("restartQuiz").addEventListener("click", resetQuiz);
    await refreshDashboard();
  } catch (error) {
    quizLocked = false;
    alert("Your quiz could not be saved. Please check your internet connection and database setup, then try again.");
    console.error(error);
  }
});
function resetQuiz() {
  currentQuestion=0; answers=Array(questions.length).fill(null); quizLocked=false;
  $("quizForm").querySelector(".quiz-controls").classList.remove("hidden");
  $("quizResult").classList.add("hidden"); $("quizResult").innerHTML="";
  renderQuestion();
}
renderQuestion();

$("feedbackForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = $("feedbackMessage");
  const rating = Number(form.elements.rating.value);
  const useful = form.elements.useful.value;
  const comment = form.elements.comment.value.trim();
  const name = form.elements.name.value.trim();
  const record = {rating,useful,comment,name,created_at:new Date().toISOString()};
  $("feedbackSubmit").disabled = true;
  message.textContent = "Sending your feedback…"; message.classList.remove("error");
  try {
    if (db) {
      const {error} = await db.from("feedback_responses").insert({
        display_name: name || null, rating, useful_topic: useful, comment: comment || null, consent: true
      });
      if (error) throw error;
    } else {
      const data = localRead("hw_feedback"); data.push(record); localWrite("hw_feedback",data);
    }
    form.reset();
    message.textContent = "Thank you! Your feedback has been recorded.";
    await refreshDashboard();
  } catch (error) {
    message.textContent = "We couldn't save your response. Please try again in a moment.";
    message.classList.add("error"); console.error(error);
  } finally { $("feedbackSubmit").disabled = false; }
});

async function getData() {
  if (!db) return {quizzes:localRead("hw_quizzes"), feedback:localRead("hw_feedback")};
  const [qRes,fRes] = await Promise.all([
    db.from("quiz_responses").select("score,total_questions,created_at").order("created_at",{ascending:false}).limit(1000),
    db.from("feedback_responses").select("rating,useful_topic,comment,created_at,consent").eq("consent",true).order("created_at",{ascending:false}).limit(1000)
  ]);
  if(qRes.error) throw qRes.error;
  if(fRes.error) throw fRes.error;
  return {quizzes:qRes.data||[],feedback:fRes.data||[]};
}
function setText(id,value){$(id).textContent=value;}
function renderBreakdown(feedback) {
  const counts={};
  feedback.forEach(item=>{const topic=item.useful_topic||item.useful||"Other";counts[topic]=(counts[topic]||0)+1;});
  const entries=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  if(!entries.length){$("topicBreakdown").innerHTML='<p class="empty-state">Responses will appear here after feedback is submitted.</p>';return;}
  const max=Math.max(...entries.map(x=>x[1]));
  $("topicBreakdown").innerHTML=entries.map(([topic,count])=>`<div class="bar-row"><div class="bar-label"><span>${safeText(topic)}</span><span>${count} response${count===1?"":"s"}</span></div><div class="bar-track"><div class="bar-fill" style="width:${count/max*100}%"></div></div></div>`).join("");
}
function renderFeedback(feedback) {
  const comments=feedback.filter(x=>(x.comment||"").trim()).slice(0,8);
  if(!comments.length){$("feedbackList").innerHTML='<p class="empty-state">No written comments yet. Submitted comments will appear here.</p>';return;}
  $("feedbackList").innerHTML=comments.map(x=>`<article class="feedback-entry"><div class="feedback-entry-top"><strong>Anonymous participant</strong><span class="feedback-stars">${"★".repeat(Number(x.rating)||0)}${"☆".repeat(5-(Number(x.rating)||0))}</span></div><p>${safeText(x.comment)}</p><small>${dateLabel(x.created_at)}</small></article>`).join("");
}
async function refreshDashboard() {
  try {
    const {quizzes,feedback}=await getData();
    const participantCount=quizzes.length, feedbackCount=feedback.length;
    const averageScore=participantCount?quizzes.reduce((sum,x)=>sum+Number(x.score||0),0)/participantCount:null;
    const averageRating=feedbackCount?feedback.reduce((sum,x)=>sum+Number(x.rating||0),0)/feedbackCount:null;
    setText("heroParticipants",participantCount); setText("heroFeedback",feedbackCount); setText("heroRating",averageRating===null?"—":`${averageRating.toFixed(1)}/5`);
    setText("dashParticipants",participantCount); setText("dashFeedback",feedbackCount);
    setText("dashScore",averageScore===null?"—":`${averageScore.toFixed(1)}/5`);
    setText("dashRating",averageRating===null?"—":`${averageRating.toFixed(1)}/5`);
    renderBreakdown(feedback); renderFeedback(feedback);
    $("connectionNotice").textContent=db?"Connected to Supabase: results are shared across visitors and devices.":"Demo mode: results are stored only in this browser. Connect Supabase to share real responses across devices.";
    $("connectionNotice").style.background=db?"#e9f7ef":"";
    $("connectionNotice").style.borderColor=db?"#cde9d8":"";
    $("connectionNotice").style.color=db?"#23664e":"";
  } catch(error) {
    $("connectionNotice").textContent="Database connection error. Check your Supabase URL, public key and table policies.";
    $("connectionNotice").classList.add("error"); console.error(error);
  }
}
refreshDashboard();
