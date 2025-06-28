const jwt = require('jsonwebtoken');
const token = jwt.sign(
  {
    id: '68ba3690-3177-4aa7-a204-c8399802eb1a',
    username: 'daniele-d',
    role: 'admin',
    email: 'daniele.dragoni@gmail.com'
  },
  'anatema_secret_key', // deve essere uguale a JWT_SECRET del backend
  { expiresIn: '8h' }
);
console.log(token);
