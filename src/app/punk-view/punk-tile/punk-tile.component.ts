import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-punk-tile',
  templateUrl: './punk-tile.component.html',
  styleUrls: ['./punk-tile.component.scss']
})
export class PunkTileComponent implements OnInit {
  @Input() punk: any;

  constructor() {
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
}
