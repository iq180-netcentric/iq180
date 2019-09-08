export interface WebSocketEvent<T> {
  event: WebSocketIncomingEvent | WebSocketOutgoingEvent;
  data: T;
}

export enum WebSocketIncomingEvent {
  connected = 'connected'
}

export enum WebSocketOutgoingEvent {
  join = 'join'
}
