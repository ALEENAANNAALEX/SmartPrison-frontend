const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data storage
let visitRules = [
  {
    _id: '1',
    title: '15 Minutes visit time',
    description: 'You have 15 minutes for this visit. Please use this time respectfully and meaningfully. Avoid any exchange of prohibited items or sensitive information.',
    category: 'general',
    rules: ['No physical contact', 'Keep voices low'],
    restrictions: ['No food items', 'No electronic devices'],
    eligibilityCriteria: ['Valid ID required', 'Pre-approved visitors only'],
    isActive: true
  }
];

let paroleRules = [
  {
    _id: '1',
    title: 'Weekly Check-in',
    description: 'All parolees must check in weekly with their assigned officer.',
    category: 'general',
    rules: ['Report every Monday', 'Bring required documents'],
    restrictions: ['No travel without permission', 'No contact with victims'],
    eligibilityCriteria: ['Good behavior record', 'Completed rehabilitation program'],
    isActive: true
  }
];

let prisonRules = [
  {
    _id: '1',
    title: 'Cell Inspection',
    description: 'All cells are subject to regular inspection.',
    category: 'general',
    ruleNumber: 'R001',
    severity: 'medium',
    consequences: ['Warning', 'Loss of privileges'],
    applicableBlocks: [],
    isActive: true
  }
];

let users = [
  {
    _id: '1',
    fullName: 'John Admin',
    email: 'admin@prison.gov',
    role: 'admin',
    status: 'active',
    lastLogin: new Date().toISOString()
  }
];

let prisoners = [];
let blocks = [
  { _id: '1', name: 'Block A', capacity: 50, currentOccupancy: 25 },
  { _id: '2', name: 'Block B', capacity: 40, currentOccupancy: 30 }
];

// Auth middleware (mock)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  // Mock token validation - in real app, verify JWT
  next();
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock server is running' });
});

// Visit Rules Routes
app.get('/api/admin/rules/visits', authenticateToken, (req, res) => {
  console.log('GET /api/admin/rules/visits called');
  res.json({ success: true, rules: visitRules });
});

app.post('/api/admin/rules/visits', authenticateToken, (req, res) => {
  console.log('POST /api/admin/rules/visits called with:', req.body);
  const newRule = {
    _id: Date.now().toString(),
    ...req.body
  };
  visitRules.push(newRule);
  res.json({ success: true, rule: newRule });
});

app.put('/api/admin/rules/visits/:id', authenticateToken, (req, res) => {
  console.log('PUT /api/admin/rules/visits/:id called with:', req.params.id, req.body);
  const ruleIndex = visitRules.findIndex(rule => rule._id === req.params.id);
  if (ruleIndex !== -1) {
    visitRules[ruleIndex] = { ...visitRules[ruleIndex], ...req.body };
    res.json({ success: true, rule: visitRules[ruleIndex] });
  } else {
    res.status(404).json({ message: 'Rule not found' });
  }
});

app.delete('/api/admin/rules/visits/:id', authenticateToken, (req, res) => {
  console.log('DELETE /api/admin/rules/visits/:id called with:', req.params.id);
  visitRules = visitRules.filter(rule => rule._id !== req.params.id);
  res.json({ success: true });
});

// Parole Rules Routes
app.get('/api/admin/rules/parole', authenticateToken, (req, res) => {
  res.json({ success: true, rules: paroleRules });
});

app.post('/api/admin/rules/parole', authenticateToken, (req, res) => {
  const newRule = {
    _id: Date.now().toString(),
    ...req.body
  };
  paroleRules.push(newRule);
  res.json({ success: true, rule: newRule });
});

app.put('/api/admin/rules/parole/:id', authenticateToken, (req, res) => {
  const ruleIndex = paroleRules.findIndex(rule => rule._id === req.params.id);
  if (ruleIndex !== -1) {
    paroleRules[ruleIndex] = { ...paroleRules[ruleIndex], ...req.body };
    res.json({ success: true, rule: paroleRules[ruleIndex] });
  } else {
    res.status(404).json({ message: 'Rule not found' });
  }
});

app.delete('/api/admin/rules/parole/:id', authenticateToken, (req, res) => {
  paroleRules = paroleRules.filter(rule => rule._id !== req.params.id);
  res.json({ success: true });
});

// Prison Rules Routes
app.get('/api/admin/rules/prison', authenticateToken, (req, res) => {
  res.json({ success: true, rules: prisonRules });
});

app.post('/api/admin/rules/prison', authenticateToken, (req, res) => {
  const newRule = {
    _id: Date.now().toString(),
    ...req.body
  };
  prisonRules.push(newRule);
  res.json({ success: true, rule: newRule });
});

app.put('/api/admin/rules/prison/:id', authenticateToken, (req, res) => {
  const ruleIndex = prisonRules.findIndex(rule => rule._id === req.params.id);
  if (ruleIndex !== -1) {
    prisonRules[ruleIndex] = { ...prisonRules[ruleIndex], ...req.body };
    res.json({ success: true, rule: prisonRules[ruleIndex] });
  } else {
    res.status(404).json({ message: 'Rule not found' });
  }
});

app.delete('/api/admin/rules/prison/:id', authenticateToken, (req, res) => {
  prisonRules = prisonRules.filter(rule => rule._id !== req.params.id);
  res.json({ success: true });
});

// Users Routes
app.get('/api/admin/users', authenticateToken, (req, res) => {
  res.json({ success: true, users });
});

app.post('/api/admin/users', authenticateToken, (req, res) => {
  const newUser = {
    _id: Date.now().toString(),
    ...req.body,
    lastLogin: new Date().toISOString()
  };
  users.push(newUser);
  res.json({ success: true, user: newUser });
});

// Prisoners Routes
app.get('/api/admin/prisoners', authenticateToken, (req, res) => {
  res.json({ success: true, prisoners });
});

app.post('/api/admin/prisoners', authenticateToken, (req, res) => {
  console.log('POST /api/admin/prisoners called with:', JSON.stringify(req.body, null, 2));
  const newPrisoner = {
    _id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  prisoners.push(newPrisoner);
  console.log('Prisoner saved:', JSON.stringify(newPrisoner, null, 2));
  res.json({ success: true, prisoner: newPrisoner });
});

// Blocks Routes
app.get('/api/admin/blocks', authenticateToken, (req, res) => {
  res.json({ success: true, blocks });
});

app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET /health');
  console.log('- GET /api/admin/rules/visits');
  console.log('- POST /api/admin/rules/visits');
  console.log('- PUT /api/admin/rules/visits/:id');
  console.log('- DELETE /api/admin/rules/visits/:id');
  console.log('- GET /api/admin/rules/parole');
  console.log('- POST /api/admin/rules/parole');
  console.log('- GET /api/admin/rules/prison');
  console.log('- POST /api/admin/rules/prison');
  console.log('- GET /api/admin/users');
  console.log('- POST /api/admin/users');
  console.log('- GET /api/admin/prisoners');
  console.log('- POST /api/admin/prisoners');
  console.log('- GET /api/admin/blocks');
});
