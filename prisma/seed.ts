import "dotenv/config";
import type { DiscountType, ReceiptStatus, TicketStatus } from "../generated/prisma/enums";
import { dateKey } from "../lib/dates";
import { db } from "../lib/db";
import { receiptTotals } from "../lib/money";
import { hashPassword } from "../lib/password";
import { slugify } from "../lib/utils";

async function main() {
    const demoData = process.env.SEED_DEMO_DATA !== "false";
    const adminPassword = process.env.AUTH_ADMIN_PASSWORD || "admin123";

    const admin = await db.user.upsert({
        where: { email: "admin@test.com" },
        update: { role: "ADMIN", passwordHash: await hashPassword(adminPassword) },
        create: {
            email: "admin@test.com",
            name: "Lastnik trgovine",
            role: "ADMIN",
            passwordHash: await hashPassword(adminPassword),
        },
    });

    if (demoData) {
        await db.user.upsert({
            where: { email: "staff@test.com" },
            update: { role: "STAFF" },
            create: {
                email: "staff@test.com",
                name: "Zaposleni test",
                role: "STAFF",
                passwordHash: await hashPassword(adminPassword),
            },
        });
    }

    const settingsData = [
        { key: "shopName", value: "Bicikl Kočevar" },
        { key: "receiptFooter", value: "Hvala za zaupanje!" },
    ];

    for (const setting of settingsData) {
        await db.setting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting,
        });
    }

    const categoryData = [
        { slug: "zavore", name: "Zavore" },
        { slug: "pogon", name: "Pogon" },
        { slug: "kolesa-in-pnevmatike", name: "Kolesa in pnevmatike" },
        { slug: "vzmetenje", name: "Vzmetenje" },
        { slug: "servisi", name: "Servisi" },
        { slug: "prilagoditev-in-sestavljanje", name: "Prilagoditev in sestavljanje" },
    ];
    const categoryIds = new Map<string, string>();

    for (const category of categoryData) {
        const row = await db.category.upsert({
            where: { slug: category.slug },
            update: { name: category.name },
            create: category,
        });

        categoryIds.set(category.slug, row.id);
    }

    const services: { name: string; category: string; price: number; description: string }[] = [
        {
            name: "Zamenjava zavornih ploščic",
            category: "zavore",
            price: 25,
            description: "Zamenjava obrabljenih zavornih ploščic in nastavitev čeljusti.",
        },
        {
            name: "Prezračevanje hidravličnih zavor",
            category: "zavore",
            price: 45,
            description: "Popolno prezračevanje ene hidravlične zavore z novim oljem.",
        },
        {
            name: "Zamenjava zavorne vrvice",
            category: "zavore",
            price: 20,
            description: "Nova notranja in zunanja vrvica z natančno nastavitvijo.",
        },
        {
            name: "Zamenjava zavornega diska",
            category: "zavore",
            price: 15,
            description: "Zamenjava in centriranje novega zavornega diska.",
        },
        {
            name: "Zamenjava verige",
            category: "pogon",
            price: 22,
            description: "Namestitev nove verige in preverjanje obrabe kasete.",
        },
        {
            name: "Zamenjava kasete",
            category: "pogon",
            price: 28,
            description: "Zamenjava kasete in ponovna nastavitev prestav.",
        },
        {
            name: "Nastavitev menjalnikov",
            category: "pogon",
            price: 18,
            description: "Poravnava in nastavitev sprednjega in zadnjega menjalnika.",
        },
        {
            name: "Globinsko čiščenje pogona",
            category: "pogon",
            price: 35,
            description: "Razmaščevanje, čiščenje in mazanje celotnega pogona.",
        },
        {
            name: "Centriranje kolesa",
            category: "kolesa-in-pnevmatike",
            price: 20,
            description: "Poravnava kolesa in izravnava napetosti naper.",
        },
        {
            name: "Zamenjava pnevmatike",
            category: "kolesa-in-pnevmatike",
            price: 15,
            description: "Montaža in namestitev nove pnevmatike na kolo.",
        },
        {
            name: "Zamenjava zračnice",
            category: "kolesa-in-pnevmatike",
            price: 12,
            description: "Zamenjava zračnice in pregled tujkov v pnevmatiki.",
        },
        {
            name: "Predelava na tubeless",
            category: "kolesa-in-pnevmatike",
            price: 30,
            description: "Predelava kolesa na tubeless sistem s tesnilno tekočino.",
        },
        {
            name: "Servis spodnjih nog vilice",
            category: "vzmetenje",
            price: 70,
            description: "Servis spodnjih nog z novim oljem in tesnili.",
        },
        {
            name: "Celovit servis vzmetenja",
            category: "vzmetenje",
            price: 140,
            description: "Celovit servis dušilca in zračne vzmeti.",
        },
        {
            name: "Osnovni servis",
            category: "servisi",
            price: 45,
            description: "Prestave, zavore, tlak v pnevmatikah in varnostni pregled.",
        },
        {
            name: "Celovit servis",
            category: "servisi",
            price: 90,
            description: "Popolno razstavljanje, čiščenje, sestavljanje in nastavitev.",
        },
        {
            name: "Diagnostika e-kolesa",
            category: "servisi",
            price: 40,
            description: "Diagnostika motorja, baterije in krmilnika.",
        },
        {
            name: "Sestavljanje kolesa",
            category: "prilagoditev-in-sestavljanje",
            price: 60,
            description: "Razpakiranje, sestavljanje in varnostni pregled novega kolesa.",
        },
        {
            name: "Ergonomska prilagoditev kolesa",
            category: "prilagoditev-in-sestavljanje",
            price: 80,
            description: "Prilagoditev položaja in stičnih točk na kolesu.",
        },
        {
            name: "Pletenje kolesa",
            category: "prilagoditev-in-sestavljanje",
            price: 120,
            description: "Izdelava in napenjanje kolesa iz pesta, obroča in naper.",
        },
    ];

    const products = new Map<string, { id: string; name: string; price: number }>();

    for (const service of services) {
        const slug = slugify(service.name);
        const row = await db.product.upsert({
            where: { slug },
            update: {
                name: service.name,
                description: service.description,
                price: service.price,
                categoryId: categoryIds.get(service.category),
            },
            create: {
                name: service.name,
                slug,
                description: service.description,
                price: service.price,
                categoryId: categoryIds.get(service.category),
            },
        });

        products.set(slug, { id: row.id, name: row.name, price: Number(row.price) });
    }

    const daysAgo = (days: number, hours = 0) =>
        new Date(Date.now() - days * 86400000 - hours * 3600000);

    const reference = (slug: string, quantity: number, unitPrice: number) => {
        const product = products.get(slug)!;

        return { productId: product.id, name: product.name, quantity, unitPrice };
    };

    if (!demoData) {
        console.log("Seed complete (catalog only).");
        return;
    }

    const customerRows = [
        {
            id: "seed-customer-1",
            name: "Marko Novak",
            phone: "041 234 567",
            email: "marko.novak@example.com",
        },
        {
            id: "seed-customer-2",
            name: "Ana Kos",
            phone: "051 345 678",
            email: "ana.kos@example.com",
        },
        {
            id: "seed-customer-3",
            name: "Luka Zupan",
            phone: "031 456 789",
            email: "luka.zupan@example.com",
        },
        {
            id: "seed-customer-4",
            name: "Maja Eržen",
            phone: "040 567 890",
            email: "maja.erzen@example.com",
        },
    ];

    for (const customer of customerRows) {
        await db.customer.upsert({ where: { id: customer.id }, update: {}, create: customer });
    }

    const bikeRows = [
        {
            id: "seed-bike-1",
            customerId: "seed-customer-1",
            name: "Trek Marlin 7",
            brand: "Trek",
            model: "Marlin 7",
            color: "Modra",
            serial: "WTU123456",
        },
        {
            id: "seed-bike-2",
            customerId: "seed-customer-2",
            name: "Specialized Sirrus 2.0",
            brand: "Specialized",
            model: "Sirrus 2.0",
            color: "Črna",
            serial: "SPX778899",
        },
        {
            id: "seed-bike-3",
            customerId: "seed-customer-3",
            name: "Giant Talon 2",
            brand: "Giant",
            model: "Talon 2",
            color: "Rdeča",
            serial: "GNT334455",
        },
        {
            id: "seed-bike-4",
            customerId: "seed-customer-4",
            name: "Cube Access WS",
            brand: "Cube",
            model: "Access WS",
            color: "Bela",
            serial: "CUB990011",
        },
    ];

    for (const bike of bikeRows) {
        await db.bike.upsert({ where: { id: bike.id }, update: {}, create: bike });
    }

    type SeedTicket = {
        id: string;
        customerId: string;
        bikeId: string;
        status: TicketStatus;
        intakeNote: string;
        createdAt: Date;
        completedAt: Date | null;
        items: {
            productId: string;
            name: string;
            quantity: number;
            unitPrice: number;
            done: boolean;
        }[];
    };

    const ticketRows: SeedTicket[] = [
        {
            id: "seed-ticket-1",
            customerId: "seed-customer-1",
            bikeId: "seed-bike-1",
            status: "PREVZETO",
            intakeNote: "Redni servis pred sezono.",
            createdAt: daysAgo(13),
            completedAt: daysAgo(12),
            items: [
                { ...reference("osnovni-servis", 1, 45), done: true },
                { ...reference("zamenjava-verige", 1, 22), done: true },
            ],
        },
        {
            id: "seed-ticket-2",
            customerId: "seed-customer-2",
            bikeId: "seed-bike-2",
            status: "PREVZETO",
            intakeNote: "Zavore so mehke, prestave malo preskakujejo.",
            createdAt: daysAgo(7),
            completedAt: daysAgo(6),
            items: [
                { ...reference("prezracevanje-hidravlicnih-zavor", 2, 45), done: true },
                { ...reference("zamenjava-zavornih-ploscic", 1, 25), done: true },
            ],
        },
        {
            id: "seed-ticket-3",
            customerId: "seed-customer-3",
            bikeId: "seed-bike-3",
            status: "V_DELU",
            intakeNote: "Zadnja prestava preskakuje, veriga je stara.",
            createdAt: daysAgo(1, 4),
            completedAt: null,
            items: [
                { ...reference("zamenjava-kasete", 1, 28), done: false },
                { ...reference("nastavitev-menjalnikov", 1, 18), done: false },
            ],
        },
        {
            id: "seed-ticket-4",
            customerId: "seed-customer-4",
            bikeId: "seed-bike-4",
            status: "NOVO",
            intakeNote: "Sprednja pnevmatika spušča, sliši se šumenje.",
            createdAt: daysAgo(0, 3),
            completedAt: null,
            items: [{ ...reference("zamenjava-zracnice", 1, 12), done: false }],
        },
    ];

    for (const ticket of ticketRows) {
        await db.ticket.upsert({
            where: { id: ticket.id },
            update: {},
            create: {
                id: ticket.id,
                customerId: ticket.customerId,
                bikeId: ticket.bikeId,
                status: ticket.status,
                intakeNote: ticket.intakeNote,
                createdAt: ticket.createdAt,
                completedAt: ticket.completedAt,
                createdById: admin.id,
                items: {
                    create: ticket.items.map((item, index) => ({
                        productId: item.productId,
                        name: item.name,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        done: item.done,
                        sortOrder: index,
                    })),
                },
            },
        });
    }

    const customerById = new Map(customerRows.map((customer) => [customer.id, customer]));
    const bikeById = new Map(bikeRows.map((bike) => [bike.id, bike]));

    type SeedReceipt = {
        id: string;
        ticketId: string | null;
        customerId: string | null;
        bikeId: string | null;
        status: ReceiptStatus;
        note?: string;
        createdAt: Date;
        discountType: DiscountType | null;
        discountValue: number;
        items: {
            productId: string;
            name: string;
            quantity: number;
            unitPrice: number;
            discountType: DiscountType | null;
            discountValue: number;
        }[];
    };

    const receiptRows: SeedReceipt[] = [
        {
            id: "seed-receipt-1",
            ticketId: "seed-ticket-1",
            customerId: "seed-customer-1",
            bikeId: "seed-bike-1",
            status: "PAID",
            note: "Mestno kolo, redni servis.",
            createdAt: daysAgo(12),
            discountType: null,
            discountValue: 0,
            items: [
                {
                    ...reference("osnovni-servis", 1, 45),
                    discountType: null,
                    discountValue: 0,
                },
                {
                    ...reference("zamenjava-verige", 1, 22),
                    discountType: null,
                    discountValue: 0,
                },
            ],
        },
        {
            id: "seed-receipt-2",
            ticketId: "seed-ticket-2",
            customerId: "seed-customer-2",
            bikeId: "seed-bike-2",
            status: "PAID",
            createdAt: daysAgo(6),
            discountType: "PERCENT",
            discountValue: 10,
            items: [
                {
                    ...reference("prezracevanje-hidravlicnih-zavor", 2, 45),
                    discountType: null,
                    discountValue: 0,
                },
                {
                    ...reference("zamenjava-zavornih-ploscic", 1, 25),
                    discountType: null,
                    discountValue: 0,
                },
            ],
        },
        {
            id: "seed-receipt-3",
            ticketId: null,
            customerId: null,
            bikeId: null,
            status: "PAID",
            createdAt: daysAgo(3),
            discountType: null,
            discountValue: 0,
            items: [
                {
                    ...reference("zamenjava-pnevmatike", 2, 15),
                    discountType: "AMOUNT",
                    discountValue: 2,
                },
            ],
        },
    ];

    for (const receipt of receiptRows) {
        const customer = receipt.customerId ? customerById.get(receipt.customerId) : null;
        const bike = receipt.bikeId ? bikeById.get(receipt.bikeId) : null;
        const totals = receiptTotals({
            items: receipt.items.map((item) => ({
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discountType: item.discountType,
                discountValue: item.discountValue,
            })),
            discountType: receipt.discountType,
            discountValue: receipt.discountValue,
        });

        await db.receipt.upsert({
            where: { id: receipt.id },
            update: {},
            create: {
                id: receipt.id,
                customerId: receipt.customerId,
                customerName: customer?.name ?? null,
                bikeId: receipt.bikeId,
                bikeName: bike?.name ?? null,
                note: receipt.note,
                status: receipt.status,
                subtotal: totals.subtotal,
                discountType: receipt.discountType,
                discountValue: receipt.discountValue,
                discountTotal: totals.discountTotal,
                total: totals.total,
                createdAt: receipt.createdAt,
                createdById: admin.id,
                items: { create: receipt.items },
            },
        });

        if (receipt.ticketId) {
            await db.ticket.update({
                where: { id: receipt.ticketId },
                data: { receiptId: receipt.id },
            });
        }
    }

    const dayIn = (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() + days);

        return dateKey(date);
    };

    await db.reservation.deleteMany({
        where: { id: { startsWith: "seed-reservation-" } },
    });

    const customerPool = [
        "seed-customer-1",
        "seed-customer-2",
        "seed-customer-3",
        "seed-customer-4",
    ];
    const bikePool = ["seed-bike-1", "seed-bike-2", "seed-bike-3", "seed-bike-4"];
    const ticketPool = ["seed-ticket-1", "seed-ticket-2", "seed-ticket-3", "seed-ticket-4"];
    const personalNotes = ["Malica.", "Prevzem rezervnih delov.", "Dostava.", "Servis orodja."];
    const durations = [30, 45, 60, 90];

    for (let day = 0; day <= 13; day++) {
        const count = 10 + (day % 3);

        for (let index = 0; index < count; index++) {
            const id = `seed-reservation-${day}-${index}`;
            const person = (day + index) % customerPool.length;
            const personal = index % 5 === 4;
            const customerId = personal ? null : customerPool[person];
            const bikeId = personal ? null : bikePool[person];

            await db.reservation.upsert({
                where: { id },
                update: {},
                create: {
                    id,
                    date: dayIn(day),
                    startMinutes: 8 * 60 + index * 75,
                    durationMinutes: durations[(day + index) % durations.length],
                    note: personal ? personalNotes[(day + index) % personalNotes.length] : null,
                    customerId,
                    customerName: customerId ? (customerById.get(customerId)?.name ?? null) : null,
                    bikeId,
                    bikeName: bikeId ? (bikeById.get(bikeId)?.name ?? null) : null,
                    ticketId: !personal && index === 0 ? ticketPool[person] : null,
                    createdById: admin.id,
                },
            });
        }
    }

    console.log("Seed complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
