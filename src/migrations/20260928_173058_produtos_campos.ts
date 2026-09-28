import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_culturas_filtro" AS ENUM('cul-soja', 'cul-milho', 'cul-cafe', 'cul-cana', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata', 'cul-pastagem');
  CREATE TYPE "public"."enum_products_embalagens" AS ENUM('1L', '10L', '20L');
  CREATE TYPE "public"."enum_products_problemas_icone" AS ENUM('seed', 'sun', 'drop', 'leaf', 'shield', 'chart');
  CREATE TYPE "public"."enum_products_categoria" AS ENUM('cat-tratamento', 'cat-nutricao', 'cat-protecao', 'cat-aplicacao', 'cat-manejo');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_culturas_filtro" AS ENUM('cul-soja', 'cul-milho', 'cul-cafe', 'cul-cana', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata', 'cul-pastagem');
  CREATE TYPE "public"."enum__products_v_version_embalagens" AS ENUM('1L', '10L', '20L');
  CREATE TYPE "public"."enum__products_v_version_problemas_icone" AS ENUM('seed', 'sun', 'drop', 'leaf', 'shield', 'chart');
  CREATE TYPE "public"."enum__products_v_version_tamanhos" AS ENUM('1l', '10l', '20l');
  CREATE TYPE "public"."enum__products_v_version_categoria" AS ENUM('cat-tratamento', 'cat-nutricao', 'cat-protecao', 'cat-aplicacao', 'cat-manejo');
  CREATE TYPE "public"."enum__products_v_version_linha" AS ENUM('arranque-inicial', 'nutricao-fisiologia', 'protecao-cultivos', 'tecnologia-aplicacao', 'manejos-integrados');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_published_locale" AS ENUM('pt-BR', 'en', 'es');
  CREATE TABLE "products_culturas_filtro" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_culturas_filtro",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_embalagens" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_embalagens",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_grupos_culturas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_grupos_culturas_locales" (
  	"rotulo" varchar,
  	"culturas" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_problemas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icone" "enum_products_problemas_icone" DEFAULT 'leaf'
  );
  
  CREATE TABLE "products_problemas_locales" (
  	"titulo" varchar,
  	"descricao" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_lista_beneficios" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_lista_beneficios_locales" (
  	"titulo" varchar,
  	"descricao" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_aplicacoes_linhas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_aplicacoes_linhas_locales" (
  	"cultura" varchar,
  	"quando" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_aplicacoes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_aplicacoes_locales" (
  	"rotulo" varchar,
  	"nota" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_lista_resultados" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_lista_resultados_locales" (
  	"valor" varchar,
  	"unidade" varchar,
  	"descricao" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_relacionados" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"produto_id" integer
  );
  
  CREATE TABLE "products_relacionados_locales" (
  	"tag" varchar,
  	"descricao" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_products_v_version_culturas_filtro" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_culturas_filtro",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v_version_embalagens" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_embalagens",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v_version_grupos_culturas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_grupos_culturas_locales" (
  	"rotulo" varchar,
  	"culturas" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_version_problemas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icone" "enum__products_v_version_problemas_icone" DEFAULT 'leaf',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_problemas_locales" (
  	"titulo" varchar,
  	"descricao" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_version_lista_beneficios" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_lista_beneficios_locales" (
  	"titulo" varchar,
  	"descricao" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_version_aplicacoes_linhas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_aplicacoes_linhas_locales" (
  	"cultura" varchar,
  	"quando" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_version_aplicacoes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_aplicacoes_locales" (
  	"rotulo" varchar,
  	"nota" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_version_lista_resultados" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_lista_resultados_locales" (
  	"valor" varchar,
  	"unidade" varchar,
  	"descricao" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_version_relacionados" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"produto_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_relacionados_locales" (
  	"tag" varchar,
  	"descricao" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_version_tamanhos" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_tamanhos",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v_version_beneficios" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"texto" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_resultados" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"valor" varchar,
  	"fonte" varchar,
  	"cultura" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_categoria" "enum__products_v_version_categoria",
  	"version_cor_rotulo" varchar,
  	"version_cor_card" varchar,
  	"version_ordem" numeric DEFAULT 100,
  	"version_frasco_id" integer,
  	"version_linha" "enum__products_v_version_linha",
  	"version_cor_fundo" varchar,
  	"version_texto_claro" boolean DEFAULT true,
  	"version_ordem_catalogo" numeric,
  	"version_destaque_home" boolean,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__products_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_products_v_locales" (
  	"version_nome" varchar,
  	"version_tag" varchar,
  	"version_descricao" varchar,
  	"version_culturas_rotulo" varchar,
  	"version_nota_culturas" varchar,
  	"version_nota_aplicacoes" varchar,
  	"version_tag_catalogo" varchar,
  	"version_resumo_catalogo" varchar,
  	"version_descricao_curta" varchar,
  	"version_descricao_completa" jsonb,
  	"version_modo_uso" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"cultures_id" integer
  );
  
  ALTER TABLE "products" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "products" ALTER COLUMN "linha" DROP NOT NULL;
  ALTER TABLE "products_locales" ALTER COLUMN "nome" DROP NOT NULL;
  ALTER TABLE "products" ADD COLUMN "categoria" "enum_products_categoria";
  ALTER TABLE "products" ADD COLUMN "cor_rotulo" varchar;
  ALTER TABLE "products" ADD COLUMN "cor_card" varchar;
  ALTER TABLE "products" ADD COLUMN "ordem" numeric DEFAULT 100;
  ALTER TABLE "products" ADD COLUMN "frasco_id" integer;
  ALTER TABLE "products" ADD COLUMN "_status" "enum_products_status" DEFAULT 'draft';
  ALTER TABLE "products_locales" ADD COLUMN "tag" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "descricao" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "culturas_rotulo" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "nota_culturas" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "nota_aplicacoes" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "tag_catalogo" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "resumo_catalogo" varchar;
  ALTER TABLE "products_culturas_filtro" ADD CONSTRAINT "products_culturas_filtro_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_embalagens" ADD CONSTRAINT "products_embalagens_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_grupos_culturas" ADD CONSTRAINT "products_grupos_culturas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_grupos_culturas_locales" ADD CONSTRAINT "products_grupos_culturas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_grupos_culturas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_problemas" ADD CONSTRAINT "products_problemas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_problemas_locales" ADD CONSTRAINT "products_problemas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_problemas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_lista_beneficios" ADD CONSTRAINT "products_lista_beneficios_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_lista_beneficios_locales" ADD CONSTRAINT "products_lista_beneficios_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_lista_beneficios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_aplicacoes_linhas" ADD CONSTRAINT "products_aplicacoes_linhas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_aplicacoes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_aplicacoes_linhas_locales" ADD CONSTRAINT "products_aplicacoes_linhas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_aplicacoes_linhas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_aplicacoes" ADD CONSTRAINT "products_aplicacoes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_aplicacoes_locales" ADD CONSTRAINT "products_aplicacoes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_aplicacoes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_lista_resultados" ADD CONSTRAINT "products_lista_resultados_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_lista_resultados_locales" ADD CONSTRAINT "products_lista_resultados_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_lista_resultados"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_relacionados" ADD CONSTRAINT "products_relacionados_produto_id_products_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_relacionados" ADD CONSTRAINT "products_relacionados_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_relacionados_locales" ADD CONSTRAINT "products_relacionados_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_relacionados"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_culturas_filtro" ADD CONSTRAINT "_products_v_version_culturas_filtro_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_embalagens" ADD CONSTRAINT "_products_v_version_embalagens_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_grupos_culturas" ADD CONSTRAINT "_products_v_version_grupos_culturas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_grupos_culturas_locales" ADD CONSTRAINT "_products_v_version_grupos_culturas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_grupos_culturas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_problemas" ADD CONSTRAINT "_products_v_version_problemas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_problemas_locales" ADD CONSTRAINT "_products_v_version_problemas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_problemas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_lista_beneficios" ADD CONSTRAINT "_products_v_version_lista_beneficios_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_lista_beneficios_locales" ADD CONSTRAINT "_products_v_version_lista_beneficios_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_lista_beneficios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_aplicacoes_linhas" ADD CONSTRAINT "_products_v_version_aplicacoes_linhas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_aplicacoes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_aplicacoes_linhas_locales" ADD CONSTRAINT "_products_v_version_aplicacoes_linhas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_aplicacoes_linhas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_aplicacoes" ADD CONSTRAINT "_products_v_version_aplicacoes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_aplicacoes_locales" ADD CONSTRAINT "_products_v_version_aplicacoes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_aplicacoes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_lista_resultados" ADD CONSTRAINT "_products_v_version_lista_resultados_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_lista_resultados_locales" ADD CONSTRAINT "_products_v_version_lista_resultados_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_lista_resultados"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_relacionados" ADD CONSTRAINT "_products_v_version_relacionados_produto_id_products_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_relacionados" ADD CONSTRAINT "_products_v_version_relacionados_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_relacionados_locales" ADD CONSTRAINT "_products_v_version_relacionados_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_relacionados"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_tamanhos" ADD CONSTRAINT "_products_v_version_tamanhos_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_beneficios" ADD CONSTRAINT "_products_v_version_beneficios_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_resultados" ADD CONSTRAINT "_products_v_version_resultados_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_frasco_id_media_id_fk" FOREIGN KEY ("version_frasco_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_locales" ADD CONSTRAINT "_products_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_cultures_fk" FOREIGN KEY ("cultures_id") REFERENCES "public"."cultures"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_culturas_filtro_order_idx" ON "products_culturas_filtro" USING btree ("order");
  CREATE INDEX "products_culturas_filtro_parent_idx" ON "products_culturas_filtro" USING btree ("parent_id");
  CREATE INDEX "products_embalagens_order_idx" ON "products_embalagens" USING btree ("order");
  CREATE INDEX "products_embalagens_parent_idx" ON "products_embalagens" USING btree ("parent_id");
  CREATE INDEX "products_grupos_culturas_order_idx" ON "products_grupos_culturas" USING btree ("_order");
  CREATE INDEX "products_grupos_culturas_parent_id_idx" ON "products_grupos_culturas" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_grupos_culturas_locales_locale_parent_id_unique" ON "products_grupos_culturas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_problemas_order_idx" ON "products_problemas" USING btree ("_order");
  CREATE INDEX "products_problemas_parent_id_idx" ON "products_problemas" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_problemas_locales_locale_parent_id_unique" ON "products_problemas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_lista_beneficios_order_idx" ON "products_lista_beneficios" USING btree ("_order");
  CREATE INDEX "products_lista_beneficios_parent_id_idx" ON "products_lista_beneficios" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_lista_beneficios_locales_locale_parent_id_unique" ON "products_lista_beneficios_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_aplicacoes_linhas_order_idx" ON "products_aplicacoes_linhas" USING btree ("_order");
  CREATE INDEX "products_aplicacoes_linhas_parent_id_idx" ON "products_aplicacoes_linhas" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_aplicacoes_linhas_locales_locale_parent_id_unique" ON "products_aplicacoes_linhas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_aplicacoes_order_idx" ON "products_aplicacoes" USING btree ("_order");
  CREATE INDEX "products_aplicacoes_parent_id_idx" ON "products_aplicacoes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_aplicacoes_locales_locale_parent_id_unique" ON "products_aplicacoes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_lista_resultados_order_idx" ON "products_lista_resultados" USING btree ("_order");
  CREATE INDEX "products_lista_resultados_parent_id_idx" ON "products_lista_resultados" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_lista_resultados_locales_locale_parent_id_unique" ON "products_lista_resultados_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_relacionados_order_idx" ON "products_relacionados" USING btree ("_order");
  CREATE INDEX "products_relacionados_parent_id_idx" ON "products_relacionados" USING btree ("_parent_id");
  CREATE INDEX "products_relacionados_produto_idx" ON "products_relacionados" USING btree ("produto_id");
  CREATE UNIQUE INDEX "products_relacionados_locales_locale_parent_id_unique" ON "products_relacionados_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_culturas_filtro_order_idx" ON "_products_v_version_culturas_filtro" USING btree ("order");
  CREATE INDEX "_products_v_version_culturas_filtro_parent_idx" ON "_products_v_version_culturas_filtro" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_embalagens_order_idx" ON "_products_v_version_embalagens" USING btree ("order");
  CREATE INDEX "_products_v_version_embalagens_parent_idx" ON "_products_v_version_embalagens" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_grupos_culturas_order_idx" ON "_products_v_version_grupos_culturas" USING btree ("_order");
  CREATE INDEX "_products_v_version_grupos_culturas_parent_id_idx" ON "_products_v_version_grupos_culturas" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_products_v_version_grupos_culturas_locales_locale_parent_id" ON "_products_v_version_grupos_culturas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_problemas_order_idx" ON "_products_v_version_problemas" USING btree ("_order");
  CREATE INDEX "_products_v_version_problemas_parent_id_idx" ON "_products_v_version_problemas" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_products_v_version_problemas_locales_locale_parent_id_uniqu" ON "_products_v_version_problemas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_lista_beneficios_order_idx" ON "_products_v_version_lista_beneficios" USING btree ("_order");
  CREATE INDEX "_products_v_version_lista_beneficios_parent_id_idx" ON "_products_v_version_lista_beneficios" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_products_v_version_lista_beneficios_locales_locale_parent_i" ON "_products_v_version_lista_beneficios_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_aplicacoes_linhas_order_idx" ON "_products_v_version_aplicacoes_linhas" USING btree ("_order");
  CREATE INDEX "_products_v_version_aplicacoes_linhas_parent_id_idx" ON "_products_v_version_aplicacoes_linhas" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_products_v_version_aplicacoes_linhas_locales_locale_parent_" ON "_products_v_version_aplicacoes_linhas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_aplicacoes_order_idx" ON "_products_v_version_aplicacoes" USING btree ("_order");
  CREATE INDEX "_products_v_version_aplicacoes_parent_id_idx" ON "_products_v_version_aplicacoes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_products_v_version_aplicacoes_locales_locale_parent_id_uniq" ON "_products_v_version_aplicacoes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_lista_resultados_order_idx" ON "_products_v_version_lista_resultados" USING btree ("_order");
  CREATE INDEX "_products_v_version_lista_resultados_parent_id_idx" ON "_products_v_version_lista_resultados" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_products_v_version_lista_resultados_locales_locale_parent_i" ON "_products_v_version_lista_resultados_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_relacionados_order_idx" ON "_products_v_version_relacionados" USING btree ("_order");
  CREATE INDEX "_products_v_version_relacionados_parent_id_idx" ON "_products_v_version_relacionados" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_relacionados_produto_idx" ON "_products_v_version_relacionados" USING btree ("produto_id");
  CREATE UNIQUE INDEX "_products_v_version_relacionados_locales_locale_parent_id_un" ON "_products_v_version_relacionados_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_tamanhos_order_idx" ON "_products_v_version_tamanhos" USING btree ("order");
  CREATE INDEX "_products_v_version_tamanhos_parent_idx" ON "_products_v_version_tamanhos" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_beneficios_order_idx" ON "_products_v_version_beneficios" USING btree ("_order");
  CREATE INDEX "_products_v_version_beneficios_parent_id_idx" ON "_products_v_version_beneficios" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_beneficios_locale_idx" ON "_products_v_version_beneficios" USING btree ("_locale");
  CREATE INDEX "_products_v_version_resultados_order_idx" ON "_products_v_version_resultados" USING btree ("_order");
  CREATE INDEX "_products_v_version_resultados_parent_id_idx" ON "_products_v_version_resultados" USING btree ("_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_frasco_idx" ON "_products_v" USING btree ("version_frasco_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_snapshot_idx" ON "_products_v" USING btree ("snapshot");
  CREATE INDEX "_products_v_published_locale_idx" ON "_products_v" USING btree ("published_locale");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_autosave_idx" ON "_products_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_products_v_locales_locale_parent_id_unique" ON "_products_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_media_id_idx" ON "_products_v_rels" USING btree ("media_id");
  CREATE INDEX "_products_v_rels_cultures_id_idx" ON "_products_v_rels" USING btree ("cultures_id");
  ALTER TABLE "products" ADD CONSTRAINT "products_frasco_id_media_id_fk" FOREIGN KEY ("frasco_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_frasco_idx" ON "products" USING btree ("frasco_id");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_culturas_filtro" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_embalagens" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_grupos_culturas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_grupos_culturas_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_problemas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_problemas_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_lista_beneficios" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_lista_beneficios_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_aplicacoes_linhas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_aplicacoes_linhas_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_aplicacoes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_aplicacoes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_lista_resultados" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_lista_resultados_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_relacionados" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_relacionados_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_culturas_filtro" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_embalagens" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_grupos_culturas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_grupos_culturas_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_problemas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_problemas_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_lista_beneficios" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_lista_beneficios_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_aplicacoes_linhas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_aplicacoes_linhas_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_aplicacoes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_aplicacoes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_lista_resultados" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_lista_resultados_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_relacionados" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_relacionados_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_tamanhos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_beneficios" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_resultados" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_culturas_filtro" CASCADE;
  DROP TABLE "products_embalagens" CASCADE;
  DROP TABLE "products_grupos_culturas" CASCADE;
  DROP TABLE "products_grupos_culturas_locales" CASCADE;
  DROP TABLE "products_problemas" CASCADE;
  DROP TABLE "products_problemas_locales" CASCADE;
  DROP TABLE "products_lista_beneficios" CASCADE;
  DROP TABLE "products_lista_beneficios_locales" CASCADE;
  DROP TABLE "products_aplicacoes_linhas" CASCADE;
  DROP TABLE "products_aplicacoes_linhas_locales" CASCADE;
  DROP TABLE "products_aplicacoes" CASCADE;
  DROP TABLE "products_aplicacoes_locales" CASCADE;
  DROP TABLE "products_lista_resultados" CASCADE;
  DROP TABLE "products_lista_resultados_locales" CASCADE;
  DROP TABLE "products_relacionados" CASCADE;
  DROP TABLE "products_relacionados_locales" CASCADE;
  DROP TABLE "_products_v_version_culturas_filtro" CASCADE;
  DROP TABLE "_products_v_version_embalagens" CASCADE;
  DROP TABLE "_products_v_version_grupos_culturas" CASCADE;
  DROP TABLE "_products_v_version_grupos_culturas_locales" CASCADE;
  DROP TABLE "_products_v_version_problemas" CASCADE;
  DROP TABLE "_products_v_version_problemas_locales" CASCADE;
  DROP TABLE "_products_v_version_lista_beneficios" CASCADE;
  DROP TABLE "_products_v_version_lista_beneficios_locales" CASCADE;
  DROP TABLE "_products_v_version_aplicacoes_linhas" CASCADE;
  DROP TABLE "_products_v_version_aplicacoes_linhas_locales" CASCADE;
  DROP TABLE "_products_v_version_aplicacoes" CASCADE;
  DROP TABLE "_products_v_version_aplicacoes_locales" CASCADE;
  DROP TABLE "_products_v_version_lista_resultados" CASCADE;
  DROP TABLE "_products_v_version_lista_resultados_locales" CASCADE;
  DROP TABLE "_products_v_version_relacionados" CASCADE;
  DROP TABLE "_products_v_version_relacionados_locales" CASCADE;
  DROP TABLE "_products_v_version_tamanhos" CASCADE;
  DROP TABLE "_products_v_version_beneficios" CASCADE;
  DROP TABLE "_products_v_version_resultados" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_locales" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  ALTER TABLE "products" DROP CONSTRAINT "products_frasco_id_media_id_fk";
  
  DROP INDEX "products_frasco_idx";
  DROP INDEX "products__status_idx";
  ALTER TABLE "products" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "products" ALTER COLUMN "linha" SET NOT NULL;
  ALTER TABLE "products_locales" ALTER COLUMN "nome" SET NOT NULL;
  ALTER TABLE "products" DROP COLUMN "categoria";
  ALTER TABLE "products" DROP COLUMN "cor_rotulo";
  ALTER TABLE "products" DROP COLUMN "cor_card";
  ALTER TABLE "products" DROP COLUMN "ordem";
  ALTER TABLE "products" DROP COLUMN "frasco_id";
  ALTER TABLE "products" DROP COLUMN "_status";
  ALTER TABLE "products_locales" DROP COLUMN "tag";
  ALTER TABLE "products_locales" DROP COLUMN "descricao";
  ALTER TABLE "products_locales" DROP COLUMN "culturas_rotulo";
  ALTER TABLE "products_locales" DROP COLUMN "nota_culturas";
  ALTER TABLE "products_locales" DROP COLUMN "nota_aplicacoes";
  ALTER TABLE "products_locales" DROP COLUMN "tag_catalogo";
  ALTER TABLE "products_locales" DROP COLUMN "resumo_catalogo";
  DROP TYPE "public"."enum_products_culturas_filtro";
  DROP TYPE "public"."enum_products_embalagens";
  DROP TYPE "public"."enum_products_problemas_icone";
  DROP TYPE "public"."enum_products_categoria";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_culturas_filtro";
  DROP TYPE "public"."enum__products_v_version_embalagens";
  DROP TYPE "public"."enum__products_v_version_problemas_icone";
  DROP TYPE "public"."enum__products_v_version_tamanhos";
  DROP TYPE "public"."enum__products_v_version_categoria";
  DROP TYPE "public"."enum__products_v_version_linha";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum__products_v_published_locale";`)
}
