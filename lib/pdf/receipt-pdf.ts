import { createElement } from "react";
import type { ReactElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { ReceiptDocument } from "@/lib/pdf/receipt-document";
import type { ReceiptDetail } from "@/queries/receipts.types";
import type { ShopSettings } from "@/queries/settings.types";

export async function renderReceiptPdf(
    receipt: ReceiptDetail,
    settings: ShopSettings,
): Promise<Buffer> {
    const document = createElement(ReceiptDocument, {
        receipt,
        settings,
    }) as ReactElement<DocumentProps>;

    return renderToBuffer(document);
}
