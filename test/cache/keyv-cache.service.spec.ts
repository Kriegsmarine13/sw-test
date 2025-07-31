import { KeyvCacheService } from '../../src/cache/keyv-cache.service';

describe('KeyvCacheService', () => {
  let cache: KeyvCacheService;

  beforeEach(() => {
    // При создании без REDIS_URI он использует внутренний Map (in-memory)
    process.env.REDIS_HOST = ''; // чтобы не подключался к реальному redis
    cache = new KeyvCacheService();
  });

  it('set/get works and returns stored value', async () => {
    const key = 'test:key1';
    const payload = { a: 1, b: 'two' };
    await cache.set(key, payload, 2); // TTL 2 секунды
    const got = await cache.get<typeof payload>(key);
    expect(got).toEqual(payload);
  });

  it('expires after TTL', async () => {
    jest.useFakeTimers();
    const key = 'test:key-expire';
    await cache.set(key, 'value', 1); // 1 сек
    let got = await cache.get<string>(key);
    expect(got).toBe('value');

    // продвинуть время на 2 секунды
    jest.advanceTimersByTime(2000);
    got = await cache.get<string>(key);
    expect(got).toBeUndefined();
    jest.useRealTimers();
  });

  it('delete removes key', async () => {
    const key = 'test:del';
    await cache.set(key, 123);
    expect(await cache.get<number>(key)).toBe(123);
    await cache.delete(key);
    expect(await cache.get<number>(key)).toBeUndefined();
  });

  it('clear wipes everything', async () => {
    await cache.set('k1', 'v1');
    await cache.set('k2', 'v2');
    expect(await cache.get('k1')).toBe('v1');
    expect(await cache.get('k2')).toBe('v2');
    await cache.clear();
    expect(await cache.get('k1')).toBeUndefined();
    expect(await cache.get('k2')).toBeUndefined();
  });
});
