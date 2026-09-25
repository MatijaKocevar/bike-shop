import { redirect } from "next/navigation";

type TicketPageProps = {
    params: Promise<{ id: string }>;
};

export default async function TicketPage({ params }: TicketPageProps) {
    const { id } = await params;

    redirect(`/tickets?id=${id}`);
}
