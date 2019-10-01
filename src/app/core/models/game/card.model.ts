export interface DraggableCard {
    display: string;
    disabled: boolean;
    type: CardType;
    value: number | string;
}

export type OperatorCard = DraggableCard & {
    value: string;
};

export type NumberCard = DraggableCard & {
    value: number;
};

export enum CardType {
    number,
    operator,
}
