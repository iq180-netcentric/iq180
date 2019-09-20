import { ChatMessage } from '../models/chatMessage';
import { SerialzedGamePlayers } from '../game/game.model';
import { PlayerInfo } from '../models/player';
import { Round } from '../models/round';

export const enum OUT_EVENT {
    PLAYERS = 'PLAYERS',
    PLAYER_INFO = 'PLAYER_INFO',
    CHAT_MESSAGE = 'CHAT_MESSAGE',
    START_ROUND = 'START_ROUND',
    END_ROUND = 'END_ROUND',
    START_GAME = 'START_GAME',
    END_GAME = 'END_GAME',
    WINNER = 'WINNER',
}

export type PlayersEvent = PlayerInfo[];

export type NewPlayerInfoEvent = PlayerInfo;

export type OutChatMessageEvent = ChatMessage;

export type StartGameEvent = SerialzedGamePlayers;

export type StartRoundEvent = Pick<
    Round,
    'question' | 'expectedAnswer' | 'startTime'
>;
