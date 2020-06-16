import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';

import { CheckForUpdatesService } from './check-for-updates.service';
import { ApplicationRef } from '@angular/core';
import { of } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('CheckForUpdatesService', () => {
  let swService: CheckForUpdatesService;
  let updates: SwUpdate;
  let appRef: ApplicationRef;
  const updateSpy = {
    available: of(jest.fn()),
    activated: of(jest.fn()),
  };
  const appRefSpy = {
    isStable: of(jest.fn()),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CheckForUpdatesService,
        { provide: SwUpdate, useValue: updateSpy },
        { provide: ApplicationRef, useValue: appRefSpy },
        { provide: DOCUMENT, useValue: {} },
        { provide: MatSnackBar, useValue: {} },
      ],
    });
    swService = TestBed.inject<CheckForUpdatesService>(CheckForUpdatesService);
    updates = TestBed.inject<SwUpdate>(SwUpdate);
    appRef = TestBed.inject<ApplicationRef>(ApplicationRef);
  });

  it('should be created', () => {
    const service: CheckForUpdatesService = TestBed.inject(
      CheckForUpdatesService
    );
    expect(service).toBeTruthy();
  });
});
