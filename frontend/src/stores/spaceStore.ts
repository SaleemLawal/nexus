import { create } from 'zustand';
import type { Space, Board, Pin, Poll, Message, CalendarEvent, SpaceMember } from '@/types';
import { api } from '@/lib/api';

interface SpaceState {
  spaces: Space[];
  currentSpace: Space | null;
  members: SpaceMember[];
  boards: Board[];
  currentBoard: Board | null;
  pins: Pin[];
  polls: Poll[];
  messages: Message[];
  events: CalendarEvent[];
  loading: boolean;

  // Spaces
  fetchSpaces: () => Promise<void>;
  setCurrentSpace: (space: Space) => void;
  addSpace: (space: Space) => void;

  // Members
  fetchMembers: (spaceID: string) => Promise<void>;

  // Boards
  fetchBoards: (spaceID: string) => Promise<void>;
  setCurrentBoard: (board: Board | null) => void;
  addBoard: (board: Board) => void;
  removeBoard: (boardID: string) => void;

  // Pins
  fetchPins: (boardID: string) => Promise<void>;
  addPin: (pin: Pin) => void;
  removePin: (pinID: string) => void;
  setPins: (pins: Pin[]) => void;

  // Polls
  fetchPolls: (spaceID: string) => Promise<void>;
  addPoll: (poll: Poll) => void;
  updatePoll: (poll: Poll) => void;

  // Messages
  fetchMessages: (spaceID: string) => Promise<void>;
  addMessage: (message: Message) => void;

  // Events
  fetchEvents: (spaceID: string) => Promise<void>;
  addEvent: (event: CalendarEvent) => void;
  removeEvent: (eventID: string) => void;
}

export const useSpaceStore = create<SpaceState>()((set) => ({
  spaces: [],
  currentSpace: null,
  members: [],
  boards: [],
  currentBoard: null,
  pins: [],
  polls: [],
  messages: [],
  events: [],
  loading: false,

  fetchSpaces: async () => {
    set({ loading: true });
    try {
      const spaces = await api.spaces.list();
      set({ spaces: spaces || [] });
    } finally {
      set({ loading: false });
    }
  },

  setCurrentSpace: (space) => set({ currentSpace: space }),
  addSpace: (space) => set((s) => ({ spaces: [space, ...s.spaces] })),

  fetchMembers: async (spaceID) => {
    const members = await api.spaces.members(spaceID);
    set({ members: members || [] });
  },

  fetchBoards: async (spaceID) => {
    const boards = await api.boards.list(spaceID);
    set({ boards: boards || [] });
  },

  setCurrentBoard: (board) => set({ currentBoard: board }),

  addBoard: (board) =>
    set((s) => ({ boards: [...s.boards, board] })),

  removeBoard: (boardID) =>
    set((s) => ({ boards: s.boards.filter((b) => b.id !== boardID) })),

  fetchPins: async (boardID) => {
    const pins = await api.pins.list(boardID);
    set({ pins: pins || [] });
  },

  addPin: (pin) => set((s) => ({ pins: [...s.pins, pin] })),

  removePin: (pinID) =>
    set((s) => ({ pins: s.pins.filter((p) => p.id !== pinID) })),

  setPins: (pins) => set({ pins }),

  fetchPolls: async (spaceID) => {
    const polls = await api.polls.list(spaceID);
    set({ polls: polls || [] });
  },

  addPoll: (poll) => set((s) => ({ polls: [poll, ...s.polls] })),

  updatePoll: (poll) =>
    set((s) => ({
      polls: s.polls.map((p) => (p.id === poll.id ? poll : p)),
    })),

  fetchMessages: async (spaceID) => {
    const messages = await api.messages.list(spaceID);
    set({ messages: messages || [] });
  },

  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),

  fetchEvents: async (spaceID) => {
    const events = await api.events.list(spaceID);
    set({ events: events || [] });
  },

  addEvent: (event) => set((s) => ({ events: [...s.events, event] })),

  removeEvent: (eventID) =>
    set((s) => ({ events: s.events.filter((e) => e.id !== eventID) })),
}));
