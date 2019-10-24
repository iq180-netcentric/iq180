import { Attempt } from '../models/game';

export const enum IN_EVENT {
    JOIN = 'JOIN',
    LEAVE = 'LEAVE',
    EDIT = 'EDIT',
    CHAT_MESSAGE = 'CHAT_MESSAGE',
    READY = 'READY',
    START = 'START',
    ATTEMPT = 'ATTEMPT',
    RESET = 'RESET',
    SKIP = 'SKIP',
    ADMIN_JOIN = 'ADMIN_JOIN',
    RESET_GAME = 'RESET_GAME',
    RESET_PLAYER = 'RESET_PLAYER',
}

export interface JoinEvent {
    name: string;
    avatar: string;
}

export type EditEvent = JoinEvent;

export type InChatMessageEvent = string;

export type ReadyEvent = boolean;

export type AttemptEvent = any[];

export type ResetEvent = string;

export type AdminJoinEvent = string;
