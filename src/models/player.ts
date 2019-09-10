import { SocketClient } from '../event/event.type';

export interface PlayerInfo {
    id: string;
    name: string;
    avatar: string;
    ready: boolean;
}

export interface Player {
    client: SocketClient;
    playerInfo: PlayerInfo;
}
