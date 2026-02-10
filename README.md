# chatme

A real-time chat application built with Socket.IO, React, and TypeScript.

Users join with a randomly generated 16-character username and chat in a single general room. No authentication, no DMs, no database — just simple real-time messaging.

## Tech Stack

- **Backend**: Node.js + TypeScript + Socket.IO
- **Frontend**: React + TypeScript + Vite

## Getting Started

### Prerequisites

- Node.js 22+

### Install Dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### Development

Run in two separate terminals:

```bash
# Terminal 1 - Server (port 3001, auto-restarts on changes)
cd server && npm run dev

# Terminal 2 - Client (port 5173, HMR enabled)
cd client && npm run dev
```

Open `http://localhost:5173` in your browser.

### Production

```bash
# Build the client
cd client && npx vite build

# Start the server (serves both API and static files)
cd ../server && npm start
```

Open `http://localhost:3001` in your browser.

## Deployment (Nginx + Cloudflare)

1. Add nginx config for your domain:

```nginx
server {
    listen 80;
    server_name chat.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

2. Enable the site and set up SSL:

```bash
sudo ln -s /etc/nginx/sites-available/chat.yourdomain.com /etc/nginx/sites-enabled/
sudo certbot --nginx -d chat.yourdomain.com
sudo nginx -t && sudo systemctl reload nginx
```

3. Run with pm2:

```bash
pm2 start "npm start" --name chatme
```

## Project Structure

```
chatme/
├── server/src/
│   ├── index.ts       # HTTP server + Socket.IO
│   ├── types.ts       # Event type interfaces
│   └── utils.ts       # Username/ID generators
└── client/src/
    ├── App.tsx         # Root component + socket lifecycle
    ├── socket.ts       # Socket.IO client instance
    ├── types.ts        # Event type interfaces
    └── components/
        ├── Chat.tsx          # Layout container
        ├── MessageList.tsx   # Message display
        ├── MessageInput.tsx  # Text input
        └── UserList.tsx      # Online users sidebar
```
