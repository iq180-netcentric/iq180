export const isNumber = (n: any) => !isNaN(Number(n));

export const isOperator = (operators: string[], n) => operators.includes(n);
