import { Component, OnInit } from '@angular/core';
import {Apollo, gql} from 'apollo-angular';
import {PageEvent} from "@angular/material/paginator";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-punk-view',
  templateUrl: './punk-view.component.html',
  styleUrls: ['./punk-view.component.scss']
})
export class PunkViewComponent implements OnInit {
  cols = 1;
  loading = true;

  gridByBreakpoint = {
    xl: 8,
    lg: 4,
    md: 3,
    sm: 2,
    xs: 1
  }
  uri = 'https://api.thegraph.com/subgraphs/name/onigiri-x/experimental';
  punksList: any;

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
        this.punksList = result?.data?.punks;

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
          this.loading = false;
        });
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

  public getOwnersArray() {
    const owners = new Map<number, []>;
    if(this.punksList){
      for(let i=0; i< this.punksList.length; i++){

      }
    }
    this.punksList
  }

  getOrderList(punksList: any) {
    if(!punksList){
      return [];
    }
    return punksList;
  }
}
