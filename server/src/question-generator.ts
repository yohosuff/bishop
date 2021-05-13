export class QuestionGenerator {
  generateQuestions() {
    const questions = [];
    const operators = ['+', '-'];

    for (let i = 0; i < 10; ++i) {
      const left = Math.floor(Math.random() * 10);
      const right = Math.floor(Math.random() * 10);
      const operator = operators[Math.floor(Math.random() * operators.length)];
      const text = `${left} ${operator} ${right}`;
      const answer = eval(text);
      const choices = this.getChoices(answer);
      questions.push({ text, answer, choices });
    }

    return questions;
  }

  getChoices(answer: number) {
    const choices = [answer];

    for (let i = 0; i < 3; ++i) {
      let decoy = answer;

      while (choices.includes(decoy)) {
        decoy = this.getDecoy(answer);
      }

      choices.push(decoy);
    }

    this.shuffle(choices);

    return choices;
  }

  getDecoy(answer: number) {
    let offset = 1 + Math.floor(Math.random() * 5);

    if (Math.random() > 0.5) {
      offset *= -1;
    }

    return answer + offset;
  }

  shuffle(list: any[]) {
    for (let i = 0; i < 20; ++i) {
      const a = Math.floor(Math.random() * list.length);
      const b = Math.floor(Math.random() * list.length);
      const temp = list[a];
      list[a] = list[b];
      list[b] = temp;
    }
  }
}
