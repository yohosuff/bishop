import { Component, OnInit } from '@angular/core';
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
  players: Map<string, any>;
  playersIterable: any[];

  StateName = StateName;

  constructor() {}

  ngOnInit() {
    this.state = StateName.WAIT;
  }

  choose(choice) {
    this.socket.emit(EventName.CHOICE, choice);
  }

  play() {
    if(!this.socket) {
      this.socket = io('http://68.148.134.87:3000');

      this.socket.on(EventName.WELCOME, params => {
        console.log('welcome', params);
        this.players = (params.players as any[]).reduce((p,c) => p.set(c.id, c), new Map<string, any>());
        this.playersIterable = params.players;
        this.me = this.players.get(params.id);
        this.question = params.question;
        this.questionCount = params.questionCount;
        this.state = StateName.PLAY;
      });

      this.socket.on(EventName.WRONG, () => {
        console.log('wrong');
      });

      this.socket.on(EventName.CORRECT, params => {
        console.log('correct', params);
        this.question = params.question;
        this.me.position = params.position;
      });

      this.socket.on(EventName.UPDATE, params => {
        console.log('update', params);
        const player = this.players.get(params.player.id);
        player.position = params.player.position;
      });

      this.socket.on(EventName.WINNER, params => {
        console.log('winner');
        this.me.position = params.position;
        this.state = StateName.WIN;
      });

      this.socket.on(EventName.LOSER, params => {
        console.log('loser');
        this.winner = params.winner;
        Array.from(params.players.values()).forEach((player: any) => {
          this.players.get(player.id).position = player.position;
        });
        this.state = StateName.LOSE;
      });

      this.socket.on(EventName.JOINED, params => {
        console.log('joined', params);
        this.players.set(params.player.id, params.player);
        this.playersIterable = Array.from(this.players.values());
      });

      this.socket.on(EventName.LEFT, params => {
        console.log('left', params);
        this.players.delete(params.player.id);
        this.playersIterable = Array.from(this.players.values());
      });
    }

    this.socket.emit(EventName.PLAY);
  }

}
