import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectApiComponent } from './select-api.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ApiService, GraphQLService } from '@ztp/common/data-access';
import { HttpClient } from '@angular/common/http';

describe('SelectApiComponent', () => {
  let component: SelectApiComponent;
  let fixture: ComponentFixture<SelectApiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SelectApiComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: HttpClient, useValue: {} },
        { provide: ApiService, useValue: {} },
        { provide: GraphQLService, useValue: {} },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectApiComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
