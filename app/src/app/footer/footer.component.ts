import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  @Output() addName = new EventEmitter<void>();

  constructor(private _dataService: DataService) {}

  public onResetPage(): void {
    this._dataService.setResetData(true);

    const checkbox = document.getElementById('showOptions') as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = false;
    }
  }
}
