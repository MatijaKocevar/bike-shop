"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { usePresignedUpload } from "@/hooks/use-presigned-upload";
import { publicUrl } from "@/lib/storage-url";
import type { TicketImageSummary } from "@/queries/tickets.types";
import { createTicketImageUpload } from "../_actions/create-ticket-image-upload";
import { removeTicketImage } from "../_actions/remove-ticket-image";
import { updateTicketImage } from "../_actions/update-ticket-image";
import { uploadTicketImage } from "../_actions/upload-ticket-image";
import type { StagedTicketImage } from "../_types/staged-ticket-image";
import type { TicketImageTile } from "../_types/ticket-image-tile";

type TicketImagesProps = {
    ticketId?: string;
    images?: TicketImageSummary[];
};

export function TicketImages({ ticketId, images = [] }: TicketImagesProps) {
    const t = useTranslations("tickets");
    const { upload, uploading } = usePresignedUpload();
    const cameraRef = useRef<HTMLInputElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const [staged, setStaged] = useState<StagedTicketImage[]>([]);
    const [pending, startTransition] = useTransition();
    const stagedMode = !ticketId;

    async function addFiles(fileList: FileList | null) {
        const files = Array.from(fileList ?? []);
        if (files.length === 0) return;

        try {
            for (const file of files) {
                const { key } = await upload(file, () =>
                    createTicketImageUpload(ticketId ?? null, file.name, file.type, file.size),
                );

                if (ticketId) {
                    await uploadTicketImage({ ticketId, key });
                } else {
                    setStaged((current) => [...current, { key, description: "" }]);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (cameraRef.current) cameraRef.current.value = "";
            if (fileRef.current) fileRef.current.value = "";
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

    function removeStaged(key: string) {
        setStaged((current) => current.filter((image) => image.key !== key));
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

    function saveStagedDescription(key: string, description: string) {
        const value = description.trim();

        setStaged((current) =>
            current.map((image) => (image.key === key ? { ...image, description: value } : image)),
        );
    }

    const tiles: TicketImageTile[] = stagedMode
        ? staged.map((image) => ({
              id: image.key,
              imageKey: image.key,
              description: image.description,
              onRemove: () => removeStaged(image.key),
              onDescription: (value) => saveStagedDescription(image.key, value),
          }))
        : images.map((image) => ({
              id: image.id,
              imageKey: image.key,
              description: image.description ?? "",
              onRemove: () => remove(image),
              onDescription: (value) => saveDescription(image, value),
          }));

    return (
        <div className="flex flex-col gap-2">
            {stagedMode && <input type="hidden" name="photos" value={JSON.stringify(staged)} />}

            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{t("photos")}</span>

                <div className="flex items-center gap-2">
                    <input
                        ref={cameraRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(event) => addFiles(event.target.files)}
                    />

                    <input
                        ref={fileRef}
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
                        onClick={() => cameraRef.current?.click()}
                    >
                        <Camera className="size-4" />
                        {t("takePhoto")}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                    >
                        <ImagePlus className="size-4" />
                        {t("addPhoto")}
                    </Button>
                </div>
            </div>

            {tiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noPhotos")}</p>
            ) : (
                <ul className="flex gap-3 overflow-x-auto pb-1">
                    {tiles.map((tile) => (
                        <li key={tile.id} className="w-32 shrink-0">
                            <div className="relative overflow-hidden rounded-lg border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={publicUrl(tile.imageKey)}
                                    alt={tile.description}
                                    className="aspect-square w-full object-cover"
                                />

                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon-sm"
                                    className="absolute top-1 right-1"
                                    disabled={pending}
                                    onClick={tile.onRemove}
                                    aria-label={t("removePhoto")}
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>

                            <input
                                className="mt-1.5 w-full rounded-md border bg-background px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring/50 outline-none"
                                defaultValue={tile.description}
                                placeholder={t("photoDescription")}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") event.currentTarget.blur();
                                }}
                                onBlur={(event) => tile.onDescription(event.target.value)}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
