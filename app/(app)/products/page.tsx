import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { FormDialog } from "@/components/form-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { publicUrl } from "@/lib/storage-url";
import { listCategories } from "@/queries/categories";
import { getProductById, listProducts } from "@/queries/products";
import { deleteProduct } from "./_actions/delete-product";
import { removeProductImage } from "./_actions/remove-product-image";
import { ProductForm } from "./_components/product-form";
import { ProductImageUploadForm } from "./_components/product-image-upload-form";
import { ProductsTable } from "./_components/products-table";

type ProductsPageProps = {
    searchParams: Promise<{ id?: string; new?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const { id, new: isNew } = await searchParams;
    const [products, categories, editing] = await Promise.all([
        listProducts(),
        listCategories(),
        id ? getProductById(id) : null,
    ]);
    const t = await getTranslations("products");

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ProductsTable
                products={products}
                toolbarActions={
                    <Link
                        href="/products?new=1"
                        aria-label={t("new")}
                        className={buttonVariants({ size: "sm" })}
                    >
                        <Plus className="size-4" />
                        <span className="hidden sm:inline">{t("new")}</span>
                    </Link>
                }
            />

            <FormDialog
                open={Boolean(isNew) || Boolean(editing)}
                onCloseHref="/products"
                title={editing ? t("edit") : t("newTitle")}
                className="sm:max-w-2xl lg:max-w-3xl"
            >
                {editing ? (
                    <div className="flex flex-col gap-8">
                        <ProductForm
                            product={{
                                id: editing.id,
                                name: editing.name,
                                slug: editing.slug,
                                description: editing.description,
                                price: editing.price,
                                active: editing.active,
                                categoryId: editing.categoryId,
                            }}
                            categories={categories}
                        />

                        <div>
                            <Separator className="mb-6" />

                            <h2 className="mb-3 font-semibold">{t("images")}</h2>
                            <ProductImageUploadForm productId={editing.id} />

                            {editing.images.length > 0 && (
                                <ul className="mt-3 grid grid-cols-3 gap-3">
                                    {editing.images.map((image) => (
                                        <li
                                            key={image.id}
                                            className="relative overflow-hidden rounded-lg border"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={publicUrl(image.key)}
                                                alt={image.alt ?? ""}
                                                className="aspect-square w-full object-cover"
                                            />
                                            <form action={removeProductImage}>
                                                <input
                                                    type="hidden"
                                                    name="imageId"
                                                    value={image.id}
                                                />
                                                <Button
                                                    type="submit"
                                                    variant="destructive"
                                                    size="icon-sm"
                                                    className="absolute top-1 right-1"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </form>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <Separator className="my-6" />

                            <form action={deleteProduct}>
                                <input type="hidden" name="id" value={editing.id} />
                                <Button type="submit" variant="destructive">
                                    <Trash2 className="size-4" />
                                    {t("deleteProduct")}
                                </Button>
                            </form>
                        </div>
                    </div>
                ) : isNew ? (
                    <ProductForm categories={categories} />
                ) : null}
            </FormDialog>
        </div>
    );
}
