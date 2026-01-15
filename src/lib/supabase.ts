import { createClient } from '@supabase/supabase-js';

// Types for our database
export interface Document {
  id: string;
  user_id: string;
  title: string;
  file_url: string;
  status: 'processing' | 'ready' | 'error';
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  metadata: Record<string, unknown>;
}

export interface StudySession {
  id: string;
  user_id: string;
  document_id: string;
  hp: number;
  xp: number;
  streak: number;
  created_at: string;
}

export interface QuizHistory {
  id: string;
  session_id: string;
  question: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  difficulty: string; // Was strict union, now string for AI safety
  created_at: string;
}

export interface GeneratedMedia {
  id: string;
  document_id: string;
  type: string; // Was strict union
  url: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface KnowledgeNode {
  id: string;
  document_id: string;
  label: string;
  type: string; // Was strict union
  description: string;
}

export interface KnowledgeEdge {
  id: string;
  source_id: string;
  target_id: string;
  relationship: string;
}

// Database type
export interface Database {
  public: {
    Tables: {
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at'>;
        Update: Partial<Omit<Document, 'id'>>;
      };
      document_chunks: {
        Row: DocumentChunk;
        Insert: Omit<DocumentChunk, 'id'>;
        Update: Partial<Omit<DocumentChunk, 'id'>>;
      };
      study_sessions: {
        Row: StudySession;
        Insert: Omit<StudySession, 'id' | 'created_at'>;
        Update: Partial<Omit<StudySession, 'id'>>;
      };
      quiz_history: {
        Row: QuizHistory;
        Insert: Omit<QuizHistory, 'id' | 'created_at'>;
        Update: Partial<Omit<QuizHistory, 'id'>>;
      };
      generated_media: {
        Row: GeneratedMedia;
        Insert: Omit<GeneratedMedia, 'id' | 'created_at'>;
        Update: Partial<Omit<GeneratedMedia, 'id'>>;
      };
      knowledge_nodes: {
        Row: KnowledgeNode;
        Insert: Omit<KnowledgeNode, 'id'>;
        Update: Partial<Omit<KnowledgeNode, 'id'>>;
      };
      knowledge_edges: {
        Row: KnowledgeEdge;
        Insert: Omit<KnowledgeEdge, 'id'>;
        Update: Partial<Omit<KnowledgeEdge, 'id'>>;
      };
      invited_users: {
        Row: { email: string; invited_by: string | null; role: string; created_at: string };
        Insert: { email: string; invited_by?: string | null; role?: string };
        Update: { role?: string };
      };
    };
  };
}

// Create Supabase client for client-side usage
export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Create Supabase client for server-side usage (with service role)
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Singleton for browser client
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabase = () => {
  if (typeof window === 'undefined') {
    // Server-side: always create new client
    return createServerClient();
  }

  // Client-side: use singleton
  if (!browserClient) {
    browserClient = createBrowserClient();
  }
  return browserClient;
};
