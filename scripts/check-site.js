const fs = require('node:fs');
const path = require('node:path');
const { fileURLToPath, pathToFileURL } = require('node:url');

const repositoryRoot = path.resolve(__dirname, '..');
const docsRoot = path.join(repositoryRoot, 'docs');
const errors = [];

function listPages(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            if (entry.name.toLowerCase() === 'test') return [];
            return listPages(entryPath);
        }
        if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.html')) return [];
        if (/^(test|transfer|structure)\.html$/i.test(entry.name)) return [];
        return [entryPath];
    });
}

function getHtmlIds(html) {
    const ids = new Set();
    for (const match of html.matchAll(/\b(?:id|name)\s*=\s*["']([^"']+)["']/gi)) {
        ids.add(match[1]);
    }
    return ids;
}

const pages = listPages(docsRoot);
const htmlByPath = new Map(pages.map(page => [path.resolve(page), fs.readFileSync(page, 'utf8')]));
const idsByPath = new Map([...htmlByPath].map(([page, html]) => [page, getHtmlIds(html)]));

for (const [page, html] of htmlByPath) {
    const relativePage = path.relative(repositoryRoot, page);
    const scriptSources = new Set();
    for (const match of html.matchAll(/<script\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/gi)) {
        if (scriptSources.has(match[2])) {
            errors.push(`${relativePage}: script "${match[2]}" is included more than once`);
        }
        scriptSources.add(match[2]);
    }

    for (const match of html.matchAll(/<a\b[^>]*\btarget\s*=\s*(["'])_blank\1[^>]*>/gi)) {
        const rel = match[0].match(/\brel\s*=\s*(["'])(.*?)\1/i)?.[2].toLowerCase().split(/\s+/) ?? [];
        if (!rel.includes('noopener') || !rel.includes('noreferrer')) {
            errors.push(`${relativePage}: links opening a new tab must use rel="noopener noreferrer"`);
        }
    }

    for (const match of html.matchAll(/\b(?:href|src|action|poster)\s*=\s*(["'])(.*?)\1/gi)) {
        const reference = match[2].trim();
        if (!reference || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)) {
            continue;
        }

        let targetUrl;
        try {
            targetUrl = new URL(reference, pathToFileURL(page));
        } catch {
            errors.push(`${relativePage}: invalid local reference "${reference}"`);
            continue;
        }

        let targetPath;
        try {
            targetPath = path.resolve(fileURLToPath(targetUrl));
        } catch {
            errors.push(`${relativePage}: invalid local reference "${reference}"`);
            continue;
        }

        if (!fs.existsSync(targetPath)) {
            errors.push(`${relativePage}: missing local target "${reference}"`);
            continue;
        }

        if (targetUrl.hash && idsByPath.has(targetPath)) {
            let fragment;
            try {
                fragment = decodeURIComponent(targetUrl.hash.slice(1));
            } catch {
                errors.push(`${relativePage}: invalid fragment in "${reference}"`);
                continue;
            }
            if (!idsByPath.get(targetPath).has(fragment)) {
                errors.push(`${relativePage}: missing fragment "${targetUrl.hash}" in "${path.relative(repositoryRoot, targetPath)}"`);
            }
        }
    }
}

if (errors.length) {
    console.error(`Site check failed with ${errors.length} issue(s):`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log(`Site check passed: ${pages.length} application pages have valid local references.`);
}
