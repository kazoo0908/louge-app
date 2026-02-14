-- Supabaseダッシュボードの SQL Editor で実行してください

-- 1. プロファイルテーブル
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT FALSE
);

-- RLS (Row Level Security) 有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のプロファイルのみアクセス可能
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 2. 対話セッションテーブル
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  messages JSONB NOT NULL,
  context_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" 
  ON conversations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" 
  ON conversations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" 
  ON conversations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" 
  ON conversations FOR DELETE 
  USING (auth.uid() = user_id);

-- 3. ナラティブ（物語）テーブル
CREATE TABLE narratives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  story_text TEXT NOT NULL,
  emotion_scores JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE narratives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own narratives" 
  ON narratives FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own narratives" 
  ON narratives FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own narratives" 
  ON narratives FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own narratives" 
  ON narratives FOR DELETE 
  USING (auth.uid() = user_id);

-- 4. 価値観タグテーブル
CREATE TABLE value_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tag_name TEXT NOT NULL,
  first_appeared DATE NOT NULL,
  frequency INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tag_name)
);

ALTER TABLE value_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tags" 
  ON value_tags FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags" 
  ON value_tags FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" 
  ON value_tags FOR UPDATE 
  USING (auth.uid() = user_id);

-- 5. ナラティブ-タグ関連テーブル
CREATE TABLE narrative_tags (
  narrative_id UUID REFERENCES narratives(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES value_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (narrative_id, tag_id)
);

ALTER TABLE narrative_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own narrative tags" 
  ON narrative_tags FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM narratives 
      WHERE narratives.id = narrative_tags.narrative_id 
      AND narratives.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own narrative tags" 
  ON narrative_tags FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM narratives 
      WHERE narratives.id = narrative_tags.narrative_id 
      AND narratives.user_id = auth.uid()
    )
  );

-- インデックス作成（パフォーマンス最適化）
CREATE INDEX idx_conversations_user_date ON conversations(user_id, date DESC);
CREATE INDEX idx_narratives_user_date ON narratives(user_id, date DESC);
CREATE INDEX idx_value_tags_user ON value_tags(user_id, frequency DESC);

-- 新規ユーザー登録時に自動的にプロファイルを作成するトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
