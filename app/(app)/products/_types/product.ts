export type Product = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    active: boolean;
    categoryId: string | null;
};
