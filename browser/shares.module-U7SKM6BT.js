import{$a as qe,$c as ue,Aa as ie,Ad as be,Af as st,Ba as ne,Bc as oe,Bf as mt,C as Ne,Ca as R,Cc as $,Cd as Ai,Ce as rt,Cf as Ri,D as dt,Da as e,Dc as se,Dd as Tt,De as yt,Df as Fi,Ea as u,Ec as W,Ee as It,F as Oe,Fa as S,Fe as Et,Ga as P,Gc as ui,Ge as Mt,H as ut,Hd as gi,He as Pt,I as y,Ie as ot,J as I,Jc as Y,Je as Ue,Kc as hi,Kd as bi,Ke as De,Ld as Di,Le as Te,Mc as me,Md as Ti,Me as ye,Mf as Bi,Na as N,Nd as Le,O as ht,Oa as si,Ob as F,Oe as Ie,Of as ki,Pb as pi,Pc as ce,Pe as Ee,Qa as m,Ra as c,Rb as z,Re as Me,Sa as ae,Sb as K,Sc as pe,Sd as yi,Se as Pe,Ta as mi,Tb as li,Ua as Ce,Ub as ni,Ue as we,Vc as le,Ve as Re,Wb as St,Wc as fi,Wf as Rt,Xb as k,Xc as T,Xe as Fe,Y as a,Yc as de,Zc as xi,Ze as Ve,_a as Ze,_c as Si,aa as x,ab as j,ba as b,bd as ge,ca as ft,cd as vi,cf as Ii,df as Ei,dg as Ni,ed as _i,ef as Mi,fa as l,fd as J,fg as Oi,gc as vt,gd as he,ha as d,hc as _t,ic as He,jc as Ct,jd as fe,kc as At,kd as X,la as i,lb as et,lc as gt,ld as tt,ma as n,mb as D,mc as bt,md as xe,na as f,nd as it,oa as C,pa as A,pd as nt,qc as di,ra as w,rc as E,rd as Se,sa as g,sd as ve,ta as _,td as _e,te as at,ub as xt,ud as Ci,uf as wt,vd as Be,wa as H,wb as ci,wc as re,wd as je,wf as Pi,xc as q,xd as Dt,za as te,zf as wi}from"./chunk-4JZCV75L.js";import{a as V,b as Q}from"./chunk-O7S4L63H.js";var B=(()=>{class t{constructor(r){this.http=r}getSharesAccountData(r,s){let o=new xt().set("template",s.toString());return this.http.get(`/accounts/share/${r}`,{params:o})}getSharesAccountTemplate(r,s){let o=new xt().set("clientId",r);return o=s?o.set("productId",s):o,this.http.get("/accounts/share/template",{params:o})}createSharesAccount(r){return this.http.post("/accounts/share",r)}updateSharesAccount(r,s){return this.http.put(`/accounts/share/${r}`,s)}deleteSharesAccount(r){return this.http.delete(`/accounts/share/${r}`)}executeSharesAccountCommand(r,s,o){let h=new xt().set("command",s);return this.http.post(`/accounts/share/${r}`,o,{params:h})}static{this.\u0275fac=function(s){return new(s||t)(Oe(ci))}}static{this.\u0275prov=Ne({token:t,factory:t.\u0275fac,providedIn:"root"})}}return t})();var Ft=class{constructor(p){this.setOptions(p),this.setButtons(p)}get singleButtons(){return this.buttonsArray}get options(){return this.optionArray}setButtons(p){switch(p){case"Active":this.buttonsArray=[{name:"Apply Additional Shares",icon:"arrow-right",taskPermissionName:"APPLYADDITIONAL_SHAREACCOUNT"},{name:"Approve Additional Shares",icon:"arrow-right",taskPermissionName:"APPROVEADDITIONAL_SHAREACCOUNT"},{name:"Reject Additional Shares",icon:"arrow-left",taskPermissionName:"REJECTADDITIONAL_SHAREACCOUNT"},{name:"Redeem Shares",icon:"arrow-left",taskPermissionName:"WITHDRAW_SAVINGSACCOUNT"}];break;case"Submitted and pending approval":this.buttonsArray=[{name:"Modify Application",icon:"pencil",taskPermissionName:"UPDATE_SHAREACCOUNT"},{name:"Approve",icon:"check",taskPermissionName:"APPROVE_SHAREACCOUNT"}];break;case"Approved":this.buttonsArray=[{name:"Undo Approval",icon:"undo",taskPermissionName:"APPROVALUNDO_SHAREACCOUNT"},{name:"Activate",icon:"check",taskPermissionName:"ACTIVATE_SHAREACCOUNT"}];break;default:this.buttonsArray=[]}}setOptions(p){switch(p){case"Active":this.optionArray=[{name:"Close",taskPermissionName:"CLOSE_SHAREACCOUNT"}];break;case"Submitted and pending approval":this.optionArray=[{name:"Reject",taskPermissionName:"REJECT_SHAREACCOUNT"},{name:"Delete",taskPermissionName:"DELETE_SHAREACCOUNT"}];break;case"Approved":default:this.optionArray=[]}}addOption(p){this.optionArray.push(p)}removeButton(p){let s=this.buttonsArray.map(o=>o.name).indexOf(p);this.buttonsArray.splice(s,1)}};var Li=()=>["./general"],Ui=()=>["./transactions"],$i=()=>["./charges"],Gi=()=>["./dividends"];function zi(t,p){if(t&1&&(i(0,"span",31),e(1,`
                  `),f(2,"mifosx-account-number",32),e(3,`
                `),n()),t&2){let r=_();a(2),H("accountNo",r.sharesAccountData.clientAccountNo)}}function Qi(t,p){if(t&1&&(i(0,"tr"),e(1,`
                      `),i(2,"td"),e(3),m(4,"translate"),n(),e(5,`
                      `),i(6,"td"),e(7),m(8,"translateKey"),n(),e(9,`
                    `),n()),t&2){let r=_();a(3),S("",c(4,3,"labels.inputs.Lockin Period")," :"),a(4),P(`
                        `,r.sharesAccountData.lockinPeriod,`
                        `,ae(8,5,r.sharesAccountData.lockPeriodTypeEnum.value,"catalogs"),`
                      `)}}function Ki(t,p){if(t&1&&(i(0,"button",33),e(1,`
                `),i(2,"mat-icon",34),e(3,`
                  `),f(4,"fa-icon",35),e(5,`
                `),n(),e(6,`
              `),n()),t&2){_();let r=R(83);d("matMenuTriggerFor",r)}}function Wi(t,p){if(t&1){let r=w();i(0,"button",37),g("click",function(){y(r);let o=_().$implicit,h=_();return I(h.doAction(o.name))}),e(1,`
          `),i(2,"mat-icon",38),e(3,`
            `),f(4,"fa-icon",39),e(5,`
          `),n(),e(6,`
          `),i(7,"span"),e(8),m(9,"translate"),n(),e(10,`
        `),n()}if(t&2){let r=_().$implicit;a(4),H("icon",r.icon),a(4),u(c(9,2,"labels.menus."+r.name))}}function Yi(t,p){if(t&1&&(C(0),e(1,`
        `),l(2,Wi,11,4,"button",36),e(3,`
      `),A()),t&2){let r=p.$implicit;a(2),d("mifosxHasPermission",r.taskPermissionName)}}function Ji(t,p){if(t&1){let r=w();i(0,"button",37),g("click",function(){y(r);let o=_().$implicit,h=_(2);return I(h.doAction(o.name))}),e(1),m(2,"translate"),n()}if(t&2){let r=_().$implicit;a(),S(`
              `,c(2,1,"labels.menus."+r.name),`
            `)}}function Xi(t,p){if(t&1&&(i(0,"span"),e(1,`
            `),l(2,Ji,3,3,"button",36),e(3,`
          `),n()),t&2){let r=p.$implicit;a(2),d("mifosxHasPermission",r.taskPermissionName)}}function Zi(t,p){if(t&1&&(C(0),e(1,`
        `),i(2,"button",40),e(3),m(4,"translate"),n(),e(5,`
        `),i(6,"mat-menu",null,2),e(8,`
          `),l(9,Xi,4,1,"span",27),e(10,`
        `),n(),e(11,`
      `),A()),t&2){let r=R(7),s=_();a(2),d("matMenuTriggerFor",r),a(),u(c(4,3,"labels.menus.More")),a(6),d("ngForOf",s.buttonConfig.options)}}function en(t,p){if(t&1&&(i(0,"a",41,3),e(2),m(3,"translate"),n()),t&2){let r=R(1);d("routerLink",N(5,Li))("active",r.isActive),a(2),S(`
        `,c(3,3,"labels.inputs.General"),`
      `)}}function tn(t,p){if(t&1&&(i(0,"a",41,4),e(2),m(3,"translate"),n()),t&2){let r=R(1);d("routerLink",N(5,Ui))("active",r.isActive),a(2),S(`
        `,c(3,3,"labels.inputs.Transactions"),`
      `)}}function nn(t,p){if(t&1&&(i(0,"a",41,5),e(2),m(3,"translate"),n()),t&2){let r=R(1);d("routerLink",N(5,$i))("active",r.isActive),a(2),S(`
        `,c(3,3,"labels.inputs.Charges"),`
      `)}}function an(t,p){if(t&1&&(i(0,"a",41,6),e(2),m(3,"translate"),n()),t&2){let r=R(1);d("routerLink",N(5,Gi))("active",r.isActive),a(2),S(`
        `,c(3,3,"labels.inputs.Dividends"),`
      `)}}var kt=(()=>{class t{constructor(r,s,o,h){this.route=r,this.router=s,this.sharesService=o,this.dialog=h,this.route.data.subscribe(v=>{this.sharesAccountData=v.sharesAccountData})}ngOnInit(){this.setConditionalButtons(),this.router.url.includes("clients")?this.entityType="Client":this.router.url.includes("groups")?this.entityType="Group":this.router.url.includes("centers")&&(this.entityType="Center")}setConditionalButtons(){let r=this.sharesAccountData.status.value;if(this.buttonConfig=new Ft(r),this.sharesAccountData.charges&&this.sharesAccountData.charges.forEach(o=>{o.name==="Annual fee - INR"&&this.buttonConfig.addOption({name:"Apply Anuual Fees",taskPermissionName:"APPLYANNUALFEE_SAVINGSACCOUNT"})}),r==="Active"){let s=this.sharesAccountData.purchasedShares,o=!1;s.forEach(h=>{h.status.code==="purchasedSharesStatusType.applied"&&h.type.code==="purchasedSharesType.purchased"&&(o=!0)}),o||(this.buttonConfig.removeButton("Approve Additional Shares"),this.buttonConfig.removeButton("Reject Additional Shares"))}}doAction(r){switch(r){case"Approve":case"Reject":case"Close":case"Activate":case"Undo Approval":case"Apply Additional Shares":case"Redeem Shares":case"Approve Additional Shares":case"Reject Additional Shares":this.router.navigate([`actions/${r}`],{relativeTo:this.route});break;case"Modify Application":this.router.navigate(["edit"],{relativeTo:this.route});break;case"Delete":this.deleteSharesAccount();break}}deleteSharesAccount(){this.dialog.open(Tt,{data:{deleteContext:`shares account with id: ${this.sharesAccountData.id}`}}).afterClosed().subscribe(s=>{s.delete&&this.sharesService.deleteSharesAccount(this.sharesAccountData.id).subscribe(()=>{this.router.navigate(["../../"],{relativeTo:this.route})})})}static{this.\u0275fac=function(s){return new(s||t)(x(F),x(z),x(B),x(He))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-shares-account-view"]],decls:112,vars:35,consts:[["accountMenu","matMenu"],["tabPanel",""],["More","matMenu"],["general","routerLinkActive"],["transactions","routerLinkActive"],["charges","routerLinkActive"],["dividends","routerLinkActive"],[1,"account-card"],[1,"header","layout-column"],[1,"header-title-group"],[1,"profile-image-container"],["mat-card-md-image","","src","assets/images/shares_account_placeholder.png",1,"profile-image",3,"matTooltip"],[1,"mat-typography","account-card-title"],[1,"layout-row","responsive-column"],[1,"flex-60"],[1,"fa","fa-stop",3,"ngClass","matTooltip"],[1,"m-r-5"],[3,"textValue"],["display","left",3,"accountNo"],[1,"shares-overview"],[1,"m-r-10"],["class","m-l-10",4,"ngIf"],[1,"account-overview"],[4,"ngIf"],[1,"flex-auto"],[1,"flex-40"],["mat-icon-button","","aria-label","Share account actions","yPosition","below",3,"matMenuTriggerFor",4,"ngIf"],[4,"ngFor","ngForOf"],[1,"content"],["mat-tab-nav-bar","",1,"navigation-tabs",3,"tabPanel"],["mat-tab-link","","routerLinkActive","",3,"routerLink","active",4,"mifosxHasPermission"],[1,"m-l-10"],[3,"accountNo"],["mat-icon-button","","aria-label","Share account actions","yPosition","below",3,"matMenuTriggerFor"],["matListIcon","",1,"actions-menu"],["icon","bars","size","sm"],["mat-menu-item","",3,"click",4,"mifosxHasPermission"],["mat-menu-item","",3,"click"],["matListIcon",""],["size","sm",3,"icon"],["mat-menu-item","",3,"matMenuTriggerFor"],["mat-tab-link","","routerLinkActive","",3,"routerLink","active"]],template:function(s,o){if(s&1&&(i(0,"mat-card",7),e(1,`
  `),i(2,"mat-card-header",8),e(3,`
    `),i(4,"mat-card-title-group",9),e(5,`
      `),i(6,"div",10),e(7,`
        `),i(8,"div"),e(9,`
          `),f(10,"img",11),m(11,"translate"),e(12,`
        `),n(),e(13,`
      `),n(),e(14,`

      `),i(15,"div",12),e(16,`
        `),i(17,"mat-card-title"),e(18,`
          `),i(19,"div",13),e(20,`
            `),i(21,"div",14),e(22,`
              `),i(23,"h3"),e(24,`
                `),f(25,"i",15),m(26,"statusLookup"),e(27,`
                `),i(28,"span",16),e(29),m(30,"translate"),n(),e(31,`
                `),i(32,"span",16),f(33,"mifosx-long-text",17),n(),e(34,`
                `),f(35,"mifosx-account-number",18),e(36,`
              `),n(),e(37,`
              `),i(38,"span",19),e(39,`
                `),i(40,"span",20),e(41),m(42,"translate"),m(43,"translate"),n(),e(44),l(45,zi,4,1,"span",21),e(46,`
              `),n(),e(47,`
              `),i(48,"div"),e(49,`
                `),i(50,"table",22),e(51,`
                  `),i(52,"tbody"),e(53,`
                    `),i(54,"tr"),e(55,`
                      `),i(56,"td"),e(57),m(58,"translate"),n(),e(59,`
                      `),i(60,"td"),e(61),m(62,"formatNumber"),n(),e(63,`
                    `),n(),e(64,`
                    `),l(65,Qi,10,8,"tr",23),e(66,`
                  `),n(),e(67,`
                `),n(),e(68,`
              `),n(),e(69,`
            `),n(),e(70,`

            `),f(71,"span",24),e(72,`
            `),i(73,"div",25),e(74,`
              `),l(75,Ki,7,1,"button",26),e(76,`
            `),n(),e(77,`
          `),n(),e(78,`
        `),n(),e(79,`
      `),n(),e(80,`
    `),n(),e(81,`

    `),i(82,"mat-menu",null,0),e(84,`
      `),l(85,Yi,4,1,"ng-container",27),e(86,`

      `),l(87,Zi,12,5,"ng-container",23),e(88,`
    `),n(),e(89,`
  `),n(),e(90,`

  `),i(91,"mat-card-content",28),e(92,`
    `),i(93,"nav",29),e(94,`
      `),l(95,en,4,6,"a",30),e(96,`
      `),l(97,tn,4,6,"a",30),e(98,`
      `),l(99,nn,4,6,"a",30),e(100,`
      `),l(101,an,4,6,"a",30),e(102,`
    `),n(),e(103,`

    `),i(104,"mat-tab-nav-panel",null,1),e(106,`
      `),f(107,"router-outlet"),e(108,`
    `),n(),e(109,`
  `),n(),e(110,`
`),n(),e(111,`
`)),s&2){let h=R(105);a(10),H("matTooltip",c(11,21,"tooltips.Shares Account")),a(15),d("ngClass",c(26,23,o.sharesAccountData.status.code))("matTooltip",o.sharesAccountData.status.value),a(4),S("",c(30,25,"labels.inputs.Share Product")," :"),a(4),H("textValue",o.sharesAccountData.productName),a(2),H("accountNo",o.sharesAccountData.accountNo),a(6),P("",c(42,27,"labels.text."+o.entityType)," ",c(43,29,"labels.inputs.name")," :"),a(3),S("",o.sharesAccountData.clientName||o.sharesAccountData.groupName,`
                `),a(),d("ngIf",o.sharesAccountData.clientAccountNo),a(12),S("",c(58,31,"labels.inputs.Current Market Price")," :"),a(4),u(c(62,33,o.sharesAccountData.currentMarketPrice)),a(4),d("ngIf",o.sharesAccountData.lockinPeriod),a(10),d("ngIf",o.buttonConfig.singleButtons.length>0),a(10),d("ngForOf",o.buttonConfig.singleButtons),a(2),d("ngIf",o.buttonConfig.options.length),a(6),d("tabPanel",h),a(2),d("mifosxHasPermission","READ_SHAREACCOUNTPURCHASE"),a(2),d("mifosxHasPermission","READ_SHAREACCOUNTPURCHASE"),a(2),d("mifosxHasPermission","READ_SHAREACCOUNTCHARGE"),a(2),d("mifosxHasPermission","READ_SHAREACCOUNTDIVIDENDS")}},dependencies:[D,Ze,qe,j,T,K,de,ue,Dt,E,je,vi,Si,_i,Le,xi,Ni,Rt,St,Ti,yi,be,Di,bi,Ii,Ei,li,Mi,pi,mt,st],styles:[".shares-overview[_ngcontent-%COMP%]{font-size:14px}.account-overview[_ngcontent-%COMP%]{min-width:60%;font-weight:400}"]})}}return t})();function rn(t,p){t&1&&(i(0,"th",14),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Transaction Date")))}function on(t,p){if(t&1&&(i(0,"td",15),e(1),m(2,"dateFormat"),n()),t&2){let r=p.$implicit;a(),u(c(2,1,r.purchasedDate))}}function sn(t,p){t&1&&(i(0,"th",14),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Transaction Type")))}function mn(t,p){if(t&1&&(i(0,"td",15),e(1),n()),t&2){let r=p.$implicit;a(),P(`
          `,r.type.value,`
          `,r.type.value!=="Charge Payment"?"("+r.status.value+")":"",`
        `)}}function cn(t,p){t&1&&(i(0,"th",14),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Total Shares")))}function pn(t,p){if(t&1&&(i(0,"td",15),e(1),n()),t&2){let r=p.$implicit;a(),u(r.numberOfShares)}}function ln(t,p){t&1&&(i(0,"th",14),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Purhcased/Redeemed Price")))}function dn(t,p){if(t&1&&(i(0,"td",15),e(1),n()),t&2){let r=p.$implicit,s=_();a(),P(`
          `,s.shareAccountData.currency.displaySymbol,"\xA0",r.purchasedPrice,`
        `)}}function un(t,p){t&1&&(i(0,"th",14),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Charge Amount")))}function hn(t,p){if(t&1&&(i(0,"td",15),e(1),n()),t&2){let r=p.$implicit,s=_();a(),P(`
          `,s.shareAccountData.currency.displaySymbol,"\xA0",r.type.value==="Charge Payment"?r.amount:r.chargeAmount,`
        `)}}function fn(t,p){t&1&&(i(0,"th",14),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Amount Recieved/Returned")))}function xn(t,p){if(t&1&&(i(0,"td",15),e(1),n()),t&2){let r=p.$implicit,s=_();a(),P(`
          `,s.shareAccountData.currency.displaySymbol,"\xA0",r.amount,`
        `)}}function Sn(t,p){t&1&&f(0,"tr",16)}function vn(t,p){t&1&&f(0,"tr",17)}var Nt=(()=>{class t{constructor(r){this.route=r,this.displayedColumns=["transactionDate","transactionType","totalShares","purchasedOrRedeemedPrice","chargeAmount","amountRecievedOrReturned"],this.route.parent.data.subscribe(s=>{this.shareAccountData=s.sharesAccountData,this.transactionsData=this.shareAccountData.purchasedShares})}ngOnInit(){this.dataSource=new Ve(this.transactionsData)}static{this.\u0275fac=function(s){return new(s||t)(x(F))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-transactions-tab"]],decls:62,vars:6,consts:[[1,"tab-container","mat-typography"],[1,"m-b-10"],[1,"mat-elevation-z1","m-b-25"],["mat-table","",3,"dataSource"],["matColumnDef","transactionDate"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","transactionType"],["matColumnDef","totalShares"],["matColumnDef","purchasedOrRedeemedPrice"],["matColumnDef","chargeAmount"],["matColumnDef","amountRecievedOrReturned"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],["mat-header-cell",""],["mat-cell",""],["mat-header-row",""],["mat-row",""]],template:function(s,o){s&1&&(i(0,"div",0),e(1,`
  `),i(2,"div",1),e(3,`
    `),i(4,"h3"),e(5),m(6,"translate"),n(),e(7,`
  `),n(),e(8,`

  `),i(9,"div",2),e(10,`
    `),i(11,"table",3),e(12,`
      `),C(13,4),e(14,`
        `),l(15,rn,3,3,"th",5),e(16,`
        `),l(17,on,3,3,"td",6),e(18,`
      `),A(),e(19,`

      `),C(20,7),e(21,`
        `),l(22,sn,3,3,"th",5),e(23,`
        `),l(24,mn,2,2,"td",6),e(25,`
      `),A(),e(26,`

      `),C(27,8),e(28,`
        `),l(29,cn,3,3,"th",5),e(30,`
        `),l(31,pn,2,1,"td",6),e(32,`
      `),A(),e(33,`

      `),C(34,9),e(35,`
        `),l(36,ln,3,3,"th",5),e(37,`
        `),l(38,dn,2,2,"td",6),e(39,`
      `),A(),e(40,`

      `),C(41,10),e(42,`
        `),l(43,un,3,3,"th",5),e(44,`
        `),l(45,hn,2,2,"td",6),e(46,`
      `),A(),e(47,`

      `),C(48,11),e(49,`
        `),l(50,fn,3,3,"th",5),e(51,`
        `),l(52,xn,2,2,"td",6),e(53,`
      `),A(),e(54,`

      `),l(55,Sn,1,0,"tr",12),e(56,`
      `),l(57,vn,1,0,"tr",13),e(58,`
    `),n(),e(59,`
  `),n(),e(60,`
`),n(),e(61,`
`)),s&2&&(a(5),u(c(6,4,"labels.heading.All Transactions")),a(6),d("dataSource",o.dataSource),a(44),d("matHeaderRowDef",o.displayedColumns),a(2),d("matRowDefColumns",o.displayedColumns))},dependencies:[D,T,Be,E,De,Ie,ye,Ee,Te,Me,Pe,Re,we,Fe],styles:[".tab-container[_ngcontent-%COMP%]{padding:1%;margin:1%}.tab-container[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin:1% auto}.tab-container[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]{width:100%}"]})}}return t})();function _n(t,p){t&1&&(i(0,"th",17),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.name")))}function Cn(t,p){if(t&1&&(i(0,"td",18),e(1),n()),t&2){let r=p.$implicit;a(),u(r.name)}}function An(t,p){t&1&&(i(0,"th",17),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Fee/Penalty")))}function gn(t,p){if(t&1&&(i(0,"td",18),e(1),n()),t&2){let r=p.$implicit;a(),u(r.penalty===!0?"Penalty":"Fee")}}function bn(t,p){t&1&&(i(0,"th",17),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Payment Due At")))}function Dn(t,p){if(t&1&&(i(0,"td",18),e(1),m(2,"translateKey"),n()),t&2){let r=p.$implicit;a(),u(ae(2,1,r.chargeTimeType.value,"catalogs"))}}function Tn(t,p){t&1&&(i(0,"th",17),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Calculation Type")))}function yn(t,p){if(t&1&&(i(0,"td",18),e(1),m(2,"translateKey"),n()),t&2){let r=p.$implicit;a(),u(ae(2,1,r.chargeCalculationType.value,"catalogs"))}}function In(t,p){t&1&&(i(0,"th",17),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Due")))}function En(t,p){if(t&1&&(i(0,"td",18),e(1),m(2,"currency"),n()),t&2){let r=p.$implicit;a(),S(`
          `,Ce(2,1,r.amount,r.currency.code,"symbol-narrow","1.2-2"),`
        `)}}function Mn(t,p){t&1&&(i(0,"th",17),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Paid")))}function Pn(t,p){if(t&1&&(i(0,"td",18),e(1),m(2,"currency"),n()),t&2){let r=p.$implicit;a(),S(`
          `,Ce(2,1,r.amountPaid,r.currency.code,"symbol-narrow","1.2-2"),`
        `)}}function wn(t,p){t&1&&(i(0,"th",17),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Waived")))}function Rn(t,p){if(t&1&&(i(0,"td",18),e(1),m(2,"currency"),n()),t&2){let r=p.$implicit;a(),S(`
          `,Ce(2,1,r.amountWaived,r.currency.code,"symbol-narrow","1.2-2"),`
        `)}}function Fn(t,p){t&1&&(i(0,"th",17),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Outstanding")))}function Bn(t,p){if(t&1&&(i(0,"td",18),e(1),m(2,"currency"),n()),t&2){let r=p.$implicit;a(),S(`
          `,Ce(2,1,r.amountOutstanding,r.currency.code,"symbol-narrow","1.2-2"),`
        `)}}function kn(t,p){t&1&&(i(0,"th",17),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Actions")))}function Nn(t,p){if(t&1){let r=w();i(0,"button",22),m(1,"translate"),g("click",function(o){y(r);let h=_(2).$implicit,v=_();return v.routeEdit(o),I(v.editCharge(h))}),e(2,`
              `),f(3,"i",23),e(4,`
            `),n()}t&2&&H("matTooltip",c(1,1,"tooltips.Edit Charge"))}function On(t,p){if(t&1){let r=w();i(0,"button",24),m(1,"translate"),g("click",function(o){y(r);let h=_(2).$implicit,v=_();return v.routeEdit(o),I(v.deleteCharge(h.id))}),e(2,`
              `),f(3,"i",25),e(4,`
            `),n()}t&2&&H("matTooltip",c(1,1,"tooltips.Delete Charge"))}function jn(t,p){t&1&&(i(0,"span"),e(1,`
            `),l(2,Nn,5,3,"button",20),e(3,`
            `),l(4,On,5,3,"button",21),e(5,`
          `),n()),t&2&&(a(2),d("mifosxHasPermission","UPDATE_SHARESACCOUNTCHARGE"),a(2),d("mifosxHasPermission","DELETE_SHARESACCOUNTCHARGE"))}function Vn(t,p){if(t&1){let r=w();i(0,"button",22),m(1,"translate"),g("click",function(o){y(r);let h=_(2).$implicit,v=_();return v.routeEdit(o),I(v.payCharge(h.id))}),e(2,`
              `),f(3,"i",26),e(4,`
            `),n()}t&2&&H("matTooltip",c(1,1,"tooltips.Pay Charge"))}function qn(t,p){if(t&1){let r=w();i(0,"button",22),m(1,"translate"),g("click",function(o){y(r);let h=_(2).$implicit,v=_();return v.routeEdit(o),I(v.waiveCharge(h.id))}),e(2,`
              `),f(3,"i",27),e(4,`
            `),n()}t&2&&H("matTooltip",c(1,1,"tooltips.Waive Charge"))}function Hn(t,p){t&1&&(i(0,"span"),e(1,`
            `),l(2,Vn,5,3,"button",20),e(3,`
            `),l(4,qn,5,3,"button",20),e(5,`
          `),n()),t&2&&(a(2),d("mifosxHasPermission","PAY_SHARESACCOUNTCHARGE"),a(2),d("mifosxHasPermission","WAIVE_SHARESACCOUNTCHARGE"))}function Ln(t,p){if(t&1&&(i(0,"td",18),e(1,`
          `),l(2,jn,6,2,"span",19),e(3,`
          `),l(4,Hn,6,2,"span",19),e(5,`
        `),n()),t&2){let r=_();a(2),d("ngIf",r.sharesAccountData.status.value==="Submitted and pending approval"),a(2),d("ngIf",r.sharesAccountData.status.value==="Active")}}function Un(t,p){t&1&&f(0,"tr",28)}function $n(t,p){t&1&&f(0,"tr",29)}var Ot=(()=>{class t{constructor(r){this.route=r,this.displayedColumns=["name","feeOrPenalty","paymentDueAt","calculationType","due","paid","waived","outstanding","actions"],this.route.parent.data.subscribe(s=>{this.sharesAccountData=s.sharesAccountData,this.chargesData=this.sharesAccountData.charges})}ngOnInit(){let r=this.chargesData?this.chargesData.filter(s=>s.isActive):[];this.dataSource=new Ve(r)}static{this.\u0275fac=function(s){return new(s||t)(x(F))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-charges-tab"]],decls:83,vars:6,consts:[[1,"tab-container","mat-typography"],[1,"m-b-10"],[1,"mat-elevation-z1","m-b-25"],["mat-table","",3,"dataSource"],["matColumnDef","name"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","feeOrPenalty"],["matColumnDef","paymentDueAt"],["matColumnDef","calculationType"],["matColumnDef","due"],["matColumnDef","paid"],["matColumnDef","waived"],["matColumnDef","outstanding"],["matColumnDef","actions"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],["mat-header-cell",""],["mat-cell",""],[4,"ngIf"],["class","account-action-button","mat-raised-button","","color","primary",3,"matTooltip","click",4,"mifosxHasPermission"],["class","account-action-button","mat-raised-button","","color","warn",3,"matTooltip","click",4,"mifosxHasPermission"],["mat-raised-button","","color","primary",1,"account-action-button",3,"click","matTooltip"],[1,"fa","fa-pencil"],["mat-raised-button","","color","warn",1,"account-action-button",3,"click","matTooltip"],[1,"fa","fa-trash"],[1,"fa","fa-dollar"],[1,"fa","fa-flag"],["mat-header-row",""],["mat-row",""]],template:function(s,o){s&1&&(i(0,"div",0),e(1,`
  `),i(2,"div",1),e(3,`
    `),i(4,"h3"),e(5),m(6,"translate"),n(),e(7,`
  `),n(),e(8,`

  `),i(9,"div",2),e(10,`
    `),i(11,"table",3),e(12,`
      `),C(13,4),e(14,`
        `),l(15,_n,3,3,"th",5),e(16,`
        `),l(17,Cn,2,1,"td",6),e(18,`
      `),A(),e(19,`

      `),C(20,7),e(21,`
        `),l(22,An,3,3,"th",5),e(23,`
        `),l(24,gn,2,1,"td",6),e(25,`
      `),A(),e(26,`

      `),C(27,8),e(28,`
        `),l(29,bn,3,3,"th",5),e(30,`
        `),l(31,Dn,3,4,"td",6),e(32,`
      `),A(),e(33,`

      `),C(34,9),e(35,`
        `),l(36,Tn,3,3,"th",5),e(37,`
        `),l(38,yn,3,4,"td",6),e(39,`
      `),A(),e(40,`

      `),C(41,10),e(42,`
        `),l(43,In,3,3,"th",5),e(44,`
        `),l(45,En,3,6,"td",6),e(46,`
      `),A(),e(47,`

      `),C(48,11),e(49,`
        `),l(50,Mn,3,3,"th",5),e(51,`
        `),l(52,Pn,3,6,"td",6),e(53,`
      `),A(),e(54,`

      `),C(55,12),e(56,`
        `),l(57,wn,3,3,"th",5),e(58,`
        `),l(59,Rn,3,6,"td",6),e(60,`
      `),A(),e(61,`

      `),C(62,13),e(63,`
        `),l(64,Fn,3,3,"th",5),e(65,`
        `),l(66,Bn,3,6,"td",6),e(67,`
      `),A(),e(68,`

      `),C(69,14),e(70,`
        `),l(71,kn,3,3,"th",5),e(72,`
        `),l(73,Ln,6,2,"td",6),e(74,`
      `),A(),e(75,`

      `),l(76,Un,1,0,"tr",15),e(77,`
      `),l(78,$n,1,0,"tr",16),e(79,`
    `),n(),e(80,`
  `),n(),e(81,`
`),n(),e(82,`
`)),s&2&&(a(5),u(c(6,4,"labels.heading.All Charges")),a(6),d("dataSource",o.dataSource),a(65),d("matHeaderRowDef",o.displayedColumns),a(2),d("matRowDefColumns",o.displayedColumns))},dependencies:[D,j,et,T,k,Dt,E,je,De,Ie,ye,Ee,Te,Me,Le,Pe,Re,we,Fe],styles:[".tab-container[_ngcontent-%COMP%]{padding:1%;margin:1%}.tab-container[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin:1% auto}.tab-container[_ngcontent-%COMP%]   .action-button[_ngcontent-%COMP%]{margin-left:auto}.tab-container[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]{width:100%}.tab-container[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]   .account-action-button[_ngcontent-%COMP%]{min-width:26px;padding:0 6px;margin:4px;line-height:25px}.tab-container[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]   .select-row[_ngcontent-%COMP%]:hover{cursor:pointer}"]})}}return t})();function Gn(t,p){t&1&&(i(0,"th",12),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Transaction Date")))}function zn(t,p){if(t&1&&(i(0,"td",13),e(1),m(2,"dateFormat"),n()),t&2){let r=p.$implicit;a(),u(c(2,1,r.postedDate))}}function Qn(t,p){t&1&&(i(0,"th",12),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Amount")))}function Kn(t,p){if(t&1&&(i(0,"td",13),e(1),m(2,"currency"),n()),t&2){let r=p.$implicit,s=_();a(),S(`
          `,Ce(2,1,r.amount,s.shareAccountData.currency.code,"symbol-narrow","1.2-2"),`
        `)}}function Wn(t,p){t&1&&(i(0,"th",12),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Transaction Reference")))}function Yn(t,p){if(t&1&&(i(0,"td",13),e(1),n()),t&2){let r=p.$implicit;a(),u(r.savingsTransactionId)}}function Jn(t,p){t&1&&(i(0,"th",12),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Status")))}function Xn(t,p){if(t&1&&(i(0,"td",13),e(1),m(2,"translate"),n()),t&2){let r=p.$implicit;a(),u(c(2,1,"labels.status."+r.status.value))}}function Zn(t,p){t&1&&f(0,"tr",14)}function ea(t,p){t&1&&f(0,"tr",15)}var jt=(()=>{class t{constructor(r){this.route=r,this.displayedColumns=["transactionDate","amount","transactionReference","status"],this.route.parent.data.subscribe(s=>{this.shareAccountData=s.sharesAccountData,this.dividendsData=this.shareAccountData.dividends})}ngOnInit(){this.dataSource=new Ve(this.dividendsData)}static{this.\u0275fac=function(s){return new(s||t)(x(F))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-dividends-tab"]],decls:48,vars:6,consts:[[1,"tab-container","mat-typography"],[1,"m-b-10"],[1,"mat-elevation-z1","m-b-25"],["mat-table","",3,"dataSource"],["matColumnDef","transactionDate"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","amount"],["matColumnDef","transactionReference"],["matColumnDef","status"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],["mat-header-cell",""],["mat-cell",""],["mat-header-row",""],["mat-row",""]],template:function(s,o){s&1&&(i(0,"div",0),e(1,`
  `),i(2,"div",1),e(3,`
    `),i(4,"h3"),e(5),m(6,"translate"),n(),e(7,`
  `),n(),e(8,`

  `),i(9,"div",2),e(10,`
    `),i(11,"table",3),e(12,`
      `),C(13,4),e(14,`
        `),l(15,Gn,3,3,"th",5),e(16,`
        `),l(17,zn,3,3,"td",6),e(18,`
      `),A(),e(19,`

      `),C(20,7),e(21,`
        `),l(22,Qn,3,3,"th",5),e(23,`
        `),l(24,Kn,3,6,"td",6),e(25,`
      `),A(),e(26,`

      `),C(27,8),e(28,`
        `),l(29,Wn,3,3,"th",5),e(30,`
        `),l(31,Yn,2,1,"td",6),e(32,`
      `),A(),e(33,`

      `),C(34,9),e(35,`
        `),l(36,Jn,3,3,"th",5),e(37,`
        `),l(38,Xn,3,3,"td",6),e(39,`
      `),A(),e(40,`

      `),l(41,Zn,1,0,"tr",10),e(42,`
      `),l(43,ea,1,0,"tr",11),e(44,`
    `),n(),e(45,`
  `),n(),e(46,`
`),n(),e(47,`
`)),s&2&&(a(5),u(c(6,4,"labels.inputs.Dividends")),a(6),d("dataSource",o.dataSource),a(30),d("matHeaderRowDef",o.displayedColumns),a(2),d("matRowDefColumns",o.displayedColumns))},dependencies:[D,et,T,Be,E,De,Ie,ye,Ee,Te,Me,Pe,Re,we,Fe],styles:[".tab-container[_ngcontent-%COMP%]{padding:1%;margin:1%}.tab-container[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin:1% auto}.tab-container[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]{width:100%}"]})}}return t})();function ta(t,p){if(t&1&&(i(0,"mat-option",15),e(1),n()),t&2){let r=p.$implicit;d("value",r.id),a(),S(`
          `,r.name,`
        `)}}var Ge=(()=>{class t{constructor(r,s,o){this.formBuilder=r,this.sharesService=s,this.settingsService=o,this.minDate=new Date(2e3,0,1),this.maxDate=new Date,this.sharesAccountProductTemplate=new ht,this.createSharesAccountDetailsForm()}ngOnInit(){this.maxDate=this.settingsService.businessDate,this.buildDependencies(),this.sharesAccountTemplate&&(this.productData=this.sharesAccountTemplate.productOptions,this.sharesAccountTemplate.productId&&this.sharesAccountDetailsForm.patchValue({productId:this.sharesAccountTemplate.productId,submittedDate:this.sharesAccountTemplate.timeline.submittedOnDate&&new Date(this.sharesAccountTemplate.timeline.submittedOnDate),externalId:this.sharesAccountTemplate.externalId}))}createSharesAccountDetailsForm(){this.sharesAccountDetailsForm=this.formBuilder.group({productId:["",$.required],submittedDate:["",$.required],externalId:[""]})}buildDependencies(){let r=this.sharesAccountTemplate.clientId;this.sharesAccountDetailsForm.get("productId").valueChanges.subscribe(s=>{this.sharesService.getSharesAccountTemplate(r,s).subscribe(o=>{this.sharesAccountProductTemplate.emit(o)})})}get sharesAccountDetails(){return this.sharesAccountDetailsForm.value}static{this.\u0275fac=function(s){return new(s||t)(x(le),x(B),x(q))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-shares-account-details-step"]],inputs:{sharesAccountTemplate:"sharesAccountTemplate"},outputs:{sharesAccountProductTemplate:"sharesAccountProductTemplate"},decls:74,vars:40,consts:[["submittedOnDatePicker",""],[3,"formGroup"],[1,"layout-row-wrap","gap-2px","responsive-column"],[1,"flex-48"],["formControlName","productId","required",""],[3,"value",4,"ngFor","ngForOf"],[1,"flex-48",3,"click"],["matInput","","formControlName","submittedDate","required","",3,"min","max","matDatepicker"],["matSuffix","",3,"for"],["matInput","","formControlName","externalId"],[1,"layout-row","align-center","gap-2percent","margin-t","responsive-column"],["mat-raised-button","","matStepperPrevious","","disabled",""],["icon","arrow-left",1,"m-r-10"],["mat-raised-button","","matStepperNext","",3,"disabled"],["icon","arrow-right",1,"m-l-10"],[3,"value"]],template:function(s,o){if(s&1){let h=w();i(0,"form",1),e(1,`
  `),i(2,"div",2),e(3,`
    `),i(4,"mat-form-field",3),e(5,`
      `),i(6,"mat-label"),e(7),m(8,"translate"),n(),e(9,`
      `),i(10,"mat-select",4),e(11,`
        `),l(12,ta,2,2,"mat-option",5),e(13,`
      `),n(),e(14,`
      `),i(15,"mat-error"),e(16),m(17,"translate"),m(18,"translate"),i(19,"strong"),e(20),m(21,"translate"),n(),e(22,`
      `),n(),e(23,`
    `),n(),e(24,`

    `),i(25,"mat-form-field",6),g("click",function(){y(h);let M=R(36);return I(M.open())}),e(26,`
      `),i(27,"mat-label"),e(28),m(29,"translate"),n(),e(30,`
      `),f(31,"input",7),e(32,`
      `),f(33,"mat-datepicker-toggle",8),e(34,`
      `),f(35,"mat-datepicker",null,0),e(37,`
      `),i(38,"mat-error"),e(39),m(40,"translate"),m(41,"translate"),i(42,"strong"),e(43),m(44,"translate"),n(),e(45,`
      `),n(),e(46,`
    `),n(),e(47,`

    `),i(48,"mat-form-field",3),e(49,`
      `),i(50,"mat-label"),e(51),m(52,"translate"),n(),e(53,`
      `),f(54,"input",9),e(55,`
    `),n(),e(56,`
  `),n(),e(57,`

  `),i(58,"div",10),e(59,`
    `),i(60,"button",11),e(61,`
      `),f(62,"fa-icon",12),e(63),m(64,"translate"),n(),e(65,`
    `),i(66,"button",13),e(67),m(68,"translate"),f(69,"fa-icon",14),e(70,`
    `),n(),e(71,`
  `),n(),e(72,`
`),n(),e(73,`
`)}if(s&2){let h,v=R(36);d("formGroup",o.sharesAccountDetailsForm),a(7),u(c(8,18,"labels.inputs.Product Name")),a(5),d("ngForOf",o.productData),a(4),P(`
        `,c(17,20,"labels.inputs.Product Name")," ",c(18,22,"labels.commons.is"),`
        `),a(4),u(c(21,24,"labels.commons.required")),a(8),u(c(29,26,"labels.inputs.Submitted On")),a(3),d("min",o.minDate)("max",o.maxDate)("matDatepicker",v),a(2),d("for",v),a(6),P(`
        `,c(40,28,"labels.inputs.Submission Date")," ",c(41,30,"labels.commons.is"),`
        `),a(4),u(c(44,32,"labels.commons.required")),a(8),u(c(52,34,"labels.inputs.External ID")),a(12),S(`
      `,c(64,36,"labels.buttons.Previous"),`
    `),a(3),d("disabled",!((h=o.sharesAccountDetailsForm.get("productId"))!=null&&h.value&&((h=o.sharesAccountDetailsForm.get("submittedDate"))!=null&&h.value))),a(),S(`
      `,c(68,38,"labels.buttons.Next"),`
      `)}},dependencies:[D,qe,T,Y,oe,se,W,pe,me,ce,X,J,he,fe,xe,nt,it,ve,_e,Se,k,E,Ue,be,ot],encapsulation:2})}}return t})();function ia(t,p){if(t&1&&(i(0,"span",3),e(1),m(2,"currency"),n()),t&2){let r=_();a(),u(Ce(2,1,r.calculateCurrenValue(),r.currency.code,"symbol-narrow","1.2-2"))}}function na(t,p){if(t&1&&(i(0,"mat-option",24),e(1),n()),t&2){let r=p.$implicit;d("value",r.id),a(),P(`
          `,r.accountNo," - ",r.savingsProductName,`
        `)}}function aa(t,p){if(t&1&&(i(0,"mat-option",24),e(1),m(2,"translateKey"),n()),t&2){let r=p.$implicit;d("value",r.id),a(),S(`
          `,ae(2,2,r.value,"catalogs"),`
        `)}}function ra(t,p){if(t&1&&(i(0,"mat-option",24),e(1),m(2,"translateKey"),n()),t&2){let r=p.$implicit;d("value",r.id),a(),S(`
          `,ae(2,2,r.value,"catalogs"),`
        `)}}var ze=(()=>{class t{constructor(r,s){this.formBuilder=r,this.settingsService=s,this.minDate=new Date(2e3,0,1),this.maxDate=new Date,this.isSavingsPatched=!1,this.currency=null,this.createSharesAccountTermsForm()}ngOnChanges(){this.sharesAccountProductTemplate&&(this.currency=this.sharesAccountProductTemplate.currency,this.sharesAccountTermsForm.patchValue({currencyCode:this.sharesAccountProductTemplate.currency.code,decimal:this.sharesAccountProductTemplate.currency.decimalPlaces,currencyMultiple:this.sharesAccountProductTemplate.currency.inMultiplesOf,unitPrice:this.sharesAccountProductTemplate.currentMarketPrice,savingsAccountId:""}),this.setOptions(),this.sharesAccountTemplate&&!this.isSavingsPatched&&this.sharesAccountTemplate.savingsAccountId&&(this.sharesAccountTermsForm.get("savingsAccountId").patchValue(this.sharesAccountTemplate.savingsAccountId),this.isSavingsPatched=!0))}ngOnInit(){this.maxDate=this.settingsService.businessDate,this.sharesAccountTemplate&&this.sharesAccountTermsForm.patchValue({requestedShares:this.sharesAccountTemplate.summary.totalPendingForApprovalShares,minimumActivePeriod:this.sharesAccountTemplate.minimumActivePeriod,minimumActivePeriodFrequencyType:this.sharesAccountTemplate.minimumActivePeriod&&this.sharesAccountTemplate.minimumActivePeriodTypeEnum.id,lockinPeriodFrequency:this.sharesAccountTemplate.lockinPeriod,lockinPeriodFrequencyType:this.sharesAccountTemplate.lockinPeriod&&this.sharesAccountTemplate.lockPeriodTypeEnum.id,applicationDate:this.sharesAccountTemplate.purchasedShares[0].purchasedDate&&new Date(this.sharesAccountTemplate.purchasedShares[0].purchasedDate),allowDividendCalculationForInactiveClients:this.sharesAccountTemplate.allowDividendCalculationForInactiveClients})}createSharesAccountTermsForm(){this.sharesAccountTermsForm=this.formBuilder.group({currencyCode:[{value:"",disabled:!0}],decimal:[{value:"",disabled:!0}],requestedShares:["",$.required],unitPrice:[{value:"",disabled:!0}],currencyMultiple:[{value:"",disabled:!0}],savingsAccountId:["",$.required],minimumActivePeriod:[""],minimumActivePeriodFrequencyType:[""],lockinPeriodFrequency:[""],lockinPeriodFrequencyType:[""],applicationDate:["",$.required],allowDividendCalculationForInactiveClients:[!1]})}setOptions(){this.minimumActivePeriodFrequencyTypeData=this.sharesAccountProductTemplate.minimumActivePeriodFrequencyTypeOptions,this.lockinPeriodFrequencyTypeData=this.sharesAccountProductTemplate.lockinPeriodFrequencyTypeOptions,this.savingsAccountsData=this.sharesAccountProductTemplate.clientSavingsAccounts}get sharesAccountTerms(){return this.sharesAccountTermsForm.value}calculateCurrenValue(){return this.sharesAccountTermsForm.value.requestedShares&&this.sharesAccountProductTemplate.currentMarketPrice?this.sharesAccountProductTemplate.currentMarketPrice*this.sharesAccountTermsForm.value.requestedShares:0}static{this.\u0275fac=function(s){return new(s||t)(x(le),x(q))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-shares-account-terms-step"]],inputs:{sharesAccountProductTemplate:"sharesAccountProductTemplate",sharesAccountTemplate:"sharesAccountTemplate"},features:[ut],decls:157,vars:78,consts:[["applicationDatePicker",""],[3,"formGroup"],[1,"layout-row-wrap","gap-2percent","responsive-column","align-start-center"],[1,"flex-48"],["matInput","","formControlName","currencyCode"],["type","number","matInput","","formControlName","unitPrice"],["type","number","matInput","","formControlName","requestedShares","required",""],["class","flex-48",4,"ngIf"],["formControlName","savingsAccountId","required",""],[3,"value",4,"ngFor","ngForOf"],[1,"flex-48",3,"click"],["matInput","","formControlName","applicationDate","required","",3,"min","max","matDatepicker"],["matSuffix","",3,"for"],["labelPosition","before","formControlName","allowDividendCalculationForInactiveClients",1,"flex-48"],[1,"mat-h4","flex-98"],["type","number","matInput","","formControlName","minimumActivePeriod"],["formControlName","minimumActivePeriodFrequencyType"],["type","number","matInput","","formControlName","lockinPeriodFrequency"],["formControlName","lockinPeriodFrequencyType"],[1,"layout-row","align-center","gap-2percent","margin-t","responsive-column"],["mat-raised-button","","matStepperPrevious",""],["icon","arrow-left",1,"m-r-10"],["mat-raised-button","","matStepperNext",""],["icon","arrow-right",1,"m-l-10"],[3,"value"]],template:function(s,o){if(s&1){let h=w();i(0,"form",1),e(1,`
  `),i(2,"div",2),e(3,`
    `),i(4,"mat-form-field",3),e(5,`
      `),i(6,"mat-label"),e(7),m(8,"translate"),n(),e(9,`
      `),f(10,"input",4),e(11,`
    `),n(),e(12,`

    `),i(13,"mat-form-field",3),e(14,`
      `),i(15,"mat-label"),e(16),m(17,"translate"),n(),e(18,`
      `),f(19,"input",5),e(20,`
    `),n(),e(21,`

    `),i(22,"mat-form-field",3),e(23,`
      `),i(24,"mat-label"),e(25),m(26,"translate"),n(),e(27,`
      `),f(28,"input",6),e(29,`
      `),i(30,"mat-error"),e(31),m(32,"translate"),m(33,"translate"),i(34,"strong"),e(35),m(36,"translate"),n(),e(37,`
      `),n(),e(38,`
    `),n(),e(39,`
    `),l(40,ia,3,6,"span",7),e(41,`

    `),i(42,"mat-form-field",3),e(43,`
      `),i(44,"mat-label"),e(45),m(46,"translate"),n(),e(47,`
      `),i(48,"mat-select",8),e(49,`
        `),l(50,na,2,3,"mat-option",9),e(51,`
      `),n(),e(52,`
      `),i(53,"mat-error"),e(54),m(55,"translate"),m(56,"translate"),i(57,"strong"),e(58),m(59,"translate"),n(),e(60,`
      `),n(),e(61,`
    `),n(),e(62,`

    `),i(63,"mat-form-field",10),g("click",function(){y(h);let M=R(74);return I(M.open())}),e(64,`
      `),i(65,"mat-label"),e(66),m(67,"translate"),n(),e(68,`
      `),f(69,"input",11),e(70,`
      `),f(71,"mat-datepicker-toggle",12),e(72,`
      `),f(73,"mat-datepicker",null,0),e(75,`
      `),i(76,"mat-error"),e(77),m(78,"translate"),m(79,"translate"),i(80,"strong"),e(81),m(82,"translate"),n(),e(83,`
      `),n(),e(84,`
    `),n(),e(85,`

    `),i(86,"mat-checkbox",13),e(87),m(88,"translate"),n(),e(89,`

    `),i(90,"h4",14),e(91),m(92,"translate"),n(),e(93,`

    `),i(94,"mat-form-field",3),e(95,`
      `),i(96,"mat-label"),e(97),m(98,"translate"),n(),e(99,`
      `),f(100,"input",15),e(101,`
    `),n(),e(102,`

    `),i(103,"mat-form-field",3),e(104,`
      `),i(105,"mat-label"),e(106),m(107,"translate"),n(),e(108,`
      `),i(109,"mat-select",16),e(110,`
        `),l(111,aa,3,5,"mat-option",9),e(112,`
      `),n(),e(113,`
    `),n(),e(114,`

    `),i(115,"h4",14),e(116),m(117,"translate"),n(),e(118,`

    `),i(119,"mat-form-field",3),e(120,`
      `),i(121,"mat-label"),e(122),m(123,"translate"),n(),e(124,`
      `),f(125,"input",17),e(126,`
    `),n(),e(127,`

    `),i(128,"mat-form-field",3),e(129,`
      `),i(130,"mat-label"),e(131),m(132,"translate"),n(),e(133,`
      `),i(134,"mat-select",18),e(135,`
        `),l(136,ra,3,5,"mat-option",9),e(137,`
      `),n(),e(138,`
    `),n(),e(139,`
  `),n(),e(140,`

  `),i(141,"div",19),e(142,`
    `),i(143,"button",20),e(144,`
      `),f(145,"fa-icon",21),e(146),m(147,"translate"),n(),e(148,`
    `),i(149,"button",22),e(150),m(151,"translate"),f(152,"fa-icon",23),e(153,`
    `),n(),e(154,`
  `),n(),e(155,`
`),n(),e(156,`
`)}if(s&2){let h=R(74);d("formGroup",o.sharesAccountTermsForm),a(7),u(c(8,32,"labels.inputs.Currency")),a(9),u(c(17,34,"labels.inputs.Current Price")),a(9),u(c(26,36,"labels.inputs.Total Number of Shares")),a(6),P(`
        `,c(32,38,"labels.inputs.Total Number of Shares")," ",c(33,40,"labels.commons.is"),`
        `),a(4),u(c(36,42,"labels.commons.required")),a(5),d("ngIf",o.currency),a(5),u(c(46,44,"labels.inputs.Default Savings Account")),a(5),d("ngForOf",o.savingsAccountsData),a(4),P(`
        `,c(55,46,"labels.inputs.Default Savings Account")," ",c(56,48,"labels.commons.is"),`
        `),a(4),u(c(59,50,"labels.commons.required")),a(8),u(c(67,52,"labels.inputs.Application Date")),a(3),d("min",o.minDate)("max",o.maxDate)("matDatepicker",h),a(2),d("for",h),a(6),P(`
        `,c(78,54,"labels.inputs.Application Date")," ",c(79,56,"labels.commons.is"),`
        `),a(4),u(c(82,58,"labels.commons.required")),a(6),S(`
      `,c(88,60,"labels.inputs.Allow dividends for inactive clients"),`
    `),a(4),u(c(92,62,"labels.heading.Minimum Active Period")),a(6),u(c(98,64,"labels.inputs.Frequency")),a(9),u(c(107,66,"labels.inputs.Type")),a(5),d("ngForOf",o.minimumActivePeriodFrequencyTypeData),a(5),u(c(117,68,"labels.heading.Lock-in Period")),a(6),u(c(123,70,"labels.inputs.Frequency")),a(9),u(c(132,72,"labels.inputs.Type")),a(5),d("ngForOf",o.lockinPeriodFrequencyTypeData),a(10),S(`
      `,c(147,74,"labels.buttons.Previous"),`
    `),a(4),S(`
      `,c(151,76,"labels.buttons.Next"),`
      `)}},dependencies:[D,qe,j,et,T,Y,oe,hi,se,W,pe,me,ce,X,J,he,fe,xe,nt,it,ve,_e,Se,k,Ci,E,je,Ue,be,ot],styles:["h4[_ngcontent-%COMP%]{font-weight:500;margin:1em 0}.margin-t[_ngcontent-%COMP%]{margin-top:1em}"]})}}return t})();function oa(t,p){if(t&1&&(i(0,"mat-option",22),e(1),n()),t&2){let r=p.$implicit;d("value",r),a(),S(`
        `,r.name,`
      `)}}function sa(t,p){t&1&&(i(0,"th",23),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.name")))}function ma(t,p){if(t&1&&(i(0,"td",24),e(1),n()),t&2){let r=p.$implicit;a(),S(`
        `,r.name+", "+r.currency.displaySymbol,`
      `)}}function ca(t,p){t&1&&(i(0,"th",23),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Type")))}function pa(t,p){if(t&1&&(i(0,"td",24),e(1),m(2,"translateKey"),n()),t&2){let r=p.$implicit;a(),S(`
        `,ae(2,1,r.chargeCalculationType.value,"catalogs"),`
      `)}}function la(t,p){t&1&&(i(0,"th",23),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Amount")))}function da(t,p){if(t&1){let r=w();i(0,"td",24),e(1),i(2,"button",25),g("click",function(){let o=y(r).$implicit,h=_();return I(h.editCharge(o))}),e(3,`
          `),f(4,"fa-icon",26),e(5,`
        `),n(),e(6,`
      `),n()}if(t&2){let r=p.$implicit;a(),S(`
        `,r.amount||r.amountOrPercentage,`
        `)}}function ua(t,p){t&1&&(i(0,"th",23),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Collected On")))}function ha(t,p){if(t&1&&(i(0,"td",24),e(1),m(2,"translateKey"),n()),t&2){let r=p.$implicit;a(),S(`
        `,ae(2,1,r.chargeTimeType.value,"catalogs"),`
      `)}}function fa(t,p){t&1&&(i(0,"th",23),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Actions")))}function xa(t,p){if(t&1){let r=w();i(0,"td",24),e(1,`
        `),i(2,"button",27),g("click",function(){let o=y(r).$implicit,h=_();return I(h.deleteCharge(o))}),e(3,`
          `),f(4,"fa-icon",28),e(5,`
        `),n(),e(6,`
      `),n()}}function Sa(t,p){t&1&&f(0,"tr",29)}function va(t,p){t&1&&f(0,"tr",30)}var Qe=(()=>{class t{constructor(r,s){this.dialog=r,this.translateService=s,this.chargeData=[],this.chargesDataSource=[],this.pristine=!0,this.isChargesPatched=!1,this.displayedColumns=["name","chargeCalculationType","amount","chargeTimeType","action"]}ngOnInit(){this.currencyCode.valueChanges.subscribe(()=>{!this.isChargesPatched&&this.sharesAccountTemplate.charges?(this.chargesDataSource=this.sharesAccountTemplate.charges,this.isChargesPatched=!0):this.chargesDataSource=[]})}ngOnChanges(){this.sharesAccountProductTemplate&&(this.chargeData=this.sharesAccountTemplate.chargeOptions,this.chargesDataSource=this.sharesAccountProductTemplate.charges)}addCharge(r){this.chargesDataSource=this.chargesDataSource.concat([r.value]),r.value="",this.pristine=!1}editCharge(r){let s=[new ki({controlName:"amount",label:this.translateService.instant("labels.inputs.Amount"),value:r.amount||r.amountOrPercentage,type:"number",required:!1})],o={title:this.translateService.instant("labels.heading.Edit Charge"),layout:{addButtonText:"Submit"},formfields:s};this.dialog.open(Ai,{data:o}).afterClosed().subscribe(v=>{if(v.data){let M=Q(V({},r),{amount:v.data.value.amount});this.chargesDataSource.splice(this.chargesDataSource.indexOf(r),1,M),this.chargesDataSource=this.chargesDataSource.concat([])}}),this.pristine=!1}deleteCharge(r){this.dialog.open(Tt,{data:{deleteContext:`charge ${r.name}`}}).afterClosed().subscribe(o=>{o.delete&&(this.chargesDataSource.splice(this.chargesDataSource.indexOf(r),1),this.chargesDataSource=this.chargesDataSource.concat([]))}),this.pristine=!1}get sharesAccountCharges(){return{charges:this.chargesDataSource}}static{this.\u0275fac=function(s){return new(s||t)(x(He),x(di))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-shares-account-charges-step"]],inputs:{sharesAccountProductTemplate:"sharesAccountProductTemplate",sharesAccountTemplate:"sharesAccountTemplate",currencyCode:"currencyCode"},features:[ut],decls:83,vars:22,consts:[["charge",""],[1,"layout-row-wrap","gap-2px","responsive-column"],[1,"flex-48"],[3,"value",4,"ngFor","ngForOf"],[1,"flex-48","align-center"],["type","button","mat-raised-button","","color","primary",3,"click","disabled"],["icon","plus",1,"m-r-10"],["mat-table","",1,"flex-98","mat-elevation-z1",3,"dataSource","hidden"],["matColumnDef","name"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","chargeCalculationType"],["matColumnDef","amount"],["matColumnDef","chargeTimeType"],["matColumnDef","action"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[1,"layout-row","responsive-column","align-center","gap-2px","margin-t"],["mat-raised-button","","matStepperPrevious",""],["icon","arrow-left",1,"m-r-10"],["mat-raised-button","","matStepperNext",""],["icon","arrow-right",1,"m-l-10"],[3,"value"],["mat-header-cell",""],["mat-cell",""],["mat-icon-button","","color","primary",3,"click"],["icon","pen"],["mat-icon-button","","color","warn",3,"click"],["icon","trash"],["mat-header-row",""],["mat-row",""]],template:function(s,o){if(s&1){let h=w();i(0,"div",1),e(1,`
  `),i(2,"mat-form-field",2),e(3,`
    `),i(4,"mat-label"),e(5),m(6,"translate"),n(),e(7,`
    `),i(8,"mat-select",null,0),e(10,`
      `),l(11,oa,2,2,"mat-option",3),m(12,"chargesFilter"),e(13,`
    `),n(),e(14,`
  `),n(),e(15,`

  `),i(16,"div",4),e(17,`
    `),i(18,"button",5),g("click",function(){y(h);let M=R(9);return I(o.addCharge(M))}),e(19,`
      `),f(20,"fa-icon",6),e(21),m(22,"translate"),n(),e(23,`
  `),n(),e(24,`

  `),i(25,"table",7),e(26,`
    `),C(27,8),e(28,`
      `),l(29,sa,3,3,"th",9),e(30,`
      `),l(31,ma,2,1,"td",10),e(32,`
    `),A(),e(33,`

    `),C(34,11),e(35,`
      `),l(36,ca,3,3,"th",9),e(37,`
      `),l(38,pa,3,4,"td",10),e(39,`
    `),A(),e(40,`

    `),C(41,12),e(42,`
      `),l(43,la,3,3,"th",9),e(44,`
      `),l(45,da,7,1,"td",10),e(46,`
    `),A(),e(47,`

    `),C(48,13),e(49,`
      `),l(50,ua,3,3,"th",9),e(51,`
      `),l(52,ha,3,4,"td",10),e(53,`
    `),A(),e(54,`

    `),C(55,14),e(56,`
      `),l(57,fa,3,3,"th",9),e(58,`
      `),l(59,xa,7,0,"td",10),e(60,`
    `),A(),e(61,`

    `),l(62,Sa,1,0,"tr",15),e(63,`
    `),l(64,va,1,0,"tr",16),e(65,`
  `),n(),e(66,`
`),n(),e(67,`

`),i(68,"div",17),e(69,`
  `),i(70,"button",18),e(71,`
    `),f(72,"fa-icon",19),e(73),m(74,"translate"),n(),e(75,`
  `),i(76,"button",20),e(77),m(78,"translate"),f(79,"fa-icon",21),e(80,`
  `),n(),e(81,`
`),n(),e(82,`
`)}if(s&2){let h=R(9);a(5),u(c(6,10,"labels.inputs.Charge")),a(6),d("ngForOf",mi(12,12,o.chargeData,o.chargesDataSource,o.currencyCode.value)),a(7),d("disabled",!h.value),a(3),S(`
      `,c(22,16,"labels.buttons.Add"),`
    `),a(4),d("dataSource",o.chargesDataSource)("hidden",o.chargesDataSource.length===0),a(37),d("matHeaderRowDef",o.displayedColumns),a(2),d("matRowDefColumns",o.displayedColumns),a(9),S(`
    `,c(74,18,"labels.buttons.Previous"),`
  `),a(4),S(`
    `,c(78,20,"labels.buttons.Next"),`
    `)}},dependencies:[D,qe,T,X,J,nt,it,k,E,je,be,De,Ie,ye,Ee,Te,Me,St,Pe,Re,we,Fe,Ue,ot,Pi],styles:["table[_ngcontent-%COMP%]{width:100%}.mat-elevation-z1[_ngcontent-%COMP%]{margin:1em 0 1.5em}.margin-t[_ngcontent-%COMP%]{margin-top:1em}"]})}}return t})();var _a=t=>[t],Ca=()=>["../"];function Aa(t,p){if(t&1&&(i(0,"span",4),e(1,`
      `),f(2,"mifosx-external-identifier",13),e(3,`
    `),n()),t&2){let r=_();a(2),H("externalId",r.sharesAccount.externalId)}}function ga(t,p){t&1&&(i(0,"span",4),e(1),m(2,"translate"),n()),t&2&&(a(),S(`
      `,c(2,1,"labels.inputs.Unassigned"),`
    `))}function ba(t,p){if(t&1&&(i(0,"div",2),e(1,`
    `),i(2,"span",3),e(3),m(4,"translate"),n(),e(5,`
    `),i(6,"span",4),e(7),m(8,"find"),m(9,"translateKey"),n(),e(10,`
  `),n()),t&2){let r=_();a(3),u(c(4,3,"labels.inputs.Minimum Active Period")),a(4),P("",r.sharesAccount.minimumActivePeriod,"\xA0",ae(9,10,Ce(8,5,r.sharesAccount.minimumActivePeriodFrequencyType,r.sharesAccountProductTemplate.minimumActivePeriodFrequencyTypeOptions,"id","value"),"catalogs"),"")}}function Da(t,p){if(t&1&&(i(0,"div",2),e(1,`
    `),i(2,"span",3),e(3),m(4,"translate"),n(),e(5,`
    `),i(6,"span",4),e(7),m(8,"find"),m(9,"translateKey"),n(),e(10,`
  `),n()),t&2){let r=_();a(3),u(c(4,3,"labels.inputs.Lock-in Period")),a(4),P("",r.sharesAccount.lockinPeriodFrequency,"\xA0",ae(9,10,Ce(8,5,r.sharesAccount.lockinPeriodFrequencyType,r.sharesAccountProductTemplate.lockinPeriodFrequencyTypeOptions,"id","value"),"catalogs"),"")}}function Ta(t,p){t&1&&(i(0,"th",24),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.name")))}function ya(t,p){if(t&1&&(i(0,"td",25),e(1),n()),t&2){let r=p.$implicit;a(),S(`
          `,r.name+", "+r.currency.displaySymbol,`
        `)}}function Ia(t,p){t&1&&(i(0,"th",24),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Type")))}function Ea(t,p){if(t&1&&(i(0,"td",25),e(1),m(2,"translateKey"),n()),t&2){let r=p.$implicit;a(),S(`
          `,ae(2,1,r.chargeCalculationType.value,"catalogs"),`
        `)}}function Ma(t,p){t&1&&(i(0,"th",24),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Amount")))}function Pa(t,p){if(t&1&&(i(0,"td",25),e(1),n()),t&2){let r=p.$implicit;a(),S(`
          `,r.amount||r.amountOrPercentage,`
        `)}}function wa(t,p){t&1&&(i(0,"th",24),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Collected On")))}function Ra(t,p){if(t&1&&(i(0,"td",25),e(1),m(2,"translateKey"),n()),t&2){let r=p.$implicit;a(),S(`
          `,ae(2,1,r.chargeTimeType.value,"catalogs"),`
        `)}}function Fa(t,p){t&1&&f(0,"tr",26)}function Ba(t,p){t&1&&f(0,"tr",27)}function ka(t,p){if(t&1&&(i(0,"div",14),e(1,`
    `),i(2,"h3",1),e(3),m(4,"translate"),n(),e(5,`

    `),f(6,"mat-divider",2),e(7,`
    `),i(8,"table",15),e(9,`
      `),C(10,16),e(11,`
        `),l(12,Ta,3,3,"th",17),e(13,`
        `),l(14,ya,2,1,"td",18),e(15,`
      `),A(),e(16,`

      `),C(17,19),e(18,`
        `),l(19,Ia,3,3,"th",17),e(20,`
        `),l(21,Ea,3,4,"td",18),e(22,`
      `),A(),e(23,`

      `),C(24,20),e(25,`
        `),l(26,Ma,3,3,"th",17),e(27,`
        `),l(28,Pa,2,1,"td",18),e(29,`
      `),A(),e(30,`

      `),C(31,21),e(32,`
        `),l(33,wa,3,3,"th",17),e(34,`
        `),l(35,Ra,3,4,"td",18),e(36,`
      `),A(),e(37,`

      `),l(38,Fa,1,0,"tr",22),e(39,`
      `),l(40,Ba,1,0,"tr",23),e(41,`
    `),n(),e(42,`
  `),n()),t&2){let r=_();a(3),u(c(4,4,"labels.heading.Charges")),a(5),d("dataSource",r.sharesAccount.charges),a(30),d("matHeaderRowDef",r.chargesDisplayedColumns),a(2),d("matRowDefColumns",r.chargesDisplayedColumns)}}var ct=(()=>{class t{constructor(){this.chargesDisplayedColumns=["name","chargeCalculationType","amount","chargeTimeType"],this.submitEvent=new ht}static{this.\u0275fac=function(s){return new(s||t)}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-shares-account-preview-step"]],inputs:{sharesAccountProductTemplate:"sharesAccountProductTemplate",sharesAccountTemplate:"sharesAccountTemplate",sharesAccountTermsForm:"sharesAccountTermsForm",sharesAccount:"sharesAccount"},outputs:{submitEvent:"submitEvent"},decls:148,vars:90,consts:[[1,"layout-row-wrap","responsive-column"],[1,"mat-h3","flex-fill"],[1,"flex-fill"],[1,"flex-40"],[1,"flex-60"],["class","flex-60",4,"ngIf"],["class","flex-fill",4,"ngIf"],["class","layout-row-wrap responsive-column flex-fill",4,"ngIf"],[1,"layout-row","responsive-column","align-center","gap-2px","margin-t"],["mat-raised-button","","matStepperPrevious",""],["icon","arrow-left",1,"m-r-10"],["mat-raised-button","",3,"routerLink"],["mat-raised-button","","color","primary",3,"click"],[3,"externalId"],[1,"layout-row-wrap","responsive-column","flex-fill"],["mat-table","",1,"flex-fill","mat-elevation-z1",3,"dataSource"],["matColumnDef","name"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","chargeCalculationType"],["matColumnDef","amount"],["matColumnDef","chargeTimeType"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],["mat-header-cell",""],["mat-cell",""],["mat-header-row",""],["mat-row",""]],template:function(s,o){s&1&&(i(0,"div",0),e(1,`
  `),i(2,"h3",1),e(3),m(4,"translate"),n(),e(5,`

  `),f(6,"mat-divider",2),e(7,`
  `),i(8,"div",2),e(9,`
    `),i(10,"span",3),e(11),m(12,"translate"),n(),e(13,`
    `),i(14,"span",4),e(15),m(16,"find"),n(),e(17,`
  `),n(),e(18,`

  `),i(19,"div",2),e(20,`
    `),i(21,"span",3),e(22),m(23,"translate"),n(),e(24,`
    `),i(25,"span",4),e(26),m(27,"dateFormat"),n(),e(28,`
  `),n(),e(29,`

  `),i(30,"div",2),e(31,`
    `),i(32,"span",3),e(33),m(34,"translate"),n(),e(35,`
    `),l(36,Aa,4,1,"span",5),e(37,`
    `),l(38,ga,3,3,"span",5),e(39,`
  `),n(),e(40,`

  `),i(41,"h3",1),e(42),m(43,"translate"),n(),e(44,`

  `),f(45,"mat-divider",2),e(46,`
  `),i(47,"div",2),e(48,`
    `),i(49,"span",3),e(50),m(51,"translate"),n(),e(52,`
    `),i(53,"span",4),e(54),m(55,"find"),n(),e(56,`
  `),n(),e(57,`

  `),i(58,"div",2),e(59,`
    `),i(60,"span",3),e(61),m(62,"translate"),n(),e(63,`
    `),i(64,"span",4),e(65),m(66,"formatNumber"),n(),e(67,`
  `),n(),e(68,`

  `),i(69,"div",2),e(70,`
    `),i(71,"span",3),e(72),m(73,"translate"),n(),e(74,`
    `),i(75,"span",4),e(76),m(77,"formatNumber"),n(),e(78,`
  `),n(),e(79,`

  `),i(80,"div",2),e(81,`
    `),i(82,"span",3),e(83),m(84,"translate"),n(),e(85,`
    `),i(86,"span",4),e(87),m(88,"formatNumber"),n(),e(89,`
  `),n(),e(90,`

  `),i(91,"div",2),e(92,`
    `),i(93,"span",3),e(94),m(95,"translate"),n(),e(96,`
    `),i(97,"span",4),e(98),m(99,"find"),n(),e(100,`
  `),n(),e(101,`

  `),l(102,ba,11,13,"div",6),e(103,`

  `),l(104,Da,11,13,"div",6),e(105,`

  `),i(106,"div",2),e(107,`
    `),i(108,"span",3),e(109),m(110,"translate"),n(),e(111,`
    `),i(112,"span",4),e(113),m(114,"dateFormat"),n(),e(115,`
  `),n(),e(116,`

  `),i(117,"div",2),e(118,`
    `),i(119,"span",3),e(120),m(121,"translate"),n(),e(122,`
    `),i(123,"span",4),e(124),m(125,"yesNo"),n(),e(126,`
  `),n(),e(127,`

  `),l(128,ka,43,6,"div",7),e(129,`
`),n(),e(130,`

`),i(131,"div",8),e(132,`
  `),i(133,"button",9),e(134,`
    `),f(135,"fa-icon",10),e(136),m(137,"translate"),n(),e(138,`
  `),i(139,"button",11),e(140),m(141,"translate"),n(),e(142,`
  `),i(143,"button",12),g("click",function(){return o.submitEvent.emit()}),e(144),m(145,"translate"),n(),e(146,`
`),n(),e(147,`
`)),s&2&&(a(3),u(c(4,30,"labels.heading.Details")),a(8),u(c(12,32,"labels.inputs.Product")),a(4),u(Ce(16,34,o.sharesAccount.productId,o.sharesAccountTemplate.productOptions,"id","name")),a(7),u(c(23,39,"labels.inputs.Submitted On")),a(4),u(c(27,41,o.sharesAccount.submittedDate)),a(7),u(c(34,43,"labels.inputs.External Id")),a(3),d("ngIf",o.sharesAccount.externalId),a(2),d("ngIf",!o.sharesAccount.externalId),a(4),u(c(43,45,"labels.heading.Terms")),a(8),u(c(51,47,"labels.inputs.Currency")),a(4),u(Ce(55,49,o.sharesAccountTermsForm.get("currencyCode").value,si(87,_a,o.sharesAccountProductTemplate.currency),"code","displayLabel")),a(7),u(c(62,54,"labels.inputs.Total Number of Shares")),a(4),u(c(66,56,o.sharesAccount.requestedShares)),a(7),u(c(73,58,"labels.inputs.Current Price")),a(4),u(c(77,60,o.sharesAccountTermsForm.get("unitPrice").value)),a(7),u(c(84,62,"labels.inputs.Amount")),a(4),u(c(88,64,o.sharesAccount.requestedShares*o.sharesAccountTermsForm.get("unitPrice").value)),a(7),u(c(95,66,"labels.inputs.Default Savings Account")),a(4),u(Ce(99,68,o.sharesAccount.savingsAccountId,o.sharesAccountProductTemplate.clientSavingsAccounts,"id","accountNo")),a(4),d("ngIf",o.sharesAccount.minimumActivePeriod),a(2),d("ngIf",o.sharesAccount.lockinPeriodFrequency),a(5),u(c(110,73,"labels.inputs.Application Date")),a(4),u(c(114,75,o.sharesAccount.applicationDate)),a(7),u(c(121,77,"labels.inputs.Allow dividends for inactive clients")),a(4),u(c(125,79,o.sharesAccount.allowDividendCalculationForInactiveClients)),a(4),d("ngIf",o.sharesAccount.charges.length),a(8),S(`
    `,c(137,81,"labels.buttons.Previous"),`
  `),a(3),d("routerLink",N(89,Ca)),a(),S(`
    `,c(141,83,"labels.buttons.Cancel"),`
  `),a(4),S(`
    `,c(145,85,"labels.buttons.Submit"),`
  `))},dependencies:[D,j,T,K,k,Be,E,je,gi,wt,De,Ie,ye,Ee,Te,Me,Pe,Re,we,Fe,Ue,be,wi,st,Ri],styles:["table[_ngcontent-%COMP%]{width:100%}.mat-elevation-z1[_ngcontent-%COMP%]{margin:1em 0 1.5em}h2[_ngcontent-%COMP%], h3[_ngcontent-%COMP%], h4[_ngcontent-%COMP%]{margin:0;font-weight:500}span[_ngcontent-%COMP%]{margin:.5em 0}mat-divider[_ngcontent-%COMP%]{margin:0 0 .5em}.margin-t[_ngcontent-%COMP%]{margin-top:1em}"]})}}return t})();function Na(t,p){t&1&&(e(0,`
      `),f(1,"fa-icon",14),e(2,`
    `))}function Oa(t,p){t&1&&(e(0,`
      `),f(1,"fa-icon",14),e(2,`
    `))}function ja(t,p){t&1&&(e(0,`
      `),f(1,"fa-icon",15),e(2,`
    `))}function Va(t,p){t&1&&(e(0,`
      `),f(1,"fa-icon",16),e(2,`
    `))}function qa(t,p){t&1&&(e(0,`
      `),f(1,"fa-icon",17),e(2,`
    `))}function Ha(t,p){t&1&&(e(0),m(1,"translate")),t&2&&u(c(1,1,"labels.inputs.DETAILS"))}function La(t,p){t&1&&(e(0),m(1,"translate")),t&2&&u(c(1,1,"labels.inputs.TERMS"))}function Ua(t,p){t&1&&(e(0),m(1,"translate")),t&2&&u(c(1,1,"labels.inputs.CHARGES"))}function $a(t,p){t&1&&(e(0),m(1,"translate")),t&2&&u(c(1,1,"labels.inputs.PREVIEW"))}function Ga(t,p){if(t&1){let r=w();i(0,"mat-step",18),e(1,`
      `),l(2,$a,2,3,"ng-template",9),e(3,`

      `),i(4,"mifosx-shares-account-preview-step",19),g("submitEvent",function(){y(r);let o=_();return I(o.submit())}),e(5,`
      `),n(),e(6,`
    `),n()}if(t&2){let r=_();a(4),d("sharesAccountProductTemplate",r.sharesAccountProductTemplate)("sharesAccountTemplate",r.sharesAccountTemplate)("sharesAccountTermsForm",r.sharesAccountTermsForm)("sharesAccount",r.sharesAccount)}}var Vt=(()=>{class t{constructor(r,s,o,h,v){this.route=r,this.router=s,this.dateUtils=o,this.sharesService=h,this.settingsService=v,this.route.data.subscribe(M=>{this.sharesAccountTemplate=M.sharesAccountTemplate})}setTemplate(r){this.sharesAccountProductTemplate=r}get sharesAccountDetailsForm(){return this.sharesAccountDetailsStep.sharesAccountDetailsForm}get sharesAccountTermsForm(){return this.sharesAccountTermsStep.sharesAccountTermsForm}get sharesAccountFormValid(){return this.sharesAccountDetailsForm.valid&&this.sharesAccountTermsForm.valid}get sharesAccount(){return V(V(V({},this.sharesAccountDetailsStep.sharesAccountDetails),this.sharesAccountTermsStep.sharesAccountTerms),this.sharesAccountChargesStep.sharesAccountCharges)}submit(){let r=this.settingsService.language.code,s=this.settingsService.dateFormat,o=Q(V({},this.sharesAccount),{clientId:this.sharesAccountTemplate.clientId,charges:this.sharesAccount.charges.map(h=>({chargeId:h.id,amount:h.amount})),applicationDate:this.dateUtils.formatDate(this.sharesAccount.applicationDate,s),submittedDate:this.dateUtils.formatDate(this.sharesAccount.submittedDate,s),unitPrice:this.sharesAccountTermsForm.get("unitPrice").value,dateFormat:s,locale:r});this.sharesService.createSharesAccount(o).subscribe(h=>{this.router.navigate(["../",h.resourceId],{relativeTo:this.route})})}static{this.\u0275fac=function(s){return new(s||t)(x(F),x(z),x(re),x(B),x(q))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-create-shares-account"]],viewQuery:function(s,o){if(s&1&&(te(Ge,7),te(ze,7),te(Qe,7)),s&2){let h;ie(h=ne())&&(o.sharesAccountDetailsStep=h.first),ie(h=ne())&&(o.sharesAccountTermsStep=h.first),ie(h=ne())&&(o.sharesAccountChargesStep=h.first)}},decls:42,vars:9,consts:[["shareProductStepper",""],[1,"container"],["orientation","vertical","labelPosition","bottom",1,"mat-elevation-z8",3,"linear"],["matStepperIcon","number"],["matStepperIcon","edit"],["matStepperIcon","done"],["matStepperIcon","error"],["matStepperIcon","preview"],[3,"stepControl"],["matStepLabel",""],[3,"sharesAccountProductTemplate","sharesAccountTemplate"],[3,"sharesAccountProductTemplate"],[3,"sharesAccountProductTemplate","sharesAccountTemplate","currencyCode"],["completed","",4,"ngIf"],["icon","pencil-alt","size","sm"],["icon","check","size","sm"],["icon","exclamation-triangle","size","lg"],["icon","eye","size","sm"],["completed",""],[3,"submitEvent","sharesAccountProductTemplate","sharesAccountTemplate","sharesAccountTermsForm","sharesAccount"]],template:function(s,o){if(s&1){let h=w();i(0,"div",1),e(1,`
  `),i(2,"mat-stepper",2,0),e(4,`
    `),l(5,Na,3,0,"ng-template",3),e(6,`

    `),l(7,Oa,3,0,"ng-template",4),e(8,`

    `),l(9,ja,3,0,"ng-template",5),e(10,`

    `),l(11,Va,3,0,"ng-template",6),e(12,`

    `),l(13,qa,3,0,"ng-template",7),e(14,`

    `),i(15,"mat-step",8),e(16,`
      `),l(17,Ha,2,3,"ng-template",9),e(18,`

      `),i(19,"mifosx-shares-account-details-step",10),g("sharesAccountProductTemplate",function(M){return y(h),I(o.setTemplate(M))}),e(20,`
      `),n(),e(21,`
    `),n(),e(22,`

    `),i(23,"mat-step",8),e(24,`
      `),l(25,La,2,3,"ng-template",9),e(26,`

      `),f(27,"mifosx-shares-account-terms-step",11),e(28,`
    `),n(),e(29,`

    `),i(30,"mat-step"),e(31,`
      `),l(32,Ua,2,3,"ng-template",9),e(33,`

      `),i(34,"mifosx-shares-account-charges-step",12),e(35,`
      `),n(),e(36,`
    `),n(),e(37,`

    `),l(38,Ga,7,4,"mat-step",13),e(39,`
  `),n(),e(40,`
`),n(),e(41,`
`)}s&2&&(a(2),d("linear",!1),a(13),d("stepControl",o.sharesAccountDetailsForm),a(4),d("sharesAccountTemplate",o.sharesAccountTemplate),a(4),d("stepControl",o.sharesAccountTermsForm),a(4),d("sharesAccountProductTemplate",o.sharesAccountProductTemplate),a(7),d("sharesAccountProductTemplate",o.sharesAccountProductTemplate)("sharesAccountTemplate",o.sharesAccountTemplate)("currencyCode",o.sharesAccountTermsForm.get("currencyCode")),a(4),d("ngIf",o.sharesAccountFormValid))},dependencies:[D,j,T,E,Pt,Et,be,Mt,It,Ge,ze,Qe,ct],encapsulation:2})}}return t})();function za(t,p){t&1&&(e(0,`
      `),f(1,"fa-icon",13),e(2,`
    `))}function Qa(t,p){t&1&&(e(0,`
      `),f(1,"fa-icon",13),e(2,`
    `))}function Ka(t,p){t&1&&(e(0,`
      `),f(1,"fa-icon",14),e(2,`
    `))}function Wa(t,p){t&1&&(e(0,`
      `),f(1,"fa-icon",15),e(2,`
    `))}function Ya(t,p){t&1&&(e(0,`
      `),f(1,"fa-icon",16),e(2,`
    `))}function Ja(t,p){t&1&&(e(0),m(1,"translate")),t&2&&u(c(1,1,"labels.inputs.DETAILS"))}function Xa(t,p){t&1&&(e(0),m(1,"translate")),t&2&&u(c(1,1,"labels.inputs.TERMS"))}function Za(t,p){t&1&&(e(0),m(1,"translate")),t&2&&u(c(1,1,"labels.inputs.CHARGES"))}function er(t,p){t&1&&(e(0),m(1,"translate")),t&2&&u(c(1,1,"labels.inputs.PREVIEW"))}function tr(t,p){if(t&1){let r=w();i(0,"mat-step",17),e(1,`
      `),l(2,er,2,3,"ng-template",9),e(3,`

      `),i(4,"mifosx-shares-account-preview-step",18),g("submitEvent",function(){y(r);let o=_();return I(o.submit())}),e(5,`
      `),n(),e(6,`
    `),n()}if(t&2){let r=_();a(4),d("sharesAccountProductTemplate",r.sharesAccountProductTemplate)("sharesAccountTemplate",r.sharesAccountAndTemplate)("sharesAccountTermsForm",r.sharesAccountTermsForm)("sharesAccount",r.sharesAccount)}}var qt=(()=>{class t{constructor(r,s,o,h,v){this.route=r,this.router=s,this.dateUtils=o,this.sharesService=h,this.settingsService=v,this.route.data.subscribe(M=>{this.sharesAccountAndTemplate=M.sharesAccountAndTemplate})}setTemplate(r){this.sharesAccountProductTemplate=r}get sharesAccountDetailsForm(){return this.sharesAccountDetailsStep.sharesAccountDetailsForm}get sharesAccountTermsForm(){return this.sharesAccountTermsStep.sharesAccountTermsForm}get sharesAccountFormValidAndNotPristine(){return this.sharesAccountDetailsForm.valid&&this.sharesAccountTermsForm.valid&&(!this.sharesAccountDetailsForm.pristine||!this.sharesAccountTermsForm.pristine||!this.sharesAccountChargesStep.pristine)}get sharesAccount(){return V(V(V({},this.sharesAccountDetailsStep.sharesAccountDetails),this.sharesAccountTermsStep.sharesAccountTerms),this.sharesAccountChargesStep.sharesAccountCharges)}submit(){let r=this.settingsService.language.code,s=this.settingsService.dateFormat,o=Q(V({},this.sharesAccount),{clientId:this.sharesAccountAndTemplate.clientId,charges:this.sharesAccount.charges.map(h=>({chargeId:h.id,amount:h.amount})),applicationDate:this.dateUtils.formatDate(this.sharesAccount.applicationDate,s),submittedDate:this.dateUtils.formatDate(this.sharesAccount.submittedDate,s),unitPrice:this.sharesAccountTermsForm.get("unitPrice").value,dateFormat:s,locale:r});this.sharesService.updateSharesAccount(this.sharesAccountAndTemplate.id,o).subscribe(h=>{this.router.navigate(["../"],{relativeTo:this.route})})}static{this.\u0275fac=function(s){return new(s||t)(x(F),x(z),x(re),x(B),x(q))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-edit-shares-account"]],viewQuery:function(s,o){if(s&1&&(te(Ge,7),te(ze,7),te(Qe,7)),s&2){let h;ie(h=ne())&&(o.sharesAccountDetailsStep=h.first),ie(h=ne())&&(o.sharesAccountTermsStep=h.first),ie(h=ne())&&(o.sharesAccountChargesStep=h.first)}},decls:43,vars:10,consts:[["shareProductStepper",""],[1,"container"],["orientation","vertical","labelPosition","bottom",1,"mat-elevation-z8",3,"linear"],["matStepperIcon","number"],["matStepperIcon","edit"],["matStepperIcon","done"],["matStepperIcon","error"],["matStepperIcon","preview"],[3,"stepControl"],["matStepLabel",""],[3,"sharesAccountProductTemplate","sharesAccountTemplate"],[3,"sharesAccountProductTemplate","sharesAccountTemplate","currencyCode"],["completed","",4,"ngIf"],["icon","pencil-alt","size","sm"],["icon","check","size","sm"],["icon","exclamation-triangle","size","lg"],["icon","eye","size","sm"],["completed",""],[3,"submitEvent","sharesAccountProductTemplate","sharesAccountTemplate","sharesAccountTermsForm","sharesAccount"]],template:function(s,o){if(s&1){let h=w();i(0,"div",1),e(1,`
  `),i(2,"mat-stepper",2,0),e(4,`
    `),l(5,za,3,0,"ng-template",3),e(6,`

    `),l(7,Qa,3,0,"ng-template",4),e(8,`

    `),l(9,Ka,3,0,"ng-template",5),e(10,`

    `),l(11,Wa,3,0,"ng-template",6),e(12,`

    `),l(13,Ya,3,0,"ng-template",7),e(14,`

    `),i(15,"mat-step",8),e(16,`
      `),l(17,Ja,2,3,"ng-template",9),e(18,`

      `),i(19,"mifosx-shares-account-details-step",10),g("sharesAccountProductTemplate",function(M){return y(h),I(o.setTemplate(M))}),e(20,`
      `),n(),e(21,`
    `),n(),e(22,`

    `),i(23,"mat-step",8),e(24,`
      `),l(25,Xa,2,3,"ng-template",9),e(26,`

      `),i(27,"mifosx-shares-account-terms-step",10),e(28,`
      `),n(),e(29,`
    `),n(),e(30,`

    `),i(31,"mat-step"),e(32,`
      `),l(33,Za,2,3,"ng-template",9),e(34,`

      `),i(35,"mifosx-shares-account-charges-step",11),e(36,`
      `),n(),e(37,`
    `),n(),e(38,`

    `),l(39,tr,7,4,"mat-step",12),e(40,`
  `),n(),e(41,`
`),n(),e(42,`
`)}s&2&&(a(2),d("linear",!1),a(13),d("stepControl",o.sharesAccountDetailsForm),a(4),d("sharesAccountTemplate",o.sharesAccountAndTemplate),a(4),d("stepControl",o.sharesAccountTermsForm),a(4),d("sharesAccountProductTemplate",o.sharesAccountProductTemplate)("sharesAccountTemplate",o.sharesAccountAndTemplate),a(8),d("sharesAccountProductTemplate",o.sharesAccountProductTemplate)("sharesAccountTemplate",o.sharesAccountAndTemplate)("currencyCode",o.sharesAccountTermsForm.get("currencyCode")),a(4),d("ngIf",o.sharesAccountFormValidAndNotPristine))},dependencies:[D,j,T,E,Pt,Et,be,Mt,It,Ge,ze,Qe,ct],encapsulation:2})}}return t})();var ir=()=>["../../"];function nr(t,p){t&1&&(i(0,"mat-error"),e(1),m(2,"translate"),m(3,"translate"),i(4,"strong"),e(5),m(6,"translate"),n(),e(7,`
            `),n()),t&2&&(a(),P(`
              `,c(2,3,"labels.inputs.Approved On Date")," ",c(3,5,"labels.commons.is"),`
              `),a(4),u(c(6,7,"labels.commons.required")))}var Ht=(()=>{class t{constructor(r,s,o,h,v,M){this.formBuilder=r,this.sharesService=s,this.dateUtils=o,this.route=h,this.router=v,this.settingsService=M,this.minDate=new Date(2e3,0,1),this.maxDate=new Date,this.accountId=this.route.parent.snapshot.params.shareAccountId}ngOnInit(){this.maxDate=this.settingsService.businessDate,this.createApproveSharesAccountForm()}createApproveSharesAccountForm(){this.approveSharesAccountForm=this.formBuilder.group({approvedDate:["",$.required],note:[""]})}submit(){let r=this.approveSharesAccountForm.value,s=this.settingsService.language.code,o=this.settingsService.dateFormat,h=this.approveSharesAccountForm.value.approvedDate;r.approvedDate instanceof Date&&(r.approvedDate=this.dateUtils.formatDate(h,o));let v=Q(V({},r),{dateFormat:o,locale:s});this.sharesService.executeSharesAccountCommand(this.accountId,"approve",v).subscribe(()=>{this.router.navigate(["../../"],{relativeTo:this.route})})}static{this.\u0275fac=function(s){return new(s||t)(x(le),x(B),x(re),x(F),x(z),x(q))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-approve-shares-account"]],decls:51,vars:21,consts:[["approvedDatePicker",""],[1,"container"],[3,"ngSubmit","formGroup"],[1,"layout-column"],[3,"click"],["matInput","","required","","formControlName","approvedDate",3,"min","max","matDatepicker"],["matSuffix","",3,"for"],[4,"ngIf"],["matInput","","formControlName","note","cdkTextareaAutosize","","cdkAutosizeMinRows","2"],[1,"layout-row","align-center","gap-5px","responsive-column"],["type","button","mat-raised-button","",3,"routerLink"],["mat-raised-button","","color","primary",3,"disabled"]],template:function(s,o){if(s&1){let h=w();i(0,"div",1),e(1,`
  `),i(2,"mat-card"),e(3,`
    `),i(4,"form",2),g("ngSubmit",function(){return y(h),I(o.submit())}),e(5,`
      `),i(6,"mat-card-content"),e(7,`
        `),i(8,"div",3),e(9,`
          `),i(10,"mat-form-field",4),g("click",function(){y(h);let M=R(21);return I(M.open())}),e(11,`
            `),i(12,"mat-label"),e(13),m(14,"translate"),n(),e(15,`
            `),f(16,"input",5),e(17,`
            `),f(18,"mat-datepicker-toggle",6),e(19,`
            `),f(20,"mat-datepicker",null,0),e(22,`
            `),l(23,nr,8,9,"mat-error",7),e(24,`
          `),n(),e(25,`

          `),i(26,"mat-form-field"),e(27,`
            `),i(28,"mat-label"),e(29),m(30,"translate"),n(),e(31,`
            `),f(32,"textarea",8),e(33,`
          `),n(),e(34,`
        `),n(),e(35,`
      `),n(),e(36,`

      `),i(37,"mat-card-actions",9),e(38,`
        `),i(39,"button",10),e(40),m(41,"translate"),n(),e(42,`
        `),i(43,"button",11),e(44),m(45,"translate"),n(),e(46,`
      `),n(),e(47,`
    `),n(),e(48,`
  `),n(),e(49,`
`),n(),e(50,`
`)}if(s&2){let h=R(21);a(4),d("formGroup",o.approveSharesAccountForm),a(9),u(c(14,12,"labels.inputs.Approved On Date")),a(3),d("min",o.minDate)("max",o.maxDate)("matDatepicker",h),a(2),d("for",h),a(5),d("ngIf",o.approveSharesAccountForm.controls.approvedDate.hasError("required")),a(6),u(c(30,14,"labels.inputs.Note")),a(10),d("routerLink",N(20,ir)),a(),S(`
          `,c(41,16,"labels.buttons.Cancel"),`
        `),a(3),d("disabled",!o.approveSharesAccountForm.valid),a(),S(`
          `,c(45,18,"labels.buttons.Submit"),`
        `)}},dependencies:[D,j,T,Y,oe,se,W,pe,me,ce,K,de,ue,ge,X,J,he,fe,xe,ve,_e,Se,k,E,tt],styles:[".container[_ngcontent-%COMP%]{max-width:37rem}"]})}}return t})();var ar=()=>["../../"];function rr(t,p){t&1&&(i(0,"mat-error"),e(1),m(2,"translate"),m(3,"translate"),i(4,"strong"),e(5),m(6,"translate"),n(),e(7,`
            `),n()),t&2&&(a(),P(`
              `,c(2,3,"labels.inputs.Rejected On Date")," ",c(3,5,"labels.commons.is"),`
              `),a(4),u(c(6,7,"labels.commons.required")))}var Lt=(()=>{class t{constructor(r,s,o,h,v,M){this.formBuilder=r,this.sharesService=s,this.dateUtils=o,this.route=h,this.router=v,this.settingsService=M,this.minDate=new Date(2e3,0,1),this.maxDate=new Date,this.accountId=this.route.parent.snapshot.params.shareAccountId}ngOnInit(){this.maxDate=this.settingsService.businessDate,this.createRejectSharesAccountForm()}createRejectSharesAccountForm(){this.rejectSharesAccountForm=this.formBuilder.group({rejectedDate:["",$.required],note:[""]})}submit(){let r=this.rejectSharesAccountForm.value,s=this.settingsService.language.code,o=this.settingsService.dateFormat,h=this.rejectSharesAccountForm.value.rejectedDate;r.rejectedDate instanceof Date&&(r.rejectedDate=this.dateUtils.formatDate(h,o));let v=Q(V({},r),{dateFormat:o,locale:s});this.sharesService.executeSharesAccountCommand(this.accountId,"reject",v).subscribe(()=>{this.router.navigate(["../../"],{relativeTo:this.route})})}static{this.\u0275fac=function(s){return new(s||t)(x(le),x(B),x(re),x(F),x(z),x(q))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-reject-shares-account"]],decls:51,vars:21,consts:[["rejectedDatePicker",""],[1,"container"],[3,"ngSubmit","formGroup"],[1,"layout-column"],[3,"click"],["matInput","","required","","formControlName","rejectedDate",3,"min","max","matDatepicker"],["matSuffix","",3,"for"],[4,"ngIf"],["matInput","","formControlName","note","cdkTextareaAutosize","","cdkAutosizeMinRows","2"],[1,"layout-row","align-center","gap-5px","responsive-column"],["type","button","mat-raised-button","",3,"routerLink"],["mat-raised-button","","color","warn",3,"disabled"]],template:function(s,o){if(s&1){let h=w();i(0,"div",1),e(1,`
  `),i(2,"mat-card"),e(3,`
    `),i(4,"form",2),g("ngSubmit",function(){return y(h),I(o.submit())}),e(5,`
      `),i(6,"mat-card-content"),e(7,`
        `),i(8,"div",3),e(9,`
          `),i(10,"mat-form-field",4),g("click",function(){y(h);let M=R(21);return I(M.open())}),e(11,`
            `),i(12,"mat-label"),e(13),m(14,"translate"),n(),e(15,`
            `),f(16,"input",5),e(17,`
            `),f(18,"mat-datepicker-toggle",6),e(19,`
            `),f(20,"mat-datepicker",null,0),e(22,`
            `),l(23,rr,8,9,"mat-error",7),e(24,`
          `),n(),e(25,`

          `),i(26,"mat-form-field"),e(27,`
            `),i(28,"mat-label"),e(29),m(30,"translate"),n(),e(31,`
            `),f(32,"textarea",8),e(33,`
          `),n(),e(34,`
        `),n(),e(35,`
      `),n(),e(36,`

      `),i(37,"mat-card-actions",9),e(38,`
        `),i(39,"button",10),e(40),m(41,"translate"),n(),e(42,`
        `),i(43,"button",11),e(44),m(45,"translate"),n(),e(46,`
      `),n(),e(47,`
    `),n(),e(48,`
  `),n(),e(49,`
`),n(),e(50,`
`)}if(s&2){let h=R(21);a(4),d("formGroup",o.rejectSharesAccountForm),a(9),u(c(14,12,"labels.inputs.Rejected On Date")),a(3),d("min",o.minDate)("max",o.maxDate)("matDatepicker",h),a(2),d("for",h),a(5),d("ngIf",o.rejectSharesAccountForm.controls.rejectedDate.hasError("required")),a(6),u(c(30,14,"labels.inputs.Note")),a(10),d("routerLink",N(20,ar)),a(),S(`
          `,c(41,16,"labels.buttons.Cancel"),`
        `),a(3),d("disabled",!o.rejectSharesAccountForm.valid),a(),S(`
          `,c(45,18,"labels.buttons.Submit"),`
        `)}},dependencies:[D,j,T,Y,oe,se,W,pe,me,ce,K,de,ue,ge,X,J,he,fe,xe,ve,_e,Se,k,E,tt],styles:[".container[_ngcontent-%COMP%]{max-width:37rem}"]})}}return t})();var or=()=>["../../"];function sr(t,p){t&1&&(i(0,"mat-error"),e(1),m(2,"translate"),m(3,"translate"),i(4,"strong"),e(5),m(6,"translate"),n(),e(7,`
            `),n()),t&2&&(a(),P(`
              `,c(2,3,"labels.inputs.Closed On Date")," ",c(3,5,"labels.commons.is"),`
              `),a(4),u(c(6,7,"labels.commons.required")))}var Ut=(()=>{class t{constructor(r,s,o,h,v,M){this.formBuilder=r,this.sharesService=s,this.dateUtils=o,this.route=h,this.router=v,this.settingsService=M,this.minDate=new Date(2e3,0,1),this.maxDate=new Date,this.accountId=this.route.parent.snapshot.params.shareAccountId}ngOnInit(){this.maxDate=this.settingsService.businessDate,this.createCloseSharesAccountForm()}createCloseSharesAccountForm(){this.closeSharesAccountForm=this.formBuilder.group({closedDate:["",$.required],note:[""]})}submit(){let r=this.closeSharesAccountForm.value,s=this.settingsService.language.code,o=this.settingsService.dateFormat,h=this.closeSharesAccountForm.value.closedDate;r.closedDate instanceof Date&&(r.closedDate=this.dateUtils.formatDate(h,o));let v=Q(V({},r),{dateFormat:o,locale:s});this.sharesService.executeSharesAccountCommand(this.accountId,"close",v).subscribe(()=>{this.router.navigate(["../../"],{relativeTo:this.route})})}static{this.\u0275fac=function(s){return new(s||t)(x(le),x(B),x(re),x(F),x(z),x(q))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-close-shares-account"]],decls:51,vars:21,consts:[["closedDatePicker",""],[1,"container"],[3,"ngSubmit","formGroup"],[1,"layout-column"],[3,"click"],["matInput","","required","","formControlName","closedDate",3,"min","max","matDatepicker"],["matSuffix","",3,"for"],[4,"ngIf"],["matInput","","formControlName","note","cdkTextareaAutosize","","cdkAutosizeMinRows","2"],[1,"layout-row","align-center","gap-5px","responsive-column"],["type","button","mat-raised-button","",3,"routerLink"],["mat-raised-button","","color","warn",3,"disabled"]],template:function(s,o){if(s&1){let h=w();i(0,"div",1),e(1,`
  `),i(2,"mat-card"),e(3,`
    `),i(4,"form",2),g("ngSubmit",function(){return y(h),I(o.submit())}),e(5,`
      `),i(6,"mat-card-content"),e(7,`
        `),i(8,"div",3),e(9,`
          `),i(10,"mat-form-field",4),g("click",function(){y(h);let M=R(21);return I(M.open())}),e(11,`
            `),i(12,"mat-label"),e(13),m(14,"translate"),n(),e(15,`
            `),f(16,"input",5),e(17,`
            `),f(18,"mat-datepicker-toggle",6),e(19,`
            `),f(20,"mat-datepicker",null,0),e(22,`
            `),l(23,sr,8,9,"mat-error",7),e(24,`
          `),n(),e(25,`

          `),i(26,"mat-form-field"),e(27,`
            `),i(28,"mat-label"),e(29),m(30,"translate"),n(),e(31,`
            `),f(32,"textarea",8),e(33,`
          `),n(),e(34,`
        `),n(),e(35,`
      `),n(),e(36,`

      `),i(37,"mat-card-actions",9),e(38,`
        `),i(39,"button",10),e(40),m(41,"translate"),n(),e(42,`
        `),i(43,"button",11),e(44),m(45,"translate"),n(),e(46,`
      `),n(),e(47,`
    `),n(),e(48,`
  `),n(),e(49,`
`),n(),e(50,`
`)}if(s&2){let h=R(21);a(4),d("formGroup",o.closeSharesAccountForm),a(9),u(c(14,12,"labels.inputs.Closed On Date")),a(3),d("min",o.minDate)("max",o.maxDate)("matDatepicker",h),a(2),d("for",h),a(5),d("ngIf",o.closeSharesAccountForm.controls.closedDate.hasError("required")),a(6),u(c(30,14,"labels.inputs.Note")),a(10),d("routerLink",N(20,or)),a(),S(`
          `,c(41,16,"labels.buttons.Cancel"),`
        `),a(3),d("disabled",!o.closeSharesAccountForm.valid),a(),S(`
          `,c(45,18,"labels.buttons.Submit"),`
        `)}},dependencies:[D,j,T,Y,oe,se,W,pe,me,ce,K,de,ue,ge,X,J,he,fe,xe,ve,_e,Se,k,E,tt],styles:[".container[_ngcontent-%COMP%]{max-width:37rem}"]})}}return t})();var mr=()=>["../../"];function cr(t,p){t&1&&(i(0,"mat-error"),e(1),m(2,"translate"),m(3,"translate"),i(4,"strong"),e(5),m(6,"translate"),n(),e(7,`
          `),n()),t&2&&(a(),P(`
            `,c(2,3,"labels.inputs.Activated On Date")," ",c(3,5,"labels.commons.is"),`
            `),a(4),u(c(6,7,"labels.commons.required")))}var $t=(()=>{class t{constructor(r,s,o,h,v,M){this.formBuilder=r,this.sharesService=s,this.dateUtils=o,this.route=h,this.router=v,this.settingsService=M,this.minDate=new Date(2e3,0,1),this.maxDate=new Date,this.accountId=this.route.parent.snapshot.params.shareAccountId}ngOnInit(){this.maxDate=this.settingsService.businessDate,this.createActivateSharesAccountForm()}createActivateSharesAccountForm(){this.activateSharesAccountForm=this.formBuilder.group({activatedDate:["",$.required]})}submit(){let r=this.activateSharesAccountForm.value,s=this.settingsService.language.code,o=this.settingsService.dateFormat,h=this.activateSharesAccountForm.value.activatedDate;r.activatedDate instanceof Date&&(r.activatedDate=this.dateUtils.formatDate(h,o));let v=Q(V({},r),{dateFormat:o,locale:s});this.sharesService.executeSharesAccountCommand(this.accountId,"activate",v).subscribe(()=>{this.router.navigate(["../../"],{relativeTo:this.route})})}static{this.\u0275fac=function(s){return new(s||t)(x(le),x(B),x(re),x(F),x(z),x(q))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-activate-shares-account"]],decls:39,vars:18,consts:[["activatedDatePicker",""],[1,"container"],[3,"ngSubmit","formGroup"],[1,"flex-fill",3,"click"],["matInput","","required","","formControlName","activatedDate",3,"min","max","matDatepicker"],["matSuffix","",3,"for"],[4,"ngIf"],[1,"layout-row","align-center","gap-5px","responsive-column"],["type","button","mat-raised-button","",3,"routerLink"],["mat-raised-button","","color","primary",3,"disabled"]],template:function(s,o){if(s&1){let h=w();i(0,"div",1),e(1,`
  `),i(2,"mat-card"),e(3,`
    `),i(4,"form",2),g("ngSubmit",function(){return y(h),I(o.submit())}),e(5,`
      `),i(6,"mat-card-content"),e(7,`
        `),i(8,"mat-form-field",3),g("click",function(){y(h);let M=R(19);return I(M.open())}),e(9,`
          `),i(10,"mat-label"),e(11),m(12,"translate"),n(),e(13,`
          `),f(14,"input",4),e(15,`
          `),f(16,"mat-datepicker-toggle",5),e(17,`
          `),f(18,"mat-datepicker",null,0),e(20,`
          `),l(21,cr,8,9,"mat-error",6),e(22,`
        `),n(),e(23,`
      `),n(),e(24,`

      `),i(25,"mat-card-actions",7),e(26,`
        `),i(27,"button",8),e(28),m(29,"translate"),n(),e(30,`
        `),i(31,"button",9),e(32),m(33,"translate"),n(),e(34,`
      `),n(),e(35,`
    `),n(),e(36,`
  `),n(),e(37,`
`),n(),e(38,`
`)}if(s&2){let h=R(19);a(4),d("formGroup",o.activateSharesAccountForm),a(7),u(c(12,11,"labels.inputs.Activated On Date")),a(3),d("min",o.minDate)("max",o.maxDate)("matDatepicker",h),a(2),d("for",h),a(5),d("ngIf",o.activateSharesAccountForm.controls.activatedDate.hasError("required")),a(6),d("routerLink",N(17,mr)),a(),S(`
          `,c(29,13,"labels.buttons.Cancel"),`
        `),a(3),d("disabled",!o.activateSharesAccountForm.valid),a(),S(`
          `,c(33,15,"labels.buttons.Submit"),`
        `)}},dependencies:[D,j,T,Y,oe,se,W,pe,me,ce,K,de,ue,ge,X,J,he,fe,xe,ve,_e,Se,k,E],styles:[".container[_ngcontent-%COMP%]{max-width:37rem}"]})}}return t})();var pr=()=>["../../"],Gt=(()=>{class t{constructor(r,s,o){this.sharesService=r,this.route=s,this.router=o,this.accountId=this.route.parent.snapshot.params.shareAccountId}submit(){this.sharesService.executeSharesAccountCommand(this.accountId,"undoapproval",{}).subscribe(()=>{this.router.navigate(["../../"],{relativeTo:this.route})})}static{this.\u0275fac=function(s){return new(s||t)(x(B),x(F),x(z))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-undo-approval-shares-account"]],decls:30,vars:12,consts:[[1,"container"],[3,"ngSubmit"],[1,"mat-typography","confirm-text"],[1,"layout-row","align-center","gap-5px","responsive-column"],["type","button","mat-raised-button","",3,"routerLink"],["mat-raised-button","","color","warn"]],template:function(s,o){s&1&&(i(0,"div",0),e(1,`
  `),i(2,"mat-card"),e(3,`
    `),i(4,"form",1),g("ngSubmit",function(){return o.submit()}),e(5,`
      `),i(6,"mat-card-content"),e(7,`
        `),i(8,"div"),e(9,`
          `),i(10,"p",2),e(11),m(12,"translate"),n(),e(13,`
        `),n(),e(14,`
      `),n(),e(15,`

      `),i(16,"mat-card-actions",3),e(17,`
        `),i(18,"button",4),e(19),m(20,"translate"),n(),e(21,`
        `),i(22,"button",5),e(23),m(24,"translate"),n(),e(25,`
      `),n(),e(26,`
    `),n(),e(27,`
  `),n(),e(28,`
`),n(),e(29,`
`)),s&2&&(a(11),P(`
            `,c(12,5,"labels.text.Undo approval of shares account with ID"),": ",o.accountId,` ?
          `),a(7),d("routerLink",N(11,pr)),a(),S(`
          `,c(20,7,"labels.buttons.Cancel"),`
        `),a(4),u(c(24,9,"labels.buttons.Submit")))},dependencies:[D,T,Y,W,K,de,ue,ge,k,E,fi,ui],styles:[".container[_ngcontent-%COMP%]{max-width:37rem}.container[_ngcontent-%COMP%]   .confirm-text[_ngcontent-%COMP%]{font-size:16px;text-align:center}"]})}}return t})();var lr=()=>["../../"];function dr(t,p){t&1&&(i(0,"mat-error"),e(1),m(2,"translate"),m(3,"translate"),i(4,"strong"),e(5),m(6,"translate"),n(),e(7,`
            `),n()),t&2&&(a(),P(`
              `,c(2,3,"labels.inputs.Request Date")," ",c(3,5,"labels.commons.is"),`
              `),a(4),u(c(6,7,"labels.commons.required")))}function ur(t,p){t&1&&(i(0,"mat-error"),e(1),m(2,"translate"),m(3,"translate"),i(4,"strong"),e(5),m(6,"translate"),n(),e(7,`
            `),n()),t&2&&(a(),P(`
              `,c(2,3,"labels.inputs.Requested Shares")," ",c(3,5,"labels.commons.is"),`
              `),a(4),u(c(6,7,"labels.commons.required")))}var zt=(()=>{class t{constructor(r,s,o,h,v,M){this.formBuilder=r,this.sharesService=s,this.dateUtils=o,this.route=h,this.router=v,this.settingsService=M,this.minDate=new Date(2e3,0,1),this.maxDate=new Date,this.accountId=this.route.parent.snapshot.params.shareAccountId,this.route.data.subscribe(Ke=>{this.sharesAccountData=Ke.shareAccountActionData})}ngOnInit(){this.maxDate=this.settingsService.businessDate,this.createApplySharesAccountForm(),this.applySharesForm.get("unitPrice").patchValue(this.sharesAccountData.currentMarketPrice||"")}createApplySharesAccountForm(){this.applySharesForm=this.formBuilder.group({requestedDate:["",$.required],requestedShares:["",$.required],unitPrice:[{value:"",disabled:!0}]})}submit(){let r=this.applySharesForm.value,s=this.settingsService.language.code,o=this.settingsService.dateFormat,h=this.applySharesForm.value.requestedDate;r.requestedDate instanceof Date&&(r.requestedDate=this.dateUtils.formatDate(h,o));let v=Q(V({},r),{unitPrice:this.applySharesForm.get("unitPrice").value,dateFormat:o,locale:s});this.sharesService.executeSharesAccountCommand(this.accountId,"applyadditionalshares",v).subscribe(()=>{this.router.navigate(["../../"],{relativeTo:this.route})})}static{this.\u0275fac=function(s){return new(s||t)(x(le),x(B),x(re),x(F),x(z),x(q))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-apply-shares"]],decls:62,vars:25,consts:[["requestedDatePicker",""],[1,"container"],[3,"ngSubmit","formGroup"],[1,"layout-column"],[3,"click"],["matInput","","required","","formControlName","requestedDate",3,"min","max","matDatepicker"],["matSuffix","",3,"for"],[4,"ngIf"],["matInput","","required","","formControlName","requestedShares"],["matInput","","required","","formControlName","unitPrice"],[1,"layout-row","align-center","gap-5px","responsive-column"],["type","button","mat-raised-button","",3,"routerLink"],["mat-raised-button","","color","primary",3,"disabled"]],template:function(s,o){if(s&1){let h=w();i(0,"div",1),e(1,`
  `),i(2,"mat-card"),e(3,`
    `),i(4,"form",2),g("ngSubmit",function(){return y(h),I(o.submit())}),e(5,`
      `),i(6,"mat-card-content"),e(7,`
        `),i(8,"div",3),e(9,`
          `),i(10,"mat-form-field",4),g("click",function(){y(h);let M=R(21);return I(M.open())}),e(11,`
            `),i(12,"mat-label"),e(13),m(14,"translate"),n(),e(15,`
            `),f(16,"input",5),e(17,`
            `),f(18,"mat-datepicker-toggle",6),e(19,`
            `),f(20,"mat-datepicker",null,0),e(22,`
            `),l(23,dr,8,9,"mat-error",7),e(24,`
          `),n(),e(25,`

          `),i(26,"mat-form-field"),e(27,`
            `),i(28,"mat-label"),e(29),m(30,"translate"),n(),e(31,`
            `),f(32,"input",8),e(33,`
            `),l(34,ur,8,9,"mat-error",7),e(35,`
          `),n(),e(36,`

          `),i(37,"mat-form-field"),e(38,`
            `),i(39,"mat-label"),e(40),m(41,"translate"),n(),e(42,`
            `),f(43,"input",9),e(44,`
          `),n(),e(45,`
        `),n(),e(46,`
      `),n(),e(47,`

      `),i(48,"mat-card-actions",10),e(49,`
        `),i(50,"button",11),e(51),m(52,"translate"),n(),e(53,`
        `),i(54,"button",12),e(55),m(56,"translate"),n(),e(57,`
      `),n(),e(58,`
    `),n(),e(59,`
  `),n(),e(60,`
`),n(),e(61,`
`)}if(s&2){let h=R(21);a(4),d("formGroup",o.applySharesForm),a(9),u(c(14,14,"labels.inputs.Request Date")),a(3),d("min",o.minDate)("max",o.maxDate)("matDatepicker",h),a(2),d("for",h),a(5),d("ngIf",o.applySharesForm.controls.requestedDate.hasError("required")),a(6),u(c(30,16,"labels.inputs.Total No. of Shares")),a(5),d("ngIf",o.applySharesForm.controls.requestedShares.hasError("required")),a(6),u(c(41,18,"labels.inputs.Current Price")),a(10),d("routerLink",N(24,lr)),a(),S(`
          `,c(52,20,"labels.buttons.Cancel"),`
        `),a(3),d("disabled",!o.applySharesForm.valid),a(),S(`
          `,c(56,22,"labels.buttons.Submit"),`
        `)}},dependencies:[D,j,T,Y,oe,se,W,pe,me,ce,K,de,ue,ge,X,J,he,fe,xe,ve,_e,Se,k,E],styles:[".container[_ngcontent-%COMP%]{max-width:37rem}"]})}}return t})();var hr=()=>["../../"];function fr(t,p){t&1&&(i(0,"mat-error"),e(1),m(2,"translate"),m(3,"translate"),i(4,"strong"),e(5),m(6,"translate"),n(),e(7,`
            `),n()),t&2&&(a(),P(`
              `,c(2,3,"labels.inputs.Request Date")," ",c(3,5,"labels.commons.is"),`
              `),a(4),u(c(6,7,"labels.commons.required")))}function xr(t,p){t&1&&(i(0,"mat-error"),e(1),m(2,"translate"),m(3,"translate"),i(4,"strong"),e(5),m(6,"translate"),n(),e(7,`
            `),n()),t&2&&(a(),P(`
              `,c(2,3,"labels.inputs.Requested Shares")," ",c(3,5,"labels.commons.is"),`
              `),a(4),u(c(6,7,"labels.commons.required")))}var Qt=(()=>{class t{constructor(r,s,o,h,v,M){this.formBuilder=r,this.sharesService=s,this.dateUtils=o,this.route=h,this.router=v,this.settingsService=M,this.minDate=new Date(2e3,0,1),this.maxDate=new Date,this.accountId=this.route.parent.snapshot.params.shareAccountId,this.route.data.subscribe(Ke=>{this.sharesAccountData=Ke.shareAccountActionData})}ngOnInit(){this.maxDate=this.settingsService.businessDate,this.createRedeemSharesAccountForm(),this.redeemSharesForm.get("unitPrice").patchValue(this.sharesAccountData.currentMarketPrice||"")}createRedeemSharesAccountForm(){this.redeemSharesForm=this.formBuilder.group({requestedDate:["",$.required],requestedShares:["",$.required],unitPrice:[{value:"",disabled:!0}]})}submit(){let r=this.redeemSharesForm.value,s=this.settingsService.language.code,o=this.settingsService.dateFormat,h=this.redeemSharesForm.value.requestedDate;r.requestedDate instanceof Date&&(r.requestedDate=this.dateUtils.formatDate(h,o));let v=Q(V({},r),{unitPrice:this.redeemSharesForm.get("unitPrice").value,dateFormat:o,locale:s});this.sharesService.executeSharesAccountCommand(this.accountId,"redeemshares",v).subscribe(()=>{this.router.navigate(["../../"],{relativeTo:this.route})})}static{this.\u0275fac=function(s){return new(s||t)(x(le),x(B),x(re),x(F),x(z),x(q))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-redeem-shares"]],decls:62,vars:25,consts:[["requestedDatePicker",""],[1,"container"],[3,"ngSubmit","formGroup"],[1,"layout-column"],[3,"click"],["matInput","","required","","formControlName","requestedDate",3,"min","max","matDatepicker"],["matSuffix","",3,"for"],[4,"ngIf"],["matInput","","required","","formControlName","requestedShares"],["matInput","","required","","formControlName","unitPrice"],[1,"layout-row","align-center","gap-5px","responsive-column"],["type","button","mat-raised-button","",3,"routerLink"],["mat-raised-button","","color","warn",3,"disabled"]],template:function(s,o){if(s&1){let h=w();i(0,"div",1),e(1,`
  `),i(2,"mat-card"),e(3,`
    `),i(4,"form",2),g("ngSubmit",function(){return y(h),I(o.submit())}),e(5,`
      `),i(6,"mat-card-content"),e(7,`
        `),i(8,"div",3),e(9,`
          `),i(10,"mat-form-field",4),g("click",function(){y(h);let M=R(21);return I(M.open())}),e(11,`
            `),i(12,"mat-label"),e(13),m(14,"translate"),n(),e(15,`
            `),f(16,"input",5),e(17,`
            `),f(18,"mat-datepicker-toggle",6),e(19,`
            `),f(20,"mat-datepicker",null,0),e(22,`
            `),l(23,fr,8,9,"mat-error",7),e(24,`
          `),n(),e(25,`

          `),i(26,"mat-form-field"),e(27,`
            `),i(28,"mat-label"),e(29),m(30,"translate"),n(),e(31,`
            `),f(32,"input",8),e(33,`
            `),l(34,xr,8,9,"mat-error",7),e(35,`
          `),n(),e(36,`

          `),i(37,"mat-form-field"),e(38,`
            `),i(39,"mat-label"),e(40),m(41,"translate"),n(),e(42,`
            `),f(43,"input",9),e(44,`
          `),n(),e(45,`
        `),n(),e(46,`
      `),n(),e(47,`

      `),i(48,"mat-card-actions",10),e(49,`
        `),i(50,"button",11),e(51),m(52,"translate"),n(),e(53,`
        `),i(54,"button",12),e(55),m(56,"translate"),n(),e(57,`
      `),n(),e(58,`
    `),n(),e(59,`
  `),n(),e(60,`
`),n(),e(61,`
`)}if(s&2){let h=R(21);a(4),d("formGroup",o.redeemSharesForm),a(9),u(c(14,14,"labels.inputs.Request Date")),a(3),d("min",o.minDate)("max",o.maxDate)("matDatepicker",h),a(2),d("for",h),a(5),d("ngIf",o.redeemSharesForm.controls.requestedDate.hasError("required")),a(6),u(c(30,16,"labels.inputs.Total No. of Shares")),a(5),d("ngIf",o.redeemSharesForm.controls.requestedShares.hasError("required")),a(6),u(c(41,18,"labels.inputs.Current Price")),a(10),d("routerLink",N(24,hr)),a(),S(`
          `,c(52,20,"labels.buttons.Cancel"),`
        `),a(3),d("disabled",!o.redeemSharesForm.valid),a(),S(`
          `,c(56,22,"labels.buttons.Submit"),`
        `)}},dependencies:[D,j,T,Y,oe,se,W,pe,me,ce,K,de,ue,ge,X,J,he,fe,xe,ve,_e,Se,k,E],styles:[".container[_ngcontent-%COMP%]{max-width:37rem}"]})}}return t})();var Sr=()=>({approve:!0}),Kt=(()=>{class t{constructor(r,s){this.dialogRef=r,this.data=s}static{this.\u0275fac=function(s){return new(s||t)(x(vt),x(_t))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-approve-share-dialog"]],decls:22,vars:15,consts:[["mat-dialog-title",""],["mat-dialog-content",""],["align","end"],["mat-raised-button","","mat-dialog-close",""],["mat-raised-button","","color","primary",3,"mat-dialog-close"]],template:function(s,o){s&1&&(i(0,"h1",0),e(1),m(2,"translate"),n(),e(3,`
`),i(4,"div",1),e(5,`
  `),i(6,"p"),e(7),m(8,"translate"),n(),e(9,`
`),n(),e(10,`
`),i(11,"mat-dialog-actions",2),e(12,`
  `),i(13,"button",3),e(14),m(15,"translate"),n(),e(16,`
  `),i(17,"button",4),e(18),m(19,"translate"),n(),e(20,`
`),n(),e(21,`
`)),s&2&&(a(),u(c(2,6,"labels.heading.Approve Share")),a(6),P("",c(8,8,"labels.text.Are you sure you want to approve share with id"),": ",o.data.shareId," ?"),a(7),u(c(15,10,"labels.buttons.Cancel")),a(3),d("mat-dialog-close",N(14,Sr)),a(),S(`
    `,c(19,12,"labels.buttons.Submit"),`
  `))},dependencies:[D,T,k,E,At,gt,bt,Ct],encapsulation:2})}}return t})();var vr=["sharesTable"],_r=()=>[10,25,50,100];function Cr(t,p){t&1&&(i(0,"th",15),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Transaction Date")))}function Ar(t,p){if(t&1&&(i(0,"td",16),e(1),m(2,"dateFormat"),n()),t&2){let r=p.$implicit;a(),u(c(2,1,r.purchasedDate))}}function gr(t,p){t&1&&(i(0,"th",15),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Total Shares")))}function br(t,p){if(t&1&&(i(0,"td",16),e(1),n()),t&2){let r=p.$implicit;a(),u(r.numberOfShares)}}function Dr(t,p){t&1&&(i(0,"th",15),e(1),m(2,"translate"),n()),t&2&&(a(),S(`
          `,c(2,1,"labels.inputs.Purchased/Redeemed Price"),`
        `))}function Tr(t,p){if(t&1&&(i(0,"td",16),e(1),n()),t&2){let r=p.$implicit;a(),u(r.purchasedPrice)}}function yr(t,p){t&1&&(i(0,"th",17),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Status")))}function Ir(t,p){if(t&1&&(i(0,"td",16),e(1,`
          `),f(2,"i",18),m(3,"statusLookup"),e(4,`
        `),n()),t&2){let r=p.$implicit;a(2),d("ngClass",c(3,2,r.status.code))("matTooltip",r.status.value)}}function Er(t,p){t&1&&(i(0,"th",15),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Confirm Approve")))}function Mr(t,p){if(t&1){let r=w();i(0,"td",16),e(1,`
          `),i(2,"button",19),m(3,"translate"),g("click",function(){let o=y(r).$implicit,h=_();return I(h.approve(o.id))}),e(4,`
            `),f(5,"i",20),e(6,`
          `),n(),e(7,`
        `),n()}t&2&&(a(2),H("matTooltip",c(3,1,"tooltips.Approve Share")))}function Pr(t,p){t&1&&f(0,"tr",21)}function wr(t,p){t&1&&f(0,"tr",22)}var Wt=(()=>{class t{constructor(r,s,o,h){this.sharesService=r,this.route=s,this.dialog=o,this.settingsService=h,this.displayedColumns=["transactionDate","totalShares","redeemedPrice","status","approve"],this.accountId=this.route.parent.snapshot.params.shareAccountId,this.route.data.subscribe(v=>{this.sharesAccountData=v.shareAccountActionData})}ngOnInit(){this.sharesData=this.sharesAccountData.purchasedShares.filter(r=>r.status.value==="Pending Approval"),this.setShares()}setShares(){this.dataSource=new Ve(this.sharesData),this.dataSource.paginator=this.paginator,this.dataSource.sort=this.sort}approve(r){this.dialog.open(Kt,{data:{shareId:r}}).afterClosed().subscribe(o=>{if(o.approve){let h=this.settingsService.language.code,v=this.settingsService.dateFormat,M={requestedShares:[{id:r}],dateFormat:v,locale:h};this.sharesService.executeSharesAccountCommand(this.accountId,"approveadditionalshares",M).subscribe(()=>{let Ke=this.sharesData.find(ii=>ii.id===r),ti=this.sharesData.indexOf(Ke);this.sharesData.splice(ti,1),this.dataSource.data=this.sharesData,this.sharesTableRef.renderRows()})}})}static{this.\u0275fac=function(s){return new(s||t)(x(B),x(F),x(He),x(q))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-approve-shares"]],viewQuery:function(s,o){if(s&1&&(te(at,7),te(rt,7),te(vr,7)),s&2){let h;ie(h=ne())&&(o.paginator=h.first),ie(h=ne())&&(o.sort=h.first),ie(h=ne())&&(o.sharesTableRef=h.first)}},decls:51,vars:5,consts:[["sharesTable",""],[1,"container"],[1,"mat-elevation-z8"],["mat-table","","matSort","",3,"dataSource"],["matColumnDef","transactionDate"],["mat-header-cell","","mat-sort-header","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","totalShares"],["matColumnDef","redeemedPrice"],["matColumnDef","status"],["mat-header-cell","",4,"matHeaderCellDef"],["matColumnDef","approve"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],["showFirstLastButtons","",3,"pageSizeOptions"],["mat-header-cell","","mat-sort-header",""],["mat-cell",""],["mat-header-cell",""],[1,"fa","fa-stop",3,"ngClass","matTooltip"],["mat-raised-button","","color","accent",1,"share-action-button",3,"click","matTooltip"],[1,"fa","fa-check"],["mat-header-row",""],["mat-row",""]],template:function(s,o){s&1&&(i(0,"div",1),e(1,`
  `),i(2,"div",2),e(3,`
    `),i(4,"table",3,0),e(6,`
      `),C(7,4),e(8,`
        `),l(9,Cr,3,3,"th",5),e(10,`
        `),l(11,Ar,3,3,"td",6),e(12,`
      `),A(),e(13,`

      `),C(14,7),e(15,`
        `),l(16,gr,3,3,"th",5),e(17,`
        `),l(18,br,2,1,"td",6),e(19,`
      `),A(),e(20,`

      `),C(21,8),e(22,`
        `),l(23,Dr,3,3,"th",5),e(24,`
        `),l(25,Tr,2,1,"td",6),e(26,`
      `),A(),e(27,`

      `),C(28,9),e(29,`
        `),l(30,yr,3,3,"th",10),e(31,`
        `),l(32,Ir,5,4,"td",6),e(33,`
      `),A(),e(34,`

      `),C(35,11),e(36,`
        `),l(37,Er,3,3,"th",5),e(38,`
        `),l(39,Mr,8,3,"td",6),e(40,`
      `),A(),e(41,`

      `),l(42,Pr,1,0,"tr",12),e(43,`
      `),l(44,wr,1,0,"tr",13),e(45,`
    `),n(),e(46,`

    `),f(47,"mat-paginator",14),e(48,`
  `),n(),e(49,`
`),n(),e(50,`
`)),s&2&&(a(4),d("dataSource",o.dataSource),a(38),d("matHeaderRowDef",o.displayedColumns),a(2),d("matRowDefColumns",o.displayedColumns),a(3),d("pageSizeOptions",N(4,_r)))},dependencies:[D,Ze,T,k,Be,E,De,rt,Ie,ye,Ee,yt,Te,Me,Le,Pe,Re,we,Fe,at,mt],styles:["table[_ngcontent-%COMP%]{width:100%}table[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]:hover{cursor:pointer}table[_ngcontent-%COMP%]   .share-action-button[_ngcontent-%COMP%]{min-width:26px;padding:0 6px;margin:4px;line-height:25px}"]})}}return t})();var Rr=()=>({reject:!0}),Yt=(()=>{class t{constructor(r,s){this.dialogRef=r,this.data=s}static{this.\u0275fac=function(s){return new(s||t)(x(vt),x(_t))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-reject-share-dialog"]],decls:22,vars:15,consts:[["mat-dialog-title",""],["mat-dialog-content",""],["align","end"],["mat-raised-button","","mat-dialog-close",""],["mat-raised-button","","color","warn",3,"mat-dialog-close"]],template:function(s,o){s&1&&(i(0,"h1",0),e(1),m(2,"translate"),n(),e(3,`
`),i(4,"div",1),e(5,`
  `),i(6,"p"),e(7),m(8,"translate"),n(),e(9,`
`),n(),e(10,`
`),i(11,"mat-dialog-actions",2),e(12,`
  `),i(13,"button",3),e(14),m(15,"translate"),n(),e(16,`
  `),i(17,"button",4),e(18),m(19,"translate"),n(),e(20,`
`),n(),e(21,`
`)),s&2&&(a(),u(c(2,6,"labels.heading.Reject Share")),a(6),P("",c(8,8,"labels.text.Are you sure you want to reject share with id"),": ",o.data.shareId," ?"),a(7),u(c(15,10,"labels.buttons.Cancel")),a(3),d("mat-dialog-close",N(14,Rr)),a(),S(`
    `,c(19,12,"labels.buttons.Submit"),`
  `))},dependencies:[D,T,k,E,At,gt,bt,Ct],encapsulation:2})}}return t})();var Fr=["sharesTable"],Br=()=>[10,25,50,100];function kr(t,p){t&1&&(i(0,"th",15),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Transaction Date")))}function Nr(t,p){if(t&1&&(i(0,"td",16),e(1),m(2,"dateFormat"),n()),t&2){let r=p.$implicit;a(),u(c(2,1,r.purchasedDate))}}function Or(t,p){t&1&&(i(0,"th",15),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Total Shares")))}function jr(t,p){if(t&1&&(i(0,"td",16),e(1),n()),t&2){let r=p.$implicit;a(),u(r.numberOfShares)}}function Vr(t,p){t&1&&(i(0,"th",15),e(1),m(2,"translate"),n()),t&2&&(a(),S(`
          `,c(2,1,"labels.inputs.Purchased/Redeemed Price"),`
        `))}function qr(t,p){if(t&1&&(i(0,"td",16),e(1),n()),t&2){let r=p.$implicit;a(),u(r.purchasedPrice)}}function Hr(t,p){t&1&&(i(0,"th",17),e(1),m(2,"translate"),n()),t&2&&(a(),u(c(2,1,"labels.inputs.Status")))}function Lr(t,p){if(t&1&&(i(0,"td",16),e(1,`
          `),f(2,"i",18),m(3,"statusLookup"),e(4,`
        `),n()),t&2){let r=p.$implicit;a(2),d("ngClass",c(3,2,r.status.code))("matTooltip",r.status.value)}}function Ur(t,p){t&1&&(i(0,"th",15),e(1),m(2,"translate"),n()),t&2&&(a(),S("",c(2,1,"labels.inputs.Confirm Reject"),"t"))}function $r(t,p){if(t&1){let r=w();i(0,"td",16),e(1,`
          `),i(2,"button",19),m(3,"translate"),g("click",function(){let o=y(r).$implicit,h=_();return I(h.reject(o.id))}),e(4,`
            `),f(5,"i",20),e(6,`
          `),n(),e(7,`
        `),n()}t&2&&(a(2),H("matTooltip",c(3,1,"tooltips.Reject Share")))}function Gr(t,p){t&1&&f(0,"tr",21)}function zr(t,p){t&1&&f(0,"tr",22)}var Jt=(()=>{class t{constructor(r,s,o,h){this.sharesService=r,this.route=s,this.dialog=o,this.settingsService=h,this.displayedColumns=["transactionDate","totalShares","redeemedPrice","status","reject"],this.accountId=this.route.parent.snapshot.params.shareAccountId,this.route.data.subscribe(v=>{this.sharesAccountData=v.shareAccountActionData})}ngOnInit(){this.sharesData=this.sharesAccountData.purchasedShares.filter(r=>r.status.value==="Pending Approval"),this.setShares()}setShares(){this.dataSource=new Ve(this.sharesData),this.dataSource.paginator=this.paginator,this.dataSource.sort=this.sort}reject(r){this.dialog.open(Yt,{data:{shareId:r}}).afterClosed().subscribe(o=>{if(o.reject){let h=this.settingsService.language.code,v=this.settingsService.dateFormat,M={requestedShares:[{id:r}],dateFormat:v,locale:h};this.sharesService.executeSharesAccountCommand(this.accountId,"rejectadditionalshares",M).subscribe(()=>{let Ke=this.sharesData.find(ii=>ii.id===r),ti=this.sharesData.indexOf(Ke);this.sharesData.splice(ti,1),this.dataSource.data=this.sharesData,this.sharesTableRef.renderRows()})}})}static{this.\u0275fac=function(s){return new(s||t)(x(B),x(F),x(He),x(q))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-reject-shares"]],viewQuery:function(s,o){if(s&1&&(te(at,7),te(rt,7),te(Fr,7)),s&2){let h;ie(h=ne())&&(o.paginator=h.first),ie(h=ne())&&(o.sort=h.first),ie(h=ne())&&(o.sharesTableRef=h.first)}},decls:51,vars:5,consts:[["sharesTable",""],[1,"container"],[1,"mat-elevation-z8"],["mat-table","","matSort","",3,"dataSource"],["matColumnDef","transactionDate"],["mat-header-cell","","mat-sort-header","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","totalShares"],["matColumnDef","redeemedPrice"],["matColumnDef","status"],["mat-header-cell","",4,"matHeaderCellDef"],["matColumnDef","reject"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],["showFirstLastButtons","",3,"pageSizeOptions"],["mat-header-cell","","mat-sort-header",""],["mat-cell",""],["mat-header-cell",""],[1,"fa","fa-stop",3,"ngClass","matTooltip"],["mat-raised-button","","color","warn",1,"share-action-button",3,"click","matTooltip"],[1,"fa","fa-times"],["mat-header-row",""],["mat-row",""]],template:function(s,o){s&1&&(i(0,"div",1),e(1,`
  `),i(2,"div",2),e(3,`
    `),i(4,"table",3,0),e(6,`
      `),C(7,4),e(8,`
        `),l(9,kr,3,3,"th",5),e(10,`
        `),l(11,Nr,3,3,"td",6),e(12,`
      `),A(),e(13,`

      `),C(14,7),e(15,`
        `),l(16,Or,3,3,"th",5),e(17,`
        `),l(18,jr,2,1,"td",6),e(19,`
      `),A(),e(20,`

      `),C(21,8),e(22,`
        `),l(23,Vr,3,3,"th",5),e(24,`
        `),l(25,qr,2,1,"td",6),e(26,`
      `),A(),e(27,`

      `),C(28,9),e(29,`
        `),l(30,Hr,3,3,"th",10),e(31,`
        `),l(32,Lr,5,4,"td",6),e(33,`
      `),A(),e(34,`

      `),C(35,11),e(36,`
        `),l(37,Ur,3,3,"th",5),e(38,`
        `),l(39,$r,8,3,"td",6),e(40,`
      `),A(),e(41,`

      `),l(42,Gr,1,0,"tr",12),e(43,`
      `),l(44,zr,1,0,"tr",13),e(45,`
    `),n(),e(46,`

    `),f(47,"mat-paginator",14),e(48,`
  `),n(),e(49,`
`),n(),e(50,`
`)),s&2&&(a(4),d("dataSource",o.dataSource),a(38),d("matHeaderRowDef",o.displayedColumns),a(2),d("matRowDefColumns",o.displayedColumns),a(3),d("pageSizeOptions",N(4,Br)))},dependencies:[D,Ze,T,k,Be,E,De,rt,Ie,ye,Ee,yt,Te,Me,Le,Pe,Re,we,Fe,at,mt],styles:["table[_ngcontent-%COMP%]{width:100%}table[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]:hover{cursor:pointer}table[_ngcontent-%COMP%]   .share-action-button[_ngcontent-%COMP%]{min-width:26px;padding:0 6px;margin:4px;line-height:25px}"]})}}return t})();function Qr(t,p){t&1&&f(0,"mifosx-approve-shares-account")}function Kr(t,p){t&1&&f(0,"mifosx-reject-shares-account")}function Wr(t,p){t&1&&f(0,"mifosx-close-shares-account")}function Yr(t,p){t&1&&f(0,"mifosx-activate-shares-account")}function Jr(t,p){t&1&&f(0,"mifosx-undo-approval-shares-account")}function Xr(t,p){t&1&&f(0,"mifosx-apply-shares")}function Zr(t,p){t&1&&f(0,"mifosx-redeem-shares")}function eo(t,p){t&1&&f(0,"mifosx-approve-shares")}function to(t,p){t&1&&f(0,"mifosx-reject-shares")}var Xt=(()=>{class t{constructor(r){this.route=r,this.actions={Approve:!1,Reject:!1,Close:!1,Activate:!1,"Undo Approval":!1,"Apply Additional Shares":!1,"Redeem Shares":!1,"Approve Additional Shares":!1,"Reject Additional Shares":!1};let s=this.route.snapshot.params.name;s&&s in this.actions&&(this.actions[s]=!0)}static{this.\u0275fac=function(s){return new(s||t)(x(F))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-shares-account-actions"]],decls:18,vars:9,consts:[[4,"ngIf"]],template:function(s,o){s&1&&(l(0,Qr,1,0,"mifosx-approve-shares-account",0),e(1,`
`),l(2,Kr,1,0,"mifosx-reject-shares-account",0),e(3,`
`),l(4,Wr,1,0,"mifosx-close-shares-account",0),e(5,`
`),l(6,Yr,1,0,"mifosx-activate-shares-account",0),e(7,`
`),l(8,Jr,1,0,"mifosx-undo-approval-shares-account",0),e(9,`
`),l(10,Xr,1,0,"mifosx-apply-shares",0),e(11,`
`),l(12,Zr,1,0,"mifosx-redeem-shares",0),e(13,`
`),l(14,eo,1,0,"mifosx-approve-shares",0),e(15,`
`),l(16,to,1,0,"mifosx-reject-shares",0),e(17,`
`)),s&2&&(d("ngIf",o.actions.Approve),a(2),d("ngIf",o.actions.Reject),a(2),d("ngIf",o.actions.Close),a(2),d("ngIf",o.actions.Activate),a(2),d("ngIf",o.actions["Undo Approval"]),a(2),d("ngIf",o.actions["Apply Additional Shares"]),a(2),d("ngIf",o.actions["Redeem Shares"]),a(2),d("ngIf",o.actions["Approve Additional Shares"]),a(2),d("ngIf",o.actions["Reject Additional Shares"]))},dependencies:[D,j,T,Ht,Lt,Ut,$t,Gt,zt,Qt,Wt,Jt],encapsulation:2})}}return t})();var Zt=(()=>{class t{constructor(r){this.sharesService=r}resolve(r){let s=r.paramMap.get("shareAccountId")||r.parent.paramMap.get("shareAccountId");return this.sharesService.getSharesAccountData(s,!1)}static{this.\u0275fac=function(s){return new(s||t)(Oe(B))}}static{this.\u0275prov=Ne({token:t,factory:t.\u0275fac})}}return t})();var ai=(()=>{class t{constructor(r){this.sharesService=r}resolve(r){let s=r.paramMap.get("name"),o=r.paramMap.get("shareAccountId")||r.parent.parent.paramMap.get("shareAccountId");switch(s){case"Apply Additional Shares":case"Redeem Shares":case"Approve Additional Shares":case"Reject Additional Shares":return this.sharesService.getSharesAccountData(o,!0);default:return}}static{this.\u0275fac=function(s){return new(s||t)(Oe(B))}}static{this.\u0275prov=Ne({token:t,factory:t.\u0275fac})}}return t})();var ri=(()=>{class t{constructor(r){this.sharesService=r}resolve(r){let s=r.parent.parent.paramMap.get("clientId");return this.sharesService.getSharesAccountTemplate(s)}static{this.\u0275fac=function(s){return new(s||t)(Oe(B))}}static{this.\u0275prov=Ne({token:t,factory:t.\u0275fac})}}return t})();var oi=(()=>{class t{constructor(r){this.sharesService=r}resolve(r){let s=r.paramMap.get("shareAccountId");return this.sharesService.getSharesAccountData(s,!0)}static{this.\u0275fac=function(s){return new(s||t)(Oe(B))}}static{this.\u0275prov=Ne({token:t,factory:t.\u0275fac})}}return t})();function io(t,p){if(t&1&&(i(0,"td"),e(1),m(2,"dateFormat"),n()),t&2){let r=_();a(),S(`
              `,c(2,1,r.sharesAccountData.timeline.activatedDate),`
            `)}}function no(t,p){t&1&&(i(0,"td"),e(1),m(2,"translate"),n()),t&2&&(a(),S(`
              `,c(2,1,"labels.text.Not Activated"),`
            `))}function ao(t,p){if(t&1&&(i(0,"td"),e(1,`
              `),f(2,"mifosx-external-identifier",6),e(3,`
            `),n()),t&2){let r=_();a(2),H("externalId",r.sharesAccountData.externalId)}}function ro(t,p){t&1&&(i(0,"td"),e(1),m(2,"translate"),n()),t&2&&(a(),S(`
              `,c(2,1,"labels.inputs.Unassigned"),`
            `))}function oo(t,p){if(t&1&&(i(0,"td"),e(1,`
              `),f(2,"mifosx-account-number",7),e(3,`
            `),n()),t&2){let r=_();a(2),H("clientId",r.sharesAccountData.clientId),H("accountId",r.sharesAccountData.savingsAccountId),H("accountNo",r.sharesAccountData.savingsAccountNumber)}}function so(t,p){t&1&&(i(0,"td"),e(1),m(2,"translate"),n()),t&2&&(a(),S(`
              `,c(2,1,"labels.inputs.Unassigned"),`
            `))}var ei=(()=>{class t{constructor(r){this.route=r,this.route.data.subscribe(s=>{this.sharesAccountData=s.sharesAccountData})}static{this.\u0275fac=function(s){return new(s||t)(x(F))}}static{this.\u0275cmp=b({type:t,selectors:[["mifosx-general-tab"]],decls:97,vars:38,consts:[[1,"tab-container","mat-typography"],[1,"shares-account-tables","layout-row","gap-2percent"],[1,"flex-49"],[1,"table-headers"],[4,"ngIf"],[1,"r-amount"],[3,"externalId"],["accountType","2",3,"clientId","accountId","accountNo"]],template:function(s,o){s&1&&(i(0,"div",0),e(1,`
  `),i(2,"div",1),e(3,`
    `),i(4,"div",2),e(5,`
      `),i(6,"h4",3),e(7),m(8,"translate"),n(),e(9,`
      `),i(10,"table"),e(11,`
        `),i(12,"tbody"),e(13,`
          `),i(14,"tr"),e(15,`
            `),i(16,"td"),e(17),m(18,"translate"),n(),e(19,`
            `),l(20,io,3,3,"td",4),e(21,`
            `),l(22,no,3,3,"td",4),e(23,`
          `),n(),e(24,`
          `),i(25,"tr"),e(26,`
            `),i(27,"td"),e(28),m(29,"translate"),n(),e(30,`
            `),i(31,"td"),e(32),n(),e(33,`
          `),n(),e(34,`
          `),i(35,"tr"),e(36,`
            `),i(37,"td"),e(38),m(39,"translate"),n(),e(40,`
            `),l(41,ao,4,1,"td",4),e(42,`
            `),l(43,ro,3,3,"td",4),e(44,`
          `),n(),e(45,`
          `),i(46,"tr"),e(47,`
            `),i(48,"td"),e(49),m(50,"translate"),n(),e(51,`
            `),l(52,oo,4,3,"td",4),e(53,`
            `),l(54,so,3,3,"td",4),e(55,`
          `),n(),e(56,`
        `),n(),e(57,`
      `),n(),e(58,`
    `),n(),e(59,`

    `),i(60,"div",2),e(61,`
      `),i(62,"h4",3),e(63),m(64,"translate"),n(),e(65,`
      `),i(66,"table"),e(67,`
        `),i(68,"tbody"),e(69,`
          `),i(70,"tr"),e(71,`
            `),i(72,"td"),e(73),m(74,"translate"),n(),e(75,`
            `),i(76,"td",5),e(77),m(78,"formatNumber"),n(),e(79,`
          `),n(),e(80,`
          `),i(81,"tr"),e(82,`
            `),i(83,"td"),e(84),m(85,"translate"),n(),e(86,`
            `),i(87,"td",5),e(88),m(89,"formatNumber"),n(),e(90,`
          `),n(),e(91,`
        `),n(),e(92,`
      `),n(),e(93,`
    `),n(),e(94,`
  `),n(),e(95,`
`),n(),e(96,`
`)),s&2&&(a(7),u(c(8,18,"labels.heading.Shares Details")),a(10),u(c(18,20,"labels.inputs.Activated On")),a(3),d("ngIf",o.sharesAccountData.timeline.activatedDate),a(2),d("ngIf",!o.sharesAccountData.timeline.activatedDate),a(6),u(c(29,22,"labels.inputs.Currency")),a(4),P("",o.sharesAccountData.currency.name," [",o.sharesAccountData.currency.code,"]"),a(6),u(c(39,24,"labels.inputs.External Id")),a(3),d("ngIf",o.sharesAccountData.externalId),a(2),d("ngIf",!o.sharesAccountData.externalId),a(6),u(c(50,26,"labels.inputs.Linked Savings Account(Dividend Posting)")),a(3),d("ngIf",o.sharesAccountData.savingsAccountNumber),a(2),d("ngIf",!o.sharesAccountData.savingsAccountNumber),a(9),u(c(64,28,"labels.heading.Account Summary")),a(10),u(c(74,30,"labels.inputs.Pending for Approval Shares")),a(4),u(c(78,32,o.sharesAccountData.summary.totalPendingForApprovalShares)),a(7),u(c(85,34,"labels.inputs.Approved Shares")),a(4),u(c(89,36,o.sharesAccountData.summary.totalApprovedShares)))},dependencies:[D,j,T,Be,E,wt,Rt,st],styles:[".tab-container[_ngcontent-%COMP%]{padding:1%;margin:1%}.tab-container[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin:1% auto}.tab-container[_ngcontent-%COMP%]   .performance-history-container[_ngcontent-%COMP%]{border:1px solid;padding:1%;margin-bottom:20px}.tab-container[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]{width:100%;margin-bottom:20px}span[_ngcontent-%COMP%]{margin:.5em 0}"]})}}return t})();var mo=[{path:"",data:{title:"Shares",breadcrumb:"Shares",routeParamBreadcrumb:!1},children:[{path:"create",data:{title:"Create Shares Account",breadcrumb:"Create Shares Account"},component:Vt,resolve:{sharesAccountTemplate:ri}},{path:":shareAccountId",data:{title:"Shares Account View",routeParamBreadcrumb:"shareAccountId"},children:[{path:"",component:kt,resolve:{sharesAccountData:Zt},children:[{path:"",redirectTo:"general",pathMatch:"full"},{path:"general",component:ei,data:{title:"Shares Account General",breadcrumb:"General",routeParamBreadcrumb:!1},resolve:{sharesAccountData:Zt}},{path:"transactions",component:Nt,data:{title:"Shares Account Transactions",breadcrumb:"Transactions",routeParamBreadcrumb:!1}},{path:"charges",component:Ot,data:{title:"Shares Account Charges",breadcrumb:"Charges",routeParamBreadcrumb:!1}},{path:"dividends",component:jt,data:{title:"Shares Account Dividends",breadcrumb:"Dividends",routeParamBreadcrumb:!1}}]},{path:"edit",data:{title:"Edit Shares Account",breadcrumb:"Edit",routeParamBreadcrumb:!1},component:qt,resolve:{sharesAccountAndTemplate:oi}},{path:"actions/:name",data:{title:"Shares Account Actions",breadcrumb:"Actions",routeParamBreadcrumb:"name"},component:Xt,resolve:{shareAccountActionData:ai}}]}]}],qi=(()=>{class t{static{this.\u0275fac=function(s){return new(s||t)}}static{this.\u0275mod=ft({type:t})}static{this.\u0275inj=dt({providers:[Zt,ri,oi,ai],imports:[ni.forChild(mo),ni]})}}return t})();var pl=(()=>{class t{static{this.\u0275fac=function(s){return new(s||t)}}static{this.\u0275mod=ft({type:t})}static{this.\u0275inj=dt({imports:[Oi,Fi,Bi,qi,kt,Nt,jt,Ot,Vt,Ge,ze,Qe,ct,qt,Xt,Ht,Lt,Ut,$t,Gt,zt,Qt,Wt,Kt,Jt,Yt,ei]})}}return t})();export{pl as SharesModule};
