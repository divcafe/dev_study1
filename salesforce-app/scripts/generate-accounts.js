/**
 * generate-accounts.js
 * 
 * 役割: Salesforce開発用のダミー取引先（製造業）データを生成するスクリプト
 * 
 * 意図: 
 * - 開発・テスト用に現実的なダミーデータが必要です。
 * - 既存の会社名と被らない架空の社名を生成します。
 * - SFDX import や Data Loader で取り込み可能な CSV形式 で出力します。
 */

const fs = require('fs');
const path = require('path');

// 設定
const COUNT = 50;
const OUTPUT_DIR = path.join(__dirname, '../data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'dummy_accounts.csv');

// データ素材
const PREFIXES = ['未来', 'グローバル', 'ジャパン', '東洋', '新日本', '帝都', 'アジア', '令和', '次世代', 'サイバー'];
const MIDDLES = ['工業', '産業', '製作所', '製造', '技研', 'テクノロジー', 'マテリアル', '重工', '化成', 'エレクトロニクス'];
const SUFFIXES = ['株式会社', '合同会社', '株式会社', '株式会社']; // 株式会社の比率を高めに

const PREFECTURES = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

// 連絡先用素材
const LAST_NAMES = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤', '吉田', '山田', '佐々木', '山口', '松本'];
const FIRST_NAMES = ['太郎', '次郎', '花子', '健太', '美咲', '翔', 'さくら', '大輔', '結衣', '誠', '陽菜', '直人', '愛', '達也', '未来'];

// ランダムヘルパー
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateEmail = (id, domain) => `contact${id}@${domain}`; // シンプルなEmail生成
const generateDomain = (name) => {
    // 会社名から簡易ドメイン生成 (日本語は除去して適当な英字にする)
    // ここでは簡易的に ranodm string
    return 'example.com';
};

// メイン処理
const generateData = () => {
    // ディレクトリ作成
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // CSVヘッダー
    // Name, Industry, Type, BillingCountry, BillingState
    const headers = ['Name', 'Industry', 'Type', 'BillingCountry', 'BillingState'];
    const rows = [];

    // データ生成
    for (let i = 0; i < COUNT; i++) {
        // 社名生成: (例) 未来工業株式会社
        const prefix = getRandom(PREFIXES);
        const middle = getRandom(MIDDLES);
        const suffix = getRandom(SUFFIXES);
        const name = `${prefix}${middle}${suffix}`;

        // 都道府県
        const state = getRandom(PREFECTURES);

        rows.push([
            name,
            'Manufacturing',
            'Customer - Direct',
            'Japan',
            state
        ].join(','));
    }

    // CSV書き込み
    const csvContent = [headers.join(','), ...rows].join('\n');
    fs.writeFileSync(OUTPUT_FILE, csvContent, 'utf8');
    console.log(`Successfully generated CSV records at: ${OUTPUT_FILE}`);

    // JSON書き込み (sf data import tree 用)
    const jsonRecords = rows.map((row, index) => {
        const [name, industry, type, country, state] = row.split(',');
        
        // Contacts 生成 (3件)
        const contacts = [];
        for(let c=0; c < 3; c++) {
             const ln = getRandom(LAST_NAMES);
             const fn = getRandom(FIRST_NAMES);
             contacts.push({
                 attributes: {
                     type: 'Contact',
                     referenceId: `ref${index}_c${c}`
                 },
                 LastName: ln,
                 FirstName: fn,
                 Email: `test-${index}-${c}@example.com`
             });
        }

        return {
            attributes: {
                type: 'Account',
                referenceId: `ref${index}`
            },
            Name: name,
            Industry: industry,
            Type: type,
            BillingCountry: country,
            BillingState: state,
            Contacts: {
                records: contacts
            }
        };
    });

    const jsonContent = JSON.stringify({ records: jsonRecords }, null, 2);
    const jsonPath = path.join(OUTPUT_DIR, 'dummy_accounts.json');
    fs.writeFileSync(jsonPath, jsonContent, 'utf8');
    console.log(`Successfully generated JSON records at: ${jsonPath}`);
};

generateData();
