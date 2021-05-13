class NameProvider {
  constructor() {
    this.names = [
      'Bishop',
      'Desai',
      'Adams',
      'Kong',
      'Skippy',
      'Simms',
      'Perkins',
      'Dandurff',
    ];
  }

  retrieveName() {
    if (this.names.length === 0) {
      return;
    }

    const index = Math.floor(Math.random() * this.names.length);
    const name = this.names[index];
    this.names.splice(index, 1);
    
    return name;
  }
  
  restoreName(name) {
    this.names.push(name);
  }
}

class QuestionGenerator {
  generateQuestions() {
    const questions = [];
    const operators = ['+','-'];
  
    for(let i = 0; i < 10; ++i) {
      const left = Math.floor(Math.random() * 10);
      const right = Math.floor(Math.random() * 10);
      const operator = operators[Math.floor(Math.random() * operators.length)];
      const text = `${left} ${operator} ${right}`;
      const answer = eval(text);
      const choices = this.getChoices(answer);
      questions.push({text, answer, choices});
    }

    return questions;
  }
  
  getChoices(answer) {
    const choices = [answer];
     
    for(let i = 0; i < 3; ++i) {
      let decoy = answer;
  
      while(choices.includes(decoy)) {
        decoy = this.getDecoy(answer);
      }
  
      choices.push(decoy);
    }
  
    this.shuffle(choices);
  
    return choices;
  }
  
  getDecoy(answer) {
    let offset = 1 + Math.floor(Math.random() * 5);
     
    if(Math.random() > 0.5) {
      offset *= -1;
    }
  
    return answer + offset;
  }

  shuffle(list) {
    for (let i = 0; i < 20; ++i) {
      const a = Math.floor(Math.random() * list.length);
      const b = Math.floor(Math.random() * list.length);
      const temp = list[a];
      list[a] = list[b];
      list[b] = temp;
    }
  }
}

class EventName {
  static get CONNECTION() { return 'connection'; }
  static get DISCONNECT() { return 'disconnect'; }
  static get CHOICE() { return 'choice'; }
  static get WINNER() { return 'winner'; }
  static get LOSER() { return 'loser'; }
  static get CORRECT() { return 'correct'; }
  static get UPDATE() { return 'update'; }
  static get WRONG() { return 'wrong'; }
  static get PLAY() { return 'play'; }
  static get WELCOME() { return 'welcome'; }
  static get JOINED() { return 'joined'; }
  static get LEFT() { return 'left'; }
}

class StateName {
  static get WAIT() { return 'wait'; }
  static get PLAY() { return 'play'; }
}

export {
  NameProvider,
  QuestionGenerator,
  EventName,
  StateName,
};
