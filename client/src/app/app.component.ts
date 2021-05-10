import { Component, OnInit } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  socket: Socket;
  situation;

  constructor() {}

  ngOnInit() {
    this.socket = io('http://localhost:3000');
    this.socket.on('situation update', situation => {
      this.situation = situation;
    });
    this.socket.on('wrong', () => {
      console.log('wrong!');
    });
    this.socket.on('correct', situation => {
      console.log('correct!');
      this.situation = situation;
    });
  }

  choose(choice) {
    this.socket.emit('choice submission', choice);
  }

}
