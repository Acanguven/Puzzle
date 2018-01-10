const expect = require('chai').expect;
const Puzzle = require('../lib/puzzle');


const mockPuzzleConfig = {
  prePuzzle: '<html>',
  postStyle: '</head><body>',
  page: {
    rows: '50px 30px auto',
    columns: '1fr',
    container: 'body'
  },
  components: {
    header: {
      row: '1',
      col: '1',
      content: new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve('<div>Content of <b>header</b> component</div>')
        }, 3000);
      }),
      placeholder: '<div>Placeholder of header component</div>'
    },
    boutiqueTabs: {
      row: '2',
      col: '1',
      content: new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve('<div>Content of <b>boutiqueTabs</b> component</div>')
        }, 1500);
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


describe('Npm', () => {
  it('Should export module', () => {
    expect(typeof Puzzle).equal('function');
  });
});

describe('Puzzle', () => {
  const puzzle = new Puzzle();

  it('Should create css grid definitions', () => {
    const puzzleGridStyle = puzzle.__createPuzzleGridDefinition(mockPuzzleConfig.page);
    expect(puzzleGridStyle).equal(`${mockPuzzleConfig.page.container}{display:grid;grid-template-columns:${mockPuzzleConfig.page.columns};grid-template-rows:${mockPuzzleConfig.page.rows};}`);
  });

  it('Should create component grid definitions', () => {
    const componentGridStyle = puzzle.__createComponentGridDefinitions(mockPuzzleConfig.components);
    let styles = [
      `[p1]{grid-column:${mockPuzzleConfig.components.header.col};grid-row:${mockPuzzleConfig.components.header.row};}`,
      `[pl1]{grid-column:${mockPuzzleConfig.components.header.col};grid-row:${mockPuzzleConfig.components.header.row};}`,
      `[p2]{grid-column:${mockPuzzleConfig.components.boutiqueTabs.col};grid-row:${mockPuzzleConfig.components.boutiqueTabs.row};}`,
      `[pl2]{grid-column:${mockPuzzleConfig.components.boutiqueTabs.col};grid-row:${mockPuzzleConfig.components.boutiqueTabs.row};}`,
      `[p3]{grid-column:${mockPuzzleConfig.components.boutiqueList.col};grid-row:${mockPuzzleConfig.components.boutiqueList.row};}`,
    ];
    expect(componentGridStyle).equal(styles.join(''));
  });

  it('Should create full puzzle style', () => {
    const puzzleGridStyle = puzzle.__buildPuzzleStyle(mockPuzzleConfig);
    expect(puzzleGridStyle).equal(`<style>${mockPuzzleConfig.page.container}{display:grid;grid-template-columns:${mockPuzzleConfig.page.columns};grid-template-rows:${mockPuzzleConfig.page.rows};}` + [
      `[p1]{grid-column:${mockPuzzleConfig.components.header.col};grid-row:${mockPuzzleConfig.components.header.row};}`,
      `[pl1]{grid-column:${mockPuzzleConfig.components.header.col};grid-row:${mockPuzzleConfig.components.header.row};}`,
      `[p2]{grid-column:${mockPuzzleConfig.components.boutiqueTabs.col};grid-row:${mockPuzzleConfig.components.boutiqueTabs.row};}`,
      `[pl2]{grid-column:${mockPuzzleConfig.components.boutiqueTabs.col};grid-row:${mockPuzzleConfig.components.boutiqueTabs.row};}`,
      `[p3]{grid-column:${mockPuzzleConfig.components.boutiqueList.col};grid-row:${mockPuzzleConfig.components.boutiqueList.row};}`,
    ].join('') + '</style>');
  });

  it('Should build component placeholders', () => {
    const componentPlaceholders = puzzle.__buildComponentPlaceholders(mockPuzzleConfig.components);
    expect(componentPlaceholders).equal(`<div pl1><div>Placeholder of header component</div></div><div pl2><div>Placeholder of boutiqueTabs component</div></div>`);
  });

  it('Should flush first chunk (preContent + style + postStyle)', (done) => {
    const expectedFirstFlush = mockPuzzleConfig.prePuzzle + puzzle.__buildPuzzleStyle(mockPuzzleConfig) + mockPuzzleConfig.postStyle + puzzle.__buildComponentPlaceholders(mockPuzzleConfig.components);
    puzzle.setStreamWrite((content) => {
      expect(content).equal(expectedFirstFlush);
      done();
    });
    puzzle.page(mockPuzzleConfig);
  });
});

describe('Express Middleware', () => {
  const puzzle = new Puzzle();

  it('Should export express function', function () {
    expect(typeof puzzle.express).equal('function');
  });

  it('Express middleware should return a function', () => {
    expect(typeof puzzle.express(mockPuzzleConfig)).equal('function');
  });
});