"use server";

import { randomUUID } from "node:crypto";
import { presignedUploadUrl } from "@/lib/storage";
import type { TicketImageUploadTarget } from "../_types/ticket-image-upload";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export async function createTicketImageUpload(
    ticketId: string,
    filename: string,
    contentType: string,
    size: number,
): Promise<TicketImageUploadTarget> {
    if (!ticketId || size <= 0 || size > MAX_UPLOAD_BYTES) {
        throw new Error("Invalid upload.");
    }

    const key = `tickets/${ticketId}/${randomUUID()}-${filename}`;
    const uploadUrl = await presignedUploadUrl(key, contentType || "image/jpeg");

    return { uploadUrl, key };
}
