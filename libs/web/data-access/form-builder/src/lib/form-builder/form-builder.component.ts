import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { FormBuilderFacade } from '../+state/form-builder.facade';
import { IFormBuilderStructure } from '../+state/form-builder.reducer';

import compose from 'ramda/es/compose';

@Component({
  selector: 'uqt-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormBuilderComponent {
  toolBoxGroupId = 'tb-form-group';
  toolBoxFieldId = 'tb-field-group';
  dropListIds: string[] = [];

  builderForm: FormGroup;
  selectedForm$: Observable<IFormBuilderStructure | undefined>;

  showFormConfig = false;

  fieldVisible: { groupIndex: null | number; fieldIndex: null | number } = {
    groupIndex: null,
    fieldIndex: null
  };

  constructor(private fb: FormBuilder, private facade: FormBuilderFacade) {
    this.selectedForm$ = this.facade.selectedForm$;

    this.builderForm = this.fb.group({
      config: this.fb.group({
        formName: [''],
        animations: [true],
        pagination: [true]
      }),
      formGroups: this.fb.array([])
    });
  }

  get formGroups() {
    return this.builderForm.get('formGroups') as FormArray;
  }

  getGroupFields(index: number) {
    return (this.formGroups.get(String(index)) as FormGroup).get(
      'fields'
    ) as FormArray;
  }

  createFormGroup(): FormGroup {
    return this.fb.group({
      groupName: [],
      fields: this.fb.array([])
    });
  }

  createFieldGroup() {
    return this.fb.group({
      fieldName: [],
      fieldType: [],
      fieldLabel: []
    });
  }

  toggleFormConfig() {
    this.showFormConfig = !this.showFormConfig;
  }

  showFormField(groupIndex: number, fieldIndex: number) {
    const selected = this.fieldVisible;
    if (
      groupIndex === selected.groupIndex &&
      fieldIndex === selected.fieldIndex
    ) {
      selected.fieldIndex = selected.groupIndex = null;
    } else {
      this.fieldVisible = {
        groupIndex,
        fieldIndex
      };
    }
  }

  deleteFormGroup(i: number): void {
    this.formGroups.removeAt(i);
  }

  removeGroupField(groupIndex: number, fieldIndex: number) {
    this.getGroupFields(groupIndex).removeAt(fieldIndex);
  }

  onSubmit({ valid, value }: FormGroup) {
    if (valid) {
      this.selectedForm$
        .pipe(
          take(1),
          filter(val => val !== undefined)
        )
        .subscribe(form => {
          this.facade.updateForm({ ...form, ...value });
        });
    }
  }

  formGroupDropped(event: CdkDragDrop<FormGroup[]>) {
    const formGroups = this.formGroups;
    if (event.previousContainer.id === event.container.id) {
      this.moveFormArrayGroup(
        formGroups,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const formGroup = this.createFormGroup();
      formGroups.insert(event.currentIndex, formGroup);
    }

    this.setConnectedToId(formGroups.length);
  }

  setConnectedToId(groups: number) {
    const ids: string[] = [];
    for (let i = 0; i < groups; i++) {
      ids.push(`fields-${i}`);
    }
    this.dropListIds = ids;
  }

  formFieldDropped(event: CdkDragDrop<FormGroup[]>) {
    const currentGroupIndex = getFormGroupIndex(event.container.id);
    const currentGroup = this.getGroupFields(currentGroupIndex);

    if (event.previousContainer.id === this.toolBoxFieldId) {
      // It is a new field being dropped from the 'toolbox'
      const groupField = this.createFieldGroup();
      currentGroup.insert(event.currentIndex, groupField);
    } else {
      if (event.previousContainer.id === event.container.id) {
        // The field is being re-ordered in the current form group
        this.moveFormArrayGroup(
          currentGroup,
          event.previousIndex,
          event.currentIndex
        );
      } else {
        const previousGroupIndex = getFormGroupIndex(
          event.previousContainer.id
        );
        const previousGroup = this.getGroupFields(previousGroupIndex);

        this.moveBetweenArrayGroup(
          currentGroup,
          previousGroup,
          event.currentIndex,
          event.previousIndex
        );
      }
    }
  }

  /**
   * Removes the FormGroup from it's current index and inserts it
   * at the new index value
   *
   * @param arrayGroup
   * @param currentIndex
   * @param newIndex
   */
  moveFormArrayGroup(
    arrayGroup: FormArray,
    currentIndex: number,
    newIndex: number
  ): void {
    const controlBeingRemoved = arrayGroup.at(currentIndex);
    arrayGroup.removeAt(currentIndex);
    arrayGroup.insert(newIndex, controlBeingRemoved);
  }

  /**
   * Remove the group from the old section and add to the new
   * @param newArrayGroup
   * @param previousArrayGroup
   * @param newIndex
   * @param previousIndex
   */
  moveBetweenArrayGroup(
    newArrayGroup: FormArray,
    previousArrayGroup: FormArray,
    newIndex: number,
    previousIndex: number
  ): void {
    const controlBeingMoved = previousArrayGroup.at(previousIndex);
    console.log(controlBeingMoved);
    previousArrayGroup.removeAt(previousIndex);
    newArrayGroup.insert(newIndex, controlBeingMoved);
  }
}

const getFormGroupIndex = compose(Number, getStringLastCharacter);

function getStringLastCharacter(string: string) {
  return string.substring(string.length - 1);
}
