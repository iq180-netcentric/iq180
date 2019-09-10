import { PlayerInfo, ChatMessage } from '../models/player';

export const enum OUT_EVENT {
    CONNECTED = 'CONNECTED',
    PLAYER_INFO = 'PLAYER_INFO',
    CHAT_MESSAGE = 'CHAT_MESSAGE',
}

export type ConnectedEvent = PlayerInfo[];

export type NewPlayerInfoEvent = PlayerInfo;

export type ChatMessageEvent = ChatMessage;
