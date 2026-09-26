"use client";

import { useRef, useTransition } from "react";
import { Camera, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { usePresignedUpload } from "@/hooks/use-presigned-upload";
import { publicUrl } from "@/lib/storage-url";
import type { TicketImageSummary } from "@/queries/tickets.types";
import { createTicketImageUpload } from "../_actions/create-ticket-image-upload";
import { removeTicketImage } from "../_actions/remove-ticket-image";
import { updateTicketImage } from "../_actions/update-ticket-image";
import { uploadTicketImage } from "../_actions/upload-ticket-image";

type TicketImagesProps = {
    ticketId: string;
    images: TicketImageSummary[];
};

export function TicketImages({ ticketId, images }: TicketImagesProps) {
    const t = useTranslations("tickets");
    const { upload, uploading } = usePresignedUpload();
    const inputRef = useRef<HTMLInputElement>(null);
    const [pending, startTransition] = useTransition();

    async function addFiles(fileList: FileList | null) {
        const files = Array.from(fileList ?? []);
        if (files.length === 0) return;

        try {
            for (const file of files) {
                const { key } = await upload(file, () =>
                    createTicketImageUpload(ticketId, file.name, file.type, file.size),
                );

                await uploadTicketImage({ ticketId, key });
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    function remove(image: TicketImageSummary) {
        startTransition(async () => {
            try {
                await removeTicketImage(image.id);
            } catch (error) {
                console.error(error);
            }
        });
    }

    function saveDescription(image: TicketImageSummary, description: string) {
        const value = description.trim();
        if (value === (image.description ?? "")) return;

        startTransition(async () => {
            try {
                await updateTicketImage(image.id, value);
            } catch (error) {
                console.error(error);
            }
        });
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{t("photos")}</span>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => addFiles(event.target.files)}
                />

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => inputRef.current?.click()}
                >
                    <Camera className="size-4" />
                    {t("addPhoto")}
                </Button>
            </div>

            {images.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noPhotos")}</p>
            ) : (
                <ul className="flex gap-3 overflow-x-auto pb-1">
                    {images.map((image) => (
                        <li key={image.id} className="w-32 shrink-0">
                            <div className="relative overflow-hidden rounded-lg border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={publicUrl(image.key)}
                                    alt={image.description ?? ""}
                                    className="aspect-square w-full object-cover"
                                />

                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon-sm"
                                    className="absolute top-1 right-1"
                                    disabled={pending}
                                    onClick={() => remove(image)}
                                    aria-label={t("removePhoto")}
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>

                            <input
                                className="mt-1.5 w-full rounded-md border bg-background px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring/50 outline-none"
                                defaultValue={image.description ?? ""}
                                placeholder={t("photoDescription")}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") event.currentTarget.blur();
                                }}
                                onBlur={(event) => saveDescription(image, event.target.value)}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
