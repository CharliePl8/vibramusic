import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking.service';
import { SupabaseService } from './supabase.service';
import { STUDIO_SLOTS } from '../models/booking.model';

interface QueryResult {
  data: unknown;
  error: unknown;
}

// Cadena tipo Postgrest que además es "thenable", para poder hacer await en
// cualquier punto de la cadena (select/eq/order/insert/delete).
function makeQuery(result: QueryResult): any {
  const query: any = {
    select: () => query,
    eq: () => query,
    order: () => query,
    insert: () => query,
    delete: () => query,
    then: (onFulfilled: (value: QueryResult) => unknown) =>
      Promise.resolve(result).then(onFulfilled),
  };
  return query;
}

function createMockClient() {
  return {
    from: vi.fn(),
    rpc: vi.fn(),
  };
}

const row = {
  id: 'b1',
  user_id: 'u1',
  date: '2026-10-01',
  slot: '09:00–12:00',
  service: 'Grabación',
  notes: '',
  created_at: '2026-09-01T10:00:00Z',
};

const input = {
  userId: 'u1',
  date: '2026-10-01',
  slot: STUDIO_SLOTS[0],
  service: 'Grabación' as const,
  notes: '',
};

describe('BookingService', () => {
  let client: ReturnType<typeof createMockClient>;
  let service: BookingService;

  beforeEach(() => {
    client = createMockClient();
    TestBed.configureTestingModule({
      providers: [{ provide: SupabaseService, useValue: { client } }],
    });
    service = TestBed.inject(BookingService);
  });

  it('devuelve las reservas del usuario mapeadas', async () => {
    client.from.mockReturnValue(makeQuery({ data: [row], error: null }));

    const bookings = await service.userBookings('u1');

    expect(bookings).toHaveLength(1);
    expect(bookings[0].service).toBe('Grabación');
    expect(bookings[0].userId).toBe('u1');
    expect(bookings[0].createdAt).toBe(new Date(row.created_at).getTime());
  });

  it('devuelve una lista vacía si hay error', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: { message: 'boom' } }));

    expect(await service.userBookings('u1')).toEqual([]);
  });

  it('consulta las franjas ocupadas de una fecha', async () => {
    client.rpc.mockResolvedValue({
      data: [{ slot: '09:00–12:00' }, { slot: '12:00–15:00' }],
      error: null,
    });

    const slots = await service.takenSlots('2026-10-01');

    expect(client.rpc).toHaveBeenCalledWith('get_booked_slots', { p_date: '2026-10-01' });
    expect(slots).toEqual(['09:00–12:00', '12:00–15:00']);
  });

  it('crea una reserva', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: null }));

    expect(await service.create(input)).toBe('created');
  });

  it('detecta conflicto cuando la franja ya está ocupada', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: { code: '23505' } }));

    expect(await service.create(input)).toBe('conflict');
  });

  it('devuelve error ante un fallo inesperado', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: { code: '42501' } }));

    expect(await service.create(input)).toBe('error');
  });

  it('cancela una reserva', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: null }));

    expect(await service.cancel('b1')).toBe(true);
  });

  it('informa si la cancelación falla', async () => {
    client.from.mockReturnValue(makeQuery({ data: null, error: { message: 'boom' } }));

    expect(await service.cancel('b1')).toBe(false);
  });
});
