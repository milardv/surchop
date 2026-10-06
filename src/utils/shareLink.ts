export async function shareLink(
    url: string,
    title: string,
    text: string,
): Promise<'shared' | 'copied'> {
    if (navigator.share) {
        try {
            await navigator.share({ title, text, url });
            return 'shared';
        } catch (error) {
            if ((error as Error).name === 'AbortError') return 'shared';
        }
    }

    await navigator.clipboard.writeText(url);
    return 'copied';
}
