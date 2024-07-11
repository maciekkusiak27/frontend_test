import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Element } from '../../../data/data.interface';



@Component({
  selector: 'app-create-modal',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './create-modal.component.html',
  styleUrl: './create-modal.component.scss',
})
export class CreateModalComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      title: [this.data?.element?.title || ''],
      description: [this.data?.element?.description || ''],
    });
  }

  public save(): void {
    const newElement: Element = {
      title: this.form.value.title,
      description: this.form.value.description,
    };

    if (this.data.element && this.data.element.id) {
      newElement.id = this.data.element.id; 
    } else {
      newElement.id = this._generateId();
    }

    this.dialogRef.close(newElement);
  }

  private _generateId(): string {
    return '_' + Math.random().toString(36).substr(2, 9); 
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}
