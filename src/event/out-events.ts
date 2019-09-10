import { PlayerInfo } from '../models/player';

export const enum OUT_EVENT {
    CONNECTED = 'CONNECTED',
    PLAYER_INFO = 'PLAYER_INFO',
}

export type ConnectedEvent = PlayerInfo[];

export type NewPlayerInfoEvent = PlayerInfo;
