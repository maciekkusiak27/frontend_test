import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { DataJson, Element } from '../../data/data.interface';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit, OnDestroy {
  data!: DataJson;
  currentElementIndex = 0;
  currentElement: Element | undefined;
  selectedOption = '';
  usedIndexes: number[] = [];
  displayedElements: Element[] = [];

  private resetDataSubscription!: Subscription;

  showAlert = false;
  alertMessage = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getData().subscribe((response) => {
      this.data = response;
      if (this.data && this.data.elements.length > 0) {
        this.currentElement = this.data.elements[this.currentElementIndex];
        this.displayedElements = [this.currentElement];
      }
    });

    this.resetDataSubscription = this.dataService.resetData$.subscribe((value) => {
      if (value) {
        this._resetToInitialState();
      }
    });
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

  onAction(action: string): void {
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

    if (this.usedIndexes.length >= this.data.elements.length) {
      this.displayAlert('Wszystkie dostępne treści zostały już użyte.');
      return;
    }

    let indexToAdd: number;
    switch (this.selectedOption) {
      case 'option1':
        indexToAdd = 0;
        break;
      case 'option2':
        indexToAdd = 1;
        break;
      case 'random':
        indexToAdd = this._getRandomIndex();
        break;
      default:
        return;
    }

    if (!this.usedIndexes.includes(indexToAdd)) {
      const additionalElement = this.data.elements[indexToAdd];
      const existingElement = this.displayedElements.find((element) => element === additionalElement);

      if (!existingElement) {
        this.displayedElements.push(additionalElement);
        this.usedIndexes.push(indexToAdd);
        this.displayedElements.sort((a, b) => a.title.localeCompare(b.title));
      } else {
        this.displayAlert('Wybrana treść została już dodana.');
      }
    } else {
      this.displayAlert('Wybrana treść została już użyta.');
    }
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

    return availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
  }

  public onSelectOption(option: string): void {
    this.selectedOption = option;
  }

  public ngOnDestroy(): void {
    this.resetDataSubscription.unsubscribe();
  }

  private displayAlert(message: string): void {
    this.alertMessage = message;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }
}
