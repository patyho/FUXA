import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DeviceTagDialog } from '../../../device/device.component';
import { Utils } from '../../../_helpers/utils';
import { DeviceType, Tag } from '../../../_models/device';
import { ReportDateRangeType, ReportFunctionType, ReportIntervalType, ReportItemTable, ReportTableColumn, ReportTableColumnType } from '../../../_models/report';
import { ProjectService } from '../../../_services/project.service';

@Component({
    selector: 'app-report-item-table',
    templateUrl: './report-item-table.component.html',
    styleUrls: ['./report-item-table.component.scss']
})
export class ReportItemTableComponent implements OnInit {

    dateRangeType = ReportDateRangeType;
    intervalType = ReportIntervalType;
    functionType = ReportFunctionType;

    columns: ReportTableColumn[];

    constructor(public dialogRef: MatDialogRef<ReportItemTableComponent>,
        public dialog: MatDialog,
        private translateService: TranslateService,
        private projectService: ProjectService,
        @Inject(MAT_DIALOG_DATA) public data: ReportItemTable) {
            if (this.data.columns.length <= 0) {
                let tag = <Tag>{ label: 'Timestamp' };
                this.data.columns = [ <ReportTableColumn>{
                    type: ReportTableColumnType.timestamp,
                    tag: tag,
                    label: tag.label || tag.name,
                    align: 'left',
                    width: 'auto'
                }];
            }
            this.columns = Utils.clone(this.data.columns);
        }

    ngOnInit() {
        Object.keys(this.dateRangeType).forEach(key => {
            this.translateService.get(this.dateRangeType[key]).subscribe((txt: string) => { this.dateRangeType[key] = txt; });
        });
        Object.keys(this.intervalType).forEach(key => {
            this.translateService.get(this.intervalType[key]).subscribe((txt: string) => { this.intervalType[key] = txt; });
        });
        Object.keys(this.functionType).forEach(key => {
            this.translateService.get(this.functionType[key]).subscribe((txt: string) => { this.functionType[key] = txt; });
        });
    }

    onAddItem(index: number) {
        let dialogRef = this.dialog.open(DeviceTagDialog, {
            position: { top: '60px' },
            data: {
                variableId: null,
                devices: Object.values(this.projectService.getDevices()),
                multiSelection: true,
                deviceFilter: [ DeviceType.internal ]
            }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                let varsId = result.variablesId || [result.variableId];
                varsId.forEach(tagId => {
                    let tag = this.projectService.getTagFromId(tagId);
                    this.columns.splice(++index, 0, <ReportTableColumn>{
                        tag: tag,
                        width: 'auto',
                        align: 'left',
                        label: tag.label || tag.name,
                        function: Utils.getEnumKey(ReportFunctionType, ReportFunctionType.average)
                    });
                });
            }
        });
    }

    onDeleteItem(index: number) {
        this.columns.splice(index, 1);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.data.columns = this.columns;
        this.dialogRef.close(this.data);
    }
}
