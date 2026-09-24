import { TestBed } from '@angular/core/testing';
import { AdminService } from './admin.service';
import { SupabaseService } from './supabase.service';

interface QueryResult {
  data: unknown;
  error: unknown;
}

function makeQuery(result: QueryResult): any {
  const query: any = {
    select: () => query,
    eq: () => query,
    in: () => query,
    order: () => query,
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

  it('devuelve las reservas con los datos del alumno', async () => {
    client.from.mockImplementation((table: string) =>
      table === 'profiles'
        ? makeQuery({ data: [{ id: 'u1', name: 'Ana', email: 'ana@example.com' }], error: null })
        : makeQuery({ data: [bookingRow], error: null }),
    );

    const bookings = await service.bookings();

    expect(bookings).toHaveLength(1);
    expect(bookings[0].studentName).toBe('Ana');
    expect(bookings[0].studentEmail).toBe('ana@example.com');
  });

  it('devuelve una lista vacía de reservas si hay error', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: { message: 'boom' } }));

    expect(await service.bookings()).toEqual([]);
  });

  it('devuelve todos los mensajes', async () => {
    client.from.mockReturnValue(makeQuery({ data: [messageRow], error: null }));

    const messages = await service.messages();

    expect(messages).toHaveLength(1);
    expect(messages[0].read).toBe(false);
  });

  it('marca un mensaje como leído', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: null }));

    expect(await service.setMessageRead('m1', true)).toBe(true);
  });
});
