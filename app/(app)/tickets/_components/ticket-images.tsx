"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Camera, Download, ImagePlus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePresignedUpload } from "@/hooks/use-presigned-upload";
import { downloadUrl, publicUrl } from "@/lib/storage-url";
import type { TicketImageSummary } from "@/queries/tickets.types";
import { createTicketImageUpload } from "../_actions/create-ticket-image-upload";
import { removeTicketImage } from "../_actions/remove-ticket-image";
import { updateTicketImage } from "../_actions/update-ticket-image";
import { uploadTicketImage } from "../_actions/upload-ticket-image";
import type { StagedTicketImage } from "../_types/staged-ticket-image";
import type { TicketImagePreview } from "../_types/ticket-image-preview";
import type { TicketImageTile } from "../_types/ticket-image-tile";
import { photoFilename } from "../_utils/photo-filename";

type TicketImagesProps = {
    ticketId?: string;
    images?: TicketImageSummary[];
};

export function TicketImages({ ticketId, images = [] }: TicketImagesProps) {
    const t = useTranslations("tickets");
    const { upload, uploading } = usePresignedUpload();
    const rootRef = useRef<HTMLDivElement>(null);
    const cameraRef = useRef<HTMLInputElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const uploadingRef = useRef(false);
    const pendingSubmitRef = useRef<HTMLFormElement | null>(null);
    const [staged, setStaged] = useState<StagedTicketImage[]>([]);
    const [preview, setPreview] = useState<TicketImagePreview | null>(null);
    const [failed, setFailed] = useState(false);
    const [pending, startTransition] = useTransition();
    const stagedMode = !ticketId;

    useEffect(() => {
        const form: HTMLFormElement | null = rootRef.current?.closest("form") ?? null;
        if (!form) return;

        function onSubmit(event: SubmitEvent) {
            if (!uploadingRef.current) return;

            event.preventDefault();
            pendingSubmitRef.current = form;
        }

        form.addEventListener("submit", onSubmit);

        return () => form.removeEventListener("submit", onSubmit);
    }, []);

    async function addFiles(fileList: FileList | null) {
        const files = Array.from(fileList ?? []);
        if (files.length === 0) return;

        uploadingRef.current = true;
        setFailed(false);

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
            setFailed(true);
        } finally {
            uploadingRef.current = false;
            if (cameraRef.current) cameraRef.current.value = "";
            if (fileRef.current) fileRef.current.value = "";

            const form = pendingSubmitRef.current;
            pendingSubmitRef.current = null;
            if (form) window.setTimeout(() => form.requestSubmit(), 50);
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
        <div ref={rootRef} className="flex flex-col gap-2">
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

            {uploading && <p className="text-sm text-muted-foreground">{t("photoUploading")}</p>}

            {failed && <p className="text-sm text-destructive">{t("photoUploadFailed")}</p>}

            {tiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noPhotos")}</p>
            ) : (
                <ul className="flex gap-3 overflow-x-auto pb-1">
                    {tiles.map((tile) => (
                        <li key={tile.id} className="w-32 shrink-0">
                            <div className="relative overflow-hidden rounded-lg border">
                                <button
                                    type="button"
                                    className="block w-full cursor-zoom-in"
                                    onClick={() =>
                                        setPreview({
                                            imageKey: tile.imageKey,
                                            description: tile.description,
                                            filename: photoFilename(tile.imageKey),
                                        })
                                    }
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={publicUrl(tile.imageKey)}
                                        alt={tile.description}
                                        className="aspect-square w-full object-cover"
                                    />
                                </button>

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

            <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
                <DialogContent className="sm:max-w-3xl">
                    {preview && (
                        <div className="flex flex-col gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={publicUrl(preview.imageKey)}
                                alt={preview.description}
                                className="max-h-[70dvh] w-full rounded-lg object-contain"
                            />

                            <div className="flex items-center justify-between gap-2">
                                <p className="min-w-0 truncate text-sm text-muted-foreground">
                                    {preview.description}
                                </p>

                                <a
                                    href={downloadUrl(preview.imageKey)}
                                    download={preview.filename}
                                    className={buttonVariants({ variant: "outline", size: "sm" })}
                                >
                                    <Download className="size-4" />
                                    {t("downloadPhoto")}
                                </a>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
