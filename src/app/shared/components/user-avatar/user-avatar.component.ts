import { Component, computed, input } from '@angular/core';

export type UserAvatarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss',
})
export class UserAvatarComponent {
  readonly name = input<string | undefined>(undefined);
  readonly size = input<UserAvatarSize>('md');

  readonly initial = computed(() => {
    const [first] = Array.from((this.name() ?? '').trim());
    return first?.toUpperCase() || '?';
  });
}
