export interface WebSocketEvent<T> {
    event: WebSocketIncomingEvent | WebSocketOutgoingEvent;
    data?: T;
}

export enum WebSocketIncomingEvent {
    players = 'PLAYERS',
    playerInfo = 'PLAYER_INFO',
    chatMessage = 'CHAT_MESSAGE',
}

export enum WebSocketOutgoingEvent {
    join = 'JOIN',
    leave = 'LEAVE',
    edit = 'EDIT',
    ping = 'PING',
    chatMessage = 'CHAT_MESSAGE',
    ready = 'READY',
    notReady = 'NOT_READY',
}
