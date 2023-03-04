export default class initCell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.mines = 0;
    this.mineClick =  false;
    this.is_mine = false;
    this.is_open = false;
    this.flag = false;
    this.question = false;
    this.mouseCount = 0;
  }
  change(cell) {
    this.changeCells(cell, 'mines');
    this.changeCells(cell, 'is_mine');
    this.changeCells(cell, 'is_open');
    this.changeCells(cell, 'mineClick');
  }

  changeCells(cell, field) {
    const val = this[field];
    this[field] = cell[field];
    cell[field] = val;
  }
}
