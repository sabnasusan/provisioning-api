import {
  IIdempotencyStore,
  IdempotencyEntry,
} from '../../application/services/IdempotencyService';

export class InMemoryIdempotencyStore implements IIdempotencyStore {
  private readonly storage = new Map<string, IdempotencyEntry>();

  async get(key: string): Promise<IdempotencyEntry | null> {
    return this.storage.get(key) || null;
  }

  async set(key: string, entry: IdempotencyEntry): Promise<void> {
    this.storage.set(key, entry);
  }

  clear(): void {
    this.storage.clear();
  }
}
