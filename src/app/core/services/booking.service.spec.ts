import { BookingService } from './booking.service';
import { STUDIO_SLOTS } from '../models/booking.model';

const USER_ID = 'u1';
const OTHER_USER_ID = 'u2';
const DATE = '2026-10-01';

function bookingInput(userId: string, date: string, slot: string) {
  return {
    userId,
    date,
    slot: slot as (typeof STUDIO_SLOTS)[number],
    service: 'Grabación' as const,
    notes: '',
  };
}

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(() => {
    localStorage.clear();
    service = new BookingService();
  });

  it('crea una reserva y la persiste', () => {
    const result = service.create(bookingInput(USER_ID, DATE, STUDIO_SLOTS[0]));
    expect(result).toBe('created');
    expect(service.userBookings(USER_ID)).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem('vibra_bookings')!)).toHaveLength(1);
  });

  it('detecta conflicto si la franja ya está ocupada', () => {
    service.create(bookingInput(USER_ID, DATE, STUDIO_SLOTS[0]));
    const result = service.create(bookingInput(OTHER_USER_ID, DATE, STUDIO_SLOTS[0]));
    expect(result).toBe('conflict');
    expect(service.userBookings(OTHER_USER_ID)).toHaveLength(0);
  });

  it('permite la misma fecha en otra franja', () => {
    service.create(bookingInput(USER_ID, DATE, STUDIO_SLOTS[0]));
    expect(service.isAvailable(DATE, STUDIO_SLOTS[1])).toBe(true);
    expect(service.create(bookingInput(OTHER_USER_ID, DATE, STUDIO_SLOTS[1]))).toBe('created');
  });

  it('cancela una reserva', () => {
    service.create(bookingInput(USER_ID, DATE, STUDIO_SLOTS[0]));
    const booking = service.userBookings(USER_ID)[0];
    service.cancel(booking.id);
    expect(service.userBookings(USER_ID)).toHaveLength(0);
    expect(service.isAvailable(DATE, STUDIO_SLOTS[0])).toBe(true);
  });

  it('solo devuelve las reservas del usuario', () => {
    service.create(bookingInput(USER_ID, DATE, STUDIO_SLOTS[0]));
    service.create(bookingInput(OTHER_USER_ID, DATE, STUDIO_SLOTS[1]));
    expect(service.userBookings(USER_ID)).toHaveLength(1);
    expect(service.userBookings(OTHER_USER_ID)).toHaveLength(1);
  });
});
