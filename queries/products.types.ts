export type ProductListItem = {
    id: string;
    name: string;
    price: number;
    currency: string;
    active: boolean;
    category: { name: string } | null;
    images: { key: string; alt: string | null }[];
};

export type ProductOption = {
    id: string;
    name: string;
    price: number;
};
