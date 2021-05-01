import { Component, ElementRef, HostListener, OnInit } from '@angular/core';

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
  answers;
  answerIndex;

  blockSize = 100;
  questionCount = 5;

  constructor(private host: ElementRef) {
    this.host.nativeElement.style.setProperty('--block-size', `${this.blockSize}px`);
    this.host.nativeElement.style.setProperty('--question-count', `${this.questionCount}`);
  }

  ngOnInit(): void {
    this.createNewGame();
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    if(this.state === 'win') {
      this.createNewGame();
      return;
    }

    if(event.key !== 'Enter') {
      this.input += event.key;
      return;
    }

    if('' + (this.left + this.right) === this.input) {
      this.answers[this.answerIndex] = true;
      this.answerIndex += 1;
    
      if(this.answerIndex === this.answers.length) {
        this.state = 'win';
      } else {
        this.state = 'correct';
        setTimeout(() => this.reset(), 1000);
      }

    } else {
      this.state = 'incorrect';

      setTimeout(() => {
        this.state = 'ask';
        this.input = '';
      }, 1000);
    }
  }

  createNewGame() {
    this.answers = [];
    
    for(let i = 0; i < this.questionCount; ++i) {
      this.answers.push(undefined);
    }

    this.answerIndex = 0;
    this.reset();
  }

  reset() {
    this.state = 'ask';
    this.input = '';
    this.left = this.getNumber();
    this.right = this.getNumber();
  }

  getNumber() {
    return Math.floor(Math.random() * 10);
  }
}
