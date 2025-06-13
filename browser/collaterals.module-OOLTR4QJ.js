import{$ as o,Af as Mt,Bc as X,C as y,D as M,Da as t,Ea as c,F as E,Fa as h,Ga as b,Gc as Y,H as w,He as Ct,Hf as Et,I as R,Ic as Z,Ie as ft,Jc as tt,Je as xt,Kc as et,Kf as wt,L as k,Lc as it,Le as ht,M as $,Me as bt,Oa as T,Oe as vt,Pb as B,Pe as gt,Qc as at,Ra as m,Re as _t,Sa as p,Sb as V,Se as St,Tb as F,Tc as nt,Ue as It,Vb as A,Wc as lt,Zc as ot,_b as O,_d as j,aa as f,ad as rt,be as N,cb as Q,cg as Rt,dd as mt,de as ut,ed as pt,fa as d,ha as C,id as st,kd as ct,la as i,ma as a,mc as W,na as u,oa as S,ob as z,pa as I,qd as dt,ra as U,sa as P,sb as J,ta as G,ub as K,uf as Dt,vc as L,xf as yt}from"./chunk-2F3SV45T.js";import"./chunk-O7S4L63H.js";var g=(()=>{class e{constructor(n){this.http=n}getFilteredClients(n,l,r,x,v){let _=new J().set("displayName",x).set("orphansOnly",r.toString()).set("sortOrder",l).set("orderBy",n);return v&&(_=_.set("officeId",v)),this.http.get("/clients",{params:_})}getClientCollateral(n,l){return this.http.get(`/clients/${n}/collaterals/${l}`)}updateClientCollateral(n,l,r){return this.http.put(`/clients/${n}/collaterals/${l}`,r)}deleteCollateral(n,l){return this.http.delete(`/clients/${n}/collaterals/${l}`)}static{this.\u0275fac=function(l){return new(l||e)(E(K))}}static{this.\u0275prov=y({token:e,factory:e.\u0275fac,providedIn:"root"})}}return e})();var jt=()=>["edit"];function Nt(e,s){e&1&&(i(0,"button",16),t(1,`
    `),u(2,"fa-icon",17),t(3),m(4,"translate"),a()),e&2&&(C("routerLink",T(4,jt)),o(3),h(`
    `,p(4,2,"labels.buttons.Edit"),`
  `))}function qt(e,s){if(e&1){let n=U();i(0,"button",18),P("click",function(){k(n);let r=G();return $(r.deleteCollateral())}),t(1,`
    `),u(2,"fa-icon",19),t(3),m(4,"translate"),a()}e&2&&(o(3),h(`
    `,p(4,1,"labels.buttons.Delete"),`
  `))}function At(e,s){e&1&&(i(0,"th",20),t(1),m(2,"translate"),a()),e&2&&(o(),c(p(2,1,"labels.inputs.ID")))}function Ht(e,s){if(e&1&&(i(0,"td",21),t(1),a()),e&2){let n=s.$implicit;o(),h(`
            `,n.loanId,`
          `)}}function kt(e,s){e&1&&(i(0,"th",20),t(1),m(2,"translate"),a()),e&2&&(o(),c(p(2,1,"labels.inputs.Last Repayment")))}function $t(e,s){if(e&1&&(i(0,"td",21),t(1),a()),e&2){let n=s.$implicit;o(),c(n.lastRepayment)}}function Ut(e,s){e&1&&(i(0,"th",20),t(1),m(2,"translate"),a()),e&2&&(o(),c(p(2,1,"labels.inputs.Remaining Amount")))}function Gt(e,s){if(e&1&&(i(0,"td",21),t(1),m(2,"formatNumber"),a()),e&2){let n=s.$implicit;o(),c(p(2,1,n.remainingAmount))}}function Qt(e,s){e&1&&(i(0,"th",20),t(1),m(2,"translate"),a()),e&2&&(o(),c(p(2,1,"labels.inputs.Last Repayment Date")))}function zt(e,s){if(e&1&&(i(0,"td",21),t(1),m(2,"dateFormat"),a()),e&2){let n=s.$implicit;o(),c(p(2,1,n.lastRepaymentDate))}}function Jt(e,s){e&1&&u(0,"tr",22)}function Kt(e,s){e&1&&u(0,"tr",23)}var Pt=(()=>{class e{constructor(n,l,r,x){this.route=n,this.collateralsService=l,this.router=r,this.dialog=x,this.collateralColumns=["ID","Last Repayment","Remaining Amount","Last Repayment Date"],this.route.data.subscribe(v=>{this.clientCollateralData=v.clientCollateralData})}deleteCollateral(){this.dialog.open(dt,{data:{deleteContext:`collateral ${this.clientCollateralData.id}`}}).afterClosed().subscribe(l=>{l.delete&&this.collateralsService.deleteCollateral(this.clientCollateralData.clientId,this.clientCollateralData.id).subscribe(()=>{this.router.navigate(["../../"],{relativeTo:this.route})})})}static{this.\u0275fac=function(l){return new(l||e)(f(B),f(g),f(V),f(W))}}static{this.\u0275cmp=w({type:e,selectors:[["mifosx-view-collateral"]],decls:78,vars:27,consts:[[1,"layout-row","align-end","gap-2px","responsive-column","container","m-b-20"],["mat-raised-button","","color","primary",3,"routerLink",4,"mifosxHasPermission"],["mat-raised-button","","color","warn",3,"click",4,"mifosxHasPermission"],[1,"client-collateral-card"],[1,"content"],[1,"tab-container","mat-typography"],[1,"layout-row","gap-32px","group-details-container","m-b-30"],["mat-table","",1,"mat-elevation-z1","m-b-30",3,"dataSource"],["matColumnDef","ID"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","Last Repayment"],["matColumnDef","Remaining Amount"],["matColumnDef","Last Repayment Date"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],["mat-raised-button","","color","primary",3,"routerLink"],["icon","edit",1,"m-r-10"],["mat-raised-button","","color","warn",3,"click"],["icon","trash",1,"m-r-10"],["mat-header-cell",""],["mat-cell",""],["mat-header-row",""],["mat-row",""]],template:function(l,r){l&1&&(i(0,"div",0),t(1,`
  `),d(2,Nt,5,5,"button",1),t(3,`
  `),d(4,qt,5,3,"button",2),t(5,`
`),a(),t(6,`

`),i(7,"mat-card",3),t(8,`
  `),i(9,"mat-card-content",4),t(10,`\\

    `),i(11,"div",5),t(12,`
      `),i(13,"h3"),t(14),m(15,"translate"),a(),t(16,`

      `),i(17,"div",6),t(18,`
        `),i(19,"p"),t(20),m(21,"translate"),u(22,"br"),t(23),m(24,"translate"),u(25,"br"),t(26),m(27,"translate"),u(28,"br"),t(29),m(30,"translate"),u(31,"br"),t(32,`
        `),a(),t(33,`
      `),a(),t(34,`

      `),i(35,"h3"),t(36),m(37,"translate"),a(),t(38,`

      `),i(39,"table",7),t(40,`
        `),S(41,8),t(42,`
          `),d(43,At,3,3,"th",9),t(44,`
          `),d(45,Ht,2,1,"td",10),t(46,`
        `),I(),t(47,`

        `),S(48,11),t(49,`
          `),d(50,kt,3,3,"th",9),t(51,`
          `),d(52,$t,2,1,"td",10),t(53,`
        `),I(),t(54,`

        `),S(55,12),t(56,`
          `),d(57,Ut,3,3,"th",9),t(58,`
          `),d(59,Gt,3,3,"td",10),t(60,`
        `),I(),t(61,`

        `),S(62,13),t(63,`
          `),d(64,Qt,3,3,"th",9),t(65,`
          `),d(66,zt,3,3,"td",10),t(67,`
        `),I(),t(68,`

        `),t(69,`
        `),d(70,Jt,1,0,"tr",14),t(71,`
        `),d(72,Kt,1,0,"tr",15),t(73,`
      `),a(),t(74,`
    `),a(),t(75,`
  `),a(),t(76,`
`),a(),t(77,`
`)),l&2&&(o(2),C("mifosxHasPermission","UPDATE_CLIENT_COLLATERAL_PRODUCT"),o(2),C("mifosxHasPermission","DELETE_CLIENT_COLLATERAL_PRODUCT"),o(10),c(p(15,15,"labels.heading.Client Collateral Details")),o(6),b(`
          `,p(21,17,"labels.inputs.name"),": ",r.clientCollateralData.name,""),o(3),b(`
          `,p(24,19,"labels.inputs.Quantity"),": ",r.clientCollateralData.quantity,""),o(3),b(`
          `,p(27,21,"labels.inputs.Total Value"),": ",r.clientCollateralData.total,""),o(3),b(`
          `,p(30,23,"labels.inputs.Total Collateral Value"),": ",r.clientCollateralData.totalCollateral,""),o(7),c(p(37,25,"labels.heading.Transaction Details")),o(3),C("dataSource",r.clientCollateralData.loanTransactionData),o(31),C("matHeaderRowDef",r.collateralColumns),o(2),C("matRowDefColumns",r.collateralColumns))},dependencies:[F,Y,O,j,N,Ct,xt,gt,ht,ft,_t,bt,vt,St,It,Et,L,Dt,yt],styles:[".client-collateral-card[_ngcontent-%COMP%]{margin:0 auto;max-width:80rem;width:90%;padding:0}.tab-container[_ngcontent-%COMP%]{padding:1%;margin:1%}.tab-container[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin:1% auto}.tab-container[_ngcontent-%COMP%]   .group-details-container[_ngcontent-%COMP%]{border:1px solid;padding:1%}.tab-container[_ngcontent-%COMP%]   .action-button[_ngcontent-%COMP%]{margin-left:auto}.tab-container[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]{width:100%}.tab-container[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]   .account-action-button[_ngcontent-%COMP%]{min-width:26px;padding:0 6px;margin:4px;line-height:25px}.tab-container[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]   tr.select-row[_ngcontent-%COMP%]:hover, .tab-container[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]:hover{cursor:pointer}"]})}}return e})();var q=(()=>{class e{constructor(n){this.collateralsService=n}resolve(n){let l=n.parent.paramMap.get("clientId"),r=n.parent.paramMap.get("collateralId");return this.collateralsService.getClientCollateral(l,r)}static{this.\u0275fac=function(l){return new(l||e)(E(g))}}static{this.\u0275prov=y({token:e,factory:e.\u0275fac})}}return e})();var Wt=()=>["../../"];function Xt(e,s){e&1&&(i(0,"mat-error"),t(1),m(2,"translate"),m(3,"translate"),i(4,"strong"),t(5),m(6,"translate"),a(),t(7,`
              `),a()),e&2&&(o(),b(`
                `,p(2,3,"labels.inputs.Quantity")," ",p(3,5,"labels.commons.is"),`
                `),o(4),c(p(6,7,"labels.commons.required")))}var Tt=(()=>{class e{constructor(n,l,r,x,v){this.formBuilder=n,this.route=l,this.router=r,this.settingsService=x,this.collateralService=v,this.route.data.subscribe(_=>{this.collateralDetails=_.clientCollateralData}),this.clientId=this.route.parent.snapshot.params.clientId}ngOnInit(){this.createClientCollateralForm()}createClientCollateralForm(){this.clientCollateralForm=this.formBuilder.group({quantity:["",tt.required],name:[{value:"",disabled:!0}],total:[{value:"",disabled:!0}],totalCollateral:[{value:"",disabled:!0}]}),this.clientCollateralForm.patchValue({name:this.collateralDetails.name,quantity:this.collateralDetails.quantity,total:this.collateralDetails.total,totalCollateral:this.collateralDetails.totalCollateral})}submit(){let n=this.collateralDetails.id,l=this.clientCollateralForm.value.quantity,r=this.settingsService.language.code,x={quantity:l,locale:r};this.collateralService.updateClientCollateral(this.clientId,n,x).subscribe(()=>{this.router.navigate(["../"],{relativeTo:this.route})})}static{this.\u0275fac=function(l){return new(l||e)(f(rt),f(B),f(V),f(X),f(g))}}static{this.\u0275cmp=w({type:e,selectors:[["mifosx-edit-collateral"]],decls:67,vars:23,consts:[[1,"container"],[3,"ngSubmit","formGroup"],[1,"layout-column"],["matInput","","required","","formControlName","name"],["matInput","","required","","formControlName","quantity"],[4,"ngIf"],["matInput","","required","","formControlName","total"],["matInput","","required","","formControlName","totalCollateral"],[1,"layout-row","layout-xs-column","layout-align-center","gap-5px"],["type","button","mat-raised-button","",3,"routerLink"],["mat-raised-button","","color","primary",3,"disabled"]],template:function(l,r){l&1&&(i(0,"div",0),t(1,`
  `),i(2,"mat-card"),t(3,`
    `),i(4,"form",1),P("ngSubmit",function(){return r.submit()}),t(5,`
      `),i(6,"mat-card-content"),t(7,`
        `),i(8,"div",2),t(9,`
          `),i(10,"div",2),t(11,`
            `),i(12,"mat-form-field"),t(13,`
              `),i(14,"mat-label"),t(15),m(16,"translate"),a(),t(17,`
              `),u(18,"input",3),t(19,`
            `),a(),t(20,`

            `),i(21,"mat-form-field"),t(22,`
              `),i(23,"mat-label"),t(24),m(25,"translate"),a(),t(26,`
              `),u(27,"input",4),t(28,`
              `),d(29,Xt,8,9,"mat-error",5),t(30,`
            `),a(),t(31,`

            `),i(32,"mat-form-field"),t(33,`
              `),i(34,"mat-label"),t(35),m(36,"translate"),a(),t(37,`
              `),u(38,"input",6),t(39,`
            `),a(),t(40,`

            `),i(41,"mat-form-field"),t(42,`
              `),i(43,"mat-label"),t(44),m(45,"translate"),a(),t(46,`
              `),u(47,"input",7),t(48,`
            `),a(),t(49,`
          `),a(),t(50,`
        `),a(),t(51,`
      `),a(),t(52,`

      `),i(53,"mat-card-actions",8),t(54,`
        `),i(55,"button",9),t(56),m(57,"translate"),a(),t(58,`
        `),i(59,"button",10),t(60),m(61,"translate"),a(),t(62,`
      `),a(),t(63,`
    `),a(),t(64,`
  `),a(),t(65,`
`),a(),t(66,`
`)),l&2&&(o(4),C("formGroup",r.clientCollateralForm),o(11),c(p(16,10,"labels.inputs.name")),o(9),c(p(25,12,"labels.inputs.Quantity")),o(5),C("ngIf",r.clientCollateralForm.controls.quantity.hasError("required")),o(6),c(p(36,14,"labels.inputs.Total")),o(9),c(p(45,16,"labels.inputs.Total Collateral Value")),o(11),C("routerLink",T(22,Wt)),o(),h(`
          `,p(57,18,"labels.buttons.Cancel"),`
        `),o(3),C("disabled",!r.clientCollateralForm.valid),o(),h(`
          `,p(61,20,"labels.buttons.Submit"),`
        `))},dependencies:[Q,F,O,j,ut,N,st,mt,pt,ct,at,Z,et,it,ot,nt,lt,L],styles:[".container[_ngcontent-%COMP%]{width:37rem}"]})}}return e})();var Yt=[{path:"",data:{title:"Collateral",breadcrumb:"Collateral",routeParamBreadcrumb:!1},children:[{path:":collateralId",data:{title:"Collateral View",routeParamBreadcrumb:"collateralId"},children:[{path:"",component:Pt,resolve:{clientCollateralData:q}},{path:"edit",data:{title:"edit",routeParamBreadcrumb:"edit"},component:Tt,resolve:{clientCollateralData:q}}]}]}],Bt=(()=>{class e{static{this.\u0275fac=function(l){return new(l||e)}}static{this.\u0275mod=R({type:e})}static{this.\u0275inj=M({providers:[q],imports:[A.forChild(Yt),A]})}}return e})();var He=(()=>{class e{static{this.\u0275fac=function(l){return new(l||e)}}static{this.\u0275mod=R({type:e})}static{this.\u0275inj=M({imports:[z,Bt,Rt,wt,Mt]})}}return e})();export{He as CollateralsModule};
