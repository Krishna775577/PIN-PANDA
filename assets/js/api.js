// ========================================
// MOCK API LAYER - Simulates backend calls
// ========================================

const API = {
  // Simulate network delay
  delay: (ms = 300) => new Promise(r => setTimeout(r, ms)),

  // Current user (from mock data)
  currentUser: null,
  data: null,

  // Initialize with mock data
  async init() {
    await this.delay(100);
    // Try multiple paths to handle different server configurations
    const paths = [
      './data/mock.json',
      '/data/mock.json',
      'data/mock.json'
    ];

    for (const path of paths) {
      try {
        const res = await fetch(path);
        if (res.ok) {
          this.data = await res.json();
          return this.data;
        }
      } catch (e) {
        continue;
      }
    }
    // If all fetches fail (e.g., file:// protocol), use embedded mock data
    this.data = this.getEmbeddedMockData();
    return this.data;
  },

  // Embedded mock data for file:// protocol
  getEmbeddedMockData() {
    return {
      "users": [
        {
          "id": "u1",
          "name": "Sarah Chen",
          "email": "sarah@example.com",
          "password": "demo123",
          "username": "sarahchen",
          "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
          "bio": "Interior designer • Plant mom • Coffee addict ☕",
          "followers": 12400,
          "following": ["u2", "u3"],
          "pins": 856,
          "boards": 24,
          "createdAt": "2023-01-15T10:00:00Z",
          "settings": { "emailNotifications": true, "pushNotifications": true, "privateProfile": false }
        },
        {
          "id": "u2",
          "name": "Marcus Johnson",
          "email": "marcus@example.com",
          "password": "demo123",
          "username": "marcusj",
          "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
          "bio": "Photographer • Traveler • Minimalist",
          "followers": 8900,
          "following": ["u1"],
          "pins": 432,
          "boards": 18,
          "createdAt": "2023-03-22T14:30:00Z",
          "settings": { "emailNotifications": true, "pushNotifications": false, "privateProfile": false }
        },
        {
          "id": "u3",
          "name": "Emma Wilson",
          "email": "emma@example.com",
          "password": "demo123",
          "username": "emmaw",
          "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
          "bio": "DIY enthusiast • Home decor • Budget friendly",
          "followers": 5600,
          "following": ["u1", "u2"],
          "pins": 1200,
          "boards": 31,
          "createdAt": "2022-11-08T09:15:00Z",
          "settings": { "emailNotifications": false, "pushNotifications": true, "privateProfile": false }
        },
        {
          "id": "u4",
          "name": "Demo User",
          "email": "demo@pinterest.com",
          "password": "demo123",
          "username": "demouser",
          "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
          "bio": "Welcome to Pin Panda Clone! Start pinning ✨",
          "followers": 0,
          "following": [],
          "pins": 0,
          "boards": 0,
          "createdAt": "2024-01-01T00:00:00Z",
          "settings": { "emailNotifications": true, "pushNotifications": true, "privateProfile": false }
        }
      ],
      "pins": [
        {
          "id": "p1",
          "title": "Modern Living Room Ideas",
          "description": "Clean lines, neutral palette, and natural textures create a serene living space.",
          "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=600&fit=crop",
          "gradient": "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)",
          "userId": "u1",
          "boardId": "b1",
          "saves": 12400,
          "comments": 89,
          "tags": ["livingroom", "modern", "interior"],
          "createdAt": "2024-01-15T10:30:00Z"
        },
        {
          "id": "p2",
          "title": "Cozy Bedroom Aesthetic",
          "description": "Layer textures with throws, pillows, and warm lighting for the ultimate retreat.",
          "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=550&fit=crop",
          "gradient": "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)",
          "userId": "u1",
          "boardId": "b1",
          "saves": 8900,
          "comments": 67,
          "tags": ["bedroom", "cozy", "aesthetic"],
          "createdAt": "2024-01-14T15:45:00Z"
        },
        {
          "id": "p3",
          "title": "Minimalist Kitchen Design",
          "description": "Handleless cabinets, integrated appliances, and a monochrome palette.",
          "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop",
          "gradient": "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
          "userId": "u2",
          "boardId": "b3",
          "saves": 15600,
          "comments": 123,
          "tags": ["kitchen", "minimalist", "design"],
          "createdAt": "2024-01-13T09:20:00Z"
        },
        {
          "id": "p4",
          "title": "Boho Bathroom Inspiration",
          "description": "Natural materials, plants, and warm tones create a spa-like atmosphere.",
          "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=580&fit=crop",
          "gradient": "linear-gradient(135deg, #dcfce7 0%, #86efac 50%, #4ade80 100%)",
          "userId": "u3",
          "boardId": "b5",
          "saves": 6700,
          "comments": 45,
          "tags": ["bathroom", "boho", "spa"],
          "createdAt": "2024-01-12T18:10:00Z"
        },
        {
          "id": "p5",
          "title": "Home Office Setup Ideas",
          "description": "Ergonomic furniture, good lighting, and organized storage for productivity.",
          "image": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=520&fit=crop",
          "gradient": "linear-gradient(135deg, #fef9c3 0%, #fef08a 50%, #fde047 100%)",
          "userId": "u1",
          "boardId": "b2",
          "saves": 9800,
          "comments": 78,
          "tags": ["office", "productivity", "ergonomic"],
          "createdAt": "2024-01-11T11:00:00Z"
        },
        {
          "id": "p6",
          "title": "Small Space Storage Hacks",
          "description": "Maximize every inch with vertical storage, multi-functional furniture, and clever organizers.",
          "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=620&fit=crop",
          "gradient": "linear-gradient(135deg, #ffe4e6 0%, #fecdd3 50%, #fda4af 100%)",
          "userId": "u3",
          "boardId": "b6",
          "saves": 11200,
          "comments": 156,
          "tags": ["storage", "smallspace", "organization"],
          "createdAt": "2024-01-10T14:30:00Z"
        },
        {
          "id": "p7",
          "title": "Indoor Plant Styling Tips",
          "description": "Group plants by height, vary textures, and choose the right pots for your space.",
          "image": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=550&fit=crop",
          "gradient": "linear-gradient(135deg, #dcfce7 0%, #86efac 50%, #4ade80 100%)",
          "userId": "u2",
          "boardId": "b4",
          "saves": 7300,
          "comments": 54,
          "tags": ["plants", "indoor", "styling"],
          "createdAt": "2024-01-09T16:45:00Z"
        },
        {
          "id": "p8",
          "title": "Scandinavian Decor Guide",
          "description": "Hygge essentials: warm woods, soft textiles, and functional beauty.",
          "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=500&fit=crop",
          "gradient": "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 50%, #d8b4fe 100%)",
          "userId": "u1",
          "boardId": "b1",
          "saves": 5400,
          "comments": 32,
          "tags": ["scandinavian", "decor", "hygge"],
          "createdAt": "2024-01-08T10:00:00Z"
        },
        {
          "id": "p9",
          "title": "Vintage Furniture Finds",
          "description": "Mid-century modern pieces that add character to any room.",
          "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=580&fit=crop",
          "gradient": "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)",
          "userId": "u3",
          "boardId": "b7",
          "saves": 4200,
          "comments": 28,
          "tags": ["vintage", "furniture", "midcentury"],
          "createdAt": "2024-01-07T13:20:00Z"
        },
        {
          "id": "p10",
          "title": "DIY Wall Art Projects",
          "description": "Budget-friendly art ideas using canvas, fabric, and found objects.",
          "image": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=520&fit=crop",
          "gradient": "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)",
          "userId": "u2",
          "boardId": "b8",
          "saves": 3800,
          "comments": 41,
          "tags": ["diy", "art", "wallart"],
          "createdAt": "2024-01-06T09:15:00Z"
        }
      ],
      "boards": [
        {
          "id": "b1",
          "title": "Living Room Inspiration",
          "description": "Sofas, layouts, and cozy corners",
          "userId": "u1",
          "pins": 45,
          "secret": false,
          "createdAt": "2023-02-01T10:00:00Z",
          "cover": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop"
        },
        {
          "id": "b2",
          "title": "Home Office Ideas",
          "description": "Productive and beautiful workspaces",
          "userId": "u1",
          "pins": 28,
          "secret": false,
          "createdAt": "2023-03-15T14:00:00Z",
          "cover": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop"
        },
        {
          "id": "b3",
          "title": "Kitchen & Dining",
          "description": "Design, organization, and entertaining",
          "userId": "u2",
          "pins": 36,
          "secret": false,
          "createdAt": "2023-04-10T09:00:00Z",
          "cover": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop"
        },
        {
          "id": "b4",
          "title": "Plants & Greenery",
          "description": "Indoor jungle goals",
          "userId": "u2",
          "pins": 22,
          "secret": false,
          "createdAt": "2023-05-01T11:00:00Z",
          "cover": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop"
        },
        {
          "id": "b5",
          "title": "Bathroom Dreams",
          "description": "Spa-like retreats at home",
          "userId": "u3",
          "pins": 31,
          "secret": false,
          "createdAt": "2023-06-20T16:00:00Z",
          "cover": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop"
        },
        {
          "id": "b6",
          "title": "Small Space Solutions",
          "description": "Tiny homes, big ideas",
          "userId": "u3",
          "pins": 40,
          "secret": true,
          "createdAt": "2023-07-10T10:00:00Z",
          "cover": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop"
        },
        {
          "id": "b7",
          "title": "Vintage Finds",
          "description": "Mid-century and antique treasures",
          "userId": "u3",
          "pins": 18,
          "secret": false,
          "createdAt": "2023-08-05T14:00:00Z",
          "cover": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop"
        },
        {
          "id": "b8",
          "title": "DIY Projects",
          "description": "Creative weekend projects",
          "userId": "u2",
          "pins": 25,
          "secret": false,
          "createdAt": "2023-09-12T09:00:00Z",
          "cover": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop"
        }
      ],
      "notifications": [
        {
          "id": "n1",
          "userId": "u4",
          "type": "follow",
          "actorId": "u1",
          "actor": { "id": "u1", "name": "Sarah Chen", "username": "sarahchen", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
          "message": "<strong>Sarah Chen</strong> started following you",
          "read": false,
          "createdAt": "2024-01-15T12:00:00Z"
        },
        {
          "id": "n2",
          "userId": "u4",
          "type": "save",
          "actorId": "u2",
          "actor": { "id": "u2", "name": "Marcus Johnson", "username": "marcusj", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" },
          "pinId": "p3",
          "message": "<strong>Marcus Johnson</strong> saved your pin <strong>Minimalist Kitchen Design</strong>",
          "read": false,
          "createdAt": "2024-01-14T18:30:00Z"
        },
        {
          "id": "n3",
          "userId": "u4",
          "type": "comment",
          "actorId": "u3",
          "actor": { "id": "u3", "name": "Emma Wilson", "username": "emmaw", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
          "pinId": "p1",
          "message": "<strong>Emma Wilson</strong> commented on your pin <strong>Modern Living Room Ideas</strong>: \"Love this aesthetic!\"",
          "read": true,
          "createdAt": "2024-01-13T10:15:00Z"
        },
        {
          "id": "n4",
          "userId": "u4",
          "type": "follow",
          "actorId": "u3",
          "actor": { "id": "u3", "name": "Emma Wilson", "username": "emmaw", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
          "message": "<strong>Emma Wilson</strong> started following you",
          "read": true,
          "createdAt": "2024-01-12T14:00:00Z"
        }
      ]
    };
  },

  // Auth
  async login(email, password) {
    await this.delay(800);
    const user = this.data.users.find(u => u.email === email);
    if (!user) throw new Error('Invalid email or password');
    this.currentUser = { ...user, password: undefined };
    return this.currentUser;
  },

  async signup(name, email, password) {
    await this.delay(800);
    if (this.data.users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }
    const user = {
      id: 'u' + Date.now(),
      name,
      email,
      username: name.toLowerCase().replace(/\s+/g, ''),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      bio: '',
      followers: 0,
      following: [],
      pins: 0,
      boards: 0,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(user);
    this.currentUser = user;
    return user;
  },

  logout() {
    this.currentUser = null;
  },

  getCurrentUser() {
    return this.currentUser;
  },

  // Pins
  async getPins(limit = 20, offset = 0, boardId = null) {
    await this.delay(200);
    let pins = [...this.data.pins].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (boardId) pins = pins.filter(p => p.boardId === boardId);
    return pins.slice(offset, offset + limit);
  },

  async getPin(id) {
    await this.delay(100);
    const pin = this.data.pins.find(p => p.id === id);
    if (!pin) throw new Error('Pin not found');
    // Enrich with board & user
    const board = this.data.boards.find(b => b.id === pin.boardId);
    const user = this.data.users.find(u => u.id === pin.userId);
    return { ...pin, board, user };
  },

  async createPin(pinData) {
    await this.delay(500);
    const pin = {
      id: 'p' + Date.now(),
      ...pinData,
      userId: this.currentUser.id,
      saves: 0,
      comments: 0,
      createdAt: new Date().toISOString()
    };
    this.data.pins.unshift(pin);
    return pin;
  },

  async savePin(pinId) {
    await this.delay(100);
    const pin = this.data.pins.find(p => p.id === pinId);
    if (pin) pin.saves++;
    return pin;
  },

  async unsavePin(pinId) {
    await this.delay(100);
    const pin = this.data.pins.find(p => p.id === pinId);
    if (pin) pin.saves = Math.max(0, pin.saves - 1);
    return pin;
  },

  // Boards
  async getBoards(userId = null) {
    await this.delay(150);
    const uid = userId || this.currentUser?.id;
    return this.data.boards.filter(b => b.userId === uid);
  },

  async getBoard(id) {
    await this.delay(100);
    const board = this.data.boards.find(b => b.id === id);
    if (!board) throw new Error('Board not found');
    const pins = this.data.pins.filter(p => p.boardId === id);
    const user = this.data.users.find(u => u.id === board.userId);
    return { ...board, pins, user };
  },

  async createBoard(boardData) {
    await this.delay(300);
    const board = {
      id: 'b' + Date.now(),
      ...boardData,
      userId: this.currentUser.id,
      pins: 0,
      createdAt: new Date().toISOString()
    };
    this.data.boards.push(board);
    return board;
  },

  // Users
  async getUser(username) {
    await this.delay(150);
    const user = this.data.users.find(u => u.username === username);
    if (!user) throw new Error('User not found');
    const { password, ...safe } = user;
    return safe;
  },

  async getCurrentUserProfile() {
    await this.delay(100);
    if (!this.currentUser) throw new Error('Not authenticated');
    const { password, ...safe } = this.currentUser;
    return safe;
  },

  async followUser(userId) {
    await this.delay(200);
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      if (!user.following) user.following = [];
      if (!user.following.includes(this.currentUser.id)) {
        user.followers++;
      }
    }
    if (this.currentUser) {
      if (!this.currentUser.following) this.currentUser.following = [];
      if (!this.currentUser.following.includes(userId)) {
        this.currentUser.following.push(userId);
        this.currentUser.following = [...new Set(this.currentUser.following)];
      }
    }
    return true;
  },

  async unfollowUser(userId) {
    await this.delay(200);
    const user = this.data.users.find(u => u.id === userId);
    if (user) user.followers = Math.max(0, user.followers - 1);
    if (this.currentUser) {
      this.currentUser.following = (this.currentUser.following || []).filter(id => id !== userId);
      this.currentUser.following = Math.max(0, this.currentUser.following - 1);
    }
    return true;
  },

  // Search
  async searchPins(query, limit = 20) {
    await this.delay(300);
    const q = query.toLowerCase();
    return this.data.pins
      .filter(p => p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q)))
      .slice(0, limit);
  },

  async searchUsers(query, limit = 10) {
    await this.delay(200);
    const q = query.toLowerCase();
    return this.data.users
      .filter(u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
      .slice(0, limit)
      .map(({ password, ...u }) => u);
  },

  async searchBoards(query, limit = 10) {
    await this.delay(200);
    const q = query.toLowerCase();
    return this.data.boards
      .filter(b => b.title.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q))
      .slice(0, limit);
  },

  // Notifications
  async getNotifications() {
    await this.delay(200);
    return this.data.notifications
      .filter(n => n.userId === this.currentUser?.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async markNotificationRead(id) {
    await this.delay(50);
    const n = this.data.notifications.find(x => x.id === id);
    if (n) n.read = true;
  },

  // Settings
  async updateProfile(data) {
    await this.delay(300);
    Object.assign(this.currentUser, data);
    const idx = this.data.users.findIndex(u => u.id === this.currentUser.id);
    if (idx >= 0) Object.assign(this.data.users[idx], data);
    const { password, ...safe } = this.currentUser;
    return safe;
  },

  async updateSettings(data) {
    await this.delay(200);
    this.currentUser.settings = { ...this.currentUser.settings, ...data };
    return this.currentUser.settings;
  }
};

// Export for modules
window.API = API;