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

let questions;
const players = {};

function generateQuestions() {
  questions = [
    { text: '3 + 3', answer: 6, choices: [3, 6, 2, 1] },
    { text: '1 + 8', answer: 9, choices: [2, 3, 9, 0] },
    { text: '1 + 1', answer: 2, choices: [2, 1, 3, 4] },
  ]
}

generateQuestions();

io.on('connection', socket => {
  
  const player = {
    socket,
    position: 0,
  };
  
  players[socket.id] = player;
  
  socket.on('disconnect', () => {
    delete players[socket.id];
  });

  socket.on('choice submission', choice => {
    const question = questions[player.position];
    if(choice === question.answer) {
      player.position += 1;
      socket.emit('correct', {
        question: questions[player.position],
        position: player.position,
      });
    } else {
      socket.emit('wrong');
    }
  });

  socket.emit('situation update', { 
    question: questions[player.position],
    position: player.position,
    questionCount: questions.length,
  });
});

//////////////////////////////////////////////////////

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

httpServer.listen(3000, () => {
  console.log('listening on *:3000');
});
