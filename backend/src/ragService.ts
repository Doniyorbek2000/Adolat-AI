import { GoogleGenAI } from '@google/genai';
import pool from './db';
import { search, SafeSearchType } from 'duck-duck-scrape';
import { getAllConnectors } from './connectors';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface LegalChunk {
    content: string;
    source_title: string;
    source_link: string;
    article_ref?: string;
    similarity?: number;
    priority?: number;
}

function cosineSimilarity(vecA: number[], vecB: number[]) {
    if (!vecA || !vecB) return 0;
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    if (magA === 0 || magB === 0) return 0;
    return dotProduct / (magA * magB);
}

export const classifyQuery = async (query: string): Promise<{ category: string, sources: string[] }> => {
    try {
        const prompt = `Savolni toifaga ajrating: 'tax', 'legal', 'service', 'finance', 'property', 'customs', 'official'. Va mos manbalarni ro'yxat qiling (Lex.uz, Soliq.uz, My.gov.uz va h.k.).\nSavol: "${query}"\nJavob JSON: { "category": "...", "sources": ["..."] }`;
        const res = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        return JSON.parse(res.text || '{"category": "legal", "sources": ["Lex.uz"]}');
    } catch (e) {
        return { category: "legal", sources: ["Lex.uz"] };
    }
};

export const getLegalContext = async (query: string): Promise<string> => {
    try {
        const classification = await classifyQuery(query);
        const embeddingRes = await ai.models.embedContent({
            model: "text-embedding-004",
            contents: query,
        });
        const queryEmbedding = embeddingRes.embeddings?.[0]?.values || [];

        const dbResult = await pool.query(
            "SELECT l.*, s.source_name, s.base_url, s.trust_level FROM legal_knowledge l JOIN sources s ON l.source_id = s.id WHERE l.category = $1 OR s.source_name = ANY($2)",
            [classification.category, classification.sources]
        );

        let chunks: LegalChunk[] = dbResult.rows.map(row => ({
            content: row.content,
            source_title: row.source_name + ': ' + row.source_title,
            source_link: row.source_link || row.base_url,
            article_ref: row.article_ref,
            similarity: cosineSimilarity(queryEmbedding, row.embedding as number[]),
            priority: row.trust_level
        }));

        chunks.sort((a, b) => ((b.similarity || 0) * (b.priority || 1)) - ((a.similarity || 0) * (a.priority || 1)));
        const relevantDBChunks = chunks.filter(c => (c.similarity || 0) > 0.4).slice(0, 5);

        const allConnectors = getAllConnectors();
        const activeConnectors = allConnectors.filter(c => 
            classification.sources.some(s => s.toLowerCase().includes(c.sourceName.toLowerCase().replace('.uz', ''))) ||
            classification.sources.some(s => c.baseUrl.includes(s.toLowerCase()))
        );
        
        if (activeConnectors.length === 0) {
            const lex = allConnectors.find(c => c.sourceName === 'Lex.uz');
            if (lex) activeConnectors.push(lex);
        }

        const webChunks: LegalChunk[] = [];
        for (const connector of activeConnectors.slice(0, 2)) {
            const chunks = await connector.searchRealTime(query);
            webChunks.push(...chunks);
        }
        
        const finalContextChunks = [...relevantDBChunks, ...webChunks].slice(0, 8);
        if (finalContextChunks.length === 0) return "";

        let specializedHeader = "";
        if (classification.category === 'tax') specializedHeader = "\n[TAX KNOWLEDGE MODULE ACTIVE]\nSoliq stavkalari, stavka, kim to'laydi, muddat, hisoblash formulasi, imtiyozlar va jarimalarga e'tibor bering.\n";
        if (classification.category === 'service') specializedHeader = "\n[SERVICE PROCESS MODULE ACTIVE]\nXizmat nomi, murojaat joyi, hujjatlar, muddat, boj va my.gov.uz havolasini ko'rsating.\n";

        return specializedHeader + finalContextChunks
            .map(c => `[MANBA: ${c.source_title} | LINK: ${c.source_link} | REF: ${c.article_ref || "Noma'lum"}]\nMATN: ${c.content}`)
            .join('\n\n---\n\n');
    } catch (error) {
        console.error("RAG Error:", error);
        return "";
    }
};

export const reindexLegalData = async (seedQuery: string) => {
    try {
        const results = await search(seedQuery + " O'zbekiston qonunlari lex.uz", { safeSearch: SafeSearchType.OFF });
        let count = 0;
        const lexSource = await pool.query("SELECT id FROM sources WHERE source_name = 'Lex.uz'");
        const sourceId = lexSource.rows[0]?.id;

        for (const res of results.results) {
            const exists = await pool.query("SELECT id FROM legal_knowledge WHERE source_link = $1", [res.url]);
            if (exists.rowCount && exists.rowCount > 0) continue;

            const embeddingRes = await ai.models.embedContent({
                model: "text-embedding-004",
                contents: res.description,
            });
            
            await pool.query(
                "INSERT INTO legal_knowledge (source_id, content, source_title, source_link, embedding, category) VALUES ($1, $2, $3, $4, $5, $6)",
                [sourceId, res.description, res.title, res.url, JSON.stringify(embeddingRes.embeddings?.[0]?.values || []), 'legal']
            );
            count++;
        }
        return count;
    } catch (e) {
        console.error("Reindex error:", e);
        throw e;
    }
};
