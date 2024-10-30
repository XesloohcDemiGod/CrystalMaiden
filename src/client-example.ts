async function example() {
  // Start new journey
  const startResponse = await fetch('http://localhost:3000/api/journey/start', {
    method: 'POST',
  });
  const { sessionId } = await startResponse.json();

  // Set player name
  await fetch('http://localhost:3000/api/journey/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      action: 'setName',
      input: 'Player1',
    }),
  });

  // Select realm
  await fetch('http://localhost:3000/api/journey/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      action: 'selectRealm',
      input: 'Mathematical Kingdom',
    }),
  });
}
