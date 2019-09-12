export const enum IN_EVENT {
    JOIN = 'JOIN',
    LEAVE = 'LEAVE',
    EDIT = 'EDIT',
    CHAT_MESSAGE = 'CHAT_MESSAGE',
    READY = 'READY',
    NOT_READY = 'NOT_READY',
}

export interface JoinEvent {
    name: string;
    avatar: string;
}

export type EditEvent = JoinEvent;

export type InChatMessageEvent = string;
