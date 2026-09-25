import path from "node:path";
import type { ReactElement } from "react";
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { discountAmount, formatCurrency } from "@/lib/money";
import type { ReceiptDetail } from "@/queries/receipts.types";
import type { ShopSettings } from "@/queries/settings.types";

const fontsDir = path.join(process.cwd(), "assets", "fonts");

Font.register({
    family: "Liberation Sans",
    fonts: [
        { src: path.join(fontsDir, "LiberationSans-Regular.ttf") },
        { src: path.join(fontsDir, "LiberationSans-Bold.ttf"), fontWeight: "bold" },
    ],
});

const styles = StyleSheet.create({
    page: {
        fontFamily: "Liberation Sans",
        fontSize: 10,
        color: "#111111",
        lineHeight: 1.4,
        padding: 40,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    shopName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 2,
    },
    muted: {
        color: "#666666",
    },
    right: {
        textAlign: "right",
    },
    title: {
        fontSize: 13,
        fontWeight: "bold",
        textAlign: "right",
    },
    metaRow: {
        flexDirection: "row",
        marginTop: 24,
    },
    metaBlock: {
        marginRight: 32,
    },
    label: {
        fontSize: 8,
        color: "#666666",
        textTransform: "uppercase",
        marginBottom: 2,
    },
    table: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#dddddd",
    },
    tableHeader: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#dddddd",
        paddingVertical: 4,
        color: "#666666",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#eeeeee",
        paddingVertical: 5,
    },
    colName: {
        flexGrow: 1,
        flexBasis: 0,
        paddingRight: 8,
    },
    colQty: {
        width: 28,
        textAlign: "right",
    },
    colPrice: {
        width: 62,
        textAlign: "right",
    },
    colDiscount: {
        width: 62,
        textAlign: "right",
    },
    colTotal: {
        width: 66,
        textAlign: "right",
    },
    discountText: {
        color: "#b91c1c",
    },
    totals: {
        marginTop: 14,
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    totalsBox: {
        width: 220,
    },
    totalsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 2,
    },
    totalsFinal: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "#dddddd",
        paddingVertical: 4,
        fontWeight: "bold",
    },
    note: {
        marginTop: 28,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#eeeeee",
        color: "#666666",
    },
    footer: {
        position: "absolute",
        bottom: 40,
        left: 40,
        right: 40,
        fontSize: 8,
        color: "#888888",
        textAlign: "center",
    },
});

type ReceiptDocumentProps = {
    receipt: ReceiptDetail;
    settings: ShopSettings;
};

export function ReceiptDocument({
    receipt,
    settings,
}: ReceiptDocumentProps): ReactElement<DocumentProps> {
    const eur = (value: number) => formatCurrency(value, receipt.currency, "sl-SI");
    const date = receipt.createdAt.toLocaleDateString("sl-SI");
    const contact = [settings.address, settings.phone, settings.email].filter(Boolean).join(" · ");
    const footer = [
        settings.receiptFooter,
        settings.taxId ? `ID za DDV: ${settings.taxId}` : "",
        settings.iban ? `IBAN: ${settings.iban}` : "",
    ]
        .filter(Boolean)
        .join("  ·  ");

    return (
        <Document title={`Račun ${receipt.number}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.shopName}>{settings.shopName}</Text>
                        {contact ? <Text style={styles.muted}>{contact}</Text> : null}
                    </View>

                    <View>
                        <Text style={styles.title}>RAČUN št. {receipt.number}</Text>
                        <Text style={[styles.muted, styles.right]}>{date}</Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <View style={styles.metaBlock}>
                        <Text style={styles.label}>Stranka</Text>
                        <Text>{receipt.customerName ?? "Naključna stranka"}</Text>
                    </View>

                    {receipt.bikeName ? (
                        <View style={styles.metaBlock}>
                            <Text style={styles.label}>Kolo</Text>
                            <Text>{receipt.bikeName}</Text>
                        </View>
                    ) : null}
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colName}>Storitev</Text>
                        <Text style={styles.colQty}>Kol.</Text>
                        <Text style={styles.colPrice}>Cena</Text>
                        <Text style={styles.colDiscount}>Popust</Text>
                        <Text style={styles.colTotal}>Skupaj</Text>
                    </View>

                    {receipt.items.map((item) => {
                        const gross = item.quantity * item.unitPrice;
                        const discount = discountAmount(
                            gross,
                            item.discountType,
                            item.discountValue,
                        );

                        return (
                            <View key={item.id} style={styles.tableRow}>
                                <Text style={styles.colName}>{item.name}</Text>
                                <Text style={styles.colQty}>{item.quantity}</Text>
                                <Text style={styles.colPrice}>{eur(item.unitPrice)}</Text>
                                <Text
                                    style={
                                        discount > 0
                                            ? [styles.colDiscount, styles.discountText]
                                            : styles.colDiscount
                                    }
                                >
                                    {discount > 0 ? `−${eur(discount)}` : "—"}
                                </Text>
                                <Text style={styles.colTotal}>{eur(gross - discount)}</Text>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.totals}>
                    <View style={styles.totalsBox}>
                        <View style={styles.totalsRow}>
                            <Text style={styles.muted}>Vmesni seštevek</Text>
                            <Text>{eur(receipt.subtotal)}</Text>
                        </View>

                        {receipt.discountTotal > 0 ? (
                            <View style={[styles.totalsRow, styles.discountText]}>
                                <Text>Popust</Text>
                                <Text>−{eur(receipt.discountTotal)}</Text>
                            </View>
                        ) : null}

                        <View style={styles.totalsFinal}>
                            <Text>Za plačilo</Text>
                            <Text>{eur(receipt.total)}</Text>
                        </View>
                    </View>
                </View>

                {receipt.note ? <Text style={styles.note}>{receipt.note}</Text> : null}
                {footer ? <Text style={styles.footer}>{footer}</Text> : null}
            </Page>
        </Document>
    );
}
