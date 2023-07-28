import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {UiInfobarBottomComponent} from './_components/alignment-cube/ui/ui-infobar-bottom';
import {UiInfobarTopComponent} from './_components/alignment-cube/ui/ui-infobar-top';
import {UiSidebarLeftComponent} from './_components/alignment-cube/ui/ui-sidebar-left';
import {UiSidebarRightComponent} from './_components/alignment-cube/ui/ui-sidebar-right';
import {UiComponent} from './_components/alignment-cube/ui';
import {HttpClientModule} from '@angular/common/http';
import {NavbarComponent} from './_components/navbar';
import {AppRoutingModule} from './app-routing.module';
import {StartPageComponent} from './pages/start-page/start-page.component';
import {DataCubePageComponent} from './pages/data-cube-page/data-cube-page.component';
import {SettingPageComponent} from './pages/setting-page/setting-page.component';
import {AlignmentCubeComponent} from './_components/alignment-cube';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AlignmentSelectorComponent} from './_components/alignment-cube/alignment-selector';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatIconModule} from '@angular/material/icon';
import {HIGHLIGHT_OPTIONS, HighlightModule} from 'ngx-highlightjs';
import {SchemaComponent} from './pages/schema-page/schema.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatRadioModule} from '@angular/material/radio';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {GsbPageComponent} from './pages/gsb-page/gsb-page.component';
import {GoldStandardBuilderComponent} from './_components/gold-standard-builder/gold-standard-builder.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatToolbarModule} from '@angular/material/toolbar';
import {WebservicesOverviewComponent} from './_components/webservices/webservices-overview/webservices-overview.component';
import {MatTableModule} from '@angular/material/table';
import {WebserviceInformationComponent} from './_components/webservices/webservice-information/webservice-information.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {DatabasesOverviewComponent} from './_components/databases/db-overview/databases-overview.component';
import {ApiOverviewComponent} from './_components/apis/api-overview/api-overview.component';
import {ApiInformationComponent} from './_components/apis/api-information/api-information.component';
import {DbInformationComponent} from './_components/databases/db-information/db-information.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatStepperModule} from '@angular/material/stepper';
import { WebserviceCreateFormComponent } from './_components/webservices/webservice-create-form/webservice-create-form.component';
import { MappingTableComponent } from './_components/gold-standard-builder/builder/mapping-table/mapping-table.component';
import { DbSelecectorComponent } from './_components/gold-standard-builder/db-selecector/db-selecector.component';
import { BuilderComponent } from './_components/gold-standard-builder/builder/builder.component';
import { HighlightPipe } from './_pipes/highlight.pipe';
import {BackendConnectionService} from './_services/backend-connection.service';
import {GsbService} from './_services/gsb.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { FinalAlignmentComponent } from './_components/gold-standard-builder/final-alignmnet/final-alignment.component';
import { MappingSuggestionToolComponent } from './_components/gold-standard-builder/mapping-suggestion-tool/mapping-suggestion-tool.component';
import { MappingSuggestionComponent } from './_components/gold-standard-builder/mapping-suggestion-tool/mapping-suggestion/mapping-suggestion.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { MappingViewComponent } from './_components/gold-standard-builder/mapping-suggestion-tool/mapping-view/mapping-view.component';
import {MatBadgeModule} from '@angular/material/badge';
import { MappingEditorComponent } from './_components/gold-standard-builder/mapping-suggestion-tool/mapping-editor/mapping-editor.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import { AlignmentViewerComponent } from './_components/alignment-viewer/alignment-viewer.component';
import { AlignmentViewerPageComponent } from './pages/alignment-viewer-page/alignment-viewer-page.component';
import { ApiCreateFormComponent } from './_components/apis/api-create-form/api-create-form.component';
import { DbCreateFormComponent } from './_components/databases/db-create-form/db-create-form.component';
import { JsonViewerComponent } from './_components/json-viewer/json-viewer.component';
import {AngJsoneditorModule } from '@maaxgr/ang-jsoneditor';
import {MatTooltipModule} from "@angular/material/tooltip";


@NgModule({
    declarations: [
        AppComponent,
        UiComponent,
        UiInfobarBottomComponent,
        UiInfobarTopComponent,
        UiSidebarLeftComponent,
        UiSidebarRightComponent,
        NavbarComponent,
        StartPageComponent,
        DataCubePageComponent,
        SettingPageComponent,
        AlignmentCubeComponent,
        AlignmentSelectorComponent,
        SchemaComponent,
        GsbPageComponent,
        GoldStandardBuilderComponent,
        WebservicesOverviewComponent,
        WebserviceInformationComponent,
        DatabasesOverviewComponent,
        ApiOverviewComponent,
        ApiInformationComponent,
        DbInformationComponent,
        WebserviceCreateFormComponent,
        MappingTableComponent,
        DbSelecectorComponent,
        BuilderComponent,
        HighlightPipe,
        JsonViewerComponent,
        FinalAlignmentComponent,
        MappingSuggestionToolComponent,
        MappingSuggestionComponent,
        MappingViewComponent,
        MappingEditorComponent,
        AlignmentViewerComponent,
        AlignmentViewerPageComponent,
        ApiCreateFormComponent,
        DbCreateFormComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatIconModule,
        HighlightModule,
        MatFormFieldModule,
        MatSelectModule,
        MatExpansionModule,
        MatCardModule,
        MatButtonModule,
        MatRadioModule,
        FormsModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatToolbarModule,
        MatTableModule,
        MatDialogModule,
        MatInputModule,
        MatTabsModule,
        ScrollingModule,
        AngJsoneditorModule,
        MatGridListModule,
        MatStepperModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatBadgeModule,
        MatTooltipModule
    ],
    providers: [
        BackendConnectionService,
        GsbService,
        {
            provide: HIGHLIGHT_OPTIONS,
            useValue: {
                fullLibraryLoader: () => import('highlight.js')
            }
        },
        MatSnackBar
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
