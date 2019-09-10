export const enum IN_EVENT {
    JOIN = 'JOIN',
    LEAVE = 'LEAVE',
    EDIT = 'EDIT',
}

export interface JoinEvent {
    name: string;
    avatar: string;
}

export interface EditEvent extends JoinEvent {}

export const enum OUT_EVENT {
    CONNECTED = 'CONNECTED',
    PLAYER_INFO = 'PLAYER_INFO',
}
