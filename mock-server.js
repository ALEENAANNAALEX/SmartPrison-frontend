import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 5000;

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
    isActive: true,
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    _id: '2',
    title: 'Weekend Visiting Hours',
    description: 'Special visiting hours for weekends with extended time slots for family members.',
    category: 'schedule',
    rules: ['Maximum 3 visitors per session', 'Children must be accompanied by adults', 'No loud conversations'],
    restrictions: ['No bags larger than 12 inches', 'No metal objects', 'No cash exchange'],
    eligibilityCriteria: ['Family members only', 'Background check completed', 'Advance booking required'],
    isActive: true,
    createdAt: new Date('2024-02-01').toISOString()
  },
  {
    _id: '3',
    title: 'Legal Counsel Visits',
    description: 'Guidelines for attorney-client meetings and legal consultations.',
    category: 'legal',
    rules: ['Private consultation rooms available', 'No time limit for legal meetings', 'Confidentiality maintained'],
    restrictions: ['Attorney must be licensed', 'No recording devices', 'Documents subject to security check'],
    eligibilityCriteria: ['Valid bar association membership', 'Client authorization required'],
    isActive: true,
    createdAt: new Date('2024-01-20').toISOString()
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

// Mock users for authentication
let authUsers = [
  {
    _id: '1',
    name: 'Admin User',
    email: 'admin@prison.gov',
    password: 'admin123', // In real app, this would be hashed
    role: 'admin'
  },
  {
    _id: '2',
    name: 'Staff User',
    email: 'staff@prison.gov',
    password: 'staff123',
    role: 'staff'
  }
];

// Auth middleware (mock) - very permissive for testing
const authenticateToken = (req, res, next) => {
  console.log('Auth check - Headers:', req.headers.authorization);
  // Always allow access for testing
  next();
};

// Authentication Routes
app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({ msg: 'Please provide email and password' });
  }

  console.log('Looking for user with email:', email);
  console.log('Available users:', authUsers.map(u => ({ email: u.email, password: u.password })));

  const user = authUsers.find(u => u.email === email && u.password === password);

  if (!user) {
    console.log('User not found or password mismatch');
    return res.status(400).json({ msg: 'Invalid credentials' });
  }

  // Mock JWT token
  const token = `mock-jwt-token-${user._id}-${Date.now()}`;

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please provide name, email, and password' });
  }

  const existingUser = authUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ msg: 'User already exists' });
  }

  const newUser = {
    _id: Date.now().toString(),
    name,
    email,
    password, // In real app, this would be hashed
    role: 'user'
  };

  authUsers.push(newUser);

  // Mock JWT token
  const token = `mock-jwt-token-${newUser._id}-${Date.now()}`;

  res.json({
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

app.get('/api/auth/check-email', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ msg: 'Email is required' });
  }

  const user = authUsers.find(u => u.email === email);
  res.json({
    exists: !!user,
    email: email
  });
});

// Visit Rules Routes
app.get('/api/admin/rules/visits', authenticateToken, (req, res) => {
  res.json({ success: true, rules: visitRules });
});

app.post('/api/admin/rules/visits', authenticateToken, (req, res) => {
  console.log('📝 POST /api/admin/rules/visits - Received data:', JSON.stringify(req.body, null, 2));

  const newRule = {
    _id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body
  };

  visitRules.push(newRule);
  console.log('✅ Visit rule added successfully. Total rules:', visitRules.length);
  console.log('📋 New rule:', JSON.stringify(newRule, null, 2));

  res.json({ success: true, rule: newRule });
});

app.put('/api/admin/rules/visits/:id', authenticateToken, (req, res) => {
  console.log('PUT request for visit rule ID:', req.params.id);
  console.log('Request body:', req.body);
  console.log('Current visit rules:', visitRules.map(r => ({ id: r._id, title: r.title })));

  // Try both string and number comparison
  const ruleIndex = visitRules.findIndex(rule =>
    rule._id === req.params.id ||
    rule._id === parseInt(req.params.id) ||
    rule._id.toString() === req.params.id
  );
  console.log('Found rule at index:', ruleIndex);

  if (ruleIndex !== -1) {
    visitRules[ruleIndex] = { ...visitRules[ruleIndex], ...req.body, _id: req.params.id };
    console.log('Updated rule:', visitRules[ruleIndex]);
    res.json({ success: true, rule: visitRules[ruleIndex] });
  } else {
    console.log('Rule not found with ID:', req.params.id);
    console.log('Available IDs:', visitRules.map(r => r._id));
    res.status(404).json({ message: 'Rule not found', availableIds: visitRules.map(r => r._id) });
  }
});

app.delete('/api/admin/rules/visits/:id', authenticateToken, (req, res) => {
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
  console.log('📝 POST /api/admin/rules/prison - Received data:', JSON.stringify(req.body, null, 2));

  const newRule = {
    _id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body
  };

  prisonRules.push(newRule);
  console.log('✅ Prison rule added successfully. Total rules:', prisonRules.length);
  console.log('📋 New rule:', JSON.stringify(newRule, null, 2));

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
  console.log('📝 POST /api/admin/prisoners - Received data:', JSON.stringify(req.body, null, 2));

  const newPrisoner = {
    _id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body
  };

  prisoners.push(newPrisoner);
  console.log('✅ Prisoner added successfully. Total prisoners:', prisoners.length);
  console.log('📋 New prisoner:', JSON.stringify(newPrisoner, null, 2));

  res.json({ success: true, prisoner: newPrisoner });
});

// Blocks Routes
app.get('/api/admin/blocks', authenticateToken, (req, res) => {
  res.json({ success: true, blocks });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock server is running' });
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
