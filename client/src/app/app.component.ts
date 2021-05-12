import { Component, ElementRef, OnInit } from '@angular/core';
import { io, Socket } from 'socket.io-client';

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
  state; //wait, play, win, lose
  winner;
  players;
  playersIterable;

  constructor(private host: ElementRef) {}

  ngOnInit() {
    this.state = 'wait';    
  }

  choose(choice) {
    this.socket.emit('choice', choice);
  }

  play() {
    if(!this.socket) {
      this.socket = io('http://68.148.134.87:3000');
    
      this.socket.on('welcome', params => {
        console.log('welcome', params);
        this.players = params.players;
        this.playersIterable = Object.values(params.players);
        this.me = this.players[params.id];
        this.question = params.question;
        this.questionCount = params.questionCount;
        this.state = 'play';
      });

      this.socket.on('wrong', () => {
        console.log('wrong');
      });

      this.socket.on('correct', params => {
        console.log('correct', params);
        this.question = params.question;
        this.me.position = params.position;
      });

      this.socket.on('update', params => {
        console.log('update', params);
        const player = this.players[params.player.id];
        player.position = params.player.position;
      });

      this.socket.on('winner', params => {
        console.log('winner');
        this.me.position = params.position;
        this.state = 'win';
      });

      this.socket.on('loser', params => {
        console.log('loser');
        this.winner = params.winner;
        Object.values(params.players).forEach((player: any) => {
          this.players[player.id].position = player.position;
        });
        this.state = 'lose';
      });

      this.socket.on('joined', params => {
        console.log('joined', params);
        this.players[params.player.id] = params.player;
        this.playersIterable = Object.values(this.players);
      });

      this.socket.on('left', params => {
        console.log('left', params);
        delete this.players[params.player.id];
        this.playersIterable = Object.values(this.players);
      });
    }

    this.socket.emit('play');
  }

}
