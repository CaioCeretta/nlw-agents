import { pgTable, text, timestamp, uuid, vector } from 'drizzle-orm/pg-core';
import { rooms } from './rooms.ts';

export const audioChunks = pgTable('audio_chunks', {
  id: uuid().primaryKey().defaultRandom(),
  roomId: uuid()
    .references(() => rooms.id)
    .notNull(),
  transcription: text().notNull(),
  embeddings: vector({ dimensions: 768 }).notNull(),
  cratedAt: timestamp().defaultNow().notNull(),
});

// [ 1, 2, 3, 4, 5, 6, ... ] 768 dimensions mean 768 of values that represent characteristics of the given element
