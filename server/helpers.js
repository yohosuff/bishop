function shuffle(list) {
  for (let i = 0; i < 20; ++i) {
    const a = Math.floor(Math.random() * list.length);
    const b = Math.floor(Math.random() * list.length);
    const temp = list[a];
    list[a] = list[b];
    list[b] = temp;
  }
}

export { shuffle };
