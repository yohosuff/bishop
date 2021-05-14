import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { EventName } from '../../../server/src/event-name';
import { StateName } from './state-name';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  socket: Socket;
  me;
  question;
  questionCount;
  state: string;
  winner;
  playersMap: Map<string, any>;
  players: any[];

  StateName = StateName;

  constructor(private host: ElementRef) {}

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    console.log(event);
    if(event.code === 'Numpad1') {
      const name = `player${this.players.length + 1}`;
      this.addPlayer({
        name,
        id: name,
        position: 0,
      });
    }
  }

  ngOnInit() {
    this.state = StateName.WAIT;
  }

  choose(choice) {
    this.socket.emit(EventName.CHOICE, choice);
  }

  play() {
    if(!this.socket) {
      this.socket = this.initializeSocket();
    }

    this.socket.emit(EventName.PLAY);
  }

  initializeSocket() {
    const socket = io('http://68.148.134.87:3000');

    socket.on(EventName.WELCOME, params => {
      console.log('welcome', params);
      this.players = params.players;
      this.playersMap = params.players.reduce((p, c) => p.set(c.id, c), new Map<string, any>());
      this.me = this.playersMap.get(params.id);
      this.question = params.question;
      this.questionCount = params.questionCount;
      this.state = StateName.PLAY;
    });

    socket.on(EventName.WRONG, () => {
      console.log('wrong');
    });

    socket.on(EventName.CORRECT, params => {
      console.log('correct', params);
      this.question = params.question;
      this.me.position = params.position;
    });

    socket.on(EventName.UPDATE, params => {
      console.log('update', params);
      const player = this.playersMap.get(params.player.id);
      player.position = params.player.position;
    });

    socket.on(EventName.WINNER, params => {
      console.log('winner');
      this.me.position = params.position;
      this.state = StateName.WIN;
    });

    socket.on(EventName.LOSER, params => {
      console.log('loser');
      this.winner = params.winner;
      Array.from(params.players.values()).forEach((player: any) => {
        this.playersMap.get(player.id).position = player.position;
      });
      this.state = StateName.LOSE;
    });

    socket.on(EventName.JOINED, params => {
      console.log('joined', params);
      this.addPlayer(params.player);
    });

    socket.on(EventName.LEFT, params => {
      console.log('left', params);
      this.playersMap.delete(params.player.id);
      this.players = Array.from(this.playersMap.values());
    });

    return socket;
  }

  addPlayer(player) {
    this.playersMap.set(player.id, player);
    this.players = Array.from(this.playersMap.values());
  }

}
