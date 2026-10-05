// Generates a disposable test entrypoint using admitics-ai's EXISTING
// composition seams and local fixture adapters. It is never a production Worker.
import { join } from "node:path";

export function composedWorkerSource(backend) {
  const importPath = (path) => JSON.stringify(join(backend, path));
  return `
import { createApi } from ${importPath("src/api/router.ts")};
import { createRepositories } from ${importPath("src/db/client.ts")};
import { createDocumentRuntime } from ${importPath("src/documents/runtime.ts")};
import { R2DocumentStorage } from ${importPath("src/documents/adapters/r2.ts")};
import { createDocumentPolicy } from ${importPath("src/documents/policy.ts")};
import { InlineDocumentIngestionQueue } from ${importPath("src/queue/index.ts")};
import { DeterministicFakeEmbeddingProvider } from ${importPath("src/rag/embeddings/index.ts")};
import { InMemoryVectorStore } from ${importPath("src/rag/vector-store.ts")};
import { createInMemoryKnowledgeRepository } from ${importPath("src/rag/repository.ts")};
import { createRetriever } from ${importPath("src/rag/retrieval/index.ts")};
import { sha256Text } from ${importPath("src/rag/validation.ts")};
export { DocumentWorkflow } from ${importPath("apps/worker/src/index.ts")};

let app;
async function compose(env) {
  const fake = new DeterministicFakeEmbeddingProvider(16);
  let failedOnce = false;
  const embeddings = {
    metadata: fake.metadata, embed: fake.embed.bind(fake),
    async embedBatch(texts, signal) {
      if (texts.some(text => text.includes("transient-fixture")) && !failedOnce) {
        failedOnce = true; throw new Error("fixture-only embedding outage");
      }
      return fake.embedBatch(texts, signal);
    },
  };
  const vectors = new InMemoryVectorStore();
  let documents;
  const queue = new InlineDocumentIngestionQueue(async (job, signal) => {
    await documents.ingestion.ingest({ id: job.scope.ownerId, role: "user" }, job.documentId, signal);
  });
  documents = createDocumentRuntime({
    repository: createRepositories(env).documents,
    storage: new R2DocumentStorage(env.DOCUMENTS_BUCKET, createDocumentPolicy()),
    embeddings, vectors, queue,
  });
  const now = Math.floor(Date.now() / 1000);
  const text = "Synthetic local source contract fixture, not admissions advice.";
  const hash = await sha256Text(text);
  const scope = { kind: "global" };
  const source = { id: "fixture-source", scope, title: "Local source fixture", type: "web",
    canonicalUrl: "https://example.test/local-fixture", publisher: "Local acceptance fixture",
    trust: "official", verification: { status: "verified", verifiedAt: now - 60, reviewAfter: now + 3600 }, createdAt: now - 60, updatedAt: now - 60 };
  const document = { id: "fixture-document", sourceId: source.id, scope, title: source.title,
    canonicalUrl: source.canonicalUrl, contentHash: hash, version: "fixture-v1", ingestionStatus: "ready",
    characterCount: text.length, createdAt: now - 60, updatedAt: now - 60 };
  const chunk = { id: "fixture-chunk", sourceId: source.id, scope, documentId: document.id, documentVersion: document.version,
    index: 0, text, contentHash: hash, startChar: 0, endChar: text.length, characterCount: text.length, tokenCount: null };
  const repository = await createInMemoryKnowledgeRepository({ sources: [source], documents: [document], chunks: [chunk] });
  await vectors.upsert([{ id: chunk.id, scope, values: await fake.embed(text), embedding: fake.metadata,
    sourceId: source.id, documentId: document.id, documentVersion: document.version, chunkHash: hash }]);
  return createApi({ documents, knowledge: { retriever: createRetriever({ repository, embeddings: fake, vectors }) } });
}
export default { async fetch(request, env, context) {
  app ??= compose(env);
  return (await app).fetch(request, env, context);
} };
`;
}
