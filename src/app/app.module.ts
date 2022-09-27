import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PunkViewComponent } from './punk-view/punk-view.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {ApolloModule, APOLLO_OPTIONS} from 'apollo-angular';
import {HttpLink} from 'apollo-angular/http';
import {InMemoryCache} from '@apollo/client/core';
import {HttpClientModule} from "@angular/common/http";
import {PunkTileComponent} from "./punk-view/punk-tile/punk-tile.component";
import {MatCardModule} from "@angular/material/card";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatPaginatorModule} from "@angular/material/paginator";
import {NgChartsModule } from 'ng2-charts';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatTableModule} from "@angular/material/table";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {MatDialogModule} from "@angular/material/dialog";
import {PunkDialogComponent} from "./punk-view/punk-dialog/punk-dialog.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {OwnerDialogComponent} from "./punk-view/owner-dialog/owner-dialog.component";

@NgModule({
  declarations: [
    AppComponent,
    PunkViewComponent,
    PunkTileComponent,
    PunkDialogComponent,
    OwnerDialogComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ApolloModule,
        HttpClientModule,
        MatCardModule,
        MatGridListModule,
        MatDialogModule,
        MatPaginatorModule,
        NgChartsModule,
        FormsModule,
        MatTableModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatExpansionModule
    ],
  providers: [
        {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => {
        return {
          cache: new InMemoryCache(),
          link: httpLink.create({
            uri: 'https://api.thegraph.com/subgraphs/name/onigiri-x/experimental2',
          }),
        };
      },
      deps: [HttpLink],
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
