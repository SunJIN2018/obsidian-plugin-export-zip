interface ImagePattern {
  regex: RegExp;
  pathIndex: number;
  replace(match: string, newPath: string): string;
}

const IMAGE_PATTERNS: ImagePattern[] = [
  {
    regex: /!\[([^\]]*)\]\(([^)]+)\)/g,
    pathIndex: 2,
    replace(match, newPath) {
      const alt = /!\[([^\]]*)\]/.exec(match)?.[1] ?? '';
      return `![${alt}](${newPath})`;
    },
  },
  {
    regex: /!\[\[([^\]|]+?)(\|[^\]]*)?\]\]/g,
    pathIndex: 1,
    replace(match, newPath) {
      const alias = /\|([^\]]+)/.exec(match)?.[1];
      return alias ? `![${alias}](${newPath})` : `![](${newPath})`;
    },
  },
  {
    regex: /(<img[^>]+src=["'])([^"']+)(["'][^>]*>)/gi,
    pathIndex: 2,
    replace(match, newPath) {
      return match.replace(/(src=["'])([^"']+)/i, `$1${newPath}`);
    },
  },
];

export function extractImagePaths(markdown: string): string[] {
  const paths = new Set<string>();

  for (const { regex, pathIndex } of IMAGE_PATTERNS) {
    let match: RegExpExecArray | null;
    regex.lastIndex = 0;
    while ((match = regex.exec(markdown)) !== null) {
      const raw = match[pathIndex];
      if (raw) {
        const decoded = decodeURI(raw).trim();
        if (decoded) {
          paths.add(decoded);
        }
      }
    }
  }

  return [...paths];
}

export function rewriteImageRefs(
  markdown: string,
  pathMap: Map<string, string>,
): string {
  let result = markdown;

  for (const { regex, pathIndex, replace } of IMAGE_PATTERNS) {
    result = result.replace(regex, (...args) => {
      const match = args[0];
      const raw = args[pathIndex] as string | undefined;
      if (!raw) return match;
      const decoded = decodeURI(raw).trim();
      const resolved = pathMap.get(decoded);
      if (!resolved) return match;
      return replace(match, resolved);
    });
  }

  return result;
}

const WIKILINK_IMAGE_REGEX = /!\[\[([^\]|]+?)(\|[^\]]*)?\]\]/g;

export function convertWikilinksToStandard(markdown: string): string {
  return markdown.replace(WIKILINK_IMAGE_REGEX, (_, path: string, aliasPart: string | undefined) => {
    const alias = aliasPart?.slice(1);
    return alias ? `![${alias}](${path})` : `![](${path})`;
  });
}