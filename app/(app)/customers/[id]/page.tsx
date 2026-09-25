import { redirect } from "next/navigation";

type CustomerPageProps = {
    params: Promise<{ id: string }>;
};

export default async function CustomerPage({ params }: CustomerPageProps) {
    const { id } = await params;

    redirect(`/customers?id=${id}`);
}
