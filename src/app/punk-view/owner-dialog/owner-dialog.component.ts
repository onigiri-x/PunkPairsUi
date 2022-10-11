import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {PageEvent} from "@angular/material/paginator";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";

export interface DialogData {
  ownersPunkList: any;
  ogNameAddress: string;
  address: string;
}

@Component({
  selector: 'owner-dialog',
  templateUrl: 'owner-dialog.component.html',
  styleUrls: ['./owner-dialog.component.scss']
})
export class OwnerDialogComponent {
  cols = 1;
  lowValue: number = 0;
  highValue: number = 16;
  gridByBreakpoint = {
    xl: 8,
    lg: 4,
    md: 3,
    sm: 2,
    xs: 1
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private breakpointObserver: BreakpointObserver) {
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

  public getPaginatorData(event: PageEvent): PageEvent {
    this.lowValue = event.pageIndex * event.pageSize;
    this.highValue = this.lowValue + event.pageSize;
    return event;
  }

  getOrderList(punksList: any) {
    if(!punksList){
      return [];
    }
    return punksList;
  }

  getPunkPic(punk: any) {
    if (punk.id < 10) {
      return "https://notlarvalabs.com/static/punk000" + punk.id + ".svg";
    } else if (punk.id < 100) {
      return "https://notlarvalabs.com/static/punk00" + punk.id + ".svg";
    } else if (punk.id < 1000) {
      return "https://notlarvalabs.com/static/punk0" + punk.id + ".svg";
    } else {
      return "https://notlarvalabs.com/static/punk" + punk.id + ".svg";
    }
  }

  hasEthName(name:string): boolean{
    if(name.length !== 42 || name.slice(0,2) !== '0x'){
      return true
    }
    return false;
  }

  getLinkOwner(owner: any) {
    return "https://etherscan.io/address/"+owner;
  }
}
