import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  state;
  input;
  left;
  right;

  ngOnInit(): void {
    this.reset();
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if(event.key !== 'Enter') {
      this.input += event.key;
      return;
    }

    if('' + (this.left + this.right) === this.input) {
      this.state = 'correct';
      this.reset();
    } else {
      this.state = 'incorrect';
      setTimeout(() => {
        this.state = 'ask';
        this.input = '';
      }, 1000);
    }
  }

  reset() {
    setTimeout(() => this.resetHelper(), 1000);
  }

  resetHelper() {
    this.state = 'ask';
    this.input = '';
    this.left = this.getNumber();
    this.right = this.getNumber();
  }

  getNumber() {
    return Math.floor(Math.random() * 10);
  }
}
