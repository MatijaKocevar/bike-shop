import { db } from "@/lib/db";
import { round2 } from "@/lib/money";

export async function getShopStats() {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [products, receipts, users, openTickets, monthReceipts] = await Promise.all([
        db.product.count({ where: { active: true } }),
        db.receipt.count(),
        db.user.count(),
        db.ticket.count({ where: { status: { not: "PREVZETO" } } }),
        db.receipt.findMany({
            where: { createdAt: { gte: monthStart }, status: { not: "CANCELLED" } },
            select: { total: true },
        }),
    ]);

    return {
        products,
        receipts,
        users,
        openTickets,
        monthCount: monthReceipts.length,
        monthTotal: round2(monthReceipts.reduce((sum, receipt) => sum + Number(receipt.total), 0)),
    };
}
