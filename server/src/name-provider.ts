export class NameProvider {
  names: string[] = [
    'Bishop',
    'Desai',
    'Adams',
    'Kong',
    'Skippy',
    'Simms',
    'Perkins',
    'Dandurff',
    'Nagatha',
    'Bilby',
    'Chotek',
    'Smythe',
    'Frey',
    'Frielander',
    'Steel',
    'Kapoor',
  ];

  retrieveName() {
    if (this.names.length === 0) {
      return;
    }

    const index = Math.floor(Math.random() * this.names.length);
    const name = this.names[index];
    this.names.splice(index, 1);

    return name;
  }

  restoreName(name: string) {
    this.names.push(name);
  }
}
