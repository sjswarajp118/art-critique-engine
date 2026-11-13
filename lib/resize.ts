export function scaleToFit(width: number, height: number, maxSide: number) {
    // 1. the longer side:
    const longerSide = Math.max(width, height);

    // 2. scale = maxSide / longer side:
    const scale = maxSide / longerSide;

    // 3. if scale >= 1, the image already fits, return it unchanged:
    if (scale >= 1) {
        return { width, height };
    }

    // 4. otherwise return each side times scale, rounded:
    const newWidth = Math.round(width * scale);
    const newHeight = Math.round(height * scale);
    return { width: newWidth, height: newHeight };
}

export function needsResize(size: number, targetSize: number): boolean {
    return size > targetSize;
}