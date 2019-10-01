import { PlayerInfo } from './player';
export interface ChatMessage {
    message: string;
    sender: PlayerInfo;
    timestamp: string;
}
