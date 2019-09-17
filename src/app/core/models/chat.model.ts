import { Player } from './player.model';

export interface ChatMessage {
    sender: Player | 'system';
    message: string;
    timestamp: Date;
}
