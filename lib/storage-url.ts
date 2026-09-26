export function publicUrl(key: string): string {
    const external = process.env.NEXT_PUBLIC_S3_PUBLIC_URL;
    if (external) {
        return `${external}/${key}`;
    }

    const path = key.split("/").map(encodeURIComponent).join("/");
    return `/api/files/${path}`;
}

export function downloadUrl(key: string): string {
    const path = key.split("/").map(encodeURIComponent).join("/");
    return `/api/files/${path}`;
}
