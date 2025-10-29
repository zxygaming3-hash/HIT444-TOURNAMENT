const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Low, JSONFile } = require('lowdb');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple JSON file DB (lowdb)
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

async function initDB() {
  await db.read();
    db.data = db.data || { tournaments: [], registrations: [], admin: { password: 'admin123' } };
      await db.write();
      }
      initDB();

      // Public API
      app.get('/api/tournaments', async (req, res) => {
        await db.read();
          res.json(db.data.tournaments);
          });

          app.post('/api/tournaments', async (req, res) => {
            const { password, tournament } = req.body;
              await db.read();
                if (password !== db.data.admin.password) return res.status(401).json({ error: 'unauthorized' });
                  tournament.id = nanoid();
                    db.data.tournaments.push(tournament);
                      await db.write();
                        res.json({ ok: true, tournament });
                        });

                        app.post('/api/register', async (req, res) => {
                          const { name, team, tournamentId, amount, payerUpi } = req.body;
                            await db.read();
                              const registration = { id: nanoid(), name, team, tournamentId, amount, payerUpi, status: 'PENDING', createdAt: Date.now() };
                                db.data.registrations.push(registration);
                                  await db.write();
                                    const upiId = '9732066695@ibl';
                                      const payeeName = 'HIT444';
                                        const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${encodeURIComponent(amount)}&tn=${encodeURIComponent('Tournament Fee')}`;
                                          res.json({ registration, upiLink });
                                          });

                                          app.post('/api/confirm-payment', async (req, res) => {
                                            const { password, registrationId } = req.body;
                                              await db.read();
                                                if (password !== db.data.admin.password) return res.status(401).json({ error: 'unauthorized' });
                                                  const reg = db.data.registrations.find(r => r.id === registrationId);
                                                    if (!reg) return res.status(404).json({ error: 'not found' });
                                                      reg.status = 'PAID';
                                                        reg.paidAt = Date.now();
                                                          await db.write();
                                                            res.json({ ok: true, reg });
                                                            });

                                                            app.post('/api/admin/login', async (req, res) => {
                                                              const { password } = req.body;
                                                                await db.read();
                                                                  if (password === db.data.admin.password) {
                                                                      return res.json({ ok: true, token: 'admintoken123' });
                                                                        }
                                                                          res.status(401).json({ error: 'invalid' });
                                                                          });

                                                                          // Serve static frontend in production mode (if built)
                                                                          app.use(express.static(path.join(__dirname, '..', 'web', 'dist')));

                                                                          app.get('/api/health', (req, res) => res.json({ ok: true }));

                                                                          const port = process.env.PORT || 4000;
                                                                          app.listen(port, () => console.log('Server running on', port));
                                                                          