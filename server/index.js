import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost',
    methods: ['GET', 'POST']
  }
});

///////////////////////////////////

const names = [
  'Bishop',
  'Desai',
  'Adams',
  'Kong',
  'Skippy',
  'Simms',
  'Perkins',
  'Dandurff',
];

let questions;
let state = 'wait';

const players = {};
const sockets = {};

function generateQuestions() {
  questions = [
    { text: '3 + 3', answer: 6, choices: [3, 6, 2, 1] },
    { text: '1 + 8', answer: 9, choices: [2, 3, 9, 0] },
    { text: '1 + 1', answer: 2, choices: [2, 1, 3, 4] },
  ]
}

function retrieveName() {
  if (names.length === 0) { return; }
  const index = Math.floor(Math.random() * names.length);
  const name = names[index];
  names.splice(index, 1);
  return name;
}

function restoreName(name) {
  names.push(name);
}

generateQuestions();

io.on('connection', socket => {
  
  const player = {
    name: retrieveName(),
    id: socket.id,
    position: 0,
  };
  
  players[socket.id] = player;
  sockets[socket.id] = socket;
  
  socket.on('disconnect', () => {
    const player = players[socket.id];
    delete players[socket.id];
    restoreName(player.name);
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
      generateQuestions();
      
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

//////////////////////////////////////////////////////

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

httpServer.listen(3000, () => {
  console.log('listening on *:3000');
});
