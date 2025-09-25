# Service Tickets for Software Installations for a Corporate Company

 built using **HTML, CSS, and JavaScript**.  
It allows employees to raise requests for software installations and admins to manage those requests.

---

## Features

### Employee
- Login as Employee.
- Chatbot-style ticket creation (software, reason, urgency).
- View tickets with status (Open, In Progress, Completed, Rejected).

### Admin
- Login as Admin.
- View all tickets raised by employees.
- Update ticket status (Start, Complete, Reject).
- Add comments for employees.

---

## Default Login Credentials
- **Employee** → username: `employee`, password: `employee123`  
- **Admin** → username: `admin`, password: `admin123`  
- New users can also **register with their own password**.

---

## How It Works
- All data is stored in the browser using **LocalStorage** (no database required).  
- Works completely offline.  

---

## How to Run
1. Open `index.html` in a browser.
2. Login as Employee or Admin.
3. Use the system to raise and manage tickets.

---

## Project Structure
- `index.html` → Login page  
- `dashboard.html` → Employee dashboard  
- `admin.html` → Admin dashboard  
- `styles.css` → Styling  
- `script.js` → Logic for login, tickets, chat, and admin  
