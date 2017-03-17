namespace application {
  'use strict';

  interface IDTypeEle extends Array<{ iter: number, value: number, valueR: number }> { };
  export interface IDTypeHeatline {
    heatmapData: IDTypeEle;
    linechartData: IDTypeEle;
    max: number;
  }

  interface IScope extends ng.IScope {
    options: any;
    data: IDTypeHeatline;
  }

  class Painter {
    public Pip: IPipService;
    private svg: d4.Selection<any, any, any, any>;
    private rect: d4.Selection<any, any, any, any>;
    private width: number;
    private height: number;
    private offW: number;
    private offH: number;

    constructor(ele: ng.IAugmentedJQuery, public options: any) {

      // set container - div
      let container = d4.select(ele[0])
        .style('width', options.width + 'px')
        .style('height', options.height + 'px')
        .style('position', 'relative')
        .style('background', 'white');

      // initialize svg configuration
      this.svg = container
        .append('svg')
        .style('position', 'absolute')
        .style('left', 0)
        .style('top', 0)
        .style('width', options.width + 'px')
        .style('height', options.height + 'px');

      this.svg = this.svg.append('g')
        .attr('transform', 'translate(' + options.margin.left + ',' + options.margin.top + ')');

      // init env variables
      this.offW = options.margin.left;
      this.offH = options.margin.top;
      this.width = options.width - options.margin.left - options.margin.right;
      this.height = options.height - options.margin.top - options.margin.bottom;
    }

    public render(data: any, Pip: IPipService) {
      let this_ = this;
      this_.Pip = Pip;

      let fr = d4.scaleBand().range([0, this_.height]);
      let fc = d4.scaleBand().range([0, this_.width]);
      // reform data
      let r = [];
      data.forEach((v, k) => {
        r.push({ lid: +k, value: v });
      });
      r = _.sortBy(r, ['lid']);
      let tdr: any = _.range(r.length);
      let tdc: any = _.range(this_.options.classNum);
      fr.domain(tdr);
      fc.domain(tdc);
      // console.log('raw', data);
      // console.log('reform', r);

      this_.svg.append('rect')
        .attr('fill', 'white')
        .attr('width', this_.options.width)
        .attr('height', this_.options.height);

      let color = d4.scaleSequential(d4.interpolateBlues);
      let rows = this_.svg.selectAll('.row')
        .data(r)
        .enter().append('g')
        .attr('class', 'row')
        .attr('transform', (d, i: any) => 'translate(0,' + fr(i) + ')')
        .each(row);

      rows.append('line')
        .attr('x2', this_.options.width)
        .style('stroke', '#feab43')
        .style('stroke-width', 1);


      let cols = this_.svg.selectAll('.col')
        .data(_.range(this_.options.classNum))
        .enter().append('g')
        .attr('class', 'col')
        .attr('transform', (d, i: any) => 'translate(' + fc(i) + ', 0)');

      cols.append('line')
        .attr('y2', this_.options.height)
        .style('stroke', '#feab43')
        .style('stroke-width', 1);


      // rows.append('text')
      //   .attr('x', -6)
      //   .attr('y', fr.bandwidth() / 2)
      //   .attr('dy', '.32em')
      //   .attr('font-size', '12')
      //   .attr('text-anchor', 'end')
      //   .text((d: any) => this_.options.lidtoName[d.lid]);

      // let cols = this_.svg.selectAll('.column')
      //   .data(_.range(this_.options.classNum))
      //  .enter().append('g')
      //   .attr('class', 'column')
      //   .attr('transform', (d: any) => 'translate(' + fc(d) + ')rotate(-90)');

      function row(rowData) {
        // let pmax: any = _.max(rowData.value);
        let tmp = _.map(rowData.value, (d: any, i) => {
          return [+i, d];
        });
        for (let i of tmp) {
          _.each(i[1], (d, j) => {
            d.splice(0, 1);
            console.log(d.length);
          });
        };
        // console.log(rowData, tmp);
        // tmp = _.filter(tmp, d => d[1] > 0);
        let cell = d4.select(this).selectAll('.cell')
          .data(tmp)
          .enter().append('g')
          .attr('class', 'cell')
          .attr('transform', d => 'translate(' + fc(d[0]) + ', 0)' );
          // .each(drawRect);
          // .attr('x', (d: any) => fc(d[0]))
          // .attr('width', fc.bandwidth())
          // .attr('height', fr.bandwidth())
          // .attr('fill', (d: any) => color(d[1]).toString())
          // .append('title')
          // .text((d: any) => this_.options.class[d[0]].name);

        // let maxR = Math.max(fr.bandwidth() / 2, fc.bandwidth() / 2) - 2;
        // let innerCell = d4.select(this).selectAll('.inner-cell')
        //   .data(tmp)
        //   .enter().append('circle')
        //   .attr('class', 'inner-cell')
        //   .attr('cx', (d: any) => fc(d[0]) + fc.bandwidth() / 2)
        //   .attr('cy', fr.bandwidth() / 2)
        //   .attr('r', (d: any) => d[1] * maxR)
        //   .attr('fill', '#4c4c4c')
        //   .attr('opacity', 0.8);

      };

      function drawRect(rectData) {
        let set;
        let max = -1, maxH = fr.bandwidth() / 2;
        let tmp = _.map(rectData[1], (d: any, i) => {
          set = d.splice(0, 1)[0];
          if (d.length > max) { max = d.length; }
          return [i, d];
        });
        let arr = [];
        set.forEach(v => {
          arr.push(+v);
        });
        arr = _.sortBy(arr);
        let padding = (fc.bandwidth() - arr.length * 4) / 2;
        let f = d4.scaleOrdinal()
          .range([padding, fc.bandwidth() - padding]);
        f.domain(arr);
        let rc = d4.select(this).selectAll('.cell-circle')
          .data(tmp)
          .enter().append('rect')
          .attr('class', 'cell-circle')
          .attr('x', dd => { let kk: any = f(dd[0]); return kk - 2; } )
          .attr('y', dd => fr.bandwidth() / 2 - (dd[1].length / max * maxH) / 2 )
          .attr('width', 4)
          .attr('height', dd => { return dd[1].length / max * maxH; })
          .attr('fill', '#424446');
      }

    }


  }

  class Directive {

    public link: (
      scope: IScope,
      element: ng.IAugmentedJQuery,
      attrs: ng.IAttributes) => void;
    public restrict = 'A';
    public scope = {
      options: '=',
      data: '='
    };

    public static factory() {
      let directive = function (Pip) { return new Directive(Pip); };
      directive.$inject = ['Pip'];
      return directive;
    }

    constructor(Pip: IPipService) {
      this.link = function (
        scope: IScope,
        element: ng.IAugmentedJQuery,
        attrs: ng.IAttributes
      ) {

        let start = () => {
          element.empty();
          let board = new Painter(element, scope.options);
          board.render(scope.data, Pip);
        };
        if (!_.isUndefined(scope.data)) { start(); };
        scope.$watch('data', (n, o) => { if (n !== o && n) { start(); } }, false);

      };
    }
  }

  angular
    .module('vis')
    .directive('cMatrix', Directive.factory());
}