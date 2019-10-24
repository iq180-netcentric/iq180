import { ChatMessage } from '../models/chatMessage';
import { PlayerInfo } from '../models/player';
import { Round } from '../models/round';

export const enum OUT_EVENT {
    PLAYERS = 'PLAYERS',
    PLAYER_INFO = 'PLAYER_INFO',
    CHAT_MESSAGE = 'CHAT_MESSAGE',
    GAME_READY = 'GAME_READY',
    START_TURN = 'START_TURN',
    END_TURN = 'END_TURN',
    START_ROUND = 'START_ROUND',
    END_ROUND = 'END_ROUND',
    START_GAME = 'START_GAME',
    END_GAME = 'END_GAME',
    WINNER = 'WINNER',
    ATTEMPT = 'ATTEMPT',
}

export type PlayersEvent = PlayerInfo[];

export type NewPlayerInfoEvent = PlayerInfo;

export type OutChatMessageEvent = ChatMessage;

export type StartGameEvent = Array<{ id: string; score: number }>;

export type StartRoundEvent = StartGameEvent;

export type PlayerAttemptEvent = any[];

export interface StartTurnEvent extends Partial<Round> {
    question?: number[];
    operators?: string[];
    expectedAnswer?: number;
    currentPlayer: string;
}

export type EndTurnEvent = number

export type EndRoundEvent = string;

export type EndGameEvent = StartGameEvent;
