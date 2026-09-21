import { TestBed } from '@angular/core/testing';
import { MessagesService } from './messages.service';
import { SupabaseService } from './supabase.service';

interface QueryResult {
  data: unknown;
  error: unknown;
}

function makeQuery(result: QueryResult): any {
  const query: any = {
    select: () => query,
    eq: () => query,
    ilike: () => query,
    or: () => query,
    order: () => query,
    insert: () => query,
    then: (onFulfilled: (value: QueryResult) => unknown) =>
      Promise.resolve(result).then(onFulfilled),
  };
  return query;
}

function createMockClient() {
  return {
    from: vi.fn(),
  };
}

const row = {
  id: 'm1',
  user_id: 'u1',
  name: 'Ana',
  email: 'ana@example.com',
  message: 'Hola',
  read: false,
  created_at: '2026-09-01T10:00:00Z',
};

describe('MessagesService', () => {
  let client: ReturnType<typeof createMockClient>;
  let service: MessagesService;

  beforeEach(() => {
    client = createMockClient();
    TestBed.configureTestingModule({
      providers: [{ provide: SupabaseService, useValue: { client } }],
    });
    service = TestBed.inject(MessagesService);
  });

  it('devuelve los mensajes del usuario mapeados', async () => {
    client.from.mockReturnValue(makeQuery({ data: [row], error: null }));

    const messages = await service.userMessages('ana@example.com', 'u1');

    expect(messages).toHaveLength(1);
    expect(messages[0].message).toBe('Hola');
    expect(messages[0].read).toBe(false);
    expect(messages[0].createdAt).toBe(new Date(row.created_at).getTime());
  });

  it('devuelve una lista vacía si hay error', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: { message: 'boom' } }));

    expect(await service.userMessages('ana@example.com')).toEqual([]);
  });

  it('crea un mensaje', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: null }));

    const ok = await service.create({
      name: 'Ana',
      email: 'ana@example.com',
      message: 'Hola',
      userId: 'u1',
    });

    expect(ok).toBe(true);
  });

  it('informa si el envío falla', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: { message: 'boom' } }));

    const ok = await service.create({ name: 'Ana', email: 'ana@example.com', message: 'Hola' });

    expect(ok).toBe(false);
  });
});
