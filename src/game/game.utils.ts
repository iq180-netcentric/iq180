export const addSeconds = (date: Date, seconds: number) =>
    new Date(date.getTime() + seconds * 1000);

export const currentTime = () => new Date();
