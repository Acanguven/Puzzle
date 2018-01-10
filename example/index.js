const express = require('express');
const Puzzle = require('../lib/puzzle');

const mockPuzzleConfig = {
  prePuzzle: '<html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />',
  postStyle: '</head><body>',
  page: {
    rows: '150px 30px auto',
    columns: '1fr',
    container: 'body'
  },
  components: {
    header: {
      row: '1',
      col: '1',
      content: () => new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(`<div>Content of <b>header</b> component</div>`)
        }, 150);
      }),
      placeholder: `<div>Placeholder of boutiqueTabs component</div>`
    },
    boutiqueTabs: {
      row: '2',
      col: '1',
      content:  () => new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve('<div>Content of <b>boutiqueTabs</b> component</div>')
        }, 200);
      }),
      placeholder: '<div>Placeholder of boutiqueTabs component</div>'
    },
    boutiqueList: {
      row: '3',
      col: '1',
      content: '<div>Content of <b>boutiqueList</b> component</div>',
    },
  },
  postPuzzle: '</body></html>'
};

const app = express();

app.use(require('compression')());

app.get('/', (req, res, next) => {
  const puz = new Puzzle();
  puz.express(mockPuzzleConfig)(req, res, next);
});

app.listen(3000);