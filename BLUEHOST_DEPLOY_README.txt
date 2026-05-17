LIS Academy Bluehost Deployment

This zip contains the built React frontend and the Express backend.

Important:
Uploading this through cPanel File Manager alone will not run the backend.
The backend needs Bluehost cPanel's Node.js App feature.

Use these settings in cPanel Node.js App:

Application root: the folder where you unzip this package
Application startup file: server/index.js
Run command / start script: npm start

Required environment variables:

DATABASE_URL=your Neon/Postgres connection string
JWT_SECRET=a long random secret
ADMIN_USERNAME=your admin username
ADMIN_PASSWORD=your admin password
PORT=8787 or the port assigned by Bluehost
VITE_API_BASE_URL=
VITE_DONATION_PAYMENT_URL_TEMPLATE=your donation payment URL template

After installing dependencies and starting the Node.js app, the same app serves:

Frontend: /
Backend API: /api/...

If your Bluehost plan does not support Node.js apps, only the frontend can run
from File Manager/public_html. The backend must be hosted on a Node.js-capable
service.
