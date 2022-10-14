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
import {OwnerDialogComponent} from "./owner-dialog/owner-dialog.component";


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

  columnsToDisplay = ['Pairs','Addresses'];
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
          this.myTableDataArray.push({Addresses: keys[dataset.length - 1 - i], Pairs: dataset[dataset.length - 1 - i]});
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

  getOwnersList(): Map<string,string> {
    let owners = new Map<string, string>;
    owners.set('0xa858ddc0445d8131dac4d1de01f834ffcba52ef1', 'Yuga Labs');
    owners.set('0x26f744711ee9e5079cbeaf318ba8a8e938844de6', 'smithdavid888.eth');
    owners.set('0x577ebc5de943e35cdf9ecb5bbe1f7d7cb6c7c647', 'Mr 703');
    owners.set('0xcc7c335f3365ae3f7e4e8c9535dc92780a4add9d', 'Ape123');
    owners.set('0x6f4a2d3a4f47f9c647d86c929755593911ee91ec', 'Shaw');
    owners.set('0x6611fe71c233e4e7510b2795c242c9a57790b376', 'Moineau');
    owners.set('0xc480fb0ebea2591470f571436926785be5ebcd22', '3DG');
    owners.set('0x0258558bf2a4ffceec4a2311b36ef124d3a4116e', 'STRANGLEH0DL_VAULT');
    owners.set('0x06bf2b4da028b66fb08a75dd872acb9a483e5639', 'BBL');
    owners.set('0xf31f591b3dcd383047d7045de96a200a09e4dde1', 'Tomakinz');
    owners.set('0x0da0df4be467140e74c76257d002f52e954be4d3', 'Metakid');
    owners.set('0xb38071b23f0fa92cf9e1bd6feec5a5f9821f3ccc', 'Morfojin');
    owners.set('0x8b7a5b22175614ee194e9e02e9fe0a1b5414c75e', 'kryptos.eth');
    owners.set('0xd4fa6e82c77716fa1ef7f5defc5fd6eeefbd3bff', 'PrettyMerlot');
    owners.set('0x51ec89f1fcfed8c69a1b0865a7550ece0677cf5f', 'InSlothWeTrust');
    owners.set('0x6fb3ae4ecf5a42788249e95b931913a4fc3d488c', 'Spilliaer');
    owners.set('0xa6e2e910515e6cf485462eeb6e454df33c60cb0e', 'nakamotosatoshi.eth');
    owners.set('0x2b616914ada8484ab9d70398dbe86b029b1a9a39', 'kc');
    owners.set('0x6301add4fb128de9778b8651a2a9278b86761423', 'athrab.eth');
    owners.set('0x030defb961d3f3480a574cedf6ead227a7a8106b', 'superpleb.eth');
    owners.set('0xc24f574d6853f6f6a31c19d468a8c1b3f31c0e54', 'shilpixels.eth');
    owners.set('0x783ca9833d58a6b39ee72db81f07571d72c0064e', 'pjcurly.eth');
    owners.set('0x94de7e2c73529ebf3206aa3459e699fbcdfcd49b', 'tonyherrera.eth');
    owners.set('0x97ad156c48078cf174905ffb5cb7ca56295924b8', 'Tony Herrera Vault');
    owners.set('0xfaf9f63baf57b19ca4e9490aaab1ede8b66cc2b5', 'vr-punk.eth');
    owners.set('0x000001f568875f378bf6d170b790967fe429c81a', 'bokkypoobah.eth');
    owners.set('0xeb26e394da8d8ad5bedde97a281a9a9b63b3eef3', 'trademuch.eth');
    owners.set('0x00000217d2795f1da57e392d2a5bc87125baa38d', 'shittybank.eth');
    owners.set('0x8884f2af43bcbd9ab81f7a4ac35f421df1926810', 'alien3443.eth');
    owners.set('0x2be830c9c4a3eb3f9ebf736eed948e9ec1f1f33b', '3690.eth');
    owners.set('0xaf7cf5910510b7cf912c156f91244487632e5fb6', 'vault.seanbonner.eth');
    owners.set('0x2754637ab168ff25412b74997c0e4f43c30bb323', 'thecryptopunk.eth');
    owners.set('0xbde05e34ea7e059a56428985b66ae07fbc41a497', 'cyberpnk.eth');
    owners.set('0xe4bbcbff51e61d0d95fcc5016609ac8354b177c4', 'Steve Aoki');
    owners.set('0xfd845e07717b0329d3f19fc920c97fba0bc4ee31', 'j10.eth');
    owners.set('0x4a39ae58b605102913ac19b7c071da75b55b2674', 'punk7635.eth');
    owners.set('0x5bc02aab45797065768f68857b61e1dc60b26a89', 'omu.eth');
    owners.set('0x1e32a859d69dde58d03820f8f138c99b688d132f', 'straybits.eth');
    owners.set('0xc5d5560af8d0dcacaf8b8cee91911c4833c3f551', 'andrewii.eth');
    owners.set('0xb01e39a4965475047016544931f4b05b905b7059', 'punk4722.eth');
    owners.set('0xee075d16773517479f0ddba8cbc974ae4e1e205c', 'panksy.eth');
    owners.set('0x647eb74a5135a0f24beee3c2d8432adcbb32c2a8', 'iancr.eth');
    owners.set('0x457ec0c459f3ac559ceb48951675fbae4c744288', 'vault.robertclarke.eth');
    owners.set('0x81b9a5f21efdb5df0210471b9a94e0d4ad9951ed', 'valko.eth');

    return owners;
}

  getNickname(owner: string){
   let owners = this.getOwnersList();
    const nickname = owners.get(owner);
    if(nickname){
      return nickname;
    }
    return owner;
  }

  getByValue(map: Map<string,string>, searchValue: any) {
    for (let [key, value] of map.entries()) {
      if (value === searchValue)
        return key;
    }
    return '0x0000000000000000000000000000000000000000'
  }

  getAddressFromNickname(owner: string){
   let owners = this.getOwnersList();
    const address = this.getByValue(owners, owner);
    if(address){
      return address;
    }
    return '0x0000000000000000000000000000000000000000';
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

  callOwnerDialog(value: any) {
    console.log('the owner data package is');
    console.log(value);
    console.log(value.Addresses);
    console.log(value.Addresses.slice(0,2));
    let ogNameAddress = value.Addresses;
    let address = value.Addresses;
    if(address.length !== 42 || address.slice(0,2) !== '0x'){
      // Need to reverse encode the nickname
      address = this.getAddressFromNickname(address);
    }

    value = address;
      if(value){
        let ownersPunkList = this.punksList.filter(((x: { owner: { id: string; }; }) => x.owner.id === value));
        if(ownersPunkList){
          this.validPunkOnForm = parseInt(value);
            this.dialog.open(OwnerDialogComponent, {
              data: {
                ownersPunkList,
                ogNameAddress,
                address
              },
              width: '90%'
            });
        } else{
          console.log('invalid owner');
        }
      }
  }

  getPunkOwner(validPunkOnForm: number) {
    let punk = this.punksList.find((x: { id: string; }) => x.id === validPunkOnForm.toString());
    if(punk){
      return this.getNickname(punk.owner.id);
    }
    return '0x0000000000000000000000000000000000000000'
  }
}
