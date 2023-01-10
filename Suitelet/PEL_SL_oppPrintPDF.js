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
             <td width="30%" color="#003876"><p style="width:60%;">'+ companyname + '<br/> ' + mainaddress_text + '</p></td>\
	         <td width="20%"> <p style="align:right; text-align:right; font-size:16px; font-weight:bold; color:#003876;">Opportunity<br/> #'+ oppObj.tranId + '</p></td>\
             </tr>\
             </table>';
                template += '</macro>';
                template += '<macro id="nlfooter">';
                template += '<table style="width: 100%; font-size: 8pt;"><tr>\
                            <td style="padding: 0;"><barcode codetype="code128" showtext="true" value="'+ oppObj.tranId + '"/></td>\
                            <td align="right" style="padding: 0;"><pagenumber/> of <totalpages/></td>\
                            </tr></table>';
                template += '</macro>';
                template += '</macrolist>';
                template += "</head>";
                template += "<body header='nlheader' header-height='14%' footer='nlfooter' footer-height='20pt' padding='0.5in 0.5in 0.5in 0.5in' size='Letter-LANDSCAPE'>";
                template += '<table font-size="10px" width="100%"><tr>';
                //  <td rowspan="5" width="25%"><b>Location Address:</b><br />'+ oppObj.billaddress + '</td>\
                 template += '<td width="15%"><b>Bill To:<br />Brand End Customer:<br />Campaign:</b></td>\
                 <td width="42%">'+ oppObj.billTo + '<br />' + oppObj.custbody_ne_brand_end_customer + '<br />' + oppObj.custbody_campaign_name + '</td>\
                 <td width="1%">&nbsp;</td>\
                 <td width="15%"><b>Contact:<br />Client Partner:<br />Date Created:</b></td>\
                 <td width="20%">'+ oppObj.custbody_contact_printout + '<br />' + oppObj.salesrep + '<br />' + formateDate(oppObj.trandate) + '</td>\
                 </tr>\
               </table>';
                template += '<br /><table class="a" border="1" border-color="#003876" width="100%">\
                <thead>\
                 <tr>\
                   <th width="20%" background-color="#003876" font-size="10px" color="#FFFFFF" align="center"><b>ITEM</b></th>\
                   <th width="20%" background-color="#003876" font-size="10px" color="#FFFFFF" align="center"><b>ITEM DISPLAY NAME</b></th>\
                   <th width="15%" background-color="#003876" font-size="10px" color="#FFFFFF" align="center"><b>GEO/LANG</b></th>\
                   <th width="15%"><p width="100%" background-color="#003876" align="center" text-align="center" font-size="10px" color="#FFFFFF"><b>START<br />DATE</b></p></th>\
                   <th  background-color="#003876"><p background-color="#003876" align="center" text-align="center" font-size="10px" color="#FFFFFF"><b>END<br />DATE</b></p></th>\
                   <th width="15%" background-color="#003876" align="center" font-size="10px" color="#FFFFFF"><b>QUANTITY</b></th>\
                   <th width="8%" background-color="#003876" align="center" font-size="10px" color="#FFFFFF"><b>RATE</b></th>\
                   <th width="8%" background-color="#003876" align="center" font-size="10px" color="#FFFFFF"><b>AMOUNT</b></th>\
                 </tr>\
               </thead>';
                var QuantityCount = 0;
                var PST = 0;
                if (!!oppObj.pst) {
                    PST = oppObj.pst;
                }
                var total = (parseFloat(oppObj.subTotal) + parseFloat(oppObj.gst) + parseFloat(PST)).toFixed(2);
                //    var total = parseFloat(oppObj.subTotal) + parseFloat(oppObj.gst) + parseFloat(oppObj.pst);
                for (var i = 0; i < oppObj.items.length; i++) {
                    var item = oppObj.items[i];
                    template += '<tr>\
                      <td align="center" font-size="10px">'+ JSON.stringify(item.itemName).replace(/&/g, '&amp;') + '</td>\
                      <td align="center" font-size="10px">'+ item.itemDisplayName + '</td>\
                      <td align="center" font-size="10px">&nbsp;</td>\
                      <td align="center" font-size="10px">'+ item.flightStartDate + '</td>\
                      <td align="center" font-size="10px">'+ item.flightEndDate + '</td>\
                      <td align="center" font-size="10px">'+ item.quantity + '</td>\
                      <td align="center" font-size="10px">$'+ item.rate + '</td>\
                      <td align="center" font-size="10px">$'+ item.amount + '</td>\
                </tr>';
                    QuantityCount += parseInt(item.quantity);
                }
                
                template += '<tr border-top="1" border-top-color="#003876" width="100%">\
               <td><p align="left">\
                 <b font-size="12px">Quantity Total</b></p></td>\
               <td font-size="12px"><p align="center" text-align="left" width="100%" border-color="#003876" background-color="#003876" color="#FFFFFF">\
                 <b>'+ QuantityCount + '</b></p></td>\
               <td> &nbsp;</td>\
               <td> &nbsp;</td>\
               <td> &nbsp;</td>\
               <td> &nbsp;</td>\
               <td font-size="12px"><p align="right">\
                 <b>SubTotal<br />GST/HST<br />PST<br />TOTAL<br /> <br /></b></p></td>\
               <td font-size="12px"><p align="right" text-align="right" width="100%" border-color="#003876" background-color="#003876" color="#FFFFFF">';
                //  <b>$'+(oppObj.subTotal).toFixed(2)+'<br /> $'+(oppObj.gst).toFixed(2)+'<br /> $'+(oppObj.pst).toFixed(2)+'<br /> $'+total+'</b><br /><br /></p></td>\
                template += '<b>$' + oppObj.subTotal + '<br /> $' + (oppObj.gst).toFixed(2) + '<br /> $' + (PST).toFixed(2) + '<br /> $' + total + '</b><br /><br /></p></td>';
                template += '</tr>';
                template += '<tr width="100%">\
               <td> &nbsp;</td>\
               <td> &nbsp;</td>\
               <td> &nbsp;</td>\
               <td> &nbsp;</td>\
               <td> &nbsp;</td>\
               <td> &nbsp;</td>\
               <td font-size="12px"><p align="right"><b>Currency</b></p></td>\
               <td font-size="12px"><p align="center" width="100%" background-color="#003876" color="#FFFFFF"><b>'+ oppObj.currency + '</b></p></td>\
             </tr>';
                template += '</table>';

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
        function getOppData(recId) {
            var resultsData = {
                items: []
            };
            var title = 'getOppData(::)';
            try {
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
                    fieldId: 'item_total'
                });
                resultsData.gst = opportunityOBJ.getValue({
                    fieldId: 'taxtotal'
                });
                resultsData.pst = opportunityOBJ.getValue({
                    fieldId: 'tax2total'
                });
                var searchResultsLineLevel = searchResult(recId);
                resultsData.items = searchResultsLineLevel;
            } catch (e) {
                log.debug('Exception ' + title, e.message);
            }
            return resultsData || {};
        }
        function searchResult(id) {
            var title = 'searchResult(::)';
            var obj;
            var oppArray = [];
            try {
                var transactionSearchObj = search.create({
                    type: "transaction",
                    filters:
                        [
                            ["type", "anyof", "Opprtnty"],
                            "AND",
                            ["internalid", "anyof", id],
                            "AND",
                            ["shipping", "is", "F"],
                            "AND",
                            ["taxline", "is", "F"],
                            "AND",
                            ["item.displayname", "isnotempty", ""]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "itemid",
                                join: "item",
                                label: "Name"
                            }),
                            search.createColumn({
                                name: "displayname",
                                join: "item",
                                label: "Display Name"
                            }),
                            search.createColumn({ name: "quantity", label: "Quantity" }),
                            search.createColumn({ name: "custcol_agency_mf_flight_start_date", label: "Flight Start Date" }),
                            search.createColumn({ name: "custcol_agency_mf_flight_end_date", label: "Flight End Date" }),
                            search.createColumn({ name: "amount", label: "Amount" }),
                            search.createColumn({ name: "rate", label: "Item Rate" }),
                            search.createColumn({name: "custcol_inputrate", label: "InputRate"})
                        ]
                });
                transactionSearchObj.run().each(function (result) {
                    obj = {};
                    obj.itemName = result.getValue({ name: 'itemid', join: 'item' });
                    obj.itemDisplayName = result.getValue({ name: 'displayname', join: 'item' });
                    obj.quantity = result.getValue({ name: 'quantity' });
                    obj.flightStartDate = result.getValue({ name: 'custcol_agency_mf_flight_start_date' });
                    obj.flightEndDate = result.getValue({ name: 'custcol_agency_mf_flight_end_date' });
                    obj.amount = result.getValue({ name: 'amount' });
                    obj.rate = result.getValue({ name: 'custcol_inputrate' });
                    oppArray.push(obj);
                    return true;
                });
            } catch (e) {
                log.debug('Exception ' + title, e.message);
            }
            return oppArray || [];
        }
        return {
            onRequest: onRequest
        };
    });