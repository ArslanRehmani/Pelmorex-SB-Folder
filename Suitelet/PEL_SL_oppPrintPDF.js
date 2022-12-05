/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
// eslint-disable-next-line no-undef
define(['N/render', 'N/search', 'N/log', 'N/record', 'N/config'],

    function (render, search, log, record, config) {
        function onRequest(context) {
            var title = " onRequest() ";
            var params = context.request.parameters;
            var recId = params.id;
            log.debug(title + "Recid ->", recId);
            var response = context.response;
            var companyInformation = config.load({
                type: config.Type.COMPANY_INFORMATION
            });
            var companyname = companyInformation.getValue({
                fieldId: 'companyname'
            });
            var mainaddress_text = companyInformation.getValue({
                fieldId: 'mainaddress_text'
            });
            var oppObj = getOppData(recId);
            log.debug('oppObj', oppObj);
            try {
                var template = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">';
                template += "<pdfset>";
                //PDF 1
                template += "<pdf>";
                template += "<head>";
                template += '<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'
                template += '<macrolist>';
                template += '<macro id="nlheader">';
                template += '<table  width="100%" cellpadding="1" cellspacing="1"><tr>\
             <td colspan="2" width="50%" white-space="nowrap"><img src="https://4506264-sb2.app.netsuite.com/core/media/media.nl?id=50070&amp;c=4506264_SB2&amp;h=N0LenjHwVilLM4icb40SD96YxG3TcSivs2ivTlOnBPptRnt0" width="140%" height="140%"></img></td>\
             <td width="30%" color="#003876"><p style="width:60%;">'+companyname+'<br/> '+mainaddress_text+'</p></td>\
	         <td width="20%"> <p style="align:right; text-align:right; font-size:16px; font-weight:bold; color:#003876;">Opportunity<br/> #'+oppObj.tranId+'</p></td>\
             </tr>\
             </table>';
                template += '</macro>';
                template += '<macro id="nlfooter">';
                template += '<table style="width: 100%; font-size: 8pt;"><tr>\
                            <td style="padding: 0;"><barcode codetype="code128" showtext="true" value="'+oppObj.tranId+'"/></td>\
                            <td align="right" style="padding: 0;"><pagenumber/> of <totalpages/></td>\
                            </tr></table>';
                template += '</macro>';
                template += '</macrolist>';
                template += "</head>";
                template += "<body header='nlheader' header-height='14%' footer='nlfooter' footer-height='20pt' padding='0.5in 0.5in 0.5in 0.5in' size='Letter-LANDSCAPE'>";
                 template += '<table font-size="10px" width="100%"><tr>\
                 <td rowspan="5" width="25%"><b>Location Address:</b><br />'+oppObj.billaddress+'<br /><b>Correct Address?</b> <br />{{Int_es_:signer1:initials}}</td>\
                 <td width="15%"><b>Bill To:<br />Brand End Customer:<br />Campaign:</b></td>\
                 <td width="42%">'+oppObj.billTo+'<br />'+oppObj.custbody_ne_brand_end_customer+'<br />'+oppObj.custbody_campaign_name+'</td>\
                 <td width="1%">&nbsp;</td>\
                 <td width="15%"><b>Contact:<br />Client Partner:<br />Date Created:<br />Date Revised:<br /></b></td>\
                 <td width="20%">'+oppObj.custbody_contact_printout+'<br />'+oppObj.salesrep+'<br />'+formateDate(oppObj.trandate)+'<br />No Date<br /></td>\
                 </tr>\
               </table>'; 
                template += '<br /><table class="a" border="1" border-color="#003876" width="100%">\
                <thead>\
                 <tr>\
                   <th width="20%" background-color="#003876" font-size="10px" color="#FFFFFF"><b>ITEM NAME</b></th>\
                   <th width="20%" background-color="#003876" font-size="10px" color="#FFFFFF"><b>DETAILS</b></th>\
                   <th width="15%" background-color="#003876" font-size="10px" color="#FFFFFF"><b>GEO/LANG</b></th>\
                   <th width="15%"><p width="100%" background-color="#003876" align="center" text-align="center" font-size="10px" color="#FFFFFF"><b>START<br />DATE</b></p></th>\
                   <th  background-color="#003876"><p background-color="#003876" align="center" text-align="center" font-size="10px" color="#FFFFFF"><b>END<br />DATE</b></p></th>\
                   <th width="15%" background-color="#003876" align="center" font-size="10px" color="#FFFFFF"><b>QUANTITY</b></th>\
                   <th width="8%" background-color="#003876" align="center" font-size="10px" color="#FFFFFF"><b>RATE</b></th>\
                   <th width="8%" background-color="#003876" align="center" font-size="10px" color="#FFFFFF"><b>AMOUNT</b></th>\
                 </tr>\
               </thead>';
               var QuantityCount = 0;
               var total = (parseFloat(oppObj.subTotal) + parseFloat(oppObj.gst) + parseFloat(oppObj.pst)).toFixed(2);
               for(var i=0; i<oppObj.items.length; i++){
                var item = oppObj.items[i];
                template +='<tr>\
                      <td align="center" font-size="10px">'+ JSON.stringify(item.itemName).replace(/&/g,'&amp;') + '</td>\
                      <td align="center" font-size="10px">&nbsp;</td>\
                      <td align="center" font-size="10px">&nbsp;</td>\
                      <td align="center" font-size="10px">'+ item.flightStartDate + '</td>\
                      <td align="center" font-size="10px">'+ item.flightEndDate + '</td>\
                      <td align="center" font-size="10px">'+ item.quantity + '</td>\
                      <td align="center" font-size="10px">$'+ item.rate + '</td>\
                      <td align="center" font-size="10px">$'+ item.amount + '</td>\
                </tr>';
                QuantityCount+=parseInt(item.quantity);
               }
               template +='<tr border-top="1" border-top-color="#003876" width="100%">\
               <td><p align="left">\
                 <b font-size="12px">Quantity Total</b></p></td>\
               <td font-size="12px"><p align="center" text-align="left" width="100%" border-color="#003876" background-color="#003876" color="#FFFFFF">\
                 <b>'+QuantityCount+'</b></p></td>\
               <td> &nbsp;</td>\
               <td> &nbsp;</td>\
               <td> &nbsp;</td>\
               <td> &nbsp;</td>\
               <td font-size="12px"><p align="right">\
                 <b>SubTotal<br />GST/HST<br />PST<br />TOTAL<br /> <br /></b></p></td>\
               <td font-size="12px"><p align="right" text-align="right" width="100%" border-color="#003876" background-color="#003876" color="#FFFFFF">\
                 <b>$'+(oppObj.subTotal).toFixed(2)+'<br /> $'+(oppObj.gst).toFixed(2)+'<br /> $'+(oppObj.pst).toFixed(2)+'<br /> $'+total+'</b><br /><br /></p></td>\
             </tr>\
             <tr width="100%">\
               <td> &nbsp;</td>\
               <td> &nbsp;</td>\
               <td> &nbsp;</td>\
               <td> &nbsp;</td>\
               <td> &nbsp;</td>\
               <td> &nbsp;</td>\
               <td font-size="12px"><p align="right"><b>Currency</b></p></td>\
               <td font-size="12px"><p align="center" width="100%" background-color="#003876" color="#FFFFFF"><b>'+oppObj.currency+'</b></p></td>\
             </tr>';
                template += '</table>';
                template+='<br />\
                <table>\
                  <tr>\
                    <td border="1" border-color="#003876">In consideration of the mutual covenants, warranties and agreements contained in this Online Advertising Agreement, and for such other good and valuable consideration, the receipt and sufficiency of which is hereby acknowledged, the parties hereto  agree that this Online Advertising Agreement shall consist of this Term Sheet and the Standard Terms and Conditions attached hereto as Schedule "A" and any other written agreement between the parties attached as a schedule hereto and forming part of this Agreement.  In the event of discrepancy between this Term Sheet and any attached Schedule, the provisions of this Term Sheet shall prevail.</td>\
                    </tr></table>\
                    <br />\
                    <table cellpadding="1" cellspacing="1" width="100%"><tr>\
                        <td width="7%" font-size="20px" >Signature: </td>\
                        <td font-size="20px" >{{Sig_es_:signer1:signature}}</td>\
                        <td width="5%">&nbsp;</td>\
                        <td width="8%" font-size="20px" >Date:</td>\
                        <td font-size="20px" >{{Dte_es_:signer1:date}}</td>\
                        <td border-bottom="1" border-color="#003876">&nbsp;</td>\
                        </tr></table>';
                        template+='<table>\
                        <tr>\
                          <td border="1" border-color="#003876">\
                      <p style="align:left; text-align:left; font-size:10px; font-weight:bold;">SCHEDULE "A" : PELMOREX CORP TERMS AND CONDITIONS</p>\
                      <p style="align:left; text-align:left; font-size:8px;">These Standard Terms and Conditions form part of the Online Advertising Agreement (the “Agreement”) effective on the date the Agreement is signed.  All terms not defined in these Standard Terms and Conditions shall have the meaning given to them in the Online Advertising Contract Term Sheet (the "Term Sheet") to which these Standard Terms and Conditions are annexed.  In the event of an inconsistency between the Term Sheet and the Standard Terms and Conditions or any of the schedules annexed hereto, the provisions of the Term Sheet shall govern.</p>\
                      <p style="align:left; text-align:left; font-size:8px;">CONTRACT and TERMINATION: The Agreement will continue until the end date of the Campaign Period. Advertiser reserves the right to terminate this Contract (excluding Sponsorships) upon 10 business days prior written notice to Pelmorex. Advertiser will be responsible for payment due for the balance of the 10 business day period and in the event of a cancellation, short rates apply, and for any production charges incurred by Pelmorex up to and including the date of early termination Effective start date is impacted by creative deadline as outlined in "Creative Submission" below.</p>\
                      <p style="align:left; text-align:left; font-size:8px;">CREATIVE SUBMISSION:   All creative must be received in advance of publication date according to the following schedule:</p>\
                      <p style="align:left; text-align:left; font-size:8px;">* Standard animated gifs and text links with URLs - 3 business days prior to publication date; rich media - 5 business days prior to publication date.</p>\
                      <p style="align:left; text-align:left; font-size:8px;">* Any creative change order must be made in writing and acknowledged by Pelmorex .  Such change orders must be received by Pelmorex at least 3 business days in advance of the requested change date. Change orders cannot be submitted any more frequently than once a week.  All advertisement specifications governing the content of the creative will be provided by Pelmorex. Pelmorex reserves the right to change such specifications at any time.  </p>\
                      <p style="align:left; text-align:left; font-size:8px;">* Any creative received after the aforementioned deadlines is considered late. All Creative Submissions are subject to IAB Canada"s Late Creative Policy found on the IAB Canada website in their Standard Terms and Conditions. </p>\
                      <p style="align:left; text-align:left; font-size:8px;">BILLING:  Advertiser will be billed for contracted amount on a monthly pro rated basis beginning the month following the start date of the campaign with the following conditions:</p>\
                      <p style="align:left; text-align:right; font-size:8px;">* Amounts invoiced are in Canadian funds and may be inclusive or exclusive of Agency’s commission.</p>\
                      <p style="align:left; text-align:left; font-size:8px;">* Amounts invoiced are payable upon receipt of invoice.  Interest and penalty charges of 1-3/4% per month (21% per annum) on amounts outstanding more than 30 days from the date of invoice will be applied to past due amounts.</p>\
                      <p style="align:left; text-align:left; font-size:8px;">DELIVERY, FREQUENCY and MAKE GOOD: The parties agree that Pelmorex’s records of the number of impressions shall govern the terms of this Agreement.  If Pelmorex fails to deliver contracted number of impressions, Pelmorex will make good the short fall by providing Advertiser with additional impressions (where possible).  If Advertiser uses a 3rd party ad serving system, campaign impression goal will be measured against Pelmorex’s report.  Any discrepancy on an Owned and Operated property between 3rd party reports and Pelmorex reports in excess of 10%, will result in make good impressions provided by Pelmorex to ensure that the final discrepancy does not exceed 10%.</p>\
                      <p style="align:left; text-align:left; font-size:8px;">PELMOREX OWNED and OPERATED PRODUCTS REDESIGN:   Advertiser acknowledges that, consistent with Pelmorex’s need for editorial discretion, Pelmorex may redesign, delete or replace the pages on which the impressions will be displayed or may redesign or replace the type of links, buttons, and banners purchased by the Advertiser, provided that  Pelmorex will use good faith efforts to provide the Advertiser with comparable links and banners on any redesigned or replacement pages.</p>\
                      <p style="align:left; text-align:left; font-size:8px;">APPROVALS and RESTRICTIONS:   Pelmorex reserves the right, without liability, to reject, omit, or exclude any advertisement or to reject or terminate any links for any reason at any time, with or without notice to the Advertiser, and whether or not such advertisement or link was previously acknowledged, accepted, or published.  Pelmorex does not accept advertising of an adult or pornographic nature, gambling or tobacco related.</p>\
                      <p style="align:left; text-align:right; font-size:8px;">LICENSES and INDEMNIFICATION:   Advertiser represents and warrants that it owns all right, title and interest in and to the copyright and trademarks and other intellectual property rights (Intellectual Property Rights) included in the creative, or has acquired the necessary consents or licenses for the inclusion of the Intellectual Property Rights in the creative, to allow Pelmorex to exhibit, display, reproduce, or publish the creative in the advertisements on its services as contemplated in this Agreement and the Advertiser shall indemnify and save harmless Pelmorex from any damages or losses arising from any claims by third parties for breach of such representation and warranties.</p>\
                      <p style="align:left; text-align:left; font-size:8px;">LIMITATION of LIABILITY:    Pelmorex’s liability for damages arising from any errors, omissions, delays in delivery, non-delivery or any other damages, losses or claims of any kind caused by any matter or thing under the control of Pelmorex, shall be limited to the consideration paid under this Agreement. Pelmorex shall not be liable for any losses, damages or claims arising from or caused by any matter or thing out of the control of Pelmorex, including force majeure, and in no event shall Pelmorex be liable for consequential damages or lost profits.</p>\
                      <p style="align:left; text-align:left; font-size:8px;">CHOICE of LAW and FORUM:  This Agreement shall be governed by the laws of the Province of Ontario.</p>\
                      <p style="align:left; text-align:left; font-size:8px;">AGENCY:  In the event that Advertiser authorizes a third party Agency, the Advertiser and the Agency shall be jointly and severally liable for any breach of the terms herein.  If undisputed sums remain unpaid at the expiration of forty-five (45) days from the date the invoice was rendered to the Agency, Pelmorex reserves the right upon ten (10) days written notice to Agency to hold the Advertiser liable for payment of the sum due.</p>\
                      <p style="align:left; text-align:left; font-size:8px;">MISCELLANEOUS: The parties acknowledge and agree that the terms herein are confidential in nature and shall not be disclosed to any third party.   This Agreement may not be assigned or transferred without the prior written consent of the other party.  If any provision of this Agreement is adjudged to be unenforceable under law, the remaining terms and conditions shall survive in full force and effect.  The parties acknowledge and agree that this Agreement supersedes any previous agreements between the Advertiser and Pelmorex.  No modifications or deletions of this Agreement shall be effective or binding on the parties unless in writing and executed by an authorized representative of  Pelmorex.</p>\
                      <p style="align:left; text-align:left; font-size:8px;">The parties to this Agreement have agreed to draft and execute this Agreement in English / Les parties ont convenu que le présent accord soit rédigé en anglais.</p>\
                      </td>\
                          </tr></table>';
                template += "</body>";
                template += "</pdf>";
                template += "</pdfset>";
                //Using "N/render" Module to Generate PDF
                var pdfFile = render.xmlToPdf({
                    xmlString: template
                });
                response.writeFile(pdfFile, true);

            } catch (e) {
                log.error("Error in " + title, e);
            }
        }
        function formateDate(trandate) {
            var date = new Date(trandate);
            var day = date.getDay();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var formateDate = month + '/' + day + '/' + year;
            return formateDate;
        }
        function getOppData(recId){
            var resultsData = {
                items : []
            };
            var title = 'getOppData(::)';
            try{
                var opportunityOBJ = record.load({
                    type: 'opportunity',
                    id: parseInt(recId)
                });
                resultsData.tranId = opportunityOBJ.getValue({
                    fieldId: 'tranid'
                });
                resultsData.billaddress = opportunityOBJ.getValue({
                    fieldId: 'billaddress'
                });
                resultsData.custbody_ne_brand_end_customer = opportunityOBJ.getText({
                    fieldId: 'custbody_ne_brand_end_customer'
                });
                resultsData.billTo = opportunityOBJ.getText({
                    fieldId: 'entity'
                });
                resultsData.custbody_campaign_name = opportunityOBJ.getValue({
                    fieldId: 'custbody_campaign_name'
                });
                resultsData.custbody_contact_printout = opportunityOBJ.getText({
                    fieldId: 'custbody_contact_printout'
                });
                resultsData.salesrep = opportunityOBJ.getText({
                    fieldId: 'salesrep'
                });
                resultsData.trandate = opportunityOBJ.getValue({
                    fieldId: 'trandate'
                });
                resultsData.currency = opportunityOBJ.getText({
                    fieldId: 'currency'
                });
                resultsData.subTotal = opportunityOBJ.getValue({
                    fieldId: 'projectedtotal'
                });
                resultsData.gst = opportunityOBJ.getValue({
                    fieldId: 'taxtotal'
                });
                resultsData.pst = opportunityOBJ.getValue({
                    fieldId: 'tax2total'
                });
                var searchResultsLineLevel = searchResult(recId);
                resultsData.items = searchResultsLineLevel;
            } catch(e) {
                log.debug('Exception ' +title, e.message);
            }
            return resultsData || {};
        }
        function searchResult(id){
            var title = 'searchResult(::)';
            var obj;
            var oppArray = [];
            try{
                var transactionSearchObj = search.create({
                    type: "transaction",
                    filters:
                    [
                       ["type","anyof","Opprtnty"], 
                       "AND", 
                       ["internalid","anyof",id], 
                       "AND", 
                       ["shipping","is","F"], 
                       "AND", 
                       ["taxline","is","F"], 
                       "AND", 
                       ["item.displayname","isnotempty",""]
                    ],
                    columns:
                    [
                       search.createColumn({
                          name: "itemid",
                          join: "item",
                          label: "Name"
                       }),
                       search.createColumn({name: "quantity", label: "Quantity"}),
                       search.createColumn({name: "custcol_agency_mf_flight_start_date", label: "Flight Start Date"}),
                       search.createColumn({name: "custcol_agency_mf_flight_end_date", label: "Flight End Date"}),
                       search.createColumn({name: "amount", label: "Amount"}),
                       search.createColumn({name: "rate", label: "Item Rate"})
                    ]
                 });
                 transactionSearchObj.run().each(function(result){
                    obj = {};
                    obj.itemName = result.getValue({name:'itemid',join: 'item'});
                    obj.quantity = result.getValue({name:'quantity'});
                    obj.flightStartDate = result.getValue({name:'custcol_agency_mf_flight_start_date'});
                    obj.flightEndDate = result.getValue({name:'custcol_agency_mf_flight_end_date'});
                    obj.amount = result.getValue({name:'amount'});
                    obj.rate = result.getValue({name:'rate'});
                    oppArray.push(obj);
                    return true;
                 });
            } catch(e) {
                log.debug('Exception ' +title, e.message);
            }
            return oppArray || [];
        }
        return {
            onRequest: onRequest
        };
    });