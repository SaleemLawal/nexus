import type {
  User,
  Space,
  SpaceMember,
  Board,
  Pin,
  Poll,
  Message,
  CalendarEvent,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nexus_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['X-User-Token'] = token;
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const api = {
  users: {
    create: (display_name: string, avatar_color: string) =>
      request<User>('/users', {
        method: 'POST',
        body: JSON.stringify({ display_name, avatar_color }),
      }),
    me: () => request<User>('/users/me'),
  },

  // ─── Spaces ─────────────────────────────────────────────────────────────────

  spaces: {
    list: () => request<Space[]>('/spaces'),
    get: (id: string) => request<Space>(`/spaces/${id}`),
    create: (data: { name: string; description?: string; emoji: string }) =>
      request<Space>('/spaces', { method: 'POST', body: JSON.stringify(data) }),
    getByInvite: (code: string) => request<Space>(`/invite/${code}`),
    join: (code: string) =>
      request<Space>(`/invite/${code}/join`, { method: 'POST' }),
    members: (spaceID: string) =>
      request<SpaceMember[]>(`/spaces/${spaceID}/members`),
  },

  // ─── Boards ──────────────────────────────────────────────────────────────────

  boards: {
    list: (spaceID: string) => request<Board[]>(`/spaces/${spaceID}/boards`),
    get: (boardID: string) => request<Board>(`/boards/${boardID}`),
    create: (
      spaceID: string,
      data: { title: string; description?: string; cover_color: string },
    ) =>
      request<Board>(`/spaces/${spaceID}/boards`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (boardID: string) =>
      request<{ ok: boolean }>(`/boards/${boardID}`, { method: 'DELETE' }),
  },

  // ─── Pins ────────────────────────────────────────────────────────────────────

  pins: {
    list: (boardID: string) => request<Pin[]>(`/boards/${boardID}/pins`),
    create: (
      boardID: string,
      data: {
        type: string;
        title?: string;
        content?: string;
        image_url?: string;
        link_url?: string;
        metadata?: Record<string, unknown>;
      },
    ) =>
      request<Pin>(`/boards/${boardID}/pins`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (pinID: string) =>
      request<{ ok: boolean }>(`/pins/${pinID}`, { method: 'DELETE' }),
    updatePositions: (
      boardID: string,
      positions: Array<{ id: string; position: number }>,
    ) =>
      request<{ ok: boolean }>(`/boards/${boardID}/pins/positions`, {
        method: 'PATCH',
        body: JSON.stringify({ positions }),
      }),
  },

  // ─── Polls ───────────────────────────────────────────────────────────────────

  polls: {
    list: (spaceID: string) => request<Poll[]>(`/spaces/${spaceID}/polls`),
    create: (
      spaceID: string,
      data: {
        question: string;
        is_multi_select: boolean;
        closes_at?: string;
        options: Array<{ label: string }>;
      },
    ) =>
      request<Poll>(`/spaces/${spaceID}/polls`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    vote: (pollID: string, optionID: string) =>
      request<Poll>(`/polls/${pollID}/options/${optionID}/vote`, {
        method: 'POST',
      }),
    unvote: (pollID: string, optionID: string) =>
      request<Poll>(`/polls/${pollID}/options/${optionID}/vote`, {
        method: 'DELETE',
      }),
  },

  // ─── Messages ────────────────────────────────────────────────────────────────

  messages: {
    list: (spaceID: string, limit = 50, offset = 0) =>
      request<Message[]>(
        `/spaces/${spaceID}/messages?limit=${limit}&offset=${offset}`,
      ),
    create: (
      spaceID: string,
      data: { content: string; message_type?: string; metadata?: Record<string, unknown> },
    ) =>
      request<Message>(`/spaces/${spaceID}/messages`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // ─── Events ──────────────────────────────────────────────────────────────────

  events: {
    list: (spaceID: string) =>
      request<CalendarEvent[]>(`/spaces/${spaceID}/events`),
    create: (
      spaceID: string,
      data: {
        title: string;
        description?: string;
        location?: string;
        starts_at: string;
        ends_at?: string;
        color: string;
      },
    ) =>
      request<CalendarEvent>(`/spaces/${spaceID}/events`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (eventID: string) =>
      request<{ ok: boolean }>(`/events/${eventID}`, { method: 'DELETE' }),
  },
};
