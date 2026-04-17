-- Criado automaticamente no primeiro `docker compose up`
-- Banco separado para a Evolution API (Prisma não tolera banco com tabelas existentes)
SELECT 'CREATE DATABASE evolution_development'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'evolution_development')\gexec
