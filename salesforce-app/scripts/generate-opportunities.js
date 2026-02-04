/**
 * generate-opportunities.js
 * 
 * 役割: 既存の取引先(Account)に紐づく商談(Opportunity)ダミーデータを生成する
 * 
 * 意図:
 * - data/target_accounts.csv からAccountIDを読み込む
 * - 各Accountに対して3件のOpportunityを生成する
 * - sf data import tree 用の JSON を出力する
 */

const fs = require('fs');
const path = require('path');

// 設定
const INPUT_FILE = path.join(__dirname, '../data/target_accounts.csv');
const OUTPUT_FILE = path.join(__dirname, '../data/dummy_opportunities.json');

// データ素材
const STAGES = ['Prospecting', 'Qualification', 'Needs Analysis', 'Value Proposition', 'Proposal/Price Quote', 'Negotiation/Review', 'Closed Won'];
const TYPES = ['New Business', 'Existing Business', 'Upgrade', 'Replacement'];

// ランダムヘルパー
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFutureDate = () => {
    const today = new Date();
    const daysToAdd = getRandomInt(10, 90);
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + daysToAdd);
    return futureDate.toISOString().split('T')[0]; // YYYY-MM-DD
};

// メイン処理
const generateData = () => {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`Input file not found: ${INPUT_FILE}`);
        process.exit(1);
    }

    // CSV読み込み (簡易パーサー)
    const fileContent = fs.readFileSync(INPUT_FILE, 'utf8');
    const lines = fileContent.trim().split('\n');
    
    // ヘッダー除去 (Id, Name)
    // 注意: sf query csv output might have quotes, etc. シンプルに処理
    // Line 0 is header
    const dataLines = lines.slice(1);

    const opportunityRecords = [];
    let refCounter = 0;

    dataLines.forEach(line => {
        if (!line.trim()) return;
        
        // CSVパース: 簡易的にカンマ区切り。社名にカンマがあると弱いが今回はダミーなので許容
        // sf出力は "Id","Name" のようにダブルクォートで囲まれる場合がある
        const parts = line.split(','); 
        // クォート除去
        const accountId = parts[0].replace(/"/g, ''); 
        const accountName = parts[1] ? parts[1].replace(/"/g, '') : 'Unknown';

        // 3件のOpportunity生成
        for (let i = 0; i < 3; i++) {
            const amount = getRandomInt(100, 1000) * 10000; // 100万〜1000万
            const stage = getRandom(STAGES);
            const closeDate = getRandomFutureDate();
            const type = getRandom(TYPES);
            
            opportunityRecords.push({
                attributes: {
                    type: 'Opportunity',
                    referenceId: `opp_${refCounter++}`
                },
                AccountId: accountId,
                Name: `${accountName} - ${type} Project ${i+1}`,
                StageName: stage,
                CloseDate: closeDate,
                Amount: amount
            });
        }
    });

    // JSON保存
    const jsonContent = JSON.stringify({ records: opportunityRecords }, null, 2);
    fs.writeFileSync(OUTPUT_FILE, jsonContent, 'utf8');

    console.log(`Generated ${opportunityRecords.length} Opportunities for ${dataLines.length} Accounts.`);
    console.log(`Saved to: ${OUTPUT_FILE}`);
};

generateData();
