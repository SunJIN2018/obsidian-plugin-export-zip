import { App, Notice, TFile } from 'obsidian';
import JSZip from 'jszip';
import { extractImagePaths, rewriteImageRefs, convertWikilinksToStandard } from './extract-images';

export interface ExportResult {
    imageCount: number;
    saved: boolean;
}

export async function exportFileAsZip(app: App, file: TFile): Promise<ExportResult> {
    const markdown = await app.vault.read(file);
    const imagePaths = extractImagePaths(markdown);

    const zip = new JSZip();
    const pathMap = new Map<string, string>();
    const assetsFolder = 'assets';
    let assetCounter = 0;
    let imageCount = 0;

    for (const imgPath of imagePaths) {
        if (isDataUri(imgPath)) {
            const result = parseDataUri(imgPath);
            if (result) {
                const assetName = `${++assetCounter}-data.${result.ext}`;
                zip.file(`${assetsFolder}/${assetName}`, result.buffer);
                pathMap.set(imgPath, `${assetsFolder}/${assetName}`);
                imageCount++;
            }
            continue;
        }

        if (isNetworkUrl(imgPath)) {
            try {
                const resp = await fetch(imgPath);
                if (!resp.ok) throw new Error(`${resp.status}`);
                const buffer = await resp.arrayBuffer();
                const ext = guessExtensionFromContentType(resp.headers.get('content-type'), imgPath);
                const baseName = sanitizeFilename(getUrlFilename(imgPath)) || 'image';
                const assetName = `${++assetCounter}-${baseName}.${ext}`;
                zip.file(`${assetsFolder}/${assetName}`, buffer);
                pathMap.set(imgPath, `${assetsFolder}/${assetName}`);
                imageCount++;
            } catch {
                new Notice(`网络图片下载失败，已跳过: ${imgPath}`);
            }
            continue;
        }

        const imgFile = app.metadataCache.getFirstLinkpathDest(imgPath, file.path);
        if (!imgFile || !(imgFile instanceof TFile)) {
            new Notice(`图片未找到，已跳过: ${imgPath}`);
            continue;
        }

        const assetName = `${++assetCounter}-${imgFile.name}`;
        const assetPath = `${assetsFolder}/${assetName}`;
        pathMap.set(imgPath, assetPath);

        try {
            const data = await app.vault.readBinary(imgFile);
            zip.file(assetPath, data);
            imageCount++;
        } catch {
            new Notice(`图片读取失败，已跳过: ${imgFile.path}`);
        }
    }

    let rewritten = pathMap.size > 0 ? rewriteImageRefs(markdown, pathMap) : markdown;
    rewritten = convertWikilinksToStandard(rewritten);
    zip.file(file.basename + '.md', rewritten);

    const blob = await zip.generateAsync({ type: 'blob' });
    const saved = await saveBlob(blob, file.basename + '.zip');

    return { imageCount, saved };
}

function isNetworkUrl(path: string): boolean {
    return /^https?:\/\//i.test(path);
}

function isDataUri(path: string): boolean {
    return /^data:/i.test(path);
}

interface DataUriResult {
    buffer: ArrayBuffer;
    ext: string;
}

function parseDataUri(uri: string): DataUriResult | null {
    const match = uri.match(/^data:([^;,]+)?(?:;base64)?,(.+)$/);
    if (!match?.[2]) return null;
    const mime = match[1] ?? 'image/png';
    const base64 = match[2];
    try {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return { buffer: bytes.buffer, ext: mimeToExt(mime) };
    } catch {
        return null;
    }
}

function mimeToExt(mime: string): string {
    const map: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/svg+xml': 'svg',
        'image/bmp': 'bmp',
        'image/tiff': 'tiff',
    };
    return map[mime.toLowerCase()] ?? mime.split('/')[1] ?? 'png';
}

function guessExtensionFromContentType(contentType: string | null, url: string): string {
    if (contentType) {
        const mime = contentType.split(';')[0]?.trim();
        if (mime) return mimeToExt(mime);
    }
    const urlExt = url.match(/\.(\w{3,4})(?:[?#]|$)/)?.[1];
    return urlExt ?? 'png';
}

function getUrlFilename(url: string): string {
    try {
        const pathname = new URL(url).pathname;
        const name = pathname.split('/').pop();
        return name?.replace(/\.[^.]+$/, '') ?? '';
    } catch {
        return '';
    }
}

function sanitizeFilename(name: string): string {
    return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').substring(0, 50);
}

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

type ShowSaveFilePicker = (options?: {
    suggestedName?: string;
    types?: Array<{ description: string; accept: Record<string, string[]> }>;
}) => Promise<FileSystemFileHandle>;

async function saveBlob(blob: Blob, filename: string): Promise<boolean> {
    if (typeof (window as unknown as { showSaveFilePicker?: ShowSaveFilePicker }).showSaveFilePicker === 'function') {
        try {
            const handle = await (window as unknown as { showSaveFilePicker: ShowSaveFilePicker }).showSaveFilePicker({
                suggestedName: filename,
                types: [{ description: 'ZIP', accept: { 'application/zip': ['.zip'] } }],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return true;
        } catch {
            return false;
        }
    }

    downloadBlob(blob, filename);
    return true;
}