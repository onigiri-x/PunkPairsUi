import {Component, OnInit, ViewChild} from '@angular/core';
import {Apollo, gql} from 'apollo-angular';
import {PageEvent} from "@angular/material/paginator";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {FormControl, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {PunkDialogComponent} from "./punk-dialog/punk-dialog.component";


@Component({
  selector: 'app-punk-view',
  templateUrl: './punk-view.component.html',
  styleUrls: ['./punk-view.component.scss']
})
export class PunkViewComponent implements OnInit {
  @ViewChild( BaseChartDirective ) chart: BaseChartDirective | undefined;
  public dataSource: any;

  public v1Floor: any;

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

  columnsToDisplay = ['NumberOfPunks','Addresses'];
  myTableDataArray: any;

  punkFormControl = new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(1),Validators.maxLength(4)]);

  gridByBreakpoint = {
    xl: 8,
    lg: 4,
    md: 3,
    sm: 2,
    xs: 1
  }
  uri = 'https://api.thegraph.com/subgraphs/name/onigiri-x/experimental2';
  punksList : any = [] ;
  snipeList : any = [] ;


  constructor(private apollo: Apollo, public dialog: MatDialog, private breakpointObserver: BreakpointObserver) {
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
    const options = {method: 'GET', headers: {Accept: '*/*', 'x-api-key': 'demo-api-key'}};
    fetch('https://api.reservoir.tools/orders/asks/v3?contracts=0x282bdd42f4eb70e7a9d9f40c8fea0825b7f68c5d&includePrivate=false&includeMetadata=false&includeRawData=false&sortBy=createdAt&limit=1000', options)
      .then(response => response.json())
      .then(response => {
        this.v1Floor = response.orders;
        // Next is to search subgraph for just these token ids

        let v1TokenIds = this.v1Floor.map((x: any)=>{
          return x.tokenSetId.slice(49);
        });

        this.apollo
          .watchQuery({
            query: gql`
            {
               punks(first: 1000, where: {id_in: [${v1TokenIds.toString()}]}) {
                id
                owner {
                  id
                }
                pairedV1
                currentAsk{
                  open
                  amount
                }
                currentBid{
                  amount
                  from{
                    id
                  }
                }
                numberOfTransfers
                numberOfSales
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
          this.snipeList = result?.data?.punks;
          this.snipeList = this.shuffle(this.snipeList);
          this.processSnipes(this.v1Floor);
          this.snipeList = this.snipeList.sort(this.sortFloorByTotalPrice());
        });
      })
      .catch(err => console.error(err));

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
                currentAsk{
                  open
                  amount
                }
                currentBid{
                  amount
                  from{
                    id
                  }
                }
                numberOfTransfers
                numberOfSales
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
              currentAsk{
                amount
                open
              }
              currentBid{
                amount
                from{
                  id
                }
              }
              numberOfTransfers
              numberOfSales
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
        this.punksList = this.punksList.concat(result?.data?.punks);
        this.punksList = this.shuffle(this.punksList);
        this.loading = false;
        this.owners = this.getOwnersArray();
        if(this.punksList.length > 1001){
          this.punksList = this.punksList.sort(this.sortFloor());
          if(this.v1Floor) {
            this.processV1(this.v1Floor);
          }
          // @ts-ignore
          document.getElementById('loading').style.display = 'none';
        }
      });
  }

  public processV1(v1Floor: any){
    for(let i=0; i< this.punksList.length; i++){
        let tokenId = this.punksList[i].id;
        let filteredV1s = v1Floor.filter((x: { tokenSetId: string; })=> {
          return x.tokenSetId === 'token:0x282bdd42f4eb70e7a9d9f40c8fea0825b7f68c5d:'+tokenId.toString();
        });
        if(filteredV1s.length >0) {
          filteredV1s = filteredV1s.sort(this.sortV1s());
          this.punksList[i].v1FloorPrice = filteredV1s[0].price.amount.native;
          this.punksList[i].bestOffer = filteredV1s[0].source;
        }
    }

    this.punksList = this.punksList.sort(this.sortFloorByV1s())
  }

  public processSnipes(v1FloorSnipes: any){
    for(let i=0; i< this.snipeList.length; i++){
        let tokenId = this.snipeList[i].id;
        let filteredV1s = v1FloorSnipes.filter((x: { tokenSetId: string; })=> {
          return x.tokenSetId === 'token:0x282bdd42f4eb70e7a9d9f40c8fea0825b7f68c5d:'+tokenId.toString();
        });
        if(filteredV1s.length >0) {
          filteredV1s = filteredV1s.sort(this.sortV1s());
          this.snipeList[i].v1FloorPrice = filteredV1s[0].price.amount.native;
          this.snipeList[i].bestOffer = filteredV1s[0].source;

          if(this.snipeList[i].currentAsk && this.snipeList[i].currentAsk.open === true){
            this.snipeList[i].totalPrice = Number.parseFloat((this.snipeList[i].v1FloorPrice + ( Number.parseInt(this.snipeList[i].currentAsk.amount) / 1000000000000000000)).toFixed(3));
          }
        }
    }

    this.snipeList = this.snipeList.filter((x: { totalPrice: any })=> {
      return x.totalPrice > 0;
    });
  }

  public sortFloorByTotalPrice() {
    return function (a: any, b: any) {
      // equal items sort equally
      if(a.totalPrice && b.totalPrice) {
        if (a.totalPrice === b.totalPrice) {
          return 0;
        } else{
          return a.totalPrice < b.totalPrice ? -1 : 1;
        }
      }

      if(a.totalPrice){
        return -1;
      }
      if(b.totalPrice){
        return 1;
      }



      return 0;
    };
  }

  public sortFloorByV1s() {
    return function (a: any, b: any) {
      // equal items sort equally
      if(a.v1FloorPrice && b.v1FloorPrice) {
        if (a.v1FloorPrice === b.v1FloorPrice) {
          return 0;
        } else{
          return a.v1FloorPrice < b.v1FloorPrice ? -1 : 1;
        }
      }

      if(a.v1FloorPrice){
        return -1;
      }
      if(b.v1FloorPrice){
        return 1;
      }


      return 0;
    };
  }

  public sortFloor() {
    return function (a: any, b: any) {
      // equal items sort equally
      if(a.currentAsk && b.currentAsk) {
        if (a.currentAsk.amount === b.currentAsk.amount) {
          return 0;
        }
      }

      // nulls sort after anything else
      if (a.currentAsk === null) {
        return 1;
      }
      if (b.currentAsk === null) {
        return -1;
      }

      if(a.currentAsk.open === false){
        return 1
      }

      if(b.currentAsk.open === false){
        return -1
      }

      // // otherwise, if we're ascending, lowest sorts first
      // if (ascending) {
        return Number.parseInt(a.currentAsk.amount) < Number.parseInt(b.currentAsk.amount) ? -1 : 1;
      // }
      //
      // // if descending, highest sorts first
      // return a < b ? 1 : -1;
    };
  }

  public sortV1s() {
    return function (a: any, b: any) {
        if(a.price.amount.native === b.price.amount.native){
          return 0;
        }
        return a.price.amount.native < b.price.amount.native ? -1 : 1;
    };
  }

  lowValue: number = 0;
  highValue: number = 24;

  // used to build a slice of papers relevant at any given time
  public getPaginatorData(event: PageEvent): PageEvent {
    this.lowValue = event.pageIndex * event.pageSize;
    this.highValue = this.lowValue + event.pageSize;
    return event;
  }


  shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  };

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

  validPunkOnForm: number | null  = null;

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

  callPunkQuery(value: string | null) {
      if(value){
        let punk = this.punksList.find((x: { id: string; }) => x.id === value);
        if(punk){
          this.validPunkOnForm = parseInt(value);
            this.dialog.open(PunkDialogComponent, {
              data: {
                punk,
              },
            });
        } else{
          this.validPunkOnForm = null
        }
      }  else{
        this.validPunkOnForm = null
      }
  }

  getPunkOwner(validPunkOnForm: number) {
    let punk = this.punksList.find((x: { id: string; }) => x.id === validPunkOnForm.toString());
    return this.getNickname(punk.owner.id);
  }
}
