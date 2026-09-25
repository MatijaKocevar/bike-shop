import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerBike } from "@/queries/customers.types";
import { deleteBike } from "../_actions/delete-bike";

type CustomerBikesProps = {
    customerId: string;
    bikes: CustomerBike[];
};

export async function CustomerBikes({ customerId, bikes }: CustomerBikesProps) {
    const t = await getTranslations("customers");

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{t("bikes")}</CardTitle>
                <Link
                    href={`/customers?id=${customerId}&bike=new`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                    <Plus className="size-4" />
                    {t("addBike")}
                </Link>
            </CardHeader>
            <CardContent>
                {bikes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("noBikes")}</p>
                ) : (
                    <ul className="divide-y">
                        {bikes.map((bike) => {
                            const details = [bike.brand, bike.model, bike.color, bike.serial]
                                .filter(Boolean)
                                .join(" · ");

                            return (
                                <li
                                    key={bike.id}
                                    className="flex items-center justify-between gap-2 py-2.5"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">{bike.name}</p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {details || "—"}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1">
                                        <Link
                                            href={`/customers?id=${customerId}&bike=${bike.id}`}
                                            aria-label={t("editBike")}
                                            className={buttonVariants({
                                                variant: "ghost",
                                                size: "icon-sm",
                                            })}
                                        >
                                            <Pencil className="size-4" />
                                        </Link>

                                        <form action={deleteBike}>
                                            <input type="hidden" name="id" value={bike.id} />
                                            <input
                                                type="hidden"
                                                name="customerId"
                                                value={customerId}
                                            />
                                            <Button
                                                type="submit"
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={t("deleteBike")}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
