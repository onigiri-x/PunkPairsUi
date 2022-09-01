import {Component, Input, OnInit} from '@angular/core';
import {PunkDialogComponent} from "../punk-dialog/punk-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-punk-tile',
  templateUrl: './punk-tile.component.html',
  styleUrls: ['./punk-tile.component.scss']
})
export class PunkTileComponent implements OnInit {
  @Input() punk: any;

  constructor(public dialog: MatDialog) {
  }

  ngOnInit(): void {

  }

  getPunkPic() {
    if (this.punk.id < 10) {
      return "https://notlarvalabs.com/static/punk000" + this.punk.id + ".svg";
    } else if (this.punk.id < 100) {
      return "https://notlarvalabs.com/static/punk00" + this.punk.id + ".svg";
    } else if (this.punk.id < 1000) {
      return "https://notlarvalabs.com/static/punk0" + this.punk.id + ".svg";
    } else {
      return "https://notlarvalabs.com/static/punk" + this.punk.id + ".svg";
    }
  }

  openDialog() {
    this.dialog.open(PunkDialogComponent, {
      data: {
        punk: this.punk,
      },
    });
  }
}
