import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StartPageComponent} from './pages/start-page/start-page.component';
import {DataCubePageComponent} from './pages/data-cube-page/data-cube-page.component';
import {SettingPageComponent} from './pages/setting-page/setting-page.component';
import {AlignmentSelectorComponent} from './_components/alignment-cube/alignment-selector';
import {SchemaComponent} from './pages/schema-page/schema.component';
import {WebservicesOverviewComponent} from './_components/webservices/webservices-overview/webservices-overview.component';
import {GoldStandardBuilderComponent} from './_components/gold-standard-builder/gold-standard-builder.component';
import {BuilderComponent} from './_components/gold-standard-builder/builder/builder.component';
import {GsbPageComponent} from './pages/gsb-page/gsb-page.component';
import {AlignmentViewerPageComponent} from './pages/alignment-viewer-page/alignment-viewer-page.component';

const routes: Routes = [
    {path: '', redirectTo: 'start', pathMatch: 'full'},
    {path: 'start', component: StartPageComponent},
    {path: 'dataCube', component: DataCubePageComponent},
    {path: 'settings', component: SettingPageComponent},
    {path: 'currentTest', component: AlignmentSelectorComponent},
    {path: 'schema', component: SchemaComponent},
    {path: 'goldStandardBuilder', component: GoldStandardBuilderComponent},
    {path: 'gsbPage', component: GsbPageComponent},
    {path: 'webservicesOverview', component: WebservicesOverviewComponent},
    {path: 'test', component: BuilderComponent},
    {path: 'viewer', component: AlignmentViewerPageComponent},
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
