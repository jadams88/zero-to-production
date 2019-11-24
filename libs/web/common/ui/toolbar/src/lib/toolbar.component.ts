import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';

@Component({
  selector: 'ngw-ui-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonUiToolbarComponent {
  @Input() navButton: boolean = false;
  @Output() navToggle = new EventEmitter<void>();
}
