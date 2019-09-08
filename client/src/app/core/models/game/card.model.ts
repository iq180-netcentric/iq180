export interface DraggableCard {
  display: string;
  disabled: boolean;
  type: CardType;
}

export type OperatorCard = DraggableCard & {
  operator: string;
};

export type NumberCard = DraggableCard & {
  value: number;
};

export enum CardType {
  number,
  operator
}
