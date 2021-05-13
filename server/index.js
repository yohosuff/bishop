import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { NameProvider, QuestionGenerator, EventName, StateName } from './helpers.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://68.148.134.87',
    methods: ['GET', 'POST']
  }
});

let questions;
let state = StateName.WAIT;
const players = {};
const sockets = {};
const nameProvider = new NameProvider();
const questionGenerator = new QuestionGenerator();

io.on(EventName.CONNECTION, socket => {
  
  const player = {
    name: nameProvider.retrieveName(),
    id: socket.id,
    position: 0,
  };
  
  players[socket.id] = player;
  sockets[socket.id] = socket;
  
  socket.on(EventName.DISCONNECT, () => {
    const player = players[socket.id];
    delete players[socket.id];
    nameProvider.restoreName(player.name);
    socket.broadcast.emit(EventName.LEFT, {
      player
    });
  });

  socket.on(EventName.CHOICE, choice => {
    const question = questions[player.position];

    if(choice === question.answer) {
      player.position += 1;

      if(player.position === questions.length) {
        state = StateName.WAIT;
        socket.emit(EventName.WINNER, {
          position: player.position,
        });
        socket.broadcast.emit(EventName.LOSER, {
          winner: player,
          players,
        });
      } else {
        socket.emit(EventName.CORRECT, {
          question: questions[player.position],
          position: player.position,
        });
        socket.broadcast.emit(EventName.UPDATE, {
          player
        });
      }

    } else {
      socket.emit(EventName.WRONG);
    }
  });

  socket.on(EventName.PLAY, () => {

    if(state === StateName.WAIT) {
      state = StateName.PLAY;
      questions = questionGenerator.generateQuestions();
      
      Object.values(players).forEach(player => {
        player.position = 0;
      });

      Object.values(players).forEach(player => {
        sockets[player.id].emit(EventName.WELCOME, {
          id: player.id,
          players,
          question: questions[player.position],
          questionCount: questions.length,
        });
      });
    } else if(state === StateName.PLAY) {
      socket.emit(EventName.WELCOME, {
        id: player.id,
        players,
        question: questions[player.position],
        questionCount: questions.length,
      });
      socket.broadcast.emit(EventName.JOINED, {
        player
      });
    }
  });
});

const port = 3000;
const host = '0.0.0.0';

httpServer.listen(port, host, () => {
  console.log(`listening on ${host}:${port}`);
});
