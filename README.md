TEAM CHAT FULLSTACK WEB APPLICATION

A mini team chat application built as a full‑stack project. Users can sign up, create and join channels, and communicate with each other in real time.

Features:

User authentication (sign up & login)
Persistent login using JWT
Create, view, join, and leave channels
Real-time messaging using WebSockets
Online / offline user presence
Message history with pagination (load older messages)
Total count of members in each Channel
Message editing & deletion (own messages only)
Clean, responsive UI

Tech Stack:

Frontend 

React
TypeScript
React Router
Axios
Plain CSS (custom styling)

Backend

FastAPI
Python
PostgreSQL
SQLAlchemy
Alembic (migrations)
WebSockets (real-time messaging & presence)
JWT authentication (HTTP Bearer)

Project Structure:

team-chat-frontend/
├─ src/
│  ├─ api/
│  │  └─ client.ts            
│  ├─ assets/
│  ├─ components/
│  │  └─ ProtectedRoute.tsx
│  ├─ context/
│  │  └─ AuthContext.tsx
│  ├─ hooks/
│  │  └─ useAuth.ts
│  ├─ pages/
│  │  ├─ LoginPage.tsx
│  │  ├─ SignupPage.tsx
│  │  ├─ ChannelsPage.tsx
│  │  └─ ChannelChatPage.tsx
│  ├─ App.tsx
│  ├─ index.css
│  ├─ main.tsx
│  └─ types.ts
├─ public/
├─ package.json
├─ vite.config.ts
└─ .env.example


team-chat-backend/
├─ alembic/                   
├─ app/
│  ├─ core/
│  │  └─ config.py             
│  ├─ db/
│  │  └─ db_session.py        
│  ├─ models/
│  │  ├─ user.py
│  │  ├─ channel.py
│  │  ├─ message.py
│  │  └─ channel_member.py
│  ├─ routers/
│  │  ├─ auth_controller.py
│  │  ├─ channels_controller.py
│  │  ├─ messages_controller.py
│  │  └─ websocket_controller.py
│  ├─ schemas/
│  │  ├─ auth_schema.py
│  │  ├─ user.py
│  │  ├─ channel.py
│  │  └─ message.py
│  ├─ services/
│  │  ├─ auth_service.py
│  │  ├─ channel_service.py
│  │  └─ message_service.py
│  ├─ utils/
│  │  ├─ deps.py
│  │  └─ jwt.py
│  └─ main.py                
├─ alembic.ini
├─ requirements.txt
├─ .env.example

Setup Instructions:

Prerequisites:

Node.js (v18+)
Python (3.10+)
PostgreSQL

Frontend Setup:

cd team-chat-frontend
npm install
npm run dev
.env file - VITE_API_BASE_URL


Backend Setup:

cd team-chat-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
.env file - DATABASE_URL, SECRET_KEY
migrations - alembic upgrade head
start server - uvicorn app.main:app --reload

API Routes(Main)

Auth

POST /auth/signup
POST /auth/login

Channels

GET /channels – list all channels
POST /channels/{id}/join – join a channel
POST /channels/{id}/leave – leave a channel
GET /channels/{id}/members – list channel members / member count

Messages

GET /messages/{channel_id} – list messages in a channel (with pagination via limit + offset)
POST /messages/{channel_id} – send a new message in a channel
PATCH /messages/by-id/{message_id} – edit an existing message (only by sender)
DELETE /messages/by-id/{message_id} – delete an existing message (only by sender)

WebSocket

WS /ws/channels/{channel_id} – real-time messaging & presence updates

Real-time communication is implemented using WebSockets.
When users connect to a channel, presence updates are broadcast to all connected users.
Messages are saved in the database and delivered instantly to all channel members.

Message History and Pagination

When a channel is opened, recent messages are loaded first.
Older messages are fetched in batches using limit + offset (pagination).
This avoids loading the entire history at once and keeps the UI responsive.

Optional Features Implemented (Bonus)

From the optional list in the assignment, this project includes:

Message editing – users can edit only their own messages
Message deletion – users can delete only their own messages

Deployment

Frontend URL: <Your Frontend Deployment URL>
Backend URL: <Your Backend Deployment URL>

Author

Varshini Saravanan
FullStack Developer
