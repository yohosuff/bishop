import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://68.148.134.87',
    methods: ['GET', 'POST']
  }
});

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
  
  questions = [];

  const operators = ['+','-'];

  for(let i = 0; i < 10; ++i) {
    const left = Math.floor(Math.random() * 10);
    const right = Math.floor(Math.random() * 10);
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const text = `${left} ${operator} ${right}`;
    const answer = eval(text);
    const choices = getChoices(answer);
    questions.push({text, answer, choices});
  }
}

function getChoices(answer) {
  const choices = [answer];
   
  for(let i = 0; i < 3; ++i) {
    let decoy = answer;

    while(choices.includes(decoy)) {
      decoy = getDecoy(answer);
    }

    choices.push(decoy);
  }

  shuffle(choices);

  return choices;
}

function shuffle(list) {
  for(let i = 0; i < 20; ++i) {
    const a = Math.floor(Math.random() * list.length);
    const b = Math.floor(Math.random() * list.length);
    const temp = list[a];
    list[a] = list[b];
    list[b] = temp;
  }
}

function getDecoy(answer) {
  let offset = 1 + Math.floor(Math.random() * 5);
   
  if(Math.random() > 0.5) {
    offset *= -1;
  }

  return answer + offset;
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

const port = 3000;
const host = '0.0.0.0';

httpServer.listen(port, host, () => {
  console.log(`listening on ${host}:${port}`);
});
