import { createAction } from '../store/store.service';
import { Round } from '../models/round';
import { ActionType } from '../store/store.type';

export const enum ROUND_ACTION {
    NEW_QUESTION = 'NEW_QUESTION',
}

const newQuestionAction = createAction<ROUND_ACTION.NEW_QUESTION, Round>(
    ROUND_ACTION.NEW_QUESTION,
);

type NewQuestion = ActionType<typeof newQuestionAction>;

export type RoundAction = NewQuestion;
