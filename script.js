
function login(event) {
  event.preventDefault(); 

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

 
  if (username === "employee" && password === "employee123") {
    alert("Login successful as Employee!");
    window.location.href = "dashboard.html";
  } 
  else if (username === "admin" && password === "admin123") {
    alert("Login successful as Admin!");
    window.location.href = "admin.html"; 
  } 
  else {
    alert("Invalid credentials given! Try again.");
  }
}

const STORAGE_KEY = 'helpdesk_buddy_tickets_v1';


function loadTickets(){
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}
function saveTickets(t){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
}


const friendlyStatus = {
  'Open': 'Your request is waiting in line ⏳',
  'In Progress': 'Your request is being handled 🔧',
  'Completed': 'All done 🎉 You can use the software now.',
  'Rejected': 'Request rejected ❌ Please contact IT.'
};


if(document.getElementById('chat')){
  const chat = document.getElementById('chat');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const myTicketsContainer = document.getElementById('myTicketsContainer');

  
  const steps = [
    { key:'software', prompt:'What software do you need? (e.g., Zoom, VS Code, Slack)'} ,
    { key:'reason', prompt:'Why do you need it? (brief)'} ,
    { key:'priority', prompt:'How urgent is this? (Low / Medium / High)'}
  ];

  
  let inProgress = JSON.parse(localStorage.getItem('helpdesk_inprogress') || 'null');
  if(!inProgress){
    inProgress = { step:0, ticketData:{} };
    localStorage.setItem('helpdesk_inprogress', JSON.stringify(inProgress));
  }

  
  function appendBubble(text, who='buddy'){
    const div = document.createElement('div');
    div.className = 'chat-bubble ' + (who==='buddy' ? 'buddy' : 'user');
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }


  if(chat.children.length === 0){
    appendBubble('Hi 👋 I\'m HelpDesk Buddy. I will help you create a software installation request.');
    setTimeout(()=> appendBubble(steps[inProgress.step].prompt), 600);

  }

  
  function renderMyTickets(){
    const tickets = loadTickets();
    myTicketsContainer.innerHTML = '';
    if(tickets.length === 0) {
      myTicketsContainer.innerHTML = '<p class="small">No tickets yet — create one via the chat above.</p>';
      return;
    }
    tickets.slice().reverse().forEach(t => {
      const el = document.createElement('div');
      el.className = 'ticket-card';
      el.innerHTML = `
        <div class="ticket-left">
          <div><strong>${t.software}</strong> <span class="meta">· ${t.priority}</span></div>
          <div class="meta">${t.reason}</div>
          <div class="small">${new Date(t.created_at).toLocaleString()}</div>
        </div>
        <div class="ticket-right">
          <div class="meta">${friendlyStatus[t.status] || t.status}</div>
        </div>
      `;
      myTicketsContainer.appendChild(el);
    });
  }

  renderMyTickets();
  form.addEventListener('submit', (e) =>{
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;
    appendBubble(text, 'user');
    input.value = '';

    // save response
    const stepIdx = inProgress.step;
    const key = steps[stepIdx].key;
    inProgress.ticketData[key] = text;
    inProgress.step++;
    localStorage.setItem('helpdesk_inprogress', JSON.stringify(inProgress));

    
    if(inProgress.step < steps.length){
      setTimeout(()=> appendBubble(steps[inProgress.step].prompt), 500);
    } else {
      // create ticket
      const ticket = {
        id: Date.now(),
        software: inProgress.ticketData.software || 'Unknown',
        reason: inProgress.ticketData.reason || '',
        priority: (inProgress.ticketData.priority || 'Medium'),
        status: 'Open',
        created_at: new Date().toISOString(),
        comments: []
      };
      const tickets = loadTickets();
      tickets.push(ticket);
      saveTickets(tickets);

      setTimeout(()=> appendBubble('🎉 All set — I created your ticket! We will notify you when an IT person starts work.'), 600);
      setTimeout(()=> appendBubble('Ticket summary: ' + ticket.software + ' — ' + ticket.priority), 900);

      // reset inProgress
      inProgress = { step:0, ticketData:{} };
      localStorage.setItem('helpdesk_inprogress', JSON.stringify(inProgress));

      // re-render tickets
      renderMyTickets();
    }
  });
}

// ---------- Admin page logic ----------
if(document.getElementById('allTicketsContainer')){
  const container = document.getElementById('allTicketsContainer');
  const filterSelect = document.getElementById('filterStatus');

  function renderAll(){
    const tickets = loadTickets();
    const filter = filterSelect.value;
    container.innerHTML = '';
    const list = tickets.slice().reverse().filter(t => filter === 'all' ? true : t.status === filter);
    if(list.length === 0){
      container.innerHTML = '<p class="small">No tickets match this filter.</p>';
      return;
    }
    list.forEach(t => {
      const div = document.createElement('div');
      div.className = 'ticket-card';
      div.innerHTML = `
        <div class="ticket-left">
          <div><strong>${t.software}</strong> <span class="meta">· ${t.priority}</span></div>
          <div class="meta">${t.reason}</div>
          <div class="small">${new Date(t.created_at).toLocaleString()}</div>
          <div class="small">Status: <strong>${t.status}</strong> — ${friendlyStatus[t.status] || ''}</div>
          <div class="small">Comments:</div>
          <div id="comments-${t.id}" class="small" style="white-space:pre-wrap">${(t.comments || []).join('<br>')}</div>

            <input id="msg-${t.id}" placeholder="Add a friendly admin comment" style="padding:6px;border-radius:6px;border:1px solid #e6edf3;width:60%" />
            <button onclick="adminAddComment(${t.id})" style="padding:6px 10px;border-radius:6px;margin-left:6px">Send</button>
          </div>
        </div>
        <div class="ticket-actions">
          <button class="btn-start" onclick="adminUpdateStatus(${t.id}, 'In Progress')">Start  </button>
          <button class="btn-complete" onclick="adminUpdateStatus(${t.id}, 'Completed')">Complete </button>
          <button class="btn-reject" onclick="adminUpdateStatus(${t.id}, 'Rejected')">Reject </button>
        </div>
      `;
      container.appendChild(div);
    });
  }

  // expose functions to window for inline onclicks
  window.adminUpdateStatus = function(id, newStatus){
    const tickets = loadTickets();
    const idx = tickets.findIndex(x => x.id === id);
    if(idx === -1) return alert('Ticket not found');
    tickets[idx].status = newStatus;
    // add a note automatically
    const note = `[ADMIN ${new Date().toLocaleString()}] <strong> Status changed to ${newStatus} </strong`;
    tickets[idx].comments = tickets[idx].comments || [];
    tickets[idx].comments.push(note);
    saveTickets(tickets);
    renderAll();
  }

  window.adminAddComment = function(id){
    const el = document.getElementById('msg-' + id);
    if(!el) return;
    const txt = el.value.trim();
    if(!txt) return;
    const tickets = loadTickets();
    const idx = tickets.findIndex(x => x.id === id);
    if(idx === -1) return alert('Ticket not found');
    const note = `[ADMIN ${new Date().toLocaleString()}] ${txt}`;
    tickets[idx].comments = tickets[idx].comments || [];
    tickets[idx].comments.push(note);
    saveTickets(tickets);
    el.value = '';
    renderAll();
  }

  filterSelect.addEventListener('change', renderAll);
  // initial render
  renderAll();
}  