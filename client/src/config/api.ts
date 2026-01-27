// API configuration for flexible deployment
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
// Remove trailing slash if present
const API_BASE_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

export default API_BASE_URL;

export const API_ENDPOINTS = {
  // Admin
  ADMIN_SIGNUP: `${API_BASE_URL}/admin/signup`,
  ADMIN_LOGIN: `${API_BASE_URL}/admin/login`,
  ADMIN_PROFILE: `${API_BASE_URL}/admin/profile`,
  ADMIN_PROFILE_UPDATE: `${API_BASE_URL}/admin/profile/update`,

  // Admin - Captain Management
  ADMIN_CAPTAINS_LIST: `${API_BASE_URL}/admin/captains`,
  ADMIN_CAPTAINS_CREATE: `${API_BASE_URL}/admin/captains`,
  ADMIN_CAPTAINS_UPDATE: (id: string) => `${API_BASE_URL}/admin/captains/${id}`,
  ADMIN_CAPTAINS_STATUS: (id: string) => `${API_BASE_URL}/admin/captains/${id}/status`,
  ADMIN_CAPTAINS_DELETE: (id: string) => `${API_BASE_URL}/admin/captains/${id}`,

  // Admin - Department Player Management
  ADMIN_DEPT_PLAYERS_LIST: `${API_BASE_URL}/admin/department-players`,
  ADMIN_DEPT_PLAYERS_CREATE: `${API_BASE_URL}/admin/department-players`,
  ADMIN_DEPT_PLAYERS_UPDATE: (id: string) => `${API_BASE_URL}/admin/department-players/${id}`,
  ADMIN_DEPT_PLAYERS_STATUS: (id: string) => `${API_BASE_URL}/admin/department-players/${id}/status`,
  ADMIN_DEPT_PLAYERS_DELETE: (id: string) => `${API_BASE_URL}/admin/department-players/${id}`,

  // Matches
  MATCHES_LIST: `${API_BASE_URL}/matches`,
  MATCHES_BY_ID: (id: string) => `${API_BASE_URL}/matches/${id}`,
  MATCHES_CREATE: `${API_BASE_URL}/matches`,
  MATCHES_UPDATE: (id: string) => `${API_BASE_URL}/matches/${id}`,
  MATCHES_UPDATE_SCORE: (id: string) => `${API_BASE_URL}/matches/${id}/score`,
  MATCHES_DELETE: (id: string) => `${API_BASE_URL}/matches/${id}`,

  // Players (legacy - keeping for compatibility)
  PLAYERS_LIST: `${API_BASE_URL}/players`,
  PLAYERS_BY_ID: (id: string) => `${API_BASE_URL}/players/${id}`,
  PLAYERS_CREATE: `${API_BASE_URL}/players`,
  PLAYERS_UPDATE: (id: string) => `${API_BASE_URL}/players/${id}`,
  PLAYERS_APPROVE: (id: string) => `${API_BASE_URL}/players/${id}/approve`,
  PLAYERS_DELETE: (id: string) => `${API_BASE_URL}/players/${id}`,

  // Announcements
  ANNOUNCEMENTS_LIST: `${API_BASE_URL}/announcements`,
  ANNOUNCEMENTS_BY_ID: (id: string) => `${API_BASE_URL}/announcements/${id}`,
  ANNOUNCEMENTS_CREATE: `${API_BASE_URL}/announcements`,
  ANNOUNCEMENTS_UPDATE: (id: string) => `${API_BASE_URL}/announcements/${id}`,
  ANNOUNCEMENTS_DELETE: (id: string) => `${API_BASE_URL}/announcements/${id}`,

  // Gallery
  GALLERY_LIST: `${API_BASE_URL}/gallery`,
  GALLERY_BY_ID: (id: string) => `${API_BASE_URL}/gallery/${id}`,
  GALLERY_CREATE: `${API_BASE_URL}/gallery`,
  GALLERY_UPDATE: (id: string) => `${API_BASE_URL}/gallery/${id}`,
  GALLERY_DELETE: (id: string) => `${API_BASE_URL}/gallery/${id}`,

  // Player Auth (legacy - keeping for compatibility)
  PLAYER_REGISTER: `${API_BASE_URL}/player-auth/register`,
  PLAYER_LOGIN: `${API_BASE_URL}/player-auth/login`,
  PLAYER_VERIFY: `${API_BASE_URL}/player-auth/verify`,
  PLAYER_PROFILE: `${API_BASE_URL}/player-auth/profile`,
  PLAYER_UPDATE_PROFILE: `${API_BASE_URL}/player-auth/profile`,

  // Captain Auth
  CAPTAIN_REGISTER: `${API_BASE_URL}/captain-auth/register`,
  CAPTAIN_LOGIN: `${API_BASE_URL}/captain-auth/login`,
  CAPTAIN_PROFILE: `${API_BASE_URL}/captain-auth/profile`,
  CAPTAIN_UPDATE_PROFILE: `${API_BASE_URL}/captain-auth/profile`,
  CAPTAIN_SPORTS_LIST: `${API_BASE_URL}/captain-auth/sports`,
  
  // Captain - Department Players Management
  CAPTAIN_PLAYERS_LIST: `${API_BASE_URL}/captain-auth/players`,
  CAPTAIN_PLAYERS_ADD: `${API_BASE_URL}/captain-auth/players`,
  CAPTAIN_PLAYERS_UPDATE: (id: string) => `${API_BASE_URL}/captain-auth/players/${id}`,
  CAPTAIN_PLAYERS_DELETE: (id: string) => `${API_BASE_URL}/captain-auth/players/${id}`,

  // Captain - Team Management
  CAPTAIN_TEAMS_LIST: `${API_BASE_URL}/captain-teams`,
  CAPTAIN_TEAMS_CREATE: `${API_BASE_URL}/captain-teams`,
  CAPTAIN_TEAMS_UPDATE: (id: string) => `${API_BASE_URL}/captain-teams/${id}`,
  CAPTAIN_TEAMS_DELETE: (id: string) => `${API_BASE_URL}/captain-teams/${id}`,
  CAPTAIN_TEAMS_BY_ID: (id: string) => `${API_BASE_URL}/captain-teams/${id}`,
  CAPTAIN_TEAMS_ADD_PLAYERS: (id: string) => `${API_BASE_URL}/captain-teams/${id}/players`,
  CAPTAIN_TEAMS_REMOVE_PLAYER: (teamId: string, playerId: string) => `${API_BASE_URL}/captain-teams/${teamId}/players/${playerId}`,
  CAPTAIN_TEAMS_AVAILABLE_PLAYERS: `${API_BASE_URL}/captain-teams/available-players`,

  // Admin - Team Management  
  ADMIN_TEAMS_LIST: `${API_BASE_URL}/teams`,
  ADMIN_TEAMS_BY_ID: (id: string) => `${API_BASE_URL}/teams/${id}`,
  ADMIN_TEAMS_UPDATE: (id: string) => `${API_BASE_URL}/teams/${id}`,
  ADMIN_TEAMS_DELETE: (id: string) => `${API_BASE_URL}/teams/${id}`,
  ADMIN_TEAMS_STATUS: (id: string) => `${API_BASE_URL}/teams/${id}/status`,
  ADMIN_TEAMS_BY_DEPARTMENT: (dept: string) => `${API_BASE_URL}/teams/department/${dept}`,
  ADMIN_TEAMS_BY_SPORT: (sport: string) => `${API_BASE_URL}/teams/sport/${sport}`,

  // Schedules
  SCHEDULES_LIST: `${API_BASE_URL}/schedules`,
  SCHEDULES_BY_ID: (id: string) => `${API_BASE_URL}/schedules/${id}`,
  SCHEDULES_CREATE: `${API_BASE_URL}/schedules`,
  SCHEDULES_UPDATE: (id: string) => `${API_BASE_URL}/schedules/${id}`,
  SCHEDULES_DELETE: (id: string) => `${API_BASE_URL}/schedules/${id}`,

  // Rules
  RULES_LIST: `${API_BASE_URL}/rules`,
  RULES_BY_ID: (id: string) => `${API_BASE_URL}/rules/${id}`,
  RULES_CREATE: `${API_BASE_URL}/rules`,
  RULES_UPDATE: (id: string) => `${API_BASE_URL}/rules/${id}`,
  RULES_DELETE: (id: string) => `${API_BASE_URL}/rules/${id}`,

  
};
