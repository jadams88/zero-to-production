import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { timer, Observable, Subscription } from 'rxjs';
import { formErrorsAnimations } from './form-errors.animations';
import { DynamicFormFacade } from '../+state/dynamic-form.facade';

// TODO a11y Announcer

@Component({
  selector: 'app-form-errors',
  templateUrl: './form-errors.component.html',
  styleUrls: ['./form-errors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [formErrorsAnimations]
})
export class FormErrorsComponent implements OnDestroy {
  private autoClose = 5000; // ms until close
  @Output() dismiss = new EventEmitter<void>();

  errors$: Observable<string[]>;
  private sub: Subscription;

  constructor(private facade: DynamicFormFacade) {
    this.errors$ = this.facade.errors$;

    this.sub = timer(this.autoClose).subscribe(() => {
      this.dismiss.emit();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
