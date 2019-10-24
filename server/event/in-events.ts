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
