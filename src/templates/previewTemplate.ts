export const htmlTemplate = `<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Декларація — шаблон (A4)</title>
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
    font-size:11px;
    font-weight: 300;
    padding:2px 4px;
  }
  .header-border {
    border: 1px solid #000;
    display: inline-block;
    padding:2px 4px;
  }
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
    font-size: 11px;
    padding: 2px 8px;
    border: 1px solid black;
  }
  .borderred {
    border: 2px solid black !important;
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
      <div class="header-text">F0103309</div>
      <div class="header-text header-border" style="min-width: 250px;">Відмітка про одержання <br/> (штамп контролюючого органу)</div>
    </div>
    <div class="right">
      <div class="header-text"> <br/>ЗАТВЕРДЖЕНО<br/>Наказ Міністерства фінансів України<br/>19 червня 2015 року №578  <br/> (у редакції наказу Міністерства фінансів України <br/> від 31 січня 2025 №57)</div>
    </div>
  </header>

  <table class="table-main">
    <tr class="borderred">
      <td class="table-first-cell text-big">1</td>
      <td class="text-center text-big">Податкова декларація<br/>платника єдиного податку — фізичної особи-підприємця<br/><span style="font-size: 11px; font-weight: normal;">у якого податковий (звітний) період квартал ***</span></td>
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
            <td>Звітна нова</td>
          </tr>
          <tr>
            <td class="text-left" style="border-left: 0;"> 03</td>
            <td>{{HZU}}</td>
            <td>Уточнююча</td>
          </tr>
          <tr>
            <td class="text-left" style="border-bottom: 0; border-left: 0;"> 04</td>
            <td style="border-bottom: 0;">{{HD}}</td>
            <td style="border-bottom: 0;">Довідково*</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <table class="table-main">
    <tr class="borderred">
      <td class="table-first-cell text-big">2</td>
      <td class="text-left">
        Податковий (звітний) період:
        <table class="table-inner" style="padding:0 2px; margin-top:4px; width:95%; margin-left:auto; margin-right:auto">
          <tr>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{H1KV}}</td>
            <td class="table-tiny-cell borderred"> І квартал</td>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{HHY}}</td>
            <td class="table-tiny-cell borderred"> півріччя</td>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{H3KV}}</td>
            <td class="table-tiny-cell borderred"> три квартали</td>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{HY}}</td>
            <td class="table-tiny-cell borderred"> рік</td>
            <td class="borderred" style="min-width: 40px;"> {{HZM}}</td>
            <td class="" style="width: 10px; border: 0;"> &nbsp;</td>
            <td class="borderred" style="width: 50px;"> {{HZY}}</td>
            <td class="" style="border: 0;"> року</td>
          </tr>
          <tr>
            <td style="border: 0;" class="text-small" colspan="8">(необхідне позначити)</td>
            <td style="border: 0;" class="text-small" colspan="4">(місяць)**</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <table class="table-main">
    <tr class="borderred">
      <td class="table-first-cell text-big">3</td>
      <td class="text-left">
        Податковий (звітний) період, який уточнюється
        <table class="table-inner" style="padding:0 2px; margin-top:4px; width:95%; margin-left:auto; margin-right:auto">
          <tr>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{H1KVP}}</td>
            <td class="table-tiny-cell borderred"> І квартал</td>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{HHYP}}</td>
            <td class="table-tiny-cell borderred"> півріччя</td>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{H3KVP}}</td>
            <td class="table-tiny-cell borderred"> три квартали</td>
            <td class="table-tiny-cell borderred" style="min-width: 10px;"> {{HYP}}</td>
            <td class="table-tiny-cell borderred"> рік</td>
            <td class="" style="min-width: 40px; border: 0;"> &nbsp;</td>
            <td class="" style="width: 10px; border: 0;"> &nbsp;</td>
            <td class="borderred" style="width: 50px;"> {{HZYP}}</td>
            <td class="" style="border: 0;"> року</td>
          </tr>
          <tr>
            <td style="border: 0;" class="text-small" colspan="8">(необхідне позначити)</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <table class="table-main">
    <tr class="borderred">
      <td class="table-first-cell text-big">4</td>
      <td class="text-center"> {{HSTI}}</td>
    </tr>
  </table>
  <h5>
    (найменування контролюючого органу, до якого подається звітність)
  </h5>

  <table class="table-main borderred">
    <tr>
      <td class="table-first-cell text-big" rowspan="2">5</td>
      <td class="borderred" rowspan="2" width="25%" class="">Платник податку</td>
      <td class="text-center"> {{HNAME}}</td>
    </tr>
    <tr>
      <td>&nbsp;</td>
    </tr>
  </table>
  <h5>
    (прізвище (за наявності), ім'я, по батькові (за наявності) платника податків згідно з реєстраційними документами)
  </h5>
  <table class="table-main borderred">
    <tr>
      <td class="table-first-cell text-big" rowspan="4">6</td>
      <td class="borderred" rowspan="3" width="25%" style="border-bottom-width: 1px !important">Податкова адреса</td>
      <td colspan="3" class="text-center">{{HLOC}}</td>
    </tr>
    <tr>
      <td colspan="3">&nbsp;</td>
    </tr>
    <tr>
      <td colspan="3" class="text-small text-center">(податкова адреса (місце проживання) платника податку)</td>
    </tr>
    <tr>
      <td class="borderred" style="border-top-width: 1px !important">Адреса електронної пошти</td>
      <td class="text-center"> {{HEMAIL}}</td>
      <td class="">Номер телефону</td>
      <td class="text-center"> {{HTEL}}</td> 
    </tr>
  </table>
  
  <table class="table-main">
    <tr>
      <td style="padding: 8px 8px;" class="table-first-cell text-big">7</td>
      <td class="borderred"> Реєстраційний номер облікової картки платника податків або серія (за наявності) та номер паспорта <sup>1</sup></td>
      <td style="border: 0; max-width: 5px;">&nbsp;</td>
      <td width="100" class="borderred text-center"> {{HTIN}}</td>
    </tr>
  </table>

  <table class="table-main borderred">
    <tr>
      <td class="table-first-cell text-big" rowspan="3">8</td>
      <td class="" colspan="3"> Особливі відмітки</td>
    </tr>
    <tr>
      <td class="borderred">8.1</td>
      <td style="min-width: 7px;">{{M081}}</td>
      <td class="">платника податку, що подає цю податкову декларацію за останній податковий (звітний) період, на який припадає дата державної реєстрації припинення <sup>2</sup></td>
    </tr>
    <tr>
      <td class="borderred">8.2</td>
      <td class="">{{M082}}</td>
      <td class="">платника податку, що подає цю податкову декларацію за останній податковий (звітний) період, в якому здійснено перехід на сплату інших податків та зборів <sup>2</sup></td>
    </tr>
  </table>

  <h6 class="font-caption">
    I. Загальні показники підприємницької діяльності
  </h6>

  <table class="table-main borderred">
    <tr>
      <td class="table-first-cell text-big">9</td>
      <td class="borderred" colspan="2">Фактична чисельність найманих працівників у звітному періоді (осіб)</td>
      <td class="borderred text-center" style="width: 15%;">{{HNACTL}}</td>
    </tr>
    <tr>
      <td class="table-first-cell text-big" rowspan="2">10</td>
      <td class="" colspan="3">Види підприємницької діяльності у звітному періоді<sup>3</sup>:</td>
    </tr>
    <tr class="" style="border-bottom: 2px solid black !important;">
      <td class=" text-center" style="width: 20%;">Код виду економічної діяльності (КВЕД)</td>
      <td class=" text-center" colspan="2">Назва згідно з кодом виду економічної діяльності (КВЕД)</td>
    </tr>
    {{KVED_ROWS}}
  </table>
  <h6 class="font-caption">
    II. Показники господарської діяльності для платників єдиного податку першої групи
  </h6>
  <table class="table-main borderred">
    <tr class="borderred">
      <td colspan="5" class=" text-center col75">Щомісячні авансові внески єдиного податку, (грн, коп)</td>
    </tr>
    <tr>
      <td class="text-center">I квартал</td>
      <td class="text-center">II квартал</td>
      <td class="text-center">III квартал</td>
      <td class="text-center" colspan="2">IV квартал</td>
    </tr>
    <tr>
      <td class="text-center">1</td>
      <td class="text-center">2</td>
      <td class="text-center">3</td>
      <td class="text-center" colspan="2">4</td>
    </tr>
    <tr>
      <td class="text-center">{{R02G1}}</td>
      <td class="text-center">{{R02G2}}</td>
      <td class="text-center">{{R02G3}}</td>
      <td class="text-center" colspan="2">{{R02G4}}</td>
    </tr>
    <tr class="borderred">
      <td class=" text-center col75" colspan="3">Назва показника</td>
      <td class=" text-center col10">Код рядка</td>
      <td class=" text-center">Обсяг (грн, коп)<sup>4</sup></td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Обсяг доходу за звітний (податковий) період відповідно до статті 292 глави 1 розділу XIV Податкового кодексу України (згідно з підпунктом 1 пункту 291.4 статті 291 глави 1 розділу XIV Податкового кодексу України)</td>
      <td class=" text-center text-big">01</td>
      <td class=" text-center">{{R001G3}}</td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Обсяг доходу, що оподаткований за ставкою 15 відсотків (згідно з пунктом 293.4 статті 293 глави 1 розділу XIV Податкового кодексу України), у звітному (податковому) періоді<sup>5</sup></td>
      <td class=" text-center text-big">02</td>
      <td class=" text-center">{{R002G3}}</td>
    </tr>
  </table>
  <h6 class="font-caption">
    III. Показники господарської діяльності для платників єдиного податку другої групи
  </h6>
  <table class="table-main borderred">
    <tr class="borderred">
      <td colspan="5" class=" text-center col75">Щомісячні авансові внески єдиного податку, (грн, коп)</td>
    </tr>
    <tr>
      <td class="text-center">I квартал</td>
      <td class="text-center">II квартал</td>
      <td class="text-center">III квартал</td>
      <td class="text-center" colspan="2">IV квартал</td>
    </tr>
    <tr>
      <td class="text-center">1</td>
      <td class="text-center">2</td>
      <td class="text-center">3</td>
      <td class="text-center" colspan="2">4</td>
    </tr>
    <tr>
      <td class="text-center">{{R03G1}}</td>
      <td class="text-center">{{R03G2}}</td>
      <td class="text-center">{{R03G3}}</td>
      <td class="text-center" colspan="2">{{R03G4}}</td>
    </tr>
    <tr class="borderred">
      <td class=" text-center col75" colspan="3">Назва показника</td>
      <td class=" text-center col10">Код рядка</td>
      <td class=" text-center">Обсяг (грн, коп)<sup>4</sup></td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Обсяг доходу за звітний (податковий) період відповідно до статті 292 глави 1 розділу XIV Податкового кодексу України (згідно з підпунктом 2 пункту 291.4 статті 291 глави 1 розділу XIV Податкового кодексу України)</td>
      <td class=" text-center text-big">03</td>
      <td class=" text-center">{{R003G3}}</td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Обсяг доходу, що оподаткований за ставкою 15 відсотків
(згідно з пунктом 293.4 статті 293 глави 1 розділу XIV Податкового кодексу України), у звітному (податковому) періоді<sup>5</sup></td>
      <td class=" text-center text-big">04</td>
      <td class=" text-center">{{R004G3}}</td>
    </tr>
  </table>

  <h6 class="font-caption">
    IV. Показники господарської діяльності для платників єдиного податку третьої групи
  </h6>
  <table class="table-main borderred">
    <tr class="borderred">
      <td class=" text-center col75" colspan="3">Назва показника</td>
      <td class=" text-center col10">Код рядка</td>
      <td class=" text-center">Обсяг (грн, коп)<sup>4</sup></td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Обсяг доходу за звітний (податковий) період, що оподатковується за ставкою 3 %</td>
      <td class=" text-center text-big">05</td>
      <td class=" text-center">{{R005G3}}</td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Обсяг доходу за звітний (податковий) період, що оподатковується за ставкою 5 %</td>
      <td class=" text-center text-big">06</td>
      <td class=" text-center">{{R006G3}}</td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Обсяг доходу, що оподаткований за ставкою 15 відсотків (згідно з пунктом 293.4 статті 293 глави 1 розділу XIV Податкового кодексу України), у звітному (податковому) періоді<sup>5</sup></td>
      <td class=" text-center text-big">07</td>
      <td class=" text-center">{{R007G3}}</td>
    </tr>
  </table>
  <h6 class="font-caption">
    V. Визначення податкових зобов'язань по єдиному податку
  </h6>
  <table class="table-main borderred">
    <tr class="borderred">
      <td class=" text-center col75" colspan="3">Назва показника</td>
      <td class=" text-center col10">Код рядка</td>
      <td class=" text-center">Обсяг (грн, коп)<sup>4</sup></td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Загальна сума доходу за звітний (податковий) період (сума значень рядків 01 + 02 + 03 + 04 + 05 + 06 + 07)</td>
      <td class=" text-center text-big">08</td>
      <td class=" text-center">{{R008G3}}</td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Сума податку за ставкою 15 % ((рядок 02 + рядок 04 + рядок 07) × 15 %)</td>
      <td class=" text-center text-big">09</td>
      <td class=" text-center">{{R009G3}}</td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Сума податку за ставкою 3 % (рядок 05 × 3 %)</td>
      <td class=" text-center text-big">10</td>
      <td class=" text-center">{{R010G3}}</td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Сума податку за ставкою 5 % (рядок 06 × 5 %)</td>
      <td class=" text-center text-big">11</td>
      <td class=" text-center">{{R011G3}}</td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Нараховано всього за звітний (податковий) період (рядок 9 + рядок 10 + рядок 11)</td>
      <td class=" text-center text-big">12</td>
      <td class=" text-center">{{R012G3}}</td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Нараховано за попередній звітний (податковий) період (значення рядка 12 декларації попереднього звітного (податкового) періоду)</td>
      <td class=" text-center text-big">13</td>
      <td class=" text-center">{{R013G3}}</td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Сума єдиного податку, яка підлягає нарахуванню та сплаті в бюджет за підсумками поточного звітного (податкового) періоду (рядок 12 – рядок 13)</td>
      <td class=" text-center text-big">14.1</td>
      <td class=" text-center">{{R0141G3}}</td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Позитивне значення різниці між сумою загального мінімального податкового зобов'язання та загальною сумою сплачених податків, зборів, платежів та витрат на оренду земельних ділянок (рядок 04 графи 3 розділу ІІ додатка 2 цієї податкової декларації)<sup>6</sup></td>
      <td class=" text-center text-big">14.2</td>
      <td class=" text-center">{{R0142G3}}</td>
    </tr>
    <tr class="borderred">
      <td class=" col75 text-big" colspan="3">Загальна сума єдиного податку, яка підлягає нарахуванню та сплаті в бюджет за підсумками поточного звітного (податкового) періоду (рядок 14.1 + рядок 14.2)<sup>7</sup></td>
      <td class=" text-center text-big">14</td>
      <td class=" text-center text-big">{{R014G3}}</td>
    </tr>
  </table>

  <h6 class="font-caption">
    VI. Визначення податкових зобов'язань по єдиному податку у зв'язку з виправленням самостійно виявлених помилок
  </h6>
  <table class="table-main borderred">
    <tr class="borderred">
      <td class=" text-center col75" colspan="3">Назва показника</td>
      <td class=" text-center col10">Код рядка</td>
      <td class=" text-center">Обсяг (грн, коп)<sup>4</sup></td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Сума єдиного податку, яка підлягала перерахуванню до бюджету, за даними звітного (податкового) періоду, в якому виявлена помилка (рядок 14 відповідної декларації)</td>
      <td class=" text-center text-big">15</td>
      <td class=" text-center">{{R015G3}}</td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Уточнена сума податкових зобов’язань єдиного податку за звітний (податковий) період, у якому виявлена помилка</td>
      <td class=" text-center text-big">16</td>
      <td class=" text-center">{{R016G3}}</td>
    </tr>
    <tr>
      <td class=" text-center text-big" colspan="5">Розрахунки у зв’язку з виправленням помилки:</td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Збільшення суми, яка підлягала перерахуванню до бюджету (рядок 16 – рядок 15, якщо рядок 16 > рядка 15)</td>
      <td class=" text-center text-big">17</td>
      <td class=" text-center">{{R017G3}}</td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Зменшення суми, яка підлягала перерахуванню до бюджету<sup>8</sup><br/>(рядок 16 – рядок 15, якщо рядок 16 < рядка 15)</td>
      <td class=" text-center text-big">18</td>
      <td class=" text-center">{{R018G3}}</td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Сума штрафу, яка нарахована платником податку самостійно у зв’язку з виправленням помилки, {{R019G1}} %<br/>(рядок 17 × 3 % або 17 × 5 %)<sup>9</sup></td>
      <td class=" text-center text-big">19</td>
      <td class=" text-center">{{R019G3}}</td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Сума пені, яка нарахована платником податку самостійно відповідно до підпункту 129.1.3 пункту 129.1 статті 129.1 статті 129 глави 12 розділу ІІ Податкового кодексу України<sup>9</sup></td>
      <td class=" text-center text-big">20</td>
      <td class=" text-center">{{R020G3}}</td>
    </tr>
  </table>

  <h6 class="font-caption">
    VII. Визначення зобов'язань із сплати єдиного внеску за даними звітного (податкового періоду)
  </h6>
  <table class="table-main borderred">
    <tr class="borderred">
      <td class=" text-center col75" colspan="3">Назва показника</td>
      <td class=" text-center col10">Код рядка</td>
      <td class=" text-center">Обсяг (грн, коп)<sup>4</sup></td>
    </tr>
    <tr>
      <td class=" col75" colspan="3">Сума єдиного внеску, яка підлягає сплаті на небюджетні рахунки, за даними звітного (податкового) періоду (рядок Усього графа 4 розділу 9 додатка 1 цієї податкової декларації)</td>
      <td class=" text-center text-big">21</td>
      <td class=" text-center">{{R021G3}}</td>
    </tr>
  </table>

  <h6 class="font-caption">
    VIII. Визначення податкових зобов'язань по військовому збору <sup>11</sup>
  </h6>
  <hr style="border: 1px solid #000;"/>
  <h6 class="font-caption" style="margin-top: 4px;">
    1. Для платників єдиного податку першої, другої груп
  </h6>

  <table class="table-main borderred" style="margin-top: 2px; margin-bottom: 0;">
    <tr class="borderred">
      <td class=" text-center" colspan="12"><b>Відмітка</b> про щомісячні авансові внески військового збору платників єдиного податку першої, другої груп (необхідне позначити)</td>
    </tr>
    <tr>
      <td class=" text-center text-big">01</td>
      <td class=" text-center text-big">02</td>
      <td class=" text-center text-big">03</td>
      <td class=" text-center text-big">04</td>
      <td class=" text-center text-big">05</td>
      <td class=" text-center text-big">06</td>
      <td class=" text-center text-big">07</td>
      <td class=" text-center text-big">08</td>
      <td class=" text-center text-big">09</td>
      <td class=" text-center text-big">10</td>
      <td class=" text-center text-big">11</td>
      <td class=" text-center text-big">12</td>
    </tr>
    <tr>
      <td class=" text-center">&nbsp;{{R08G1}}</td>
      <td class=" text-center">{{R08G2}}</td>
      <td class=" text-center">{{R08G3}}</td>
      <td class=" text-center">{{R08G4}}</td>
      <td class=" text-center">{{R08G5}}</td>
      <td class=" text-center">{{R08G6}}</td>
      <td class=" text-center">{{R08G7}}</td>
      <td class=" text-center">{{R08G8}}</td>
      <td class=" text-center">{{R08G9}}</td>
      <td class=" text-center">{{R08G10}}</td>
      <td class=" text-center">{{R08G11}}</td>
      <td class=" text-center">{{R08G12}}</td>
    </tr>
  </table>
  <table class="table-main" style="margin-top: 0;">
    <tr class="borderred" style="border-top: 0 !important;">
      <td class=" text-center col75" style=" border-top: 0;">Назва показника</td>
      <td class=" text-center col10" style=" border-top: 0;">Код рядка</td>
      <td class=" text-center" style=" border-top: 0;">Обсяг (грн, коп)<sup>4</sup></td>
    </tr>
    <tr class="borderred">
      <td class=" col75">Сума військового збору, нарахованого за ставкою <b>10 %</b> розміру мінімальної заробітної плати, встановленої законом на 01 січня податкового (звітного) року, з розрахунку на календарний місяць та сплаченого за період перебування на спрощеній системі оподаткування платником єдиного податку <b>першої, другої</b> груп (мінімальна заробітна плата на 01 січня податкового (звітного) року × 10 % × кількість місяців перебування на першій, другій групах)</td>
      <td class=" text-center text-big">22</td>
      <td class=" text-center">{{R022G3}}</td>
    </tr>
  </table>

  <h6 class="font-caption" style="margin-top: 4px;">
    2. Для платників єдиного податку третьої групи
  </h6>
  <table class="table-main borderred" style="margin-top: 2px;">
    <tr class="borderred">
      <td class=" text-center col75">Назва показника</td>
      <td class=" text-center col10">Код рядка</td>
      <td class=" text-center">Обсяг (грн, коп)<sup>4</sup></td>
    </tr>
    <tr>
      <td class=" col75">Сума військового збору за ставкою 1 % для платників єдиного податку <b>третьої</b> групи ((рядок 5 + рядок 6 + рядок 7) × 1 %)</td>
      <td class=" text-center text-big">23</td>
      <td class=" text-center">{{R023G3}}</td>
    </tr>
    <tr>
      <td class=" col75">Нараховано військового збору за попередній звітний (податковий) період для платників єдиного податку <b>третьої групи</b> (значення <b>рядка 23</b> декларації <b>попереднього</b> звітного (податкового) періоду)</td>
      <td class=" text-center text-big">24</td>
      <td class=" text-center">{{R024G3}}</td>
    </tr>
    <tr>
      <td class=" col75">Сума військового збору, яка підлягає нарахуванню та сплаті в бюджет за підсумками поточного звітного (податкового) періоду для платників єдиного податку <b>третьої групи</b> (рядок 23 – рядок 24)</td>
      <td class=" text-center text-big">25</td>
      <td class=" text-center">{{R025G3}}</td>
    </tr>
    <tr>
      <td class=" col75">Сума військового збору, яка підлягала перерахуванню до бюджету, за даними <b>раніше поданого</b> звітного (податкового) періоду, в якому виявлена помилка (рядок 25 відповідної декларації)</td>
      <td class=" text-center text-big">26</td>
      <td class=" text-center">{{R026G3}}</td>
    </tr>
    <tr>
      <td class=" col75">Уточнена сума податкових зобов’язань військового збору за звітний (податковий) період, у якому виявлена помилка</td>
      <td class=" text-center text-big">27</td>
      <td class=" text-center">{{R027G3}}</td>
    </tr>
    <tr>
      <td class=" col75">Збільшення суми військового збору, яка підлягала перерахуванню до бюджету<br/>(рядок 27 – рядок 26, якщо рядок 27 > рядка 26)</td>
      <td class=" text-center text-big">28</td>
      <td class=" text-center">{{R028G3}}</td>
    </tr>
    <tr>
      <td class=" col75">Зменшення суми військового збору, яка підлягала перерахуванню до бюджету<sup>8</sup><br/>(рядок 27 – рядок 26, якщо рядок 27 < рядка 26)</td>
      <td class=" text-center text-big">29</td>
      <td class=" text-center">{{R029G3}}</td>
    </tr>
  </table>

  <table class="table-main borderred">
    <tr>
      <td class="text-center text-big" colspan="2">
        Доповнення до цієї податкової декларації (заповнюється і додається відповідно до пункту 46.4 статті 46 глави 2<br/>
        розділу ІІ Податкового кодексу України) на {{HJAR}} арк.
      </td>
    </tr>
    <tr>
      <td style="width: 35px;" class="text-center text-small">N<br/> п/п</td>
      <td class="text-center">Зміст доповнення</td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>{{T2R0001G2S}}</td>
    </tr>
  </table>
  <h5 class="font-caption" style="margin-top: 2px; text-align: left;">
    До цієї податкової декларації додається:
  </h5>
  <table class="table-main borderred">
    <tr>
      <td class="borderred table-first-cell text-big">1</td>
      <td class="borderred text-big">Додаток 1 "Відомості про суми нарахованого доходу застрахованих осіб та суми нарахованого єдиного внеску"<sup>10</sup></td>
      <td class="borderred text-big col10">{{HD1}}</td>
    </tr>
     <tr>
      <td class="borderred table-first-cell text-big">2</td>
      <td class="borderred text-big">Додаток 2 "Розрахунок загального мінімального податкового зобов’язання за податковий (звітний) рік"<sup>6</sup></td>
      <td class="borderred text-big">{{HD2}}</td>
    </tr>
  </table>

  <table class="table-main ">
    <tr>
      <td style="padding-top: 8px;">
        <table class="table-inner" style="width: 50%;">
          <tr>
            <td style="border: 0; width: 50%;">Дата подання декларації: </td>
            <td class="text-center borderred" style="padding: 8px 10px;"> {{HFILL}}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="text-center text-big">Інформація про особу, уповноважену на заповнення декларації</td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table class="table-inner">
          <tr>
            <td colspan="2" style="border: 0">Прізвище (за наявності) , ім’я, по батькові (за наявності) уповноваженої особи:</td>
            <td colspan="2" class="borderred text-center col30" style="padding: 8px 10px;"> {{HEXECUTOR}}</td>
          </tr>
          <tr>
            <td colspan="4" style="border: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td rowspan="2" style="border: 0;">Реєстраційний номер облікової картки платника податків або серія (за наявності) та номер паспорта<sup>1</sup></td>
            <td colspan="2" class="borderred text-center col30" style="padding: 8px 10px;"> {{HKEXECUTOR}}</td>
            <td style="border: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td colspan="3" style="border: 0;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="border: 0;">
        <table class="table-inner">
          <tr>
            <td style="border: 0;">Фізична особа – платник податку<br/>або уповноважена особа</td>
            <td style="border: 0; border-bottom: 1px solid;" class="col10">&nbsp;</td>
            <td style="border: 0;" class="col10">&nbsp;</td>
            <td style="border: 0; border-bottom: 1px solid;" class="col25 text-center>{{HBOS}}</td>
            <td style="border: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="border: 0;">&nbsp;</td>
            <td style="border: 0;" class="col10 text-small text-center">(підпис)</td>
            <td style="border: 0;" class="col10">&nbsp;</td>
            <td style="border: 0;" class="text-center text-small">(власне ім’я та прізвище)</td>
            <td style="border: 0;"></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <table class="table-main borderred">
    <tr>
      <td colspan="5" class="text-center" style="font-weight: bold;">
        Ця частина декларації заповнюється посадовими особами контролюючого органу
      </td>
    </tr>
    <tr class="">
      <td style="" colspan="5" >
        <table class="table-inner">
          <tr>
            <td class="borderred text-center" style="padding: 0; width: 20px;"> &nbsp;</td>
            <td style="border: 0;">Відмітка про внесення даних до електронної бази податкової звітності</td>
            <td style="border: 0;">"___" ____________ 20__ року</td>
            
          </tr>
        </table>
        <hr
          style="margin-top: 20px; margin-bottom: 0; border: 1px solid; color: black;"
        />
        <p style="font-size: 6px; width:100%;margin: 0;" class="text-center">(посадова особа контролюючого органу (підпис, власне ім’я та прізвище))</p>
        <table class="table-inner">
          <tr>
            <td style="border: 0;" colspan="3">За результатами камеральної перевірки декларації (потрібне позначити):</td>
          </tr>
          <tr>
            <td class="borderred text-center" style="padding: 0; width: 20px;"> &nbsp;</td>
            <td style="border: 0;">порушень (помилок) не виявлено</td>
            <td style="border: 0;">Складено акт від "___" ____________ 20__ року № _______</td>
            
          </tr>
        </table>
        <hr
          style="margin-top: 20px; margin-bottom: 0; border: 1px solid; border-bottom: 0;"
        />
        <p style="font-size: 6px; width:100%;margin: 0;" class="text-center">(посадова особа контролюючого органу (підпис, власне ім’я та прізвище))</p>        
      </td>
    </tr>
    <tr>
      <td colspan="5" style="height: 30px; padding: 0;">
        <table class="table-inner">
          <tr>
            <td style="border: 0; width:20px;" colspan="3">&nbsp;</td>
            <td style="border: 0;">"___" ____________ 20__ року</td>
          </tr>
        </table>
      
      
      </td>
    </tr>
  </table>
  <table class="table-main">
    <tr>
      <td style="font-size: 7px;">
        * Подається з метою отримання довідки про доходи за інший період, ніж квартальний (річний) податковий (звітний) період / призначення пенсії / матеріального забезпечення, страхових виплат. Для
        призначення пенсії / матеріального забезпечення, страхових виплат обов’язково зазначається тип цієї податкової декларації "Звітна" або "Звітна нова" з додатковою позначкою "Довідкова". Тип цієї
        податкової декларації "Уточнююча" при поданні Додатка 1 "Відомостей про суми нарахованого доходу застрахованих осіб та суми нарахованого єдиного внеску" цієї податкової декларації (далі – Додаток 1)
        для призначення пенсії / матеріального забезпечення, страхових виплат не застосовується. У разі подання цієї податкової декларації для отримання довідки обов’язково зазначається тип декларації
        "Довідкова", податкові зобов’язання по єдиному податку в розділах V, VІ цієї податкової декларації не визначаються та Додаток 1 до цієї податкової декларації не подається. Подання таких податкових
        декларацій не звільняє платника від обов’язку подання цієї податкової декларації у строк, встановлений для квартального (річного) податкового (звітного) періоду.
      </td>
    </tr>
    <tr>
      <td style="font-size: 7px;">
        ** Для отримання довідки про доходи платником зазначається номер календарного місяця, за який подається податкова декларація з позначкою "Довідково".
        Для призначення пенсії платником вказується арабськими цифрами від 1 до 12 номер календарного місяця, в якому подається ця податкова декларація. Для забезпечення реалізації права на матеріальне
        забезпечення та страхових виплат за загальнообов’язковим державним соціальним страхуванням платником вказується арабськими цифрами від 1 до 12 номер календарного місяця, в якому настав
        страховий випадок.
      </td>
    </tr>
    <tr>
      <td style="font-size: 7px;">
        <sup>1</sup> Серію (за наявності) та номер паспорта зазначають фізичні особи, які через релігійні переконання відмовляються від прийняття реєстраційного номера облікової картки платника податків та офіційно
        повідомили про це відповідний контролюючий орган і мають відмітку у паспорті.
      </td>
    </tr>
    <tr>
      <td style="font-size: 7px;">
        <sup>2</sup> У разі подання цієї податкової декларації за останній податковий (звітний) період (квартал, півріччя, три квартали), на який припадає дата державної реєстрації припинення/перехід на сплату інших
        податків і зборів платник єдиного податку звільняється від обов’язку подання цієї податкової декларації у строк, визначений для річного податкового (звітного періоду) (пункт 294.6 статті 294, підпункт
        296.5.1 пункту 296.5 статті 296 глави 1 розділу XIV Податкового кодексу України).
      </td>
    </tr>
    <tr>
      <td style="font-size: 7px;">
        <sup>3</sup> Код та назва виду економічної діяльності зазначаються відповідно до Класифікатора видів економічної діяльності (КВЕД ДК 009:2010).
      </td>
    </tr>
    <tr>
      <td style="font-size: 7px;">
        <sup>4</sup> Заповнюється наростаючим підсумком з початку року у гривнях з двома десятковими знаками після коми.
      </td>
    </tr>
    <tr>
      <td style="font-size: 7px;">
        <sup>5</sup> <b>Включається:</b><br/>
        <p>сума доходу, що перевищує обсяги, встановлені підпунктами 1–3 пункту 291.4 статті 291 глави 1 розділу XIV Податкового кодексу України, у звітному (податковому) періоді;</p>
        <p>сума доходу, отриманого від провадження діяльності, не зазначеної в реєстрі платників єдиного податку (для першої або другої групи), у звітному (податковому) періоді;</p>
        <p>сума доходу, отриманого при застосуванні іншого способу розрахунків, ніж передбачено пунктом 291.6 статті 291 глави 1 розділу XIV Податкового кодексу України, у звітному (податковому) періоді;</p>
        <p>сума доходу, отриманого від здійснення видів діяльності, які не дають права на застосування спрощеної системи оподаткування, у звітному (податковому) періоді;</p>
        <p>сума доходу, отриманого платниками першої або другої групи від провадження діяльності, яка не передбачена в підпунктах 1, 2 пункту 291.4 статті 291 глави 1 розділу XIV Податкового кодексу України.</p>
      </td>
    </tr>
    <tr>
      <td style="font-size: 7px;">
        <sup>6</sup> Платники єдиного податку – власники, орендарі, користувачі на інших умовах (в тому числі на умовах емфітевзису) земельних ділянок, віднесених до сільськогосподарських угідь, а також голови сімейних
        фермерських господарств, у тому числі щодо земельних ділянок, що належать членам такого сімейного фермерського господарства та використовуються таким сімейним фермерським господарством,
        зобов’язані подавати додаток з розрахунком загального мінімального податкового зобов’язання у складі податкової декларації за податковий (звітний) рік (пункт 2971.1 статті 2971 глави 1 розділу XIV
        Податкового кодексу України).
      </td>
    </tr>
    <tr>
      <td style="font-size: 7px;">
        <sup>7</sup> Підлягає обов’язковому заповненню.
      </td>
    </tr>
    <tr>
      <td style="font-size: 7px;">
        <sup>8</sup> Зазначається тільки як позитивне значення.
      </td>
    </tr>
    <tr>
      <td style="font-size: 7px;">
        <sup>9</sup> Нараховується платником у разі самостійного виявлення факту заниження податкового зобов’язання (пункт 50.1 статті 50 глави 2 розділу ІІ Податкового кодексу України). У разі самостійного виправлення
        платником податків, з дотриманням порядку, вимог та обмежень, визначених статтею 50 глави 2 розділу ІІ Податкового кодексу України, помилок, що призвели до заниження податкового зобов’язання у
        звітних (податкових) періодах, що припадають на період дії воєнного стану, такі платники звільняються від нарахування та сплати штрафних санкцій, передбачених пунктом 50.1 статті 50 глави 2 розділу ІІ
        Податкового кодексу України, та пені (абзац двадцять другий підпункту 69.1 пункту 69 підрозділу 10 розділу ХХ «Перехідні положення» Податкового кодексу України).
      </td>
    </tr>
    <tr>
      <td style="font-size: 7px;">
        <sup>10</sup> Додаток 1 є невід’ємною частиною цієї податкової декларації, подається та заповнюється фізичними особами – підприємцями – платниками єдиного податку першої – третьої груп, відповідно до пунктів
        296.2 та 296.3 статті 296 глави 1 розділу XIV Податкового кодексу України, та які є платниками єдиного внеску відповідно до пункту 4 частини першої статті 4 Закону України "Про збір та облік єдиного
        внеску на загальнообов’язкове державне соціальне страхування". Додаток 1 до цієї податкової декларації не подається та не заповнюється зазначеними платниками, за умови дотримання ними вимог,
        визначених частинами четвертою та шостою статті 4 Закону України "Про збір та облік єдиного внеску на загальнообов’язкове державне соціальне страхування", що дають право на звільнення таких осіб від
        сплати за себе єдиного внеску. Такі особи можуть подавати Додаток 1 до цієї податкової декларації виключно за умови їх добровільної участі у системі загальнообов’язкового державного соціального
        страхування.
      </td>
    </tr>
    <tr>
      <td style="font-size: 7px;">
        <sup>11</sup> Заповнюється фізичними особами – підприємцями – платниками єдиного податку першої – третьої груп, відповідно до підпунктів 1.2, 1.3 пункту 161 підрозділу 10 розділу ХХ "Перехідні положення"
        Податкового кодексу України за звітні (податкові) періоди починаючи з 2025 року.
      </td>
    </tr>
  </table>
</div>
</body>
</html>`;