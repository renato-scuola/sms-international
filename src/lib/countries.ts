/**
 * Elenco dei prefissi telefonici internazionali (E.164).
 *
 * I dati sono compattati in una singola stringa "ISO|Nome|Prefisso" separata da ";"
 * per tenere il bundle il più leggero possibile: l'array viene costruito una sola
 * volta al primo import ed è condiviso da client e server.
 */

const RAW =
  "IT|Italia|39;AF|Afghanistan|93;AL|Albania|355;DZ|Algeria|213;AD|Andorra|376;AO|Angola|244;" +
  "AG|Antigua e Barbuda|1268;AR|Argentina|54;AM|Armenia|374;AU|Australia|61;AT|Austria|43;" +
  "AZ|Azerbaigian|994;BS|Bahamas|1242;BH|Bahrein|973;BD|Bangladesh|880;BB|Barbados|1246;" +
  "BE|Belgio|32;BZ|Belize|501;BJ|Benin|229;BT|Bhutan|975;BY|Bielorussia|375;BO|Bolivia|591;" +
  "BA|Bosnia ed Erzegovina|387;BW|Botswana|267;BR|Brasile|55;BN|Brunei|673;BG|Bulgaria|359;" +
  "BF|Burkina Faso|226;BI|Burundi|257;KH|Cambogia|855;CM|Camerun|237;CA|Canada|1;CV|Capo Verde|238;" +
  "TD|Ciad|235;CL|Cile|56;CN|Cina|86;CY|Cipro|357;VA|Città del Vaticano|379;CO|Colombia|57;" +
  "KM|Comore|269;CG|Congo|242;CD|Congo (RDC)|243;KP|Corea del Nord|850;KR|Corea del Sud|82;" +
  "CR|Costa Rica|506;CI|Costa d’Avorio|225;HR|Croazia|385;CU|Cuba|53;DK|Danimarca|45;" +
  "DM|Dominica|1767;DO|Repubblica Dominicana|1809;EC|Ecuador|593;EG|Egitto|20;SV|El Salvador|503;" +
  "AE|Emirati Arabi Uniti|971;ER|Eritrea|291;EE|Estonia|372;SZ|Eswatini|268;ET|Etiopia|251;" +
  "FJ|Figi|679;PH|Filippine|63;FI|Finlandia|358;FR|Francia|33;GA|Gabon|241;GM|Gambia|220;" +
  "GE|Georgia|995;DE|Germania|49;GH|Ghana|233;JM|Giamaica|1876;JP|Giappone|81;GI|Gibilterra|350;" +
  "DJ|Gibuti|253;JO|Giordania|962;GR|Grecia|30;GD|Grenada|1473;GL|Groenlandia|299;GP|Guadalupa|590;" +
  "GU|Guam|1671;GT|Guatemala|502;GG|Guernsey|44;GN|Guinea|224;GQ|Guinea Equatoriale|240;" +
  "GW|Guinea-Bissau|245;GY|Guyana|592;GF|Guyana Francese|594;HT|Haiti|509;HN|Honduras|504;" +
  "HK|Hong Kong|852;IN|India|91;ID|Indonesia|62;IR|Iran|98;IQ|Iraq|964;IE|Irlanda|353;" +
  "IS|Islanda|354;IL|Israele|972;KZ|Kazakistan|7;KE|Kenya|254;KG|Kirghizistan|996;KI|Kiribati|686;" +
  "KW|Kuwait|965;LA|Laos|856;LS|Lesotho|266;LV|Lettonia|371;LB|Libano|961;LR|Liberia|231;" +
  "LY|Libia|218;LI|Liechtenstein|423;LT|Lituania|370;LU|Lussemburgo|352;MO|Macao|853;" +
  "MK|Macedonia del Nord|389;MG|Madagascar|261;MW|Malawi|265;MY|Malesia|60;MV|Maldive|960;" +
  "ML|Mali|223;MT|Malta|356;MA|Marocco|212;MQ|Martinica|596;MR|Mauritania|222;MU|Mauritius|230;" +
  "MX|Messico|52;MD|Moldavia|373;MC|Monaco|377;MN|Mongolia|976;ME|Montenegro|382;MZ|Mozambico|258;" +
  "MM|Myanmar|95;NA|Namibia|264;NR|Nauru|674;NP|Nepal|977;NI|Nicaragua|505;NE|Niger|227;" +
  "NG|Nigeria|234;NO|Norvegia|47;NC|Nuova Caledonia|687;NZ|Nuova Zelanda|64;OM|Oman|968;" +
  "NL|Paesi Bassi|31;PK|Pakistan|92;PW|Palau|680;PS|Palestina|970;PA|Panama|507;" +
  "PG|Papua Nuova Guinea|675;PY|Paraguay|595;PE|Perù|51;PF|Polinesia Francese|689;PL|Polonia|48;" +
  "PT|Portogallo|351;PR|Porto Rico|1787;QA|Qatar|974;GB|Regno Unito|44;CZ|Repubblica Ceca|420;" +
  "CF|Repubblica Centrafricana|236;RE|Réunion|262;RO|Romania|40;RW|Ruanda|250;RU|Russia|7;" +
  "EH|Sahara Occidentale|212;KN|Saint Kitts e Nevis|1869;LC|Saint Lucia|1758;" +
  "VC|Saint Vincent e Grenadine|1784;WS|Samoa|685;SM|San Marino|378;" +
  "ST|São Tomé e Príncipe|239;SN|Senegal|221;RS|Serbia|381;SC|Seychelles|248;SL|Sierra Leone|232;" +
  "SG|Singapore|65;SY|Siria|963;SK|Slovacchia|421;SI|Slovenia|386;SO|Somalia|252;ES|Spagna|34;" +
  "LK|Sri Lanka|94;US|Stati Uniti|1;ZA|Sudafrica|27;SD|Sudan|249;SS|Sud Sudan|211;SR|Suriname|597;" +
  "SE|Svezia|46;CH|Svizzera|41;TJ|Tagikistan|992;TW|Taiwan|886;TZ|Tanzania|255;TH|Thailandia|66;" +
  "TL|Timor Est|670;TG|Togo|228;TO|Tonga|676;TT|Trinidad e Tobago|1868;TN|Tunisia|216;" +
  "TR|Turchia|90;TM|Turkmenistan|993;UA|Ucraina|380;UG|Uganda|256;HU|Ungheria|36;UY|Uruguay|598;" +
  "UZ|Uzbekistan|998;VU|Vanuatu|678;VE|Venezuela|58;VN|Vietnam|84;YE|Yemen|967;ZM|Zambia|260;" +
  "ZW|Zimbabwe|263";

export type Country = {
  /** Codice ISO 3166-1 alpha-2 */
  iso: string;
  /** Nome in italiano */
  name: string;
  /** Prefisso internazionale senza "+" */
  dial: string;
  /** Bandiera come emoji, derivata dal codice ISO */
  flag: string;
};

function isoToFlag(iso: string): string {
  // Ogni lettera diventa il corrispondente "regional indicator symbol".
  return String.fromCodePoint(
    ...iso.split("").map((c) => 0x1f1a5 + c.charCodeAt(0)),
  );
}

export const COUNTRIES: Country[] = RAW.split(";").map((row) => {
  const [iso, name, dial] = row.split("|");
  return { iso, name, dial, flag: isoToFlag(iso) };
});

export const DEFAULT_COUNTRY: Country =
  COUNTRIES.find((c) => c.iso === "IT") ?? COUNTRIES[0];

/** Normalizza per la ricerca: minuscolo e senza accenti/apostrofi. */
function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f'\u2019]/g, "");
}

/**
 * Filtra i paesi per nome, codice ISO o prefisso.
 * Una query che inizia con "+" o composta da cifre cerca solo nei prefissi.
 */
export function searchCountries(query: string): Country[] {
  const raw = query.trim();
  if (!raw) return COUNTRIES;

  const digits = raw.replace(/\D/g, "");
  if (digits && /^\+?\d+$/.test(raw)) {
    return COUNTRIES.filter((c) => c.dial.startsWith(digits));
  }

  const needle = fold(raw);
  return COUNTRIES.filter(
    (c) => fold(c.name).includes(needle) || fold(c.iso) === needle,
  );
}
