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
}
