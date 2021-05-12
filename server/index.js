import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { NameProvider, QuestionGenerator } from './helpers.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://68.148.134.87',
    methods: ['GET', 'POST']
  }
});

let questions;
let state = 'wait';
const players = {};
const sockets = {};
const nameProvider = new NameProvider();
const questionGenerator = new QuestionGenerator();

io.on('connection', socket => {
  
  const player = {
    name: nameProvider.retrieveName(),
    id: socket.id,
    position: 0,
  };
  
  players[socket.id] = player;
  sockets[socket.id] = socket;
  
  socket.on('disconnect', () => {
    const player = players[socket.id];
    delete players[socket.id];
    nameProvider.restoreName(player.name);
    socket.broadcast.emit('left', {
      player
    });
  });

  socket.on('choice', choice => {
    const question = questions[player.position];

    if(choice === question.answer) {
      player.position += 1;

      if(player.position === questions.length) {
        state = 'wait';
        socket.emit('winner', {
          position: player.position,
        });
        socket.broadcast.emit('loser', {
          winner: player,
          players,
        });
      } else {
        socket.emit('correct', {
          question: questions[player.position],
          position: player.position,
        });
        socket.broadcast.emit('update', {
          player
        });
      }

    } else {
      socket.emit('wrong');
    }
  });

  socket.on('play', () => {

    if(state === 'wait') {
      state = 'play';
      questions = questionGenerator.generateQuestions();
      
      Object.values(players).forEach(player => {
        player.position = 0;
      });

      Object.values(players).forEach(player => {
        sockets[player.id].emit('welcome', {
          id: player.id,
          players,
          question: questions[player.position],
          questionCount: questions.length,
        });
      });
    } else if(state === 'play') {
      socket.emit('welcome', {
        id: player.id,
        players,
        question: questions[player.position],
        questionCount: questions.length,
      });
      socket.broadcast.emit('joined', {
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
