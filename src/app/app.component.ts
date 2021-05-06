import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Howl } from 'howler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  state;
  left;
  right;
  choices;
  answers;
  answerIndex;

  blockSize = 100;
  questionCount = 5;
  inputMap = {
    'j': 0,
    'k': 1,
    'l': 2,
    ';': 3,
  };

  correctSound: Howl;
  tryAgainSound: Howl;
  youWinSound: Howl;
  newGameSound: Howl;

  constructor(private host: ElementRef) {
    this.host.nativeElement.style.setProperty('--block-size', `${this.blockSize}px`);
    this.host.nativeElement.style.setProperty('--question-count', `${this.questionCount}`);
  }

  ngOnInit() {
    this.correctSound = new Howl({ src: ['/assets/correct.flac'] });
    this.tryAgainSound = new Howl({ src: ['/assets/tryAgain.flac'] });
    this.youWinSound = new Howl({ src: ['/assets/youWin.flac'] });
    this.newGameSound = new Howl({ src: ['/assets/newGame.flac'] });
    this.createNewGame();
  }

  choose(choice) {
    this.processInput(choice.value);
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    if(this.state === 'win') {
      this.createNewGame();
      return;
    }

    if(this.state !== 'ask') {
      return;
    }

    if(!['j','k','l',';'].includes(event.key)) {
      return;
    }
    
    const input = this.choices[this.inputMap[event.key]].value;
    
    this.processInput(input);
  }

  processInput(input) {
    if(this.left + this.right === input) {
      this.answers[this.answerIndex] = true;
      this.answerIndex += 1;
    
      if(this.answerIndex === this.answers.length) {
        this.state = 'win';
        this.youWinSound.play();
      } else {
        this.state = 'correct';
        this.correctSound.play();
        setTimeout(() => this.createNewQuestion(), 500);
      }

    } else {
      this.state = 'incorrect';
      this.tryAgainSound.play();
      setTimeout(() => this.state = 'ask', 1000);
    }
  }

  createNewGame() {
    this.newGameSound.play();
    this.answers = [];
    
    for(let i = 0; i < this.questionCount; ++i) {
      this.answers.push(undefined);
    }

    this.answerIndex = 0;
    this.createNewQuestion();
  }

  createNewQuestion() {
    this.state = 'ask';
    this.left = this.getNumber();
    this.right = this.getNumber();
    this.choices = this.getChoices(this.left + this.right);
  }

  getChoices(answer) {
    const values = [answer];
    
    for(let i = 0; i < 3; ++i) {
      let decoy = answer;

      while(values.includes(decoy)) {
        decoy = this.getDecoy(answer);
      }

      values.push(decoy);
    }

    this.shuffle(values);

    const choices = values.map(value => {
      let choice: IChoice = {value};
      return choice;
    });

    choices[0].key = 'j';
    choices[1].key = 'k';
    choices[2].key = 'l';
    choices[3].key = ';';

    return choices;
  }

  shuffle(list) {
    for(let i = 0; i < 20; ++i) {
      const a = Math.floor(Math.random() * list.length);
      const b = Math.floor(Math.random() * list.length);
      const temp = list[a];
      list[a] = list[b];
      list[b] = temp;
    }
  }

  getDecoy(answer) {
    let offset = 1 + Math.floor(Math.random() * 5);
    
    if(Math.random() > 0.5) {
      offset *= -1;
    }

    return answer + offset;
  }

  getNumber() {
    return Math.floor(Math.random() * 10);
  }
}

interface IChoice {
  value: number;
  key?: string;
}
