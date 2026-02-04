import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getOpportunities from '@salesforce/apex/RelatedOpportunityController.getOpportunities';
import updateOpportunities from '@salesforce/apex/RelatedOpportunityController.updateOpportunities';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import STAGE_FIELD from '@salesforce/schema/Opportunity.StageName';

export default class RelatedOpportunityEditor extends LightningElement {
    @api recordId;
    @track opportunities = [];
    @track draftValues = [];
    wiredResult;

    // StageのPicklist値を取得
    // Note: RecordTypeIdが必要だが、簡単のためデフォルトマスタ(012000000000000AAA)を使用すると仮定
    // 厳密には RecordTypeId getter を実装すべきだが、今回はデモ用途
    @wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: STAGE_FIELD })
    stagePicklistValues;

    @wire(getOpportunities, { accountId: '$recordId' })
    wiredOpportunities(result) {
        this.wiredResult = result;
        if (result.data) {
            // ミュータブルな配列に変換して保持
            this.opportunities = result.data.map(opp => ({ ...opp }));
        } else if (result.error) {
            this.showToast('Error', 'Failed to load opportunities', 'error');
        }
    }

    handleInputChange(event) {
        const { id, field } = event.target.dataset;
        const value = event.target.value;

        // UI上の値を即時更新
        const index = this.opportunities.findIndex(opp => opp.Id === id);
        if (index !== -1) {
            this.opportunities[index][field] = value;
            
            // 変更管理（ドラフト）
            // 簡易的に現状の全データを送信対象としても良いが、dirty check推奨
            // 今回はシンプルに this.opportunities をそのまま送る実装にするため
            // ここではthis.opportunitiesの更新のみ
        }
    }

    async handleSave() {
        try {
            // Apexへ送信
            await updateOpportunities({ data: this.opportunities });
            
            this.showToast('Success', 'Opportunities updated successfully', 'success');
            
            // データリフレッシュ
            await refreshApex(this.wiredResult);
        } catch (error) {
            this.showToast('Error', error.body ? error.body.message : error.message, 'error');
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }

    get hasData() {
        return this.opportunities && this.opportunities.length > 0;
    }
}
