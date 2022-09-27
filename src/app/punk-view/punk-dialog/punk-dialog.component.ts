import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

export interface DialogData {
  punk: any;
}

@Component({
  selector: 'punk-dialog',
  templateUrl: 'punk-dialog.component.html',
  styleUrls: ['./punk-dialog.component.scss']
})
export class PunkDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }


  getPunkPic() {
    if (this.data.punk.id < 10) {
      return "https://notlarvalabs.com/static/punk000" + this.data.punk.id + ".svg";
    } else if (this.data.punk.id < 100) {
      return "https://notlarvalabs.com/static/punk00" + this.data.punk.id + ".svg";
    } else if (this.data.punk.id < 1000) {
      return "https://notlarvalabs.com/static/punk0" + this.data.punk.id + ".svg";
    } else {
      return "https://notlarvalabs.com/static/punk" + this.data.punk.id + ".svg";
    }
  }

  getV2URL() {
    return "https://cryptopunks.app/cryptopunks/details/"+ this.data.punk.id.toString();
  }

  getV1BestOfferURL() {
    if(this.data.punk.bestOffer){
      return this.data.punk.bestOffer.url;
    }
    return "https://opensea.io/assets/ethereum/0x282bdd42f4eb70e7a9d9f40c8fea0825b7f68c5d/"+ this.data.punk.id.toString();
  }

  getAddress(address: any) {
    if(address){
      if(address.id){
        return address.id;
      }
    }
    return ''
  }

  checkAddress(address: any) {
    if(address){
      if(address.id){
        return true;
      }
    }
    return false;
  }

  sortEvents(events: any) {
    return events.sort(this.sortEventFilter())
  }

  public sortEventFilter() {
    return function (a: any, b: any) {
      if(Number.parseInt(a.blockNumber) === (Number.parseInt(b.blockNumber))){
        return 0;
      }
      return (Number.parseInt(a.blockNumber) < Number.parseInt(b.blockNumber) ? 1 : -1);
    };
  }

  parseETH(amount: string) {
    let getNum = Number.parseInt(amount) / 1000000000000000000;
    let fixedNum = getNum.toFixed(3);
    return Number.parseFloat(fixedNum.toString());
  }

  getLinkOwner(owner: any) {
    return "https://etherscan.io/address/"+owner;
  }
}
