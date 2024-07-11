import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { DataService } from '../../services/data.service';
import { DataJson, Element } from '../../data/data.interface';
import { Subscription } from 'rxjs';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CreateModalComponent } from './create-modal/create-modal.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit, OnDestroy {
  data: DataJson = { elements: [] };
  currentElementIndex = 0;
  currentElement: Element | undefined;
  selectedOption = '';
  usedIndexes: number[] = [];
  displayedElements: Element[] = [];
  showAlert = false;
  alertMessage = '';

  private resetDataSubscription!: Subscription;

  constructor(
    private dataService: DataService,
    private dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  public ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.dataService.getData().subscribe((response) => {
        this.data = response;
        if (this.data && this.data.elements.length > 0) {
          this.currentElement = this.data.elements[this.currentElementIndex];
          this.displayedElements = [this.currentElement];
        }
      });
    }

    this.resetDataSubscription = this.dataService.resetData$.subscribe(
      (value) => {
        if (value) {
          this._resetToInitialState();
        }
      }
    );
  }

  private _resetToInitialState(): void {
    this.currentElementIndex = 0;
    this.usedIndexes = [];
    if (this.data && this.data.elements.length > 0) {
      this.currentElement = this.data.elements[this.currentElementIndex];
      this.displayedElements = [this.currentElement];
    } else {
      this.currentElement = undefined;
      this.displayedElements = [];
    }
  }

  public onEdit(element: Element): void {
    const dialogRef = this.dialog.open(CreateModalComponent, {
      data: { element },
    });

    dialogRef.afterClosed().subscribe((result: Element | undefined) => {
      if (result) {
        const index = this.data.elements.findIndex((el) => el.id === result.id);
        if (index !== -1) {
          this.data.elements[index] = result;

          if (this.currentElement && this.currentElement.id === result.id) {
            this.currentElement = result;
            this.displayedElements = [this.currentElement];
          }

          this._saveDataToLocalStorage();
        }
      }
    });
  }

  public onDelete(id: string | undefined): void {
    this.data.elements = this.data.elements.filter((elem) => elem.id !== id);
    this.displayedElements = this.displayedElements.filter(
      (elem) => elem.id !== id
    );
    this._saveDataToLocalStorage();
  }

  public onCreate(): void {
    this.dialog
      .open(CreateModalComponent)
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.data.elements.push(result);
          this._saveDataToLocalStorage();
        }
      });
  }

  private _saveDataToLocalStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.dataService.setData(this.data);
    }
  }

  public onAction(action: string): void {
    switch (action) {
      case 'REPLACE':
        this._replaceContent();
        break;
      case 'APPEND':
        this._appendContent();
        break;
      default:
        break;
    }
  }

  private _replaceContent(): void {
    if (!this.data || this.data.elements.length === 0) {
      return;
    }

    switch (this.selectedOption) {
      case 'option1':
        this.currentElementIndex = 0;
        break;
      case 'option2':
        this.currentElementIndex = 1;
        break;
      case 'random':
        this.currentElementIndex = this._getRandomIndex();
        break;
      default:
        return;
    }

    this.currentElement = this.data.elements[this.currentElementIndex];
    this.displayedElements = [this.currentElement];
    this.usedIndexes = [this.currentElementIndex];
  }

  private _appendContent(): void {
    if (!this.data || this.data.elements.length === 0) {
      return;
    }

    switch (this.selectedOption) {
      case 'option1':
        this._addSpecificElement(0);
        break;
      case 'option2':
        this._addSpecificElement(1);
        break;
      case 'random':
        this._addRandomElement();
        break;
      default:
        break;
    }
  }

  private _addSpecificElement(indexToAdd: number): void {
    if (this.usedIndexes.includes(indexToAdd)) {
      this._displayAlert('Wybrana treść została już dodana.');
      return;
    }

    const additionalElement = this.data.elements[indexToAdd];
    this.displayedElements.push(additionalElement);
    this.usedIndexes.push(indexToAdd);
    this.displayedElements.sort((a, b) => a.title.localeCompare(b.title));
  }

  private _addRandomElement(): void {
    const availableIndexes = this.data.elements
      .map((_, index) => index)
      .filter((index) => !this.usedIndexes.includes(index));

    if (availableIndexes.length === 0) {
      this._displayAlert('Wszystkie dostępne treści zostały już użyte.');
      return;
    }

    const nextRandomIndex =
      availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    const additionalElement = this.data.elements[nextRandomIndex];

    this.displayedElements.push(additionalElement);
    this.usedIndexes.push(nextRandomIndex);
    this.displayedElements.sort((a, b) => a.title.localeCompare(b.title));
  }

  private _getRandomIndex(): number {
    if (!this.data || this.data.elements.length === 0) {
      return -1;
    }

    const availableIndexes = this.data.elements
      .map((_, index) => index)
      .filter((index) => !this.usedIndexes.includes(index));

    if (availableIndexes.length === 0) {
      return -1;
    }

    return availableIndexes[
      Math.floor(Math.random() * availableIndexes.length)
    ];
  }

  public onSelectOption(option: string): void {
    this.selectedOption = option;
  }

  public ngOnDestroy(): void {
    if (this.resetDataSubscription) {
      this.resetDataSubscription.unsubscribe();
    }
  }

  private _displayAlert(message: string): void {
    this.alertMessage = message;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }
}
