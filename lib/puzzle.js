'use strict';

class Puzzle {
  constructor() {
    this.config = {
      attributePreText: 'p',
      componentParentTag: 'div'
    };

    this.__writeFn = null;
    this.__endFn = null;
    this.__flush = null;
  }

  __createPuzzleGridDefinition(pageGridOptions) {
    return `${pageGridOptions.container}{display:grid;grid-template-columns:${pageGridOptions.columns};grid-template-rows:${pageGridOptions.rows};}`;
  }

  __createComponentGridDefinitions(pageComponents) {
    return Object.keys(pageComponents).reduce((componentGridDefinitions, componentName, index) => {
      componentGridDefinitions.push(`[${this.config.attributePreText}${index + 1}]{grid-column:${pageComponents[componentName].col};grid-row:${pageComponents[componentName].row};}`)
      if (pageComponents[componentName].placeholder) {
        componentGridDefinitions.push(`[${this.config.attributePreText + 'l'}${index + 1}]{grid-column:${pageComponents[componentName].col};grid-row:${pageComponents[componentName].row};}`)
      }
      return componentGridDefinitions;
    }, []).join('');
  }

  __buildPuzzleStyle(puzzleConfig) {
    return '<style>' +
      this.__createPuzzleGridDefinition(puzzleConfig.page) +
      this.__createComponentGridDefinitions(puzzleConfig.components) +
      '</style>';
  }

  __handleComponentStream(puzzleConfig) {
    const self = this;
    let chunkNeeded = 0;
    let postFlushComponents = '';
    Object.keys(puzzleConfig.components).forEach((componentName, index) => {
      if (typeof puzzleConfig.components[componentName].content === 'string') {
        postFlushComponents += `<${this.config.componentParentTag} ${this.config.attributePreText}${index + 1}>${puzzleConfig.components[componentName].content}</${this.config.componentParentTag}>`;
      } else {
        chunkNeeded++;
        puzzleConfig.components[componentName].content().then((content) => {
          chunkNeeded--;
          self.__write(`<${this.config.componentParentTag} ${this.config.attributePreText}${index + 1}>${content}</${this.config.componentParentTag}><script>document.querySelector('[${this.config.attributePreText}l${index + 1}]').remove();</script>`);

          if (chunkNeeded === 0) {
            self.__end();
          }
        });
      }
    });

    self.__write(postFlushComponents);
  }

  __buildComponentPlaceholders(pageComponents) {
    return Object.keys(pageComponents).reduce((componentPlaceholders, componentName, index) => {
      if (pageComponents[componentName].placeholder) {
        componentPlaceholders.push(`<${this.config.componentParentTag} ${this.config.attributePreText}l${index + 1}>${pageComponents[componentName].placeholder}</${this.config.componentParentTag}>`);
      }
      return componentPlaceholders;
    }, []).join('');
  }

  __write(chunk) {
    if (this.__writeFn) {
      //todo handle response end
      this.__writeFn(chunk);
      this.__flush();
    }
  }

  __end() {
    if (this.__endFn) {
      this.__endFn();
    }
  }

  __renderComponent() {

  }

  setStreamWrite(fn) {
    this.__write = fn;
  }

  setStreamFlush(fn) {
    this.__flush = fn;
  }

  setStreamEnd(fn) {
    this.__end = fn;
  }

  page(puzzleConfig) {
    this.__write(puzzleConfig.prePuzzle + this.__buildPuzzleStyle(puzzleConfig) + (puzzleConfig.postStyle) + this.__buildComponentPlaceholders(puzzleConfig.components));
    this.__handleComponentStream(puzzleConfig);
  }

  express(puzzleConfig) {
    const self = this;

    return (req, res, next) => {
      self.setStreamWrite(res.write.bind(res));
      self.setStreamEnd(res.end.bind(res));
      self.setStreamFlush(res.flush.bind(res));
      self.page(puzzleConfig);
    }
  }
}

module.exports = Puzzle;
