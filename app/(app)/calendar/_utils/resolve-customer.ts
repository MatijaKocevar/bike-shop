import { db } from "@/lib/db";

export async function resolveCustomer(formData: FormData) {
    const customerId = (formData.get("customerId") as string) || null;

    if (customerId) {
        return db.customer.findUnique({ where: { id: customerId } });
    }

    const name = (formData.get("newCustomerName") as string)?.trim();
    if (!name) return null;

    return db.customer.create({
        data: {
            name,
            phone: (formData.get("newCustomerPhone") as string)?.trim() || null,
        },
    });
}
