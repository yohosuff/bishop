import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Howl } from 'howler';
import { io, Socket } from 'socket.io-client';

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
  score;
  scoreInterval;

  blockSize = 100;
  questionCount = 5;

  inputMap = {
    'j': 0,
    'k': 1,
    'l': 2,
    ';': 3,
  };

  yepSound: Howl;
  nopeSound: Howl;
  youWinSound: Howl;
  newGameSound: Howl;

  socket: Socket;

  constructor(private host: ElementRef) {}

  ngOnInit() {
    this.yepSound = new Howl({ src: ['/assets/yep.flac'] });
    this.nopeSound = new Howl({ src: ['/assets/nope.flac'] });
    this.youWinSound = new Howl({ src: ['/assets/youWin.flac'] });
    this.newGameSound = new Howl({ src: ['/assets/newGame.flac'] });
    this.createNewGame();
    this.socket = io('http://localhost:3000');
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
    const correct = this.left + this.right === input;

    if(correct) {
      this.setScore(this.score + 20);

      if(this.score === 100) {
        this.state = 'win';
        clearInterval(this.scoreInterval);
        this.youWinSound.play();
      } else {
        this.state = 'correct';
        this.yepSound.play();
        setTimeout(() => this.createNewQuestion(), 500);
      }
    } else {
      this.setScore(this.score - 10);
      this.state = 'incorrect';
      this.nopeSound.play();
      setTimeout(() => this.state = 'ask', 500);
    }
  }

  setScore(score) {
    this.score = Math.min(Math.max(score, 0), 100);
    this.host.nativeElement.style.setProperty('--score', `${this.score}%`);
  }

  createNewGame() {
    this.newGameSound.play();
    this.setScore(0);
    this.scoreInterval = setInterval(() => this.setScore(this.score - 1), 100);
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
