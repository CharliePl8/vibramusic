import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { AdminComponent } from './admin.component';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';

const booking = {
  id: 'b1',
  userId: 'u1',
  date: '2026-10-01',
  slot: '09:00–12:00',
  service: 'Grabación',
  notes: '',
  createdAt: 0,
  studentName: 'Ana',
  studentEmail: 'ana@example.com',
};

const message = {
  id: 'm1',
  name: 'Ana',
  email: 'ana@example.com',
  message: 'Hola',
  read: false,
  createdAt: 0,
};

describe('AdminComponent', () => {
  let fixture: ComponentFixture<AdminComponent>;
  let component: AdminComponent;
  const bookings = vi.fn();
  const messages = vi.fn();
  const cancelBooking = vi.fn();
  const setMessageRead = vi.fn();
  const success = vi.fn();
  const error = vi.fn();

  beforeEach(async () => {
    bookings.mockReset();
    messages.mockReset();
    cancelBooking.mockReset();
    setMessageRead.mockReset();
    success.mockReset();
    error.mockReset();

    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        { provide: AdminService, useValue: { bookings, messages, cancelBooking, setMessageRead } },
        { provide: ToastService, useValue: { success, error } },
        { provide: Router, useValue: { events: EMPTY, navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
  });

  it('cancela una reserva y la quita de la lista', async () => {
    cancelBooking.mockResolvedValue(true);
    component.bookings.set([booking as never]);

    await component.cancelBooking('b1');

    expect(cancelBooking).toHaveBeenCalledWith('b1');
    expect(component.bookings()).toEqual([]);
    expect(success).toHaveBeenCalled();
  });

  it('avisa si no se pudo cancelar', async () => {
    cancelBooking.mockResolvedValue(false);
    component.bookings.set([booking as never]);

    await component.cancelBooking('b1');

    expect(component.bookings()).toHaveLength(1);
    expect(error).toHaveBeenCalled();
  });

  it('marca un mensaje como leído y actualiza el contador', async () => {
    setMessageRead.mockResolvedValue(true);
    component.messages.set([message as never]);

    await component.toggleRead(message as never);

    expect(setMessageRead).toHaveBeenCalledWith('m1', true);
    expect(component.messages()[0].read).toBe(true);
    expect(component.unreadCount()).toBe(0);
  });
});
