/**
 * @description       : RelatedOpportunityControllerの単体テストクラス
 * @author            : Antigravity
 * @group             : Test
 * @last modified on  : 2026-02-02
 * @last modified by  : Antigravity
 **/
@isTest
private class RelatedOpportunityControllerTest {

    /**
     * @description テストデータのセットアップ
     * 「なぜこれが必要か」: テストメソッド間で共有されるリレーションを持つ基本データ（取引先と商談）を作成するため。
     */
    @testSetup
    static void setup() {
        // 取引先の作成
        Account acc = new Account(Name = 'Test Account');
        insert acc;

        // 商談の作成
        List<Opportunity> opps = new List<Opportunity>();
        for (Integer i = 0; i < 5; i++) {
            opps.add(new Opportunity(
                Name = 'Test Opportunity ' + i,
                StageName = 'Prospecting',
                CloseDate = Date.today().addDays(i),
                Amount = 1000 * (i + 1),
                AccountId = acc.Id
            ));
        }
        insert opps;
    }

    /**
     * @description getOpportunitiesメソッドのテスト
     * 期待値: 指定した取引先IDに紐づく、作成した5件の商談が取得できること。
     */
    @isTest
    static void testGetOpportunities() {
        Account acc = [SELECT Id FROM Account LIMIT 1];

        Test.startTest();
        List<Opportunity> results = RelatedOpportunityController.getOpportunities(acc.Id);
        Test.stopTest();

        System.assertEquals(5, results.size(), '5件の商談が取得されるべきです');
        System.assertEquals('Test Opportunity 4', results[0].Name, 'CloseDateの降順でソートされているため、最も未来の日付の商談が先頭に来るべきです');
    }

    /**
     * @description updateOpportunitiesメソッドの正常系テスト
     * 期待値: 商談の項目が正常に更新されること。
     */
    @isTest
    static void testUpdateOpportunities() {
        Account acc = [SELECT Id FROM Account LIMIT 1];
        List<Opportunity> opps = RelatedOpportunityController.getOpportunities(acc.Id);
        
        // 更新内容の設定
        List<Opportunity> toUpdate = new List<Opportunity>();
        for (Opportunity opp : opps) {
            opp.StageName = 'Closed Won';
            toUpdate.add(opp);
        }

        Test.startTest();
        RelatedOpportunityController.updateOpportunities(toUpdate);
        Test.stopTest();

        // データベースから再取得して検証
        List<Opportunity> updatedOpps = [SELECT Id, StageName FROM Opportunity WHERE AccountId = :acc.Id];
        for (Opportunity opp : updatedOpps) {
            System.assertEquals('Closed Won', opp.StageName, 'フェーズがClosed Wonに更新されているべきです');
        }
    }

    /**
     * @description エラーハンドリングのテスト (AuraHandledException)
     * 意図: 不正なデータ操作を行った際に、コントローラーが適切にAuraHandledExceptionを投げるか検証する。
     */
    @isTest
    static void testUpdateOpportunitiesError() {
        // 必須項目などを欠損させた不正な商談オブジェクトを作成して更新を試みる方法は、
        // メモリ上のオブジェクト操作だけではバリデーションエラーを起こしにくいため、
        // ここでは意図的にDML例外が発生するような状況（例: ID指定なしでのUpdateなど）を作りたいが、
        // updateメソッドはIdを持つ既存レコードリストを想定している。
        // 強制的に例外を起こすため、ロックされているレコードや無効なデータを渡す等の工夫が必要だが、
        // 簡易的に空リストやNullで動作確認をするか、あるいはMockを使わないとDML例外を確実に起こすのは難しい。
        // 今回は「Idがないレコードをupdateしようとするとエラーになる」性質を利用する。
        
        Opportunity invalidOpp = new Opportunity(Name = 'Invalid Opp'); // Idがない
        List<Opportunity> invalidList = new List<Opportunity>{ invalidOpp };

        Test.startTest();
        try {
            RelatedOpportunityController.updateOpportunities(invalidList);
            System.assert(false, '例外が発生するはずです');
        } catch (Exception e) {
            System.assert(e instanceof AuraHandledException, 'AuraHandledExceptionがスローされるべきです');
        }
        Test.stopTest();
    }
}
