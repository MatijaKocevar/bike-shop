import { auth } from "@/lib/auth";
import { renderReceiptPdf } from "@/lib/pdf/receipt-pdf";
import { getReceiptById } from "@/queries/receipts";
import { getShopSettings } from "@/queries/settings";

export const runtime = "nodejs";

type ReceiptPdfRouteProps = {
    params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: ReceiptPdfRouteProps) {
    const session = await auth();
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { id } = await params;
    const receipt = await getReceiptById(id);
    if (!receipt) return new Response("Not found", { status: 404 });

    const settings = await getShopSettings();
    const buffer = await renderReceiptPdf(receipt, settings);

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="racun-${receipt.number}.pdf"`,
        },
    });
}
