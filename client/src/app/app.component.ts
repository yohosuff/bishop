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
  playersMap: Map<string, any>;
  players: any[];
  playerGroups: { position: number; players: any[]; }[];
  showPlayButton = true;

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
      this.socket = this.initializeSocket();
    }

    this.socket.emit(EventName.PLAY);
  }

  initializeSocket() {
    const socket = io('http://68.148.134.87:3000');

    socket.on(EventName.WELCOME, params => {
      console.log('welcome', params);
      this.players = params.players;
      this.playersMap = params.players.reduce((map, player) => map.set(player.id, player), new Map<string, any>());
      this.updatePlayerGroups();
      this.me = this.playersMap.get(params.id);
      this.question = params.question;
      this.questionCount = params.questionCount;
      this.state = StateName.PLAY;
    });

    socket.on(EventName.WRONG, () => {
      console.log('wrong');
      this.state = this.state = StateName.WRONG;
      setTimeout(() => {
        if(this.state === StateName.WRONG) {
          this.state = StateName.PLAY;
        }
      }, 1000);
    });

    socket.on(EventName.CORRECT, params => {
      console.log('correct', params);
      this.question = params.question;
      this.me.position = params.position;
      this.updatePlayerGroups();
    });

    socket.on(EventName.UPDATE, params => {
      console.log('update', params);
      const player = this.playersMap.get(params.player.id);
      player.position = params.player.position;
      this.updatePlayerGroups();
    });

    socket.on(EventName.WINNER, params => {
      console.log('winner');
      this.me.position = params.position;
      this.updatePlayerGroups();
      this.state = StateName.WIN;
      this.allowVictoryDance();
    });

    socket.on(EventName.LOSER, params => {
      console.log('loser');
      this.winner = params.winner;
      params.players.forEach((player: any) => {
        this.playersMap.get(player.id).position = player.position;
      });
      this.updatePlayerGroups();
      this.state = StateName.LOSE;
      this.allowVictoryDance();
    });

    socket.on(EventName.JOINED, params => {
      console.log('joined', params);
      this.addPlayer(params.player);
      this.updatePlayerGroups();
    });

    socket.on(EventName.LEFT, params => {
      console.log('left', params);
      this.playersMap.delete(params.player.id);
      this.players = Array.from(this.playersMap.values());
      this.updatePlayerGroups();
    });

    return socket;
  }

  allowVictoryDance() {
    this.showPlayButton = false;
    setTimeout(() => this.showPlayButton = true, 2000);
  }

  addPlayer(player) {
    this.playersMap.set(player.id, player);
    this.players = Array.from(this.playersMap.values());
  }

  updatePlayerGroups() {
    const groups: Map<number, any[]> = this.players.reduce((groups: Map<number, any[]>, player) => {
      if(!groups.has(player.position)) {
        groups.set(player.position, []);
      }
      groups.get(player.position).push(player);
      return groups;
    }, new Map<number, any[]>());

    this.playerGroups = Array.from(groups.entries()).map(entry => {
      return {
        position: entry[0],
        players: entry[1],
      };
    });
  }

}
