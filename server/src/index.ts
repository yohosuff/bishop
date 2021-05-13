import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { NameProvider } from './name-provider';
import { QuestionGenerator } from './question-generator';
import { StateName } from './state-name';
import { EventName } from './event-name';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://68.148.134.87',
    methods: ['GET', 'POST']
  }
});

let questions: any[];
let state = StateName.WAIT;
const players = new Map<string, any>();
const sockets = new Map<string, any>();
const nameProvider = new NameProvider();
const questionGenerator = new QuestionGenerator();

io.on('connection', socket => {

  const player = {
    name: nameProvider.retrieveName(),
    id: socket.id,
    position: 0,
  };

  players.set(socket.id, player);
  sockets.set(socket.id, socket);

  socket.on(EventName.DISCONNECT, () => {
      const leaver = players.get(socket.id);
      players.delete(leaver.id);
      nameProvider.restoreName(leaver.name);
      socket.broadcast.emit(EventName.LEFT, {
        player: leaver
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
          players: Array.from(players.values()),
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

      Array.from(players.values()).forEach(p => {
        p.position = 0;
      });

      Array.from(players.values()).forEach(p => {
        sockets.get(p.id).emit(EventName.WELCOME, {
          id: p.id,
          players: Array.from(players.values()),
          question: questions[p.position],
          questionCount: questions.length,
        });
      });
    } else if(state === StateName.PLAY) {
      socket.emit(EventName.WELCOME, {
        id: player.id,
        players: Array.from(players.values()),
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
