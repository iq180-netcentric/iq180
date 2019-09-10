export interface WebSocketEvent<T> {
    event: WebSocketIncomingEvent | WebSocketOutgoingEvent;
    data: T;
}

export enum WebSocketIncomingEvent {
    connected = 'CONNECTED',
    playerInfo = 'PLAYER_INFO',
}

export enum WebSocketOutgoingEvent {
    join = 'JOIN',
    leave = 'LEAVE',
    edit = 'EDIT',
}
