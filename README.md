# Facebook Clone

A full-stack Facebook clone built with React, Node.js/Express, MongoDB, and Socket.io.

---

## Project Structure

```
deployment/
├── client/          ← React frontend (port 3000)
├── server/          ← Express REST API (port 5757)
└── socket/          ← Socket.io server (port 8900)
```

---

## Features

### Authentication
- Register / Login with JWT (7-day token, httpOnly cookie)
- Logout
- Protected routes

### News Feed
- **Stories** — 24-hour stories with image upload and fullscreen viewer
- **Create Posts** — text + image, auto-uploaded to server
- **Timeline Feed** — posts from yourself and people you follow
- **Like / Unlike** posts (with real-time like count)
- **Comments** — add/delete comments, like individual comments
- **Delete Post** — owner can delete their own posts

### Profile
- Cover photo + profile picture
- Bio, city, hometown, relationship status
- **Edit Profile** — update bio, city, hometown, relationship, profile picture, cover photo
- Follow / Unfollow users

### Messenger (real-time chat)
- 1-on-1 conversations
- Real-time message delivery via Socket.io
- **Typing indicator** (animated bouncing dots)
- Message history persisted in MongoDB
- Online friends panel

### Notifications
- Notification badge in topbar (polls every 30s)
- Dropdown with recent notifications
- Types: like, comment, follow, message
- Auto-mark as read when dropdown opens

### Search
- Live user search from the topbar
- Debounced API calls (300ms)
- Clickable results navigate to user profile

### Social
- Follow / Unfollow users
- **Friend suggestions** (people you don't follow yet)
- Online friends tracking via socket
- Sidebar shows following list

---

## Tech Stack

| Layer     | Technology                       |
|-----------|----------------------------------|
| Frontend  | React 18, React Router v6, Axios |
| Styling   | SCSS (custom, Facebook-like)     |
| UI Icons  | Material UI v5                   |
| Backend   | Node.js, Express                 |
| Database  | MongoDB Atlas (Mongoose)         |
| Auth      | JWT (cookie + Bearer header)     |
| Real-time | Socket.io v4                     |
| Upload    | Multer                           |

---

## Running Locally

Open **3 terminal tabs**:

### 1. Backend (server)
```bash
cd deployment/server
npm install     # first time only
npm start       # runs on :5757
```

### 2. Socket (real-time)
```bash
cd deployment/socket
npm install     # first time only
npm start       # runs on :8900
```

### 3. Frontend (client)
```bash
cd deployment/client
npm install     # first time only
npm start       # runs on :3000
```

Then open **http://localhost:3000** in your browser.

---

## Environment Variables

### `server/.env`
```
MONGO_URL=<your-mongodb-atlas-uri>
PORT=5757
MY_JWT_SECRET_KEY=<your-secret>
```

### `client/.env`
```
REACT_APP_PUBLIC_FOLDER=http://localhost:5757/images/
DANGEROUSLY_DISABLE_HOST_CHECK=true
```

---

## API Endpoints

### Auth
| Method | Endpoint         | Description     |
|--------|-----------------|-----------------|
| POST   | /auth/register  | Register user   |
| POST   | /auth/login     | Login user      |
| POST   | /auth/logout    | Logout user     |

### Users
| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| GET    | /users?userId=&userName=    | Get user info        |
| GET    | /users/search?q=            | Search users         |
| GET    | /users/friends/:userId      | Get following list   |
| GET    | /users/suggestions/:userId  | Friend suggestions   |
| PUT    | /users/:id                  | Update user          |
| PUT    | /users/:id/follow           | Follow user          |
| PUT    | /users/:id/unfollow         | Unfollow user        |

### Posts
| Method | Endpoint                     | Description          |
|--------|------------------------------|----------------------|
| POST   | /post                        | Create post          |
| GET    | /post/timeline/:userId       | Timeline feed        |
| GET    | /post/profile/:userName      | User's posts         |
| PUT    | /post/:id/like               | Like/unlike          |
| DELETE | /post/:id                    | Delete post          |

### Comments
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| POST   | /comments             | Create comment    |
| GET    | /comments/:postId     | Get post comments |
| PUT    | /comments/:id/like    | Like/unlike       |
| DELETE | /comments/:id         | Delete comment    |

### Stories
| Method | Endpoint                      | Description           |
|--------|-------------------------------|-----------------------|
| POST   | /stories                      | Create story          |
| GET    | /stories/timeline/:userId     | Timeline stories      |
| DELETE | /stories/:id                  | Delete story          |

### Notifications
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /notifications/:userId          | Get notifications        |
| GET    | /notifications/:userId/unread-count | Unread count         |
| PUT    | /notifications/:userId/read-all | Mark all as read         |

### Conversations & Messages
| Method | Endpoint                          | Description               |
|--------|-----------------------------------|---------------------------|
| POST   | /conversations                    | Create conversation       |
| GET    | /conversations/:userId            | Get user conversations    |
| GET    | /conversations/find/:u1/:u2       | Find conversation by users|
| POST   | /messages                         | Send message              |
| GET    | /messages/:conversationId         | Get messages              |

### Uploads
| Method | Endpoint        | Description               |
|--------|-----------------|---------------------------|
| POST   | /upload         | Generic upload (legacy)   |
| POST   | /upload/profile | Profile picture           |
| POST   | /upload/cover   | Cover photo               |
| POST   | /upload/story   | Story image               |

---

## Socket Events

| Event             | Direction          | Payload                            |
|-------------------|--------------------|------------------------------------|
| `addUser`         | Client → Server    | `userId`                           |
| `getUsers`        | Server → Client    | `[{userId, socketId}]`             |
| `sendMessage`     | Client → Server    | `{userId, receiverId, text}`       |
| `getMessage`      | Server → Client    | `{userId, text}`                   |
| `typing`          | Client → Server    | `{userId, receiverId}`             |
| `typingIndicator` | Server → Client    | `{userId}`                         |
| `stopTyping`      | Client → Server    | `{userId, receiverId}`             |
| `stopTyping`      | Server → Client    | `{userId}`                         |
