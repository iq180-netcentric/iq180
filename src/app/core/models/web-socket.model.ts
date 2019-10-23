export interface WebSocketEvent<T> {
    event: WebSocketIncomingEvent | WebSocketOutgoingEvent;
    data?: T;
}

export enum WebSocketIncomingEvent {
    players = 'PLAYERS',
    playerInfo = 'PLAYER_INFO',
    chatMessage = 'CHAT_MESSAGE',
    startGame = 'START_GAME',
    startRound = 'START_ROUND',
    startTurn = 'START_TURN',
    currentPlayer = 'CURRENT_PLAYER',
    endTurn = 'END_TURN',
}

export enum WebSocketOutgoingEvent {
    join = 'JOIN',
    leave = 'LEAVE',
    edit = 'EDIT',
    ping = 'PING',
    chatMessage = 'CHAT_MESSAGE',
    ready = 'READY',
    notReady = 'NOT_READY',
    startGame = 'START',
}
