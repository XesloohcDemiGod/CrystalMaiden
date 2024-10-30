import express from 'express';
import cors from 'cors';
import { startJourney, JourneyState } from './interactive-journey';

const app = express();
app.use(cors());
app.use(express.json());

// Store active sessions
const activeSessions: Map<string, JourneyState> = new Map();

app.post('/api/journey/start', async (req, res) => {
  const sessionId = Math.random().toString(36).substring(7);
  const state = new JourneyState(sessionId);
  activeSessions.set(sessionId, state);

  const intro = await state.getIntroduction();
  res.json({ sessionId, message: intro, choices: state.getCurrentChoices() });
});

app.post('/api/journey/action', async (req, res) => {
  const { sessionId, action, input } = req.body;
  const state = activeSessions.get(sessionId);

  if (!state) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const result = await state.processAction(action, input);
  res.json(result);
});

app.get('/api/journey/state/:sessionId', (req, res) => {
  const state = activeSessions.get(req.params.sessionId);
  if (!state) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(state.getPublicState());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
