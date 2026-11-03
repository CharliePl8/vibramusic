import { TestBed } from '@angular/core/testing';
import { AdminService } from './admin.service';
import { SupabaseService } from './supabase.service';

interface QueryResult {
  data: unknown;
  error: unknown;
  count?: number | null;
}

function makeQuery(result: QueryResult): any {
  const query: any = {
    select: () => query,
    eq: () => query,
    in: () => query,
    gte: () => query,
    order: () => query,
    range: () => query,
    update: () => query,
    delete: () => query,
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

const bookingRow = {
  id: 'b1',
  user_id: 'u1',
  date: '2026-10-01',
  slot: '09:00–12:00',
  service: 'Grabación',
  notes: '',
  created_at: '2026-09-01T10:00:00Z',
};

const messageRow = {
  id: 'm1',
  user_id: null,
  name: 'Ana',
  email: 'ana@example.com',
  message: 'Hola',
  read: false,
  created_at: '2026-09-01T10:00:00Z',
};

describe('AdminService', () => {
  let client: ReturnType<typeof createMockClient>;
  let service: AdminService;

  beforeEach(() => {
    client = createMockClient();
    TestBed.configureTestingModule({
      providers: [{ provide: SupabaseService, useValue: { client } }],
    });
    service = TestBed.inject(AdminService);
  });

  it('devuelve las reservas con los datos del alumno y el total', async () => {
    client.from.mockImplementation((table: string) =>
      table === 'profiles'
        ? makeQuery({ data: [{ id: 'u1', name: 'Ana', email: 'ana@example.com' }], error: null })
        : makeQuery({ data: [bookingRow], error: null, count: 1 }),
    );

    const { rows, total } = await service.bookings();

    expect(rows).toHaveLength(1);
    expect(rows[0].studentName).toBe('Ana');
    expect(rows[0].studentEmail).toBe('ana@example.com');
    expect(total).toBe(1);
  });

  it('devuelve una página vacía de reservas si hay error', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: { message: 'boom' } }));

    expect(await service.bookings()).toEqual({ rows: [], total: 0 });
  });

  it('devuelve una página de mensajes con el total', async () => {
    client.from.mockReturnValue(makeQuery({ data: [messageRow], error: null, count: 7 }));

    const { rows, total } = await service.messages();

    expect(rows).toHaveLength(1);
    expect(rows[0].read).toBe(false);
    expect(total).toBe(7);
  });

  it('cuenta los mensajes sin leer', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: null, count: 3 }));

    expect(await service.unreadMessages()).toBe(3);
  });

  it('devuelve 0 sin leer si la consulta falla', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: { message: 'boom' } }));

    expect(await service.unreadMessages()).toBe(0);
  });

  it('marca un mensaje como leído', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: null }));

    expect(await service.setMessageRead('m1', true)).toBe(true);
  });

  it('elimina un mensaje', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: null }));

    expect(await service.deleteMessage('m1')).toBe(true);
  });

  it('informa si el borrado del mensaje falla', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: { message: 'boom' } }));

    expect(await service.deleteMessage('m1')).toBe(false);
  });
});
