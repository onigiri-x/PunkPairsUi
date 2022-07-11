import {Component, OnInit, ViewChild} from '@angular/core';
import {Apollo, gql} from 'apollo-angular';
import {PageEvent} from "@angular/material/paginator";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-punk-view',
  templateUrl: './punk-view.component.html',
  styleUrls: ['./punk-view.component.scss']
})
export class PunkViewComponent implements OnInit {
  @ViewChild( BaseChartDirective ) chart: BaseChartDirective | undefined;
  public dataSource: any;
  title = 'app';

  // Pie
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,

    plugins: {
      legend: {
        display: false,
      },

     datalabels: {
       display: true,
        formatter: (value) => {
          return value + ' Pairs';
        },
        align: 'center',
        backgroundColor: 'white',
        borderRadius: 100,
        padding:2,
        font: {
          size: 15,
        }
      },
      tooltip: {
      caretSize: 30,
        bodyFont: {
        size: 40
        }
    }

    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [ ],
    datasets: [ {
      data: [ ]
    } ]
  };
  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [ DatalabelsPlugin ];

  // events
  public chartClicked({ event, active }: { event?: ChartEvent | undefined , active?: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: ChartEvent | undefined, active: {}[] }): void {
    console.log(event, active);
  }

  cols = 1;
  loading = true;
  owners: Map<string, number[]> | undefined;

  gridByBreakpoint = {
    xl: 8,
    lg: 4,
    md: 3,
    sm: 2,
    xs: 1
  }
  uri = 'https://api.thegraph.com/subgraphs/name/onigiri-x/experimental';
  punksList : any = [] ;

 tokensQuery2 = `
  query {
    punks(first: 1000, skip: 1000, where: {pairedV1: true}) {
      id
      owner {
        id
      }
      pairedV1
      events{
      id
      blockNumber
      blockHash
      type
      from{
        id
      }
      to{
        id
      }
      txHash
    }
  }
`

  constructor(private apollo: Apollo, private breakpointObserver: BreakpointObserver) {
   this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
    ]).subscribe(result => {
      if (result.matches) {
        if (result.breakpoints[Breakpoints.XSmall]) {
          this.cols = this.gridByBreakpoint.xs;
        }
        if (result.breakpoints[Breakpoints.Small]) {
          this.cols = this.gridByBreakpoint.sm;
        }
        if (result.breakpoints[Breakpoints.Medium]) {
          this.cols = this.gridByBreakpoint.md;
        }
        if (result.breakpoints[Breakpoints.Large]) {
          this.cols = this.gridByBreakpoint.lg;
        }
        if (result.breakpoints[Breakpoints.XLarge]) {
          this.cols = this.gridByBreakpoint.xl;
        }
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.apollo
        .watchQuery({
          query: gql`
            {
              punks(first: 1000, skip:1000, where: {pairedV1: true}) {
                id
                owner {
                  id
                }
                pairedV1
                events{
                  id
                  blockNumber
                  blockHash
                  type
                  from{
                    id
                  }
                  to{
                    id
                  }
                  txHash
                }
              }
            }
          `,
        })
        .valueChanges.subscribe((result: any) => {
          console.log(result?.data);
          this.punksList = this.punksList.concat(result?.data?.punks);
          this.owners = this.getOwnersArray();
        });
        await this.apollo
      .watchQuery({
        query: gql`
          {
            punks(first: 1000, where: {pairedV1: true}) {
              id
              owner {
                id
              }
              pairedV1
              events{
                id
                blockNumber
                blockHash
                type
                from{
                  id
                }
                to{
                  id
                }
                txHash
              }
            }
          }
        `,
      })
      .valueChanges.subscribe((result: any) => {
        console.log(result?.data);
        this.punksList = this.punksList.concat(result?.data?.punks);
        this.loading = false;
        this.owners = this.getOwnersArray();
      });
  }

  lowValue: number = 0;
  highValue: number = 24;

  // used to build a slice of papers relevant at any given time
  public getPaginatorData(event: PageEvent): PageEvent {
    this.lowValue = event.pageIndex * event.pageSize;
    this.highValue = this.lowValue + event.pageSize;
    return event;
  }

  public getOwnersArray(): Map<string, number[]> {
    const owners = new Map<string, number[]>;
    if(this.punksList){
      for(let i=0; i< this.punksList.length; i++){
        const punk = this.punksList[i];
        let array = owners.get(punk.owner.id);
        if(!array){
          array = [];
        }

        array.push(punk.id);

        owners.set(punk.owner.id, array);
      }
    }
    console.log('the owners are');
    console.log([...owners.entries()]);
    if([...owners.entries()].length > 100) {
      this.setChart([...owners.entries()]);
    }
    return owners;
  }

  setChart(ownerArray: [string, number[]][]): void{
    if(this.owners) {
      let keys = Array.from(this.owners.keys());
      let dataset = [];
      for (let i=0; i<keys.length; i++){
        const key = keys[i];

          let values = ownerArray;
          dataset.push(values[i][1].length);

      }

      var n = dataset.slice(0).sort((n1,n2) => n1 - n2)
      var a = [];
      for (var x in n)
      {
      let i: any = dataset.indexOf(n[x]);
      a.push(keys[i]);
      dataset[i] = null;
      }
      dataset = n
      keys = a

      this.pieChartData.labels = Array.from(this.owners.keys());
      this.pieChartData.datasets =  [ {
        data: dataset
       } ];
    }
  }

  getOrderList(punksList: any) {
    if(!punksList){
      return [];
    }
    return punksList;
  }

  getNumberOfOwners(): number{
    if(!this.owners){
      return 0;
    }
    let keys = Array.from( this.owners.keys() );
    return keys.length;
  }
  //
  // public chartClicked(e: any): void {
  //   if (e.active[0]) {
  //     const clickedIndex = e.active[0]._index;
  //     // this.openEditDialog(clickedIndex);
  //     console.log(e);
  //   }
  // }
  //
  // // event on pie chart slice hover
  // public chartHovered(e: any): void {
  //   console.log(e);
  // }
}
