import{a as D}from"./chunk-WYMXKPEW.js";import{$b as G,$c as rt,$e as Gt,Ac as w,Bd as pt,Ca as Lt,Cc as Ae,Cd as dt,Dd as ut,Ee as yt,F as H,Fa as At,Fc as ht,Fd as ft,G as Vt,Ga as Mt,Gc as z,Ha as kt,Hd as U,I as R,Ia as E,Ja as t,Ka as c,Kc as Q,Kd as xt,La as _,Lc as g,Ma as v,Mc as W,N as h,Na as Se,Nc as et,O as C,Od as Pe,Of as Re,Pa as Te,Qa as he,Qc as Ft,Qf as Le,Ra as Ce,Rc as Me,Rf as He,Sc as nt,Sd as _t,Sf as je,Ta as L,Tc as Ct,Ua as Z,Uc as ke,Vc as it,Wa as o,Xa as l,Xb as q,Xe as jt,Ya as Bt,Yc as at,Yd as Ne,Ye as $t,Ze as Ut,_ as me,_b as Tt,_c as Be,_f as $e,af as zt,bc as ce,bd as Fe,ca as a,cf as Qt,db as be,dd as bt,df as Wt,eb as ye,ec as j,ed as we,fb as tt,fd as O,ff as Yt,ga as I,gb as N,gd as V,gf as Jt,ha as M,ia as Rt,if as Kt,jd as $,la as u,ld as ot,lf as wt,na as m,ob as Ee,pd as Y,qd as lt,ra as n,rc as De,rd as Oe,re as qe,sa as e,se as Ve,ta as f,td as st,tg as Ue,ua as k,ub as F,ud as J,va as B,vd as Ht,wd as K,xa as A,xd as mt,ya as T,za as S,zd as ct}from"./chunk-3AOFK5SM.js";import{a as Nt,b as qt}from"./chunk-O7S4L63H.js";var Je=()=>["../","edit"],Ke=()=>["../","list-account-transactions"];function Xe(i,p){i&1&&(n(0,"button",1),t(1),o(2,"translate"),e()),i&2&&(m("routerLink",L(4,Ke)),a(),_(`
    `,l(2,2,"labels.buttons.View Transactions History"),`
  `))}function Ze(i,p){i&1&&(n(0,"span"),t(1),o(2,"translate"),e()),i&2&&(a(),_(" ",l(2,1,"labels.inputs.Within Bank")," "))}function tn(i,p){i&1&&(n(0,"span"),t(1),o(2,"translate"),e()),i&2&&(a(),_(" ",l(2,1,"labels.inputs.Own Account")," "))}var Xt=(()=>{class i{constructor(r){this.route=r,this.allowclientedit=!1,this.route.data.subscribe(d=>{this.standingInstructionsData=d.standingInstructionsData,this.standingInstructionsData.fromClient.id===this.standingInstructionsData.toClient.id&&(this.allowclientedit=!1)})}static{this.\u0275fac=function(d){return new(d||i)(I(q))}}static{this.\u0275cmp=M({type:i,selectors:[["mifosx-view-standing-instructions"]],decls:215,vars:90,consts:[[1,"layout-row","align-end","gap-2px","responsive-column","container","m-b-20"],["mat-raised-button","","color","primary",3,"routerLink"],["icon","edit",1,"m-r-10"],["mat-raised-button","","color","primary",3,"routerLink",4,"mifosxHasPermission"],[1,"container"],[1,"layout-row-wrap","responsive-column"],[1,"mat-h2","flex-fill"],[3,"inset"],[1,"flex-fill"],[1,"flex-40"],[1,"flex-60"],[4,"ngIf"]],template:function(d,s){d&1&&(n(0,"div",0),t(1,`
  `),n(2,"button",1),t(3,`
    `),f(4,"fa-icon",2),t(5),o(6,"translate"),e(),t(7,`
  `),u(8,Xe,3,5,"button",3),t(9,`
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
            `),u(92,Ze,3,3,"span",11),t(93,`
            `),u(94,tn,3,3,"span",11),t(95,`
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
`)),d&2&&(a(2),m("routerLink",L(89,Je)),a(3),_(`
    `,l(6,45,"labels.buttons.Edit"),`
  `),a(3),m("mifosxHasPermission","READ_ACCOUNTTRANSFER"),a(12),c(s.standingInstructionsData.name),a(2),m("inset",!0),a(5),_("",l(28,47,"labels.inputs.Applicant"),":"),a(4),c(s.standingInstructionsData.fromClient.displayName),a(6),_("",l(38,49,"labels.inputs.Type"),":"),a(4),c(s.standingInstructionsData.transferType.value),a(6),_("",l(48,51,"labels.inputs.Priority"),":"),a(4),c(s.standingInstructionsData.priority.value),a(6),_("",l(58,53,"labels.inputs.Status"),":"),a(4),c(s.standingInstructionsData.status.value),a(6),_("",l(68,55,"labels.inputs.From Account Type"),":"),a(4),c(s.standingInstructionsData.fromAccountType.value),a(6),_("",l(78,57,"labels.inputs.From Account"),":"),a(4),v("",s.standingInstructionsData.fromAccount.productName,` -
            `,s.standingInstructionsData.fromAccount.accountNo,""),a(6),_("",l(88,59,"labels.inputs.Destination"),":"),a(5),m("ngIf",s.allowclientedit),a(2),m("ngIf",!s.allowclientedit),a(7),_("",l(102,61,"labels.inputs.To Office"),":"),a(4),c(s.standingInstructionsData.toOffice.name),a(6),_("",l(112,63,"labels.inputs.Beneficiary"),":"),a(4),c(s.standingInstructionsData.toClient.displayName),a(6),_("",l(122,65,"labels.inputs.To Account Type"),":"),a(4),c(s.standingInstructionsData.toAccountType.value),a(6),_("",l(132,67,"labels.inputs.To Account"),":"),a(4),v("",s.standingInstructionsData.toAccount.productName,` -
            `,s.standingInstructionsData.toAccount.accountNo,""),a(6),_("",l(142,69,"labels.inputs.Standing Instruction Type"),":"),a(4),c(s.standingInstructionsData.instructionType.value),a(6),_("",l(152,71,"labels.inputs.Amount"),":"),a(4),c(s.standingInstructionsData.amount),a(6),_("",l(162,73,"labels.inputs.Validity"),":"),a(4),v("",l(166,75,s.standingInstructionsData.validFrom),` -
            `,l(167,77,s.standingInstructionsData.validTill),""),a(8),_("",l(174,79,"labels.inputs.Recurrence Type"),":"),a(4),c(s.standingInstructionsData.recurrenceType.value),a(6),_("",l(184,81,"labels.inputs.Interval"),":"),a(4),c(s.standingInstructionsData.recurrenceInterval),a(6),_("",l(194,83,"labels.inputs.Recurrence Frequency"),":"),a(4),c(s.standingInstructionsData.recurrenceFrequency.value),a(6),_("",l(204,85,"labels.inputs.On Month Day"),":"),a(4),c(l(208,87,s.standingInstructionsData.recurrenceOnMonthDay)))},dependencies:[F,N,O,G,V,$,j,ft,U,w,xt,_t],styles:[".mat-elevation-z1[_ngcontent-%COMP%]{margin:1em 0 1.5em}h2[_ngcontent-%COMP%], h3[_ngcontent-%COMP%], h4[_ngcontent-%COMP%]{margin:0;font-weight:500}span[_ngcontent-%COMP%]{margin:.5em 0}.margin-t[_ngcontent-%COMP%]{margin-top:1em}mat-divider[_ngcontent-%COMP%]{margin:0 0 1em}"]})}}return i})();var en=()=>["../view"];function nn(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.value,`
              `)}}function an(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Priority")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function rn(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.value,`
              `)}}function on(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Status")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function ln(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.value,`
              `)}}function sn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Valid From Date")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function mn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Valid Till Date")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function cn(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.value,`
              `)}}function pn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Recurrence Type")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function dn(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.value,`
              `)}}function un(i,p){if(i&1){let r=A();n(0,"button",35),T("click",function(){h(r);let s=S();return C(s.submit())}),t(1),o(2,"translate"),e()}if(i&2){let r=S();m("disabled",!r.editStandingInstructionsForm.valid),a(),_(`
          `,l(2,2,"labels.buttons.Submit"),`
        `)}}var ne=(()=>{class i{constructor(r,d,s,x,b,y){this.formBuilder=r,this.route=d,this.router=s,this.accountTransfersService=x,this.settingsService=b,this.dateUtils=y,this.allowclientedit=!1,this.minDate=new Date(2e3,0,1),this.maxDate=new Date(2100,0,1),this.route.data.subscribe(St=>{this.standingInstructionsData=St.standingInstructionsDataAndTemplate,this.standingInstructionsId=St.standingInstructionsDataAndTemplate.id,this.standingInstructionsData.fromClient.id===this.standingInstructionsData.toClient.id&&(this.allowclientedit=!1),this.setOptions()})}ngOnInit(){this.createEditStandingInstructionsForm();let d=new Date().getFullYear();this.standingInstructionsData.recurrenceOnMonthDay&&this.standingInstructionsData.recurrenceOnMonthDay.push(d),this.editStandingInstructionsForm.patchValue({name:this.standingInstructionsData.name,applicant:this.standingInstructionsData.fromClient.displayName,type:this.standingInstructionsData.transferType.value,priority:this.standingInstructionsData.priority.id,status:this.standingInstructionsData.status.id,fromAccountType:this.standingInstructionsData.fromAccountType.value,fromAccount:this.standingInstructionsData.fromAccount.productName,destination:this.allowclientedit?"Within Bank":"Own Account",toOffice:this.standingInstructionsData.toOffice.name,toClientId:this.standingInstructionsData.toClient.displayName,toAccountType:this.standingInstructionsData.toAccountType.value,toAccount:this.standingInstructionsData.toAccount.productName,instructionType:this.standingInstructionsData.instructionType.id,amount:this.standingInstructionsData.amount,validFrom:this.standingInstructionsData.validFrom&&new Date(this.standingInstructionsData.validFrom),validTill:this.standingInstructionsData.validTill&&new Date(this.standingInstructionsData.validTill),recurrenceType:this.standingInstructionsData.recurrenceType.id,recurrenceInterval:this.standingInstructionsData.recurrenceInterval,recurrenceFrequency:this.standingInstructionsData.recurrenceFrequency.id,recurrenceOnMonthDay:this.standingInstructionsData.recurrenceOnMonthDay&&new Date(this.standingInstructionsData.recurrenceOnMonthDay)})}createEditStandingInstructionsForm(){this.editStandingInstructionsForm=this.formBuilder.group({name:[{value:"",disabled:!0}],applicant:[{value:"",disabled:!0}],type:[{value:"",disabled:!0}],priority:["",g.required],status:["",g.required],fromAccountType:[{value:"",disabled:!0}],fromAccount:[{value:"",disabled:!0}],destination:[{value:"",disabled:!0}],toOffice:[{value:"",disabled:!0}],toClientId:[{value:"",disabled:!0}],toAccountType:[{value:"",disabled:!0}],toAccount:[{value:"",disabled:!0}],instructionType:"",amount:"",validFrom:["",g.required],validTill:["",g.required],recurrenceType:["",g.required],recurrenceInterval:"",recurrenceFrequency:"",recurrenceOnMonthDay:""})}setOptions(){this.priorityTypeData=this.standingInstructionsData.priorityOptions,this.statusTypeData=this.standingInstructionsData.statusOptions,this.instructionTypeData=this.standingInstructionsData.instructionTypeOptions,this.recurrenceTypeData=this.standingInstructionsData.recurrenceTypeOptions,this.recurrenceFrequencyTypeData=this.standingInstructionsData.recurrenceFrequencyOptions}submit(){let r=this.settingsService.dateFormat,d=this.settingsService.language.code,s={amount:this.editStandingInstructionsForm.value.amount,dateFormat:r,instructionType:this.editStandingInstructionsForm.value.instructionType,locale:d,monthDayFormat:"dd MMMM",priority:this.editStandingInstructionsForm.value.priority,recurrenceFrequency:this.editStandingInstructionsForm.value.recurrenceFrequency,recurrenceInterval:this.editStandingInstructionsForm.value.recurrenceInterval,recurrenceOnMonthDay:this.dateUtils.formatDate(this.editStandingInstructionsForm.value.recurrenceOnMonthDay,"dd MMMM"),recurrenceType:this.editStandingInstructionsForm.value.recurrenceType,status:this.editStandingInstructionsForm.value.status,validFrom:this.dateUtils.formatDate(this.editStandingInstructionsForm.value.validFrom,r),validTill:this.dateUtils.formatDate(this.editStandingInstructionsForm.value.validTill,r)};this.accountTransfersService.updateStandingInstructionsData(this.standingInstructionsId,s).subscribe(x=>{this.router.navigate(["../view"],{relativeTo:this.route})})}static{this.\u0275fac=function(d){return new(d||i)(I(bt),I(q),I(Tt),I(D),I(z),I(ht))}}static{this.\u0275cmp=M({type:i,selectors:[["mifosx-edit-standing-instructions"]],decls:244,vars:89,consts:[["validFromDatePicker",""],["validTillDatePicker",""],["recurrenceOnMonthDayDatePicker",""],[1,"container"],[3,"formGroup"],[1,"layout-row-wrap","gap-2px","responsive-column"],[1,"flex-48"],["matInput","","formControlName","name"],["matInput","","formControlName","applicant"],["matInput","","formControlName","type"],["matInput","","formControlName","fromAccountType"],["required","","formControlName","priority"],[3,"value",4,"ngFor","ngForOf"],[4,"ngIf"],["required","","formControlName","status"],["matInput","","formControlName","fromAccount"],["matInput","","formControlName","destination"],["matInput","","formControlName","toOffice"],["matInput","","formControlName","toClientId"],["matInput","","formControlName","toAccountType"],["matInput","","formControlName","toAccount"],["formControlName","instructionType"],["matInput","","formControlName","amount"],[1,"flex-48",3,"click"],["matInput","","required","","formControlName","validFrom",3,"min","max","matDatepicker"],["matSuffix","",3,"for"],["matInput","","required","","formControlName","validTill",3,"min","max","matDatepicker"],["required","","formControlName","recurrenceType"],["matInput","","formControlName","recurrenceInterval"],["formControlName","recurrenceFrequency"],["matInput","","formControlName","recurrenceOnMonthDay",3,"min","max","matDatepicker"],[1,"layout-row","align-center","gap-5px","responsive-column"],["type","button","mat-raised-button","",3,"routerLink"],["mat-raised-button","","color","primary",3,"disabled","click",4,"mifosxHasPermission"],[3,"value"],["mat-raised-button","","color","primary",3,"click","disabled"]],template:function(d,s){if(d&1){let x=A();n(0,"div",3),t(1,`
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
              `),u(54,nn,2,2,"mat-option",12),t(55,`
            `),e(),t(56,`
            `),u(57,an,8,9,"mat-error",13),t(58,`
          `),e(),t(59,`

          `),n(60,"mat-form-field",6),t(61,`
            `),n(62,"mat-label"),t(63),o(64,"translate"),e(),t(65,`
            `),n(66,"mat-select",14),t(67,`
              `),u(68,rn,2,2,"mat-option",12),t(69,`
            `),e(),t(70,`
            `),u(71,on,8,9,"mat-error",13),t(72,`
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
              `),u(136,ln,2,2,"mat-option",12),t(137,`
            `),e(),t(138,`
          `),e(),t(139,`

          `),n(140,"mat-form-field",6),t(141,`
            `),n(142,"mat-label"),t(143),o(144,"translate"),e(),t(145,`
            `),f(146,"input",22),t(147,`
          `),e(),t(148,`

          `),n(149,"mat-form-field",23),T("click",function(){h(x);let y=E(160);return C(y.open())}),t(150,`
            `),n(151,"mat-label"),t(152),o(153,"translate"),e(),t(154,`
            `),f(155,"input",24),t(156,`
            `),f(157,"mat-datepicker-toggle",25),t(158,`
            `),f(159,"mat-datepicker",null,0),t(161,`
            `),u(162,sn,8,9,"mat-error",13),t(163,`
          `),e(),t(164,`

          `),n(165,"mat-form-field",23),T("click",function(){h(x);let y=E(176);return C(y.open())}),t(166,`
            `),n(167,"mat-label"),t(168),o(169,"translate"),e(),t(170,`
            `),f(171,"input",26),t(172,`
            `),f(173,"mat-datepicker-toggle",25),t(174,`
            `),f(175,"mat-datepicker",null,1),t(177,`
            `),u(178,mn,8,9,"mat-error",13),t(179,`
          `),e(),t(180,`

          `),n(181,"mat-form-field",6),t(182,`
            `),n(183,"mat-label"),t(184),o(185,"translate"),e(),t(186,`
            `),n(187,"mat-select",27),t(188,`
              `),u(189,cn,2,2,"mat-option",12),t(190,`
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
              `),u(212,dn,2,2,"mat-option",12),t(213,`
            `),e(),t(214,`
          `),e(),t(215,`

          `),n(216,"mat-form-field",23),T("click",function(){h(x);let y=E(227);return C(y.open())}),t(217,`
            `),n(218,"mat-label"),t(219),o(220,"translate"),e(),t(221,`
            `),f(222,"input",30),t(223,`
            `),f(224,"mat-datepicker-toggle",25),t(225,`
            `),f(226,"mat-datepicker",null,2),t(228,`
          `),e(),t(229,`
        `),e(),t(230,`
      `),e(),t(231,`

      `),n(232,"mat-card-actions",31),t(233,`
        `),n(234,"button",32),t(235),o(236,"translate"),e(),t(237,`
        `),u(238,un,3,4,"button",33),t(239,`
      `),e(),t(240,`
    `),e(),t(241,`
  `),e(),t(242,`
`),e(),t(243,`
`)}if(d&2){let x=E(160),b=E(176),y=E(227);a(4),m("formGroup",s.editStandingInstructionsForm),a(9),c(l(14,46,"labels.inputs.name")),a(9),c(l(23,48,"labels.inputs.Applicant")),a(9),c(l(32,50,"labels.inputs.Type")),a(9),c(l(41,52,"labels.inputs.From Account Type")),a(9),c(l(50,54,"labels.inputs.Priority")),a(5),m("ngForOf",s.priorityTypeData),a(3),m("ngIf",s.editStandingInstructionsForm.controls.priority.hasError("required")),a(6),c(l(64,56,"labels.inputs.Status")),a(5),m("ngForOf",s.statusTypeData),a(3),m("ngIf",s.editStandingInstructionsForm.controls.status.hasError("required")),a(6),c(l(78,58,"labels.inputs.From Account")),a(9),c(l(87,60,"labels.inputs.Destination")),a(9),c(l(96,62,"labels.inputs.To Office")),a(9),c(l(105,64,"labels.inputs.Beneficiary")),a(9),c(l(114,66,"labels.inputs.To Account Type")),a(9),c(l(123,68,"labels.inputs.To Account")),a(9),c(l(132,70,"labels.inputs.Standing Instruction Type")),a(5),m("ngForOf",s.instructionTypeData),a(7),c(l(144,72,"labels.inputs.Amount")),a(9),c(l(153,74,"labels.inputs.Validity from")),a(3),m("min",s.minDate)("max",s.maxDate)("matDatepicker",x),a(2),m("for",x),a(5),m("ngIf",s.editStandingInstructionsForm.controls.validFrom.hasError("required")),a(6),c(l(169,76,"labels.inputs.Validity To")),a(3),m("min",s.minDate)("max",s.maxDate)("matDatepicker",b),a(2),m("for",b),a(5),m("ngIf",s.editStandingInstructionsForm.controls.validTill.hasError("required")),a(6),c(l(185,78,"labels.inputs.Recurrence Type")),a(5),m("ngForOf",s.recurrenceTypeData),a(3),m("ngIf",s.editStandingInstructionsForm.controls.recurrenceType.hasError("required")),a(6),c(l(199,80,"labels.inputs.Interval")),a(9),c(l(208,82,"labels.inputs.Recurrence Frequency")),a(5),m("ngForOf",s.recurrenceFrequencyTypeData),a(7),c(l(220,84,"labels.inputs.On Month Day")),a(3),m("min",s.minDate)("max",s.maxDate)("matDatepicker",y),a(2),m("for",y),a(10),m("routerLink",L(88,en)),a(),_(`
          `,l(236,86,"labels.buttons.Cancel"),`
        `),a(3),m("mifosxHasPermission","UPDATE_STANDINGINSTRUCTION")}},dependencies:[F,tt,N,O,nt,Q,W,et,rt,it,at,G,V,$,ot,J,Y,lt,st,K,ct,mt,dt,ut,pt,j,U,w],encapsulation:2})}}return i})();var fn=()=>["../"];function xn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.name")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.inputs.required")))}function _n(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.value,`
              `)}}function vn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Transfer Type")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.inputs.required")))}function gn(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.value,`
              `)}}function In(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Priority")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function Sn(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.value,`
              `)}}function Tn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Status")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function hn(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.value,`
              `)}}function Cn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.From Account Type")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function bn(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),v(`
                `,r.productName," - ",r.accountNo,`
              `)}}function yn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.From Account")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function En(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.value,`
              `)}}function Dn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Destination")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function An(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.name,`
              `)}}function Mn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.To Office")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function kn(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.displayName,`
              `)}}function Bn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Beneficiary")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function Fn(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.value,`
              `)}}function wn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.To Account Type")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function On(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),v(`
                `,r.productName," - ",r.accountNo,`
              `)}}function Pn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.To Account")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function Nn(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.value,`
              `)}}function qn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Standing Instruction Type")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function Vn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Amount")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function Rn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Valid From Date")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function Ln(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Valid Till Date")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function Hn(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.value,`
              `)}}function jn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Recurrence Type")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function $n(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Recurrence Interval")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function Un(i,p){if(i&1&&(n(0,"mat-option",34),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.value,`
              `)}}function Gn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Recurrence Frequency")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function zn(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.On Month Day")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function Qn(i,p){if(i&1){let r=A();n(0,"button",35),T("click",function(){h(r);let s=S();return C(s.submit())}),t(1),o(2,"translate"),e()}if(i&2){let r=S();m("disabled",!r.createStandingInstructionsForm.valid),a(),_(`
          `,l(2,2,"labels.buttons.Submit"),`
        `)}}var ie=(()=>{class i{constructor(r,d,s,x,b,y){this.formBuilder=r,this.route=d,this.router=s,this.accountTransfersService=x,this.settingsService=b,this.dateUtils=y,this.minDate=new Date(2e3,0,1),this.maxDate=new Date(2100,0,1),this.allowclientedit=!0,this.route.data.subscribe(St=>{this.standingIntructionsTemplate=St.standingIntructionsTemplate,this.setParams(),this.setOptions()})}setParams(){switch(this.officeId=this.route.snapshot.queryParams.officeId,this.accountType=this.route.snapshot.queryParams.accountType,this.clientId=this.route.parent.snapshot.params.clientId,this.accountType){case"fromloans":this.accountTypeId="1";break;case"fromsavings":this.accountTypeId="2";break;default:this.accountTypeId="0"}}ngOnInit(){this.createCreateStandingInstructionsForm(),this.buildDependencies(),this.createStandingInstructionsForm.patchValue({applicant:this.standingIntructionsTemplate.fromClient.displayName})}createCreateStandingInstructionsForm(){this.createStandingInstructionsForm=this.formBuilder.group({name:["",g.required],applicant:[{value:"",disabled:!0}],transferType:["",g.required],priority:["",g.required],status:["",g.required],fromAccountType:["",g.required],fromAccountId:["",g.required],destination:["",g.required],toOfficeId:["",g.required],toClientId:["",g.required],toAccountType:["",g.required],toAccountId:["",g.required],instructionType:["",g.required],amount:["",g.required],validFrom:["",g.required],validTill:["",g.required],recurrenceType:["",g.required],recurrenceInterval:["",g.required],recurrenceFrequency:["",g.required],recurrenceOnMonthDay:["",g.required]})}setOptions(){this.transferTypeData=this.standingIntructionsTemplate.transferTypeOptions,this.priorityTypeData=this.standingIntructionsTemplate.priorityOptions,this.statusTypeData=this.standingIntructionsTemplate.statusOptions,this.fromAccountTypeData=this.standingIntructionsTemplate.fromAccountTypeOptions,this.fromAccountData=this.standingIntructionsTemplate.fromAccountOptions,this.destinationTypeData=[{id:1,value:"own account"},{id:2,value:"with in bank"}],this.toOfficeTypeData=this.standingIntructionsTemplate.toOfficeOptions,this.toClientTypeData=this.standingIntructionsTemplate.toClientOptions,this.toAccountTypeData=this.standingIntructionsTemplate.toAccountTypeOptions,this.toAccountData=this.standingIntructionsTemplate.toAccountOptions,this.instructionTypeData=this.standingIntructionsTemplate.instructionTypeOptions,this.recurrenceTypeData=this.standingIntructionsTemplate.recurrenceTypeOptions,this.recurrenceFrequencyTypeData=this.standingIntructionsTemplate.recurrenceFrequencyOptions}buildDependencies(){this.createStandingInstructionsForm.get("destination").valueChanges.subscribe(r=>{r===1?(this.allowclientedit=!1,this.createStandingInstructionsForm.patchValue({toOfficeId:this.officeId,toClientId:this.clientId}),this.ToOfficeId=!0,this.ToClientId=!0,this.changeEvent()):(this.allowclientedit=!0,this.createStandingInstructionsForm.patchValue({toOfficeId:"",toClientId:""}),this.createStandingInstructionsForm.controls.toOfficeId.enable(),this.createStandingInstructionsForm.controls.toClientId.enable())})}changeEvent(){let r=this.refineObject(this.createStandingInstructionsForm.value);this.accountTransfersService.getStandingInstructionsTemplate(this.clientId,this.officeId,this.accountTypeId,r).subscribe(d=>{this.standingIntructionsTemplate=d,this.setOptions()})}refineObject(r){let d=Object.getOwnPropertyNames(r);for(let s=0;s<d.length;s++){let x=d[s];(r[x]===null||r[x]===void 0||r[x]==="")&&delete r[x]}return r}submit(){let r=this.settingsService.dateFormat,d=this.settingsService.language.code,s=qt(Nt({},this.createStandingInstructionsForm.value),{dateFormat:r,locale:d,monthDayFormat:"dd MMMM",fromClientId:this.clientId,fromOfficeId:this.officeId,validFrom:this.dateUtils.formatDate(this.createStandingInstructionsForm.value.validFrom,r),validTill:this.dateUtils.formatDate(this.createStandingInstructionsForm.value.validTill,r),recurrenceOnMonthDay:this.dateUtils.formatDate(this.createStandingInstructionsForm.value.recurrenceOnMonthDay,"dd MMMM")});delete s.destination,delete s.applicant,this.accountTransfersService.createStandingInstructions(s).subscribe(x=>{this.router.navigate(["../../"],{relativeTo:this.route})})}static{this.\u0275fac=function(d){return new(d||i)(I(bt),I(q),I(Tt),I(D),I(z),I(ht))}}static{this.\u0275cmp=M({type:i,selectors:[["mifosx-create-standing-instructions"]],decls:296,vars:113,consts:[["validFromDatePicker",""],["validTillDatePicker",""],["recurrenceOnMonthDayDatePicker",""],[1,"container"],[3,"formGroup"],[1,"layout-row-wrap","gap-2px","responsive-column"],[1,"flex-48"],["matInput","","required","","formControlName","name"],[4,"ngIf"],["matInput","","formControlName","applicant"],["required","","formControlName","transferType",3,"selectionChange"],[3,"value",4,"ngFor","ngForOf"],["required","","formControlName","priority"],["required","","formControlName","status"],["required","","formControlName","fromAccountType",3,"selectionChange"],["required","","formControlName","fromAccountId",3,"selectionChange"],["required","","formControlName","destination"],["required","","formControlName","toOfficeId",3,"selectionChange","disabled"],["required","","formControlName","toClientId",3,"selectionChange","disabled"],["required","","formControlName","toAccountType",3,"selectionChange"],["required","","formControlName","toAccountId",3,"selectionChange"],["formControlName","instructionType"],["type","number","matInput","","required","","formControlName","amount"],[1,"flex-48",3,"click"],["matInput","","required","","formControlName","validFrom",3,"min","max","matDatepicker"],["matSuffix","",3,"for"],["matInput","","required","","formControlName","validTill",3,"min","max","matDatepicker"],["required","","formControlName","recurrenceType"],["type","number","matInput","","required","","formControlName","recurrenceInterval"],["required","","formControlName","recurrenceFrequency"],["required","","matInput","","formControlName","recurrenceOnMonthDay",3,"min","max","matDatepicker"],[1,"layout-row","align-center","gap-5px","responsive-column"],["type","button","mat-raised-button","",3,"routerLink"],["mat-raised-button","","color","primary",3,"disabled","click",4,"mifosxHasPermission"],[3,"value"],["mat-raised-button","","color","primary",3,"click","disabled"]],template:function(d,s){if(d&1){let x=A();n(0,"div",3),t(1,`
  `),n(2,"mat-card"),t(3,`
    `),n(4,"form",4),t(5,`
      `),n(6,"mat-card-content"),t(7,`
        `),n(8,"div",5),t(9,`
          `),n(10,"mat-form-field",6),t(11,`
            `),n(12,"mat-label"),t(13),o(14,"translate"),e(),t(15,`
            `),f(16,"input",7),t(17,`
            `),u(18,xn,8,9,"mat-error",8),t(19,`
          `),e(),t(20,`

          `),n(21,"mat-form-field",6),t(22,`
            `),n(23,"mat-label"),t(24),o(25,"translate"),e(),t(26,`
            `),f(27,"input",9),t(28,`
          `),e(),t(29,`

          `),n(30,"mat-form-field",6),t(31,`
            `),n(32,"mat-label"),t(33),o(34,"translate"),e(),t(35,`
            `),n(36,"mat-select",10),T("selectionChange",function(){return h(x),C(s.changeEvent())}),t(37,`
              `),u(38,_n,2,2,"mat-option",11),t(39,`
            `),e(),t(40,`
            `),u(41,vn,8,9,"mat-error",8),t(42,`
          `),e(),t(43,`

          `),n(44,"mat-form-field",6),t(45,`
            `),n(46,"mat-label"),t(47),o(48,"translate"),e(),t(49,`
            `),n(50,"mat-select",12),t(51,`
              `),u(52,gn,2,2,"mat-option",11),t(53,`
            `),e(),t(54,`
            `),u(55,In,8,9,"mat-error",8),t(56,`
          `),e(),t(57,`

          `),n(58,"mat-form-field",6),t(59,`
            `),n(60,"mat-label"),t(61),o(62,"translate"),e(),t(63,`
            `),n(64,"mat-select",13),t(65,`
              `),u(66,Sn,2,2,"mat-option",11),t(67,`
            `),e(),t(68,`
            `),u(69,Tn,8,9,"mat-error",8),t(70,`
          `),e(),t(71,`

          `),n(72,"mat-form-field",6),t(73,`
            `),n(74,"mat-label"),t(75),o(76,"translate"),e(),t(77,`
            `),n(78,"mat-select",14),T("selectionChange",function(){return h(x),C(s.changeEvent())}),t(79,`
              `),u(80,hn,2,2,"mat-option",11),t(81,`
            `),e(),t(82,`
            `),u(83,Cn,8,9,"mat-error",8),t(84,`
          `),e(),t(85,`

          `),n(86,"mat-form-field",6),t(87,`
            `),n(88,"mat-label"),t(89),o(90,"translate"),e(),t(91,`
            `),n(92,"mat-select",15),T("selectionChange",function(){return h(x),C(s.changeEvent())}),t(93,`
              `),u(94,bn,2,3,"mat-option",11),t(95,`
            `),e(),t(96,`
            `),u(97,yn,8,9,"mat-error",8),t(98,`
          `),e(),t(99,`

          `),n(100,"mat-form-field",6),t(101,`
            `),n(102,"mat-label"),t(103),o(104,"translate"),e(),t(105,`
            `),n(106,"mat-select",16),t(107,`
              `),u(108,En,2,2,"mat-option",11),t(109,`
            `),e(),t(110,`
            `),u(111,Dn,8,9,"mat-error",8),t(112,`
          `),e(),t(113,`

          `),n(114,"mat-form-field",6),t(115,`
            `),n(116,"mat-label"),t(117),o(118,"translate"),e(),t(119,`
            `),n(120,"mat-select",17),T("selectionChange",function(){return h(x),C(s.changeEvent())}),t(121,`
              `),u(122,An,2,2,"mat-option",11),t(123,`
            `),e(),t(124,`
            `),u(125,Mn,8,9,"mat-error",8),t(126,`
          `),e(),t(127,`

          `),n(128,"mat-form-field",6),t(129,`
            `),n(130,"mat-label"),t(131),o(132,"translate"),e(),t(133,`
            `),n(134,"mat-select",18),T("selectionChange",function(){return h(x),C(s.changeEvent())}),t(135,`
              `),u(136,kn,2,2,"mat-option",11),t(137,`
            `),e(),t(138,`
            `),u(139,Bn,8,9,"mat-error",8),t(140,`
          `),e(),t(141,`

          `),n(142,"mat-form-field",6),t(143,`
            `),n(144,"mat-label"),t(145),o(146,"translate"),e(),t(147,`
            `),n(148,"mat-select",19),T("selectionChange",function(){return h(x),C(s.changeEvent())}),t(149,`
              `),u(150,Fn,2,2,"mat-option",11),t(151,`
            `),e(),t(152,`
            `),u(153,wn,8,9,"mat-error",8),t(154,`
          `),e(),t(155,`

          `),n(156,"mat-form-field",6),t(157,`
            `),n(158,"mat-label"),t(159),o(160,"translate"),e(),t(161,`
            `),n(162,"mat-select",20),T("selectionChange",function(){return h(x),C(s.changeEvent())}),t(163,`
              `),u(164,On,2,3,"mat-option",11),t(165,`
            `),e(),t(166,`
            `),u(167,Pn,8,9,"mat-error",8),t(168,`
          `),e(),t(169,`

          `),n(170,"mat-form-field",6),t(171,`
            `),n(172,"mat-label"),t(173),o(174,"translate"),e(),t(175,`
            `),n(176,"mat-select",21),t(177,`
              `),u(178,Nn,2,2,"mat-option",11),t(179,`
            `),e(),t(180,`
            `),u(181,qn,8,9,"mat-error",8),t(182,`
          `),e(),t(183,`

          `),n(184,"mat-form-field",6),t(185,`
            `),n(186,"mat-label"),t(187),o(188,"translate"),e(),t(189,`
            `),f(190,"input",22),t(191,`
            `),u(192,Vn,8,9,"mat-error",8),t(193,`
          `),e(),t(194,`

          `),n(195,"mat-form-field",23),T("click",function(){h(x);let y=E(206);return C(y.open())}),t(196,`
            `),n(197,"mat-label"),t(198),o(199,"translate"),e(),t(200,`
            `),f(201,"input",24),t(202,`
            `),f(203,"mat-datepicker-toggle",25),t(204,`
            `),f(205,"mat-datepicker",null,0),t(207,`
            `),u(208,Rn,8,9,"mat-error",8),t(209,`
          `),e(),t(210,`

          `),n(211,"mat-form-field",23),T("click",function(){h(x);let y=E(222);return C(y.open())}),t(212,`
            `),n(213,"mat-label"),t(214),o(215,"translate"),e(),t(216,`
            `),f(217,"input",26),t(218,`
            `),f(219,"mat-datepicker-toggle",25),t(220,`
            `),f(221,"mat-datepicker",null,1),t(223,`
            `),u(224,Ln,8,9,"mat-error",8),t(225,`
          `),e(),t(226,`

          `),n(227,"mat-form-field",6),t(228,`
            `),n(229,"mat-label"),t(230),o(231,"translate"),e(),t(232,`
            `),n(233,"mat-select",27),t(234,`
              `),u(235,Hn,2,2,"mat-option",11),t(236,`
            `),e(),t(237,`
            `),u(238,jn,8,9,"mat-error",8),t(239,`
          `),e(),t(240,`

          `),n(241,"mat-form-field",6),t(242,`
            `),n(243,"mat-label"),t(244),o(245,"translate"),e(),t(246,`
            `),f(247,"input",28),t(248,`
            `),u(249,$n,8,9,"mat-error",8),t(250,`
          `),e(),t(251,`

          `),n(252,"mat-form-field",6),t(253,`
            `),n(254,"mat-label"),t(255),o(256,"translate"),e(),t(257,`
            `),n(258,"mat-select",29),t(259,`
              `),u(260,Un,2,2,"mat-option",11),t(261,`
            `),e(),t(262,`
            `),u(263,Gn,8,9,"mat-error",8),t(264,`
          `),e(),t(265,`

          `),n(266,"mat-form-field",23),T("click",function(){h(x);let y=E(277);return C(y.open())}),t(267,`
            `),n(268,"mat-label"),t(269),o(270,"translate"),e(),t(271,`
            `),f(272,"input",30),t(273,`
            `),f(274,"mat-datepicker-toggle",25),t(275,`
            `),f(276,"mat-datepicker",null,2),t(278,`
            `),u(279,zn,8,9,"mat-error",8),t(280,`
          `),e(),t(281,`
        `),e(),t(282,`
      `),e(),t(283,`

      `),n(284,"mat-card-actions",31),t(285,`
        `),n(286,"button",32),t(287),o(288,"translate"),e(),t(289,`
        `),u(290,Qn,3,4,"button",33),t(291,`
      `),e(),t(292,`
    `),e(),t(293,`
  `),e(),t(294,`
`),e(),t(295,`
`)}if(d&2){let x=E(206),b=E(222),y=E(277);a(4),m("formGroup",s.createStandingInstructionsForm),a(9),c(l(14,70,"labels.inputs.name")),a(5),m("ngIf",s.createStandingInstructionsForm.controls.name.hasError("required")),a(6),c(l(25,72,"labels.inputs.Applicant")),a(9),c(l(34,74,"labels.inputs.Type")),a(5),m("ngForOf",s.transferTypeData),a(3),m("ngIf",s.createStandingInstructionsForm.controls.transferType.hasError("required")),a(6),c(l(48,76,"labels.inputs.Priority")),a(5),m("ngForOf",s.priorityTypeData),a(3),m("ngIf",s.createStandingInstructionsForm.controls.priority.hasError("required")),a(6),c(l(62,78,"labels.inputs.Status")),a(5),m("ngForOf",s.statusTypeData),a(3),m("ngIf",s.createStandingInstructionsForm.controls.status.hasError("required")),a(6),c(l(76,80,"labels.inputs.From Account Type")),a(5),m("ngForOf",s.fromAccountTypeData),a(3),m("ngIf",s.createStandingInstructionsForm.controls.fromAccountType.hasError("required")),a(6),c(l(90,82,"labels.inputs.From Account")),a(5),m("ngForOf",s.fromAccountData),a(3),m("ngIf",s.createStandingInstructionsForm.controls.fromAccountId.hasError("required")),a(6),c(l(104,84,"labels.inputs.Destination")),a(5),m("ngForOf",s.destinationTypeData),a(3),m("ngIf",s.createStandingInstructionsForm.controls.destination.hasError("required")),a(6),c(l(118,86,"labels.inputs.To Office")),a(3),m("disabled",s.ToOfficeId),a(2),m("ngForOf",s.toOfficeTypeData),a(3),m("ngIf",s.createStandingInstructionsForm.controls.toOfficeId.hasError("required")),a(6),c(l(132,88,"labels.inputs.Beneficiary")),a(3),m("disabled",s.ToClientId),a(2),m("ngForOf",s.toClientTypeData),a(3),m("ngIf",s.createStandingInstructionsForm.controls.toClientId.hasError("required")),a(6),c(l(146,90,"labels.inputs.To Account Type")),a(5),m("ngForOf",s.toAccountTypeData),a(3),m("ngIf",s.createStandingInstructionsForm.controls.toAccountType.hasError("required")),a(6),c(l(160,92,"labels.inputs.To Account")),a(5),m("ngForOf",s.toAccountData),a(3),m("ngIf",s.createStandingInstructionsForm.controls.toAccountId.hasError("required")),a(6),c(l(174,94,"labels.inputs.Standing Instruction Type")),a(5),m("ngForOf",s.instructionTypeData),a(3),m("ngIf",s.createStandingInstructionsForm.controls.instructionType.hasError("required")),a(6),c(l(188,96,"labels.inputs.Amount")),a(5),m("ngIf",s.createStandingInstructionsForm.controls.amount.hasError("required")),a(6),c(l(199,98,"labels.inputs.Validity from")),a(3),m("min",s.minDate)("max",s.maxDate)("matDatepicker",x),a(2),m("for",x),a(5),m("ngIf",s.createStandingInstructionsForm.controls.validFrom.hasError("required")),a(6),c(l(215,100,"labels.inputs.Validity To")),a(3),m("min",s.minDate)("max",s.maxDate)("matDatepicker",b),a(2),m("for",b),a(5),m("ngIf",s.createStandingInstructionsForm.controls.validTill.hasError("required")),a(6),c(l(231,102,"labels.inputs.Recurrence Type")),a(5),m("ngForOf",s.recurrenceTypeData),a(3),m("ngIf",s.createStandingInstructionsForm.controls.recurrenceType.hasError("required")),a(6),c(l(245,104,"labels.inputs.Interval")),a(5),m("ngIf",s.createStandingInstructionsForm.controls.recurrenceInterval.hasError("required")),a(6),c(l(256,106,"labels.inputs.Recurrence Frequency")),a(5),m("ngForOf",s.recurrenceFrequencyTypeData),a(3),m("ngIf",s.createStandingInstructionsForm.controls.recurrenceFrequency.hasError("required")),a(6),c(l(270,108,"labels.inputs.On Month Day")),a(3),m("min",s.minDate)("max",s.maxDate)("matDatepicker",y),a(2),m("for",y),a(5),m("ngIf",s.createStandingInstructionsForm.controls.recurrenceOnMonthDay.hasError("required")),a(7),m("routerLink",L(112,fn)),a(),_(`
          `,l(288,110,"labels.buttons.Cancel"),`
        `),a(3),m("mifosxHasPermission","CREATE_STANDINGINSTRUCTION")}},dependencies:[F,tt,N,O,nt,Q,Ct,W,et,rt,it,at,G,V,$,ot,J,Y,lt,st,K,ct,mt,dt,ut,pt,j,U,w],encapsulation:2})}}return i})();var ze=i=>({balance:i}),Wn=()=>["../.."];function Yn(i,p){i&1&&(n(0,"div",6),t(1,`
    `),f(2,"div",7),t(3,`
    `),f(4,"div",8),t(5,`
    `),f(6,"div",9),t(7,`
    `),f(8,"div",10),t(9,`
  `),e())}function Jn(i,p){if(i&1){let r=A();k(0),t(1,`
            `),n(2,"button",28),T("click",function(){h(r);let s=S(4);return C(s.searchAccountByNumber())}),t(3),o(4,"translate"),e(),t(5,`
          `),B()}if(i&2){let r=S(4);a(2),m("disabled",r.phoneAccount.length!==10),a(),_(`
              `,l(4,2,"labels.buttons.Search"),`
            `)}}function Kn(i,p){i&1&&(n(0,"mat-card-actions",26),t(1,`
          `),u(2,Jn,6,4,"ng-container",27),t(3,`
        `),e()),i&2&&(a(2),m("mifosxHasPermission","CREATE_ACCOUNTTRANSFER"))}function Xn(i,p){if(i&1){let r=A();n(0,"div",12),t(1,`
        `),n(2,"div",22),t(3,`
          `),n(4,"h3",13),t(5),o(6,"translate"),e(),t(7,`
          `),n(8,"mat-form-field",23),t(9,`
            `),n(10,"mat-label"),t(11),o(12,"translate"),e(),t(13,`
            `),n(14,"input",24,0),Ce("ngModelChange",function(s){h(r);let x=S(2);return he(x.phoneAccount,s)||(x.phoneAccount=s),C(s)}),e(),t(16,`
            `),n(17,"mat-hint",25),t(18),e(),t(19,`
          `),e(),t(20,`
        `),e(),t(21,`

        `),t(22,`
        `),u(23,Kn,4,1,"mat-card-actions",21),t(24,`
      `),e()}if(i&2){let r=S(2);a(5),c(l(6,6,"labels.heading.Transferred To")),a(6),c(l(12,8,"labels.inputs.Phone Number")),a(3),m("readonly",r.interbankTransferForm),Te("ngModel",r.phoneAccount),a(4),_("",r.phoneAccount.length||0,"/10"),a(5),m("ngIf",!r.interbankTransferForm)}}function Zn(i,p){i&1&&f(0,"mat-divider")}function ti(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Transaction Date")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function ei(i,p){if(i&1&&(n(0,"mat-option",44),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.name,`
              `)}}function ni(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Office")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function ii(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Client")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function ai(i,p){if(i&1&&(n(0,"mat-option",44),t(1),e()),i&2){let r=p.$implicit;m("value",r),a(),v(`
              `,r.id," - ",r.displayName,`
            `)}}function ri(i,p){if(i&1&&(n(0,"mat-option",44),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
                `,r.value,`
              `)}}function oi(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Account Type")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function li(i,p){if(i&1&&(n(0,"mat-option",44),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),v(`
                `,r.productName," - ",r.accountNo,`
              `)}}function si(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Account")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function mi(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Amount")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function ci(i,p){if(i&1&&(n(0,"mat-error"),t(1,`
              `),f(2,"fa-icon",45),t(3),o(4,"translate"),e()),i&2){let r=S(3);a(3),_(`
              `,Bt(4,1,"errors.validation.msg.savingsproduct.insufficient.balance",Z(4,ze,r.balance)),`
            `)}}function pi(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Transfer Description")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function di(i,p){if(i&1){let r=A();n(0,"form",29),t(1,`
        `),n(2,"h3",13),t(3),o(4,"translate"),e(),t(5,`

        `),n(6,"div",30),t(7,`
          `),n(8,"mat-form-field",31),T("click",function(){h(r);let s=E(19);return C(s.open())}),t(9,`
            `),n(10,"mat-label"),t(11),o(12,"translate"),e(),t(13,`
            `),f(14,"input",32),t(15,`
            `),f(16,"mat-datepicker-toggle",33),t(17,`
            `),f(18,"mat-datepicker",null,1),t(20,`
            `),u(21,ti,8,9,"mat-error",19),t(22,`
          `),e(),t(23,`

          `),n(24,"mat-form-field",34),t(25,`
            `),n(26,"mat-label"),t(27),o(28,"translate"),e(),t(29,`
            `),n(30,"mat-select",35),T("selectionChange",function(){h(r);let s=S(2);return C(s.changeEvent())}),t(31,`
              `),u(32,ei,2,2,"mat-option",36),t(33,`
            `),e(),t(34,`
            `),u(35,ni,8,9,"mat-error",19),t(36,`
          `),e(),t(37,`

          `),n(38,"mat-form-field",34),t(39,`
            `),n(40,"mat-label"),t(41),o(42,"translate"),e(),t(43,`
            `),f(44,"input",37),t(45,`
            `),u(46,ii,8,9,"mat-error",19),t(47,`
          `),e(),t(48,`

          `),n(49,"mat-autocomplete",38,2),t(51,`
            `),u(52,ai,2,3,"mat-option",36),t(53,`
          `),e(),t(54,`

          `),n(55,"mat-form-field",34),t(56,`
            `),n(57,"mat-label"),t(58),o(59,"translate"),e(),t(60,`
            `),n(61,"mat-select",39),T("selectionChange",function(){h(r);let s=S(2);return C(s.changeEvent())}),t(62,`
              `),u(63,ri,2,2,"mat-option",36),t(64,`
            `),e(),t(65,`
            `),u(66,oi,8,9,"mat-error",19),t(67,`
          `),e(),t(68,`

          `),n(69,"mat-form-field",34),t(70,`
            `),n(71,"mat-label"),t(72),o(73,"translate"),e(),t(74,`
            `),n(75,"mat-select",40),T("selectionChange",function(){h(r);let s=S(2);return C(s.changeEvent())}),t(76,`
              `),u(77,li,2,3,"mat-option",36),t(78,`
            `),e(),t(79,`
            `),u(80,si,8,9,"mat-error",19),t(81,`
          `),e(),t(82,`

          `),n(83,"mat-form-field",34),t(84,`
            `),n(85,"mat-label"),t(86),o(87,"translate"),e(),t(88,`
            `),f(89,"input",41),t(90,`
            `),u(91,mi,8,9,"mat-error",19),t(92,`
            `),u(93,ci,5,6,"mat-error",19),t(94,`
          `),e(),t(95,`

          `),n(96,"mat-form-field",42),t(97,`
            `),n(98,"mat-label"),t(99),o(100,"translate"),e(),t(101,`
            `),f(102,"textarea",43),t(103,`
            `),u(104,pi,8,9,"mat-error",19),t(105,`
          `),e(),t(106,`
        `),e(),t(107,`
      `),e()}if(i&2){let r,d=E(19),s=E(50),x=S(2);m("formGroup",x.makeAccountTransferForm),a(3),c(l(4,27,"labels.heading.Transfer Details")),a(8),c(l(12,29,"labels.inputs.Transaction Date")),a(3),m("min",x.minDate)("max",x.maxDate)("matDatepicker",d),a(2),m("for",d),a(5),m("ngIf",x.makeAccountTransferForm.controls.transferDate.hasError("required")),a(6),c(l(28,31,"labels.inputs.Office")),a(5),m("ngForOf",x.toOfficeTypeData),a(3),m("ngIf",x.makeAccountTransferForm.controls.toOfficeId.hasError("required")),a(6),c(l(42,33,"labels.inputs.Client")),a(3),m("matAutocomplete",s),a(2),m("ngIf",x.makeAccountTransferForm.controls.toClientId.hasError("required")),a(3),m("displayWith",x.displayClient),a(3),m("ngForOf",x.clientsData),a(6),c(l(59,35,"labels.inputs.Account Type")),a(5),m("ngForOf",x.toAccountTypeData),a(3),m("ngIf",x.makeAccountTransferForm.controls.toAccountType.hasError("required")),a(6),c(l(73,37,"labels.inputs.Account")),a(5),m("ngForOf",x.toAccountData),a(3),m("ngIf",x.makeAccountTransferForm.controls.toAccountId.hasError("required")),a(6),c(l(87,39,"labels.inputs.Amount")),a(5),m("ngIf",x.makeAccountTransferForm.controls.transferAmount.hasError("required")),a(2),m("ngIf",(r=x.makeAccountTransferForm.get("transferAmount"))==null?null:r.hasError("amountExceedsBalance")),a(6),c(l(100,41,"labels.inputs.Description")),a(5),m("ngIf",x.makeAccountTransferForm.controls.transferDescription.hasError("required"))}}function ui(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Transaction Date")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function fi(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Amount")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function xi(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),e()),i&2&&(a(),v(`
              `,l(2,2,"labels.inputs.Amount")," ",l(3,4,"labels.commons.mustBeAtLeast"),` 0.01
            `))}function _i(i,p){if(i&1&&(n(0,"mat-error"),t(1,`
              `),f(2,"fa-icon",45),t(3),o(4,"translate"),e()),i&2){let r=S(3);a(3),_(`
              `,Bt(4,1,"errors.validation.msg.savingsproduct.insufficient.balance",Z(4,ze,r.balance)),`
            `)}}function vi(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
            `),e()),i&2&&(a(),v(`
              `,l(2,3,"labels.inputs.Transfer Description")," ",l(3,5,"labels.commons.is"),`
              `),a(4),c(l(6,7,"labels.commons.required")))}function gi(i,p){if(i&1){let r=A();n(0,"form",29),t(1,`
        `),n(2,"h3",13),t(3),o(4,"translate"),e(),t(5,`

        `),n(6,"div",30),t(7,`
          `),n(8,"mat-form-field",31),T("click",function(){h(r);let s=E(19);return C(s.open())}),t(9,`
            `),n(10,"mat-label"),t(11),o(12,"translate"),e(),t(13,`
            `),f(14,"input",32),t(15,`
            `),f(16,"mat-datepicker-toggle",33),t(17,`
            `),f(18,"mat-datepicker",null,1),t(20,`
            `),u(21,ui,8,9,"mat-error",19),t(22,`
          `),e(),t(23,`

          `),n(24,"mat-form-field",34),t(25,`
            `),n(26,"mat-label"),t(27),o(28,"translate"),e(),t(29,`
            `),f(30,"input",46),t(31,`
          `),e(),t(32,`

          `),n(33,"mat-form-field",34),t(34,`
            `),n(35,"mat-label"),t(36),o(37,"translate"),e(),t(38,`
            `),f(39,"input",47),t(40,`
          `),e(),t(41,`

          `),n(42,"mat-form-field",34),t(43,`
            `),n(44,"mat-label"),t(45),o(46,"translate"),e(),t(47,`
            `),f(48,"input",48),t(49,`
          `),e(),t(50,`

          `),n(51,"mat-form-field",34),t(52,`
            `),n(53,"mat-label"),t(54),o(55,"translate"),e(),t(56,`
            `),f(57,"input",49),t(58,`
          `),e(),t(59,`

          `),n(60,"mat-form-field",34),t(61,`
            `),n(62,"mat-label"),t(63),o(64,"translate"),e(),t(65,`
            `),f(66,"input",41),t(67,`
            `),u(68,fi,8,9,"mat-error",19),t(69,`
            `),u(70,xi,4,6,"mat-error",19),t(71,`
            `),u(72,_i,5,6,"mat-error",19),t(73,`
          `),e(),t(74,`

          `),n(75,"mat-form-field",42),t(76,`
            `),n(77,"mat-label"),t(78),o(79,"translate"),e(),t(80,`
            `),f(81,"textarea",43),t(82,`
            `),u(83,vi,8,9,"mat-error",19),t(84,`
          `),e(),t(85,`
        `),e(),t(86,`
      `),e()}if(i&2){let r,d=E(19),s=S(2);m("formGroup",s.makeAccountTransferForm),a(3),c(l(4,22,"labels.heading.Transfer Details")),a(8),c(l(12,24,"labels.inputs.Transaction Date")),a(3),m("min",s.minDate)("max",s.maxDate)("matDatepicker",d),a(2),m("for",d),a(5),m("ngIf",s.makeAccountTransferForm.controls.transferDate.hasError("required")),a(6),c(l(28,26,"labels.inputs.Bank")),a(3),m("readonly",!0),a(6),c(l(37,28,"labels.inputs.Client")),a(3),m("readonly",!0),a(6),c(l(46,30,"labels.inputs.Account Type")),a(3),m("readonly",!0),a(6),c(l(55,32,"labels.inputs.Account")),a(3),m("readonly",!0),a(6),c(l(64,34,"labels.inputs.Amount")),a(5),m("ngIf",s.makeAccountTransferForm.controls.transferAmount.hasError("required")),a(2),m("ngIf",s.makeAccountTransferForm.controls.transferAmount.hasError("min")),a(2),m("ngIf",(r=s.makeAccountTransferForm.get("transferAmount"))==null?null:r.hasError("amountExceedsBalance")),a(6),c(l(79,36,"labels.inputs.Description")),a(5),m("ngIf",s.makeAccountTransferForm.controls.transferDescription.hasError("required"))}}function Ii(i,p){if(i&1){let r=A();n(0,"button",52),T("click",function(){h(r);let s=S(4);return C(s.submit())}),t(1),o(2,"translate"),e()}if(i&2){let r=S(4);m("disabled",!r.makeAccountTransferForm.valid),a(),_(`
          `,l(2,2,"labels.buttons.Submit"),`
        `)}}function Si(i,p){if(i&1){let r=A();n(0,"button",52),T("click",function(){h(r);let s=S(4);return C(s.submit())}),t(1),o(2,"translate"),e()}if(i&2){let r=S(4);m("disabled",!r.makeAccountTransferForm.valid),a(),_(`
          `,l(2,2,"labels.buttons.Submit"),`
        `)}}function Ti(i,p){if(i&1&&(k(0),t(1,`
        `),u(2,Ii,3,4,"button",51),t(3,`

        `),u(4,Si,3,4,"button",51),t(5,`
      `),B()),i&2){let r=S(3);a(2),m("ngIf",r.interbank&&r.interbankTransferForm),a(2),m("ngIf",!r.interbank)}}function hi(i,p){i&1&&(n(0,"mat-card-actions",26),t(1,`
      `),n(2,"button",50),t(3),o(4,"translate"),e(),t(5,`

      `),u(6,Ti,6,2,"ng-container",27),t(7,`
    `),e()),i&2&&(a(2),m("routerLink",L(5,Wn)),a(),_(`
        `,l(4,3,"labels.buttons.Cancel"),`
      `),a(3),m("mifosxHasPermission","CREATE_ACCOUNTTRANSFER"))}function Ci(i,p){if(i&1&&(n(0,"mat-card",11),t(1,`
    `),n(2,"mat-card-content"),t(3,`
      `),t(4,`
      `),n(5,"div",12),t(6,`
        `),n(7,"h3",13),t(8),o(9,"translate"),e(),t(10,`

        `),f(11,"mat-divider"),t(12,`

        `),n(13,"div",14),t(14,`
          `),n(15,"div",15),t(16,`
            `),n(17,"div",16),t(18),o(19,"translate"),e(),t(20,`
            `),n(21,"div",17),t(22),e(),t(23,`
          `),e(),t(24,`

          `),n(25,"div",15),t(26,`
            `),n(27,"div",16),t(28),o(29,"translate"),e(),t(30,`
            `),n(31,"div",17),t(32),e(),t(33,`
          `),e(),t(34,`

          `),n(35,"div",15),t(36,`
            `),n(37,"div",16),t(38),o(39,"translate"),e(),t(40,`
            `),n(41,"div",17),t(42),e(),t(43,`
          `),e(),t(44,`

          `),n(45,"div",15),t(46,`
            `),n(47,"div",16),t(48),o(49,"translate"),e(),t(50,`
            `),n(51,"div",17),t(52),e(),t(53,`
          `),e(),t(54,`

          `),n(55,"div",15),t(56,`
            `),n(57,"div",16),t(58),o(59,"translate"),e(),t(60,`
            `),n(61,"div",17),t(62),e(),t(63,`
          `),e(),t(64,`
        `),e(),t(65,`
      `),e(),t(66,`

      `),t(67,`
      `),u(68,Xn,25,10,"div",18),t(69,`

      `),u(70,Zn,1,0,"mat-divider",19),t(71,`

      `),t(72,`
      `),u(73,di,108,43,"form",20),t(74,`

      `),t(75,`
      `),u(76,gi,87,38,"form",20),t(77,`
    `),e(),t(78,`

    `),u(79,hi,8,6,"mat-card-actions",21),t(80,`
  `),e()),i&2){let r=S();a(8),c(l(9,17,"labels.heading.Transferring From Details")),a(10),c(l(19,19,"labels.inputs.Applicant")),a(4),c(r.accountTransferTemplateData.fromClient.displayName),a(6),c(l(29,21,"labels.inputs.Office")),a(4),c(r.accountTransferTemplateData.fromOffice.name),a(6),c(l(39,23,"labels.inputs.From Account")),a(4),v(`
              `,r.accountTransferTemplateData.fromAccount.productName,"\xA0-\xA0#",r.accountTransferTemplateData.fromAccount.accountNo,`
            `),a(6),c(l(49,25,"labels.inputs.From Account Type")),a(4),c(r.accountTransferTemplateData.fromAccountType.value),a(6),c(l(59,27,"labels.inputs.Currency")),a(4),c(r.accountTransferTemplateData.currency.name),a(6),m("ngIf",r.interbank),a(2),m("ngIf",!r.interbank),a(3),m("ngIf",!r.interbank&&r.makeAccountTransferForm),a(3),m("ngIf",r.interbank&&r.interbankTransferForm&&r.makeAccountTransferForm),a(3),m("ngIf",!r.isLoading&&r.makeAccountTransferForm)}}var ae=(()=>{class i{constructor(r,d,s,x,b,y,St){this.formBuilder=r,this.route=d,this.router=s,this.accountTransfersService=x,this.dateUtils=b,this.settingsService=y,this.clientsService=St,this.minDate=new Date(2e3,0,1),this.maxDate=new Date(2100,0,1),this.interbank=!1,this.phoneAccount="",this.interbankTransferForm=!1,this.balance=0,this.isLoading=!1,this.route.data.subscribe(Ye=>{this.accountTransferTemplateData=Ye.accountTransferTemplate,this.setParams(),this.setOptions()})}setParams(){switch(this.accountType=this.route.snapshot.queryParams.accountType,this.accountType){case"fromloans":this.accountTypeId="1",this.id=this.route.snapshot.queryParams.loanId;break;case"fromsavings":case"interbank":this.accountTypeId="2",this.id=this.route.snapshot.queryParams.savingsId,this.interbank=this.route.snapshot.queryParams.interbank==="true";let r=this.router.getCurrentNavigation()?.extras?.state?.balance,d=this.accountTransferTemplateData?.fromAccount?.availableBalance??this.accountTransferTemplateData?.fromAccount?.summary?.accountBalance??this.accountTransferTemplateData?.fromAccount?.balance??0;this.balance=typeof r=="number"?r:d;break;default:this.accountTypeId="0"}}ngOnInit(){this.maxDate=this.settingsService.businessDate,this.interbank?this.createEmptyInterbankForm():this.createMakeAccountTransferForm()}createEmptyInterbankForm(){this.makeAccountTransferForm=this.formBuilder.group({toBank:["",g.required],toClientId:["",g.required],toAccountType:["",g.required],toAccountId:["",g.required],transferAmount:[0,[g.required,g.min(.01),this.amountExceedsBalanceValidator.bind(this)]],transferDate:[this.settingsService.businessDate,g.required],transferDescription:["",g.required]})}createMakeAccountTransferForm(){this.makeAccountTransferForm=this.formBuilder.group({toOfficeId:["",g.required],toClientId:["",g.required],toAccountType:["",g.required],toAccountId:["",g.required],transferAmount:[this.accountTransferTemplateData.transferAmount,[g.required,g.min(.01),this.amountExceedsBalanceValidator.bind(this)]],transferDate:[this.settingsService.businessDate,g.required],transferDescription:["",g.required]})}createMakeAccountInterbankTransferForm(r){if(!r){console.error("Account data is undefined"),this.isLoading=!1;return}let d=this.accountTransferTemplateData?.transferAmount>0?this.accountTransferTemplateData.transferAmount:1;this.makeAccountTransferForm=this.formBuilder.group({toBank:[r.destinationFspId||"",g.required],toClientId:[(r.firstName||r.firsName||"")+" "+(r.lastName||""),g.required],toAccountType:["Saving Account",g.required],toAccountId:[r.partyId||"",g.required],transferAmount:[d,[g.required,g.min(.01),this.amountExceedsBalanceValidator.bind(this)]],transferDate:[this.settingsService.businessDate,g.required],transferDescription:["Transferencia interbancaria",g.required]}),this.isLoading=!1}amountExceedsBalanceValidator(r){return r.value>this.balance?{amountExceedsBalance:!0}:null}setOptions(){this.toOfficeTypeData=this.accountTransferTemplateData.toOfficeOptions,this.toAccountTypeData=this.accountTransferTemplateData.toAccountTypeOptions,this.toAccountData=this.accountTransferTemplateData.toAccountOptions}changeEvent(){let r=this.refineObject(this.makeAccountTransferForm.value);this.accountTransfersService.newAccountTranferResource(this.id,this.accountTypeId,r).subscribe(d=>{this.accountTransferTemplateData=d,this.toClientTypeData=d.toClientOptions,this.setOptions()})}refineObject(r){delete r.transferAmount,delete r.transferDate,delete r.transferDescription,r.toClientId&&typeof r.toClientId=="object"&&(r.toClientId=r.toClientId.id);let d=Object.getOwnPropertyNames(r);for(let s=0;s<d.length;s++){let x=d[s];(r[x]===null||r[x]===void 0||r[x]==="")&&delete r[x]}return r}ngAfterViewInit(){!this.interbank&&this.makeAccountTransferForm&&this.makeAccountTransferForm.controls.toClientId.valueChanges.subscribe(r=>{typeof r=="string"&&r.length>=2&&(this.clientsService.getFilteredClients("displayName","ASC",!0,r).subscribe(d=>{this.clientsData=d.pageItems}),this.changeEvent())})}displayClient(r){return r?r.displayName:void 0}submit(){this.interbank?this.makeInterbankTransfer():this.makeTransfer()}makeTransfer(){this.isLoading=!0;let r=this.settingsService.dateFormat,d=this.settingsService.language.code,s;typeof this.makeAccountTransferForm.controls.toClientId.value=="object"?s=this.makeAccountTransferForm.controls.toClientId.value.id:s=this.makeAccountTransferForm.controls.toClientId.value;let x=qt(Nt({},this.makeAccountTransferForm.value),{transferDate:this.dateUtils.formatDate(this.makeAccountTransferForm.value.transferDate,r),dateFormat:r,locale:d,toClientId:s,fromAccountId:this.id,fromAccountType:this.accountTypeId,fromClientId:this.accountTransferTemplateData.fromClient.id,fromOfficeId:this.accountTransferTemplateData.fromClient.officeId});this.accountTransfersService.createAccountTransfer(x).subscribe(()=>{this.isLoading=!1,this.router.navigate(["../../transactions"],{relativeTo:this.route})})}makeInterbankTransfer(){if(this.isLoading=!0,!this.makeAccountTransferForm.valid){console.error("Interbank form is not valid"),this.isLoading=!1;return}let r={homeTransactionId:crypto.randomUUID(),from:{fspId:Ae.fineractPlatformTenantId,idType:"MSISDN",idValue:this.accountTransferTemplateData.fromAccount.externalId?.trim()||""},to:{fspId:this.makeAccountTransferForm.controls.toBank.value,idType:"MSISDN",idValue:this.makeAccountTransferForm.controls.toAccountId.value},amountType:"SEND",amount:{currencyCode:this.accountTransferTemplateData.currency.code,amount:this.makeAccountTransferForm.controls.transferAmount.value},transactionType:{scenario:"TRANSFER",subScenario:"DOMESTIC",initiator:"PAYER",initiatorType:"CUSTOMER"},note:this.makeAccountTransferForm.controls.transferDescription.value};this.accountTransfersService.sendInterbankTransfer(JSON.stringify(r)).subscribe(d=>{d.systemMessage&&(this.isLoading=!1,this.router.navigate(["../../transactions"],{relativeTo:this.route}))},d=>{console.error("Interbank transfer error:",d),this.isLoading=!1})}searchAccountByNumber(){!this.phoneAccount||this.phoneAccount.length!==10||(this.isLoading=!0,this.accountTransfersService.getAccountByNumber(this.phoneAccount,this.accountTransferTemplateData.currency.code).subscribe(r=>{this.interbankTransferForm=!0,this.createMakeAccountInterbankTransferForm(r)},r=>{console.error("searching account error:",r),this.isLoading=!1}))}static{this.\u0275fac=function(d){return new(d||i)(I(bt),I(q),I(Tt),I(D),I(ht),I(z),I(je))}}static{this.\u0275cmp=M({type:i,selectors:[["mifosx-make-account-transfers"]],decls:7,vars:2,consts:[["input",""],["transferDatePicker",""],["clientsAutocomplete","matAutocomplete"],[1,"container"],["class","loader-wrapper",4,"ngIf"],["class","transfer-card",4,"ngIf"],[1,"loader-wrapper"],[1,"bottom","triangle"],[1,"top","triangle"],[1,"left","triangle"],[1,"right","triangle"],[1,"transfer-card"],[1,"section-container"],[1,"section-title","transfer-heading"],[1,"info-grid"],[1,"info-row"],[1,"info-label"],[1,"info-value"],["class","section-container",4,"ngIf"],[4,"ngIf"],["class","transfer-form",3,"formGroup",4,"ngIf"],["class","action-buttons",4,"ngIf"],[1,"interbank-section"],[1,"full-width"],["matInput","","type","tel","maxlength","10","required","","placeholder","Enter phone number","title","Phone number",3,"ngModelChange","readonly","ngModel"],["align","end"],[1,"action-buttons"],[4,"mifosxHasPermission"],["mat-raised-button","","color","primary","id","search-button",1,"primary-button",3,"click","disabled"],[1,"transfer-form",3,"formGroup"],[1,"form-grid"],[1,"form-field",3,"click"],["matInput","","required","","formControlName","transferDate","placeholder","Select date","title","Transaction Date",3,"min","max","matDatepicker"],["matSuffix","",3,"for"],[1,"form-field"],["required","","formControlName","toOfficeId",3,"selectionChange"],[3,"value",4,"ngFor","ngForOf"],["matInput","","formControlName","toClientId","placeholder","Select or type client name","title","Client name",3,"matAutocomplete"],["autoActiveFirstOption","",3,"displayWith"],["required","","formControlName","toAccountType",3,"selectionChange"],["required","","formControlName","toAccountId",3,"selectionChange"],["type","number","matInput","","required","","formControlName","transferAmount","placeholder","Enter amount","title","Transfer amount","min","0.01","step","0.01"],[1,"form-field","description-field"],["matInput","","formControlName","transferDescription","cdkTextareaAutosize","","cdkAutosizeMinRows","2","placeholder","Enter transfer description","title","Transfer description"],[3,"value"],["icon","exclamation-triangle","size","md"],["matInput","","formControlName","toBank","placeholder","Bank","title","Bank",3,"readonly"],["matInput","","formControlName","toClientId","placeholder","Client","title","Client",3,"readonly"],["matInput","","formControlName","toAccountType","placeholder","Account Type","title","Account Type",3,"readonly"],["matInput","","formControlName","toAccountId","placeholder","Account","title","Account",3,"readonly"],["type","button","mat-raised-button","",1,"cancel-button",3,"routerLink"],["mat-raised-button","","color","primary","class","primary-button",3,"disabled","click",4,"ngIf"],["mat-raised-button","","color","primary",1,"primary-button",3,"click","disabled"]],template:function(d,s){d&1&&(n(0,"div",3),t(1,`
  `),u(2,Yn,10,0,"div",4),t(3,`

  `),u(4,Ci,81,29,"mat-card",5),t(5,`
`),e(),t(6,`
`)),d&2&&(a(2),m("ngIf",s.isLoading),a(2),m("ngIf",!s.isLoading))},dependencies:[F,tt,N,O,nt,Q,Ct,W,et,rt,Fe,Be,it,at,G,V,$,ot,J,Y,lt,st,Oe,K,ct,mt,dt,ut,pt,j,U,w,_t,we,Me,Ve,qe,xt,Ht],styles:[".container[_ngcontent-%COMP%]{max-width:42rem;margin:0 auto;padding:1rem}.transfer-card[_ngcontent-%COMP%]{border-radius:8px;box-shadow:0 2px 10px #00000014;margin-bottom:1.5rem;overflow:hidden}.section-container[_ngcontent-%COMP%]{margin-bottom:2rem}.section-title[_ngcontent-%COMP%]{font-size:1.25rem;font-weight:600;color:#333;margin:0 0 1rem;padding-bottom:.5rem;border-bottom:1px solid rgba(0,0,0,.12)}.section-title.transfer-heading[_ngcontent-%COMP%]{font-weight:700}.info-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:100%;gap:.75rem}@media (width >= 768px){.info-grid[_ngcontent-%COMP%]{grid-template-columns:repeat(2,50%)}}.info-row[_ngcontent-%COMP%]{display:flex;align-items:center;padding:.5rem;background-color:#00000005;border-radius:4px}.info-row[_ngcontent-%COMP%]:hover{background-color:#0000000a}.info-label[_ngcontent-%COMP%]{flex:0 0 40%;color:#000000b3;font-weight:500}.info-value[_ngcontent-%COMP%]{flex:1;color:#000000de}mat-divider[_ngcontent-%COMP%]{margin:1rem 0}.interbank-section[_ngcontent-%COMP%]{margin-bottom:1rem}.transfer-form[_ngcontent-%COMP%]{margin-top:1rem}.form-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:100%;gap:1rem}@media (width >= 768px){.form-grid[_ngcontent-%COMP%]{grid-template-columns:repeat(2,1fr);gap:1.5rem}}.form-row[_ngcontent-%COMP%]{display:contents}.form-field[_ngcontent-%COMP%]{width:100%;margin-bottom:.5rem}@media (width >= 768px){.form-field[_ngcontent-%COMP%]:nth-child(odd){margin-right:.5rem}}@media (width >= 768px){.form-field[_ngcontent-%COMP%]:nth-child(2n){margin-left:.5rem}}.form-field.description-field[_ngcontent-%COMP%]{grid-column:1/-1}.form-field.description-field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]{min-height:80px;resize:vertical}  .mat-form-field{width:100%}.action-buttons[_ngcontent-%COMP%]{display:flex;justify-content:flex-end;gap:1rem;padding:1rem 1.5rem;margin-top:1rem}@media (width <= 576px){.action-buttons[_ngcontent-%COMP%]{flex-direction:column}}.action-buttons[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{min-width:120px}@media (width <= 576px){.action-buttons[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{width:100%;margin-bottom:.5rem}}.action-buttons[_ngcontent-%COMP%]   .cancel-button[_ngcontent-%COMP%]{background-color:#f5f5f5;color:#000000de;box-shadow:0 1px 3px #0000001f}.action-buttons[_ngcontent-%COMP%]   .cancel-button[_ngcontent-%COMP%]:hover{background-color:#e0e0e0;box-shadow:0 2px 5px #0000002e}.action-buttons[_ngcontent-%COMP%]   .primary-button[_ngcontent-%COMP%]{background-color:#f5f5f5;color:#000000de;font-weight:400;border:none;box-shadow:none}.action-buttons[_ngcontent-%COMP%]   .primary-button[_ngcontent-%COMP%]:hover{background-color:#e0e0e0;box-shadow:0 2px 5px #0000002e}.loader-wrapper[_ngcontent-%COMP%]{display:flex;justify-content:center;align-items:center;height:300px;position:relative}@keyframes _ngcontent-%COMP%_rotate-triangle{0%{transform:rotate(0)}to{transform:rotate(360deg)}}.triangle[_ngcontent-%COMP%]{position:absolute;width:0;height:0;border-left:20px solid transparent;border-right:20px solid transparent;border-bottom:34px solid rgba(0,0,0,.05);animation:_ngcontent-%COMP%_rotate-triangle 1.5s infinite linear}.triangle[_ngcontent-%COMP%]:hover{border-bottom-color:#00000014}.dark-theme[_ngcontent-%COMP%]   .info-label[_ngcontent-%COMP%]{color:#ffffffb3}.dark-theme[_ngcontent-%COMP%]   .info-value[_ngcontent-%COMP%]{color:#ffffffde}.dark-theme[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]{color:#fff;border-bottom-color:#ffffff1f}.dark-theme[_ngcontent-%COMP%]   .transfer-heading[_ngcontent-%COMP%]{color:#fff;font-weight:700}.dark-theme[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%]   .cancel-button[_ngcontent-%COMP%]{background-color:#424242;color:#ffffffde}.dark-theme[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%]   .cancel-button[_ngcontent-%COMP%]:hover{background-color:#505050}.dark-theme[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%]   .primary-button[_ngcontent-%COMP%]{background-color:#424242;color:#ffffffde;font-weight:400;border:none;box-shadow:none}.dark-theme[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%]   .primary-button[_ngcontent-%COMP%]:hover{background-color:#505050}.dark-theme[_nghost-%COMP%]   .transfer-heading[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .transfer-heading[_ngcontent-%COMP%]{color:#fff;font-weight:700}.dark-theme[_nghost-%COMP%]   .action-buttons[_ngcontent-%COMP%]   .cancel-button[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .action-buttons[_ngcontent-%COMP%]   .cancel-button[_ngcontent-%COMP%]{background-color:#424242;color:#ffffffde}.dark-theme[_nghost-%COMP%]   .action-buttons[_ngcontent-%COMP%]   .primary-button[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .action-buttons[_ngcontent-%COMP%]   .primary-button[_ngcontent-%COMP%]{background-color:#424242;color:#ffffffde;font-weight:400;border:none;box-shadow:none}body.dark-theme[_ngcontent-%COMP%]   .container[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]{color:#fff}body.dark-theme[_ngcontent-%COMP%]   .container[_ngcontent-%COMP%]   .transfer-heading[_ngcontent-%COMP%]{color:#fff;font-weight:700}body.dark-theme[_ngcontent-%COMP%]   .container[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%]   .cancel-button[_ngcontent-%COMP%]{background-color:#424242;color:#ffffffde}body.dark-theme[_ngcontent-%COMP%]   .container[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%]   .primary-button[_ngcontent-%COMP%]{background-color:#424242;color:#ffffffde;font-weight:400;border:none;box-shadow:none}  mat-form-field.error-warn.mat-form-field-invalid .mat-form-field-ripple{background-color:#000000de!important}  mat-form-field.error-warn.mat-form-field-invalid .mat-form-field-label{color:#0009!important}  mat-form-field.error-warn.mat-form-field-invalid .mat-form-field-label .mat-form-field-required-marker{color:#0009!important}  mat-form-field.error-warn.mat-form-field-invalid .mat-error{color:#0009!important}  .mat-form-field-flex{align-items:center}.transfer-form[_ngcontent-%COMP%]   .form-field[_ngcontent-%COMP%]{margin-bottom:1rem}.readonly-field[_ngcontent-%COMP%]{background-color:#00000005;cursor:not-allowed}  .mat-input-element{font-size:14px}"]})}}return i})();var bi=["instructionsTable"],yi=()=>[10,25,50,100],Ei=i=>["../",i,"edit"],Di=i=>["../",i,"view"];function Ai(i,p){if(i&1&&(n(0,"div",24),t(1,`
      `),n(2,"span",25),t(3,`
        `),n(4,"h3",26),t(5),o(6,"translate"),e(),t(7,`
      `),e(),t(8,`
      `),n(9,"span",27),t(10,`
        `),n(11,"h3",26),t(12),e(),t(13,`
      `),e(),t(14,`
    `),e()),i&2){let r=S();a(5),c(l(6,2,"labels.heading.Client Type")),a(7),c(r.clientName)}}function Mi(i,p){if(i&1&&(n(0,"div",24),t(1,`
      `),n(2,"mat-form-field",28),t(3,`
        `),f(4,"input",29),t(5,`
      `),e(),t(6,`
      `),n(7,"mat-form-field",28),t(8,`
        `),f(9,"input",30),t(10,`
      `),e(),t(11,`
    `),e()),i&2){let r=S();a(4),m("formControl",r.clientNameControl),a(5),m("formControl",r.fromClientId)}}function ki(i,p){if(i&1&&(n(0,"mat-option",31),t(1),e()),i&2){let r=p.$implicit;m("value",r.id),a(),_(`
          `,r.value,`
        `)}}function Bi(i,p){if(i&1){let r=A();n(0,"button",32),T("click",function(){h(r);let s=S();return C(s.filterStandingInstructions())}),t(1),o(2,"translate"),o(3,"titlecase"),e()}i&2&&(a(),_(`
      `,l(3,3,l(2,1,"labels.buttons.Filter")),`
    `))}function Fi(i,p){i&1&&(n(0,"th",33),t(1),o(2,"translate"),e()),i&2&&(a(),c(l(2,1,"labels.inputs.Client")))}function wi(i,p){if(i&1&&(n(0,"td",34),t(1),e()),i&2){let r=p.$implicit;a(),v(`
        `,r.fromClient.displayName,"-",r.fromClient.id,`
      `)}}function Oi(i,p){i&1&&(n(0,"th",33),t(1),o(2,"translate"),e()),i&2&&(a(),c(l(2,1,"labels.inputs.From Account")))}function Pi(i,p){if(i&1&&(n(0,"td",34),t(1),e()),i&2){let r=p.$implicit;a(),v(`
        `,r.fromAccount.accountNo," (",r.fromAccountType.value,`)
      `)}}function Ni(i,p){i&1&&(n(0,"th",33),t(1),o(2,"translate"),e()),i&2&&(a(),c(l(2,1,"labels.inputs.Beneficiary")))}function qi(i,p){if(i&1&&(n(0,"td",34),t(1),e()),i&2){let r=p.$implicit;a(),c(r.toClient.displayName)}}function Vi(i,p){i&1&&(n(0,"th",33),t(1),o(2,"translate"),e()),i&2&&(a(),c(l(2,1,"labels.inputs.To Account")))}function Ri(i,p){if(i&1&&(n(0,"td",34),t(1),e()),i&2){let r=p.$implicit;a(),v(`
        `,r.toAccount.accountNo," (",r.toAccountType.value,`)
      `)}}function Li(i,p){i&1&&(n(0,"th",33),t(1),o(2,"translate"),e()),i&2&&(a(),c(l(2,1,"labels.inputs.Amount")))}function Hi(i,p){if(i&1&&(n(0,"td",34),t(1),e()),i&2){let r=p.$implicit;a(),v("",r.instructionType.value,"/",r.amount,"")}}function ji(i,p){i&1&&(n(0,"th",33),t(1),o(2,"translate"),e()),i&2&&(a(),c(l(2,1,"labels.inputs.Validity")))}function $i(i,p){if(i&1&&(n(0,"td",34),t(1),o(2,"dateFormat"),o(3,"dateFormat"),e()),i&2){let r=p.$implicit;a(),v(`
        `,l(2,2,r.validFrom)," to ",l(3,4,r.validTill),`
      `)}}function Ui(i,p){i&1&&(n(0,"th",33),t(1),o(2,"translate"),e()),i&2&&(a(),c(l(2,1,"labels.inputs.Actions")))}function Gi(i,p){if(i&1&&(n(0,"button",37),o(1,"translate"),t(2,`
            `),f(3,"i",38),t(4,`
          `),e()),i&2){let r=S(2).$implicit;Lt("matTooltip",l(1,2,"tooltips.Edit Standing Instruction")),m("routerLink",Z(4,Ei,r.id))}}function zi(i,p){i&1&&(n(0,"span"),t(1,`
          `),u(2,Gi,5,6,"button",36),t(3,`
        `),e()),i&2&&(a(2),m("mifosxHasPermission","UPDATE_STANDINGINSTRUCTION"))}function Qi(i,p){if(i&1){let r=A();n(0,"button",40),o(1,"translate"),T("click",function(){h(r);let s=S(2).$implicit,x=S();return C(x.deleteStandingInstruction(s.id))}),t(2,`
            `),f(3,"i",41),t(4,`
          `),e()}i&2&&Lt("matTooltip",l(1,1,"tooltips.Delete Standing Instruction"))}function Wi(i,p){i&1&&(n(0,"span"),t(1,`
          `),u(2,Qi,5,3,"button",39),t(3,`
        `),e()),i&2&&(a(2),m("mifosxHasPermission","DELETE_STANDINGINSTRUCTION"))}function Yi(i,p){if(i&1&&(n(0,"button",37),o(1,"translate"),t(2,`
          `),f(3,"i",42),t(4,`
        `),e()),i&2){let r=S().$implicit;Lt("matTooltip",l(1,2,"tooltips.View Standing Instruction")),m("routerLink",Z(4,Di,r.id))}}function Ji(i,p){if(i&1&&(n(0,"td",34),t(1,`
        `),u(2,zi,4,1,"span",35),t(3,`
        `),u(4,Wi,4,1,"span",35),t(5,`
        `),u(6,Yi,5,6,"button",36),t(7,`
      `),e()),i&2){let r=p.$implicit;a(2),m("ngIf",r.status.value!=="Deleted"),a(2),m("ngIf",r.status.value!=="Deleted"),a(2),m("mifosxHasPermission","READ_STANDINGINSTRUCTION")}}function Ki(i,p){i&1&&f(0,"tr",43)}function Xi(i,p){i&1&&f(0,"tr",44)}var re=(()=>{class i{constructor(r,d,s,x){this.route=r,this.accountTransfersService=d,this.settingsService=s,this.dialog=x,this.transferType=new Ft,this.fromAccountId=new Ft,this.clientNameControl=new Ft,this.fromClientId=new Ft,this.dataSource=new wt,this.displayedColumns=["client","fromAccount","beneficiary","toAccount","amount","validity","actions"],this.route.data.subscribe(b=>{this.standingIntructionsTemplateData=b.standingIntructionsTemplate,b.standingIntructionsTemplate.fromClient&&(this.clientName=this.standingIntructionsTemplateData.fromClient.displayName,this.getStandingInstructions()),this.setParams(),this.transferTypeDatas=this.standingIntructionsTemplateData.transferTypeOptions})}setParams(){switch(this.accountType=this.route.snapshot.queryParams.accountType,this.accountType){case"fromloans":this.accountTypeId="1";break;case"fromsavings":this.accountTypeId="2";break;default:this.accountTypeId="0"}this.isFromClient=!!this.route.parent.parent.snapshot.params.clientId}filterStandingInstructions(){this.getStandingInstructions()}getStandingInstructions(){let r=this.settingsService.dateFormat,d=this.settingsService.language.code,s={clientId:this.standingIntructionsTemplateData.fromClient.id||this.fromClientId.value,clientName:this.standingIntructionsTemplateData.fromClient.displayName||this.clientNameControl.value,locale:d,dateFormat:r,limit:14,offset:0,fromAccountType:this.accountTypeId,fromAccountId:this.fromAccountId.value,fromTransferType:this.transferType.value};this.accountTransfersService.getStandingInstructions(s).subscribe(x=>{this.instructionsData=x.pageItems,this.dataSource.data=this.instructionsData,this.instructionTableRef.renderRows()})}deleteStandingInstruction(r){this.dialog.open(Pe,{data:{deleteContext:`standing instruction id: ${r}`}}).afterClosed().subscribe(s=>{s.delete&&this.accountTransfersService.deleteStandingInstrucions(r).subscribe(()=>{})})}static{this.\u0275fac=function(d){return new(d||i)(I(q),I(D),I(z),I(De))}}static{this.\u0275cmp=M({type:i,selectors:[["mifosx-list-standing-instructions"]],viewQuery:function(d,s){if(d&1&&(At(bi,7),At(yt,7)),d&2){let x;Mt(x=kt())&&(s.instructionTableRef=x.first),Mt(x=kt())&&(s.paginator=x.first)}},decls:91,vars:16,consts:[["instructionsTable",""],[1,"container"],[1,"layout-row-wrap","gap-2px","responsive-column"],["class","flex-fill",4,"ngIf"],[3,"inset"],[1,"type-field"],[3,"formControl"],[3,"value",4,"ngFor","ngForOf"],[1,"account-Id-field"],["matInput","","placeholder","From Account Id",3,"formControl"],["mat-raised-button","","color","primary","class","filter-button",3,"click",4,"mifosxHasPermission"],["mat-table","",3,"dataSource"],["matColumnDef","client"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","fromAccount"],["matColumnDef","beneficiary"],["matColumnDef","toAccount"],["matColumnDef","amount"],["matColumnDef","validity"],["matColumnDef","actions"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],["showFirstLastButtons","",3,"pageSize","pageSizeOptions"],[1,"flex-fill"],[1,"flex-40"],[1,"mat-h3"],[1,"client-Name"],[1,"flex-30"],["matInput","","placeholder","ClientName",3,"formControl"],["matInput","","placeholder","From Client Id",3,"formControl"],[3,"value"],["mat-raised-button","","color","primary",1,"filter-button",3,"click"],["mat-header-cell",""],["mat-cell",""],[4,"ngIf"],["class","account-action-button","mat-raised-button","","color","primary",3,"matTooltip","routerLink",4,"mifosxHasPermission"],["mat-raised-button","","color","primary",1,"account-action-button",3,"matTooltip","routerLink"],[1,"fa","fa-edit"],["class","account-action-button","mat-raised-button","","color","warn",3,"matTooltip","click",4,"mifosxHasPermission"],["mat-raised-button","","color","warn",1,"account-action-button",3,"click","matTooltip"],[1,"fa","fa-times"],[1,"fa","fa-eye"],["mat-header-row",""],["mat-row",""]],template:function(d,s){d&1&&(t(0,`

`),n(1,"mat-card",1),t(2,`
  `),n(3,"div",2),t(4,`
    `),u(5,Ai,15,4,"div",3),t(6,`

    `),u(7,Mi,12,2,"div",3),t(8,`

    `),f(9,"mat-divider",4),t(10,`

    `),n(11,"mat-form-field",5),t(12,`
      `),n(13,"mat-label"),t(14),o(15,"translate"),e(),t(16,`
      `),n(17,"mat-select",6),t(18,`
        `),u(19,ki,2,2,"mat-option",7),t(20,`
      `),e(),t(21,`
    `),e(),t(22,`

    `),n(23,"mat-form-field",8),t(24,`
      `),f(25,"input",9),t(26,`
    `),e(),t(27,`

    `),u(28,Bi,4,5,"button",10),t(29,`
  `),e(),t(30,`

  `),n(31,"table",11,0),t(33,`
    `),k(34,12),t(35,`
      `),u(36,Fi,3,3,"th",13),t(37,`
      `),u(38,wi,2,2,"td",14),t(39,`
    `),B(),t(40,`

    `),k(41,15),t(42,`
      `),u(43,Oi,3,3,"th",13),t(44,`
      `),u(45,Pi,2,2,"td",14),t(46,`
    `),B(),t(47,`

    `),k(48,16),t(49,`
      `),u(50,Ni,3,3,"th",13),t(51,`
      `),u(52,qi,2,1,"td",14),t(53,`
    `),B(),t(54,`

    `),k(55,17),t(56,`
      `),u(57,Vi,3,3,"th",13),t(58,`
      `),u(59,Ri,2,2,"td",14),t(60,`
    `),B(),t(61,`

    `),k(62,18),t(63,`
      `),u(64,Li,3,3,"th",13),t(65,`
      `),u(66,Hi,2,2,"td",14),t(67,`
    `),B(),t(68,`

    `),k(69,19),t(70,`
      `),u(71,ji,3,3,"th",13),t(72,`
      `),u(73,$i,4,6,"td",14),t(74,`
    `),B(),t(75,`

    `),k(76,20),t(77,`
      `),u(78,Ui,3,3,"th",13),t(79,`
      `),u(80,Ji,8,3,"td",14),t(81,`
    `),B(),t(82,`

    `),u(83,Ki,1,0,"tr",21),t(84,`
    `),u(85,Xi,1,0,"tr",22),t(86,`
  `),e(),t(87,`

  `),f(88,"mat-paginator",23),t(89,`
`),e(),t(90,`
`)),d&2&&(a(5),m("ngIf",s.isFromClient),a(2),m("ngIf",!s.isFromClient),a(2),m("inset",!0),a(5),c(l(15,13,"labels.inputs.Type")),a(3),m("formControl",s.transferType),a(2),m("ngForOf",s.transferTypeDatas),a(6),m("formControl",s.fromAccountId),a(3),m("mifosxHasPermission","READ_STANDINGINSTRUCTION"),a(3),m("dataSource",s.dataSource),a(52),m("matHeaderRowDef",s.displayedColumns),a(2),m("matRowDefColumns",s.displayedColumns),a(3),m("pageSize",10)("pageSizeOptions",L(15,yi)))},dependencies:[F,tt,N,Ee,O,Q,W,ke,G,V,J,Y,K,ct,mt,j,ft,U,w,_t,jt,Gt,Ut,zt,$t,Qt,Ne,Wt,Jt,Yt,Kt,yt],styles:[".container[_ngcontent-%COMP%]   .filter-button[_ngcontent-%COMP%]{height:2.5rem;margin-top:2rem}table[_ngcontent-%COMP%]{width:100%}table[_ngcontent-%COMP%]   .account-action-button[_ngcontent-%COMP%]{min-width:26px;padding:0 6px;margin:4px;line-height:25px}.mat-divider[_ngcontent-%COMP%]{border-top-color:#fff}"]})}}return i})();var Zi=()=>[5,10,25,50,100];function ta(i,p){i&1&&(n(0,"th",16),t(1),o(2,"translate"),e()),i&2&&(a(),c(l(2,1,"labels.inputs.Transaction Date")))}function ea(i,p){if(i&1&&(n(0,"td",17),t(1),o(2,"dateFormat"),e()),i&2){let r=p.$implicit;a(),c(l(2,1,r.transferDate))}}function na(i,p){i&1&&(n(0,"th",16),t(1),o(2,"translate"),e()),i&2&&(a(),c(l(2,1,"labels.inputs.Amount")))}function ia(i,p){if(i&1&&(n(0,"td",17),t(1),e()),i&2){let r=p.$implicit;a(),c(r.transferAmount)}}function aa(i,p){i&1&&(n(0,"th",16),t(1),o(2,"translate"),e()),i&2&&(a(),c(l(2,1,"labels.inputs.Notes")))}function ra(i,p){if(i&1&&(n(0,"td",17),t(1),e()),i&2){let r=p.$implicit;a(),c(r.transferDescription)}}function oa(i,p){i&1&&(n(0,"th",16),t(1),o(2,"translate"),e()),i&2&&(a(),c(l(2,1,"labels.inputs.Reversed")))}function la(i,p){if(i&1&&(n(0,"td",17),t(1),o(2,"yesNo"),e()),i&2){let r=p.$implicit;a(),c(l(2,1,r.reversed))}}function sa(i,p){i&1&&f(0,"tr",18)}function ma(i,p){i&1&&f(0,"tr",19)}var oe=(()=>{class i{constructor(r){this.route=r,this.dataSource=new wt,this.displayedColumns=["transactionDate","amount","notes","reversed"],this.route.data.subscribe(d=>{this.listTransactionData=d.listTransactionData,this.dataSource=new wt(this.listTransactionData.transactions.pageItems),this.dataSource.paginator=this.paginator})}static{this.\u0275fac=function(d){return new(d||i)(I(q))}}static{this.\u0275cmp=M({type:i,selectors:[["mifosx-list-transactions"]],viewQuery:function(d,s){if(d&1&&At(yt,7),d&2){let x;Mt(x=kt())&&(s.paginator=x.first)}},decls:73,vars:19,consts:[[1,"container","m-b-20"],[1,"mat-elevation-z8"],[1,"layout-row-wrap"],[1,"flex-25","header"],[1,"flex-25"],[1,"mat-elevation-z8","container"],["mat-table","",3,"dataSource"],["matColumnDef","transactionDate"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","amount"],["matColumnDef","notes"],["matColumnDef","reversed"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],["showFirstLastButtons","",3,"pageSizeOptions"],["mat-header-cell",""],["mat-cell",""],["mat-header-row",""],["mat-row",""]],template:function(d,s){d&1&&(n(0,"div",0),t(1,`
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
    `),k(37,7),t(38,`
      `),u(39,ta,3,3,"th",8),t(40,`
      `),u(41,ea,3,3,"td",9),t(42,`
    `),B(),t(43,`

    `),k(44,10),t(45,`
      `),u(46,na,3,3,"th",8),t(47,`
      `),u(48,ia,2,1,"td",9),t(49,`
    `),B(),t(50,`

    `),k(51,11),t(52,`
      `),u(53,aa,3,3,"th",8),t(54,`
      `),u(55,ra,2,1,"td",9),t(56,`
    `),B(),t(57,`

    `),k(58,12),t(59,`
      `),u(60,oa,3,3,"th",8),t(61,`
      `),u(62,la,3,3,"td",9),t(63,`
    `),B(),t(64,`

    `),u(65,sa,1,0,"tr",13),t(66,`
    `),u(67,ma,1,0,"tr",14),t(68,`
  `),e(),t(69,`

  `),f(70,"mat-paginator",15),t(71,`
`),e(),t(72,`
`)),d&2&&(a(9),_(`
          `,l(10,12,"labels.inputs.From Account"),`
        `),a(4),v(`
          `,s.listTransactionData.fromAccount.accountNo,"(",s.listTransactionData.fromAccountType.value,`)
        `),a(3),_(`
          `,l(17,14,"labels.inputs.To Account"),`
        `),a(4),v(`
          `,s.listTransactionData.toAccount.accountNo,"(",s.listTransactionData.toAccountType.value,`)
        `),a(3),_(`
          `,l(24,16,"labels.inputs.Destination"),`
        `),a(4),_(`
          `,s.listTransactionData.toClient.displayName,`
        `),a(8),m("dataSource",s.dataSource),a(30),m("matHeaderRowDef",s.displayedColumns),a(2),m("matRowDefColumns",s.displayedColumns),a(3),m("pageSizeOptions",L(18,Zi)))},dependencies:[F,O,V,$,ft,w,jt,Gt,Ut,zt,$t,Qt,Wt,Jt,Yt,Kt,yt,Le],styles:[".content[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]{line-height:3rem}.content[_ngcontent-%COMP%]   div.header[_ngcontent-%COMP%]{font-weight:500}table[_ngcontent-%COMP%]{width:100%}table[_ngcontent-%COMP%]   .select-row[_ngcontent-%COMP%]:hover{cursor:pointer}"]})}}return i})();function ca(i,p){i&1&&(n(0,"button",14),t(1,`
        `),f(2,"fa-icon",15),t(3),o(4,"translate"),e()),i&2&&(a(3),_("",l(4,1,"labels.buttons.Undo"),`
      `))}function pa(i,p){i&1&&(n(0,"span"),t(1,`
      `),u(2,ca,5,3,"button",13),t(3,`
    `),e()),i&2&&(a(2),m("mifosxHasPermission","ADJUST_ACCOUNTTRANSFER"))}var le=(()=>{class i{constructor(r,d){this.route=r,this.location=d,this.route.data.subscribe(s=>{this.viewAccountTransferData=s.viewAccountTransferData})}transferToClient(r){return`/#/clients/${r.id}`}transferToAccount(r,d){return`/#/clients/${r.id}/savings-accounts/${d.id}`}goBack(){this.location.back()}transactionColor(){return this.viewAccountTransferData.reversed?"undo":"active"}static{this.\u0275fac=function(d){return new(d||i)(I(q),I(be))}}static{this.\u0275cmp=M({type:i,selectors:[["mifosx-view-account-transfer"]],decls:160,vars:69,consts:[[1,"container"],[1,"container","m-b-20","align-end","gap-2px"],[4,"ngIf"],[1,"layout-row-wrap","responsive-column"],[1,"flex-100",3,"ngClass"],[1,"mat-h3","flex-fill"],[3,"inset"],[1,"flex-fill"],[1,"flex-40"],[1,"flex-60"],[3,"href"],[1,"layout-row","align-center","gap-5px","responsive-column"],["type","button","color","primary","mat-raised-button","",3,"click"],["mat-raised-button","","color","warn",4,"mifosxHasPermission"],["mat-raised-button","","color","warn"],["icon","undo",1,"m-r-10"]],template:function(d,s){d&1&&(n(0,"div",0),t(1,`
  `),n(2,"div",1),t(3,`
    `),u(4,pa,4,1,"span",2),t(5,`
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
      `),n(153,"button",12),T("click",function(){return s.goBack()}),t(154),o(155,"translate"),e(),t(156,`
    `),e(),t(157,`
  `),e(),t(158,`
`),e(),t(159,`
`)),d&2&&(a(4),m("ngIf",!s.viewAccountTransferData.reversed),a(9),m("ngClass",s.transactionColor()),a(3),c(l(17,35,"labels.heading.Transaction Details")),a(3),m("inset",!0),a(5),_("",l(25,37,"labels.inputs.Transaction Amount"),":"),a(4),Se("",s.viewAccountTransferData.currency.displaySymbol,`
            `,l(29,39,s.viewAccountTransferData.transferAmount)," (",s.viewAccountTransferData.currency.code,")"),a(7),_("",l(36,41,"labels.inputs.Transaction Date"),":"),a(4),c(l(40,43,s.viewAccountTransferData.transferDate)),a(7),_("",l(47,45,"labels.inputs.Destination"),":"),a(4),c(s.viewAccountTransferData.transferDescription),a(4),c(l(55,47,"labels.heading.Transferred From")),a(3),m("inset",!0),a(5),_("",l(63,49,"labels.inputs.Office"),":"),a(4),c(s.viewAccountTransferData.fromOffice.name),a(6),_("",l(73,51,"labels.inputs.Client"),":"),a(4),c(s.viewAccountTransferData.fromClient.displayName),a(6),_("",l(83,53,"labels.inputs.Account Type"),":"),a(4),c(s.viewAccountTransferData.fromAccountType.value),a(6),_("",l(93,55,"labels.inputs.Account No"),":"),a(4),c(s.viewAccountTransferData.fromAccount.accountNo),a(4),c(l(101,57,"labels.heading.Transferred To")),a(3),m("inset",!0),a(5),_("",l(109,59,"labels.inputs.Office"),":"),a(4),c(s.viewAccountTransferData.toOffice.name),a(6),_("",l(119,61,"labels.inputs.Client"),":"),a(4),m("href",s.transferToClient(s.viewAccountTransferData.toClient),me),a(),_(`
              `,s.viewAccountTransferData.toClient.displayName,""),a(7),_("",l(131,63,"labels.inputs.Account Type"),":"),a(4),c(s.viewAccountTransferData.toAccountType.value),a(6),_("",l(141,65,"labels.inputs.Account No"),":"),a(4),m("href",s.transferToAccount(s.viewAccountTransferData.toClient,s.viewAccountTransferData.toAccount),me),a(),_(`
              `,s.viewAccountTransferData.toAccount.accountNo,""),a(9),_(`
        `,l(155,67,"labels.buttons.Back"),`
      `))},dependencies:[F,ye,N,O,V,$,ot,j,ft,U,w,xt,_t,Re],styles:["h3[_ngcontent-%COMP%]{margin:0;font-weight:500}span[_ngcontent-%COMP%]{margin:.5em 0}mat-divider[_ngcontent-%COMP%]{margin:0 0 .5em}"]})}}return i})();var xe=(()=>{class i{constructor(r){this.accountTransfersService=r}resolve(r){let d=r.parent.paramMap.get("standingInstructionsId");return this.accountTransfersService.getStandingInstructionsData(d)}static{this.\u0275fac=function(d){return new(d||i)(R(D))}}static{this.\u0275prov=H({token:i,factory:i.\u0275fac})}}return i})();var _e=(()=>{class i{constructor(r){this.accountTransfersService=r}resolve(r){let d=r.parent.paramMap.get("standingInstructionsId");return this.accountTransfersService.getStandingInstructionsDataAndTemplate(d)}static{this.\u0275fac=function(d){return new(d||i)(R(D))}}static{this.\u0275prov=H({token:i,factory:i.\u0275fac})}}return i})();var se=(()=>{class i{constructor(r){this.accountTransfersService=r}resolve(r){let d=r.queryParamMap.get("officeId"),s=r.queryParamMap.get("accountType"),x=r.parent.paramMap.get("clientId");switch(s){case"fromloans":this.accountTypeId="1";break;case"fromsavings":this.accountTypeId="2";break;default:this.accountTypeId="0"}return this.accountTransfersService.getStandingInstructionsTemplate(x,d,this.accountTypeId)}static{this.\u0275fac=function(d){return new(d||i)(R(D))}}static{this.\u0275prov=H({token:i,factory:i.\u0275fac})}}return i})();var ve=(()=>{class i{constructor(r){this.accountTransfersService=r}resolve(r){switch(r.queryParamMap.get("accountType")){case"fromloans":this.accountTypeId="1",this.id=r.queryParamMap.get("loanId");break;case"fromsavings":this.accountTypeId="2",this.id=r.queryParamMap.get("savingsId");break;case"interbank":this.accountTypeId="2",this.id=r.queryParamMap.get("savingsId");break;default:this.accountTypeId="0"}return this.accountTransfersService.newAccountTranferResource(this.id,this.accountTypeId)}static{this.\u0275fac=function(d){return new(d||i)(R(D))}}static{this.\u0275prov=H({token:i,factory:i.\u0275fac})}}return i})();var ge=(()=>{class i{constructor(r,d){this.accountTransfersService=r,this.settingsService=d}resolve(r){let d=r.parent.paramMap.get("standingInstructionsId"),s=this.settingsService.dateFormat,x=this.settingsService.language.code;return this.accountTransfersService.getStandingInstructionsTransactions(d,s,x)}static{this.\u0275fac=function(d){return new(d||i)(R(D),R(z))}}static{this.\u0275prov=H({token:i,factory:i.\u0275fac})}}return i})();var Ie=(()=>{class i{constructor(r){this.accountTransfersService=r}resolve(r){let d=r.paramMap.get("transferid");return this.accountTransfersService.getViewAccountTransferDetails(d)}static{this.\u0275fac=function(d){return new(d||i)(R(D))}}static{this.\u0275prov=H({token:i,factory:i.\u0275fac})}}return i})();var da=[{path:"",children:[{path:"create-standing-instructions",data:{title:"Create Standing Instructions",breadcrumb:"Create Standing Instructions",routeParamBreadcrumb:"Create Standing Instructions"},component:ie,resolve:{standingIntructionsTemplate:se}},{path:"make-account-transfer",data:{title:"Account Transfer",breadcrumb:"Account Transfer",routeParamBreadcrumb:"Account Transfer"},component:ae,resolve:{accountTransferTemplate:ve}},{path:"list-standing-instructions",data:{title:"List Standing Instructions",breadcrumb:"List Standing Instructions",routeParamBreadcrumb:"List Standing Instructions"},component:re,resolve:{standingIntructionsTemplate:se}},{path:"account-transfers",data:{title:"View Account Transfer",breadcrumb:"Account Transfers",routeParamBreadcrumb:!1},children:[{path:":transferid",data:{routeParamBreadcrumb:"transferid"},component:le,resolve:{viewAccountTransferData:Ie}}]},{path:":standingInstructionsId",data:{title:"Standing Instructions",routeParamBreadcrumb:"standingInstructionsId"},children:[{path:"view",data:{title:"View Standing Instructions",breadcrumb:"view",routeParamBreadcrumb:!1},component:Xt,resolve:{standingInstructionsData:xe}},{path:"edit",data:{title:"Edit Standing Instructions",breadcrumb:"edit",routeParamBreadcrumb:!1},component:ne,resolve:{standingInstructionsDataAndTemplate:_e}},{path:"list-account-transactions",data:{title:"List Account Transactions",breadcrumb:"List Account Transactions",routeParamBreadcrumb:"List Account Transactions"},component:oe,resolve:{listTransactionData:ge}}]}]}],Qe=(()=>{class i{static{this.\u0275fac=function(d){return new(d||i)}}static{this.\u0275mod=Rt({type:i})}static{this.\u0275inj=Vt({providers:[xe,_e,se,ve,ge,Ie],imports:[ce.forChild(da),ce]})}}return i})();var ua=i=>({balance:i});function fa(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
      `),e()),i&2&&(a(),v(`
        `,l(2,3,"labels.inputs.Transaction Date")," ",l(3,5,"labels.commons.is"),`
        `),a(4),c(l(6,7,"labels.commons.required")))}function xa(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
      `),e()),i&2&&(a(),v(`
        `,l(2,3,"labels.inputs.Amount")," ",l(3,5,"labels.commons.is"),`
        `),a(4),c(l(6,7,"labels.commons.required")))}function _a(i,p){if(i&1&&(n(0,"mat-error"),t(1,`
        `),f(2,"fa-icon",16),t(3),o(4,"translate"),e()),i&2){let r=S();a(3),_(`
        `,Bt(4,1,"errors.validation.msg.savingsproduct.insufficient.balance",Z(4,ua,r.balance)),`
      `)}}function va(i,p){i&1&&(n(0,"mat-error"),t(1),o(2,"translate"),o(3,"translate"),n(4,"strong"),t(5),o(6,"translate"),e(),t(7,`
      `),e()),i&2&&(a(),v(`
        `,l(2,3,"labels.inputs.Transfer Description")," ",l(3,5,"labels.commons.is"),`
        `),a(4),c(l(6,7,"labels.commons.required")))}var We=(()=>{class i{constructor(){this.minDate=new Date(2e3,0,1),this.maxDate=new Date(2100,0,1)}static{this.\u0275fac=function(d){return new(d||i)}}static{this.\u0275cmp=M({type:i,selectors:[["mifosx-make-account-interbank-transfers"]],inputs:{makeAccountTransferForm:"makeAccountTransferForm",balance:"balance"},decls:83,vars:30,consts:[["transferDatePicker",""],["amntInput",""],[3,"formGroup"],[1,"layout-row-wrap","gap-2px","responsive-column"],[1,"flex-98",3,"click"],["matInput","","required","","formControlName","transferDate",3,"min","max","matDatepicker"],["matSuffix","",3,"for"],[4,"ngIf"],[1,"flex-98"],["matInput","","formControlName","toBank"],["matInput","","formControlName","toClientId"],["matInput","","formControlName","toAccountType"],["matInput","","formControlName","toAccountId"],[1,"flex-98","error-warn"],["type","number","matInput","","required","","formControlName","transferAmount"],["matInput","","formControlName","transferDescription","cdkTextareaAutosize","","cdkAutosizeMinRows","2"],["icon","exclamation-triangle","size","md"]],template:function(d,s){if(d&1){let x=A();n(0,"form",2),t(1,`
  `),n(2,"div",3),t(3,`
    `),n(4,"mat-form-field",4),T("click",function(){h(x);let y=E(15);return C(y.open())}),t(5,`
      `),n(6,"mat-label"),t(7),o(8,"translate"),e(),t(9,`
      `),f(10,"input",5),t(11,`
      `),f(12,"mat-datepicker-toggle",6),t(13,`
      `),f(14,"mat-datepicker",null,0),t(16,`
      `),u(17,fa,8,9,"mat-error",7),t(18,`
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
      `),u(65,xa,8,9,"mat-error",7),t(66,`
      `),u(67,_a,5,6,"mat-error",7),t(68,`
    `),e(),t(69,`

    `),n(70,"mat-form-field",8),t(71,`
      `),n(72,"mat-label"),t(73),o(74,"translate"),e(),t(75,`
      `),f(76,"textarea",15),t(77,`
      `),u(78,va,8,9,"mat-error",7),t(79,`
    `),e(),t(80,`
  `),e(),t(81,`
`),e(),t(82,`
`)}if(d&2){let x,b=E(15);m("formGroup",s.makeAccountTransferForm),a(7),c(l(8,16,"labels.inputs.Transaction Date")),a(3),m("min",s.minDate)("max",s.maxDate)("matDatepicker",b),a(2),m("for",b),a(5),m("ngIf",s.makeAccountTransferForm.controls.transferDate.hasError("required")),a(6),c(l(24,18,"labels.inputs.Bank")),a(9),c(l(33,20,"labels.inputs.Client")),a(9),c(l(42,22,"labels.inputs.Account Type")),a(9),c(l(51,24,"labels.inputs.Account")),a(9),c(l(60,26,"labels.inputs.Amount")),a(6),m("ngIf",s.makeAccountTransferForm.controls.transferAmount.hasError("required")),a(2),m("ngIf",(x=s.makeAccountTransferForm.get("transferAmount"))==null?null:x.hasError("amountExceedsBalance")),a(6),c(l(74,28,"labels.inputs.Description")),a(5),m("ngIf",s.makeAccountTransferForm.controls.transferDescription.hasError("required"))}},dependencies:[F,N,O,nt,Q,Ct,W,et,rt,it,at,J,Y,lt,st,K,dt,ut,pt,w,xt,Ht],styles:["h2[_ngcontent-%COMP%], h3[_ngcontent-%COMP%], h4[_ngcontent-%COMP%]{margin:0;font-weight:500}span[_ngcontent-%COMP%]{margin:.5em 0}.margin-t[_ngcontent-%COMP%]{margin-top:1em}mat-divider[_ngcontent-%COMP%]{margin:0 0 .5em}.container[_ngcontent-%COMP%]{max-width:37rem}"]})}}return i})();var Go=(()=>{class i{static{this.\u0275fac=function(d){return new(d||i)}}static{this.\u0275mod=Rt({type:i})}static{this.\u0275inj=Vt({imports:[Ue,He,$e,Qe,Xt,ne,ie,ae,re,oe,le,We]})}}return i})();export{Go as AccountTransfersModule};
