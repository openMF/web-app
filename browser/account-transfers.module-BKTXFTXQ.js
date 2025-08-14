import{a as D}from"./chunk-VZSTTT5N.js";import{$a as Z,$c as $,Aa as Ft,Ad as ft,Af as Ve,Ba as Mt,Bc as Q,C as H,Ca as E,Cc as _,Cf as Le,D as Pt,Da as t,Dc as W,Dd as Oe,Df as He,Ea as p,Ec as tt,Ef as je,F as R,Fa as v,Ga as I,Ha as Te,Hc as Bt,Hd as xt,I as h,Ic as Me,J as C,Ja as he,Jc as et,Ka as Ce,Kc as Ct,Ke as jt,La as ye,Lc as Be,Le as $t,Mc as nt,Me as Ut,Mf as $e,Na as N,Nd as qe,Oa as vt,Ob as q,Oe as Gt,Pc as it,Pe as zt,Qa as o,Ra as s,Rb as Tt,Re as Qt,Sa as Lt,Sb as G,Sc as at,Se as Wt,Tc as ke,U as pe,Ub as ce,Ue as Yt,Vc as yt,Ve as Jt,Wc as we,Xb as j,Xc as k,Xe as Kt,Y as a,Yc as P,Za as be,Ze as kt,_a as Ee,aa as S,ab as O,ba as A,bd as rt,ca as Rt,fa as u,fd as Y,fg as Ue,gd as ot,ge as Pe,ha as m,hb as De,hd as Ne,he as Re,ic as Ae,jd as st,kd as J,la as n,ld as Ht,ma as e,mb as M,md as K,na as f,nd as lt,oa as V,pa as L,pd as mt,ra as F,rc as B,rd as pt,sa as T,sd as ct,ta as y,tc as Fe,td as dt,te as bt,vd as ut,wa as Vt,wc as ht,xc as z,xd as U,za as At}from"./chunk-4JZCV75L.js";import{a as Ot,b as qt}from"./chunk-O7S4L63H.js";var Ye=()=>["../","edit"],Je=()=>["../","list-account-transactions"];function Ke(i,c){i&1&&(n(0,"button",1),t(1),o(2,"translate"),e()),i&2&&(m("routerLink",N(4,Je)),a(),v(`
    `,s(2,2,"labels.buttons.View Transactions History"),`
  `))}function Xe(i,c){i&1&&(n(0,"span"),t(1),o(2,"translate"),e()),i&2&&(a(),v(" ",s(2,1,"labels.inputs.Within Bank")," "))}function Ze(i,c){i&1&&(n(0,"span"),t(1),o(2,"translate"),e()),i&2&&(a(),v(" ",s(2,1,"labels.inputs.Own Account")," "))}var Xt=(()=>{class i{constructor(r){this.route=r,this.allowclientedit=!1,this.route.data.subscribe(d=>{this.standingInstructionsData=d.standingInstructionsData,this.standingInstructionsData.fromClient.id===this.standingInstructionsData.toClient.id&&(this.allowclientedit=!1)})}static{this.\u0275fac=function(d){return new(d||i)(S(q))}}static{this.\u0275cmp=A({type:i,selectors:[["mifosx-view-standing-instructions"]],decls:215,vars:90,consts:[[1,"layout-row","align-end","gap-2px","responsive-column","container","m-b-20"],["mat-raised-button","","color","primary",3,"routerLink"],["icon","edit",1,"m-r-10"],["mat-raised-button","","color","primary",3,"routerLink",4,"mifosxHasPermission"],[1,"container"],[1,"layout-row-wrap","responsive-column"],[1,"mat-h2","flex-fill"],[3,"inset"],[1,"flex-fill"],[1,"flex-40"],[1,"flex-60"],[4,"ngIf"]],template:function(d,l){d&1&&(n(0,"div",0),t(1,`
  `),n(2,"button",1),t(3,`
    `),f(4,"fa-icon",2),t(5),o(6,"translate"),e(),t(7,`
  `),u(8,Ke,3,5,"button",3),t(9,`
`),e(),t(10,`

`),n(11,"div",4),t(12,`
  `),n(13,"mat-card"),t(14,`
    `),n(15,"mat-card-content"),t(16,`
      `),n(17,"div",5),t(18,`
        `),n(19,"h2",6),t(20),e(),t(21,`

        `),f(22,"mat-divider",7),t(23,`

        `),n(24,"div",8),t(25,`
          `),n(26,"span",9),t(27),o(28,"translate"),e(),t(29,`
          `),n(30,"span",10),t(31),e(),t(32,`
        `),e(),t(33,`

        `),n(34,"div",8),t(35,`
          `),n(36,"span",9),t(37),o(38,"translate"),e(),t(39,`
          `),n(40,"span",10),t(41),e(),t(42,`
        `),e(),t(43,`

        `),n(44,"div",8),t(45,`
          `),n(46,"span",9),t(47),o(48,"translate"),e(),t(49,`
          `),n(50,"span",10),t(51),e(),t(52,`
        `),e(),t(53,`

        `),n(54,"div",8),t(55,`
          `),n(56,"span",9),t(57),o(58,"translate"),e(),t(59,`
          `),n(60,"span",10),t(61),e(),t(62,`
        `),e(),t(63,`

        `),n(64,"div",8),t(65,`
          `),n(66,"span",9),t(67),o(68,"translate"),e(),t(69,`
          `),n(70,"span",10),t(71),e(),t(72,`
        `),e(),t(73,`

        `),n(74,"div",8),t(75,`
          `),n(76,"span",9),t(77),o(78,"translate"),e(),t(79,`
          `),n(80,"span",10),t(81),e(),t(82,`
        `),e(),t(83,`

        `),n(84,"div",8),t(85,`
          `),n(86,"span",9),t(87),o(88,"translate"),e(),t(89,`
          `),n(90,"span",10),t(91,`
            `),u(92,Xe,3,3,"span",11),t(93,`
            `),u(94,Ze,3,3,"span",11),t(95,`
          `),e(),t(96,`
        `),e(),t(97,`

        `),n(98,"div",8),t(99,`
          `),n(100,"span",9),t(101),o(102,"translate"),e(),t(103,`
          `),n(104,"span",10),t(105),e(),t(106,`
        `),e(),t(107,`

        `),n(108,"div",8),t(109,`
          `),n(110,"span",9),t(111),o(112,"translate"),e(),t(113,`
          `),n(114,"span",10),t(115),e(),t(116,`
        `),e(),t(117,`

        `),n(118,"div",8),t(119,`
          `),n(120,"span",9),t(121),o(122,"translate"),e(),t(123,`
          `),n(124,"span",10),t(125),e(),t(126,`
        `),e(),t(127,`

        `),n(128,"div",8),t(129,`
          `),n(130,"span",9),t(131),o(132,"translate"),e(),t(133,`
          `),n(134,"span",10),t(135),e(),t(136,`
        `),e(),t(137,`

        `),n(138,"div",8),t(139,`
          `),n(140,"span",9),t(141),o(142,"translate"),e(),t(143,`
          `),n(144,"span",10),t(145),e(),t(146,`
        `),e(),t(147,`

        `),n(148,"div",8),t(149,`
          `),n(150,"span",9),t(151),o(152,"translate"),e(),t(153,`
          `),n(154,"span",10),t(155),e(),t(156,`
        `),e(),t(157,`

        `),n(158,"div",8),t(159,`
          `),n(160,"span",9),t(161),o(162,"translate"),e(),t(163,`
          `),n(164,"span",10),t(165),o(166,"dateFormat"),o(167,"dateFormat"),e(),t(168,`
        `),e(),t(169,`

        `),n(170,"div",8),t(171,`
          `),n(172,"span",9),t(173),o(174,"translate"),e(),t(175,`
          `),n(176,"span",10),t(177),e(),t(178,`
        `),e(),t(179,`

        `),n(180,"div",8),t(181,`
          `),n(182,"span",9),t(183),o(184,"translate"),e(),t(185,`
          `),n(186,"span",10),t(187),e(),t(188,`
        `),e(),t(189,`

        `),n(190,"div",8),t(191,`
          `),n(192,"span",9),t(193),o(194,"translate"),e(),t(195,`
          `),n(196,"span",10),t(197),e(),t(198,`
        `),e(),t(199,`

        `),n(200,"div",8),t(201,`
          `),n(202,"span",9),t(203),o(204,"translate"),e(),t(205,`
          `),n(206,"span",10),t(207),o(208,"dateFormat"),e(),t(209,`
        `),e(),t(210,`
      `),e(),t(211,`
    `),e(),t(212,`
  `),e(),t(213,`
`),e(),t(214,`
`)),d&2&&(a(2),m("routerLink",N(89,Ye)),a(3),v(`
    `,s(6,45,"labels.buttons.Edit"),`
  `),a(3),m("mifosxHasPermission","READ_ACCOUNTTRANSFER"),a(12),p(l.standingInstructionsData.name),a(2),m("inset",!0),a(5),v("",s(28,47,"labels.inputs.Applicant"),":"),a(4),p(l.standingInstructionsData.fromClient.displayName),a(6),v("",s(38,49,"labels.inputs.Type"),":"),a(4),p(l.standingInstructionsData.transferType.value),a(6),v("",s(48,51,"labels.inputs.Priority"),":"),a(4),p(l.standingInstructionsData.priority.value),a(6),v("",s(58,53,"labels.inputs.Status"),":"),a(4),p(l.standingInstructionsData.status.value),a(6),v("",s(68,55,"labels.inputs.From Account Type"),":"),a(4),p(l.standingInstructionsData.fromAccountType.value),a(6),v("",s(78,57,"labels.inputs.From Account"),":"),a(4),I("",l.standingInstructionsData.fromAccount.productName,` -
            `,l.standingInstructionsData.fromAccount.accountNo,""),a(6),v("",s(88,59,"labels.inputs.Destination"),":"),a(5),m("ngIf",l.allowclientedit),a(2),m("ngIf",!l.allowclientedit),a(7),v("",s(102,61,"labels.inputs.To Office"),":"),a(4),p(l.standingInstructionsData.toOffice.name),a(6),v("",s(112,63,"labels.inputs.Beneficiary"),":"),a(4),p(l.standingInstructionsData.toClient.displayName),a(6),v("",s(122,65,"labels.inputs.To Account Type"),":"),a(4),p(l.standingInstructionsData.toAccountType.value),a(6),v("",s(132,67,"labels.inputs.To Account"),":"),a(4),I("",l.standingInstructionsData.toAccount.productName,` -
            `,l.standingInstructionsData.toAccount.accountNo,""),a(6),v("",s(142,69,"labels.inputs.Standing Instruction Type"),":"),a(4),p(l.standingInstructionsData.instructionType.value),a(6),v("",s(152,71,"labels.inputs.Amount"),":"),a(4),p(l.standingInstructionsData.amount),a(6),v("",s(162,73,"labels.inputs.Validity"),":"),a(4),I("",s(166,75,l.standingInstructionsData.validFrom),` -
            `,s(167,77,l.standingInstructionsData.validTill),""),a(8),v("",s(174,79,"labels.inputs.Recurrence Type"),":"),a(4),p(l.standingInstructionsData.recurrenceType.value),a(6),v("",s(184,81,"labels.inputs.Interval"),":"),a(4),p(l.standingInstructionsData.recurrenceInterval),a(6),v("",s(194,83,"labels.inputs.Recurrence Frequency"),":"),a(4),p(l.standingInstructionsData.recurrenceFrequency.value),a(6),v("",s(204,85,"labels.inputs.On Month Day"),":"),a(4),p(s(208,87,l.standingInstructionsData.recurrenceOnMonthDay)))},dependencies:[M,O,k,G,P,$,j,ut,U,B,ft,xt],styles:[".mat-elevation-z1[_ngcontent-%COMP%]{margin:1em 0 1.5em}h2[_ngcontent-%COMP%], h3[_ngcontent-%COMP%], h4[_ngcontent-%COMP%]{margin:0;font-weight:500}span[_ngcontent-%COMP%]{margin:.5em 0}.margin-t[_ngcontent-%COMP%]{margin-top:1em}mat-divider[_ngcontent-%COMP%]{margin:0 0 1em}"]})}}return i})();var tn=()=>["../view"];function en(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.value,`
              `)}}function nn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Priority")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function an(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.value,`
              `)}}function rn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Status")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function on(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.value,`
              `)}}function sn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Valid From Date")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function ln(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Valid Till Date")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function mn(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.value,`
              `)}}function pn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Recurrence Type")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function cn(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.value,`
              `)}}function dn(i,c){if(i&1){let r=F();n(0,"button",35),T("click",function(){h(r);let l=y();return C(l.submit())}),t(1),o(2,"translate"),e()}if(i&2){let r=y();m("disabled",!r.editStandingInstructionsForm.valid),a(),v(`
          `,s(2,2,"labels.buttons.Submit"),`
        `)}}var ne=(()=>{class i{constructor(r,d,l,x,g,b){this.formBuilder=r,this.route=d,this.router=l,this.accountTransfersService=x,this.settingsService=g,this.dateUtils=b,this.allowclientedit=!1,this.minDate=new Date(2e3,0,1),this.maxDate=new Date(2100,0,1),this.route.data.subscribe(gt=>{this.standingInstructionsData=gt.standingInstructionsDataAndTemplate,this.standingInstructionsId=gt.standingInstructionsDataAndTemplate.id,this.standingInstructionsData.fromClient.id===this.standingInstructionsData.toClient.id&&(this.allowclientedit=!1),this.setOptions()})}ngOnInit(){this.createEditStandingInstructionsForm();let d=new Date().getFullYear();this.standingInstructionsData.recurrenceOnMonthDay&&this.standingInstructionsData.recurrenceOnMonthDay.push(d),this.editStandingInstructionsForm.patchValue({name:this.standingInstructionsData.name,applicant:this.standingInstructionsData.fromClient.displayName,type:this.standingInstructionsData.transferType.value,priority:this.standingInstructionsData.priority.id,status:this.standingInstructionsData.status.id,fromAccountType:this.standingInstructionsData.fromAccountType.value,fromAccount:this.standingInstructionsData.fromAccount.productName,destination:this.allowclientedit?"Within Bank":"Own Account",toOffice:this.standingInstructionsData.toOffice.name,toClientId:this.standingInstructionsData.toClient.displayName,toAccountType:this.standingInstructionsData.toAccountType.value,toAccount:this.standingInstructionsData.toAccount.productName,instructionType:this.standingInstructionsData.instructionType.id,amount:this.standingInstructionsData.amount,validFrom:this.standingInstructionsData.validFrom&&new Date(this.standingInstructionsData.validFrom),validTill:this.standingInstructionsData.validTill&&new Date(this.standingInstructionsData.validTill),recurrenceType:this.standingInstructionsData.recurrenceType.id,recurrenceInterval:this.standingInstructionsData.recurrenceInterval,recurrenceFrequency:this.standingInstructionsData.recurrenceFrequency.id,recurrenceOnMonthDay:this.standingInstructionsData.recurrenceOnMonthDay&&new Date(this.standingInstructionsData.recurrenceOnMonthDay)})}createEditStandingInstructionsForm(){this.editStandingInstructionsForm=this.formBuilder.group({name:[{value:"",disabled:!0}],applicant:[{value:"",disabled:!0}],type:[{value:"",disabled:!0}],priority:["",_.required],status:["",_.required],fromAccountType:[{value:"",disabled:!0}],fromAccount:[{value:"",disabled:!0}],destination:[{value:"",disabled:!0}],toOffice:[{value:"",disabled:!0}],toClientId:[{value:"",disabled:!0}],toAccountType:[{value:"",disabled:!0}],toAccount:[{value:"",disabled:!0}],instructionType:"",amount:"",validFrom:["",_.required],validTill:["",_.required],recurrenceType:["",_.required],recurrenceInterval:"",recurrenceFrequency:"",recurrenceOnMonthDay:""})}setOptions(){this.priorityTypeData=this.standingInstructionsData.priorityOptions,this.statusTypeData=this.standingInstructionsData.statusOptions,this.instructionTypeData=this.standingInstructionsData.instructionTypeOptions,this.recurrenceTypeData=this.standingInstructionsData.recurrenceTypeOptions,this.recurrenceFrequencyTypeData=this.standingInstructionsData.recurrenceFrequencyOptions}submit(){let r=this.settingsService.dateFormat,d=this.settingsService.language.code,l={amount:this.editStandingInstructionsForm.value.amount,dateFormat:r,instructionType:this.editStandingInstructionsForm.value.instructionType,locale:d,monthDayFormat:"dd MMMM",priority:this.editStandingInstructionsForm.value.priority,recurrenceFrequency:this.editStandingInstructionsForm.value.recurrenceFrequency,recurrenceInterval:this.editStandingInstructionsForm.value.recurrenceInterval,recurrenceOnMonthDay:this.dateUtils.formatDate(this.editStandingInstructionsForm.value.recurrenceOnMonthDay,"dd MMMM"),recurrenceType:this.editStandingInstructionsForm.value.recurrenceType,status:this.editStandingInstructionsForm.value.status,validFrom:this.dateUtils.formatDate(this.editStandingInstructionsForm.value.validFrom,r),validTill:this.dateUtils.formatDate(this.editStandingInstructionsForm.value.validTill,r)};this.accountTransfersService.updateStandingInstructionsData(this.standingInstructionsId,l).subscribe(x=>{this.router.navigate(["../view"],{relativeTo:this.route})})}static{this.\u0275fac=function(d){return new(d||i)(S(yt),S(q),S(Tt),S(D),S(z),S(ht))}}static{this.\u0275cmp=A({type:i,selectors:[["mifosx-edit-standing-instructions"]],decls:244,vars:89,consts:[["validFromDatePicker",""],["validTillDatePicker",""],["recurrenceOnMonthDayDatePicker",""],[1,"container"],[3,"formGroup"],[1,"layout-row-wrap","gap-2px","responsive-column"],[1,"flex-48"],["matInput","","formControlName","name"],["matInput","","formControlName","applicant"],["matInput","","formControlName","type"],["matInput","","formControlName","fromAccountType"],["required","","formControlName","priority"],[3,"value",4,"ngFor","ngForOf"],[4,"ngIf"],["required","","formControlName","status"],["matInput","","formControlName","fromAccount"],["matInput","","formControlName","destination"],["matInput","","formControlName","toOffice"],["matInput","","formControlName","toClientId"],["matInput","","formControlName","toAccountType"],["matInput","","formControlName","toAccount"],["formControlName","instructionType"],["matInput","","formControlName","amount"],[1,"flex-48",3,"click"],["matInput","","required","","formControlName","validFrom",3,"min","max","matDatepicker"],["matSuffix","",3,"for"],["matInput","","required","","formControlName","validTill",3,"min","max","matDatepicker"],["required","","formControlName","recurrenceType"],["matInput","","formControlName","recurrenceInterval"],["formControlName","recurrenceFrequency"],["matInput","","formControlName","recurrenceOnMonthDay",3,"min","max","matDatepicker"],[1,"layout-row","align-center","gap-5px","responsive-column"],["type","button","mat-raised-button","",3,"routerLink"],["mat-raised-button","","color","primary",3,"disabled","click",4,"mifosxHasPermission"],[3,"value"],["mat-raised-button","","color","primary",3,"click","disabled"]],template:function(d,l){if(d&1){let x=F();n(0,"div",3),t(1,`
  `),n(2,"mat-card"),t(3,`
    `),n(4,"form",4),t(5,`
      `),n(6,"mat-card-content"),t(7,`
        `),n(8,"div",5),t(9,`
          `),n(10,"mat-form-field",6),t(11,`
            `),n(12,"mat-label"),t(13),o(14,"translate"),e(),t(15,`
            `),f(16,"input",7),t(17,`
          `),e(),t(18,`

          `),n(19,"mat-form-field",6),t(20,`
            `),n(21,"mat-label"),t(22),o(23,"translate"),e(),t(24,`
            `),f(25,"input",8),t(26,`
          `),e(),t(27,`

          `),n(28,"mat-form-field",6),t(29,`
            `),n(30,"mat-label"),t(31),o(32,"translate"),e(),t(33,`
            `),f(34,"input",9),t(35,`
          `),e(),t(36,`

          `),n(37,"mat-form-field",6),t(38,`
            `),n(39,"mat-label"),t(40),o(41,"translate"),e(),t(42,`
            `),f(43,"input",10),t(44,`
          `),e(),t(45,`

          `),n(46,"mat-form-field",6),t(47,`
            `),n(48,"mat-label"),t(49),o(50,"translate"),e(),t(51,`
            `),n(52,"mat-select",11),t(53,`
              `),u(54,en,2,2,"mat-option",12),t(55,`
            `),e(),t(56,`
            `),u(57,nn,8,9,"mat-error",13),t(58,`
          `),e(),t(59,`

          `),n(60,"mat-form-field",6),t(61,`
            `),n(62,"mat-label"),t(63),o(64,"translate"),e(),t(65,`
            `),n(66,"mat-select",14),t(67,`
              `),u(68,an,2,2,"mat-option",12),t(69,`
            `),e(),t(70,`
            `),u(71,rn,8,9,"mat-error",13),t(72,`
          `),e(),t(73,`

          `),n(74,"mat-form-field",6),t(75,`
            `),n(76,"mat-label"),t(77),o(78,"translate"),e(),t(79,`
            `),f(80,"input",15),t(81,`
          `),e(),t(82,`

          `),n(83,"mat-form-field",6),t(84,`
            `),n(85,"mat-label"),t(86),o(87,"translate"),e(),t(88,`
            `),f(89,"input",16),t(90,`
          `),e(),t(91,`

          `),n(92,"mat-form-field",6),t(93,`
            `),n(94,"mat-label"),t(95),o(96,"translate"),e(),t(97,`
            `),f(98,"input",17),t(99,`
          `),e(),t(100,`

          `),n(101,"mat-form-field",6),t(102,`
            `),n(103,"mat-label"),t(104),o(105,"translate"),e(),t(106,`
            `),f(107,"input",18),t(108,`
          `),e(),t(109,`

          `),n(110,"mat-form-field",6),t(111,`
            `),n(112,"mat-label"),t(113),o(114,"translate"),e(),t(115,`
            `),f(116,"input",19),t(117,`
          `),e(),t(118,`

          `),n(119,"mat-form-field",6),t(120,`
            `),n(121,"mat-label"),t(122),o(123,"translate"),e(),t(124,`
            `),f(125,"input",20),t(126,`
          `),e(),t(127,`

          `),n(128,"mat-form-field",6),t(129,`
            `),n(130,"mat-label"),t(131),o(132,"translate"),e(),t(133,`
            `),n(134,"mat-select",21),t(135,`
              `),u(136,on,2,2,"mat-option",12),t(137,`
            `),e(),t(138,`
          `),e(),t(139,`

          `),n(140,"mat-form-field",6),t(141,`
            `),n(142,"mat-label"),t(143),o(144,"translate"),e(),t(145,`
            `),f(146,"input",22),t(147,`
          `),e(),t(148,`

          `),n(149,"mat-form-field",23),T("click",function(){h(x);let b=E(160);return C(b.open())}),t(150,`
            `),n(151,"mat-label"),t(152),o(153,"translate"),e(),t(154,`
            `),f(155,"input",24),t(156,`
            `),f(157,"mat-datepicker-toggle",25),t(158,`
            `),f(159,"mat-datepicker",null,0),t(161,`
            `),u(162,sn,8,9,"mat-error",13),t(163,`
          `),e(),t(164,`

          `),n(165,"mat-form-field",23),T("click",function(){h(x);let b=E(176);return C(b.open())}),t(166,`
            `),n(167,"mat-label"),t(168),o(169,"translate"),e(),t(170,`
            `),f(171,"input",26),t(172,`
            `),f(173,"mat-datepicker-toggle",25),t(174,`
            `),f(175,"mat-datepicker",null,1),t(177,`
            `),u(178,ln,8,9,"mat-error",13),t(179,`
          `),e(),t(180,`

          `),n(181,"mat-form-field",6),t(182,`
            `),n(183,"mat-label"),t(184),o(185,"translate"),e(),t(186,`
            `),n(187,"mat-select",27),t(188,`
              `),u(189,mn,2,2,"mat-option",12),t(190,`
            `),e(),t(191,`
            `),u(192,pn,8,9,"mat-error",13),t(193,`
          `),e(),t(194,`

          `),n(195,"mat-form-field",6),t(196,`
            `),n(197,"mat-label"),t(198),o(199,"translate"),e(),t(200,`
            `),f(201,"input",28),t(202,`
          `),e(),t(203,`

          `),n(204,"mat-form-field",6),t(205,`
            `),n(206,"mat-label"),t(207),o(208,"translate"),e(),t(209,`
            `),n(210,"mat-select",29),t(211,`
              `),u(212,cn,2,2,"mat-option",12),t(213,`
            `),e(),t(214,`
          `),e(),t(215,`

          `),n(216,"mat-form-field",23),T("click",function(){h(x);let b=E(227);return C(b.open())}),t(217,`
            `),n(218,"mat-label"),t(219),o(220,"translate"),e(),t(221,`
            `),f(222,"input",30),t(223,`
            `),f(224,"mat-datepicker-toggle",25),t(225,`
            `),f(226,"mat-datepicker",null,2),t(228,`
          `),e(),t(229,`
        `),e(),t(230,`
      `),e(),t(231,`

      `),n(232,"mat-card-actions",31),t(233,`
        `),n(234,"button",32),t(235),o(236,"translate"),e(),t(237,`
        `),u(238,dn,3,4,"button",33),t(239,`
      `),e(),t(240,`
    `),e(),t(241,`
  `),e(),t(242,`
`),e(),t(243,`
`)}if(d&2){let x=E(160),g=E(176),b=E(227);a(4),m("formGroup",l.editStandingInstructionsForm),a(9),p(s(14,46,"labels.inputs.name")),a(9),p(s(23,48,"labels.inputs.Applicant")),a(9),p(s(32,50,"labels.inputs.Type")),a(9),p(s(41,52,"labels.inputs.From Account Type")),a(9),p(s(50,54,"labels.inputs.Priority")),a(5),m("ngForOf",l.priorityTypeData),a(3),m("ngIf",l.editStandingInstructionsForm.controls.priority.hasError("required")),a(6),p(s(64,56,"labels.inputs.Status")),a(5),m("ngForOf",l.statusTypeData),a(3),m("ngIf",l.editStandingInstructionsForm.controls.status.hasError("required")),a(6),p(s(78,58,"labels.inputs.From Account")),a(9),p(s(87,60,"labels.inputs.Destination")),a(9),p(s(96,62,"labels.inputs.To Office")),a(9),p(s(105,64,"labels.inputs.Beneficiary")),a(9),p(s(114,66,"labels.inputs.To Account Type")),a(9),p(s(123,68,"labels.inputs.To Account")),a(9),p(s(132,70,"labels.inputs.Standing Instruction Type")),a(5),m("ngForOf",l.instructionTypeData),a(7),p(s(144,72,"labels.inputs.Amount")),a(9),p(s(153,74,"labels.inputs.Validity from")),a(3),m("min",l.minDate)("max",l.maxDate)("matDatepicker",x),a(2),m("for",x),a(5),m("ngIf",l.editStandingInstructionsForm.controls.validFrom.hasError("required")),a(6),p(s(169,76,"labels.inputs.Validity To")),a(3),m("min",l.minDate)("max",l.maxDate)("matDatepicker",g),a(2),m("for",g),a(5),m("ngIf",l.editStandingInstructionsForm.controls.validTill.hasError("required")),a(6),p(s(185,78,"labels.inputs.Recurrence Type")),a(5),m("ngForOf",l.recurrenceTypeData),a(3),m("ngIf",l.editStandingInstructionsForm.controls.recurrenceType.hasError("required")),a(6),p(s(199,80,"labels.inputs.Interval")),a(9),p(s(208,82,"labels.inputs.Recurrence Frequency")),a(5),m("ngForOf",l.recurrenceFrequencyTypeData),a(7),p(s(220,84,"labels.inputs.On Month Day")),a(3),m("min",l.minDate)("max",l.maxDate)("matDatepicker",b),a(2),m("for",b),a(10),m("routerLink",N(88,tn)),a(),v(`
          `,s(236,86,"labels.buttons.Cancel"),`
        `),a(3),m("mifosxHasPermission","UPDATE_STANDINGINSTRUCTION")}},dependencies:[M,Z,O,k,et,Q,W,tt,at,nt,it,G,P,$,rt,J,Y,ot,st,K,mt,lt,ct,dt,pt,j,U,B],encapsulation:2})}}return i})();var un=()=>["../"];function fn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.name")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.inputs.required")))}function xn(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.value,`
              `)}}function vn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Transfer Type")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.inputs.required")))}function In(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.value,`
              `)}}function _n(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Priority")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function Sn(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.value,`
              `)}}function gn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Status")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function Tn(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.value,`
              `)}}function hn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.From Account Type")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function Cn(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),I(`
                `,r.productName," - ",r.accountNo,`
              `)}}function yn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.From Account")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function bn(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.value,`
              `)}}function En(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Destination")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function Dn(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.name,`
              `)}}function An(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.To Office")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function Fn(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.displayName,`
              `)}}function Mn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Beneficiary")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function Bn(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.value,`
              `)}}function kn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.To Account Type")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function wn(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),I(`
                `,r.productName," - ",r.accountNo,`
              `)}}function Nn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.To Account")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function On(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.value,`
              `)}}function qn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Standing Instruction Type")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function Pn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Amount")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function Rn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Valid From Date")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function Vn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Valid Till Date")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function Ln(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.value,`
              `)}}function Hn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Recurrence Type")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function jn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Recurrence Interval")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function $n(i,c){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.value,`
              `)}}function Un(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Recurrence Frequency")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function Gn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.On Month Day")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function zn(i,c){if(i&1){let r=F();n(0,"button",35),T("click",function(){h(r);let l=y();return C(l.submit())}),t(1),o(2,"translate"),e()}if(i&2){let r=y();m("disabled",!r.createStandingInstructionsForm.valid),a(),v(`
          `,s(2,2,"labels.buttons.Submit"),`
        `)}}var ie=(()=>{class i{constructor(r,d,l,x,g,b){this.formBuilder=r,this.route=d,this.router=l,this.accountTransfersService=x,this.settingsService=g,this.dateUtils=b,this.minDate=new Date(2e3,0,1),this.maxDate=new Date(2100,0,1),this.allowclientedit=!0,this.route.data.subscribe(gt=>{this.standingIntructionsTemplate=gt.standingIntructionsTemplate,this.setParams(),this.setOptions()})}setParams(){switch(this.officeId=this.route.snapshot.queryParams.officeId,this.accountType=this.route.snapshot.queryParams.accountType,this.clientId=this.route.parent.snapshot.params.clientId,this.accountType){case"fromloans":this.accountTypeId="1";break;case"fromsavings":this.accountTypeId="2";break;default:this.accountTypeId="0"}}ngOnInit(){this.createCreateStandingInstructionsForm(),this.buildDependencies(),this.createStandingInstructionsForm.patchValue({applicant:this.standingIntructionsTemplate.fromClient.displayName})}createCreateStandingInstructionsForm(){this.createStandingInstructionsForm=this.formBuilder.group({name:["",_.required],applicant:[{value:"",disabled:!0}],transferType:["",_.required],priority:["",_.required],status:["",_.required],fromAccountType:["",_.required],fromAccountId:["",_.required],destination:["",_.required],toOfficeId:["",_.required],toClientId:["",_.required],toAccountType:["",_.required],toAccountId:["",_.required],instructionType:["",_.required],amount:["",_.required],validFrom:["",_.required],validTill:["",_.required],recurrenceType:["",_.required],recurrenceInterval:["",_.required],recurrenceFrequency:["",_.required],recurrenceOnMonthDay:["",_.required]})}setOptions(){this.transferTypeData=this.standingIntructionsTemplate.transferTypeOptions,this.priorityTypeData=this.standingIntructionsTemplate.priorityOptions,this.statusTypeData=this.standingIntructionsTemplate.statusOptions,this.fromAccountTypeData=this.standingIntructionsTemplate.fromAccountTypeOptions,this.fromAccountData=this.standingIntructionsTemplate.fromAccountOptions,this.destinationTypeData=[{id:1,value:"own account"},{id:2,value:"with in bank"}],this.toOfficeTypeData=this.standingIntructionsTemplate.toOfficeOptions,this.toClientTypeData=this.standingIntructionsTemplate.toClientOptions,this.toAccountTypeData=this.standingIntructionsTemplate.toAccountTypeOptions,this.toAccountData=this.standingIntructionsTemplate.toAccountOptions,this.instructionTypeData=this.standingIntructionsTemplate.instructionTypeOptions,this.recurrenceTypeData=this.standingIntructionsTemplate.recurrenceTypeOptions,this.recurrenceFrequencyTypeData=this.standingIntructionsTemplate.recurrenceFrequencyOptions}buildDependencies(){this.createStandingInstructionsForm.get("destination").valueChanges.subscribe(r=>{r===1?(this.allowclientedit=!1,this.createStandingInstructionsForm.patchValue({toOfficeId:this.officeId,toClientId:this.clientId}),this.ToOfficeId=!0,this.ToClientId=!0,this.changeEvent()):(this.allowclientedit=!0,this.createStandingInstructionsForm.patchValue({toOfficeId:"",toClientId:""}),this.createStandingInstructionsForm.controls.toOfficeId.enable(),this.createStandingInstructionsForm.controls.toClientId.enable())})}changeEvent(){let r=this.refineObject(this.createStandingInstructionsForm.value);this.accountTransfersService.getStandingInstructionsTemplate(this.clientId,this.officeId,this.accountTypeId,r).subscribe(d=>{this.standingIntructionsTemplate=d,this.setOptions()})}refineObject(r){let d=Object.getOwnPropertyNames(r);for(let l=0;l<d.length;l++){let x=d[l];(r[x]===null||r[x]===void 0||r[x]==="")&&delete r[x]}return r}submit(){let r=this.settingsService.dateFormat,d=this.settingsService.language.code,l=qt(Ot({},this.createStandingInstructionsForm.value),{dateFormat:r,locale:d,monthDayFormat:"dd MMMM",fromClientId:this.clientId,fromOfficeId:this.officeId,validFrom:this.dateUtils.formatDate(this.createStandingInstructionsForm.value.validFrom,r),validTill:this.dateUtils.formatDate(this.createStandingInstructionsForm.value.validTill,r),recurrenceOnMonthDay:this.dateUtils.formatDate(this.createStandingInstructionsForm.value.recurrenceOnMonthDay,"dd MMMM")});delete l.destination,delete l.applicant,this.accountTransfersService.createStandingInstructions(l).subscribe(x=>{this.router.navigate(["../../"],{relativeTo:this.route})})}static{this.\u0275fac=function(d){return new(d||i)(S(yt),S(q),S(Tt),S(D),S(z),S(ht))}}static{this.\u0275cmp=A({type:i,selectors:[["mifosx-create-standing-instructions"]],decls:296,vars:113,consts:[["validFromDatePicker",""],["validTillDatePicker",""],["recurrenceOnMonthDayDatePicker",""],[1,"container"],[3,"formGroup"],[1,"layout-row-wrap","gap-2px","responsive-column"],[1,"flex-48"],["matInput","","required","","formControlName","name"],[4,"ngIf"],["matInput","","formControlName","applicant"],["required","","formControlName","transferType",3,"selectionChange"],[3,"value",4,"ngFor","ngForOf"],["required","","formControlName","priority"],["required","","formControlName","status"],["required","","formControlName","fromAccountType",3,"selectionChange"],["required","","formControlName","fromAccountId",3,"selectionChange"],["required","","formControlName","destination"],["required","","formControlName","toOfficeId",3,"selectionChange","disabled"],["required","","formControlName","toClientId",3,"selectionChange","disabled"],["required","","formControlName","toAccountType",3,"selectionChange"],["required","","formControlName","toAccountId",3,"selectionChange"],["formControlName","instructionType"],["type","number","matInput","","required","","formControlName","amount"],[1,"flex-48",3,"click"],["matInput","","required","","formControlName","validFrom",3,"min","max","matDatepicker"],["matSuffix","",3,"for"],["matInput","","required","","formControlName","validTill",3,"min","max","matDatepicker"],["required","","formControlName","recurrenceType"],["type","number","matInput","","required","","formControlName","recurrenceInterval"],["required","","formControlName","recurrenceFrequency"],["required","","matInput","","formControlName","recurrenceOnMonthDay",3,"min","max","matDatepicker"],[1,"layout-row","align-center","gap-5px","responsive-column"],["type","button","mat-raised-button","",3,"routerLink"],["mat-raised-button","","color","primary",3,"disabled","click",4,"mifosxHasPermission"],[3,"value"],["mat-raised-button","","color","primary",3,"click","disabled"]],template:function(d,l){if(d&1){let x=F();n(0,"div",3),t(1,`
  `),n(2,"mat-card"),t(3,`
    `),n(4,"form",4),t(5,`
      `),n(6,"mat-card-content"),t(7,`
        `),n(8,"div",5),t(9,`
          `),n(10,"mat-form-field",6),t(11,`
            `),n(12,"mat-label"),t(13),o(14,"translate"),e(),t(15,`
            `),f(16,"input",7),t(17,`
            `),u(18,fn,8,9,"mat-error",8),t(19,`
          `),e(),t(20,`

          `),n(21,"mat-form-field",6),t(22,`
            `),n(23,"mat-label"),t(24),o(25,"translate"),e(),t(26,`
            `),f(27,"input",9),t(28,`
          `),e(),t(29,`

          `),n(30,"mat-form-field",6),t(31,`
            `),n(32,"mat-label"),t(33),o(34,"translate"),e(),t(35,`
            `),n(36,"mat-select",10),T("selectionChange",function(){return h(x),C(l.changeEvent())}),t(37,`
              `),u(38,xn,2,2,"mat-option",11),t(39,`
            `),e(),t(40,`
            `),u(41,vn,8,9,"mat-error",8),t(42,`
          `),e(),t(43,`

          `),n(44,"mat-form-field",6),t(45,`
            `),n(46,"mat-label"),t(47),o(48,"translate"),e(),t(49,`
            `),n(50,"mat-select",12),t(51,`
              `),u(52,In,2,2,"mat-option",11),t(53,`
            `),e(),t(54,`
            `),u(55,_n,8,9,"mat-error",8),t(56,`
          `),e(),t(57,`

          `),n(58,"mat-form-field",6),t(59,`
            `),n(60,"mat-label"),t(61),o(62,"translate"),e(),t(63,`
            `),n(64,"mat-select",13),t(65,`
              `),u(66,Sn,2,2,"mat-option",11),t(67,`
            `),e(),t(68,`
            `),u(69,gn,8,9,"mat-error",8),t(70,`
          `),e(),t(71,`

          `),n(72,"mat-form-field",6),t(73,`
            `),n(74,"mat-label"),t(75),o(76,"translate"),e(),t(77,`
            `),n(78,"mat-select",14),T("selectionChange",function(){return h(x),C(l.changeEvent())}),t(79,`
              `),u(80,Tn,2,2,"mat-option",11),t(81,`
            `),e(),t(82,`
            `),u(83,hn,8,9,"mat-error",8),t(84,`
          `),e(),t(85,`

          `),n(86,"mat-form-field",6),t(87,`
            `),n(88,"mat-label"),t(89),o(90,"translate"),e(),t(91,`
            `),n(92,"mat-select",15),T("selectionChange",function(){return h(x),C(l.changeEvent())}),t(93,`
              `),u(94,Cn,2,3,"mat-option",11),t(95,`
            `),e(),t(96,`
            `),u(97,yn,8,9,"mat-error",8),t(98,`
          `),e(),t(99,`

          `),n(100,"mat-form-field",6),t(101,`
            `),n(102,"mat-label"),t(103),o(104,"translate"),e(),t(105,`
            `),n(106,"mat-select",16),t(107,`
              `),u(108,bn,2,2,"mat-option",11),t(109,`
            `),e(),t(110,`
            `),u(111,En,8,9,"mat-error",8),t(112,`
          `),e(),t(113,`

          `),n(114,"mat-form-field",6),t(115,`
            `),n(116,"mat-label"),t(117),o(118,"translate"),e(),t(119,`
            `),n(120,"mat-select",17),T("selectionChange",function(){return h(x),C(l.changeEvent())}),t(121,`
              `),u(122,Dn,2,2,"mat-option",11),t(123,`
            `),e(),t(124,`
            `),u(125,An,8,9,"mat-error",8),t(126,`
          `),e(),t(127,`

          `),n(128,"mat-form-field",6),t(129,`
            `),n(130,"mat-label"),t(131),o(132,"translate"),e(),t(133,`
            `),n(134,"mat-select",18),T("selectionChange",function(){return h(x),C(l.changeEvent())}),t(135,`
              `),u(136,Fn,2,2,"mat-option",11),t(137,`
            `),e(),t(138,`
            `),u(139,Mn,8,9,"mat-error",8),t(140,`
          `),e(),t(141,`

          `),n(142,"mat-form-field",6),t(143,`
            `),n(144,"mat-label"),t(145),o(146,"translate"),e(),t(147,`
            `),n(148,"mat-select",19),T("selectionChange",function(){return h(x),C(l.changeEvent())}),t(149,`
              `),u(150,Bn,2,2,"mat-option",11),t(151,`
            `),e(),t(152,`
            `),u(153,kn,8,9,"mat-error",8),t(154,`
          `),e(),t(155,`

          `),n(156,"mat-form-field",6),t(157,`
            `),n(158,"mat-label"),t(159),o(160,"translate"),e(),t(161,`
            `),n(162,"mat-select",20),T("selectionChange",function(){return h(x),C(l.changeEvent())}),t(163,`
              `),u(164,wn,2,3,"mat-option",11),t(165,`
            `),e(),t(166,`
            `),u(167,Nn,8,9,"mat-error",8),t(168,`
          `),e(),t(169,`

          `),n(170,"mat-form-field",6),t(171,`
            `),n(172,"mat-label"),t(173),o(174,"translate"),e(),t(175,`
            `),n(176,"mat-select",21),t(177,`
              `),u(178,On,2,2,"mat-option",11),t(179,`
            `),e(),t(180,`
            `),u(181,qn,8,9,"mat-error",8),t(182,`
          `),e(),t(183,`

          `),n(184,"mat-form-field",6),t(185,`
            `),n(186,"mat-label"),t(187),o(188,"translate"),e(),t(189,`
            `),f(190,"input",22),t(191,`
            `),u(192,Pn,8,9,"mat-error",8),t(193,`
          `),e(),t(194,`

          `),n(195,"mat-form-field",23),T("click",function(){h(x);let b=E(206);return C(b.open())}),t(196,`
            `),n(197,"mat-label"),t(198),o(199,"translate"),e(),t(200,`
            `),f(201,"input",24),t(202,`
            `),f(203,"mat-datepicker-toggle",25),t(204,`
            `),f(205,"mat-datepicker",null,0),t(207,`
            `),u(208,Rn,8,9,"mat-error",8),t(209,`
          `),e(),t(210,`

          `),n(211,"mat-form-field",23),T("click",function(){h(x);let b=E(222);return C(b.open())}),t(212,`
            `),n(213,"mat-label"),t(214),o(215,"translate"),e(),t(216,`
            `),f(217,"input",26),t(218,`
            `),f(219,"mat-datepicker-toggle",25),t(220,`
            `),f(221,"mat-datepicker",null,1),t(223,`
            `),u(224,Vn,8,9,"mat-error",8),t(225,`
          `),e(),t(226,`

          `),n(227,"mat-form-field",6),t(228,`
            `),n(229,"mat-label"),t(230),o(231,"translate"),e(),t(232,`
            `),n(233,"mat-select",27),t(234,`
              `),u(235,Ln,2,2,"mat-option",11),t(236,`
            `),e(),t(237,`
            `),u(238,Hn,8,9,"mat-error",8),t(239,`
          `),e(),t(240,`

          `),n(241,"mat-form-field",6),t(242,`
            `),n(243,"mat-label"),t(244),o(245,"translate"),e(),t(246,`
            `),f(247,"input",28),t(248,`
            `),u(249,jn,8,9,"mat-error",8),t(250,`
          `),e(),t(251,`

          `),n(252,"mat-form-field",6),t(253,`
            `),n(254,"mat-label"),t(255),o(256,"translate"),e(),t(257,`
            `),n(258,"mat-select",29),t(259,`
              `),u(260,$n,2,2,"mat-option",11),t(261,`
            `),e(),t(262,`
            `),u(263,Un,8,9,"mat-error",8),t(264,`
          `),e(),t(265,`

          `),n(266,"mat-form-field",23),T("click",function(){h(x);let b=E(277);return C(b.open())}),t(267,`
            `),n(268,"mat-label"),t(269),o(270,"translate"),e(),t(271,`
            `),f(272,"input",30),t(273,`
            `),f(274,"mat-datepicker-toggle",25),t(275,`
            `),f(276,"mat-datepicker",null,2),t(278,`
            `),u(279,Gn,8,9,"mat-error",8),t(280,`
          `),e(),t(281,`
        `),e(),t(282,`
      `),e(),t(283,`

      `),n(284,"mat-card-actions",31),t(285,`
        `),n(286,"button",32),t(287),o(288,"translate"),e(),t(289,`
        `),u(290,zn,3,4,"button",33),t(291,`
      `),e(),t(292,`
    `),e(),t(293,`
  `),e(),t(294,`
`),e(),t(295,`
`)}if(d&2){let x=E(206),g=E(222),b=E(277);a(4),m("formGroup",l.createStandingInstructionsForm),a(9),p(s(14,70,"labels.inputs.name")),a(5),m("ngIf",l.createStandingInstructionsForm.controls.name.hasError("required")),a(6),p(s(25,72,"labels.inputs.Applicant")),a(9),p(s(34,74,"labels.inputs.Type")),a(5),m("ngForOf",l.transferTypeData),a(3),m("ngIf",l.createStandingInstructionsForm.controls.transferType.hasError("required")),a(6),p(s(48,76,"labels.inputs.Priority")),a(5),m("ngForOf",l.priorityTypeData),a(3),m("ngIf",l.createStandingInstructionsForm.controls.priority.hasError("required")),a(6),p(s(62,78,"labels.inputs.Status")),a(5),m("ngForOf",l.statusTypeData),a(3),m("ngIf",l.createStandingInstructionsForm.controls.status.hasError("required")),a(6),p(s(76,80,"labels.inputs.From Account Type")),a(5),m("ngForOf",l.fromAccountTypeData),a(3),m("ngIf",l.createStandingInstructionsForm.controls.fromAccountType.hasError("required")),a(6),p(s(90,82,"labels.inputs.From Account")),a(5),m("ngForOf",l.fromAccountData),a(3),m("ngIf",l.createStandingInstructionsForm.controls.fromAccountId.hasError("required")),a(6),p(s(104,84,"labels.inputs.Destination")),a(5),m("ngForOf",l.destinationTypeData),a(3),m("ngIf",l.createStandingInstructionsForm.controls.destination.hasError("required")),a(6),p(s(118,86,"labels.inputs.To Office")),a(3),m("disabled",l.ToOfficeId),a(2),m("ngForOf",l.toOfficeTypeData),a(3),m("ngIf",l.createStandingInstructionsForm.controls.toOfficeId.hasError("required")),a(6),p(s(132,88,"labels.inputs.Beneficiary")),a(3),m("disabled",l.ToClientId),a(2),m("ngForOf",l.toClientTypeData),a(3),m("ngIf",l.createStandingInstructionsForm.controls.toClientId.hasError("required")),a(6),p(s(146,90,"labels.inputs.To Account Type")),a(5),m("ngForOf",l.toAccountTypeData),a(3),m("ngIf",l.createStandingInstructionsForm.controls.toAccountType.hasError("required")),a(6),p(s(160,92,"labels.inputs.To Account")),a(5),m("ngForOf",l.toAccountData),a(3),m("ngIf",l.createStandingInstructionsForm.controls.toAccountId.hasError("required")),a(6),p(s(174,94,"labels.inputs.Standing Instruction Type")),a(5),m("ngForOf",l.instructionTypeData),a(3),m("ngIf",l.createStandingInstructionsForm.controls.instructionType.hasError("required")),a(6),p(s(188,96,"labels.inputs.Amount")),a(5),m("ngIf",l.createStandingInstructionsForm.controls.amount.hasError("required")),a(6),p(s(199,98,"labels.inputs.Validity from")),a(3),m("min",l.minDate)("max",l.maxDate)("matDatepicker",x),a(2),m("for",x),a(5),m("ngIf",l.createStandingInstructionsForm.controls.validFrom.hasError("required")),a(6),p(s(215,100,"labels.inputs.Validity To")),a(3),m("min",l.minDate)("max",l.maxDate)("matDatepicker",g),a(2),m("for",g),a(5),m("ngIf",l.createStandingInstructionsForm.controls.validTill.hasError("required")),a(6),p(s(231,102,"labels.inputs.Recurrence Type")),a(5),m("ngForOf",l.recurrenceTypeData),a(3),m("ngIf",l.createStandingInstructionsForm.controls.recurrenceType.hasError("required")),a(6),p(s(245,104,"labels.inputs.Interval")),a(5),m("ngIf",l.createStandingInstructionsForm.controls.recurrenceInterval.hasError("required")),a(6),p(s(256,106,"labels.inputs.Recurrence Frequency")),a(5),m("ngForOf",l.recurrenceFrequencyTypeData),a(3),m("ngIf",l.createStandingInstructionsForm.controls.recurrenceFrequency.hasError("required")),a(6),p(s(270,108,"labels.inputs.On Month Day")),a(3),m("min",l.minDate)("max",l.maxDate)("matDatepicker",b),a(2),m("for",b),a(5),m("ngIf",l.createStandingInstructionsForm.controls.recurrenceOnMonthDay.hasError("required")),a(7),m("routerLink",N(112,un)),a(),v(`
          `,s(288,110,"labels.buttons.Cancel"),`
        `),a(3),m("mifosxHasPermission","CREATE_STANDINGINSTRUCTION")}},dependencies:[M,Z,O,k,et,Q,Ct,W,tt,at,nt,it,G,P,$,rt,J,Y,ot,st,K,mt,lt,ct,dt,pt,j,U,B],encapsulation:2})}}return i})();var Qn=i=>({balance:i});function Wn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
      `),e()),i&2&&(a(),I(`
        `,s(2,3,"labels.inputs.Transaction Date")," ",s(3,5,"labels.commons.is"),`
        `),a(4),p(s(6,7,"labels.commons.required")))}function Yn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
      `),e()),i&2&&(a(),I(`
        `,s(2,3,"labels.inputs.Amount")," ",s(3,5,"labels.commons.is"),`
        `),a(4),p(s(6,7,"labels.commons.required")))}function Jn(i,c){if(i&1&&(n(0,"mat-error"),t(1,`
        `),f(2,"fa-icon",16),t(3),o(4,"translate"),e()),i&2){let r=y();a(3),v(`
        `,Lt(4,1,"errors.validation.msg.savingsproduct.insufficient.balance",vt(4,Qn,r.balance)),`
      `)}}function Kn(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
      `),e()),i&2&&(a(),I(`
        `,s(2,3,"labels.inputs.Transfer Description")," ",s(3,5,"labels.commons.is"),`
        `),a(4),p(s(6,7,"labels.commons.required")))}var ae=(()=>{class i{constructor(){this.minDate=new Date(2e3,0,1),this.maxDate=new Date(2100,0,1)}static{this.\u0275fac=function(d){return new(d||i)}}static{this.\u0275cmp=A({type:i,selectors:[["mifosx-make-account-interbank-transfers"]],inputs:{makeAccountTransferForm:"makeAccountTransferForm",balance:"balance"},decls:83,vars:30,consts:[["transferDatePicker",""],["amntInput",""],[3,"formGroup"],[1,"layout-row-wrap","gap-2px","responsive-column"],[1,"flex-98",3,"click"],["matInput","","required","","formControlName","transferDate",3,"min","max","matDatepicker"],["matSuffix","",3,"for"],[4,"ngIf"],[1,"flex-98"],["matInput","","formControlName","toBank"],["matInput","","formControlName","toClientId"],["matInput","","formControlName","toAccountType"],["matInput","","formControlName","toAccountId"],[1,"flex-98","error-warn"],["type","number","matInput","","required","","formControlName","transferAmount"],["matInput","","formControlName","transferDescription","cdkTextareaAutosize","","cdkAutosizeMinRows","2"],["icon","exclamation-triangle","size","md"]],template:function(d,l){if(d&1){let x=F();n(0,"form",2),t(1,`
  `),n(2,"div",3),t(3,`
    `),n(4,"mat-form-field",4),T("click",function(){h(x);let b=E(15);return C(b.open())}),t(5,`
      `),n(6,"mat-label"),t(7),o(8,"translate"),e(),t(9,`
      `),f(10,"input",5),t(11,`
      `),f(12,"mat-datepicker-toggle",6),t(13,`
      `),f(14,"mat-datepicker",null,0),t(16,`
      `),u(17,Wn,8,9,"mat-error",7),t(18,`
    `),e(),t(19,`

    `),n(20,"mat-form-field",8),t(21,`
      `),n(22,"mat-label"),t(23),o(24,"translate"),e(),t(25,`
      `),f(26,"input",9),t(27,`
    `),e(),t(28,`

    `),n(29,"mat-form-field",8),t(30,`
      `),n(31,"mat-label"),t(32),o(33,"translate"),e(),t(34,`
      `),f(35,"input",10),t(36,`
    `),e(),t(37,`

    `),n(38,"mat-form-field",8),t(39,`
      `),n(40,"mat-label"),t(41),o(42,"translate"),e(),t(43,`
      `),f(44,"input",11),t(45,`
    `),e(),t(46,`

    `),n(47,"mat-form-field",8),t(48,`
      `),n(49,"mat-label"),t(50),o(51,"translate"),e(),t(52,`
      `),f(53,"input",12),t(54,`
    `),e(),t(55,`

    `),n(56,"mat-form-field",13),t(57,`
      `),n(58,"mat-label"),t(59),o(60,"translate"),e(),t(61,`
      `),f(62,"input",14,1),t(64,`
      `),u(65,Yn,8,9,"mat-error",7),t(66,`
      `),u(67,Jn,5,6,"mat-error",7),t(68,`
    `),e(),t(69,`

    `),n(70,"mat-form-field",8),t(71,`
      `),n(72,"mat-label"),t(73),o(74,"translate"),e(),t(75,`
      `),f(76,"textarea",15),t(77,`
      `),u(78,Kn,8,9,"mat-error",7),t(79,`
    `),e(),t(80,`
  `),e(),t(81,`
`),e(),t(82,`
`)}if(d&2){let x,g=E(15);m("formGroup",l.makeAccountTransferForm),a(7),p(s(8,16,"labels.inputs.Transaction Date")),a(3),m("min",l.minDate)("max",l.maxDate)("matDatepicker",g),a(2),m("for",g),a(5),m("ngIf",l.makeAccountTransferForm.controls.transferDate.hasError("required")),a(6),p(s(24,18,"labels.inputs.Bank")),a(9),p(s(33,20,"labels.inputs.Client")),a(9),p(s(42,22,"labels.inputs.Account Type")),a(9),p(s(51,24,"labels.inputs.Account")),a(9),p(s(60,26,"labels.inputs.Amount")),a(6),m("ngIf",l.makeAccountTransferForm.controls.transferAmount.hasError("required")),a(2),m("ngIf",(x=l.makeAccountTransferForm.get("transferAmount"))==null?null:x.hasError("amountExceedsBalance")),a(6),p(s(74,28,"labels.inputs.Description")),a(5),m("ngIf",l.makeAccountTransferForm.controls.transferDescription.hasError("required"))}},dependencies:[M,O,k,et,Q,Ct,W,tt,at,nt,it,J,Y,ot,st,K,ct,dt,pt,B,ft,Ht],styles:["h2[_ngcontent-%COMP%], h3[_ngcontent-%COMP%], h4[_ngcontent-%COMP%]{margin:0;font-weight:500}span[_ngcontent-%COMP%]{margin:.5em 0}.margin-t[_ngcontent-%COMP%]{margin-top:1em}mat-divider[_ngcontent-%COMP%]{margin:0 0 .5em}.container[_ngcontent-%COMP%]{max-width:37rem}"]})}}return i})();var ze=()=>["../.."],Xn=i=>({balance:i});function Zn(i,c){i&1&&(n(0,"div",6),t(1,`
    `),f(2,"div",7),t(3,`
    `),f(4,"div",8),t(5,`
    `),f(6,"div",9),t(7,`
    `),f(8,"div",10),t(9,`
  `),e())}function ti(i,c){if(i&1){let r=F();n(0,"button",26),T("click",function(){h(r);let l=y(4);return C(l.searchAccountByNumber())}),t(1),o(2,"translate"),e()}if(i&2){let r=y(4);m("disabled",r.phoneAccount.length!==10),a(),v(`
            `,s(2,2,"labels.buttons.Search"),`
          `)}}function ei(i,c){i&1&&(n(0,"mat-card-actions",23),t(1,`
          `),n(2,"button",24),t(3),o(4,"translate"),e(),t(5,`
          `),u(6,ti,3,4,"button",25),t(7,`
        `),e()),i&2&&(a(2),m("routerLink",N(5,ze)),a(),v(`
            `,s(4,3,"labels.buttons.Cancel"),`
          `),a(3),m("mifosxHasPermission","CREATE_ACCOUNTTRANSFER"))}function ni(i,c){if(i&1){let r=F();n(0,"div"),t(1,`
        `),n(2,"div",14),t(3,`
          `),n(4,"h3",20),t(5),o(6,"translate"),e(),t(7,`
          `),n(8,"mat-form-field",15),t(9,`
            `),n(10,"mat-label"),t(11),o(12,"translate"),e(),t(13,`
            `),n(14,"input",21,0),ye("ngModelChange",function(l){h(r);let x=y(2);return Ce(x.phoneAccount,l)||(x.phoneAccount=l),C(l)}),e(),t(16,`
            `),n(17,"mat-hint",22),t(18),e(),t(19,`
          `),e(),t(20,`
        `),e(),t(21,`

        `),u(22,ei,8,6,"mat-card-actions",19),t(23,`
      `),e()}if(i&2){let r=y(2);a(5),v(`
            `,s(6,6,"labels.heading.Transferred To"),`
          `),a(6),p(s(12,8,"labels.inputs.Phone Number")),a(3),m("disabled",r.interbankTransferForm),he("ngModel",r.phoneAccount),a(4),v("",r.phoneAccount.length||0,"/10"),a(4),m("ngIf",!r.interbankTransferForm)}}function ii(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Transaction Date")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function ai(i,c){if(i&1&&(n(0,"mat-option",41),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.name,`
              `)}}function ri(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Office")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function oi(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Client")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function si(i,c){if(i&1&&(n(0,"mat-option",41),t(1),e()),i&2){let r=c.$implicit;m("value",r),a(),I(`
              `,r.id," - ",r.displayName,`
            `)}}function li(i,c){if(i&1&&(n(0,"mat-option",41),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
                `,r.value,`
              `)}}function mi(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Account Type")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function pi(i,c){if(i&1&&(n(0,"mat-option",41),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),I(`
                `,r.productName," - ",r.accountNo,`
              `)}}function ci(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Account")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function di(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Amount")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function ui(i,c){if(i&1&&(n(0,"mat-error"),t(1,`
              `),f(2,"fa-icon",42),t(3),o(4,"translate"),e()),i&2){let r=y(3);a(3),v(`
              `,Lt(4,1,"errors.validation.msg.savingsproduct.insufficient.balance",vt(4,Xn,r.balance)),`
            `)}}function fi(i,c){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),I(`
              `,s(2,3,"labels.inputs.Transfer Description")," ",s(3,5,"labels.commons.is"),`
              `),a(4),p(s(6,7,"labels.commons.required")))}function xi(i,c){if(i&1){let r=F();n(0,"form",27),t(1,`
        `),n(2,"div",28),t(3,`
          `),n(4,"mat-form-field",29),T("click",function(){h(r);let l=E(15);return C(l.open())}),t(5,`
            `),n(6,"mat-label"),t(7),o(8,"translate"),e(),t(9,`
            `),f(10,"input",30),t(11,`
            `),f(12,"mat-datepicker-toggle",31),t(13,`
            `),f(14,"mat-datepicker",null,1),t(16,`
            `),u(17,ii,8,9,"mat-error",5),t(18,`
          `),e(),t(19,`

          `),n(20,"mat-form-field",32),t(21,`
            `),n(22,"mat-label"),t(23),o(24,"translate"),e(),t(25,`
            `),n(26,"mat-select",33),T("selectionChange",function(){h(r);let l=y(2);return C(l.changeEvent())}),t(27,`
              `),u(28,ai,2,2,"mat-option",34),t(29,`
            `),e(),t(30,`
            `),u(31,ri,8,9,"mat-error",5),t(32,`
          `),e(),t(33,`

          `),n(34,"mat-form-field",32),t(35,`
            `),n(36,"mat-label"),t(37),o(38,"translate"),e(),t(39,`
            `),f(40,"input",35),t(41,`
            `),u(42,oi,8,9,"mat-error",5),t(43,`
          `),e(),t(44,`

          `),n(45,"mat-autocomplete",36,2),t(47,`
            `),u(48,si,2,3,"mat-option",34),t(49,`
          `),e(),t(50,`

          `),n(51,"mat-form-field",32),t(52,`
            `),n(53,"mat-label"),t(54),o(55,"translate"),e(),t(56,`
            `),n(57,"mat-select",37),T("selectionChange",function(){h(r);let l=y(2);return C(l.changeEvent())}),t(58,`
              `),u(59,li,2,2,"mat-option",34),t(60,`
            `),e(),t(61,`
            `),u(62,mi,8,9,"mat-error",5),t(63,`
          `),e(),t(64,`

          `),n(65,"mat-form-field",32),t(66,`
            `),n(67,"mat-label"),t(68),o(69,"translate"),e(),t(70,`
            `),n(71,"mat-select",38),T("selectionChange",function(){h(r);let l=y(2);return C(l.changeEvent())}),t(72,`
              `),u(73,pi,2,3,"mat-option",34),t(74,`
            `),e(),t(75,`
            `),u(76,ci,8,9,"mat-error",5),t(77,`
          `),e(),t(78,`

          `),n(79,"mat-form-field",32),t(80,`
            `),n(81,"mat-label"),t(82),o(83,"translate"),e(),t(84,`
            `),f(85,"input",39),t(86,`
            `),u(87,di,8,9,"mat-error",5),t(88,`
            `),u(89,ui,5,6,"mat-error",5),t(90,`
          `),e(),t(91,`

          `),n(92,"mat-form-field",32),t(93,`
            `),n(94,"mat-label"),t(95),o(96,"translate"),e(),t(97,`
            `),f(98,"textarea",40),t(99,`
            `),u(100,fi,8,9,"mat-error",5),t(101,`
          `),e(),t(102,`
        `),e(),t(103,`
      `),e()}if(i&2){let r,d=E(15),l=E(46),x=y(2);m("formGroup",x.makeAccountTransferForm),a(7),p(s(8,26,"labels.inputs.Transaction Date")),a(3),m("min",x.minDate)("max",x.maxDate)("matDatepicker",d),a(2),m("for",d),a(5),m("ngIf",x.makeAccountTransferForm.controls.transferDate.hasError("required")),a(6),p(s(24,28,"labels.inputs.Office")),a(5),m("ngForOf",x.toOfficeTypeData),a(3),m("ngIf",x.makeAccountTransferForm.controls.toOfficeId.hasError("required")),a(6),p(s(38,30,"labels.inputs.Client")),a(3),m("matAutocomplete",l),a(2),m("ngIf",x.makeAccountTransferForm.controls.toClientId.hasError("required")),a(3),m("displayWith",x.displayClient),a(3),m("ngForOf",x.clientsData),a(6),p(s(55,32,"labels.inputs.Account Type")),a(5),m("ngForOf",x.toAccountTypeData),a(3),m("ngIf",x.makeAccountTransferForm.controls.toAccountType.hasError("required")),a(6),p(s(69,34,"labels.inputs.Account")),a(5),m("ngForOf",x.toAccountData),a(3),m("ngIf",x.makeAccountTransferForm.controls.toAccountId.hasError("required")),a(6),p(s(83,36,"labels.inputs.Amount")),a(5),m("ngIf",x.makeAccountTransferForm.controls.transferAmount.hasError("required")),a(2),m("ngIf",(r=x.makeAccountTransferForm.get("transferAmount"))==null?null:r.hasError("amountExceedsBalance")),a(6),p(s(96,38,"labels.inputs.Description")),a(5),m("ngIf",x.makeAccountTransferForm.controls.transferDescription.hasError("required"))}}function vi(i,c){if(i&1&&f(0,"mifosx-make-account-interbank-transfers",43),i&2){let r=y(2);m("makeAccountTransferForm",r.makeAccountTransferForm)("balance",r.balance)}}function Ii(i,c){if(i&1){let r=F();n(0,"button",45),T("click",function(){h(r);let l=y(3);return C(l.submit())}),t(1),o(2,"translate"),e()}if(i&2){let r=y(3);m("disabled",!r.makeAccountTransferForm.valid),a(),v(`
        `,s(2,2,"labels.buttons.Submit"),`
      `)}}function _i(i,c){i&1&&(n(0,"mat-card-actions",23),t(1,`
      `),n(2,"button",24),t(3),o(4,"translate"),e(),t(5,`
      `),u(6,Ii,3,4,"button",44),t(7,`
    `),e()),i&2&&(a(2),m("routerLink",N(5,ze)),a(),v(`
        `,s(4,3,"labels.buttons.Cancel"),`
      `),a(3),m("mifosxHasPermission","CREATE_ACCOUNTTRANSFER"))}function Si(i,c){if(i&1&&(n(0,"mat-card"),t(1,`
    `),n(2,"mat-card-content"),t(3,`
      `),n(4,"div",11),t(5,`
        `),n(6,"h3",12),t(7),o(8,"translate"),e(),t(9,`

        `),f(10,"mat-divider",13),t(11,`

        `),n(12,"div",14),t(13,`
          `),n(14,"span",15),t(15),o(16,"translate"),e(),t(17,`
          `),n(18,"span",16),t(19),e(),t(20,`
        `),e(),t(21,`

        `),n(22,"div",14),t(23,`
          `),n(24,"span",15),t(25),o(26,"translate"),e(),t(27,`
          `),n(28,"span",16),t(29),e(),t(30,`
        `),e(),t(31,`

        `),n(32,"div",14),t(33,`
          `),n(34,"span",15),t(35),o(36,"translate"),e(),t(37,`
          `),n(38,"span",16),t(39),e(),t(40,`
        `),e(),t(41,`

        `),n(42,"div",14),t(43,`
          `),n(44,"span",15),t(45),o(46,"translate"),e(),t(47,`
          `),n(48,"span",16),t(49),e(),t(50,`
        `),e(),t(51,`

        `),n(52,"div",14),t(53,`
          `),n(54,"span",15),t(55),o(56,"translate"),e(),t(57,`
          `),n(58,"span",16),t(59),e(),t(60,`
        `),e(),t(61,`
      `),e(),t(62,`

      `),u(63,ni,24,10,"div",5),t(64,`

      `),f(65,"mat-divider",13),t(66,`

      `),u(67,xi,104,40,"form",17),t(68,`
      `),u(69,vi,1,2,"mifosx-make-account-interbank-transfers",18),t(70,`
    `),e(),t(71,`

    `),u(72,_i,8,6,"mat-card-actions",19),t(73,`
  `),e()),i&2){let r=y();a(7),p(s(8,18,"labels.heading.Transferring From Details")),a(3),m("inset",!0),a(5),p(s(16,20,"labels.inputs.Applicant")),a(4),p(r.accountTransferTemplateData.fromClient.displayName),a(6),p(s(26,22,"labels.inputs.Office")),a(4),p(r.accountTransferTemplateData.fromOffice.name),a(6),p(s(36,24,"labels.inputs.From Account")),a(4),I("",r.accountTransferTemplateData.fromAccount.productName,"\xA0-\xA0#",r.accountTransferTemplateData.fromAccount.accountNo,""),a(6),p(s(46,26,"labels.inputs.From Account Type")),a(4),p(r.accountTransferTemplateData.fromAccountType.value),a(6),p(s(56,28,"labels.inputs.Currency")),a(4),p(r.accountTransferTemplateData.currency.name),a(4),m("ngIf",r.interbank),a(2),m("inset",!0),a(2),m("ngIf",!r.interbank),a(2),m("ngIf",r.interbank&&r.interbankTransferForm),a(3),m("ngIf",!r.interbankTransferForm)}}var re=(()=>{class i{constructor(r,d,l,x,g,b,gt){this.formBuilder=r,this.route=d,this.router=l,this.accountTransfersService=x,this.dateUtils=g,this.settingsService=b,this.clientsService=gt,this.minDate=new Date(2e3,0,1),this.maxDate=new Date(2100,0,1),this.interbank=!1,this.phoneAccount="",this.interbankTransferForm=!1,this.balance=0,this.isLoading=!1,this.route.data.subscribe(We=>{this.accountTransferTemplateData=We.accountTransferTemplate,this.setParams(),this.setOptions()})}setParams(){switch(this.accountType=this.route.snapshot.queryParams.accountType,this.accountType){case"fromloans":this.accountTypeId="1",this.id=this.route.snapshot.queryParams.loanId;break;case"fromsavings":case"interbank":this.accountTypeId="2",this.id=this.route.snapshot.queryParams.savingsId,this.interbank=this.route.snapshot.queryParams.interbank==="true",this.balance=this.router.getCurrentNavigation().extras.state.balance;break;default:this.accountTypeId="0"}}ngOnInit(){this.maxDate=this.settingsService.businessDate,this.interbank||this.createMakeAccountTransferForm()}createMakeAccountTransferForm(){this.makeAccountTransferForm=this.formBuilder.group({toOfficeId:["",_.required],toClientId:["",_.required],toAccountType:["",_.required],toAccountId:["",_.required],transferAmount:[this.accountTransferTemplateData.transferAmount,[_.required,_.min(.01),this.amountExceedsBalanceValidator.bind(this)]],transferDate:[this.settingsService.businessDate,_.required],transferDescription:["",_.required]})}createMakeAccountInterbankTransferForm(r){this.makeAccountTransferForm=this.formBuilder.group({toBank:[{value:r.sourceFspId,disabled:!0},_.required],toClientId:[{value:r.firsName+" "+r.lastName,disabled:!0},_.required],toAccountType:[{value:"Saving Account",disabled:!0},_.required],toAccountId:[{value:r.partyId,disabled:!0},_.required],transferAmount:[this.accountTransferTemplateData.transferAmount,[_.required,_.min(.01),this.amountExceedsBalanceValidator.bind(this)]],transferDate:[this.settingsService.businessDate,_.required],transferDescription:["",_.required]}),this.isLoading=!1}amountExceedsBalanceValidator(r){return r.value>this.balance?{amountExceedsBalance:!0}:null}setOptions(){this.toOfficeTypeData=this.accountTransferTemplateData.toOfficeOptions,this.toAccountTypeData=this.accountTransferTemplateData.toAccountTypeOptions,this.toAccountData=this.accountTransferTemplateData.toAccountOptions}changeEvent(){let r=this.refineObject(this.makeAccountTransferForm.value);this.accountTransfersService.newAccountTranferResource(this.id,this.accountTypeId,r).subscribe(d=>{this.accountTransferTemplateData=d,this.toClientTypeData=d.toClientOptions,this.setOptions()})}refineObject(r){delete r.transferAmount,delete r.transferDate,delete r.transferDescription,r.toClientId&&(r.toClientId=r.toClientId.id);let d=Object.getOwnPropertyNames(r);for(let l=0;l<d.length;l++){let x=d[l];(r[x]===null||r[x]===void 0||r[x]==="")&&delete r[x]}return r}ngAfterViewInit(){this.interbank||this.makeAccountTransferForm.controls.toClientId.valueChanges.subscribe(r=>{r.length>=2&&(this.clientsService.getFilteredClients("displayName","ASC",!0,r).subscribe(d=>{this.clientsData=d.pageItems}),this.changeEvent())})}displayClient(r){return r?r.displayName:void 0}submit(){this.interbank?this.makeInterbankTransfer():this.makeTransfer()}makeTransfer(){this.isLoading=!0;let r=this.settingsService.dateFormat,d=this.settingsService.language.code,l=qt(Ot({},this.makeAccountTransferForm.value),{transferDate:this.dateUtils.formatDate(this.makeAccountTransferForm.value.transferDate,r),dateFormat:r,locale:d,toClientId:this.makeAccountTransferForm.controls.toClientId.value.id,fromAccountId:this.id,fromAccountType:this.accountTypeId,fromClientId:this.accountTransferTemplateData.fromClient.id,fromOfficeId:this.accountTransferTemplateData.fromClient.officeId});this.accountTransfersService.createAccountTransfer(l).subscribe(()=>{this.isLoading=!1,this.router.navigate(["../../transactions"],{relativeTo:this.route})})}makeInterbankTransfer(){this.isLoading=!0;let r={homeTransactionId:crypto.randomUUID(),from:{fspId:Fe.fineractPlatformTenantId,idType:"MSISDN",idValue:this.accountTransferTemplateData.fromAccount.externalId.trim()},to:{fspId:this.makeAccountTransferForm.controls.toBank.value,idType:"MSISDN",idValue:this.makeAccountTransferForm.controls.toAccountId.value},amountType:"SEND",amount:{currencyCode:this.accountTransferTemplateData.currency.code,amount:this.makeAccountTransferForm.controls.transferAmount.value},transactionType:{scenario:"TRANSFER",subScenario:"DOMESTIC",initiator:"PAYER",initiatorType:"CUSTOMER"},note:this.makeAccountTransferForm.controls.transferDescription.value};this.accountTransfersService.sendInterbankTransfer(JSON.stringify(r)).subscribe(d=>{d.systemMessage&&(this.isLoading=!1,this.router.navigate(["../../transactions"],{relativeTo:this.route}))},d=>{this.isLoading=!1})}searchAccountByNumber(){this.isLoading=!0,this.accountTransfersService.getAccountByNumber(this.phoneAccount,this.accountTransferTemplateData.currency.code).subscribe(r=>{this.interbankTransferForm=!0,this.createMakeAccountInterbankTransferForm(r)},r=>{this.isLoading=!1})}static{this.\u0275fac=function(d){return new(d||i)(S(yt),S(q),S(Tt),S(D),S(ht),S(z),S(je))}}static{this.\u0275cmp=A({type:i,selectors:[["mifosx-make-account-transfers"]],decls:7,vars:2,consts:[["input",""],["transferDatePicker",""],["clientsAutocomplete","matAutocomplete"],[1,"container"],["class","loader-wrapper",4,"ngIf"],[4,"ngIf"],[1,"loader-wrapper"],[1,"bottom","triangle"],[1,"top","triangle"],[1,"left","triangle"],[1,"right","triangle"],[1,"layout-row-wrap","responsive-column"],[1,"mat-h3","flex-fill"],[3,"inset"],[1,"flex-fill"],[1,"flex-40"],[1,"flex-60"],[3,"formGroup",4,"ngIf"],[3,"makeAccountTransferForm","balance",4,"ngIf"],["class","layout-row align-center gap-5px responsive-column",4,"ngIf"],[1,"mat-h3","flex-40","align-start-center"],["matInput","","type","tel","maxlength","10","required","",3,"ngModelChange","disabled","ngModel"],["align","end"],[1,"layout-row","align-center","gap-5px","responsive-column"],["type","button","mat-raised-button","",3,"routerLink"],["mat-raised-button","","color","primary","id","search-button",3,"disabled","click",4,"mifosxHasPermission"],["mat-raised-button","","color","primary","id","search-button",3,"click","disabled"],[3,"formGroup"],[1,"layout-row-wrap","gap-2px","responsive-column"],[1,"flex-98",3,"click"],["matInput","","required","","formControlName","transferDate",3,"min","max","matDatepicker"],["matSuffix","",3,"for"],[1,"flex-98"],["required","","formControlName","toOfficeId",3,"selectionChange"],[3,"value",4,"ngFor","ngForOf"],["matInput","","formControlName","toClientId",3,"matAutocomplete"],["autoActiveFirstOption","",3,"displayWith"],["required","","formControlName","toAccountType",3,"selectionChange"],["required","","formControlName","toAccountId",3,"selectionChange"],["type","number","matInput","","required","","formControlName","transferAmount"],["matInput","","formControlName","transferDescription","cdkTextareaAutosize","","cdkAutosizeMinRows","2"],[3,"value"],["icon","exclamation-triangle","size","md"],[3,"makeAccountTransferForm","balance"],["mat-raised-button","","color","primary",3,"disabled","click",4,"mifosxHasPermission"],["mat-raised-button","","color","primary",3,"click","disabled"]],template:function(d,l){d&1&&(n(0,"div",3),t(1,`
  `),u(2,Zn,10,0,"div",4),t(3,`
  `),u(4,Si,74,30,"mat-card",5),t(5,`
`),e(),t(6,`
`)),d&2&&(a(2),m("ngIf",l.isLoading),a(2),m("ngIf",!l.isLoading))},dependencies:[M,Z,O,k,et,Q,Ct,W,tt,at,ke,nt,it,G,P,$,rt,J,Y,ot,st,K,mt,lt,ct,dt,pt,j,U,B,xt,we,Me,Ne,Re,Pe,ft,Ht,ae],styles:["h2[_ngcontent-%COMP%], h3[_ngcontent-%COMP%], h4[_ngcontent-%COMP%]{margin:0;font-weight:500}span[_ngcontent-%COMP%]{margin:.5em 0}.margin-t[_ngcontent-%COMP%]{margin-top:1em}mat-divider[_ngcontent-%COMP%]{margin:0 0 .5em}.container[_ngcontent-%COMP%]{max-width:37rem}  mat-form-field.error-warn.mat-form-field-invalid .mat-form-field-ripple{background-color:#000000de!important}  mat-form-field.error-warn.mat-form-field-invalid .mat-form-field-label{color:#0009!important}  mat-form-field.error-warn.mat-form-field-invalid .mat-form-field-label .mat-form-field-required-marker{color:#0009!important}  mat-form-field.error-warn.mat-form-field-invalid .mat-error{color:#0009!important}"]})}}return i})();var gi=["instructionsTable"],Ti=()=>[10,25,50,100],hi=i=>["../",i,"edit"],Ci=i=>["../",i,"view"];function yi(i,c){if(i&1&&(n(0,"div",24),t(1,`
      `),n(2,"span",25),t(3,`
        `),n(4,"h3",26),t(5),o(6,"translate"),e(),t(7,`
      `),e(),t(8,`
      `),n(9,"span",27),t(10,`
        `),n(11,"h3",26),t(12),e(),t(13,`
      `),e(),t(14,`
    `),e()),i&2){let r=y();a(5),p(s(6,2,"labels.heading.Client Type")),a(7),p(r.clientName)}}function bi(i,c){if(i&1&&(n(0,"div",24),t(1,`
      `),n(2,"mat-form-field",28),t(3,`
        `),f(4,"input",29),t(5,`
      `),e(),t(6,`
      `),n(7,"mat-form-field",28),t(8,`
        `),f(9,"input",30),t(10,`
      `),e(),t(11,`
    `),e()),i&2){let r=y();a(4),m("formControl",r.clientNameControl),a(5),m("formControl",r.fromClientId)}}function Ei(i,c){if(i&1&&(n(0,"mat-option",31),t(1),e()),i&2){let r=c.$implicit;m("value",r.id),a(),v(`
          `,r.value,`
        `)}}function Di(i,c){if(i&1){let r=F();n(0,"button",32),T("click",function(){h(r);let l=y();return C(l.filterStandingInstructions())}),t(1),o(2,"translate"),o(3,"titlecase"),e()}i&2&&(a(),v(`
      `,s(3,3,s(2,1,"labels.buttons.Filter")),`
    `))}function Ai(i,c){i&1&&(n(0,"th",33),t(1),o(2,"translate"),e()),i&2&&(a(),p(s(2,1,"labels.inputs.Client")))}function Fi(i,c){if(i&1&&(n(0,"td",34),t(1),e()),i&2){let r=c.$implicit;a(),I(`
        `,r.fromClient.displayName,"-",r.fromClient.id,`
      `)}}function Mi(i,c){i&1&&(n(0,"th",33),t(1),o(2,"translate"),e()),i&2&&(a(),p(s(2,1,"labels.inputs.From Account")))}function Bi(i,c){if(i&1&&(n(0,"td",34),t(1),e()),i&2){let r=c.$implicit;a(),I(`
        `,r.fromAccount.accountNo," (",r.fromAccountType.value,`)
      `)}}function ki(i,c){i&1&&(n(0,"th",33),t(1),o(2,"translate"),e()),i&2&&(a(),p(s(2,1,"labels.inputs.Beneficiary")))}function wi(i,c){if(i&1&&(n(0,"td",34),t(1),e()),i&2){let r=c.$implicit;a(),p(r.toClient.displayName)}}function Ni(i,c){i&1&&(n(0,"th",33),t(1),o(2,"translate"),e()),i&2&&(a(),p(s(2,1,"labels.inputs.To Account")))}function Oi(i,c){if(i&1&&(n(0,"td",34),t(1),e()),i&2){let r=c.$implicit;a(),I(`
        `,r.toAccount.accountNo," (",r.toAccountType.value,`)
      `)}}function qi(i,c){i&1&&(n(0,"th",33),t(1),o(2,"translate"),e()),i&2&&(a(),p(s(2,1,"labels.inputs.Amount")))}function Pi(i,c){if(i&1&&(n(0,"td",34),t(1),e()),i&2){let r=c.$implicit;a(),I("",r.instructionType.value,"/",r.amount,"")}}function Ri(i,c){i&1&&(n(0,"th",33),t(1),o(2,"translate"),e()),i&2&&(a(),p(s(2,1,"labels.inputs.Validity")))}function Vi(i,c){if(i&1&&(n(0,"td",34),t(1),o(2,"dateFormat"),o(3,"dateFormat"),e()),i&2){let r=c.$implicit;a(),I(`
        `,s(2,2,r.validFrom)," to ",s(3,4,r.validTill),`
      `)}}function Li(i,c){i&1&&(n(0,"th",33),t(1),o(2,"translate"),e()),i&2&&(a(),p(s(2,1,"labels.inputs.Actions")))}function Hi(i,c){if(i&1&&(n(0,"button",37),o(1,"translate"),t(2,`
            `),f(3,"i",38),t(4,`
          `),e()),i&2){let r=y(2).$implicit;Vt("matTooltip",s(1,2,"tooltips.Edit Standing Instruction")),m("routerLink",vt(4,hi,r.id))}}function ji(i,c){i&1&&(n(0,"span"),t(1,`
          `),u(2,Hi,5,6,"button",36),t(3,`
        `),e()),i&2&&(a(2),m("mifosxHasPermission","UPDATE_STANDINGINSTRUCTION"))}function $i(i,c){if(i&1){let r=F();n(0,"button",40),o(1,"translate"),T("click",function(){h(r);let l=y(2).$implicit,x=y();return C(x.deleteStandingInstruction(l.id))}),t(2,`
            `),f(3,"i",41),t(4,`
          `),e()}i&2&&Vt("matTooltip",s(1,1,"tooltips.Delete Standing Instruction"))}function Ui(i,c){i&1&&(n(0,"span"),t(1,`
          `),u(2,$i,5,3,"button",39),t(3,`
        `),e()),i&2&&(a(2),m("mifosxHasPermission","DELETE_STANDINGINSTRUCTION"))}function Gi(i,c){if(i&1&&(n(0,"button",37),o(1,"translate"),t(2,`
          `),f(3,"i",42),t(4,`
        `),e()),i&2){let r=y().$implicit;Vt("matTooltip",s(1,2,"tooltips.View Standing Instruction")),m("routerLink",vt(4,Ci,r.id))}}function zi(i,c){if(i&1&&(n(0,"td",34),t(1,`
        `),u(2,ji,4,1,"span",35),t(3,`
        `),u(4,Ui,4,1,"span",35),t(5,`
        `),u(6,Gi,5,6,"button",36),t(7,`
      `),e()),i&2){let r=c.$implicit;a(2),m("ngIf",r.status.value!=="Deleted"),a(2),m("ngIf",r.status.value!=="Deleted"),a(2),m("mifosxHasPermission","READ_STANDINGINSTRUCTION")}}function Qi(i,c){i&1&&f(0,"tr",43)}function Wi(i,c){i&1&&f(0,"tr",44)}var oe=(()=>{class i{constructor(r,d,l,x){this.route=r,this.accountTransfersService=d,this.settingsService=l,this.dialog=x,this.transferType=new Bt,this.fromAccountId=new Bt,this.clientNameControl=new Bt,this.fromClientId=new Bt,this.dataSource=new kt,this.displayedColumns=["client","fromAccount","beneficiary","toAccount","amount","validity","actions"],this.route.data.subscribe(g=>{this.standingIntructionsTemplateData=g.standingIntructionsTemplate,g.standingIntructionsTemplate.fromClient&&(this.clientName=this.standingIntructionsTemplateData.fromClient.displayName,this.getStandingInstructions()),this.setParams(),this.transferTypeDatas=this.standingIntructionsTemplateData.transferTypeOptions})}setParams(){switch(this.accountType=this.route.snapshot.queryParams.accountType,this.accountType){case"fromloans":this.accountTypeId="1";break;case"fromsavings":this.accountTypeId="2";break;default:this.accountTypeId="0"}this.isFromClient=!!this.route.parent.parent.snapshot.params.clientId}filterStandingInstructions(){this.getStandingInstructions()}getStandingInstructions(){let r=this.settingsService.dateFormat,d=this.settingsService.language.code,l={clientId:this.standingIntructionsTemplateData.fromClient.id||this.fromClientId.value,clientName:this.standingIntructionsTemplateData.fromClient.displayName||this.clientNameControl.value,locale:d,dateFormat:r,limit:14,offset:0,fromAccountType:this.accountTypeId,fromAccountId:this.fromAccountId.value,fromTransferType:this.transferType.value};this.accountTransfersService.getStandingInstructions(l).subscribe(x=>{this.instructionsData=x.pageItems,this.dataSource.data=this.instructionsData,this.instructionTableRef.renderRows()})}deleteStandingInstruction(r){this.dialog.open(Oe,{data:{deleteContext:`standing instruction id: ${r}`}}).afterClosed().subscribe(l=>{l.delete&&this.accountTransfersService.deleteStandingInstrucions(r).subscribe(()=>{})})}static{this.\u0275fac=function(d){return new(d||i)(S(q),S(D),S(z),S(Ae))}}static{this.\u0275cmp=A({type:i,selectors:[["mifosx-list-standing-instructions"]],viewQuery:function(d,l){if(d&1&&(At(gi,7),At(bt,7)),d&2){let x;Ft(x=Mt())&&(l.instructionTableRef=x.first),Ft(x=Mt())&&(l.paginator=x.first)}},decls:91,vars:16,consts:[["instructionsTable",""],[1,"container"],[1,"layout-row-wrap","gap-2px","responsive-column"],["class","flex-fill",4,"ngIf"],[3,"inset"],[1,"type-field"],[3,"formControl"],[3,"value",4,"ngFor","ngForOf"],[1,"account-Id-field"],["matInput","","placeholder","From Account Id",3,"formControl"],["mat-raised-button","","color","primary","class","filter-button",3,"click",4,"mifosxHasPermission"],["mat-table","",3,"dataSource"],["matColumnDef","client"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","fromAccount"],["matColumnDef","beneficiary"],["matColumnDef","toAccount"],["matColumnDef","amount"],["matColumnDef","validity"],["matColumnDef","actions"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],["showFirstLastButtons","",3,"pageSize","pageSizeOptions"],[1,"flex-fill"],[1,"flex-40"],[1,"mat-h3"],[1,"client-Name"],[1,"flex-30"],["matInput","","placeholder","ClientName",3,"formControl"],["matInput","","placeholder","From Client Id",3,"formControl"],[3,"value"],["mat-raised-button","","color","primary",1,"filter-button",3,"click"],["mat-header-cell",""],["mat-cell",""],[4,"ngIf"],["class","account-action-button","mat-raised-button","","color","primary",3,"matTooltip","routerLink",4,"mifosxHasPermission"],["mat-raised-button","","color","primary",1,"account-action-button",3,"matTooltip","routerLink"],[1,"fa","fa-edit"],["class","account-action-button","mat-raised-button","","color","warn",3,"matTooltip","click",4,"mifosxHasPermission"],["mat-raised-button","","color","warn",1,"account-action-button",3,"click","matTooltip"],[1,"fa","fa-times"],[1,"fa","fa-eye"],["mat-header-row",""],["mat-row",""]],template:function(d,l){d&1&&(t(0,`

`),n(1,"mat-card",1),t(2,`
  `),n(3,"div",2),t(4,`
    `),u(5,yi,15,4,"div",3),t(6,`

    `),u(7,bi,12,2,"div",3),t(8,`

    `),f(9,"mat-divider",4),t(10,`

    `),n(11,"mat-form-field",5),t(12,`
      `),n(13,"mat-label"),t(14),o(15,"translate"),e(),t(16,`
      `),n(17,"mat-select",6),t(18,`
        `),u(19,Ei,2,2,"mat-option",7),t(20,`
      `),e(),t(21,`
    `),e(),t(22,`

    `),n(23,"mat-form-field",8),t(24,`
      `),f(25,"input",9),t(26,`
    `),e(),t(27,`

    `),u(28,Di,4,5,"button",10),t(29,`
  `),e(),t(30,`

  `),n(31,"table",11,0),t(33,`
    `),V(34,12),t(35,`
      `),u(36,Ai,3,3,"th",13),t(37,`
      `),u(38,Fi,2,2,"td",14),t(39,`
    `),L(),t(40,`

    `),V(41,15),t(42,`
      `),u(43,Mi,3,3,"th",13),t(44,`
      `),u(45,Bi,2,2,"td",14),t(46,`
    `),L(),t(47,`

    `),V(48,16),t(49,`
      `),u(50,ki,3,3,"th",13),t(51,`
      `),u(52,wi,2,1,"td",14),t(53,`
    `),L(),t(54,`

    `),V(55,17),t(56,`
      `),u(57,Ni,3,3,"th",13),t(58,`
      `),u(59,Oi,2,2,"td",14),t(60,`
    `),L(),t(61,`

    `),V(62,18),t(63,`
      `),u(64,qi,3,3,"th",13),t(65,`
      `),u(66,Pi,2,2,"td",14),t(67,`
    `),L(),t(68,`

    `),V(69,19),t(70,`
      `),u(71,Ri,3,3,"th",13),t(72,`
      `),u(73,Vi,4,6,"td",14),t(74,`
    `),L(),t(75,`

    `),V(76,20),t(77,`
      `),u(78,Li,3,3,"th",13),t(79,`
      `),u(80,zi,8,3,"td",14),t(81,`
    `),L(),t(82,`

    `),u(83,Qi,1,0,"tr",21),t(84,`
    `),u(85,Wi,1,0,"tr",22),t(86,`
  `),e(),t(87,`

  `),f(88,"mat-paginator",23),t(89,`
`),e(),t(90,`
`)),d&2&&(a(5),m("ngIf",l.isFromClient),a(2),m("ngIf",!l.isFromClient),a(2),m("inset",!0),a(5),p(s(15,13,"labels.inputs.Type")),a(3),m("formControl",l.transferType),a(2),m("ngForOf",l.transferTypeDatas),a(6),m("formControl",l.fromAccountId),a(3),m("mifosxHasPermission","READ_STANDINGINSTRUCTION"),a(3),m("dataSource",l.dataSource),a(52),m("matHeaderRowDef",l.displayedColumns),a(2),m("matRowDefColumns",l.displayedColumns),a(3),m("pageSize",10)("pageSizeOptions",N(15,Ti)))},dependencies:[M,Z,O,De,k,Q,W,Be,G,P,J,Y,K,mt,lt,j,ut,U,B,xt,jt,Gt,Ut,zt,$t,Qt,qe,Wt,Jt,Yt,Kt,bt],styles:[".container[_ngcontent-%COMP%]   .filter-button[_ngcontent-%COMP%]{height:2.5rem;margin-top:2rem}table[_ngcontent-%COMP%]{width:100%}table[_ngcontent-%COMP%]   .account-action-button[_ngcontent-%COMP%]{min-width:26px;padding:0 6px;margin:4px;line-height:25px}.mat-divider[_ngcontent-%COMP%]{border-top-color:#fff}"]})}}return i})();var Yi=()=>[5,10,25,50,100];function Ji(i,c){i&1&&(n(0,"th",16),t(1),o(2,"translate"),e()),i&2&&(a(),p(s(2,1,"labels.inputs.Transaction Date")))}function Ki(i,c){if(i&1&&(n(0,"td",17),t(1),o(2,"dateFormat"),e()),i&2){let r=c.$implicit;a(),p(s(2,1,r.transferDate))}}function Xi(i,c){i&1&&(n(0,"th",16),t(1),o(2,"translate"),e()),i&2&&(a(),p(s(2,1,"labels.inputs.Amount")))}function Zi(i,c){if(i&1&&(n(0,"td",17),t(1),e()),i&2){let r=c.$implicit;a(),p(r.transferAmount)}}function ta(i,c){i&1&&(n(0,"th",16),t(1),o(2,"translate"),e()),i&2&&(a(),p(s(2,1,"labels.inputs.Notes")))}function ea(i,c){if(i&1&&(n(0,"td",17),t(1),e()),i&2){let r=c.$implicit;a(),p(r.transferDescription)}}function na(i,c){i&1&&(n(0,"th",16),t(1),o(2,"translate"),e()),i&2&&(a(),p(s(2,1,"labels.inputs.Reversed")))}function ia(i,c){if(i&1&&(n(0,"td",17),t(1),o(2,"yesNo"),e()),i&2){let r=c.$implicit;a(),p(s(2,1,r.reversed))}}function aa(i,c){i&1&&f(0,"tr",18)}function ra(i,c){i&1&&f(0,"tr",19)}var se=(()=>{class i{constructor(r){this.route=r,this.dataSource=new kt,this.displayedColumns=["transactionDate","amount","notes","reversed"],this.route.data.subscribe(d=>{this.listTransactionData=d.listTransactionData,this.dataSource=new kt(this.listTransactionData.transactions.pageItems),this.dataSource.paginator=this.paginator})}static{this.\u0275fac=function(d){return new(d||i)(S(q))}}static{this.\u0275cmp=A({type:i,selectors:[["mifosx-list-transactions"]],viewQuery:function(d,l){if(d&1&&At(bt,7),d&2){let x;Ft(x=Mt())&&(l.paginator=x.first)}},decls:73,vars:19,consts:[[1,"container","m-b-20"],[1,"mat-elevation-z8"],[1,"layout-row-wrap"],[1,"flex-25","header"],[1,"flex-25"],[1,"mat-elevation-z8","container"],["mat-table","",3,"dataSource"],["matColumnDef","transactionDate"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","amount"],["matColumnDef","notes"],["matColumnDef","reversed"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],["showFirstLastButtons","",3,"pageSizeOptions"],["mat-header-cell",""],["mat-cell",""],["mat-header-row",""],["mat-row",""]],template:function(d,l){d&1&&(n(0,"div",0),t(1,`
  `),n(2,"mat-card",1),t(3,`
    `),n(4,"mat-card-content"),t(5,`
      `),n(6,"div",2),t(7,`
        `),n(8,"div",3),t(9),o(10,"translate"),e(),t(11,`

        `),n(12,"div",4),t(13),e(),t(14,`

        `),n(15,"div",3),t(16),o(17,"translate"),e(),t(18,`

        `),n(19,"div",4),t(20),e(),t(21,`

        `),n(22,"div",3),t(23),o(24,"translate"),e(),t(25,`

        `),n(26,"div",4),t(27),e(),t(28,`
      `),e(),t(29,`
    `),e(),t(30,`
  `),e(),t(31,`
`),e(),t(32,`

`),n(33,"div",5),t(34,`
  `),n(35,"table",6),t(36,`
    `),V(37,7),t(38,`
      `),u(39,Ji,3,3,"th",8),t(40,`
      `),u(41,Ki,3,3,"td",9),t(42,`
    `),L(),t(43,`

    `),V(44,10),t(45,`
      `),u(46,Xi,3,3,"th",8),t(47,`
      `),u(48,Zi,2,1,"td",9),t(49,`
    `),L(),t(50,`

    `),V(51,11),t(52,`
      `),u(53,ta,3,3,"th",8),t(54,`
      `),u(55,ea,2,1,"td",9),t(56,`
    `),L(),t(57,`

    `),V(58,12),t(59,`
      `),u(60,na,3,3,"th",8),t(61,`
      `),u(62,ia,3,3,"td",9),t(63,`
    `),L(),t(64,`

    `),u(65,aa,1,0,"tr",13),t(66,`
    `),u(67,ra,1,0,"tr",14),t(68,`
  `),e(),t(69,`

  `),f(70,"mat-paginator",15),t(71,`
`),e(),t(72,`
`)),d&2&&(a(9),v(`
          `,s(10,12,"labels.inputs.From Account"),`
        `),a(4),I(`
          `,l.listTransactionData.fromAccount.accountNo,"(",l.listTransactionData.fromAccountType.value,`)
        `),a(3),v(`
          `,s(17,14,"labels.inputs.To Account"),`
        `),a(4),I(`
          `,l.listTransactionData.toAccount.accountNo,"(",l.listTransactionData.toAccountType.value,`)
        `),a(3),v(`
          `,s(24,16,"labels.inputs.Destination"),`
        `),a(4),v(`
          `,l.listTransactionData.toClient.displayName,`
        `),a(8),m("dataSource",l.dataSource),a(30),m("matHeaderRowDef",l.displayedColumns),a(2),m("matRowDefColumns",l.displayedColumns),a(3),m("pageSizeOptions",N(18,Yi)))},dependencies:[M,k,P,$,ut,B,jt,Gt,Ut,zt,$t,Qt,Wt,Jt,Yt,Kt,bt,Le],styles:[".content[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]{line-height:3rem}.content[_ngcontent-%COMP%]   div.header[_ngcontent-%COMP%]{font-weight:500}table[_ngcontent-%COMP%]{width:100%}table[_ngcontent-%COMP%]   .select-row[_ngcontent-%COMP%]:hover{cursor:pointer}"]})}}return i})();function oa(i,c){i&1&&(n(0,"button",14),t(1,`
        `),f(2,"fa-icon",15),t(3),o(4,"translate"),e()),i&2&&(a(3),v("",s(4,1,"labels.buttons.Undo"),`
      `))}function sa(i,c){i&1&&(n(0,"span"),t(1,`
      `),u(2,oa,5,3,"button",13),t(3,`
    `),e()),i&2&&(a(2),m("mifosxHasPermission","ADJUST_ACCOUNTTRANSFER"))}var le=(()=>{class i{constructor(r,d){this.route=r,this.location=d,this.route.data.subscribe(l=>{this.viewAccountTransferData=l.viewAccountTransferData})}transferToClient(r){return`/#/clients/${r.id}`}transferToAccount(r,d){return`/#/clients/${r.id}/savings-accounts/${d.id}`}goBack(){this.location.back()}transactionColor(){return this.viewAccountTransferData.reversed?"undo":"active"}static{this.\u0275fac=function(d){return new(d||i)(S(q),S(be))}}static{this.\u0275cmp=A({type:i,selectors:[["mifosx-view-account-transfer"]],decls:160,vars:69,consts:[[1,"container"],[1,"container","m-b-20","align-end","gap-2px"],[4,"ngIf"],[1,"layout-row-wrap","responsive-column"],[1,"flex-100",3,"ngClass"],[1,"mat-h3","flex-fill"],[3,"inset"],[1,"flex-fill"],[1,"flex-40"],[1,"flex-60"],[3,"href"],[1,"layout-row","align-center","gap-5px","responsive-column"],["type","button","color","primary","mat-raised-button","",3,"click"],["mat-raised-button","","color","warn",4,"mifosxHasPermission"],["mat-raised-button","","color","warn"],["icon","undo",1,"m-r-10"]],template:function(d,l){d&1&&(n(0,"div",0),t(1,`
  `),n(2,"div",1),t(3,`
    `),u(4,sa,4,1,"span",2),t(5,`
  `),e(),t(6,`

  `),n(7,"mat-card"),t(8,`
    `),n(9,"mat-card-content"),t(10,`
      `),n(11,"div",3),t(12,`
        `),f(13,"div",4),t(14,`

        `),n(15,"h3",5),t(16),o(17,"translate"),e(),t(18,`

        `),f(19,"mat-divider",6),t(20,`

        `),n(21,"div",7),t(22,`
          `),n(23,"span",8),t(24),o(25,"translate"),e(),t(26,`
          `),n(27,"span",9),t(28),o(29,"formatNumber"),e(),t(30,`
        `),e(),t(31,`

        `),n(32,"div",7),t(33,`
          `),n(34,"span",8),t(35),o(36,"translate"),e(),t(37,`
          `),n(38,"span",9),t(39),o(40,"dateFormat"),e(),t(41,`
        `),e(),t(42,`

        `),n(43,"div",7),t(44,`
          `),n(45,"span",8),t(46),o(47,"translate"),e(),t(48,`
          `),n(49,"span",9),t(50),e(),t(51,`
        `),e(),t(52,`

        `),n(53,"h3",5),t(54),o(55,"translate"),e(),t(56,`

        `),f(57,"mat-divider",6),t(58,`

        `),n(59,"div",7),t(60,`
          `),n(61,"span",8),t(62),o(63,"translate"),e(),t(64,`
          `),n(65,"span",9),t(66),e(),t(67,`
        `),e(),t(68,`

        `),n(69,"div",7),t(70,`
          `),n(71,"span",8),t(72),o(73,"translate"),e(),t(74,`
          `),n(75,"span",9),t(76),e(),t(77,`
        `),e(),t(78,`

        `),n(79,"div",7),t(80,`
          `),n(81,"span",8),t(82),o(83,"translate"),e(),t(84,`
          `),n(85,"span",9),t(86),e(),t(87,`
        `),e(),t(88,`

        `),n(89,"div",7),t(90,`
          `),n(91,"span",8),t(92),o(93,"translate"),e(),t(94,`
          `),n(95,"span",9),t(96),e(),t(97,`
        `),e(),t(98,`

        `),n(99,"h3",5),t(100),o(101,"translate"),e(),t(102,`

        `),f(103,"mat-divider",6),t(104,`

        `),n(105,"div",7),t(106,`
          `),n(107,"span",8),t(108),o(109,"translate"),e(),t(110,`
          `),n(111,"span",9),t(112),e(),t(113,`
        `),e(),t(114,`

        `),n(115,"div",7),t(116,`
          `),n(117,"span",8),t(118),o(119,"translate"),e(),t(120,`
          `),n(121,"span",9)(122,"a",10),t(123),e(),t(124,`
          `),e(),t(125,`
        `),e(),t(126,`

        `),n(127,"div",7),t(128,`
          `),n(129,"span",8),t(130),o(131,"translate"),e(),t(132,`
          `),n(133,"span",9),t(134),e(),t(135,`
        `),e(),t(136,`

        `),n(137,"div",7),t(138,`
          `),n(139,"span",8),t(140),o(141,"translate"),e(),t(142,`
          `),n(143,"span",9)(144,"a",10),t(145),e(),t(146,`
          `),e(),t(147,`
        `),e(),t(148,`
      `),e(),t(149,`
    `),e(),t(150,`

    `),n(151,"mat-card-actions",11),t(152,`
      `),n(153,"button",12),T("click",function(){return l.goBack()}),t(154),o(155,"translate"),e(),t(156,`
    `),e(),t(157,`
  `),e(),t(158,`
`),e(),t(159,`
`)),d&2&&(a(4),m("ngIf",!l.viewAccountTransferData.reversed),a(9),m("ngClass",l.transactionColor()),a(3),p(s(17,35,"labels.heading.Transaction Details")),a(3),m("inset",!0),a(5),v("",s(25,37,"labels.inputs.Transaction Amount"),":"),a(4),Te("",l.viewAccountTransferData.currency.displaySymbol,`
            `,s(29,39,l.viewAccountTransferData.transferAmount)," (",l.viewAccountTransferData.currency.code,")"),a(7),v("",s(36,41,"labels.inputs.Transaction Date"),":"),a(4),p(s(40,43,l.viewAccountTransferData.transferDate)),a(7),v("",s(47,45,"labels.inputs.Destination"),":"),a(4),p(l.viewAccountTransferData.transferDescription),a(4),p(s(55,47,"labels.heading.Transferred From")),a(3),m("inset",!0),a(5),v("",s(63,49,"labels.inputs.Office"),":"),a(4),p(l.viewAccountTransferData.fromOffice.name),a(6),v("",s(73,51,"labels.inputs.Client"),":"),a(4),p(l.viewAccountTransferData.fromClient.displayName),a(6),v("",s(83,53,"labels.inputs.Account Type"),":"),a(4),p(l.viewAccountTransferData.fromAccountType.value),a(6),v("",s(93,55,"labels.inputs.Account No"),":"),a(4),p(l.viewAccountTransferData.fromAccount.accountNo),a(4),p(s(101,57,"labels.heading.Transferred To")),a(3),m("inset",!0),a(5),v("",s(109,59,"labels.inputs.Office"),":"),a(4),p(l.viewAccountTransferData.toOffice.name),a(6),v("",s(119,61,"labels.inputs.Client"),":"),a(4),m("href",l.transferToClient(l.viewAccountTransferData.toClient),pe),a(),v(`
              `,l.viewAccountTransferData.toClient.displayName,""),a(7),v("",s(131,63,"labels.inputs.Account Type"),":"),a(4),p(l.viewAccountTransferData.toAccountType.value),a(6),v("",s(141,65,"labels.inputs.Account No"),":"),a(4),m("href",l.transferToAccount(l.viewAccountTransferData.toClient,l.viewAccountTransferData.toAccount),pe),a(),v(`
              `,l.viewAccountTransferData.toAccount.accountNo,""),a(9),v(`
        `,s(155,67,"labels.buttons.Back"),`
      `))},dependencies:[M,Ee,O,k,P,$,rt,j,ut,U,B,ft,xt,Ve],styles:["h3[_ngcontent-%COMP%]{margin:0;font-weight:500}span[_ngcontent-%COMP%]{margin:.5em 0}mat-divider[_ngcontent-%COMP%]{margin:0 0 .5em}"]})}}return i})();var ve=(()=>{class i{constructor(r){this.accountTransfersService=r}resolve(r){let d=r.parent.paramMap.get("standingInstructionsId");return this.accountTransfersService.getStandingInstructionsData(d)}static{this.\u0275fac=function(d){return new(d||i)(R(D))}}static{this.\u0275prov=H({token:i,factory:i.\u0275fac})}}return i})();var Ie=(()=>{class i{constructor(r){this.accountTransfersService=r}resolve(r){let d=r.parent.paramMap.get("standingInstructionsId");return this.accountTransfersService.getStandingInstructionsDataAndTemplate(d)}static{this.\u0275fac=function(d){return new(d||i)(R(D))}}static{this.\u0275prov=H({token:i,factory:i.\u0275fac})}}return i})();var me=(()=>{class i{constructor(r){this.accountTransfersService=r}resolve(r){let d=r.queryParamMap.get("officeId"),l=r.queryParamMap.get("accountType"),x=r.parent.paramMap.get("clientId");switch(l){case"fromloans":this.accountTypeId="1";break;case"fromsavings":this.accountTypeId="2";break;default:this.accountTypeId="0"}return this.accountTransfersService.getStandingInstructionsTemplate(x,d,this.accountTypeId)}static{this.\u0275fac=function(d){return new(d||i)(R(D))}}static{this.\u0275prov=H({token:i,factory:i.\u0275fac})}}return i})();var _e=(()=>{class i{constructor(r){this.accountTransfersService=r}resolve(r){switch(r.queryParamMap.get("accountType")){case"fromloans":this.accountTypeId="1",this.id=r.queryParamMap.get("loanId");break;case"fromsavings":this.accountTypeId="2",this.id=r.queryParamMap.get("savingsId");break;case"interbank":this.accountTypeId="2",this.id=r.queryParamMap.get("savingsId");break;default:this.accountTypeId="0"}return this.accountTransfersService.newAccountTranferResource(this.id,this.accountTypeId)}static{this.\u0275fac=function(d){return new(d||i)(R(D))}}static{this.\u0275prov=H({token:i,factory:i.\u0275fac})}}return i})();var Se=(()=>{class i{constructor(r,d){this.accountTransfersService=r,this.settingsService=d}resolve(r){let d=r.parent.paramMap.get("standingInstructionsId"),l=this.settingsService.dateFormat,x=this.settingsService.language.code;return this.accountTransfersService.getStandingInstructionsTransactions(d,l,x)}static{this.\u0275fac=function(d){return new(d||i)(R(D),R(z))}}static{this.\u0275prov=H({token:i,factory:i.\u0275fac})}}return i})();var ge=(()=>{class i{constructor(r){this.accountTransfersService=r}resolve(r){let d=r.paramMap.get("transferid");return this.accountTransfersService.getViewAccountTransferDetails(d)}static{this.\u0275fac=function(d){return new(d||i)(R(D))}}static{this.\u0275prov=H({token:i,factory:i.\u0275fac})}}return i})();var la=[{path:"",children:[{path:"create-standing-instructions",data:{title:"Create Standing Instructions",breadcrumb:"Create Standing Instructions",routeParamBreadcrumb:"Create Standing Instructions"},component:ie,resolve:{standingIntructionsTemplate:me}},{path:"make-account-transfer",data:{title:"Account Transfer",breadcrumb:"Account Transfer",routeParamBreadcrumb:"Account Transfer"},component:re,resolve:{accountTransferTemplate:_e}},{path:"list-standing-instructions",data:{title:"List Standing Instructions",breadcrumb:"List Standing Instructions",routeParamBreadcrumb:"List Standing Instructions"},component:oe,resolve:{standingIntructionsTemplate:me}},{path:"account-transfers",data:{title:"View Account Transfer",breadcrumb:"Account Transfers",routeParamBreadcrumb:!1},children:[{path:":transferid",data:{routeParamBreadcrumb:"transferid"},component:le,resolve:{viewAccountTransferData:ge}}]},{path:":standingInstructionsId",data:{title:"Standing Instructions",routeParamBreadcrumb:"standingInstructionsId"},children:[{path:"view",data:{title:"View Standing Instructions",breadcrumb:"view",routeParamBreadcrumb:!1},component:Xt,resolve:{standingInstructionsData:ve}},{path:"edit",data:{title:"Edit Standing Instructions",breadcrumb:"edit",routeParamBreadcrumb:!1},component:ne,resolve:{standingInstructionsDataAndTemplate:Ie}},{path:"list-account-transactions",data:{title:"List Account Transactions",breadcrumb:"List Account Transactions",routeParamBreadcrumb:"List Account Transactions"},component:se,resolve:{listTransactionData:Se}}]}]}],Qe=(()=>{class i{static{this.\u0275fac=function(d){return new(d||i)}}static{this.\u0275mod=Rt({type:i})}static{this.\u0275inj=Pt({providers:[ve,Ie,me,_e,Se,ge],imports:[ce.forChild(la),ce]})}}return i})();var Ro=(()=>{class i{static{this.\u0275fac=function(d){return new(d||i)}}static{this.\u0275mod=Rt({type:i})}static{this.\u0275inj=Pt({imports:[Ue,He,$e,Qe,Xt,ne,ie,re,oe,se,le,ae]})}}return i})();export{Ro as AccountTransfersModule};
