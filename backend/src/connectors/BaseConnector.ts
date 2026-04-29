import { search, SafeSearchType } from 'duck-duck-scrape';
import { LegalChunk } from '../ragService';

export abstract class BaseConnector {
    abstract sourceName: string;
    abstract baseUrl: string;
    abstract trustLevel: number;
    abstract category: string;

    async searchRealTime(query: string): Promise<LegalChunk[]> {
        const domain = this.baseUrl.replace('https://', '').replace('http://', '');
        const searchQuery = `${query} site:${domain}`;
        const webChunks: LegalChunk[] = [];
        
        try {
            const webRes = await search(searchQuery, { safeSearch: SafeSearchType.OFF });
            webRes.results.slice(0, 3).forEach(r => {
                webChunks.push({
                    content: r.description,
                    source_title: r.title,
                    source_link: r.url,
                    article_ref: "Real-time qidiruv",
                    priority: this.trustLevel
                });
            });
        } catch (e) {
            console.error(`[${this.sourceName}] Real-time search failed:`, e);
        }
        return webChunks;
    }
}
