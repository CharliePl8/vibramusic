import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { STUDIO_GEAR, STUDIO_IMAGE } from '../../../../core/data/studio.data';
import { AudioTracklistComponent } from '../audio-tracklist/audio-tracklist.component';
import {
  STUDIO_SERVICES,
  STUDIO_SLOTS,
  StudioService,
  StudioSlot,
} from '../../../../core/models/booking.model';
import { BookingService } from '../../../../core/services/booking.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-studio',
  standalone: true,
  imports: [CommonModule, AudioTracklistComponent, ReactiveFormsModule],
  templateUrl: './studio.component.html',
  styleUrl: './studio.component.scss',
})
export class StudioComponent {
  readonly gear = STUDIO_GEAR;
  readonly services = STUDIO_SERVICES;
  readonly slots = STUDIO_SLOTS;

  readonly bookingOpen = signal(false);
  readonly takenSlots = signal<StudioSlot[]>([]);
  readonly submitting = signal(false);

  readonly form = new FormGroup({
    date: new FormControl('', [Validators.required]),
    slot: new FormControl('', [Validators.required]),
    service: new FormControl('', [Validators.required]),
    notes: new FormControl(''),
  });

  private readonly image = STUDIO_IMAGE;

  private auth = inject(AuthService);
  private booking = inject(BookingService);
  private toast = inject(ToastService);
  private router = inject(Router);

  constructor() {
    this.form.controls.date.valueChanges.subscribe((date) => {
      void this.loadTakenSlots(date);
    });
  }

  get imageStyle() {
    return { 'background-image': `url(${this.image})` };
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  toggleBooking() {
    this.bookingOpen.update((open) => !open);
    if (this.bookingOpen()) {
      void this.loadTakenSlots(this.form.controls.date.value);
    }
  }

  async onSubmit() {
    const user = this.auth.currentUser();
    if (!user) {
      this.toast.info('Inicia sesión para reservar el estudio.');
      this.router.navigate(['/login']);
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Completa la fecha, la franja y el servicio.');
      return;
    }

    const { date, slot, service, notes } = this.form.value;
    this.submitting.set(true);
    const result = await this.booking.create({
      userId: user.id,
      date: date!,
      slot: slot as StudioSlot,
      service: service as StudioService,
      notes: notes ?? '',
    });
    this.submitting.set(false);

    if (result === 'conflict') {
      this.toast.error('Esa franja ya está reservada. Elige otra.');
      await this.loadTakenSlots(date);
      return;
    }
    if (result === 'error') {
      this.toast.error('No se pudo completar la reserva. Inténtalo de nuevo.');
      return;
    }

    this.form.reset();
    this.bookingOpen.set(false);
    this.toast.success('Reserva confirmada. La verás en tu perfil.');
  }

  isSlotAvailable(slot: string): boolean {
    return !this.takenSlots().includes(slot as StudioSlot);
  }

  hasError(controlName: 'date' | 'slot' | 'service'): boolean {
    const c = this.form.get(controlName);
    return !!c && c.invalid && c.touched;
  }

  private async loadTakenSlots(date: string | null | undefined): Promise<void> {
    if (!date) {
      this.takenSlots.set([]);
      return;
    }
    this.takenSlots.set(await this.booking.takenSlots(date));
  }
}
