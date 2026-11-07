const API_BASE = '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('couplefit_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('couplefit_token', token);
  } else {
    localStorage.removeItem('couplefit_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; version: string; database: string }>('/health'),

  // Auth
  register: (body: any) => request<{ success: boolean; token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<{ success: boolean; token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  getMe: () => request<{ user: any; profile: any; couple: any; healthProfile: any; gamification: any }>('/auth/me'),
  bootstrapDemo: () => request<{ success: boolean; accounts: any }>('/auth/bootstrap', { method: 'POST' }),

  // Couple
  invitePartner: () => request<{ success: boolean; invitationToken: string; expiresAt: string }>('/couples/invite', { method: 'POST' }),
  joinCouple: (invitationToken: string) => request<{ success: boolean; message: string }>('/couples/join', { method: 'POST', body: JSON.stringify({ invitationToken }) }),
  switchPartner: () => request<{ success: boolean; token: string; user: any }>('/couples/switch-partner', { method: 'POST' }),

  // Health
  getHealthProfile: () => request<{ profile: any }>('/health/profile'),
  saveHealthProfile: (data: any) => request<{ success: boolean; profile: any; calculations: any }>('/health/profile', { method: 'POST', body: JSON.stringify(data) }),
  getWeights: () => request<{ entries: any[]; trend: any[] }>('/health/weights'),
  addWeight: (weightKg: number, notes?: string) => request<{ success: boolean; entry: any }>('/health/weights', { method: 'POST', body: JSON.stringify({ weightKg, notes }) }),
  deleteWeight: (id: string) => request<{ success: boolean }>('/health/weights/' + id, { method: 'DELETE' }),

  // Nutrition
  getFoods: (q?: string, category?: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    return request<{ foods: any[] }>(`/nutrition/foods?${params.toString()}`);
  },
  createCustomFood: (food: any) => request<{ success: boolean; food: any }>('/nutrition/foods', { method: 'POST', body: JSON.stringify(food) }),
  getDiary: (date: string) => request<{ date: string; entries: any[]; totals: any }>(`/nutrition/diary?date=${date}`),
  addMealEntry: (data: any) => request<{ success: boolean; entry: any }>('/nutrition/diary', { method: 'POST', body: JSON.stringify(data) }),
  deleteMealEntry: (id: string) => request<{ success: boolean }>(`/nutrition/diary/${id}`, { method: 'DELETE' }),
  getFavorites: () => request<{ favoriteFoods: any[] }>('/nutrition/favorites'),
  toggleFavorite: (foodId: string) => request<{ success: boolean; isFavorite: boolean }>('/nutrition/favorites/toggle', { method: 'POST', body: JSON.stringify({ foodId }) }),

  // Activity & Wellness
  getWater: (date: string) => request<{ date: string; totalMl: number; targetMl: number; entries: any[] }>(`/activity/water?date=${date}`),
  addWater: (amountMl: number, loggedDate?: string) => request<{ success: boolean; loggedMl: number; totalDayMl: number }>('/activity/water', { method: 'POST', body: JSON.stringify({ amountMl, loggedDate }) }),
  getActivityLogs: () => request<{ entries: any[] }>('/activity/logs'),
  addActivityLog: (data: any) => request<{ success: boolean; entry: any }>('/activity/logs', { method: 'POST', body: JSON.stringify(data) }),
  getHabits: (date: string) => request<{ habits: any[]; completedHabitIds: string[]; date: string }>(`/activity/habits?date=${date}`),
  addHabit: (data: any) => request<{ success: boolean; habit: any }>('/activity/habits', { method: 'POST', body: JSON.stringify(data) }),
  toggleHabit: (habitId: string, date: string) => request<{ success: boolean; completed: boolean }>('/activity/habits/toggle', { method: 'POST', body: JSON.stringify({ habitId, date }) }),
  getWellness: (date: string) => request<{ log: any }>(`/activity/wellness?date=${date}`),
  saveWellness: (data: any) => request<{ success: boolean; log: any }>('/activity/wellness', { method: 'POST', body: JSON.stringify(data) }),

  // Gamification
  getGamification: () => request<{ gamification: any; achievements: any[] }>('/gamification/overview'),
  getQuests: () => request<{ quests: any[] }>('/gamification/quests'),
  getChallenges: () => request<{ challenges: any[] }>('/gamification/challenges'),

  // Social & Couple
  getFeed: () => request<{ events: any[] }>('/social/feed'),
  reactToEvent: (eventId: string, reaction: string) => request<{ success: boolean; event: any }>('/social/react', { method: 'POST', body: JSON.stringify({ eventId, reaction }) }),
  getChat: () => request<{ messages: any[] }>('/social/chat'),
  sendChatMessage: (text: string) => request<{ success: boolean; message: any }>('/social/chat', { method: 'POST', body: JSON.stringify({ text }) }),
  getNotifications: () => request<{ notifications: any[] }>('/social/notifications'),
  markNotificationRead: (id: string) => request<{ success: boolean }>(`/social/notifications/${id}/read`, { method: 'POST' }),
};
