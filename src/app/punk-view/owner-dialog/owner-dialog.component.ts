import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

export interface DialogData {
  owner: any;
}

@Component({
  selector: 'owner-dialog',
  templateUrl: 'owner-dialog.component.html',
  styleUrls: ['./owner-dialog.component.scss']
})
export class OwnerDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
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

}
