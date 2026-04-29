import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BACKEND_URL } from '../../config/backend';

const BACKEND = BACKEND_URL;

export interface DocAnalysisResult {
  summary: string;
  keyPoints: string[];
  risks: string[];
  recommendations: string[];
}

export interface DocAnalysis {
  id: string; fileName: string; fileType: string; createdAt: string;
  summary: string; result: DocAnalysisResult;
}

interface DocsState { analyses: DocAnalysis[]; isAnalyzing: boolean; isGenerating: boolean; generatedText: string; }

export const analyzeDocument = createAsyncThunk(
  'docs/analyze',
  async (data: { name?: string; fileName?: string; fileContent?: string; isImage?: boolean; language?: string }, { rejectWithValue, getState }) => {
    try {
      const s: any = getState();
      const token = s.auth?.token;
      const fileName = data.name || data.fileName || 'Hujjat';

      const response = await fetch(`${BACKEND}/api/documents/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileName, fileContent: data.fileContent || '', language: data.language || 'uz' })
      });
      if (!response.ok) throw new Error("Hujjatni tahlil qilib bo'lmadi");
      const parsed = await response.json();
      return { id: `doc_${Date.now()}`, fileName, fileType: 'document', createdAt: new Date().toISOString(), summary: parsed.summary || '', result: parsed } as DocAnalysis;
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const generateDocument = createAsyncThunk(
  'docs/generate',
  async (data: { type: string; details: string; language?: string }, { rejectWithValue, getState }) => {
    try {
      const s: any = getState();
      const token = s.auth?.token;

      const response = await fetch(`${BACKEND}/api/documents/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: data.type, details: data.details, language: data.language || 'uz' })
      });
      if (!response.ok) throw new Error("Hujjat yaratib bo'lmadi");
      const result = await response.json();
      return result.text || '';
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

const docsSlice = createSlice({
  name: 'docs',
  initialState: { analyses: [], isAnalyzing: false, isGenerating: false, generatedText: '' } as DocsState,
  reducers: {
    deleteAnalysis: (s, a: PayloadAction<string>) => { s.analyses = s.analyses.filter((d) => d.id !== a.payload); },
    clearGenerated: (s) => { s.generatedText = ''; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeDocument.pending, (s) => { s.isAnalyzing = true; })
      .addCase(analyzeDocument.fulfilled, (s, a) => { s.isAnalyzing = false; s.analyses.unshift(a.payload); })
      .addCase(analyzeDocument.rejected, (s) => { s.isAnalyzing = false; })
      .addCase(generateDocument.pending, (s) => { s.isGenerating = true; s.generatedText = ''; })
      .addCase(generateDocument.fulfilled, (s, a) => { s.isGenerating = false; s.generatedText = a.payload; })
      .addCase(generateDocument.rejected, (s) => { s.isGenerating = false; });
  },
});

export const { deleteAnalysis, clearGenerated } = docsSlice.actions;
export default docsSlice.reducer;
