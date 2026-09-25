import { redirect } from "next/navigation";

type ReceiptPageProps = {
    params: Promise<{ id: string }>;
};

export default async function ReceiptPage({ params }: ReceiptPageProps) {
    const { id } = await params;

    redirect(`/receipts?id=${id}`);
}
