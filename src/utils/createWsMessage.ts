export const createWsMessage = <T = any>(event: string, data: T) =>
    JSON.stringify({
        event,
        data,
    });
