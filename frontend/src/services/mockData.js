export const statsData = [
  { label: 'Total Claims', value: '1,248', change: '+12%', trend: 'up' },
  { label: 'Fraud Detected', value: '156', change: '-5%', trend: 'down' },
  { label: 'Pending Review', value: '42', change: '+8%', trend: 'up' },
  { label: 'Est. Savings', value: '$4,820', change: '+15%', trend: 'up' },
];

export const fraudTrendData = [
  { name: 'Mon', legitimate: 40, fraud: 24 },
  { name: 'Tue', legitimate: 30, fraud: 13 },
  { name: 'Wed', legitimate: 20, fraud: 58 },
  { name: 'Thu', legitimate: 27, fraud: 39 },
  { name: 'Fri', legitimate: 18, fraud: 48 },
  { name: 'Sat', legitimate: 23, fraud: 38 },
  { name: 'Sun', legitimate: 34, fraud: 43 },
];

export const recentClaims = [
  {
    id: 'CLM-2024-001',
    user: 'Deepak Sharma',
    amount: '₹450',
    restaurant: 'Burger King',
    date: '2 mins ago',
    riskScore: 85,
    status: 'High Risk',
    decisionMode: 'Automated', // Automated Rejection based on low trust
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60',
    userStats: { totalClaims: 12, approved: 2, rejected: 10, nature: 'Serial Abuser' },
    fraudAnalysis: 'User has submitted 3 claims this week from different devices. Pattern matches known refund fraud groups.'
  },
  {
    id: 'CLM-2024-002',
    user: 'Anjali Gupta',
    amount: '₹1200',
    restaurant: 'Pizza Hut',
    date: '15 mins ago',
    riskScore: 12,
    status: 'Safe',
    decisionMode: 'Automated', // Auto-Approved
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=60',
    userStats: { totalClaims: 3, approved: 3, rejected: 0, nature: 'Loyal Customer' },
    fraudAnalysis: 'User behavior is consistent with long-term premium customers. No anomalies detected.'
  },
  {
    id: 'CLM-2024-003',
    user: 'Rahul Verma',
    amount: '₹850',
    restaurant: 'Biryani Blues',
    date: '1 hour ago',
    riskScore: 45,
    status: 'Review',
    decisionMode: 'Manual',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=500&q=60',
    userStats: { totalClaims: 5, approved: 4, rejected: 0, nature: 'Frequent Returner' },
    fraudAnalysis: 'Metadata match is inconclusive. User location varies significantly from order location.'
  }
];

export const blacklistUsers = [
  { id: 'USR-9901', name: 'Vikram Singh', riskScore: 98, totalFraud: 15, lastActive: '2 days ago', lastActiveDate: '2024-10-23', reason: 'Repeated Fake Images' },
  { id: 'USR-9902', name: 'Amit Kumar', riskScore: 92, totalFraud: 8, lastActive: '5 hours ago', lastActiveDate: '2024-10-25', reason: 'Multiple Accounts' },
  { id: 'USR-9903', name: 'Sneha Roy', riskScore: 89, totalFraud: 6, lastActive: '1 week ago', lastActiveDate: '2024-10-15', reason: 'Edited Metadata' },
  { id: 'USR-9904', name: 'Rajesh Koothrappali', riskScore: 85, totalFraud: 12, lastActive: '3 weeks ago', lastActiveDate: '2024-10-01', reason: 'Repeated Fake Images' },
  { id: 'USR-9905', name: 'Priya Sharma', riskScore: 78, totalFraud: 5, lastActive: '1 month ago', lastActiveDate: '2024-09-20', reason: 'Multiple Accounts' },
  { id: 'USR-9906', name: 'Arun Patel', riskScore: 95, totalFraud: 20, lastActive: 'Yesterday', lastActiveDate: '2024-10-24', reason: 'Bot Activity' },
];
