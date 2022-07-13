import {Component, OnInit, ViewChild} from '@angular/core';
import {Apollo, gql} from 'apollo-angular';
import {PageEvent} from "@angular/material/paginator";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {ErrorStateMatcher} from "@angular/material/core";
import {FormControl, FormGroupDirective, NgForm, Validators} from "@angular/forms";

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

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

  }

  public chartHovered({ event, active }: { event: ChartEvent | undefined, active: {}[] }): void {

  }

  cols = 1;
  loading = true;
  owners: Map<string, number[]> | undefined;

  columnsToDisplay = ['Addresses', 'NumberOfPunks'];
  myTableDataArray: any;

  punkFormControl = new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(1)]);

  matcher = new MyErrorStateMatcher();

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
         // this.owners = this.getOwnersArray();
        });
    this.apollo
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
        const ownerNickname = this.getNickname(punk.owner.id);
        let array = owners.get(ownerNickname);
        if(!array){
          array = [];
        }

        array.push(punk.id);

        owners.set(ownerNickname, array);
      }
    }
    console.log('the owners are');
    console.log([...owners.entries()]);
    this.owners = owners;
   // if([...owners.entries()].length > 100) {
      this.setChart([...owners.entries()]);
   // }
    return owners;
  }

  setChart(ownerArray: [string, number[]][]): void{
    // Pie chart
    if(this.owners) {
      let keys = Array.from(this.owners.keys());
      let dataset = [];
      for (let i=0; i<keys.length; i++){
        const key = keys[i];

          let values = ownerArray;
          dataset.push(values[i][1].length);

      }

       var temp;

      for (var i = 0; i < dataset.length; i++) {
        for (var j = i + 1; j < dataset.length; j++) {
            if (dataset[i] > dataset[j]) {
                temp = dataset[i];
                dataset[i] = dataset[j];
                dataset[j] = temp;

                temp = keys[i];
                keys[i] = keys[j];
                keys[j] = temp;
            }
        }
    }

      this.pieChartData.labels = keys;
      //this.pieChartData.labels = Array.from(this.owners.keys());
      this.pieChartData.datasets =  [ {
        data: dataset
       } ];
      console.log('the owners are');
      console.log(keys);
      console.log(dataset);

      // Data table
      this.myTableDataArray = [];
      for(let i=0; i<dataset.length ; i++){
          this.myTableDataArray.push({Addresses: keys[dataset.length - 1 - i], NumberOfPunks: dataset[dataset.length - 1 - i]});
      }
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

  getNickname(owner: string){
    let owners = new Map<string, string>;
    owners.set('0xa858ddc0445d8131dac4d1de01f834ffcba52ef1', 'Yuga Labs');
    owners.set('0x26f744711ee9e5079cbeaf318ba8a8e938844de6', 'smithdavid888.eth');
    owners.set('0x6301add4fb128de9778b8651a2a9278b86761423', 'athrab.eth');
    owners.set('0x030defb961d3f3480a574cedf6ead227a7a8106b', 'superpleb.eth');
    owners.set('0xc24f574d6853f6f6a31c19d468a8c1b3f31c0e54', 'shilpixels.eth');
    owners.set('0x783ca9833d58a6b39ee72db81f07571d72c0064e', 'pjcurly.eth');
    owners.set('0x94de7e2c73529ebf3206aa3459e699fbcdfcd49b', 'tonyherrera.eth');
    const nickname = owners.get(owner);
    if(nickname){
      return nickname;
    }
    return owner;
  }
}
