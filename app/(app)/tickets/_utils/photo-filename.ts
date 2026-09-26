export function photoFilename(key: string): string {
    const match = /\.([a-zA-Z0-9]{2,5})$/.exec(key);

    return match ? `photo.${match[1]}` : "photo.jpg";
}
