export interface Round {
    question: number[];
    operators: string[];
    expectedAnswer: number;
    solution: (number | string)[];
    startTime: Date;
}
