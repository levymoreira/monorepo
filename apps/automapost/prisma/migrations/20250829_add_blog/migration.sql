-- Enable required extension for UUID generation (pgcrypto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum for locales
DO $$ BEGIN
  CREATE TYPE "Locale" AS ENUM ('en','es','pt','br','fr');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create blog tables
CREATE TABLE IF NOT EXISTS "blog_posts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "blog_post_translations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "postId" UUID NOT NULL,
  "locale" "Locale" NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT,
  "content" TEXT NOT NULL,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "blog_post_translations_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "blog_post_translations_postId_locale_key" UNIQUE ("postId", "locale"),
  CONSTRAINT "blog_post_translations_locale_slug_key" UNIQUE ("locale", "slug")
);

CREATE INDEX IF NOT EXISTS "blog_post_translations_locale_slug_idx" ON "blog_post_translations" ("locale", "slug");

-- Seed example post
DO $$
DECLARE
  v_post_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO "blog_posts" ("id", "isPublished", "publishedAt")
  VALUES (v_post_id, true, NOW())
  ON CONFLICT ("id") DO NOTHING;

  -- English
  INSERT INTO "blog_post_translations" ("postId", "locale", "title", "slug", "excerpt", "content", "metaTitle", "metaDescription")
  VALUES (
    v_post_id, 'en',
    'How AutomaPost Boosts Your LinkedIn Engagement with AI',
    'ai-linkedin-engagement',
    'Discover how to write better posts faster and grow your audience with AI.',
    '<h2>Grow faster on LinkedIn</h2><p>AutomaPost helps you create consistent, on-brand content in minutes and schedule it for the best times.</p><p>In this article, we show practical tips to boost engagement, from crafting hooks to analyzing performance.</p>',
    'How AutomaPost Boosts Your LinkedIn Engagement with AI',
    'Learn practical ways to increase your LinkedIn engagement using AutomaPost''s AI.'
  ) ON CONFLICT ("postId", "locale") DO NOTHING;

  -- Spanish
  INSERT INTO "blog_post_translations" ("postId", "locale", "title", "slug", "excerpt", "content", "metaTitle", "metaDescription")
  VALUES (
    v_post_id, 'es',
    'Cómo AutomaPost impulsa tu engagement en LinkedIn con IA',
    'engagement-linkedin-ia',
    'Descubre cómo crear mejores publicaciones más rápido y hacer crecer tu audiencia con IA.',
    '<h2>Crece más rápido en LinkedIn</h2><p>AutomaPost te ayuda a crear contenido constante y profesional en minutos y a programarlo en los mejores horarios.</p><p>En este artículo verás consejos prácticos para aumentar el engagement.</p>',
    'Aumenta tu engagement en LinkedIn con AutomaPost',
    'Consejos prácticos para subir tu engagement en LinkedIn con la ayuda de AutomaPost.'
  ) ON CONFLICT ("postId", "locale") DO NOTHING;

  -- Portuguese (Portugal)
  INSERT INTO "blog_post_translations" ("postId", "locale", "title", "slug", "excerpt", "content", "metaTitle", "metaDescription")
  VALUES (
    v_post_id, 'pt',
    'Como o AutomaPost aumenta o seu engagement no LinkedIn com IA',
    'engagement-linkedin-ia',
    'Saiba como escrever melhores publicações mais rápido e crescer a sua audiência com IA.',
    '<h2>Cresça mais rápido no LinkedIn</h2><p>O AutomaPost ajuda a crear conteúdo consistente e alinhado com a sua marca em minutos e a agendar nas melhores horas.</p><p>Neste artigo mostramos dicas práticas para aumentar o engagement.</p>',
    'Aumente o engagement no LinkedIn com AutomaPost',
    'Dicas práticas para aumentar o engagement no LinkedIn com a IA do AutomaPost.'
  ) ON CONFLICT ("postId", "locale") DO NOTHING;

  -- Portuguese (Brazil)
  INSERT INTO "blog_post_translations" ("postId", "locale", "title", "slug", "excerpt", "content", "metaTitle", "metaDescription")
  VALUES (
    v_post_id, 'br',
    'Como o AutomaPost aumenta seu engajamento no LinkedIn com IA',
    'engajamento-linkedin-ia',
    'Descubra como criar publicações melhores mais rápido e crescer sua audiência com IA.',
    '<h2>Cresça mais rápido no LinkedIn</h2><p>O AutomaPost ajuda você a criar conteúdo consistente e no seu tom em minutos e agendar nos melhores horários.</p><p>Neste artigo, mostramos dicas práticas para aumentar o engajamento.</p>',
    'Aumente seu engajamento no LinkedIn com AutomaPost',
    'Maneiras práticas de aumentar seu engajamento no LinkedIn usando AutomaPost.'
  ) ON CONFLICT ("postId", "locale") DO NOTHING;

  -- French
  INSERT INTO "blog_post_translations" ("postId", "locale", "title", "slug", "excerpt", "content", "metaTitle", "metaDescription")
  VALUES (
    v_post_id, 'fr',
    'Comment AutomaPost booste votre engagement LinkedIn avec l''IA',
    'engagement-linkedin-ia',
    'Découvrez comment écrire de meilleurs posts plus rapidement et développer votre audience grâce à l''IA.',
    '<h2>Accélérez votre croissance sur LinkedIn</h2><p>AutomaPost vous aide à créer du contenu cohérent et percutant en quelques minutes et à le programmer aux meilleurs moments.</p><p>Dans cet article, nous présentons des conseils concrets pour augmenter l''engagement.</p>',
    'Boostez votre engagement LinkedIn avec AutomaPost',
    'Des conseils pratiques pour augmenter votre engagement LinkedIn avec l''aide d''AutomaPost.'
  ) ON CONFLICT ("postId", "locale") DO NOTHING;
END $$;


