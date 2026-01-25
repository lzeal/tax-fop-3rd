import { ESVTemplateData, populateTemplate } from '../utils/templateUtils';

// Примітивний шаблон для preview звіту ЄСВ F0133109
export const esvPreviewTemplate = `<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Звіт ЄСВ F0133109</title>
<style>
  /* A4 page */
  @page { size: A4; margin: 20mm; }
  html,body { margin:0; padding:0; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 8px;
    color: #111;
    -webkit-print-color-adjust: exact;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 10mm 12mm;
    box-sizing: border-box;
  }

  header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; }
  header .left { font-weight:700; }
  header .right { text-align:left; font-size:11px; }

  h5 { font-size:11px; margin:-6px 0 -2px 0; text-align:center; font-weight: normal; }
  h6 { font-size:12px; margin:-2px 0 -2px 0; text-align:center; }

  .header-text {
    font-family: 'Times New Roman', Times, serif;
    font-size:9px;
    font-weight: 300;
    padding:2px 4px;
  }
  .header-border {
    border: 1px solid #000;
    display: inline-block;
    padding:2px 4px;
  }
  .text-comment { font-size: 7px; }
  .text-center { text-align:center; }
  .text-left { text-align:left; }
  .text-big { font-size:16px; font-weight:bold; }
  .text-small { font-size:10px !important; }
  .font-caption {
    font-size: 11px;
    font-weight: bold;
  }

  .table-main {
    width: 100%;
    border-collapse: collapse; 
    vertical-align: middle;
    margin-top:4px; margin-bottom:8px
  }
  .table-main td {
    font-size: 9px;
    padding: 2px 8px;
    border: 1px solid black;
  }
  .borderred {
    border: 1px solid black !important;
  }
  .borderless {
    border: 0 !important;
  }
  .table-first-cell {
    width: 10px;
    border: 2px solid black !important;
  }
  .table-container {
    padding: 0 !important;
    border: 0;
  }
  .table-inner {
    border-collapse: collapse; 
    width: 100%;
  }
  .table-inner td {
    padding: 0px 10px;
  }
  .table-tiny-cell {
    padding: 0px 4px;
  }
  .col75 { width: 75%; }
  .col25 { width: 25%; }
  .col10 { width: 10%; }
  .col30 { width: 30%; }
  sup { font-size: 0.6em; }
  @media print {
    .no-print { display:none; }
    @page {
      size: A4;
      margin: 0;
    }
    body { 
      margin: 0; 
      padding: 0;
    }
    .page {
      box-shadow: none;
      width: 100%;
      margin: 0;
      padding-top: 0;
      padding-bottom: 0;
    }
    /* Запобігаємо розриву рядків таблиць */
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
  }
</style>
</head>
<body>
<div class="page" id="page">
  <header>
    <div class="left">
      <div class="header-text">F0133109</div>
      <div class="header-text header-border" style="min-width: 250px;">Відмітка про одержання <br/> (штамп контролюючого органу)</div>
    </div>
    <div class="right">
      <div class="header-text"> <br/>Додаток 1<br/>до податкової декларації платника<br/>єдиного податку - фізичної особи підприємця</div>
    </div>
  </header>
  <table class="table-main borderred" style="margin-bottom:0px;">
    <tr class="borderred">
      <td class="text-center text-big">Відомості*<br/>про суми нарахованого доходу застрахованих осіб та суми нарахованого єдиного внеску</td>
      <td class="table-container" style="border: 0;" width="30%">
        <table class="table-inner">
          <tr>
            <td class="text-left" style="border-top: 0; border-left: 0;"> 01</td>
            <td style="border-top: 0;">{{HZ}}</td>
            <td style="border-top: 0;">Звітна</td>
          </tr>
           <tr>
            <td class="text-left" style="border-left: 0;"> 02</td>
            <td>{{HZN}}</td>
            <td>Звітна нова<sup>1</sup></td>
          </tr>
          <tr>
            <td class="text-left" style="border-left: 0;"> 03</td>
            <td>{{HZU}}</td>
            <td>Уточнююча<sup>2</sup></td>
          </tr>
          <tr>
            <td class="text-left" style="border-bottom: 0; border-left: 0;"> 04</td>
            <td style="border-bottom: 0;">{{HD}}</td>
            <td style="border-bottom: 0;">Довідково<sup>3</sup></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="border-right: 0;">
      1. Реєстраційний номер облікової картки платника податків або серія (за наявності) та номер паспорта <sup>4</sup>
      </td>

      <td class="text-center" style="border-left: 0;">
        <table class="table-inner" style="padding:0; width:95%; margin-left:auto; margin-right:auto">
          <tr>
            <td class="table-tiny-cell borderred" style="min-width: 10px; min-height: 10px;"> &nbsp;{{HTIN}}&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="border-right: 0;">
      2. Серія (за наявності) та номер паспорта для ідентифікації платника єдиного внеску у Пенсійному- фонді України <sup>5</sup>
      </td>

      <td class="text-center" style="border-left: 0;">
        <table class="table-inner" style="padding:0; width:95%; margin-left:auto; margin-right:auto">
          <tr>
            <td class="table-tiny-cell borderred" style="min-width: 10px; min-height: 10px;"> &nbsp;{{HTINPF}}&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="border-right: 0;">
      3. Прізвище (за наявності), ім'я, по батькові (за наявності)
      </td>

      <td class="text-left" style="border-left: 0;">
        {{HNAME}}
      </td>
    </tr>

    <tr class="">
      <td class="text-left" colspan="2">
      4. Податковий (звітний) період:
        <table class="table-inner" style="padding:0 2px; margin-top:4px; width:95%; margin-left:auto; margin-right:auto">
          <tr>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{H1KV}}</td>
            <td class="table-tiny-cell borderless"> І квартал</td>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{HHY}}</td>
            <td class="table-tiny-cell borderless"> півріччя</td>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{H3KV}}</td>
            <td class="table-tiny-cell borderless"> три квартали</td>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{HZM}}</td>
            <td class="table-tiny-cell borderless"> місяць<sup>6</sup></td>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{HY}}</td>
            <td class="table-tiny-cell borderless"> рік</td>
            <td class="borderred" style="width: 50px;"> {{HZY}}</td>
            <td class="borderless"> року</td>
          </tr>
          <tr>
            <td style="border: 0;" class="text-small" colspan="8">(необхідне позначити)</td>
            <td style="border: 0;" class="text-small" colspan="4"></td>
          </tr>
          <tr>
            <td colspan="12" class="borderless text-left" style="padding-bottom:4px;">
            Податковий (звітний) період, який уточнюється
            </td>
          </tr>
          <tr>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{H1KVP}}</td>
            <td class="table-tiny-cell borderless"> І квартал</td>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{HHYP}}</td>
            <td class="table-tiny-cell borderless"> півріччя</td>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{H3KVP}}</td>
            <td class="table-tiny-cell borderless"> три квартали</td>
            <td class="table-tiny-cell borderless" colspan=2> </td>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{HYP}}</td>
            <td class="table-tiny-cell borderless"> рік</td>
            <td class="borderred" style="width: 50px;"> {{HZYP}}</td>
            <td class="borderless"> року</td>
          </tr>
          <tr>
            <td style="border: 0;" class="text-small" colspan="8">(необхідне позначити)</td>
            <td style="border: 0;" class="text-small" colspan="4"></td>
          </tr>
        </table>
      </td>
    </tr>

    <tr class="">
      <td class="text-left" colspan="2">
      5. Тип форми:
        <table class="table-inner" style="padding:0 2px; margin-top:4px; width:95%; margin-left:auto; margin-right:auto">
          <tr>
            <td class="table-tiny-cell borderred" style="width: 10px;">{{H01}}</td>
            <td class="table-tiny-cell borderless"> після припинення<sup>7</sup></td>
            <td class="table-tiny-cell borderred" style="width: 10px;">{{H02}}</td>
            <td class="table-tiny-cell borderless"> призначення пенсії<sup>8</sup></td>
            <td class="table-tiny-cell borderred" style="width: 10px;">{{H03}}</td>
            <td class="table-tiny-cell borderless"> перехід на сплату інших податків і зборів<sup>9</sup></td>
            <td class="table-tiny-cell borderred" style="width: 10px;">{{H04}}</td>
            <td class="table-tiny-cell borderless" style=""> призначення матеріального забезпечення,<br/>страхових виплат<sup>10</sup></td>
          </tr>

        </table>
      </td>
    </tr>
    <tr>
      <td style="border-right: 0;">
      6. Дата державної реєстрації припинення
      </td>

      <td class="text-center" style="border-left: 0;">
        <table class="table-inner" style="padding:0; width:95%; margin-left:auto; margin-right:auto">
          <tr>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{R06G1}}</td>
            <td class="table-tiny-cell borderless"> число</td>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{R06G2}}</td>
            <td class="table-tiny-cell borderless">місяць</td>
            <td class="table-tiny-cell borderred" style="min-width: 50px;"> {{R06G3}}</td>
            <td class="table-tiny-cell borderless">рік</td>
            </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="border-right: 0;">
      7. Код основного виду економічної діяльності
      </td>

      <td class="text-center" style="border-left: 0;">
        <table class="table-inner" style="padding:0; margin-left:auto; margin-right:auto;">
          <tr>
            <td class="table-tiny-cell borderless" style="width: 300px;">&nbsp;</td>
            
            <td class="table-tiny-cell borderred" style="min-width: 50px;"> {{HKVED}}</td>
            <td class="table-tiny-cell borderless">&nbsp;</td>
            </tr>
        </table>
      </td>
    </tr>
    <tr class="">
      <td class="text-left" colspan="2">
      8. Період перебування фізичної особи – підприємця
        <table class="table-inner" style="padding:0 2px; margin-top:4px; width:95%; margin-left:auto; margin-right:auto">
          <tr>
            <td class="table-tiny-cell borderless">на спрощеній системі оподаткування</td>
            <td class="table-tiny-cell borderless"style="width: 10px;"> з </td>
            <td class="table-tiny-cell borderred" style="width: 100px;">{{R08G1D}}</td>
            <td class="table-tiny-cell borderless"style="width: 10px;"> по </td>
            <td class="table-tiny-cell borderred" style="width: 100px;">{{R08G2D}}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr class="">
      <td style="border-right: 0;">
        8.1 Код категорії застрахованої особи<sup>11</sup>
      </td>
       <td class="text-center" style="border-left: 0;">
        <table class="table-inner" style="padding:0 2px; margin-top:4px; width:95%; margin-left:auto; margin-right:auto">
          <tr>
            <td class="table-tiny-cell borderred" style="width: 100px;">{{R081G1}}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <table class="table-main" style="margin-top:0px;">
    <tr class="">
      <td class="" style="border-top:0;" colspan="4">9. Визначення сум нарахованого доходу застрахованих осіб та суми нарахованого єдиного внеску</td>
    </tr>
    <tr>
      <td class="text-center col25">Місяць</td>
      <td class="text-center">Самостійно визначена сума доходу, на яку нараховується єдиний внесок з урахуванням максимальної величини</td>
      <td class="text-center col10">Розмір єдиного внеску, відсоток <sup>12</sup></td>
      <td class="text-center">Сума єдиного внеску, яка підлягає сплаті на небюджетні рахунки, за даними звітного (податкового) періоду (графа 2 х графа 3)</td>
    </tr>
    <tr>
      <td class="text-center">1</td>
      <td class="text-center">2</td>
      <td class="text-center">3</td>
      <td class="text-center">4</td>
    </tr>
    {{MONTHS_ROWS}}
    <tr>
      <td class="" colspan="4">
        10. Визначення зобов'язань із сплати єдиного внеску у зв'язку з виправленням самостійно виявлених помилок
      </td>
    </tr>
    <tr>
      <td colspan="3">
      1. Сума єдиного внеску, яка підлягала сплаті на небюджетні рахунки, за даними звітного (податкового) періоду, в якому виявлена помилка (рядок Усього графа 4 пункту 9 Додатку 1 до цієї
1 податкової декларації)
      </td>
      <td colspan="1" class="text-center">
        {{R0101G3}}
      </td>
    </tr>
    <tr>
      <td colspan="3">
      2. Уточнена сума єдиного внеску, яка підлягає сплаті на небюджетні рахунки, за даними звітного (податкового) періоду, у якому виявлена помилка
      </td>
      <td colspan="1" class="text-center">
        {{R0102G3}}
      </td>
    </tr>
    <tr>
      <td class="" colspan="4">
        Розрахунки у зв’язку з виправленням помилки:
      </td>
    </tr>
    <tr>
      <td colspan="3">
      3. Збільшення суми єдиного внеску, яка підлягала сплаті на небюджетні рахунки (рядок 2 – рядок 1, якщо рядок 2 > рядка 1)
      </td>
      <td colspan="1" class="text-center">
        {{R0103G3}}
      </td>
    </tr>
    <tr>
      <td colspan="3">
      4. Зменшення суми єдиного внеску, яка підлягала сплаті на небюджетні рахунки (рядок 2 – рядок 1, якщо рядок 2 < рядка 1)
      </td>
      <td colspan="1" class="text-center">
        {{R0104G3}}
      </td>
    </tr>
    <tr>
      <td colspan="3">
      5. Сума пені, яка нарахована платником самостійно відповідно до статті 25 Закону України "Про збір та облік єдиного внеску на загальнообов’язкове державне соціальне страхування"<sup>13</sup>
      </td>
      <td colspan="1" class="text-center">
        {{R0105G3}}
      </td>
    </tr>
    <tr>
      <td colspan="4" class="text-comment">
      * Подаються та заповнюються фізичними особами – підприємцями – платниками єдиного податку першої – третьої груп, відповідно до пунктів 296.2, 296.3 статті 296 глави 1 розділу XIV Податкового кодексу України та які є платниками єдиного
внеску відповідно до пункту 4 частини першої статті 4 Закону України "Про збір та облік єдиного внеску на загальнообов’язкове державне соціальне страхування". Додаток 1 до цієї податкової декларації не подається та не заповнюється зазначеними
платниками, за умови дотримання ними вимог, визначених частинами четвертою та шостою статті 4 Закону України "Про збір та облік єдиного внеску на загальнообов’язкове державне соціальне страхування", що дають право на звільнення таких осіб
від сплати за себе єдиного внеску. Такі особи можуть подавати Додаток 1 до цієї податкової декларації виключно за умови їх добровільної участі у системі загальнообов’язкового державного соціального страхування.
      </td>
    </tr>
    <tr>
      <td colspan="4" class="text-comment">
        <sup>1</sup> У разі подання нової податкової декларації з виправленими показниками до закінчення граничного строку подання податкової декларації за такий самий звітний період зазначається тип податкової декларації "Звітна нова". При цьому обов’язково
заповнюються всі рядки та графи пункту 9 Додатка 1 до цієї податкової декларації за період визначений у пункті 8 Додатка 1 до цієї податкової декларації.
      </td>
    </tr>
    <tr>
      <td colspan="4" class="text-comment">
        <sup>2</sup> У разі подання податкової декларації з виправленими показниками після закінчення граничного строку подання податкової декларації зазначається тип декларації "Уточнююча". При цьому обов’язково заповнюються всі рядки та графи пункту 9
Додатка 1 до цієї податкової декларації за період визначений у пункті 8 Додатка 1 до цієї податкової декларації. Для визначення уточнених зобов’язань зі сплати єдиного внеску заповнюється пункт 10 Додатка 1 до цієї податкової декларації.
      </td>
    </tr>
    <tr>
      <td colspan="4" class="text-comment">
        <sup>3</sup> Для призначення пенсії / матеріального забезпечення, страхових виплат платником обов’язково зазначається тип податкової декларації "Звітна" або "Звітна нова" з додатковою позначкою "Довідкова". При цьому платники одночасно проставляють
позначку у пункті 5 Додатка 1 до цієї податкової декларації тип форми "призначення пенсії" або "призначення матеріального забезпечення, страхових виплат". Тип податкової декларації "Уточнююча" при поданні Додатка 1 для призначення пенсії /
призначення матеріального забезпечення, страхових виплат не застосовується. Подання таких податкових декларацій не звільняє платника від обов’язку подання податкової декларації у строк, встановлений для квартального (річного) податкового
(звітного) періоду.
      </td>
    </tr>
    <tr>
      <td colspan="4" class="text-comment">
        <sup>4</sup> Серію (за наявності) та номер паспорта зазначають фізичні особи, які через релігійні переконання відмовляються від прийняття реєстраційного номера облікової картки платника податків та офіційно повідомили про це відповідний контролюючий
орган і мають відмітку у паспорті.
      </td>
    </tr>
    <tr>
      <td colspan="4" class="text-comment">
        <sup>5</sup> Заповнюється для фізичних осіб, які через релігійні переконання відмовляються від прийняття реєстраційного номера облікової картки платника податків та офіційно повідомили про це відповідний контролюючий орган і мають відмітку у паспорті:
для власників паспорта у формі книжечки серія та номер паспорта у форматі БКNNXXXXXX, де БК – константа, що вказує на реєстрацію в Пенсійному фонді України за паспортними даними; NN – дві українські літери серії паспорта (верхній регістр);
XXXXXX – шість цифр номера паспорта (з ведучими нулями) або для власників паспорта у формі пластикової картки у форматі ПХХХХХХХХХ, де П – константа, що вказує на реєстрацію в Пенсійному фонді України за паспортними даними;
ХХХХХХХХХ – дев’ять цифр номера паспорта.
      </td>
    </tr>
    <tr>
      <td colspan="4" class="text-comment">
        <sup>6</sup> Для призначення пенсії платником вказується арабськими цифрами від 1 до 12 номер календарного місяця, в якому подається ця податкова декларація. Для забезпечення реалізації права на матеріальне забезпечення та страхових виплат за
загальнообов’язковим державним соціальним страхуванням платником вказується арабськими цифрами від 1 до 12 номер календарного місяця, в якому настав страховий випадок.
      </td>
    </tr>
    <tr>
      <td colspan="4" class="text-comment">
        <sup>7</sup> Заповнюється фізичними особами – підприємцями – платниками єдиного податку, якими здійснено державну реєстрацію припинення підприємницької діяльності. При цьому такі платники одночасно проставляють позначку у пункті 6 – дата
державної реєстрації припинення.
      </td>
    </tr>
    <tr>
      <td colspan="4" class="text-comment">
        <sup>8</sup> Для призначення пенсії зазначається тип декларації "Звітна" або "Звітна нова" з додатковою позначкою "Довідкова". При цьому платники одночасно проставляють позначку у пункті 5 Додатка 1 до цієї податкової деклараці тип форми "призначення
пенсії". Тип податкової декларації "Уточнююча" при поданні Додатка 1 до цієї податкової декларації для призначення пенсії не застосовується.
      </td>
    </tr>
    <tr>
      <td colspan="4" class="text-comment">
        <sup>9</sup> Заповнюється фізичними особами – підприємцями, які перейшли на сплату інших податків і зборів. При цьому такі платники одночасно проставляють позначку у пункті 8 Додатка 1 до цієї податкової декларації– період перебування на спрощеній
системі оподаткування.
      </td>
    </tr>
    <tr>
      <td colspan="4" class="text-comment">
        <sup>10</sup> Для призначення матеріального забезпечення, страхових виплат за загальнообов’язковим державним соціальним страхуванням платником обов’язково зазначається тип податкової декларації "Звітна" або "Звітна нова" з додатковою позначкою
"Довідкова". При цьому платники одночасно проставляють позначку у пункті 5 Додатка 1 до цієї податкової декларації тип форми "призначення матеріального забезпечення, страхових виплат". Тип податкової декларації "Уточнююча" при поданні
Додатка 1 до цієї податкової декларації для призначення матеріального забезпечення, страхових виплат не застосовується.
      </td>
    </tr>
    <tr>
      <td colspan="4" class="text-comment">
        <sup>11</sup> Зазначається код категорії застрахованої особи "6" – фізична особа – підприємець на спрощеній системі оподаткування.
      </td>
    </tr>
    <tr>
      <td colspan="4" class="text-comment">
        <sup>12</sup> Зазначається розмір єдиного внеску, встановлений законом.
      </td>
    </tr>
    <tr>
      <td colspan="4" class="text-comment">
        <sup>13</sup> Сума пені нараховується з розрахунку 0,1 відсотка своєчасно не сплачених сум, розрахована за кожний день прострочення їх перерахування (зарахування).
      </td>
    </tr>
    <tr>
      <td colspan="4" class="text-comment">
        Наведена інформація є вірною:<br/>
        <b>Фізична особа – платник єдиного внеску або уповноважена особа</b> <span style="width:200px">&nbsp;&nbsp;&nbsp;</span> ______________________ &nbsp;&nbsp;&nbsp;&nbsp; {{HBOS}}
      </td>
    </tr>

  </table>
</div>
</body>
</html>`;

/**
 * Заповнює шаблон ЄСВ даними
 * @deprecated Використовуйте generateESVTemplateData та populateTemplate з templateUtils
 */
export const fillESVPreviewTemplate = (data: ESVTemplateData): string => {
  return populateTemplate(esvPreviewTemplate, data);
};
