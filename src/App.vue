<template>
  <div class="app-container">
      <div class="info-panel">
        <div class="info-panel-left">
          <span v-for="(x,i) of displayMines" :key="i" class="count" :class="'n'+x"></span>
        </div>
        <button class="info-panel-smile" :class="[state,{fear}]" @click="reset()"/>
        <div class="info-panel-right">
          <span v-for="(x,i) of displaySeconds" :key="i" class="count" :class="'n'+x"></span>
        </div>
      </div>
      <div class="field">
        <div v-for="(rows, i) of grid" :key="i" class="row">
          <square v-for="(cell, i) of rows" :key="i" :data="cell" :state="state"
                  @mouseup.left="onCellLeftClick(cell)"
                  @mousedown.left="firstClick(cell)"
                  @mousedown.right="onCellRightClick(cell)"
                  @contextmenu.prevent
          />
        </div>
      </div>
    </div>

</template>

<script>
import Square from '@/components/Square.vue';
import initCell from '@/components/initCell';

export default {
  name: 'App',
  components: {Square},
  data() {
    return {
      rows: 16,
      cols: 16,
      mines: 40,
      grid: [],
      intervalId: undefined,
      interval: 0,
      state: {finished: false, won: false},
      count: { open: 0, flag: 0 },
      fear: false,
      clickCell: null
    };
  },
  created() {
    this.clearBoard()
  },
  computed: {
    displayMines(){
     const amount =  this.formatTime(this.mines - this.count.flag);
     const n =amount.split('')
      return n;
    },
    displaySeconds(){
      const time =  this.formatTime(this.interval);
      const n =time.split('')
      return n;
    },
    secondTimer() { return !(!this.count.open || this.state.finished || this.state.won)
    },
    cellClosed() {return this.rows*this.cols - this.count.open}
  },
  watch: {
    // секундомер
    secondTimer(start){
      if (start) {
        this.interval = 1;
        this.intervalId = setInterval(() => this.interval++, 1000)
      } else {
        clearInterval(this.intervalId);
      }
    },
  },
  methods: {
    // форматирование таймера
    formatTime(time) {
      if (time < 10) {
        return '00' + time;
      }
      if (time < 100) {
        return '0' + time;
      }
      return time.toString();
    },
    // перезапуск
    reset() {
      this.clearBoard();
      this.state.finished = false;
      this.state.won = false;
      this.interval = 0;
      this.count.open = 0;
      this.count.flag = 0;
      this.clickCell = null;
      clearInterval(this.intervalId);
    },
    // поле
    clearBoard() {
      this.grid = [];
      for (let y = 0; y < this.cols; y++) {
        this.grid.push([]);
        for (let x = 0; x < this.rows; x++) {
          this.grid[y].push(new initCell(x, y));
        }
      }
    },
    // расстановка мин
    firstClick(cell) {
      this.fear = true;
      this.clickCell = cell;

      if (this.count.open === 0) {
        try {
          this.setMines();
          this.clickCell.is_mine = false;
        } catch (e) {
          throw'тут мина'
        }
      }
    },
    setMines() {
      // кол-во ячеек
      const cells_amount = this.rows * this.cols;

      // заполняем карту
      for (let n = 0; n < this.mines; ++n) {
        let cell = this.makeMineCell(n);
        cell.is_mine = true;
      }
      // перемешиваем
      for (let n = 0; n < cells_amount - 1; ++n) {
        let target = Math.floor(Math.random() * (cells_amount - n));
        const cellN = this.makeMineCell(n);
        const cellTarget = this.makeMineCell(target);
        cellN.change(cellTarget);
      }
    },
    makeMineCell(n) {
     return this.cell(n % this.rows, Math.floor(n / this.rows));
    },
    cell(x, y) {
      return (x >= 0 && y >= 0 && x < this.rows && y < this.cols) ? this.grid[y][x] : null;
    },
    // ищем соседей
    getNeighbour(cell, callback) {
      let neighbour;
      // координаты
      for (let nx = -1; nx < 2; ++nx)
        for (let ny = -1; ny < 2; ++ny)
          if ((nx !== 0 || ny !== 0) && (neighbour = this.cell(cell.x + nx, cell.y + ny)))
            callback(neighbour);
    },
    // клик по ячейке лкм
    onCellLeftClick(cell) {
      if (!cell.is_open) {
        this.fear = false;

        if (cell.is_mine) {
          cell.mineClick = true;
          this.fail();
        } else {
          if (!cell.flag) {
            this.openCell(cell);
          } else return false;
          // условие выигрыша
          if (this.cellClosed === parseInt(this.mines))
            this.win();
        }
      }
    },
    openCell(cell) {
      if (!cell.is_open) {
        this.setCellOpen(cell);

        // если в ячейке пока нет информации
        if (cell.mines === 0)
          this.getNeighbour(cell,
              neighbour => this.openCell(neighbour));
      }
    },
    setCellOpen(cell) {
      if (!cell.is_open) {
        cell.is_open = true;
        this.count.open++;
        cell.question = 0;

        if (cell.flag) {
          cell.flag = 0;
          this.count.flag--;
        }

        if (!cell.is_mine) {
          cell.mines = this.countMinesAround(cell);
        }
      }
    },
    // клик по ячейке пкм
    onCellRightClick(cell) {
      // заводим счетчик mouseCount, чтобы менять с флага на вопрос, потом сброс
      if (!cell.is_open) {

        if (cell.mouseCount === 0) {
          cell.flag = true;
          cell.question = false;
          this.count.flag = this.count.flag + 1;
          cell.mouseCount = cell.mouseCount + 1;
          return this.count.flag && cell.mouseCount;
        } else if (cell.mouseCount === 1) {
          cell.flag = false;
          cell.question = true;
          this.count.flag = this.count.flag - 1;
          cell.mouseCount = cell.mouseCount + 1;
          return this.count.flag && cell.mouseCount;
        } else {
          cell.flag = false;
          cell.question = false;
          return cell.mouseCount = 0;
        }
      }
    },
    // проигрыш
    fail() {
      this.state.finished = true;
      this.openCells();
    },
    // выигрыш
    win() {
      this.state.won = true;
    },
    // открываем карту
    openCells() {
      for (let y = 0; y < this.grid.length; ++y)
        for (let x = 0; x < this.grid.length; ++x) {
          let cell = this.cell(x, y);
          if (!cell.flag) {
            cell.is_open = true;
          }
          if (!cell.is_mine) cell.mines = this.countMinesAround(cell);
        }
    },
    // считаем мины
    countMinesAround(cell) {
      let num = 0;
      this.getNeighbour(cell,
          neighbour => num += neighbour.is_mine ? 1 : 0);
      return num;
    },
  }
};
</script>
