import { redirect } from "next/navigation";

type OrderPageProps = {
    params: Promise<{ id: string }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
    const { id } = await params;

    redirect(`/orders?id=${id}`);
}
