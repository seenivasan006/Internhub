export const ensureAbsoluteUrl = (url: string | undefined): string => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    return `https://${url}`;
};
