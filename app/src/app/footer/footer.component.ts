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

  optionsVisible: boolean = false;

  constructor(private _dataService: DataService) {}

  public onResetPage(): void {
    this._dataService.setResetData(true);
    this.optionsVisible = false;
  }

  public onAddName(): void {
    this.addName.emit();
    this.optionsVisible = false;
  }
 
}
