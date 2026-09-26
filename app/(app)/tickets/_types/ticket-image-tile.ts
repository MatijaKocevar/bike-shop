export type TicketImageTile = {
    id: string;
    imageKey: string;
    description: string;
    onRemove: () => void;
    onDescription: (value: string) => void;
};
