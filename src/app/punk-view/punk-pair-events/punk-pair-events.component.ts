import {Component, Input, OnInit} from '@angular/core';
import {PunkDialogComponent} from "../punk-dialog/punk-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {Apollo, gql} from "apollo-angular";
import {getNickname} from "../../ownerslist";

@Component({
  selector: 'app-punk-pair-events',
  templateUrl: './punk-pair-events.component.html',
  styleUrls: ['./punk-pair-events.component.scss']
})
export class PunkPairEventsComponent implements OnInit {
  punkPairingEvents: any;

  constructor(public dialog: MatDialog, private apollo: Apollo) {
    this.apollo
      .watchQuery({
        query: gql`
            {
               punkPairingEvents(first: 100, orderDirection:desc, orderBy:timestamp) {
                id
                punkId
                txHash
                timestamp
                wasPaired
                pairOwner{
                  id
                }
              }
            }
          `,
      })
      .valueChanges.subscribe((result: any) => {
        console.log('result from punk pairing');
        console.log(result?.data?.punkPairingEvents);
        this.punkPairingEvents = result?.data?.punkPairingEvents;
    });
  }

  ngOnInit(): void {
        throw new Error('Method not implemented.');
    }

  getPunkPic(punk: number) {
    if (punk < 10) {
      return "https://notlarvalabs.com/static/punk000" + punk + ".svg";
    } else if (punk < 100) {
      return "https://notlarvalabs.com/static/punk00" + punk + ".svg";
    } else if (punk < 1000) {
      return "https://notlarvalabs.com/static/punk0" + punk + ".svg";
    } else {
      return "https://notlarvalabs.com/static/punk" + punk + ".svg";
    }
  }

  openDialog(punk: any) {
    this.dialog.open(PunkDialogComponent, {
      data: {
        punk,
      },
    });
  }

  parseETH(amount: string) {
    let getNum = Number.parseInt(amount) / 1000000000000000000;
    let fixedNum = getNum.toFixed(3);
    return Number.parseFloat(fixedNum.toString());
  }

  getTimestamp(timestamp:  number) {
      var newDate = new Date();
      newDate.setTime(timestamp*1000);
      return newDate.toUTCString();
  }

  getNickName(id: any) {
    return getNickname(id).slice(0,15);
  }

  getTxHash(hash: any){
    return 'https://etherscan.io/tx/'+hash;
  }
}
