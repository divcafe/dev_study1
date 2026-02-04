/**
 * @description       : 取引先に紐づく商談を管理するコントローラー
 * @author            : Antigravity
 * @group             : Controller
 * @last modified on  : 2026-02-03
 * @last modified by  : Antigravity
**/
public with sharing class RelatedOpportunityController {
    
    /**
     * @description 取引先IDに紐づく商談リストを取得する
     * @param accountId 取引先ID
     * @return List<Opportunity> 商談リスト
     */
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunities(Id accountId) {
        // 意図: 編集画面に必要な項目に絞って取得。セキュリティエンフォーシングのためにWITH SECURITY_ENFORCEDを使用推奨だが
        // 簡易実装ではwith sharingでオブジェクト権限に委ねる。
        // update用のIdは必須。
        return [
            SELECT Id, Name, StageName, CloseDate, Amount
            FROM Opportunity 
            WHERE AccountId = :accountId
            ORDER BY CloseDate DESC
        ];
    }

    /**
     * @description 商談リストを一括更新する
     * @param data 更新対象の商談リスト
     */
    @AuraEnabled
    public static void updateOpportunities(List<Opportunity> data) {
        try {
            update data;
        } catch (Exception e) {
            // 意図: LWC側でエラーハンドリングできるようにExceptionをスローする
            throw new AuraHandledException('Error updating opportunities: ' + e.getMessage());
        }
    }
}
