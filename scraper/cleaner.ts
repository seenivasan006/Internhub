import { URL } from 'url';

export const cleanText = (text: string | null | undefined): string => {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
};

export const validateUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        return parsed.href;
    } catch (e) {
        if (url.startsWith('//')) return `https:${url}`;
        if (!url.startsWith('http')) return `https://${url}`;
        return null;
    }
};

export const parseDate = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
};

export const isExpired = (deadline: Date | null): boolean => {
    if (!deadline) return false;
    return deadline < new Date();
};
