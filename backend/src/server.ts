import express from 'express';
import { config } from './config/env';
import healthRouter from './routes/health';
import electionsRouter from './routes/elections';
import candidatesRouter from './routes/candidates';
import usersRouter from './routes/users';
import transactionsRouter from './routes/transactions';
import { authenticateUser, optionalAuthenticateUser } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || config.port || 5000;
const HOST = '0.0.0.0';

// CORS Headers - Allow FRONTEND_URL if set, or incoming origin/wildcard
app.use((req, res, next) => {
  const frontendUrl = process.env.FRONTEND_URL || config.frontendUrl;
  const origin = req.headers.origin;

  if (frontendUrl && frontendUrl.trim() !== '' && frontendUrl !== '*') {
    const allowedOrigins = frontendUrl.split(',').map((o) => o.trim());
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
  } else if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json());

// Public & Optional Auth routes
app.use('/api', healthRouter);
app.use('/api/users', usersRouter); // Handles its own public (/register, /login) and protected (/me) endpoints
app.use('/api/elections', optionalAuthenticateUser, electionsRouter);
app.use('/api/elections', optionalAuthenticateUser, candidatesRouter);

// Protected routes requiring Bearer authentication
app.use('/api/transactions', authenticateUser, transactionsRouter);

// Centralized error handling middleware
app.use(errorHandler);

app.listen(Number(PORT), HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
