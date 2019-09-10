export const enum IN_EVENT {
    JOIN = 'JOIN',
    LEAVE = 'LEAVE',
    EDIT = 'EDIT',
}

export interface JoinEvent {
    name: string;
    avatar: string;
}

export type EditEvent = JoinEvent;
